import translations from './lang';

type CurrentLanguageType = 'en'; // add more later
type TranslationKey = keyof typeof translations;
type Params = Record<string, string>;

function translate(
  currentLanguage: CurrentLanguageType,
  key: TranslationKey,
  params: Params = {},
): string {
  const textObject = translations[key];

  if (!textObject) {
    console.warn(`Translation key "${key}" not found.`);
    return key; // Fallback: return the key itself
  }

  let translatedText = textObject[currentLanguage];

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
