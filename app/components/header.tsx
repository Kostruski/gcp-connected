'use client';

import { Button, Col, Container, Row } from 'react-bootstrap';
import Navbar from 'react-bootstrap/esm/Navbar';
import {
  getFirebaseAppClientSide,
  signOutUser,
} from '../lib/firebase/get-firebase-app-client-side';
import { onAuthStateChanged, sendEmailVerification } from 'firebase/auth';
import Cookies from 'js-cookie';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

type UserInfo = {
  email: string;
  emailVerified: boolean;
  uid: string;
  displayName: string | null;
};

const HeaderComponent = () => {
  const [user, setUser] = useState<UserInfo | null>(null);

  const getAuthCheck = useMemo(
    () => () => {
      try {
        if (!window) return;

        const { authInstance: firebaseAuth } = getFirebaseAppClientSide();

        onAuthStateChanged(firebaseAuth, async (authUser) => {
          try {
            // This inner try-catch handles errors within the auth state change callback
            if (authUser) {
              setUser({
                email: authUser.email ?? '',
                emailVerified: authUser.emailVerified,
                uid: authUser.uid,
                displayName: authUser.displayName,
              });

              if (!authUser.emailVerified) {
                sendEmailVerification(authUser);
              }
            } else {
              Cookies.remove('__session');
              setUser(null);
            }
          } catch (error) {
            console.error('Auth state change callback error:', error);
            // Consider logging out or showing a user-friendly error message
          }
        });
      } catch (outerError) {
        console.error('Error setting up auth state listener:', outerError);
        console.log('Potentially Firebase not initialized or accessible.');
      }
    },
    [], // Dependencies are empty, so this function is only created once
  );

  useEffect(() => {
    getAuthCheck();
  }, [getAuthCheck]);

  return (
    <Navbar sticky="top">
      <Container>
        <Row>
          {user && (
            <Col>
              {user.emailVerified
                ? 'Welcome ' + user.displayName
                : 'Please verify your email'}
            </Col>
          )}
          <Col>
            {user ? (
              user.email
            ) : (
              <Link href="/login">
                <Button>Login</Button>
              </Link>
            )}
          </Col>
          <Col>
            {user && (
              <Button
                onClick={() => {
                  signOutUser();
                  window.location.reload();
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
