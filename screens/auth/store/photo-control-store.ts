import { create } from 'zustand';

interface PhotoControlState {
  photoUri: string | null;
  setPhotoUri: (photoUri: string | null) => void;
  clearPhotoUri: () => void;
}

export const usePhotoControlStore = create<PhotoControlState>((set) => ({
  photoUri: null,
  setPhotoUri: (photoUri) => set({ photoUri }),
  clearPhotoUri: () => set({ photoUri: null }),
}));
