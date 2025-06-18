'use server';

// Import necessary modules from Google Cloud Vertex AI SDK
import { VertexAI } from '@google-cloud/vertexai';
import { HarmBlockThreshold, HarmCategory } from '@google-cloud/vertexai';

import { verifyToken } from '../../lib/firebase/firebaseAdmin';
import { createConversation } from '../../lib/firebase/firestore';
import { redirect } from 'next/navigation';
import { AI_MODEL_NAME, LOW_TIER_MODEL_NAME } from '../../utils/ai-model-name';
import { Locale, TranslationKey } from '../../types';
import trans, { Params } from '../../translations/translate';

import { synthesizeSpeech, VoiceResult } from '../../utils/textToSpeech';
import { validateTarotQuestion } from '../../utils/validateTarotQuestion';
import { readingResponseSchema } from '../../utils/promptSchemas';
import { jsonToSsml } from '../../utils/jsonToSsml';

// --- Module-level (Singleton) Vertex AI Client Initialization ---
const vertex_ai = new VertexAI({
  project: process.env.GCP_PROJECT_ID,
  location: process.env.GCP_LOCATION,
});

const generativeModel = vertex_ai.getGenerativeModel({ model: AI_MODEL_NAME });

// Initialize a separate model for validation, potentially a faster one
const validationModel = vertex_ai.getGenerativeModel({
  model: LOW_TIER_MODEL_NAME,
});

if (!process.env.GCP_PROJECT_ID || !process.env.GCP_LOCATION) {
  console.error(
    'CRITICAL: Missing GCP_PROJECT_ID or GCP_LOCATION environment variables. Vertex AI client may not function correctly.',
  );
  // Consider throwing an error here in production to prevent app startup issues
}
// --- End Singleton Initialization ---

// --- Basic Token Counter (for estimation) ---
function countTokens(text: string): number {
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}
// --- End Token Counter ---

// Define types for your Tarot card data
interface TarotCard {
  name: string;
  position: string;
}

/**
 * Generates an initial comprehensive Tarot card reading and saves it to Firestore.
 * This is typically the first call for a new reading session.
 *
 * @param cards An array of TarotCard objects representing the spread.
 * @param userQuestion An optional question or intention from the user for the reading.
 * @param locale The locale for the reading and voice.
 * @param generateAudio Boolean to indicate if voice audio should be generated.
 * @param voiceGender The desired gender for the voice ('FEMALE', 'MALE', or 'NEUTRAL').
 * @returns An object containing the generated reading, its conversation ID, the audio data (if generated), or an error message.
 */
export async function generateTarotReading(
  cards: TarotCard[],
  userQuestion: string = '',
  locale: Locale,
  generateAudio: boolean = false,
  voiceGender: 'FEMALE' | 'MALE' = 'FEMALE',
): Promise<{
  reading: string;
  conversationId?: string;
  error?: string;
  audio?: VoiceResult;
}> {
  // --- Authentication/Authorization Check ---
  const decodedToken = await verifyToken();
  const t = (key: TranslationKey, params?: Params) =>
    trans(locale, key, params);

  if (!decodedToken) {
    redirect('/logout');
  }
  const userId = decodedToken.uid;
  // // --- End Auth Check ---

  if (!process.env.GCP_PROJECT_ID || !process.env.GCP_LOCATION) {
    return {
      reading: '',
      error: t('error_server_config'),
    };
  }
  if (
    !cards ||
    cards.length === 0 ||
    cards.some((c) => !c.name || !c.position)
  ) {
    return { reading: '', error: t('error_invalid_card_selection') };
  }

  if (userQuestion && userQuestion.trim() !== '') {
    try {
      const validationResult = await validateTarotQuestion(
        userQuestion,
        validationModel, // Pass the separate validation model instance
        locale,
      );

      if (!validationResult.isValid) {
        // If the question is invalid, return an error.
        // The error message here is a simple one, as the client will handle the prompt for rephrasing.
        return {
          reading: '',
          error: 'invalid_question', // This error message comes from your translations
        };
      }
    } catch (validationError: any) {
      console.error(
        'Error during pre-reading question validation:',
        validationError,
      );
      return {
        reading: '',
        error: validationError.message || 'error_validating_question',
      };
    }
  }
  // --- End NEW: Question Validation Step ---

  try {
    let prompt = `${t('tarot_reader_persona')}\n${t(
      'tarot_reading_instruction_main',
    )}\n\n${t('tarot_reading_spread_intro')}\n`;

    cards.forEach((card, index) => {
      prompt += `\n${index + 1}. ${t('tarot_reading_card_format', {
        cardName: card.name,
        cardPosition: card.position,
      })}`;
    });

    if (userQuestion) {
      prompt += `\n\n${t('tarot_reading_user_question_intro', {
        userQuestion: userQuestion,
      })}`;
    }

    prompt += `\n\n${t('tarot_reading_interpretation_request')}`;

    const resp = await generativeModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
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
        temperature: 0.9,
        maxOutputTokens: 1000,
        responseMimeType: 'application/json',
        responseSchema: readingResponseSchema,
      },
    });

    // The response is now a JSON string, so we need to parse it
    const aiResponseJsonString =
      resp?.response?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    let parsedReading: any = null;
    try {
      parsedReading = JSON.parse(aiResponseJsonString);
    } catch (parseError) {
      console.error('Error parsing AI response JSON:', parseError);
      return {
        reading: '',
        error: 'error JSON parsing ai response',
      };
    }

    console.log('AI Response:', parsedReading);

    const responseTokenCount = countTokens(aiResponseJsonString);

    let audioResult: VoiceResult | null = null;

    if (generateAudio) {
      // You might want to generate SSML directly from the parsed object for more control
      // For simplicity here, we convert the combined Markdown text to SSML
      const ssmlText = jsonToSsml(parsedReading);
      console.log('Generated SSML for TTS:', ssmlText);
      audioResult = await synthesizeSpeech(ssmlText, locale, voiceGender);
    }

    const conversationId = await createConversation(
      userId,
      cards,
      userQuestion,
      parsedReading ?? '',
      responseTokenCount,
    );
    console.log('log_conversation_tokens_used', responseTokenCount);

    return {
      reading: aiResponseJsonString,
      conversationId: conversationId,
      ...(audioResult && { audio: audioResult }),
    };
  } catch (error) {
    console.error('Error generating initial Tarot reading:', error);
    return {
      reading: '',
      error: t('error_failed_to_generate_reading'),
    };
  }
}
