// utils/textToSpeech.ts

import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { Locale } from '../types'; // Assuming Locale type is accessible from here

// Initialize Text-to-Speech client as a singleton
const textToSpeechClient = new TextToSpeechClient();

// Define the return type for your voice synthesis
export interface VoiceResult {
  audioContent: string; // Base64 encoded audio
  mimeType: string; // e.g., 'audio/mp3'
}

//TODO add name mapping for locales and male and female voices

/**
 * Generates audio from text using Google Cloud Text-to-Speech.
 * @param text The text to synthesize.
 * @param locale The locale to determine the voice.
 * @param gender The desired gender for the voice ('FEMALE', 'MALE', or 'NEUTRAL'). Defaults to 'NEUTRAL'.
 * @returns A Promise that resolves to VoiceResult containing Base64 audio content and mimeType, or null if an error occurs.
 */
export async function synthesizeSpeech(
  text: string,
  locale: Locale,
  gender: 'FEMALE' | 'MALE' = 'FEMALE',
): Promise<VoiceResult | null> {
  try {
    let languageCode = 'en-US';
    let name = 'en-US-Neural2-C'; // A common default, natural-sounding English voice

    // Customize voice based on locale
    // Note: The specific 'name' (voice ID) might also need to be adjusted based on desired gender.
    // For simplicity, we'll primarily use ssmlGender for the initial implementation.
    // For more control, you'd check available voices for 'languageCode' and 'gender' combinations.
    if (locale === 'pl') {
      languageCode = 'pl-PL';
      // Polish WaveNet-A is female. If 'MALE' is chosen, you'd pick a different Polish voice.
      name = 'pl-PL-Wavenet-A';
    } else {
      languageCode = 'en-US';
      // For English, Neural2-H is female. You could switch to Neural2-D for male, for example.
      // E.g., if (gender === 'MALE') name = 'en-US-Neural2-D'; else name = 'en-US-Neural2-H';
      name = 'en-US-Neural2-H';
    }

    const [response] = await textToSpeechClient.synthesizeSpeech({
      input: { text: text },
      voice: {
        languageCode: languageCode,
        name: name,
        ssmlGender: gender, // <-- USING THE NEW GENDER PARAMETER
      },
      audioConfig: { audioEncoding: 'MP3' },
    });

    if (response.audioContent instanceof Buffer) {
      return {
        audioContent: response.audioContent.toString('base64'),
        mimeType: 'audio/mp3',
      };
    } else {
      console.error('Audio content is not a Buffer, cannot convert to Base64.');
      return null;
    }
  } catch (error) {
    console.error('Error synthesizing speech:', error);
    return null;
  }
}
