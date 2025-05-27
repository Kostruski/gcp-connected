import translations from './translations/translations';
import { ALL_TAROT_CARD_NAMES } from './utils/cardsInfo';

export type TarotCardName = (typeof ALL_TAROT_CARD_NAMES)[number];

export type TranslationKey = keyof typeof translations;

export type LanguageCode = keyof (typeof translations)['0_fool'];

export type TranslationsEntry = {
  [K in LanguageCode]: string;
};

export type TranslationObject = Record<TranslationKey, TranslationsEntry>;
