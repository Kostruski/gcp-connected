import { db } from './firebaseAdmin'; // Import the initialized Firestore instance
import { FieldValue } from 'firebase-admin/firestore'; // For timestamps

// Define types for your conversation and messages
interface TarotCard {
  name: string;
  position: string;
}

interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
  tokenCount?: number;
}

// Full conversation structure as stored in Firestore
export interface Conversation {
  id?: string; // Document ID, optional when creating
  userId: string;
  initialCards: TarotCard[];
  initialQuestion: string;
  history: Message[];
  createdAt: FieldValue;
  updatedAt: FieldValue;
}

const CONVERSATIONS_COLLECTION = 'conversations'; // Firestore collection name

/**
 * Creates a new Tarot conversation record in Firestore.
 * @param userId The ID of the user.
 * @param initialCards The cards drawn for the initial reading.
 * @param initialQuestion The user's initial question.
 * @param initialReading The AI's initial comprehensive reading.
 * @param initialReadingTokenCount The token count of the initial AI reading.
 * @returns The ID of the newly created conversation.
 */
export async function createConversation(
  userId: string,
  initialCards: TarotCard[],
  initialQuestion: string,
  initialReading: string,
  initialReadingTokenCount: number, // New parameter for token count
): Promise<string> {
  const newConversationRef = db.collection(CONVERSATIONS_COLLECTION).doc(); // Auto-generate ID

  const initialMessage: Message = {
    role: 'model',
    parts: [{ text: initialReading }],
    tokenCount: initialReadingTokenCount, // Store the token count
  };

  const conversationData: Conversation = {
    userId,
    initialCards,
    initialQuestion,
    history: [initialMessage],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  await newConversationRef.set(conversationData);
  return newConversationRef.id;
}

/**
 * Fetches a specific conversation by its ID.
 * @param conversationId The ID of the conversation document.
 * @returns The Conversation object or null if not found.
 */
export async function getConversation(
  conversationId: string,
): Promise<Conversation | null> {
  const docRef = db.collection(CONVERSATIONS_COLLECTION).doc(conversationId);
  const docSnap = await docRef.get();

  if (docSnap.exists) {
    // Cast to Conversation, ensuring 'id' is included
    return { id: docSnap.id, ...(docSnap.data() as Omit<Conversation, 'id'>) };
  }
  return null;
}

/**
 * Appends new messages (user and model) to an existing conversation's history,
 * including their token counts.
 * @param conversationId The ID of the conversation to update.
 * @param userMessage The new user message object (with tokenCount).
 * @param modelMessage The new model message object (with tokenCount).
 */
export async function appendMessagesToConversation(
  conversationId: string,
  userMessage: Omit<Message, 'timestamp'>, // No timestamp, will be added
  modelMessage: Omit<Message, 'timestamp'>, // No timestamp, will be added
): Promise<void> {
  const docRef = db.collection(CONVERSATIONS_COLLECTION).doc(conversationId);

  // Add server timestamp to each message
  const userMessageWithTimestamp = {
    ...userMessage,
    timestamp: FieldValue.serverTimestamp(),
  };
  const modelMessageWithTimestamp = {
    ...modelMessage,
    timestamp: FieldValue.serverTimestamp(),
  };

  await docRef.update({
    history: FieldValue.arrayUnion(
      userMessageWithTimestamp,
      modelMessageWithTimestamp,
    ),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

/**
 * Overwrites the entire history of a conversation. Use with caution.
 * This might be useful if you're managing the history array in your app and sending the whole thing back.
 * @param conversationId The ID of the conversation to update.
 * @param newHistory The complete new history array (messages should already have tokenCount if needed).
 */
export async function updateConversationHistory(
  conversationId: string,
  newHistory: Omit<Message, 'timestamp'>[], // New history without timestamps
): Promise<void> {
  const docRef = db.collection(CONVERSATIONS_COLLECTION).doc(conversationId);

  const historyWithTimestamps = newHistory.map((msg) => ({
    ...msg,
    timestamp: FieldValue.serverTimestamp(),
  }));

  await docRef.update({
    history: historyWithTimestamps,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

// You can add more CRUD operations as needed, e.g., deleteConversation, listUserConversations
