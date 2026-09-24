import React from 'react';
import { Heart, FileSpreadsheet, Sparkles, CheckCircle2, Clock, Users } from 'lucide-react';
import { DietarySummary } from '../types';

interface RsvpSectionProps {
  onOpenRsvp: () => void;
  onOpenConfirmedList: () => void;
  summary: DietarySummary;
}

export const RsvpSection: React.FC<RsvpSectionProps> = ({
  onOpenRsvp,
  onOpenConfirmedList,
  summary,
}) => {
  return (
    <section id="rsvp-section" className="py-20 px-4 relative">
      <div className="max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/40 text-amber-300 text-xs font-semibold tracking-widest uppercase mb-4 shadow-lg shadow-amber-400/5">
          <Heart className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
          <span>Confirmación de Asistencia</span>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-white font-medium mb-3">
          ¿Venís a festejar conmigo?
        </h2>

        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto mb-8 leading-relaxed">
          Para nosotros es fundamental contar con tu confirmación para coordinar el salón, la ubicación en las mesas y el menú personalizado en Clahe Eventos.
        </p>

        {/* Card */}
        <div className="relative p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#161c3e]/90 to-[#0e122b]/95 border-2 border-amber-400/35 shadow-[0_0_50px_rgba(245,158,11,0.15)] backdrop-blur-md overflow-hidden">
          {/* Ambient inner glow */}
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-blue-500/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Deadline notice */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-950/40 border border-amber-400/30 text-amber-200 text-xs sm:text-sm font-medium mb-6">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Fecha límite para confirmar: <strong>20 de Septiembre de 2026</strong></span>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mb-8">
            Completá tus datos y los de tus acompañantes indicando si tienen alguna condición alimentaria (menú celíaco, vegetariano, vegano, alergias).
          </p>

          {/* Primary Action Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <button
              onClick={onOpenRsvp}
              className="w-full sm:w-auto px-10 py-4 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold text-sm sm:text-base uppercase tracking-wider shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:shadow-[0_0_40px_rgba(245,158,11,0.6)] transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3"
            >
              <Heart className="w-5 h-5 fill-slate-950" />
              <span>Confirmar Asistencia Aquí</span>
            </button>

            <button
              onClick={onOpenConfirmedList}
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#121633] hover:bg-[#1a2046] text-amber-200 hover:text-white border border-amber-400/35 hover:border-amber-400 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2.5 transition-all shadow-md"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Ver Lista de Confirmados en Vivo</span>
            </button>
          </div>

          {/* Live Stats Preview */}
          <div className="pt-6 border-t border-slate-700/60 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span><strong>{summary.total} personas</strong> confirmadas hasta el momento</span>
            </div>

            {summary.celiaco > 0 && (
              <div className="flex items-center gap-1.5 text-amber-300">
                <span>🌾 {summary.celiaco} Menú Celíaco (Sin TACC)</span>
              </div>
            )}

            {summary.vegetariano + summary.vegano > 0 && (
              <div className="flex items-center gap-1.5 text-emerald-300">
                <span>🥗 {summary.vegetariano + summary.vegano} Menú Vegetariano / Vegano</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
