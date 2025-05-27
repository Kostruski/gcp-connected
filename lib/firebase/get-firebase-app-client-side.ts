import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { Auth, getAuth, signOut, EmailAuthProvider } from 'firebase/auth';
import { FirebaseApp } from 'firebase/app';
import { firebaseConfig } from './firebaseConfig';

let app: FirebaseApp;
let authInstance: Auth;

export const getFirebaseAppClientSide = () => {
  if (!app) {
    // Initialize Firebase using the compat API.  This is CRITICAL for the global 'firebase' object.
    app = firebase.initializeApp(firebaseConfig);
    authInstance = getAuth(app);
  }

  return { app, authInstance };
};

export async function signOutUser() {
  const { authInstance: firebaseAuth } = getFirebaseAppClientSide();
  try {
    return await signOut(firebaseAuth);
  } catch (error) {
    console.error('Sign-out error:', error);
    throw error;
  }
}

export const emailAuthProviderId = EmailAuthProvider.PROVIDER_ID;
