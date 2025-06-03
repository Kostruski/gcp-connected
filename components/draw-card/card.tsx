'use client';
import Image from 'next/image';
import { useState } from 'react';

const Card = ({ imageSrc, name }: { imageSrc: string; name: string }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div style={{ minWidth: '50px' }} className="position-relative w-100">
      <div
        className="border rounded position-relative" // Bootstrap classes: 'border' adds a border, 'rounded' adds default rounded corners
        style={{
          width: '100%',
          paddingBottom: '184.8%',
          overflow: 'hidden',
        }}
        onClick={() => setIsFlipped(!isFlipped)}
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
