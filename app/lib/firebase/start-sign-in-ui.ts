import {
  emailAuthProviderId,
  getFirebaseAppClientSide,
} from './get-firebase-app-client-side';

const { authInstance: auth } = getFirebaseAppClientSide();

const startSignInUi = () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const firebaseui = require('firebaseui');

  const ui = new firebaseui.auth.AuthUI(auth);

  ui.start('#firebaseui-auth-container', {
    signInOptions: [emailAuthProviderId],
    signInSuccessUrl: '/login',
    callbacks: {
      signInFailure: (error: any) => {
        console.error('Sign-in error:', error);
        return false;
      },
    },
  });
};

export default startSignInUi;
