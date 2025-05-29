import readPageTranslations from '../app/[lang]/read/readPageTranslations';
import cardsTranslations from './cardsTranslations';
import homePageTranslations from './homePageTranslations';

const translations = {
  ...cardsTranslations,
  ...homePageTranslations,
  ...readPageTranslations,
} as const;

export default translations;
