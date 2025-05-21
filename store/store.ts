import { User } from '@firebase/auth';
import { create } from 'zustand/react';


interface State {
  currentUser: null | User;
  setCurrentUser: (user: User | null) => void;
}

const useStore = create<State>()((set) => ({
  currentUser: null,
  setCurrentUser: (user) => set(() => ({ currentUser: user })),
}));

export default useStore;
