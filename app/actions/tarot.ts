'use server';

// Import necessary modules from Google Cloud Vertex AI SDK
import { VertexAI } from '@google-cloud/vertexai';
import { HarmBlockThreshold, HarmCategory } from '@google-cloud/vertexai';

// REMOVE these two lines as synthesizeSpeech is now in a separate file:
// import { TextToSpeechClient } from '@google-cloud/text-to-speech';
// const textToSpeechClient = new TextToSpeechClient();

import { verifyToken } from '../../lib/firebase/firebaseAdmin';
import { createConversation } from '../../lib/firebase/firestore';
import { redirect } from 'next/navigation';
import { AI_MODEL_NAME } from '../../utils/ai-model-name';
import { Locale, TranslationKey } from '../../types';
import trans, { Params } from '../../translations/translate';

// Import synthesizeSpeech and VoiceResult from the new file
import { synthesizeSpeech, VoiceResult } from '../../utils/textToSpeech'; // <-- NEW IMPORT

// --- End Helper ---

// --- Module-level (Singleton) Vertex AI Client Initialization ---
const vertex_ai = new VertexAI({
  project: process.env.GCP_PROJECT_ID,
  location: process.env.GCP_LOCATION,
});

const generativeModel = vertex_ai.getGenerativeModel({ model: AI_MODEL_NAME });

if (!process.env.GCP_PROJECT_ID || !process.env.GCP_LOCATION) {
  console.error(
    'CRITICAL: Missing GCP_PROJECT_ID or GCP_LOCATION environment variables. Vertex AI client may not function correctly.',
  );
  // Consider throwing an error here in production to prevent app startup issues
}
// --- End Singleton Initialization ---

// --- Basic Token Counter (for estimation) ---
// IMPORTANT: This is a basic approximation. For precise billing, consider:
// 1. Using a more robust tokenizer (e.g., 'js-tiktoken' or similar if applicable to your model).
// 2. Ideally, getting token counts directly from the Vertex AI API response
//    if it becomes available in a straightforward manner for your model type.
function countTokens(text: string): number {
  if (!text) return 0;
  // A simple split by whitespace is a rough estimate.
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
 * @param generateAudio Boolean to indicate if voice audio should be generated. <-- NEW PARAMETER
 * @param voiceGender The desired gender for the voice ('FEMALE', 'MALE', or 'NEUTRAL'). Defaults to 'NEUTRAL'. <-- NEW PARAMETER
 * @returns An object containing the generated reading, its conversation ID, the audio data (if generated), or an error message.
 */
export async function generateTarotReading(
  cards: TarotCard[],
  userQuestion: string = '',
  locale: Locale,
  generateAudio: boolean = false, // <-- NEW PARAMETER WITH DEFAULT
  voiceGender: 'FEMALE' | 'MALE' = 'FEMALE', // <-- NEW PARAMETER WITH DEFAULT
): Promise<{
  reading: string;
  conversationId?: string;
  error?: string;
  audio?: VoiceResult;
}> {
  // <-- UPDATED RETURN TYPE (audio is now optional)
  // --- Authentication/Authorization Check ---
  const decodedToken = await verifyToken(); // Get the decoded token
  const t = (key: TranslationKey, params?: Params) =>
    trans(locale, key, params);

  if (!decodedToken) {
    redirect('/logout');
  }
  const userId = decodedToken.uid; // Extract UID from the decoded token
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
      },
    });

    const text = resp?.response?.candidates?.[0].content.parts[0].text ?? '';
    const responseTokenCount = countTokens(text); // Calculate tokens for the AI's response

    let audioResult: VoiceResult | null = null; // Initialize audioResult

    // --- Conditionally Generate voice for the reading --- <-- UPDATED LOGIC
    if (generateAudio) {
      audioResult = await synthesizeSpeech(text, locale, voiceGender); // Pass voiceGender
    }
    // --- End Conditional Voice Generation ---

    // --- Save initial reading to Firestore ---
    const conversationId = await createConversation(
      userId,
      cards,
      userQuestion,
      text ?? '',
      responseTokenCount, // Pass the AI response token count
    );
    console.log('log_conversation_tokens_used', responseTokenCount);
    // --- End Save ---

    // Include audio in response ONLY if it was generated
    return {
      reading: text,
      conversationId: conversationId,
      ...(audioResult && { audio: audioResult }), // Conditionally add audio property
    };
  } catch (error) {
    console.error('Error generating initial Tarot reading:', error);
    return {
      reading: '',
      error: t('error_failed_to_generate_reading'),
    };
  }
}

/**
 * Continues a Tarot card reading conversation, handling follow-up questions.
 * This function fetches the conversation history from Firestore, appends new messages,
 * and saves the updated history back.
 *
 * @param conversationId The ID of the ongoing conversation.
 * @param newUserQuestion The new question from the user.
 * @returns An object containing the AI's response and the updated conversation history, or an error.
 */
