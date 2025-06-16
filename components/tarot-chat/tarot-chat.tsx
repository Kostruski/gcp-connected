'use client';

import { useState } from 'react';

import QuestionInput from '../auth-ui/question-input/question-input';

import Stack from 'react-bootstrap/Stack';
import Spinner from 'react-bootstrap/Spinner';

import { useShallow } from 'zustand/shallow';
import useAppState from '../../store/store';
import { generateTarotReading } from '../../app/actions/tarot';
import { TranslationKey } from '../../types';
import trans, { Params } from '../../translations/translate';

// Same interfaces as in actions/tarot.ts and lib/firestore.ts
interface TarotCard {
  name: string;
  position: string;
}

interface TarotChatProps {
  initialCards: TarotCard[];
}

export default function TarotChat({ initialCards }: TarotChatProps) {
  const [, setInitialQuestion] = useState<string>('');
  const [reading, setReading] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialReadingInitiated, setInitialReadingInitiated] = useState(false);

  const { currentLanguage } = useAppState(
    useShallow((state) => ({
      currentLanguage: state.currentLanguage,
    })),
  );

  const t = (key: TranslationKey, params?: Params) =>
    trans(currentLanguage, key, params);

  /**
   * Handles the submission of the user's initial question.
   * This function is triggered by the QuestionInput component.
   * @param question The user's input question.
   */
  const handleInitialQuestionSubmit = async (question: string) => {
    // Validate that tarot cards have been selected before proceeding
    if (!initialCards || initialCards.length === 0) {
      setError('Please select Tarot cards first.');
      return;
    }

    setInitialQuestion(question); // Store the question
    setInitialReadingInitiated(true); // Indicate that the reading process has started
    await getInitialReading(question); // Proceed to get the initial reading
  };

  /**
   * Fetches the initial tarot reading from the server.
   * @param question The user's question for the reading.
   */
  const getInitialReading = async (question: string) => {
    setIsLoading(true); // Set loading state to true
    setError(null); // Clear any previous errors

    try {
      // Call the server action to generate the tarot reading
      const result = await generateTarotReading(
        initialCards,
        question,
        currentLanguage,
      );

      // Check if the server action returned an error
      if (result.error) {
        setError(result.error); // Set the error message
        setInitialReadingInitiated(false); // Allow user to retry by showing the input again
      } else if (result.reading) {
        setReading(result.reading); // Set the received reading
      } else {
        // Fallback for unexpected successful response without reading text
        setError('Reading generated, but content is empty. Please try again.');
        setInitialReadingInitiated(false);
      }
    } catch (err) {
      // Catch any network or unexpected errors
      setError('Failed to get initial reading. Please try again.');
      console.error('Error getting initial reading:', err);
      setInitialReadingInitiated(false); // Allow user to retry
    } finally {
      setIsLoading(false); // Always set loading state to false after the operation
    }
  };

  return (
    <Stack gap={3} className="col-md-5 mx-auto">
      {!initialReadingInitiated ? (
        <QuestionInput
          onQuestionSubmit={handleInitialQuestionSubmit}
          isLoading={isLoading}
          locale={currentLanguage}
        />
      ) : (
        <>
          {error && <p className="text-danger">{error}</p>}

          {reading ? (
            <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
              <p className="whitespace-pre-wrap">{reading}</p>
            </div>
          ) : (
            <div className="text-center p-4">
              <p>{t('read_page_waiting_for_reading')}</p>
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          )}
        </>
      )}
    </Stack>
  );
}
