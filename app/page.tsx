'use client';
import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../lib/store';
import SettingsModal from '../components/SettingsModal';
import FileDropzone from '../components/FileDropzone';
import Footer from '../components/Footer';
import { Settings, Download, Copy, Type, File as FileIcon, Loader2 } from 'lucide-react';

export default function Home() {
  const store = useAppStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [mode, setMode] = useState<'text' | 'file'>('file');
  const [activeTab, setActiveTab] = useState<'input' | 'output'>('input');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(new URL('../workers/conversionWorker.ts', import.meta.url));
    
    workerRef.current.onmessage = (e) => {
      const { type, payload } = e.data;
      if (type === 'CONVERT_TEXT_SUCCESS') {
        setOutputText(payload);
        setIsProcessing(false);
      } else if (type === 'CONVERT_DOCX_SUCCESS') {
        // Download blob
        const url = URL.createObjectURL(payload);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'converted.docx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsProcessing(false);
      } else if (type === 'ERROR') {
        alert('Error: ' + payload);
        setIsProcessing(false);
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  // Debounced text conversion
  useEffect(() => {
    if (mode === 'text' && inputText) {
      setIsProcessing(true);
      const timer = setTimeout(() => {
        workerRef.current?.postMessage({
          type: 'CONVERT_TEXT',
          payload: { 
            text: inputText, 
            direction: store.direction,
            useAi: store.isAiCorrectionEnabled,
            aiProvider: store.activeProvider,
            apiKeys: { groq: store.groqKey, gemini: store.geminiKey, mistral: store.mistralKey }
          }
        });
      }, 500);
      return () => clearTimeout(timer);
    } else if (!inputText) {
      setOutputText('');
    }
  }, [inputText, store.direction, store.isAiCorrectionEnabled, store.activeProvider, store.groqKey, store.geminiKey, store.mistralKey, mode]);

  const handleFileSelect = (file: File) => {
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result;
      workerRef.current?.postMessage({
        type: 'CONVERT_DOCX',
        payload: { 
          fileData: arrayBuffer, 
          direction: store.direction,
          useAi: store.isAiCorrectionEnabled,
          aiProvider: store.activeProvider,
          apiKeys: { groq: store.groqKey, gemini: store.geminiKey, mistral: store.mistralKey }
        }
      });
    };
    reader.readAsArrayBuffer(file);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputText);
  };
  
  const downloadText = () => {
    const blob = new Blob([outputText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] font-sans text-[#2D2A26]">
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#F2EFE9] bg-[#FCFAF5] sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <img src="/shobdo-logo.webp" alt="Shobdo Logo" className="max-h-12 sm:max-h-16 w-auto object-contain" onError={(e) => e.currentTarget.style.display='none'} />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-[#F2EFE9] rounded-lg p-1">
            <button 
              onClick={() => setMode('file')} 
              className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 transition-all ${mode === 'file' ? 'bg-[#FFFFFF] shadow-sm text-red-600' : 'text-[#8C877D] hover:text-[#2D2A26]'}`}
            >
              <FileIcon className="w-4 h-4" /> <span className="hidden sm:inline">Document</span>
            </button>
            <button 
              onClick={() => setMode('text')} 
              className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 transition-all ${mode === 'text' ? 'bg-[#FFFFFF] shadow-sm text-red-600' : 'text-[#8C877D] hover:text-[#2D2A26]'}`}
            >
              <Type className="w-4 h-4" /> <span className="hidden sm:inline">Text</span>
            </button>
          </div>
          
          <a 
            href="https://github.com/Mahatir-Ahmed-Tusher/shobdo" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center text-[#8C877D] hover:text-red-600 transition-colors"
            title="Source Code"
          >
            <img src="https://i.postimg.cc/5y9SGsT3/image.png" alt="GitHub" className="w-6 h-6 object-contain" />
          </a>

          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-[#8C877D] hover:bg-[#F2EFE9] hover:text-red-600 rounded-full transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 lg:p-6 max-w-[1600px] w-full mx-auto flex flex-col h-[calc(100vh-4rem-4rem)]">
        
        {/* Toolbar */}
        <div className="mb-4 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-2 bg-[#FDFBF7] border border-[#F2EFE9] rounded-lg p-1.5 shadow-sm">
            <button 
              onClick={() => store.setDirection('auto')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${store.direction === 'auto' ? 'bg-[#FFFFFF] shadow-sm text-red-600' : 'text-[#8C877D] hover:text-[#2D2A26]'}`}
            >
              Auto Detect
            </button>
            <button 
              onClick={() => store.setDirection('bijoy-to-unicode')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${store.direction === 'bijoy-to-unicode' ? 'bg-[#FFFFFF] shadow-sm text-red-600' : 'text-[#8C877D] hover:text-[#2D2A26]'}`}
            >
              Bijoy to Unicode
            </button>
            <button 
              onClick={() => store.setDirection('unicode-to-bijoy')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${store.direction === 'unicode-to-bijoy' ? 'bg-[#FFFFFF] shadow-sm text-red-600' : 'text-[#8C877D] hover:text-[#2D2A26]'}`}
            >
              Unicode to Bijoy
            </button>
          </div>
          
          <div className="flex items-center gap-3">
             <label className="flex items-center gap-2 text-sm font-medium cursor-pointer hover:text-red-600 transition-colors">
              <input 
                type="checkbox" 
                checked={store.isAiCorrectionEnabled}
                onChange={(e) => store.setAiCorrectionEnabled(e.target.checked)}
                className="rounded border-[#F2EFE9] text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer accent-red-600"
              />
              Enable AI Correction
            </label>
          </div>
        </div>

        {mode === 'text' && (
          <div className="lg:hidden flex mb-4 bg-[#F2EFE9] rounded-lg p-1">
            <button 
              onClick={() => setActiveTab('input')}
              className={`flex-1 py-2 text-sm font-medium rounded-md ${activeTab === 'input' ? 'bg-[#FFFFFF] shadow-sm text-red-600' : 'text-[#8C877D]'}`}
            >
              Input
            </button>
            <button 
              onClick={() => setActiveTab('output')}
              className={`flex-1 py-2 text-sm font-medium rounded-md ${activeTab === 'output' ? 'bg-[#FFFFFF] shadow-sm text-red-600' : 'text-[#8C877D]'}`}
            >
              Output
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 flex gap-4 min-h-0">
          {mode === 'file' ? (
             <div className="flex-1 flex flex-col items-center justify-center bg-[#FFFFFF] rounded-xl border border-[#F2EFE9] p-8 shadow-sm">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold">Document Converter</h2>
                  <p className="text-[#8C877D] mt-2 max-w-lg mx-auto">
                    Securely convert your .docx files between Bijoy and Unicode entirely in your browser.
                  </p>
                </div>
                <div className="w-full max-w-xl">
                  <FileDropzone onFileSelect={handleFileSelect} isProcessing={isProcessing} />
                </div>
             </div>
          ) : (
            <>
              {/* Input Pane */}
              <div className={`flex-1 flex flex-col bg-[#FFFFFF] rounded-xl border border-[#F2EFE9] overflow-hidden shadow-sm ${activeTab === 'output' ? 'hidden lg:flex' : 'flex'}`}>
                <div className="p-3 border-b border-[#F2EFE9] flex justify-between items-center bg-[#FCFAF5]">
                  <span className="text-sm font-medium text-[#8C877D] uppercase tracking-wider">Input Text</span>
                  <span className="text-xs text-[#8C877D]">{inputText.length} chars</span>
                </div>
                <textarea 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type or paste Bengali text here..."
                  className="flex-1 p-4 resize-none outline-none bg-transparent w-full font-serif text-lg leading-relaxed focus:ring-2 focus:ring-inset focus:ring-red-500/20"
                  lang="bn"
                />
              </div>

              {/* Output Pane */}
              <div className={`flex-1 flex flex-col bg-[#FFFFFF] rounded-xl border border-[#F2EFE9] overflow-hidden shadow-sm ${activeTab === 'input' ? 'hidden lg:flex' : 'flex'}`}>
                <div className="p-3 border-b border-[#F2EFE9] flex justify-between items-center bg-[#FCFAF5]">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#8C877D] uppercase tracking-wider">Converted Result</span>
                    {isProcessing && <Loader2 className="w-4 h-4 animate-spin text-red-600" />}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={copyToClipboard} className="p-1.5 text-[#8C877D] hover:text-red-600 hover:bg-[#F2EFE9] rounded transition-colors" title="Copy">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button onClick={downloadText} className="p-1.5 text-[#8C877D] hover:text-red-600 hover:bg-[#F2EFE9] rounded transition-colors" title="Download">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 p-4 overflow-y-auto w-full font-serif text-lg leading-relaxed whitespace-pre-wrap selection:bg-red-200" lang="bn">
                  {outputText}
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
