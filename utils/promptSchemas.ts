import { FunctionDeclarationSchemaType } from '@google-cloud/vertexai';

export const validateQuestionSchema = {
  type: FunctionDeclarationSchemaType.OBJECT, // <--- Use the enum here!
  properties: {
    isValid: {
      type: FunctionDeclarationSchemaType.BOOLEAN, // <--- And here!
      description:
        'True if the question is suitable for a Tarot reading, false otherwise.',
    },
  },
  required: ['isValid'],
};

export const readingResponseSchema = {
  type: FunctionDeclarationSchemaType.OBJECT,
  properties: {
    introduction: {
      type: FunctionDeclarationSchemaType.STRING,
      description: 'A brief introduction to the Tarot reading.',
    },
    cardsInterpretation: {
      type: FunctionDeclarationSchemaType.ARRAY,
      description: 'An array of interpretations for each Tarot card.',
      items: {
        type: FunctionDeclarationSchemaType.OBJECT,
        properties: {
          cardName: {
            type: FunctionDeclarationSchemaType.STRING,
            description: 'The name of the Tarot card.',
          },
          position: {
            type: FunctionDeclarationSchemaType.STRING,
            description:
              'The position of the card in the spread (e.g., "First", "Second", "Third").',
          },
          interpretation: {
            type: FunctionDeclarationSchemaType.STRING,
            description:
              'The detailed interpretation of the card in its position.',
          },
        },
        required: ['cardName', 'position', 'interpretation'],
      },
    },
    overallSynthesis: {
      type: FunctionDeclarationSchemaType.STRING,
      description: 'A synthesis summarizing the entire reading.',
    },
    actionableSummary: {
      type: FunctionDeclarationSchemaType.OBJECT,
      description: 'An actionable summary or advice based on the reading.',
      properties: {
        intro: {
          type: FunctionDeclarationSchemaType.STRING,
          description: 'An introductory sentence for the actionable points.',
        },
        points: {
          type: FunctionDeclarationSchemaType.ARRAY,
          description: 'A list of actionable advice points.',
          items: {
            type: FunctionDeclarationSchemaType.STRING,
          },
        },
      },
      required: ['intro', 'points'],
    },
    conclusion: {
      type: FunctionDeclarationSchemaType.STRING,
      description: 'A concluding statement for the reading.',
    },
  },
  required: [
    'introduction',
    'cardsInterpretation',
    'overallSynthesis',
    'actionableSummary',
    'conclusion',
  ],
};
