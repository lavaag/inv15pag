import React from 'react';
import { Calendar, MapPin, Sparkles, Heart, ChevronDown } from 'lucide-react';

interface HeroProps {
  onOpenRsvp: () => void;
  onScrollToVenue: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenRsvp, onScrollToVenue }) => {
  return (
    <div className="relative min-h-[92vh] flex flex-col items-center justify-between text-center px-4 pt-16 pb-12 overflow-hidden">
      {/* Dynamic ambient lights matching Clahe Eventos blue & purple ambiance */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-blue-600/20 via-indigo-500/15 to-purple-600/10 rounded-full blur-[130px] pointer-events-none -z-10 animate-pulse-soft"></div>
      <div className="absolute top-12 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-[90px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-amber-400/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>

      {/* Decorative stars and sparkles pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40"></div>

      {/* Top Monogram / Crest */}
      <div className="relative z-10 flex flex-col items-center mb-4">
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-amber-300/40 p-1.5 flex items-center justify-center bg-gradient-to-b from-[#181e3d]/80 to-[#0e1226]/90 shadow-2xl shadow-blue-900/40 backdrop-blur-md">
          {/* Outer rotating dashed ring */}
          <div className="absolute inset-0 rounded-full border border-dashed border-amber-400/30 animate-[spin_25s_linear_infinite]"></div>

          <div className="w-full h-full rounded-full border border-amber-400/30 flex items-center justify-center bg-[#0d1022]/90">
            <span className="font-script text-4xl sm:text-5xl text-amber-300 text-shadow drop-shadow-[0_2px_10px_rgba(251,191,36,0.5)]">
              S
            </span>
          </div>

          {/* Tiny glowing crown/star at top */}
          <div className="absolute -top-2 px-2 py-0.5 bg-[#0b0d19] border border-amber-400/50 rounded-full text-amber-300 text-[10px] tracking-widest uppercase flex items-center gap-1 shadow-md">
            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
            <span>15</span>
          </div>
        </div>
      </div>

      {/* Title & Name section */}
      <div className="relative z-10 max-w-3xl mx-auto my-auto space-y-4">
        <div className="flex items-center justify-center gap-3 text-amber-300/90">
          <span className="h-[1px] w-8 sm:w-16 bg-gradient-to-r from-transparent to-amber-400/60"></span>
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.35em] text-amber-200">
            Te invito a celebrar mis
          </p>
          <span className="h-[1px] w-8 sm:w-16 bg-gradient-to-l from-transparent to-amber-400/60"></span>
        </div>

        {/* Big MIS 15 */}
        <h2 className="font-cinzel text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 drop-shadow-[0_4px_20px_rgba(245,158,11,0.3)]">
          MIS 15 AÑOS
        </h2>

        {/* Sofía in stunning script typography */}
        <h1 className="font-script text-7xl sm:text-8xl md:text-9xl text-white font-normal leading-none tracking-wide text-shadow drop-shadow-[0_8px_30px_rgba(59,130,246,0.4)] py-2">
          Sofía
        </h1>

        {/* Date and Venue badges */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-sm sm:text-base text-slate-200">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#161c3b]/80 border border-amber-400/20 backdrop-blur-sm">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span className="font-medium tracking-wide">10 de Octubre de 2026</span>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#161c3b]/80 border border-blue-400/20 backdrop-blur-sm">
            <MapPin className="w-4 h-4 text-blue-400" />
            <span className="font-medium tracking-wide">Clahe Eventos • Berazategui</span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto pt-2 italic">
          "Hay momentos inolvidables que se atesoran en el corazón para siempre..."
        </p>

        {/* Primary CTA Buttons */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onOpenRsvp}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-sm tracking-wider uppercase shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:shadow-[0_0_35px_rgba(245,158,11,0.6)] transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Heart className="w-4 h-4 fill-slate-950" />
            <span>Confirmar Asistencia</span>
          </button>

          <button
            onClick={onScrollToVenue}
            className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#131835]/90 hover:bg-[#1c234d] text-amber-200 font-semibold text-sm tracking-wide border border-amber-400/30 hover:border-amber-400 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>Ver Ubicación</span>
          </button>
        </div>
      </div>

      {/* Down arrow indicator */}
      <div className="relative z-10 pt-8 animate-bounce opacity-70">
        <ChevronDown className="w-6 h-6 text-amber-300 mx-auto" />
      </div>
    </div>
  );
};
