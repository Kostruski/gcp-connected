'use client';

import { useState } from 'react';
import {
  generateTarotReading,
  continueTarotReading,
} from '../../app/actions/tarot';
import QuestionInput from '../auth-ui/question-input/question-input';

// Same interfaces as in actions/tarot.ts and lib/firestore.ts
interface TarotCard {
  name: string;
  position: string;
}
interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
  // timestamp is from Firestore, not needed for client-side input/display unless specifically used
}

interface TarotChatProps {
  initialCards: TarotCard[];
}

export default function TarotChat({ initialCards }: TarotChatProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [initialQuestion, setInitialQuestion] = useState<string>('');
  const [reading, setReading] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(''); // For follow-up questions
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialReadingInitiated, setInitialReadingInitiated] = useState(false); // Tracks if initial AI call has started

  // Function to handle the submission of the initial question from QuestionInput
  const handleInitialQuestionSubmit = async (question: string) => {
    if (!initialCards || initialCards.length === 0) {
      setError('Please select Tarot cards first.');
      return;
    }
    setInitialQuestion(question); // Store the question
    setInitialReadingInitiated(true); // Indicate that we're starting the initial reading process
    await getInitialReading(question); // Proceed to get the initial reading
  };

  // Function to get the initial reading (now takes question as arg)
  const getInitialReading = async (question: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateTarotReading(initialCards, question); // Use the provided question
      if (result.error) {
        setError(result.error);
        setInitialReadingInitiated(false); // Allow re-attempt if error
      } else if (result.reading && result.conversationId) {
        setReading(result.reading);
        setConversationId(result.conversationId);
        setConversationHistory([
          { role: 'model', parts: [{ text: result.reading }] },
        ]);
      }
    } catch (err) {
      setError('Failed to get initial reading. Please try again.');
      console.error('Error getting initial reading:', err);
      setInitialReadingInitiated(false); // Allow re-attempt if error
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowUp = async () => {
    if (!currentQuestion.trim() || !conversationId) {
      setError(
        'Please enter a question and ensure an initial reading has been generated.',
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    // Add user's new question to temporary history for immediate display
    const userMessage: Message = {
      role: 'user',
      parts: [{ text: currentQuestion }],
    };
    setConversationHistory((prev) => [...prev, userMessage]);
    setCurrentQuestion(''); // Clear input

    try {
      const result = await continueTarotReading(
        conversationId,
        currentQuestion,
      );

      if (result.error) {
        setError(result.error);
        // If there's an error, you might want to remove the last user message from history
        setConversationHistory((prev) => prev.slice(0, -1));
      } else {
        setConversationHistory(result.updatedHistory);
      }
    } catch (err) {
      setError('An unexpected error occurred during follow-up.');
      console.error('Client-side error calling Server Action:', err);
      setConversationHistory((prev) => prev.slice(0, -1)); // Remove user message on unexpected error
    } finally {
      setIsLoading(false);
    }
  };

  // Decide what to render based on whether the initial question has been submitted
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Your Tarot Reading
      </h2>

      {!initialReadingInitiated ? (
        // Display the QuestionInput component if the initial reading process hasn't started
        <QuestionInput
          onQuestionSubmit={handleInitialQuestionSubmit}
          isLoading={isLoading} // Propagate loading state
          submitButtonText="Start My Tarot Reading"
          placeholder="What specific question or intention do you have for this reading?"
        />
      ) : (
        // Once the initial question is submitted, display the reading and chat interface
        <>
          {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

          {/* Initial Reading Display */}
          {reading ? (
            <div className="mt-4 p-4 bg-gray-50 border rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Initial Reading:</h3>
              <p className="whitespace-pre-wrap">{reading}</p>
            </div>
          ) : (
            <div className="mt-4 text-center text-gray-600">
              <p>Generating your initial reading...</p>
              {/* You can add a spinner here if needed */}
            </div>
          )}

          {/* Conversation History and Follow-up Input */}
          {reading && ( // Only show conversation area after initial reading is loaded
            <div className="mt-6 border-t pt-4">
              <h3 className="text-xl font-semibold mb-3">Conversation:</h3>
              <div className="max-h-80 overflow-y-auto border p-3 rounded bg-gray-50 flex flex-col space-y-2">
                {conversationHistory.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <span
                      className={`inline-block p-2 rounded-lg max-w-[80%] ${
                        msg.role === 'user'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {msg.parts[0].text}
                    </span>
                  </div>
                ))}
                {isLoading && (
                  <div className="text-center text-gray-500">
                    <span className="dot-pulse"></span>{' '}
                    {/* Simple loading animation */}
                  </div>
                )}
              </div>

              {/* Follow-up Input */}
              <div className="mt-4 flex">
                <input
                  type="text"
                  value={currentQuestion}
                  onChange={(e) => setCurrentQuestion(e.target.value)}
                  placeholder="Ask a follow-up question..."
                  className="flex-grow shadow appearance-none border rounded-l w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !isLoading) {
                      handleFollowUp();
                    }
                  }}
                />
                <button
                  onClick={handleFollowUp}
                  disabled={isLoading || !currentQuestion.trim()}
                  className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-r focus:outline-none focus:shadow-outline ${
                    isLoading || !currentQuestion.trim()
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                >
                  Ask
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
