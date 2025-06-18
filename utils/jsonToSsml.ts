// Assuming you have a type definition for your structured reading, e.g.:
interface TarotReadingResponse {
  introduction: string;
  cardsInterpretation: Array<{
    cardName: string;
    position: string;
    interpretation: string;
  }>;
  overallSynthesis: string;
  actionableSummary: {
    intro: string;
    points: string[];
  };
  conclusion: string;
}

/**
 * Converts a structured Tarot reading JSON response into a valid SSML string
 * for enhanced text-to-speech presentation.
 *
 * @param reading The structured JSON object representing the Tarot reading.
 * @returns A string containing the SSML formatted for Google Text-to-Speech.
 */
export function jsonToSsml(reading: TarotReadingResponse): string {
  let ssml = '<speak>';

  // 1. Introduction
  ssml += `<prosody rate="slow" pitch="+2st">
             <p>${reading.introduction}</p>
           </prosody>`;
  ssml += '<break time="1s"/>'; // Pause after introduction

  // 2. Cards Interpretation
  ssml += `<p>Here are the insights from your cards:</p>`;
  ssml += '<break time="700ms"/>'; // Pause before starting card interpretations

  reading.cardsInterpretation.forEach((card, index) => {
    // Slight pause before each card, longer before the first one
    if (index === 0) {
      ssml += '<break time="1s"/>';
    } else {
      ssml += '<break time="800ms"/>';
    }

    ssml += `<p>
               <emphasis level="strong">Card ${index + 1}: ${
      card.cardName
    } in the ${card.position} position.</emphasis>
               <break time="300ms"/>
               <prosody rate="medium">${card.interpretation}</prosody>
             </p>`;
  });

  ssml += '<break time="1.5s"/>'; // Longer pause after all cards

  // 3. Overall Synthesis
  ssml += `<p>
             <emphasis level="moderate">Let's synthesize what these cards mean together.</emphasis>
             <break time="500ms"/>
             <prosody rate="medium" pitch="-1st">${reading.overallSynthesis}</prosody>
           </p>`;
  ssml += '<break time="1.5s"/>'; // Pause after synthesis

  // 4. Actionable Summary
  ssml += `<p>
             <emphasis level="strong">Now for some actionable guidance:</emphasis>
             <break time="500ms"/>
             <prosody rate="slow">${reading.actionableSummary.intro}</prosody>
           </p>`;
  ssml += '<break time="800ms"/>';

  // Use an ordered list structure for actionable points, with slight pauses
  reading.actionableSummary.points.forEach((point, index) => {
    ssml += `<p>
               <prosody rate="slow">Point ${
                 index + 1
               }: <break time="150ms"/> ${point}</prosody>
             </p>`;
    ssml += '<break time="600ms"/>'; // Pause between points
  });

  ssml += '<break time="1.5s"/>'; // Pause after actionable summary

  // 5. Conclusion
  ssml += `<p>
             <prosody rate="slow" pitch="-2st">${reading.conclusion}</prosody>
           </p>`;

  ssml += '</speak>';
  return ssml;
}
