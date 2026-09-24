import React, { useState } from 'react';
import { Music, Disc, Send, Check } from 'lucide-react';

interface MusicSuggestionProps {
  onOpenRsvpWithSong?: (song: string) => void;
}

export const MusicSuggestion: React.FC<MusicSuggestionProps> = ({ onOpenRsvpWithSong }) => {
  const [songInput, setSongInput] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!songInput.trim()) return;

    if (onOpenRsvpWithSong) {
      onOpenRsvpWithSong(songInput.trim());
    }
    setSent(true);
    setTimeout(() => {
      setSongInput('');
      setSent(false);
    }, 3000);
  };

  return (
    <section className="py-16 px-4 relative">
      <div className="max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold tracking-widest uppercase mb-3">
          <Music className="w-3.5 h-3.5" />
          <span>La Música</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-serif text-white font-medium mb-3">
          ¿Qué canción no puede faltar?
        </h2>
        <p className="text-sm text-slate-300 max-w-md mx-auto mb-8">
          ¡Armemos juntos la playlist de la noche para que la pista de Clahe Eventos explote de diversión!
        </p>

        <div className="p-8 rounded-3xl bg-gradient-to-b from-[#141a38]/80 to-[#0e1226]/90 border border-blue-400/30 shadow-2xl backdrop-blur-md relative overflow-hidden">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300">
            <Disc className="w-7 h-7 text-blue-400 animate-spin [animation-duration:12s]" />
          </div>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
            <div className="relative">
              <input
                type="text"
                required
                value={songInput}
                onChange={(e) => setSongInput(e.target.value)}
                placeholder="Nombre de la canción y artista..."
                className="w-full px-5 py-3 rounded-2xl bg-[#0f132e] border border-blue-400/40 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 shadow-inner"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all active:scale-95"
            >
              {sent ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>¡Canción enviada para el DJ!</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Sugerir Canción para la Fiesta</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
