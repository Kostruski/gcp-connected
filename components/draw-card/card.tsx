'use client';
import Image from 'next/image';
// import trans, { Params } from '../../translations/translate';
// import { TranslationKey } from '../../types';

const Card = ({ imageSrc }: { imageSrc: string }) => {
  //  const t = (key: TranslationKey, params?: Params) => trans(lang, key, params);
  return (
    <div className="border rounded position-relative">
      <Image
        src={imageSrc}
        alt={'tarot card'}
        fill={true}
        onError={(e) => console.error(e.target)}
      />
      <p></p>
    </div>
  );
};

export default Card;
