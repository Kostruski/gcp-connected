'use client';

import { useState, useEffect } from 'react'; // Import useEffect

import QuestionInput from '../auth-ui/question-input/question-input';

import Stack from 'react-bootstrap/Stack';
import Spinner from 'react-bootstrap/Spinner';
import Form from 'react-bootstrap/Form'; // Import Form for radio buttons
import Button from 'react-bootstrap/Button'; // Import Button for play again

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
  const [reading, setReading] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialReadingInitiated, setInitialReadingInitiated] = useState(false);
  const [audioResult, setAudioResult] = useState<VoiceResult | null>(null); // State to store audio data
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null); // State for audio player instance

  // New state for audio options
  const [useAudio, setUseAudio] = useState(false); // Default to text only
  const [voiceGender, setVoiceGender] = useState<'FEMALE' | 'MALE'>('FEMALE'); // Default gender

  const { currentLanguage } = useAppState(
    useShallow((state) => ({
      currentLanguage: state.currentLanguage,
    })),
  );

  const t = (key: TranslationKey, params?: Params) =>
    trans(currentLanguage, key, params);

  // Effect to handle automatic audio playback when audioResult changes
  useEffect(() => {
    if (audioResult) {
      const audioUrl = `data:${audioResult.mimeType};base64,${audioResult.audioContent}`;
      const newAudio = new Audio(audioUrl);
      setAudioPlayer(newAudio); // Store the audio player instance

      newAudio.play().catch((playError) => {
        // This catch handles cases where autoplay is blocked by the browser.
        // Users might need to explicitly click a play button.
        console.warn('Audio autoplay blocked or failed:', playError);
        // You might want to show a UI message here like "Click to play audio"
      });
    } else {
      // If audioResult is cleared, stop and clear any existing player
      if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
      }
      setAudioPlayer(null);
    }
  }, [audioResult]); // Re-run when audioResult changes

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
    setAudioResult(null); // Clear previous audio result

    try {
      // Call the server action to generate the tarot reading
      const result = await generateTarotReading(
        initialCards,
        question,
        currentLanguage,
        useAudio, // Pass the user's audio preference
        voiceGender, // Pass the user's voice gender preference
      );

      console.log('result from server action:', result);

      // Check if the server action returned an error
      if (result.error) {
        setError(result.error); // Set the error message
        setInitialReadingInitiated(false); // Allow user to retry by showing the input again
      } else if (result.reading) {
        setReading(result.reading); // Set the received reading
        if (result.audio) {
          setAudioResult(result.audio); // Store the audio result if available
        }
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

  const handlePlayAgain = () => {
    if (audioPlayer) {
      audioPlayer.currentTime = 0; // Rewind to start
      audioPlayer.play().catch((playError) => {
        console.error('Error replaying audio:', playError);
      });
    }
  };

  return (
    <Stack gap={3} className="col-md-5 mx-auto">
      {!initialReadingInitiated ? (
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
        </>
      ) : (
        <>
          {error && <p className="text-danger">{error}</p>}

          {reading ? (
            <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
              <p className="whitespace-pre-wrap">{reading}</p>
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
