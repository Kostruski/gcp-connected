import { LanguageCode, TranslationKey } from '../types';
import translations from './translations';

type Params = Record<string, string>;

function translate(
  currentLanguage: LanguageCode,
  key: TranslationKey,
  params: Params = {},
): string {
  const textObject = translations[key];

  if (!textObject) {
    console.warn(`Translation key "${key}" not found.`);
    return key; // Fallback: return the key itself
  }

  let translatedText = textObject[currentLanguage] as string;

  if (translatedText === undefined) {
    console.warn(
      `Translation for key "${key}" in language "${currentLanguage}" not found. Falling back to English.`,
    );
    translatedText = textObject['en'] || key; // Fallback to English, or key if English is also missing
  }

  // Handle placeholders (interpolation)
  for (const paramKey in params) {
    if (Object.prototype.hasOwnProperty.call(params, paramKey)) {
      translatedText = translatedText.replace(
        new RegExp(`\\{${paramKey}\\}`, 'g'),
        params[paramKey],
      );
    }
  }

  return translatedText;
}

export default translate;
