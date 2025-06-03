'use client';
import Image from 'next/image';
// import trans, { Params } from '../../translations/translate';
// import { TranslationKey } from '../../types';

const Card = ({ imageSrc }: { imageSrc: string }) => {
  //  const t = (key: TranslationKey, params?: Params) => trans(lang, key, params);
  return (
    <div style={{ minWidth: '50px' }} className="position-relative w-100">
      <div
        className="border rounded position-relative" // Bootstrap classes: 'border' adds a border, 'rounded' adds default rounded corners
        style={{
          width: '100%',
          paddingBottom: '184.8%',
          overflow: 'hidden',
        }}
      >
        <Image
          src={imageSrc}
          alt={'tarot card'}
          fill={true}
          onError={(e) => console.error(e.target)}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: 'cover' }}
        />
      </div>
    </div>
  );
};

export default Card;
