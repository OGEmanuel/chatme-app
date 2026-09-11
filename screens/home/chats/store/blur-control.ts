import { create } from 'zustand';

type BlurControlStore = {
  blurView: boolean;
  setBlurView: (blurView: boolean) => void;
};

export const useBlurControlStore = create<BlurControlStore>(set => ({
  blurView: false,
  setBlurView: blurView => set({ blurView }),
}));
