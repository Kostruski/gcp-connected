import { Container, Row } from 'react-bootstrap';
import Card from './card';

const DrawCards = () => {
  return (
    <Container className="vh-50">
      <Row>
        <Card imageSrc={'/cards/0_fool.png'} />
        <Card imageSrc={'/cards/1_magician.png'} />
        <Card imageSrc={'/cards/2_highpriestess.png'} />
      </Row>
    </Container>
  );
};

export default DrawCards;
