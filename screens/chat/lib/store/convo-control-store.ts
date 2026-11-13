import { create } from 'zustand';
import { ConversationResponse } from '../queries/types';

type ConvoControlStoreType = {
  convoResponse: ConversationResponse | null;
  setConvoResponse: (data: ConversationResponse) => void;
  clear: () => void;
};

export const useConvoControlStore = create<ConvoControlStoreType>(set => ({
  convoResponse: null,
  setConvoResponse: data => set({ convoResponse: data }),
  clear: () => set({ convoResponse: null }),
}));
