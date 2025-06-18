import { i18n } from './i18n-config';
import translations from './translations/translations';
import { ALL_TAROT_CARD_NAMES } from './utils/cardsInfo';

export type TarotCardName = (typeof ALL_TAROT_CARD_NAMES)[number];

export type TranslationKey = keyof typeof translations;

export type Locale = (typeof i18n)['locales'][number];

export type TranslationsEntry = {
  [K in Locale]: string;
};

export type TranslationObject = Record<string, TranslationsEntry>;

export interface TarotReadingResponse {
  introduction: string;
  cardsInterpretation: Array<{
    cardName: string;
    position: string;
    interpretation: string;
  }>;
  overallSynthesis: string;
  actionableSummary: {
    intro: string;
    points: string[];
  };
  conclusion: string;
}
