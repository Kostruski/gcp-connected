import { User } from '@firebase/auth';
import { create } from 'zustand/react';
import { LanguageCode } from '../types';

interface State {
  currentUser: null | User;
  setCurrentUser: (user: User | null) => void;
  currentLanguage: LanguageCode;
  setCurrentLanguage: (lang: LanguageCode) => void;
}

const useAppState = create<State>()((set) => ({
  currentUser: null,
  setCurrentUser: (user) => set(() => ({ currentUser: user })),
  currentLanguage: 'en',
  setCurrentLanguage: (lang) => set(() => ({ currentLanguage: lang })),
}));

export default useAppState;
