import { redirect } from 'next/navigation';
import { verifyToken } from '../lib/firebase/firebaseAdmin';

// add this at the top of each auth page.
const checkAuth = async () => {
  const tokenOk = await verifyToken();

  if (!tokenOk) {
    redirect('/logout');
  }
};

export default checkAuth;
