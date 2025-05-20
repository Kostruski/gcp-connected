// firebase.ts
import { FirebaseApp, initializeApp } from 'firebase/app';
import {
  Auth,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  EmailAuthProvider,
  sendEmailVerification,
} from 'firebase/auth';
import Cookies from 'js-cookie';

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

onAuthStateChanged(firebaseAuth, async (user) => {
  try {
    if (user) {
      const idToken = await user.getIdToken(); // Get fresh token
      Cookies.set('__session', idToken);


      if(!user.emailVerified) {
        sendEmailVerification(user);
      }
    } else {
      Cookies.remove("__session");
    }

    window.location.reload();
  } catch (error) {
    console.error('Auth state change error:', error);
    console.log('Logout user');
  }
});

export async function signOutUser() {
  try {
    await signOut(firebaseAuth);
  } catch (error) {
    console.error('Sign-out error:', error);
    // Handle sign-out error
  }
}

export async function createUserWithEmailAndPasswordFunc({
  email,
  password,
}: {
  email: string;
  password: string;
  userName?: string;
  companyName?: string;
  role?: 'user' | 'manager';
}) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      firebaseAuth,
      email,
      password,
    );
    const user = userCredential.user;
    console.log('User created:', user);
    const idToken = await user.getIdToken();

    console.log('User ID Token:', idToken);
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function signInWithEmailAndPasswordFunc(
  email: string,
  password: string,
) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      firebaseAuth,
      email,
      password,
    );
    const user = userCredential.user;
    console.log('Signed in with email:', user);
    const idToken = await user.getIdToken();
    console.log('User ID Token:', idToken);
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
}

export async function sendPasswordResetEmailFunc(email: string) {
  try {
    await sendPasswordResetEmail(firebaseAuth, email);
    console.log('Password reset email sent successfully!');
    // Optionally, redirect the user or display a success message.
    return true; // Indicate success
  } catch (error) {
    console.error('Error sending password reset email:', error);
    // Handle errors appropriately (e.g., display an error message)
    return false; // Indicate failure
  }
}

export const emailAuthProviderId = EmailAuthProvider.PROVIDER_ID;
