import { X } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function InfoModal({ isOpen, onClose, title, children }: InfoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-[#FFFFFF] rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-xl flex flex-col border border-[#F2EFE9] text-[#2D2A26]">
        <div className="p-4 border-b border-[#F2EFE9] flex justify-between items-center bg-[#FCFAF5] rounded-t-2xl">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-[#F2EFE9] rounded-full transition-colors text-[#8C877D] hover:text-red-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto font-sans leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}
