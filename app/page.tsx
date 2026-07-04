'use client';
import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../lib/store';
import SettingsModal from '../components/SettingsModal';
import FileDropzone from '../components/FileDropzone';
import DiffReviewer from '../components/DiffReviewer';
import { Settings, Download, Copy, ArrowRightLeft, Type, File as FileIcon, Loader2, Play } from 'lucide-react';

export default function Home() {
  const store = useAppStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [mode, setMode] = useState<'text' | 'file'>('text');
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
          payload: { text: inputText, direction: store.direction }
        });
      }, 300);
      return () => clearTimeout(timer);
    } else if (!inputText) {
      setOutputText('');
    }
  }, [inputText, store.direction, mode]);

  const handleFileSelect = (file: File) => {
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result;
      workerRef.current?.postMessage({
        type: 'CONVERT_DOCX',
        payload: { fileData: arrayBuffer, direction: store.direction }
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
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 font-sans">
      <header className="h-16 flex items-center justify-between px-6 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <img src="/shobdo-logo.webp" alt="Shobdo Logo" className="w-8 h-8 rounded" onError={(e) => e.currentTarget.style.display='none'} />
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Shobdo</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
            <button 
              onClick={() => setMode('text')} 
              className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 transition-all ${mode === 'text' ? 'bg-white dark:bg-zinc-700 shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}
            >
              <Type className="w-4 h-4" /> Text
            </button>
            <button 
              onClick={() => setMode('file')} 
              className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 transition-all ${mode === 'file' ? 'bg-white dark:bg-zinc-700 shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}
            >
              <FileIcon className="w-4 h-4" /> Document
            </button>
          </div>
          
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors ml-2"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 lg:p-6 max-w-[1600px] w-full mx-auto flex flex-col h-[calc(100vh-4rem)]">
        
        {/* Toolbar */}
        <div className="mb-4 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1">
            <button 
              onClick={() => store.setDirection('auto')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${store.direction === 'auto' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'text-zinc-600 dark:text-zinc-400'}`}
            >
              Auto Detect
            </button>
            <button 
              onClick={() => store.setDirection('bijoy-to-unicode')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${store.direction === 'bijoy-to-unicode' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'text-zinc-600 dark:text-zinc-400'}`}
            >
              Bijoy to Unicode
            </button>
            <button 
              onClick={() => store.setDirection('unicode-to-bijoy')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${store.direction === 'unicode-to-bijoy' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'text-zinc-600 dark:text-zinc-400'}`}
            >
              Unicode to Bijoy
            </button>
          </div>
          
          <div className="flex items-center gap-3">
             <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input 
                type="checkbox" 
                checked={store.isAiCorrectionEnabled}
                onChange={(e) => store.setAiCorrectionEnabled(e.target.checked)}
                className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
              />
              Enable AI Correction
            </label>
          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="lg:hidden flex mb-4 bg-zinc-200 dark:bg-zinc-800 rounded-lg p-1">
          <button 
            onClick={() => setActiveTab('input')}
            className={`flex-1 py-2 text-sm font-medium rounded-md ${activeTab === 'input' ? 'bg-white dark:bg-zinc-700 shadow-sm' : 'text-zinc-500'}`}
          >
            Input
          </button>
          <button 
            onClick={() => setActiveTab('output')}
            className={`flex-1 py-2 text-sm font-medium rounded-md ${activeTab === 'output' ? 'bg-white dark:bg-zinc-700 shadow-sm' : 'text-zinc-500'}`}
          >
            Output
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex gap-4 min-h-0">
          {mode === 'file' ? (
             <div className="flex-1 flex items-center justify-center bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm">
                <div className="w-full max-w-xl">
                  <FileDropzone onFileSelect={handleFileSelect} isProcessing={isProcessing} />
                </div>
             </div>
          ) : (
            <>
              {/* Input Pane */}
              <div className={`flex-1 flex flex-col bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm ${activeTab === 'output' ? 'hidden lg:flex' : 'flex'}`}>
                <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
                  <span className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Input Text</span>
                  <span className="text-xs text-zinc-400">{inputText.length} chars</span>
                </div>
                <textarea 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type or paste Bengali text here..."
                  className="flex-1 p-4 resize-none outline-none bg-transparent w-full font-serif text-lg leading-relaxed"
                  lang="bn"
                />
              </div>

              {/* Output Pane */}
              <div className={`flex-1 flex flex-col bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm ${activeTab === 'input' ? 'hidden lg:flex' : 'flex'}`}>
                <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Converted Result</span>
                    {isProcessing && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={copyToClipboard} className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors" title="Copy">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button onClick={downloadText} className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors" title="Download">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 p-4 overflow-y-auto w-full font-serif text-lg leading-relaxed whitespace-pre-wrap" lang="bn">
                  {outputText}
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
