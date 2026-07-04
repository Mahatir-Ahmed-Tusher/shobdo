'use client';
import { Check, X } from 'lucide-react';

interface Diff {
  original: string;
  proposed: string;
  isAccepted: boolean;
}

interface DiffReviewerProps {
  diffs: Diff[];
  onAccept: (index: number) => void;
  onReject: (index: number) => void;
  onAcceptAll: () => void;
}

export default function DiffReviewer({ diffs, onAccept, onReject, onAcceptAll }: DiffReviewerProps) {
  if (diffs.length === 0) return null;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden flex flex-col h-full max-h-full">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
        <div>
          <h3 className="font-medium text-sm">AI Corrections Review</h3>
          <p className="text-xs text-zinc-500">{diffs.length} suggestions</p>
        </div>
        <button 
          onClick={onAcceptAll}
          className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors font-medium"
        >
          Accept All
        </button>
      </div>
      
      <div className="overflow-y-auto flex-1 p-4 space-y-4">
        {diffs.map((diff, i) => (
          <div key={i} className="flex gap-4 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-100 dark:border-zinc-800">
            <div className="flex-1 space-y-2">
              <div className="text-sm">
                <span className="text-xs text-red-500 font-medium uppercase tracking-wider block mb-1">Original</span>
                <span className="line-through text-zinc-500 decoration-red-500/50">{diff.original}</span>
              </div>
              <div className="text-sm">
                <span className="text-xs text-green-500 font-medium uppercase tracking-wider block mb-1">Proposed</span>
                <span className="text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-1 rounded">{diff.proposed}</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 justify-center border-l border-zinc-200 dark:border-zinc-700 pl-4">
              <button 
                onClick={() => onAccept(i)}
                disabled={diff.isAccepted}
                className={`p-2 rounded-full transition-colors ${diff.isAccepted ? 'bg-green-100 text-green-600 dark:bg-green-900/50' : 'hover:bg-green-100 text-green-600 dark:hover:bg-green-900/50'}`}
                title="Accept Change"
              >
                <Check className="w-4 h-4" />
              </button>
              <button 
                onClick={() => onReject(i)}
                disabled={!diff.isAccepted}
                className={`p-2 rounded-full transition-colors ${!diff.isAccepted ? 'bg-red-100 text-red-600 dark:bg-red-900/50' : 'hover:bg-red-100 text-red-600 dark:hover:bg-red-900/50'}`}
                title="Reject Change"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
