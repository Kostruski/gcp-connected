'use client';
import { useShallow } from 'zustand/shallow';
import useAppState from '../../store/store';
import Card, { CardProps } from './card';
import cardsTranslations from '../../translations/cardsTranslations';
import { TarotCardName } from '../../types';
import { ALL_TAROT_CARD_NAMES } from '../../utils/cardsInfo';
import TarotChat from '../tarot-chat/tarot-chat';
import translations from '../../translations/translations';
import { useEffect, useState } from 'react';

const DrawCards = () => {
  const { currentLanguage } = useAppState(
    useShallow((state) => ({
      currentLanguage: state.currentLanguage,
    })),
  );

  const [cards, setCard] = useState<CardProps[]>([]);

  useEffect(() => {
    const cardsSet = new Set<string>();
    while (cardsSet.size < 3) {
      const randomIndex = Math.floor(
        Math.random() * ALL_TAROT_CARD_NAMES.length,
      );
      const cardName = ALL_TAROT_CARD_NAMES[randomIndex];
      if (!cardsSet.has(cardName)) {
        cardsSet.add(cardName);
      }
    }

    const selectedCards = Array.from(cardsSet) as TarotCardName[];
    const initialCards = selectedCards.map((cardKey, index) => ({
      name: cardsTranslations[cardKey][currentLanguage],
      imageSrc: `/cards/${cardKey}.png`,
      position: translations.card_positions[currentLanguage][index],
      isFlipped: false,
      setIsFlipped: (flipped: boolean) => {
        setCard((prevCards) =>
          prevCards.map((card, i) =>
            i === index ? { ...card, isFlipped: flipped } : card,
          ),
        );
      },
    }));

    setCard(initialCards);
  }, [currentLanguage]);

  return (
    <>
      <div className="d-flex justify-content-center flex-wrap flex-nowrap gap-3 w-50 mx-auto">
        {cards.map((card) => (
          <Card
            key={card.name}
            imageSrc={card.imageSrc}
            name={card.name}
            isFlipped={card.isFlipped}
            setIsFlipped={card.setIsFlipped}
            position={card.position}
          />
        ))}
      </div>
      <div className="d-flex justify-content-center my-4 mx-auto w-50">
        <TarotChat
          initialCards={cards.map((card) => ({
            name: card.name,
            position: card.position,
          }))}
        />
      </div>
    </>
  );
};

export default DrawCards;
