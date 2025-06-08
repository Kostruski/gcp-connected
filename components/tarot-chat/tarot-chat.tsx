'use client';

import { useState } from 'react';
import {
  generateTarotReading,
  continueTarotReading,
} from '../../app/actions/tarot';
import QuestionInput from '../auth-ui/question-input/question-input';

import Stack from 'react-bootstrap/Stack';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';

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
      }

      // else if ( result.reading && result.conversationId ) {
      //   setReading(result.reading);
      //   setConversationId(result.conversationId);
      //   setConversationHistory([
      //     { role: 'model', parts: [{ text: result.reading }] },
      //   ]);
      // }
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

  return (
    <Stack gap={3} className="col-md-5 mx-auto">
      <h2>Your Tarot Reading</h2>

      {!initialReadingInitiated ? (
        <QuestionInput
          onQuestionSubmit={handleInitialQuestionSubmit}
          isLoading={isLoading}
          submitButtonText="Start My Tarot Reading"
          placeholder="What specific question or intention do you have for this reading?"
        />
      ) : (
        <>
          {error && <p>{error}</p>}

          {reading ? (
            <div>
              <h3>Initial Reading:</h3>
              <p>{reading}</p>
            </div>
          ) : (
            <div>
              <p>Generating your initial reading...</p>
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          )}

          {reading && (
            <Stack gap={2}>
              <h3>Conversation:</h3>
              <div
                style={{
                  maxHeight: '200px',
                  overflowY: 'auto',
                  border: '1px solid #ccc',
                  padding: '10px',
                }}
              >
                {conversationHistory.map((msg, index) => (
                  <div
                    key={index}
                    className={`d-flex ${
                      msg.role === 'user'
                        ? 'justify-content-end'
                        : 'justify-content-start'
                    }`}
                  >
                    <span
                      style={{
                        padding: '8px',
                        borderRadius: '5px',
                        maxWidth: '80%',
                        backgroundColor:
                          msg.role === 'user' ? '#e0f7fa' : '#f0f0f0',
                      }}
                    >
                      {msg.parts[0].text}
                    </span>
                  </div>
                ))}
                {isLoading && (
                  <div className="text-center">
                    <Spinner animation="grow" />
                  </div>
                )}
              </div>

              <div className="d-flex">
                <Form.Control
                  type="text"
                  value={currentQuestion}
                  onChange={(e) => setCurrentQuestion(e.target.value)}
                  placeholder="Ask a follow-up question..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !isLoading) {
                      handleFollowUp();
                    }
                  }}
                />
                <Button
                  onClick={handleFollowUp}
                  disabled={isLoading || !currentQuestion.trim()}
                >
                  Ask
                </Button>
              </div>
            </Stack>
          )}
        </>
      )}
    </Stack>
  );
}
