'use client';
import { useShallow } from 'zustand/shallow';
import useAppState from '../../store/store';
import Card from './card';
import cardsTranslations from '../../translations/cardsTranslations';
import { TarotCardName } from '../../types';
import { ALL_TAROT_CARD_NAMES } from '../../utils/cardsInfo';
import TarotChat from '../tarot-chat/tarot-chat';
import translations from '../../translations/translations';

const DrawCards = () => {
  const { currentLanguage } = useAppState(
    useShallow((state) => ({
      currentLanguage: state.currentLanguage,
    })),
  );

  const cardsSet = new Set<string>();
  while (cardsSet.size < 3) {
    const randomIndex = Math.floor(Math.random() * ALL_TAROT_CARD_NAMES.length);
    const cardName = ALL_TAROT_CARD_NAMES[randomIndex];
    if (!cardsSet.has(cardName)) {
      cardsSet.add(cardName);
    }
  }

  const selectedCards = Array.from(cardsSet) as TarotCardName[];
  const initialCards = selectedCards.map((cardKey, index) => ({
    name: cardsTranslations[cardKey][currentLanguage],
    position: translations.card_positions[currentLanguage][index],
  }));

  return (
    <>
      <div className="d-flex justify-content-center flex-wrap flex-nowrap gap-3 h-100 w-50 mx-auto">
        {selectedCards.map((cardKey) => (
          <Card
            key={cardKey}
            imageSrc={`/cards/${cardKey}.png`}
            name={cardsTranslations[cardKey][currentLanguage]}
          />
        ))}
      </div>
      <TarotChat initialCards={initialCards} />
    </>
  );
};

export default DrawCards;
