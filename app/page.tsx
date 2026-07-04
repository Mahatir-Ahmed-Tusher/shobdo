'use client';
import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../lib/store';
import SettingsModal from '../components/SettingsModal';
import FileDropzone from '../components/FileDropzone';
import { Settings, File as FileIcon } from 'lucide-react';

export default function Home() {
  const store = useAppStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(new URL('../workers/conversionWorker.ts', import.meta.url));
    
    workerRef.current.onmessage = (e) => {
      const { type, payload } = e.data;
      if (type === 'CONVERT_DOCX_SUCCESS') {
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

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 font-sans">
      <header className="h-16 flex items-center justify-between px-6 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <img src="/shobdo-logo.webp" alt="Shobdo Logo" className="w-8 h-8 rounded" onError={(e) => e.currentTarget.style.display='none'} />
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Shobdo</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors ml-2"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 lg:p-6 max-w-4xl w-full mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        
        <div className="w-full bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 lg:p-12">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl mb-4 text-blue-600 dark:text-blue-400">
              <FileIcon className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Document Converter</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2 max-w-lg mx-auto">
              Securely convert your .docx files between Bijoy and Unicode entirely in your browser.
            </p>
          </div>

          <div className="mb-8 flex flex-wrap gap-4 items-center justify-center">
            <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1.5 inline-flex">
              <button 
                onClick={() => store.setDirection('auto')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${store.direction === 'auto' ? 'bg-white shadow-sm text-blue-700 dark:bg-zinc-800 dark:text-blue-400' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'}`}
              >
                Auto Detect
              </button>
              <button 
                onClick={() => store.setDirection('bijoy-to-unicode')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${store.direction === 'bijoy-to-unicode' ? 'bg-white shadow-sm text-blue-700 dark:bg-zinc-800 dark:text-blue-400' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'}`}
              >
                Bijoy to Unicode
              </button>
              <button 
                onClick={() => store.setDirection('unicode-to-bijoy')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${store.direction === 'unicode-to-bijoy' ? 'bg-white shadow-sm text-blue-700 dark:bg-zinc-800 dark:text-blue-400' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'}`}
              >
                Unicode to Bijoy
              </button>
            </div>
          </div>
          
          <FileDropzone onFileSelect={handleFileSelect} isProcessing={isProcessing} />
          
        </div>
        
      </main>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
