import { create } from 'zustand';

type CountryControlStore = {
  countryName: string;
  setCountryName: (countryName: string) => void;
  getCountryName: () => string;
  reset: () => void;
};

const initialCountryName = 'Nigeria';

export const useCountryControlStore = create<CountryControlStore>(
  (set, get) => ({
    countryName: initialCountryName,
    setCountryName: countryName => set({ countryName }),
    getCountryName: () => get().countryName,
    reset: () => set({ countryName: initialCountryName }),
  }),
);
