'use client';
import Image from 'next/image';

export type CardProps = {
  name: string;
  imageSrc: string;
  isFlipped: boolean;
  setIsFlipped: (flipped: boolean) => void;
  position: string;
};

const Card = ({ imageSrc, name, isFlipped, setIsFlipped }: CardProps) => {
  return (
    <div style={{ minWidth: '50px' }} className="position-relative w-100">
      <div
        className="border rounded position-relative" // Bootstrap classes: 'border' adds a border, 'rounded' adds default rounded corners
        style={{
          width: '100%',
          paddingBottom: '184.8%',
          overflow: 'hidden',
        }}
        onClick={() => {
          if (!isFlipped) setIsFlipped(true);
        }}
      >
        <Image
          src={isFlipped ? imageSrc : '/cards/cover.png'}
          alt={'tarot card'}
          fill={true}
          onError={(e) => console.error(e.target)}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: 'cover' }}
        />
      </div>
      <p className="py-2 text-center">{isFlipped ? name : ''}</p>
    </div>
  );
};

export default Card;
