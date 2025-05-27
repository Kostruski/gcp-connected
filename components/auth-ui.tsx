'use client';

import { useEffect } from 'react';
import { startSignInUi } from '../lib/firebase/start-sign-in-ui';
import { getFirebaseAppClientSide } from '../lib/firebase/get-firebase-app-client-side';

const AuthUi = () => {
  const { authInstance } = getFirebaseAppClientSide();

  useEffect(() => {
    if (!authInstance) return;
    const startUi = async () => await startSignInUi();

    startUi();
  }, [authInstance]);

  return null;
};

export default AuthUi;
