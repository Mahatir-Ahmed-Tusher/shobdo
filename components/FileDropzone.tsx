'use client';
import { useCallback } from 'react';
import { UploadCloud, FileType2 } from 'lucide-react';

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export default function FileDropzone({ onFileSelect, isProcessing }: FileDropzoneProps) {
  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (isProcessing) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.docx')) {
        onFileSelect(file);
      } else {
        alert('Please drop a .docx file.');
      }
    }
  }, [onFileSelect, isProcessing]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div 
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors
        ${isProcessing ? 'border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50 opacity-60 cursor-not-allowed' : 'border-blue-300 bg-blue-50/50 hover:bg-blue-50 dark:border-blue-900 dark:bg-blue-900/10 dark:hover:bg-blue-900/20 cursor-pointer'}`}
    >
      <input 
        type="file" 
        id="file-upload" 
        accept=".docx" 
        className="hidden" 
        onChange={onChange}
        disabled={isProcessing}
      />
      <label htmlFor="file-upload" className={isProcessing ? 'cursor-not-allowed' : 'cursor-pointer'}>
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-white dark:bg-zinc-800 rounded-full shadow-sm">
            <UploadCloud className="w-8 h-8 text-blue-500" />
          </div>
          <div>
            <p className="text-lg font-medium">
              {isProcessing ? 'Converting document...' : 'Drop your .docx file here'}
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              or click to browse
            </p>
          </div>
        </div>
      </label>
    </div>
  );
}
