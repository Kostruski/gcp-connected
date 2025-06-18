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
 * Generates audio from SSML using Google Cloud Text-to-Speech.
 * This function assumes the `text` parameter *always* contains SSML.
 *
 * @param ssmlText The SSML to synthesize (must include <speak> tags).
 * @param locale The locale to determine the voice.
 * @param gender The desired gender for the voice ('FEMALE', 'MALE', or 'NEUTRAL'). Defaults to 'FEMALE'.
 * @returns A Promise that resolves to VoiceResult containing Base64 audio content and mimeType, or null if an error occurs.
 */
export async function synthesizeSpeech(
  ssmlText: string, // Renamed to clarify it's always SSML
  locale: Locale,
  gender: 'FEMALE' | 'MALE' = 'FEMALE',
): Promise<VoiceResult | null> {
  try {
    let languageCode = 'en-GB';
    let name = 'en-GB-Standard-C'; // A common default, natural-sounding English voice

    // Customize voice based on locale
    if (locale === 'pl') {
      languageCode = 'pl-PL';
      name = 'pl-PL-Standard-F'; // Polish WaveNet-A is female.
    } else {
      languageCode = 'en-GB';
      name = 'en-GB-Standard-C'; // For English, Neural2-H is female.
    }

    const [response] = await textToSpeechClient.synthesizeSpeech({
      input: { ssml: ssmlText }, // <-- ALWAYS USE SSML INPUT HERE
      voice: {
        languageCode: languageCode,
        name: name,
        ssmlGender: gender,
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
