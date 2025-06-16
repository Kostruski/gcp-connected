import readPageTranslations from '../app/[lang]/read/readPageTranslations';
import cardsTranslations from './cardsTranslations';
import homePageTranslations from './homePageTranslations';
import { tarotReadingPrompts } from './tarotReadingPrompts';

// do not put all translations together
const translations = {
  ...cardsTranslations,
  ...homePageTranslations,
  ...readPageTranslations,
  ...tarotReadingPrompts,
} as const;

export default translations;
