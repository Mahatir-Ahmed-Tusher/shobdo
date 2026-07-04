import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LLMProvider = 'mistral' | 'gemini' | 'groq';

interface AppState {
  mistralKey: string;
  geminiKey: string;
  groqKey: string;
  activeProvider: LLMProvider | 'auto';
  
  setMistralKey: (key: string) => void;
  setGeminiKey: (key: string) => void;
  setGroqKey: (key: string) => void;
  setActiveProvider: (provider: LLMProvider | 'auto') => void;
  
  isAiCorrectionEnabled: boolean;
  setAiCorrectionEnabled: (enabled: boolean) => void;

  direction: 'auto' | 'bijoy-to-unicode' | 'unicode-to-bijoy';
  setDirection: (direction: 'auto' | 'bijoy-to-unicode' | 'unicode-to-bijoy') => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      mistralKey: '',
      geminiKey: '',
      groqKey: '',
      activeProvider: 'auto',
      
      setMistralKey: (key) => set({ mistralKey: key }),
      setGeminiKey: (key) => set({ geminiKey: key }),
      setGroqKey: (key) => set({ groqKey: key }),
      setActiveProvider: (provider) => set({ activeProvider: provider }),
      
      isAiCorrectionEnabled: false,
      setAiCorrectionEnabled: (enabled) => set({ isAiCorrectionEnabled: enabled }),
      
      direction: 'auto',
      setDirection: (direction) => set({ direction }),
    }),
    {
      name: 'shobdo-storage',
    }
  )
);
