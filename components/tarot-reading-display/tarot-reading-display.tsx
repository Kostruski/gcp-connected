import React from 'react';
import { TarotReadingResponse } from '../../types';

interface TarotReadingDisplayProps {
  readingData: TarotReadingResponse; // The structured Tarot reading data
}

/**
 * A React component to display a structured Tarot reading using only <p> and <br> tags.
 * All content comes directly from the readingData prop.
 *
 * @param {TarotReadingDisplayProps} props - The props containing the Tarot reading data.
 * @returns {JSX.Element} The JSX element for the Tarot reading display.
 */
const TarotReadingDisplay: React.FC<TarotReadingDisplayProps> = ({
  readingData,
}) => {
  if (!readingData) {
    return <p>No reading data available to display.</p>;
  }

  return (
    <div>
      <p>{readingData.introduction}</p>
      <br />
      <br />
      {readingData.cardsInterpretation.map((card, index) => (
        <React.Fragment key={index}>
          <p>
            <strong>{card.cardName}</strong> in the {card.position} position.
            <br />
            {card.interpretation}
          </p>
          {index < readingData.cardsInterpretation.length - 1 && <br />}
        </React.Fragment>
      ))}
      <br />
      <br />
      <p>{readingData.overallSynthesis}</p>
      <br />
      <br />
      <p>{readingData.actionableSummary.intro}</p>
      {readingData.actionableSummary.points.map((point, index) => (
        <p key={index}>- {point}</p>
      ))}
      <br />
      <br />
      <p>{readingData.conclusion}</p>
    </div>
  );
};

export default TarotReadingDisplay;
