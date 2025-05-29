// lib/firebase/start-sign-in-ui.ts

import { Auth, sendEmailVerification, signOut } from 'firebase/auth';
// No need to import getFirebaseAppClientSide if you're relying purely on global window.firebase for UI
// import { getFirebaseAppClientSide } from './get-firebase-app-client-side';
import Cookies from 'js-cookie';
import { emailAuthProviderId } from './firebaseConfig';

// Define the global types for window.firebase and window.firebaseui
declare global {
  interface Window {
    firebase: any; // Using 'any' for global firebase due to compat layer and unknown exact structure
    firebaseui: {
      auth: {
        AuthUI: any;
      };
    };
  }
}

class FirebaseUiManager {
  private static instance: FirebaseUiManager;
  private ui: any; // Using 'any' for firebaseui.auth.AuthUI

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private constructor(auth: Auth) {
    // The UI instance will be created in the async init method
  }

  public static getInstance(): FirebaseUiManager {
    if (!FirebaseUiManager.instance) {
      throw new Error('FirebaseUiManager must be initialized asynchronously.');
    }
    return FirebaseUiManager.instance;
  }

  // New async initialization method
  public static async initialize(): Promise<FirebaseUiManager> {
    if (FirebaseUiManager.instance) {
      return FirebaseUiManager.instance;
    }

    // Wait for window.firebase and window.firebaseui to be defined.
    // Given 'beforeInteractive' strategy, they should be available quickly.
    // We can use a Promise to poll, but a simple check is often enough in practice
    // if the scripts are truly before the main app bundle.
    await new Promise<void>((resolve) => {
      const checkGlobals = setInterval(() => {
        if (
          typeof window.firebase !== 'undefined' &&
          typeof window.firebase.auth !== 'undefined' &&
          typeof window.firebaseui !== 'undefined' &&
          typeof window.firebaseui.auth !== 'undefined' &&
          typeof window.firebaseui.auth.AuthUI !== 'undefined'
        ) {
          clearInterval(checkGlobals);
          resolve();
        }
      }, 50); // Check every 50ms
    });

    // Get the Firebase Auth instance from the globally initialized firebase object
    const auth: Auth = window.firebase.auth();

    FirebaseUiManager.instance = new FirebaseUiManager(auth);
    // Instantiate FirebaseUI with the global Firebase Auth instance
    FirebaseUiManager.instance.ui =
      window.firebaseui.auth.AuthUI.getInstance() ||
      new window.firebaseui.auth.AuthUI(auth);
    return FirebaseUiManager.instance;
  }

  public getFirebaseAuth(): Auth {
    return window.firebase.auth();
  }

  public start(elementId: string): void {
    if (!this.ui) {
      throw new Error(
        'FirebaseUI has not been initialized. Call FirebaseUiManager.initialize() first.',
      );
    }

    this.ui.start(elementId, {
      signInOptions: [emailAuthProviderId],
      signInSuccessUrl: '/',
      callbacks: {
        signInSuccessWithAuthResult: (authResult: any) => {
          if (authResult?.user?.multiFactor?.user?.accessToken) {
            Cookies.set(
              '__session',
              authResult.user.multiFactor.user.accessToken,
            );

            if (authResult.additionalUserInfo.isNewUser) {
              sendEmailVerification(authResult.user);
            }

            return true;
          }
          return false;
        },
        signInFailure: (error: any) => {
          console.error('Sign-in error:', error);
          return false;
        },
      },
    });
  }
}

export const startSignInUi = async () => {
  const firebaseUiManager = await FirebaseUiManager.initialize();
  firebaseUiManager.start('#firebaseui-auth-container');
};

export const getFirebaseAppClientSide = async () => {
  const firebaseUiManager = await FirebaseUiManager.initialize();

  return firebaseUiManager.getFirebaseAuth();
};

export const signOutUser = async () => {
  const firebaseAuth = await getFirebaseAppClientSide();

  try {
    return await signOut(firebaseAuth);
  } catch (error) {
    console.error('Sign-out error:', error);
    throw error;
  }
};
