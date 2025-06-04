'use server';

// Import necessary modules from Google Cloud Vertex AI SDK
import { Content, VertexAI } from '@google-cloud/vertexai';
import { HarmBlockThreshold, HarmCategory } from '@google-cloud/vertexai';
import { verifyToken } from '../../lib/firebase/firebaseAdmin';
import {
  createConversation,
  getConversation,
  appendMessagesToConversation,
} from '../../lib/firebase/firestore';
import { redirect } from 'next/navigation';
import { AI_MODEL_NAME } from '../../utils/ai-model-name';
import { FieldValue } from 'firebase-admin/firestore';

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

// Represents a single message in the conversation for multi-turn interactions
// Adjusted to include tokenCount for Firestore storage
interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
  tokenCount?: number; // Make optional as it might not be present in client-side Message type
  timestamp?: FieldValue; // Optional for Firestore, but not used in AI prompts
}

/**
 * Generates an initial comprehensive Tarot card reading and saves it to Firestore.
 * This is typically the first call for a new reading session.
 *
 * @param cards An array of TarotCard objects representing the spread.
 * @param userQuestion An optional question or intention from the user for the reading.
 * @returns An object containing the generated reading, its conversation ID, or an error message.
 */
export async function generateTarotReading(
  cards: TarotCard[],
  userQuestion: string = '',
): Promise<{ reading: string; conversationId?: string; error?: string }> {
  // --- Authentication/Authorization Check ---
  const decodedToken = await verifyToken(); // Get the decoded token

  if (!decodedToken) {
    redirect('/logout');
  }
  const userId = decodedToken.uid; // Extract UID from the decoded token
  // --- End Auth Check ---

  if (!process.env.GCP_PROJECT_ID || !process.env.GCP_LOCATION) {
    return {
      reading: '',
      error: 'Server configuration error: Missing Google Cloud settings.',
    };
  }
  if (
    !cards ||
    cards.length === 0 ||
    cards.some((c) => !c.name || !c.position)
  ) {
    return { reading: '', error: 'Invalid card selection provided.' };
  }

  try {
    let prompt = `You are an experienced, wise, and empathetic Tarot card reader.
    You will provide a detailed and insightful interpretation for the following Tarot card spread.
    Focus on integrating the traditional meanings of the cards with their given positions.
    Be encouraging and thoughtful, but also realistic and provide actionable insights.
    The reading should be coherent, well-structured, and flow naturally, like a professional consultation.

    Cards in the spread:
    `;

    cards.forEach((card, index) => {
      prompt += `\n${index + 1}. Card: "${card.name}" in the "${
        card.position
      }" position.`;
    });

    if (userQuestion) {
      prompt += `\n\nThe user's specific question or intention for this reading is: "${userQuestion}"`;
    }

    prompt += `\n\nProvide a comprehensive interpretation of this spread, covering each card's meaning in its position, and then offer an overall synthesis of the reading. Aim for a response length between 200-500 words.`;

    console.log('Sending initial Tarot reading prompt to Vertex AI...');

    // The promptTokenCount for the initial reading can be associated with the initial AI message
    // or tracked separately if you want to explicitly log user input cost.
    // For simplicity here, we'll assume billing mainly considers model output tokens
    // in createConversation, but promptTokens could be used for user cost.

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
        maxOutputTokens: 800,
      },
    });

    const text = resp?.response?.candidates?.[0].content.parts[0].text ?? '';
    const responseTokenCount = countTokens(text); // Calculate tokens for the AI's response

    // --- Save initial reading to Firestore ---
    // Note: If you want to track the initial prompt's token count,
    // you would either pass it here or store it with the user's initial question
    // in a separate message object if you restructure initial conversation.
    const conversationId = await createConversation(
      userId,
      cards,
      userQuestion,
      text ?? '',
      responseTokenCount, // Pass the AI response token count
    );
    console.log(
      `Initial reading saved with conversation ID: ${conversationId}`,
    );
    // --- End Save ---

    return { reading: text, conversationId: conversationId };
  } catch (error) {
    console.error('Error generating initial Tarot reading:', error);
    return {
      reading: '',
      error: 'Failed to generate initial reading. Please try again later.',
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
export async function continueTarotReading(
  conversationId: string,
  newUserQuestion: string,
): Promise<{ response: string; updatedHistory: Message[]; error?: string }> {
  // --- Authentication/Authorization Check ---
  const decodedToken = await verifyToken(); // Get the decoded token
  if (!decodedToken) {
    redirect('/logout');
  }
  const userId = decodedToken.uid; // Extract UID from the decoded token
  // --- End Auth Check ---

  if (!process.env.GCP_PROJECT_ID || !process.env.GCP_LOCATION) {
    return {
      response: '',
      updatedHistory: [],
      error: 'Server configuration error: Missing Google Cloud settings.',
    };
  }
  if (!newUserQuestion.trim()) {
    return {
      response: '',
      updatedHistory: [],
      error: 'Please enter a follow-up question.',
    };
  }

  try {
    // --- Fetch conversation from Firestore ---
    const conversation = await getConversation(conversationId);
    if (!conversation || conversation.userId !== userId) {
      // Ensure user owns the conversation
      return {
        response: '',
        updatedHistory: [],
        error: 'Conversation not found or unauthorized access.',
      };
    }
    const { initialCards, initialQuestion, history } = conversation;
    // --- End Fetch ---

    // Define the system instruction for the AI, including initial context
    const systemInstruction: Content = {
      role: 'system',
      parts: [
        {
          text: `You are an insightful and empathetic Tarot card reader.
          You have provided an initial reading based on these cards:
          ${initialCards
            .map((c) => `Card: "${c.name}" in the "${c.position}" position.`)
            .join('\n')}
          The initial question was: "${initialQuestion}"
          The initial comprehensive reading provided was:
          "${
            history[0]?.parts[0]?.text || 'No initial reading text available.'
          }"

          Now, the user has a follow-up question. Answer directly and empathetically based on the Tarot context.
          Maintain a conversational and supportive tone. Keep responses concise unless a detailed explanation is requested.
          If the user's question goes completely off-topic from Tarot, gently guide them back or state that you can only provide Tarot-related guidance.`,
        },
      ],
    };

    // Prepare the full conversation history for Gemini, including the new user message
    // Note: The 'timestamp' field in Message type from firestore.ts is FieldValue.
    // For sending to Vertex AI, we only need 'role' and 'parts'.
    const userMessageForHistory: Message = {
      role: 'user',
      parts: [{ text: newUserQuestion }],
    };
    const messagesToSendToAI: Content[] = [
      systemInstruction,
      ...history.map((msg) => ({ role: msg.role, parts: msg.parts })), // Strip tokenCount/timestamp for AI
      { role: userMessageForHistory.role, parts: userMessageForHistory.parts },
    ];

    console.log('Sending follow-up prompt to Vertex AI with history...');

    // Calculate tokens for the user's new message (part of the prompt)
    const newUserQuestionTokenCount = countTokens(newUserQuestion);

    // Calculate total input tokens sent to the model for this turn (promptTokens)
    const systemInstructionContent = systemInstruction.parts
      .map((p) => p.text)
      .join('');
    const historicalContent = history
      .map((msg) => msg.parts.map((p) => p.text).join(''))
      .join('');

    const promptTokens =
      countTokens(systemInstructionContent) +
      countTokens(historicalContent) +
      newUserQuestionTokenCount;

    const resp = await generativeModel.generateContent({
      contents: messagesToSendToAI,
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
        temperature: 0.8,
        maxOutputTokens: 500,
      },
    });

    const aiResponseText =
      resp?.response?.candidates?.[0].content.parts[0].text ?? '';
    const aiResponseTokenCount = countTokens(aiResponseText); // Calculate tokens for AI response

    // --- Update conversation history in Firestore ---
    // Prepare messages to append with token counts for Firestore
    const userMessageToAppend: Omit<Message, 'timestamp'> = {
      role: 'user',
      parts: [{ text: newUserQuestion }],
      // Store the *total input tokens* for this turn with the user's message
      // This is a common strategy to track the cost associated with the user's query.
      tokenCount: promptTokens,
    };
    const modelMessageToAppend: Omit<Message, 'timestamp'> = {
      role: 'model',
      parts: [{ text: aiResponseText }],
      tokenCount: aiResponseTokenCount,
    };

    await appendMessagesToConversation(
      conversationId,
      userMessageToAppend,
      modelMessageToAppend,
    );
    // --- End Update ---

    // Return the updated history for client-side state
    // For client display, we manually construct the history with the new messages.
    // The timestamps here are symbolic for the client, as Firestore will set the true ones.
    const updatedHistoryForClient: Message[] = [
      ...history, // Original history from DB
      {
        ...userMessageToAppend,
        // Using `Date.now()` as a temporary timestamp for client-side display,
        // actual Firestore timestamp is set by appendMessagesToConversation.
        timestamp: FieldValue.serverTimestamp(), // Cast to any to satisfy FieldValue type during mock
      },
      {
        ...modelMessageToAppend,
        timestamp: FieldValue.serverTimestamp(), // Cast to any
      },
    ];

    return {
      response: aiResponseText,
      updatedHistory: updatedHistoryForClient,
    };
  } catch (error) {
    console.error('Error continuing Tarot reading:', error);
    return {
      response: '',
      updatedHistory: [],
      error: 'Failed to generate response. Please try again later.',
    };
  }
}
