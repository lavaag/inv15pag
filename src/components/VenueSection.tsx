import React from 'react';
import { MapPin, Navigation, Clock, Calendar, ExternalLink } from 'lucide-react';

export const VenueSection: React.FC = () => {
  const salonName = 'Clahe Eventos';
  const salonAddress = 'Calle 158 N° 4561 (e/ 45 y 46), Plátanos, Berazategui, Buenos Aires';
  const googleMapsUrl = 'https://www.google.com/maps/search/?api=1&query=Clahe+Eventos+Berazategui+Calle+158+4561';
  const wazeUrl = 'https://waze.com/ul?q=Clahe%20Eventos%20Berazategui';

  return (
    <section id="venue-section" className="py-16 px-4 relative">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold tracking-widest uppercase mb-3">
            <MapPin className="w-3.5 h-3.5" />
            <span>Lugar & Horarios</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif text-white font-medium mb-3">
            ¿Dónde y Cuándo?
          </h2>
          <p className="text-sm text-slate-300 max-w-lg mx-auto">
            Te espero en uno de los salones más hermosos de Berazategui para disfrutar juntos desde el primer instante.
          </p>
        </div>

        {/* Venue Glass Card */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#151b3d]/90 to-[#0e1228]/95 border border-amber-400/30 shadow-2xl backdrop-blur-md">
          {/* Top banner visual styling */}
          <div className="relative h-44 sm:h-56 w-full bg-gradient-to-r from-blue-900/60 via-indigo-900/40 to-slate-900/80 flex items-center justify-center p-6 border-b border-amber-400/20 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#3b82f620_1px,transparent_1px)] [background-size:16px_16px]"></div>
            
            {/* Ambient lighting */}
            <div className="absolute -top-10 -right-10 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-amber-400/15 rounded-full blur-3xl"></div>

            <div className="relative z-10 text-center space-y-2">
              <span className="font-cinzel text-xs sm:text-sm tracking-[0.3em] text-amber-300 uppercase font-semibold">
                Salón de Fiestas
              </span>
              <h3 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-wide text-shadow drop-shadow-md">
                Clahe Eventos
              </h3>
              <p className="text-xs sm:text-sm text-blue-200/90 font-medium">
                Berazategui • Buenos Aires
              </p>
            </div>
          </div>

          {/* Details body */}
          <div className="p-6 sm:p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date & Time */}
              <div className="flex items-start gap-4 p-5 rounded-2xl bg-[#10142c]/70 border border-slate-700/50">
                <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-white mb-1">
                    Horario de Recepción
                  </h4>
                  <p className="text-sm font-medium text-amber-300">
                    21:00 hs puntual
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Sábado 10 de Octubre de 2026. Finalización estimada: 05:00 hs.
                  </p>
                </div>
              </div>

              {/* Exact Address */}
              <div className="flex items-start gap-4 p-5 rounded-2xl bg-[#10142c]/70 border border-slate-700/50">
                <div className="w-12 h-12 rounded-xl bg-blue-400/10 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-white mb-1">
                    Dirección
                  </h4>
                  <p className="text-sm text-slate-200 font-medium leading-relaxed">
                    Calle 158 N° 4561 (entre 45 y 46)
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Plátanos, Berazategui, Provincia de Buenos Aires.
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all duration-200"
              >
                <MapPin className="w-4 h-4" />
                <span>Abrir en Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>

              <a
                href={wazeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-[#171d3d] hover:bg-[#202752] text-amber-200 font-semibold text-sm border border-amber-400/30 hover:border-amber-400 shadow-md transition-all duration-200"
              >
                <Navigation className="w-4 h-4 text-amber-400" />
                <span>Cómo llegar con Waze</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
