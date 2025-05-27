import admin from 'firebase-admin';
import { cookies } from 'next/headers';
export const isProduction = process.env.NODE_ENV === 'production';

const getFirebaseAppServerSide = async () => {
  // Initialize Firebase Admin SDK ONLY ONCE at the top level of your api route
  let firebaseApp: admin.app.App | null = null;
  let auth: admin.auth.Auth | null = null;
  let db: admin.firestore.Firestore | null = null;

  try {
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT ?? '{}',
    );

    if (admin.apps.length === 0) {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else if (admin.apps[0]) {
      firebaseApp = admin.apps[0];
    }

    if (!firebaseApp) {
      throw new Error('Firebase app is not initialized.');
    }

    auth = admin.auth(firebaseApp);
    db = admin.firestore(firebaseApp);
  } catch (error: any) {
    console.error(
      'Firebase admin initialization error',
      error?.message ?? error,
    );
    throw error;
  }

  return { firebaseApp, auth: auth, db };
};

// Redirect needs to be in the page component
export const verifyToken = async (): Promise<boolean> => {
  const sessionCookie = (await cookies()).get('__session')?.value;
  const { auth } = await getFirebaseAppServerSide();

  if (!sessionCookie) {
    console.log('No session cookie found.');
    return false; // Indicate failure
  }

  try {
    // Await the verification, it returns a promise
    await auth.verifyIdToken(sessionCookie);
    console.log('ID token successfully verified.');
    return true; // Indicate success
  } catch (error: any) {
    console.error('Error verifying ID token:', error);
    return false; // Indicate failure
  }
};

export default getFirebaseAppServerSide;
