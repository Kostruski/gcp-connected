import Image from 'next/image';

const GoldenStar = () => {
  return (
    <div
      style={{
        backgroundImage: 'url(/images/flash.png)',
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        width: '300px',
        height: 'auto',
        position: 'relative',
      }}
      className="d-flex flex-column align-items-center my-4 mx-auto"
    >
      <Image src="/images/sun.svg" alt="golden sun" width={150} height={150} />
    </div>
  );
};

export default GoldenStar;
