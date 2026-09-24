import React from 'react';
import { Sparkles, Shirt } from 'lucide-react';

export const DressCode: React.FC = () => {
  return (
    <section className="py-16 px-4 relative">
      <div className="max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold tracking-widest uppercase mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Etiqueta</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-serif text-white font-medium mb-3">
          Dress Code
        </h2>
        <p className="text-sm text-slate-300 max-w-md mx-auto mb-8">
          Queremos que te sientas cómodo/a y espectacular para una noche de fiesta inolvidable.
        </p>

        <div className="p-8 rounded-3xl bg-gradient-to-b from-[#141a38]/80 to-[#0e1226]/90 border border-amber-400/30 shadow-2xl backdrop-blur-md relative overflow-hidden">
          {/* Subtle gold ribbon line */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>

          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-tr from-amber-500/20 to-blue-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-lg">
            <span className="text-3xl">👗👔</span>
          </div>

          <h3 className="font-cinzel text-2xl sm:text-3xl font-bold text-amber-300 tracking-[0.2em] uppercase mb-3">
            Elegante
          </h3>

          <p className="text-slate-200 text-sm max-w-lg mx-auto leading-relaxed mb-6 font-light">
            Damas: Vestido de fiesta corto o largo.<br />
            Caballeros: Traje, camisa o conjunto formal con estilo.
          </p>

          <div className="inline-block p-3.5 rounded-2xl bg-amber-950/30 border border-amber-400/40 text-amber-200 text-xs sm:text-sm">
            <span className="font-semibold text-amber-300">Nota especial con amor:</span> Los colores blanco y manteca quedan reservados exclusivamente para la quinceañera ✨
          </div>
        </div>
      </div>
    </section>
  );
};
