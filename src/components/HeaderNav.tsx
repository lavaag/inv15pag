import React from 'react';
import { Heart, FileSpreadsheet, MapPin, Sparkles } from 'lucide-react';

interface HeaderNavProps {
  onOpenRsvp: () => void;
  onOpenConfirmedList: () => void;
  onScrollToVenue: () => void;
  totalConfirmed: number;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  onOpenRsvp,
  onOpenConfirmedList,
  onScrollToVenue,
  totalConfirmed,
}) => {
  return (
    <header className="fixed top-0 inset-x-0 z-40 px-3 sm:px-6 py-3 transition-all duration-300">
      <div className="max-w-5xl mx-auto rounded-full bg-[#0d1024]/85 border border-amber-400/25 backdrop-blur-md px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-2xl shadow-black/50">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-script text-xl flex items-center justify-center font-bold shadow-md">
            S
          </div>
          <div>
            <span className="font-serif text-sm sm:text-base font-bold text-white tracking-wide">
              Sofía
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold tracking-widest text-amber-300 uppercase px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20">
              Mis 15
            </span>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onScrollToVenue}
            className="hidden md:flex items-center gap-1.5 text-xs text-slate-300 hover:text-amber-300 font-medium px-3 py-1.5 rounded-full hover:bg-white/5 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            <span>Lugar</span>
          </button>

          <button
            onClick={onOpenConfirmedList}
            className="flex items-center gap-1.5 text-xs text-amber-200 hover:text-white font-medium px-3 py-1.5 rounded-full bg-[#181d3d] border border-amber-400/30 hover:border-amber-400 shadow-sm transition-all"
            title="Ver lista de confirmados en tiempo real"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden xs:inline">Confirmados:</span>
            <span className="font-bold text-emerald-300">{totalConfirmed}</span>
          </button>

          <button
            onClick={onOpenRsvp}
            className="flex items-center gap-1.5 text-xs font-bold px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-md shadow-amber-400/20 transition-all uppercase tracking-wider"
          >
            <Heart className="w-3 h-3 fill-slate-950" />
            <span>Confirmar</span>
          </button>
        </div>
      </div>
    </header>
  );
};
