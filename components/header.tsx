'use client';

import { Button, Col, Container, Row } from 'react-bootstrap';
import Navbar from 'react-bootstrap/esm/Navbar';
import {
  getFirebaseAppClientSide,
  signOutUser,
} from '../app/lib/firebase/get-firebase-app-client-side';
import { onAuthStateChanged } from 'firebase/auth';
import Cookies from 'js-cookie';
import { useEffect } from 'react'; // No need for useMemo here for the effect
import Link from 'next/link';
import dynamic from 'next/dynamic';
import useStore from '../store/store';
import { useShallow } from 'zustand/react/shallow';

const { authInstance: firebaseAuth } = getFirebaseAppClientSide();

const HeaderComponent = () => {
  const { currentUser, setCurrentUser } = useStore(
    useShallow((state) => ({
      currentUser: state.currentUser,
      setCurrentUser: state.setCurrentUser,
    })),
  );

  useEffect(() => {
    if (!firebaseAuth) {
      console.warn('Firebase Auth instance not available in useEffect.');
      return;
    }

    console.log('Setting up onAuthStateChanged listener...');

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
      console.log('Unsubscribing from onAuthStateChanged listener.');
      unsubscribe();
    };
  }, [setCurrentUser]);

  return (
    <Navbar sticky="top">
      <Container>
        <Row>
          <Col>
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
          </Col>
          <Col>
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
          </Col>
        </Row>
      </Container>
    </Navbar>
  );
};

const Header = dynamic(() => Promise.resolve(HeaderComponent), {
  ssr: false,
});

export default Header;
