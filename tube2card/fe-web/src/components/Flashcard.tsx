import React, { useState } from 'react';
import { RotateCw } from 'lucide-react';

interface FlashcardProps {
  front: string;
  back: string;
  onFlip?: (flipped: boolean) => void;
  resetFlipped?: boolean;
}

export default function Flashcard({ front, back, onFlip, resetFlipped }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  React.useEffect(() => {
    if (resetFlipped) {
      setIsFlipped(false);
    }
  }, [resetFlipped, front]); // Reset khi đổi câu hoặc có cờ reset

  const handleFlip = () => {
    const newState = !isFlipped;
    setIsFlipped(newState);
    if (onFlip) onFlip(newState);
  };

  return (
    <div 
      className="group h-64 w-full perspective-1000 cursor-pointer"
      onClick={handleFlip}
    >
      <div 
        className={`relative h-full w-full rounded-2xl shadow-xl transition-all duration-500 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
      >
        {/* Front */}
        <div className="absolute inset-0 h-full w-full rounded-2xl bg-zinc-900 border border-zinc-800 p-6 backface-hidden hover:border-purple-500/50 flex flex-col justify-between" style={{ WebkitBackfaceVisibility: 'hidden' }}>
          <div>
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-4 block">Câu hỏi</span>
            <p className="text-lg font-medium text-white">{front}</p>
          </div>
          <div className="flex justify-end text-zinc-500">
            <RotateCw size={20} className="group-hover:text-purple-400 transition-colors" />
          </div>
        </div>

        {/* Back */}
        <div className="absolute inset-0 h-full w-full rounded-2xl bg-zinc-900 bg-gradient-to-br from-purple-900/80 to-blue-900/80 border border-purple-500/50 p-6 [transform:rotateY(180deg)] backface-hidden flex flex-col justify-between" style={{ WebkitBackfaceVisibility: 'hidden' }}>
          <div>
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-4 block">Đáp án</span>
            <p className="text-lg font-medium text-zinc-100 overflow-y-auto max-h-[140px] pr-2 custom-scrollbar">{back}</p>
          </div>
          <div className="flex justify-end text-purple-400/50">
            <RotateCw size={20} />
          </div>
        </div>
      </div>
    </div>
  );
}
