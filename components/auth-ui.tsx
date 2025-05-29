'use client';

import { useEffect } from 'react';
import { startSignInUi } from '../lib/firebase/firebase-client-side';

const AuthUi = () => {
  useEffect(() => {
    const startUi = async () => await startSignInUi();

    startUi();
  }, []);

  return null;
};

export default AuthUi;
