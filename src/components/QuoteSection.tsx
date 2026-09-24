import React from 'react';
import { Sparkles, Quote } from 'lucide-react';

export const QuoteSection: React.FC = () => {
  return (
    <section className="relative py-16 px-4 text-center overflow-hidden">
      <div className="max-w-3xl mx-auto relative z-10">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300">
          <Quote className="w-5 h-5 text-amber-400" />
        </div>

        <div className="relative p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-[#141a38]/70 to-[#0e1226]/80 border border-amber-400/25 shadow-2xl backdrop-blur-md">
          {/* Subtle gold decorative corners */}
          <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-amber-400/60 rounded-tl"></div>
          <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-amber-400/60 rounded-tr"></div>
          <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-amber-400/60 rounded-bl"></div>
          <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-amber-400/60 rounded-br"></div>

          <p className="font-serif italic text-lg sm:text-2xl text-slate-100 leading-relaxed font-light mb-6">
            "Hay momentos en la vida que son irrepetibles, pero compartirlos con las personas que más quiero los hace inolvidables. Te espero para compartir una noche mágica llena de música, emoción y recuerdos únicos."
          </p>

          <div className="flex items-center justify-center gap-3">
            <span className="h-[1px] w-10 bg-amber-400/40"></span>
            <span className="font-script text-3xl sm:text-4xl text-amber-300 tracking-wide">
              Sofía
            </span>
            <span className="h-[1px] w-10 bg-amber-400/40"></span>
          </div>
        </div>
      </div>
    </section>
  );
};
