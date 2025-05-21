'use client';

import { useEffect } from 'react';
import { startSignInUi } from '../app/lib/firebase/start-sign-in-ui';

const AuthUi = () => {
  useEffect(() => {
    startSignInUi();
  }, []);

  return null;
};

export default AuthUi;
