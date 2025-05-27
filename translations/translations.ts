import cardsTranslations from './cardsTranslations';
import homePageTranslations from './homePageTranslations';

const translations = {
  ...cardsTranslations,
  ...homePageTranslations
} as const;

export default translations;
