'use client';
import { Row, Col, Card, Button } from 'react-bootstrap';
import Container from 'react-bootstrap/esm/Container';
import useAppState from '../../../store/store';
import { sendEmailVerification } from 'firebase/auth';
import { useShallow } from 'zustand/react/shallow';

const VerifyPage = () => {
  const { currentUser } = useAppState(
    useShallow((state) => ({
      currentUser: state.currentUser,
      setCurrentUser: state.setCurrentUser,
    })),
  );

  return (
    <Container fluid>
      <Row>
        <Col className="d-flex justify-content-center">
          <Card>
            <Card.Body>
              <Card.Title>Please verify your account</Card.Title>
              <Card.Text>
                {`You should have received an email with a link to verify your
                account. If you haven't received it, please check your spam
                folder or request a new verification email.`}
              </Card.Text>
              {currentUser && (
                <Button
                  variant="primary"
                  onClick={() => {
                    sendEmailVerification(currentUser);
                  }}
                >
                  Resend verification email
                </Button>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default VerifyPage;
