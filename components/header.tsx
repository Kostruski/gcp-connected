'use client';

import { Button, Col, Navbar, Stack } from 'react-bootstrap';
import { onAuthStateChanged } from 'firebase/auth';
import Cookies from 'js-cookie';
import { useEffect, useMemo } from 'react'; // No need for useMemo here for the effect
import dynamic from 'next/dynamic';
import useStore from '../store/store';
import { useShallow } from 'zustand/react/shallow';
import {
  getFirebaseAppClientSide,
  signOutUser,
} from '../lib/firebase/get-firebase-app-client-side';
import { createStars, updateStarAppearance } from './render-stars';
import Link from 'next/dist/client/link';
import _ from 'lodash';

const { authInstance: firebaseAuth } = getFirebaseAppClientSide();

const HeaderComponent = () => {
  const { currentUser, setCurrentUser } = useStore(
    useShallow((state) => ({
      currentUser: state.currentUser,
      setCurrentUser: state.setCurrentUser,
    })),
  );

  const debounceCreateStars = useMemo(() => {
    return _.debounce(() => {
      createStars();
    }, 500);
  }, []);

  useEffect(() => {
    if (!firebaseAuth) {
      console.warn('Firebase Auth instance not available in useEffect.');
      return;
    }

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (authUser) => {
      try {
        if (authUser) {
          console.log('User is signed in:', authUser);
          setCurrentUser(authUser);
        } else {
          Cookies.remove('__session');
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Firebase Auth state change callback error:', error);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [setCurrentUser]);

  useEffect(() => {
    debounceCreateStars();
    document.addEventListener('mousemove', updateStarAppearance);
    window.addEventListener('resize', debounceCreateStars);

    return () => {
      document.removeEventListener('mousemove', updateStarAppearance);
      window.removeEventListener('resize', debounceCreateStars);
    };
  }, []);

  return (
    <Navbar sticky="top" className="p-4">
      <Col xs={8}>
        <Link href="/">
          <h2>Intuitius</h2>
        </Link>
      </Col>
      <Col xs={4}>
        <Stack direction="horizontal" gap={3}>
          <div className="p-2">
            {currentUser ? (
              currentUser.emailVerified ? (
                `Welcome ${currentUser.displayName || currentUser.email}`
              ) : (
                'Please verify your email'
              )
            ) : (
              <Link href="/login">
                <Button>Login</Button>
              </Link>
            )}
          </div>
          <div className="p-2">
            {currentUser && (
              <Button
                onClick={async () => {
                  try {
                    await signOutUser();
                    window.location.reload();
                  } catch (error) {
                    console.error('Error signing out:', error);
                  }
                }}
              >
                Logout
              </Button>
            )}
          </div>
        </Stack>
      </Col>
    </Navbar>
  );
};

const Header = dynamic(() => Promise.resolve(HeaderComponent), {
  ssr: false,
});

export default Header;
