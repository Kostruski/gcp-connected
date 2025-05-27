import { redirect } from 'next/navigation';
import { Col, Container, Row } from 'react-bootstrap';
import { verifyToken } from '../../lib/firebase/get-firebase-app-server-side';

const ReadPage = async () => {
  const tokenOk = await verifyToken();

  // perform this check for auth pages
  if (!tokenOk) {
    redirect('/logout');
  }

  return (
    <Container>
      <Row>
        <Col>Read</Col>
      </Row>
    </Container>
  );
};

export default ReadPage;
