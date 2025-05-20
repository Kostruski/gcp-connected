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
  const { authInstance: firebaseAuth } = getFirebaseAppClientSide();

  const getAuthCheck = useMemo(
    () => () =>
      onAuthStateChanged(firebaseAuth, async (authUser) => {
        if (!window) return;

        try {
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
          console.error('Auth state change error:', error);
          console.log('Logout user');
        }
      }),
    [],
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
