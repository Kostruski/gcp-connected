import {
  emailAuthProviderId,
  getFirebaseAppClientSide,
} from './get-firebase-app-client-side';
import Cookies from 'js-cookie';

class FirebaseUiManager {
  private static instance: FirebaseUiManager;
  private ui: any; // Using 'any' for firebaseui.auth.AuthUI due to dynamic import

  private constructor() {
    const { authInstance: auth } = getFirebaseAppClientSide();
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const firebaseui = require('firebaseui');
    this.ui = new firebaseui.auth.AuthUI(auth);
  }

  public static getInstance(): FirebaseUiManager {
    if (!FirebaseUiManager.instance) {
      FirebaseUiManager.instance = new FirebaseUiManager();
    }
    return FirebaseUiManager.instance;
  }

  public start(elementId: string): void {
    this.ui.start(elementId, {
      signInOptions: [emailAuthProviderId],
      signInSuccessUrl: '/',
      callbacks: {
        signInSuccessWithAuthResult: (authResult: any) => {
          if (authResult.user.accessToken) {
            Cookies.set('__session', authResult.user.accessToken);

            return true;
          }
        },
        signInFailure: (error: any) => {
          console.error('Sign-in error:', error);
          return false;
        },
      },
    });
  }
}

// Export only the start method from the singleton instance
export const startSignInUi = () => {
  FirebaseUiManager.getInstance().start('#firebaseui-auth-container');
};
