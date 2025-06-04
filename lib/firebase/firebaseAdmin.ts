// lib/firebaseAdmin.ts
import admin from 'firebase-admin';
import { cookies } from 'next/headers';

// Ensure this is only initialized once globally
let _firebaseApp: admin.app.App | null = null;
let _auth: admin.auth.Auth | null = null;
let _db: admin.firestore.Firestore | null = null;

const initializeFirebaseAdmin = () => {
  // Check if the default app already exists
  if (admin.apps.length > 0) {
    _firebaseApp = admin.app(); // Get the default app
    _auth = admin.auth(_firebaseApp);
    _db = admin.firestore(_firebaseApp);
    // console.log('Firebase Admin SDK already initialized. Using existing app.'); // Optional: for debugging
    return; // Exit if already initialized
  }

  // If no app exists, then initialize
  try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccountJson) {
      throw new Error(
        'FIREBASE_SERVICE_ACCOUNT environment variable is not set.',
      );
    }
    const serviceAccount = JSON.parse(serviceAccountJson);

    _firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    _auth = admin.auth(_firebaseApp);
    _db = admin.firestore(_firebaseApp);
    console.log('Firebase Admin SDK initialized.');
  } catch (error: any) {
    // Check if the error is due to the app already existing (as a fallback, though admin.apps.length should catch it)
    if (error.code === 'app/duplicate-app') {
      _firebaseApp = admin.app(); // Get the default app
      _auth = admin.auth(_firebaseApp);
      _db = admin.firestore(_firebaseApp);
      // console.log('Firebase Admin SDK already initialized (caught by error). Using existing app.'); // Optional
    } else {
      console.error(
        'Firebase Admin SDK initialization error:',
        error?.message ?? error,
      );
      // To avoid breaking the app if initialization fails critically elsewhere,
      // you might reconsider throwing an error here if the SDK instances are essential
      // and cannot be null. For now, we let the _firebaseApp remain null if it's a new error.
      // If you throw, ensure the rest of the app can handle _auth or _db being potentially null
      // or not exported correctly.
      // throw new Error('Failed to initialize Firebase Admin SDK.');
    }
  }
};

// Initialize on module load
initializeFirebaseAdmin();

// Export the initialized instances
// It's crucial that _auth and _db are assigned before export.
// If initializeFirebaseAdmin() encounters an unrecoverable error (not duplicate app),
// _auth and _db might be null. Consider how your app should behave.
// The '!' non-null assertion operator assumes they will be non-null.
// If there's a chance they could be null due to an initialization error
// (other than duplicate app), you might need to handle that at the usage sites.

export const auth = _auth!;
export const db = _db!;

/**
 * Verifies the Firebase session cookie.
 * @returns {Promise<admin.auth.DecodedIdToken | null>} The decoded ID token if valid, otherwise null.
 */
export const verifyToken =
  async (): Promise<admin.auth.DecodedIdToken | null> => {
    // Ensure auth is initialized before trying to use it
    if (!auth) {
      console.error(
        'Auth service is not initialized. Call initializeFirebaseAdmin first or check for errors.',
      );
      // Potentially re-attempt initialization or throw a more specific error
      // For now, returning null as per original logic for token issues
      return null;
    }
    const sessionCookie = (await cookies()).get('__session')?.value;

    if (!sessionCookie) {
      console.log('No session cookie found.');
      return null; // Indicate no token found
    }

    try {
      const decodedToken = await auth.verifyIdToken(sessionCookie);
      console.log('ID token successfully verified for user:', decodedToken.uid);
      return decodedToken; // Return the decoded token
    } catch (error: any) {
      console.error('Error verifying ID token:', error);
      return null; // Indicate verification failure
    }
  };
