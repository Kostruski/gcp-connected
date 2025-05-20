// firebase.ts
import { FirebaseApp, initializeApp } from 'firebase/app';
import { Auth, getAuth, signOut, EmailAuthProvider } from 'firebase/auth';

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp; //Declare a variable to hold the app instance.
let authInstance: Auth; //Declare a variable to hold the auth instance.

export const getFirebaseAppClientSide = () => {
  if (!app) {
    app = initializeApp(firebaseConfig);
    authInstance = getAuth(app);
  }
  return { app, authInstance };
};

const { authInstance: firebaseAuth } = getFirebaseAppClientSide();

export async function signOutUser() {
  try {
    await signOut(firebaseAuth);
  } catch (error) {
    console.error('Sign-out error:', error);
    // Handle sign-out error
  }
}

export const emailAuthProviderId = EmailAuthProvider.PROVIDER_ID;
