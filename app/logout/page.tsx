'use client';
import Link from 'next/link';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import useAppState from '../../store/store';
import { useShallow } from 'zustand/react/shallow';
import { useEffect } from 'react';
import { signOutUser } from '../../lib/firebase/get-firebase-app-client-side';

const LogoutPage = () => {
  const { currentUser, setCurrentUser } = useAppState(
    useShallow((state) => ({
      currentUser: state.currentUser,
      setCurrentUser: state.setCurrentUser,
    })),
  );

  useEffect(() => {
    if (currentUser) {
      setCurrentUser(null);
    }

    signOutUser();
  }, []);

  return (
    <Container fluid>
      <Row>
        <Col className="d-flex justify-content-center">
          <Card>
            <Card.Body>
              <Card.Title>{`You were logged out.`}</Card.Title>
              <Card.Text>{`You were logged out.`}</Card.Text>
              <Link href="/login">
                <Button>Login</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LogoutPage;
