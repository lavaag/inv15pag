import React, { useState } from 'react';
import { Instagram, Copy, Check, Sparkles } from 'lucide-react';

export const InstagramSection: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const hashtag = '#Mis15Sofi';

  const copyHashtag = () => {
    navigator.clipboard.writeText(hashtag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section className="py-16 px-4 relative">
      <div className="max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-pink-500/10 border border-pink-400/30 text-pink-300 text-xs font-semibold tracking-widest uppercase mb-3">
          <Instagram className="w-3.5 h-3.5" />
          <span>Redes Sociales</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-serif text-white font-medium mb-3">
          Compartí tus Recuerdos
        </h2>
        <p className="text-sm text-slate-300 max-w-md mx-auto mb-8">
          Durante la fiesta en Clahe Eventos, subí tus historias y fotos usando nuestro hashtag oficial:
        </p>

        <div className="p-8 rounded-3xl bg-gradient-to-b from-[#181335]/90 to-[#0e0e24]/90 border border-pink-500/30 shadow-2xl backdrop-blur-md relative overflow-hidden space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 p-0.5 shadow-lg shadow-pink-500/20">
            <div className="w-full h-full bg-[#110e26] rounded-2xl flex items-center justify-center text-pink-400">
              <Instagram className="w-8 h-8" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-cinzel text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-amber-300 tracking-wider">
              {hashtag}
            </div>
            <p className="text-xs text-slate-400">
              ¡Etiquetá a Sofía para que pueda revivir cada momento!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={copyHashtag}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#201844] hover:bg-[#2c215c] text-pink-200 border border-pink-400/40 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>¡Hashtag copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-pink-400" />
                  <span>Copiar Hashtag</span>
                </>
              )}
            </button>

            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:opacity-90 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-pink-600/30 transition-all"
            >
              <Instagram className="w-4 h-4" />
              <span>Abrir Instagram</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
