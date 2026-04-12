import { create } from 'zustand';

interface PreAuthOnboardingState {
  name: string;
  email: string;
  password: string;
  referralCode: string;
  setCredentials: (payload: { name: string; email: string; password: string; referralCode?: string | null }) => void;
  clearCredentials: () => void;
}

const initialState = {
  name: '',
  email: '',
  password: '',
  referralCode: '',
};

export const usePreAuthOnboardingStore = create<PreAuthOnboardingState>((set) => ({
  ...initialState,
  setCredentials: ({ name, email, password, referralCode }) =>
    set({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      referralCode: referralCode?.trim().toUpperCase() ?? '',
    }),
  clearCredentials: () => set(initialState),
}));
