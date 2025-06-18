'use client';

import { useState, useEffect } from 'react';

import QuestionInput from '../question-input/question-input';

import Stack from 'react-bootstrap/Stack';
import Spinner from 'react-bootstrap/Spinner';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import { useShallow } from 'zustand/shallow';
import useAppState from '../../store/store';
import { generateTarotReading } from '../../app/actions/tarot';
import { TarotReadingResponse, TranslationKey } from '../../types';
import trans, { Params } from '../../translations/translate';
import TextScroller from '../text-scroller/text-scroller';
import TarotReadingDisplay from '../tarot-reading-display/tarot-reading-display';

// Same interfaces as in actions/tarot.ts and lib/firestore.ts
interface TarotCard {
  name: string;
  position: string;
}

// Assuming VoiceResult interface is defined somewhere accessible, e.g., from ../../utils/textToSpeech
interface VoiceResult {
  audioContent: string;
  mimeType: string;
}

interface TarotChatProps {
  initialCards: TarotCard[];
}

export default function TarotChat({ initialCards }: TarotChatProps) {
  const [, setInitialQuestion] = useState<string>('');
  const [reading, setReading] = useState<TarotReadingResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInvalidQuestion, setIsInvalidQuestion] = useState(false);
  const [initialReadingInitiated, setInitialReadingInitiated] = useState(false);
  const [audioResult, setAudioResult] = useState<VoiceResult | null>(null);
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);

  // New state for audio options
  const [useAudio, setUseAudio] = useState(false);
  const [voiceGender, setVoiceGender] = useState<'FEMALE' | 'MALE'>('FEMALE');

  const { currentLanguage } = useAppState(
    useShallow((state) => ({
      currentLanguage: state.currentLanguage,
    })),
  );

  const t = (key: TranslationKey, params?: Params) =>
    trans(currentLanguage, key, params);

  useEffect(() => {
    if (audioResult) {
      const audioUrl = `data:${audioResult.mimeType};base64,${audioResult.audioContent}`;
      const newAudio = new Audio(audioUrl);
      setAudioPlayer(newAudio);

      newAudio.play().catch((playError) => {
        console.warn('Audio autoplay blocked or failed:', playError);
      });
    } else {
      if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
      }
      setAudioPlayer(null);
    }
  }, [audioResult]);

  const handleInitialQuestionSubmit = async (question: string) => {
    // Validate that tarot cards have been selected before proceeding
    if (!initialCards || initialCards.length === 0) {
      setError('Please select Tarot cards first.'); // String literal for error
      return;
    }

    setInitialQuestion(question);
    // Reset states before starting a new submission process
    setIsLoading(true);
    setError(null);
    setIsInvalidQuestion(false); // Reset invalid question state
    setInitialReadingInitiated(false); // Ensure input stays visible until reading is truly initiated

    await getInitialReading(question);
  };

  /**
   * Fetches the initial tarot reading from the server.
   * @param question The user's question for the reading.
   */
  const getInitialReading = async (question: string) => {
    setIsLoading(true);
    setError(null);
    setAudioResult(null);

    try {
      const result = await generateTarotReading(
        initialCards,
        question,
        currentLanguage,
        useAudio,
        voiceGender,
      );

      console.log('result from server action:', result);

      // Check if the server action returned an error
      if (result.error) {
        // --- NEW: Specific error handling for 'invalid_question' ---
        if (result.error === 'invalid_question') {
          setIsInvalidQuestion(true); // Set the specific invalid question state
          setError(
            'This question is not suitable for a Tarot reading. Please try rephrasing it to focus on your personal growth or current situation.',
          ); // String literal for specific invalid question UI message
        } else {
          setError(result.error); // For other errors, display the general error message
        }
        setInitialReadingInitiated(false); // Keep the input UI visible
      } else if (result.reading) {
        const parsedReading = JSON.parse(result.reading);
        if (parsedReading) setReading(parsedReading);

        if (result.audio) {
          setAudioResult(result.audio);
        }

        setInitialReadingInitiated(true); // Only initiate reading view if successful
      } else {
        // Fallback for unexpected successful response without reading text
        setError('Reading generated, but content is empty. Please try again.'); // String literal for empty content
        setInitialReadingInitiated(false);
      }
    } catch (err) {
      // Catch any network or unexpected errors
      setError('Failed to get initial reading. Please try again.'); // String literal for network error
      console.error('Error getting initial reading:', err);
      setInitialReadingInitiated(false); // Allow user to retry
    } finally {
      setIsLoading(false); // Always set loading state to false after the operation
    }
  };

  const handlePlayAgain = () => {
    if (audioPlayer) {
      audioPlayer.currentTime = 0;
      audioPlayer.play().catch((playError) => {
        console.error('Error replaying audio:', playError);
      });
    }
  };

  return (
    <Stack gap={3} className="col-md-5 mx-auto">
      {/* Display general errors at the top */}
      {error && <p className="text-danger">{error}</p>}

      {!initialReadingInitiated ? ( // If reading hasn't started yet (either pending or failed validation)
        <>
          {/* Audio/Text Selection */}
          <Form.Group>
            <Form.Label>Response Type:</Form.Label>
            <Form.Check
              type="radio"
              id="radio-text-only"
              label="Text Only"
              name="responseType"
              value="text"
              checked={!useAudio}
              onChange={() => {
                setUseAudio(false);
                setVoiceGender('FEMALE'); // Reset gender if switching to text only
              }}
            />
            <Form.Check
              type="radio"
              id="radio-text-audio"
              label="Text + Audio"
              name="responseType"
              value="audio"
              checked={useAudio}
              onChange={() => setUseAudio(true)}
            />
          </Form.Group>

          {/* Voice Gender Selection (conditionally displayed) */}
          {useAudio && (
            <Form.Group className="mt-2">
              <Form.Label>Voice Gender:</Form.Label>
              <Form.Check
                type="radio"
                id="radio-gender-female"
                label="Female"
                name="voiceGender"
                value="FEMALE"
                checked={voiceGender === 'FEMALE'}
                onChange={() => setVoiceGender('FEMALE')}
              />
              <Form.Check
                type="radio"
                id="radio-gender-male"
                label="Male"
                name="voiceGender"
                value="MALE"
                checked={voiceGender === 'MALE'}
                onChange={() => setVoiceGender('MALE')}
              />
            </Form.Group>
          )}

          <QuestionInput
            onQuestionSubmit={handleInitialQuestionSubmit}
            isLoading={isLoading}
            locale={currentLanguage}
          />

          {isInvalidQuestion && (
            <p className="text-info mt-3">
              Tarot helps you explore personal growth. Try asking about your
              challenges, opportunities, or what you can learn from a situation,
              rather than seeking fixed outcomes or simple yes/no answers.
            </p>
          )}
        </>
      ) : (
        // Once initial reading is initiated (and successfully generated)
        <>
          {error && <p className="text-danger">{error}</p>}{' '}
          {reading ? (
            <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
              <TextScroller>
                <TarotReadingDisplay readingData={reading} />
              </TextScroller>
              {audioResult && (
                <div className="mt-3">
                  <Button onClick={handlePlayAgain} disabled={isLoading}>
                    Play Audio Again
                  </Button>
                </div>
              )}
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
