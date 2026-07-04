'use client';
import { useState } from 'react';
import { useAppStore, LLMProvider } from '../lib/store';
import { X } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const store = useAppStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-[#FFFFFF] rounded-2xl w-full max-w-lg shadow-xl overflow-hidden border border-[#F2EFE9] text-[#2D2A26]">
        <div className="p-4 border-b border-[#F2EFE9] flex justify-between items-center bg-[#FCFAF5]">
          <h2 className="text-xl font-semibold">Settings</h2>
          <button onClick={onClose} className="p-2 hover:bg-[#F2EFE9] rounded-full transition-colors text-[#8C877D]">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-[#8C877D] uppercase tracking-wider">AI Provider & API Keys</h3>
            
            <div>
              <label className="block text-sm font-medium mb-1">Active Model</label>
              <select 
                value={store.activeProvider}
                onChange={(e) => store.setActiveProvider(e.target.value as LLMProvider | 'auto')}
                className="w-full bg-[#FDFBF7] border border-[#E6E3DD] rounded-lg p-2.5 text-sm outline-none focus:border-[#8C877D] transition-colors"
              >
                <option value="auto">Auto-detect from key</option>
                <option value="groq">Llama 3 (via Groq) - recommended</option>
                <option value="mistral">Mistral Small</option>
                <option value="gemini">Gemini 2.5 Flash</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Groq API Key (gsk_...)</label>
              <input 
                type="password" 
                value={store.groqKey}
                onChange={(e) => store.setGroqKey(e.target.value)}
                placeholder="gsk_..."
                className="w-full bg-[#FDFBF7] border border-[#E6E3DD] rounded-lg p-2.5 text-sm outline-none focus:border-[#8C877D] transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Gemini API Key (AIza...)</label>
              <input 
                type="password" 
                value={store.geminiKey}
                onChange={(e) => store.setGeminiKey(e.target.value)}
                placeholder="AIza..."
                className="w-full bg-[#FDFBF7] border border-[#E6E3DD] rounded-lg p-2.5 text-sm outline-none focus:border-[#8C877D] transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Mistral API Key</label>
              <input 
                type="password" 
                value={store.mistralKey}
                onChange={(e) => store.setMistralKey(e.target.value)}
                placeholder="..."
                className="w-full bg-[#FDFBF7] border border-[#E6E3DD] rounded-lg p-2.5 text-sm outline-none focus:border-[#8C877D] transition-colors"
              />
            </div>
          </div>
          
          <div className="text-xs text-[#8C877D]">
            Keys are saved locally in your browser and sent securely only during conversion. No keys or content are stored on our servers permanently.
          </div>
        </div>
      </div>
    </div>
  );
}
