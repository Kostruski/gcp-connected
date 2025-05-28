import { Col, Container, Row } from 'react-bootstrap';
import authPage from '../../utils/authPage';

const ReadPage = async () => {
await authPage()

  return (
    <Container>
      <Row>
        <Col>Read</Col>
      </Row>
    </Container>
  );
};

export default ReadPage;
