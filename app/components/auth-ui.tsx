'use client';

import { useEffect } from 'react';
import {
  getFirebaseAppClientSide,
  emailAuthProviderId,
} from '../lib/firebase/get-firebase-app-client-side';

const AuthUi = () => {
  const { authInstance: auth } = getFirebaseAppClientSide();

  useEffect(() => {
    if (!auth || !window) return;

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const firebaseui = require('firebaseui');

    console.log('AuthPage mounted');
    const ui = new firebaseui.auth.AuthUI(auth);

    ui.start('#firebaseui-auth-container', {
      signInOptions: [emailAuthProviderId],
    });

    return () => {
      ui.delete();
    };
  }, [auth]);

  return null;
};

export default AuthUi;
