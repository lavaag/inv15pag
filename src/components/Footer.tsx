import React from 'react';
import { Heart, Sparkles, FileSpreadsheet } from 'lucide-react';

interface FooterProps {
  onOpenConfirmedList: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenConfirmedList }) => {
  return (
    <footer className="py-12 px-4 border-t border-amber-400/20 bg-[#070913] text-center relative overflow-hidden">
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Monogram */}
        <div className="w-12 h-12 mx-auto rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300 font-script text-2xl">
          S
        </div>

        <h3 className="font-serif text-2xl text-white font-medium">
          Sofía • Mis 15 Años
        </h3>

        <p className="text-xs text-amber-300/80 tracking-widest uppercase">
          Sábado 10 de Octubre de 2026 • Clahe Eventos Berazategui
        </p>

        <p className="text-xs text-slate-400 max-w-sm mx-auto italic">
          "Gracias por ser parte fundamental de mi vida y acompañarme en esta noche tan especial."
        </p>

        <div className="pt-4 flex items-center justify-center gap-3">
          <button
            onClick={onOpenConfirmedList}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#121630] hover:bg-[#1a2046] text-slate-300 hover:text-white border border-slate-700 hover:border-amber-400/40 text-[11px] font-medium transition-all"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Acceso Anfitriones: Planilla de Confirmados en Tiempo Real</span>
          </button>
        </div>

        <div className="pt-6 text-[10px] text-slate-500">
          Diseñado con todo el cariño para los 15 de Sofía ✨
        </div>
      </div>
    </footer>
  );
};
