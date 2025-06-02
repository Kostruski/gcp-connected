import { redirect } from 'next/navigation';
import { verifyToken } from '../lib/firebase/get-firebase-app-server-side';

// add this at the top of each auth page.
const checkAuth = async () => {
  const tokenOk = await verifyToken();

  if (!tokenOk) {
    redirect('/logout');
  }
};

export default checkAuth;
