import React, { useState } from 'react';
import { Gift, Copy, Check, Heart, Mail } from 'lucide-react';
import { AppConfig } from '../types';

interface GiftsSectionProps {
  config: AppConfig;
}

export const GiftsSection: React.FC<GiftsSectionProps> = ({ config }) => {
  const [copied, setCopied] = useState(false);
  const alias = config.aliasCbu || 'SOFIA.MIS15.CLAHE';
  const cbu = config.cbuCompleto || '0720123488000034567891';
  const titular = config.titularCbu || 'Sofía Álvarez / Familia';
  const banco = config.bancoNombre || 'Banco Santander / Mercado Pago';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section className="py-16 px-4 relative">
      <div className="max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold tracking-widest uppercase mb-3">
          <Gift className="w-3.5 h-3.5 text-amber-400" />
          <span>Regalos & Agradecimiento</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-serif text-white font-medium mb-3">
          Mi Mayor Deseo
        </h2>
        <p className="text-sm text-slate-300 max-w-md mx-auto mb-8">
          Tu presencia y tus abrazos son el regalo más valioso. Pero si deseás hacerme una atención para ayudarme con mi viaje de 15:
        </p>

        {/* Gift Card */}
        <div className="p-8 rounded-3xl bg-gradient-to-b from-[#141a38]/80 to-[#0e1226]/90 border border-amber-400/30 shadow-2xl backdrop-blur-md relative overflow-hidden space-y-6">
          <div className="w-14 h-14 mx-auto rounded-full bg-amber-400/15 border border-amber-400/40 flex items-center justify-center text-amber-300">
            <Heart className="w-7 h-7 text-amber-400 fill-amber-400/30" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-serif font-bold text-white">
              Transferencia Bancaria / Mercado Pago
            </h3>
            <p className="text-xs text-slate-400">
              {titular} • {banco}
            </p>
          </div>

          {/* Alias Box */}
          <div className="max-w-md mx-auto p-4 rounded-2xl bg-[#0f132e] border border-amber-400/35 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-inner">
            <div className="text-left">
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                Alias de la cuenta:
              </span>
              <div className="font-mono text-base sm:text-lg font-bold text-amber-300 tracking-wider">
                {alias}
              </div>
            </div>

            <button
              onClick={() => copyToClipboard(alias)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-slate-950" />
                  <span>¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-950" />
                  <span>Copiar Alias</span>
                </>
              )}
            </button>
          </div>

          {/* Lluvia de sobres */}
          <div className="pt-2 flex items-center justify-center gap-2 text-xs text-slate-300">
            <Mail className="w-4 h-4 text-blue-400" />
            <span>También dispondremos de un buzón de sobres en la entrada del salón.</span>
          </div>
        </div>
      </div>
    </section>
  );
};
