import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import admin from 'firebase-admin';
export const isProduction = process.env.NODE_ENV === 'production';

const client = new SecretManagerServiceClient();

const getFirebaseAppServerSide = async () => {
  // Initialize Firebase Admin SDK ONLY ONCE at the top level of your api route
  let firebaseApp: admin.app.App | null = null;
  let auth: admin.auth.Auth | null = null;
  let db: admin.firestore.Firestore | null = null;

  try {
    let serviceAccount = '';

    if (isProduction) {
      const [version] = await client.accessSecretVersion({
        name: 'firebase-service-account-key',
      });

      if (!version.payload?.data) {
        throw new Error('Secret version payload is empty.');
      }

      serviceAccount = JSON.parse(version.payload.data.toString());
    } else {
      if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT is not defined.');
      }

      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT ?? '{}');
    }

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

export default getFirebaseAppServerSide;
