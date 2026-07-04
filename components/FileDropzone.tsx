'use client';
import React, { useCallback, useState } from 'react';
import { UploadCloud, File as FileIcon } from 'lucide-react';

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export default function FileDropzone({ onFileSelect, isProcessing }: FileDropzoneProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (isProcessing) return;
    
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.docx')) {
      setSelectedFile(file);
    } else {
      alert('Please upload a .docx file');
    }
  }, [isProcessing]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isProcessing) return;
    
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.docx')) {
      setSelectedFile(file);
    }
  };

  const handleConvert = () => {
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div 
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className={`w-full border-2 border-dashed rounded-xl p-8 text-center transition-colors
          ${isProcessing ? 'border-[#E6E3DD] bg-[#FCFAF5] opacity-60 cursor-not-allowed' : 'border-[#D6D3CD] bg-[#FDFBF7] hover:bg-[#FFFFFF] cursor-pointer'}`}
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
            <div className="p-4 bg-[#FFFFFF] rounded-full shadow-sm border border-[#F2EFE9]">
              {selectedFile ? <FileIcon className="w-8 h-8 text-red-600" /> : <UploadCloud className="w-8 h-8 text-[#8C877D]" />}
            </div>
            <div>
              <p className="text-lg font-medium text-[#2D2A26]">
                {isProcessing ? 'Converting document...' : selectedFile ? selectedFile.name : 'Drop your .docx file here'}
              </p>
              <p className="text-sm text-[#8C877D] mt-1">
                {selectedFile ? 'Ready to convert' : 'or click to browse'}
              </p>
            </div>
          </div>
        </label>
      </div>

      {selectedFile && !isProcessing && (
        <button
          onClick={handleConvert}
          className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-sm transition-colors"
        >
          Convert Document
        </button>
      )}
    </div>
  );
}
