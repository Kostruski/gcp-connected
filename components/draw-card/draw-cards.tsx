import Card from './card';

const DrawCards = () => {
  return (
    <div className="d-flex justify-content-center flex-wrap flex-nowrap gap-3 h-100 w-50 mx-auto">
      <Card imageSrc={'/cards/0_fool.png'} />
      <Card imageSrc={'/cards/1_magician.png'} />
      <Card imageSrc={'/cards/2_highpriestess.png'} />
    </div>
  );
};

export default DrawCards;
