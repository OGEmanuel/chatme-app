import { clsx, type ClassValue } from 'clsx';
import { Dimensions } from 'react-native';
import { twMerge } from 'tailwind-merge';
import countries from 'world-countries';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getFullWidth = () => {
  return Dimensions.get('window').width;
};

export const getCallingCode = (root: string, suffixes: string[]) => {
  const callingCode = `${root}${suffixes[0] ?? ''}`;

  return callingCode;
};

export const filterByCountryName = (countryName: string) => {
  return countries.filter(country => country.name.common === countryName);
};
