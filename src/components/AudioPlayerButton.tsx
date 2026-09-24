import React from 'react';
import { Play, Pause } from 'lucide-react';

interface AudioPlayerButtonProps {
  isPlaying: boolean;
  onToggle: () => void;
}

export const AudioPlayerButton: React.FC<AudioPlayerButtonProps> = ({ isPlaying, onToggle }) => {
  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        onClick={onToggle}
        aria-label={isPlaying ? 'Pausar música' : 'Reproducir música'}
        className="w-14 h-14 rounded-full bg-[#7e526a] hover:bg-[#6b4258] text-white flex items-center justify-center shadow-xl shadow-black/25 active:scale-95 transition-all duration-300 border-2 border-white/40"
      >
        {isPlaying ? (
          <Pause className="w-5 h-5 fill-white text-white" />
        ) : (
          <Play className="w-5 h-5 fill-white text-white ml-0.5" />
        )}
      </button>
    </div>
  );
};
