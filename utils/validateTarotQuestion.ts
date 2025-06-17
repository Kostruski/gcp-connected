// app/actions/tarot.ts (or wherever your actions are located)

import {
  GenerativeModel,
  HarmBlockThreshold,
  HarmCategory,
  FunctionDeclarationSchemaType, // <--- Import this!
} from '@google-cloud/vertexai';

import { verifyToken } from '../lib/firebase/firebaseAdmin';
import trans, { Params } from '../translations/translate';
import { Locale, TranslationKey } from '../types';

// Define the expected structure of the AI's response
interface ValidationResult {
  isValid: boolean;
}

/**
 * Validates if a user's question is a suitable prompt for a Tarot card reading,
 * returning only a boolean.
 *
 * @param {string} userQuestion - The question provided by the user.
 * @param {GenerativeModel} validationModel - The Vertex AI GenerativeModel instance.
 * @param {Locale} locale - The locale for fetching the correct prompt context.
 * @returns {Promise<{isValid: boolean}>} - An object containing `isValid` (boolean).
 */
export async function validateTarotQuestion(
  userQuestion: string,
  validationModel: GenerativeModel,
  locale: Locale,
): Promise<ValidationResult> {
  // Ensure authentication check is done if this is a server action
  const decodedToken = await verifyToken();
  if (!decodedToken) {
    console.error('Authentication failed for question validation.');
    return { isValid: false };
  }

  const t = (key: TranslationKey, params?: Params) =>
    trans(locale, key, params);

  if (!userQuestion || userQuestion.trim() === '') {
    return { isValid: false }; // Empty question is always invalid
  }

  try {
    const validationPrompt = `${t(
      'validateTarotQuestion_context',
    )}\n "${userQuestion}"`;

    // Define the response schema explicitly, using FunctionDeclarationSchemaType
    const responseSchema = {
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

    const resp = await validationModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: validationPrompt }] }],
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
      generationConfig: {
        temperature: 0.0,
        maxOutputTokens: 20,
        responseMimeType: 'application/json',
        responseSchema: responseSchema, // This is now correctly typed
      },
    });

    const aiResponseText =
      resp?.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';

    try {
      const jsonResponse = JSON.parse(aiResponseText);
      if (typeof jsonResponse.isValid === 'boolean') {
        return { isValid: jsonResponse.isValid };
      }
      throw new Error(
        'AI response did not contain a valid boolean for "isValid" despite schema.',
      );
    } catch (parseError) {
      console.error(
        'Failed to parse JSON response from AI for validation:',
        parseError,
        'Raw Response:',
        aiResponseText,
      );
      return { isValid: false };
    }
  } catch (error) {
    console.error('Error calling Vertex AI for question validation:', error);
    return { isValid: false };
  }
}
