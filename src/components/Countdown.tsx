import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Download, ExternalLink, Sparkles } from 'lucide-react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

export const Countdown: React.FC = () => {
  // Target: Sábado 10 de Octubre de 2026 a las 21:00 hs (Berazategui, Argentina - UTC-3)
  const targetDate = new Date('2026-10-10T21:00:00-03:00').getTime();

  const calculateTimeLeft = (): TimeLeft => {
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000),
      isPast: false,
    };
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Google Calendar link
  const createGoogleCalendarUrl = () => {
    const title = encodeURIComponent('Mis 15 Sofía - Clahe Eventos Berazategui');
    const details = encodeURIComponent('¡Festejamos los 15 años de Sofía! Una noche inolvidable en Clahe Eventos.');
    const location = encodeURIComponent('Clahe Eventos, Calle 158 N° 4561, Plátanos, Berazategui, Buenos Aires');
    // Start: 2026-10-10 21:00 AR (2026-10-11 00:00 UTC) - End: 2026-10-11 05:00 AR (2026-10-11 08:00 UTC)
    const dates = '20261011T000000Z/20261011T080000Z';
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
  };

  // iCal download (.ics file for Apple Calendar & Outlook)
  const downloadIcsFile = () => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Mis 15 Sofia//ES
CALSCALE:GREGORIAN
BEGIN:VEVENT
SUMMARY:Mis 15 Sofía - Clahe Eventos
DESCRIPTION:¡Festejamos los 15 años de Sofía en Clahe Eventos Berazategui!
LOCATION:Clahe Eventos, Calle 158 N° 4561, Plátanos, Berazategui, Buenos Aires
DTSTART:20261011T000000Z
DTEND:20261011T080000Z
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'Mis_15_Sofia_Clahe_Eventos.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 text-center">
      {/* Subtle gold crown / star flourish */}
      <div className="flex items-center justify-center gap-3 mb-3 text-amber-300/80">
        <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-amber-400/50"></span>
        <Sparkles className="w-4 h-4 text-amber-400" />
        <span className="text-xs uppercase tracking-[0.3em] font-semibold text-amber-300">
          Cuenta Regresiva
        </span>
        <Sparkles className="w-4 h-4 text-amber-400" />
        <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-amber-400/50"></span>
      </div>

      <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-white mb-2 font-medium tracking-wide">
        Falta muy poco para la gran noche
      </h2>
      <p className="text-sm text-slate-300/80 mb-8 max-w-md mx-auto">
        Cada segundo nos acerca a un momento irrepetible
      </p>

      {/* Countdown Grid */}
      <div className="grid grid-cols-4 gap-2 sm:gap-4 md:gap-6 max-w-2xl mx-auto mb-10">
        {[
          { label: 'DÍAS', value: timeLeft.days },
          { label: 'HORAS', value: timeLeft.hours },
          { label: 'MINUTOS', value: timeLeft.minutes },
          { label: 'SEGUNDOS', value: timeLeft.seconds },
        ].map((item, idx) => (
          <div
            key={idx}
            className="relative group p-3 sm:p-5 rounded-2xl bg-gradient-to-b from-[#161c3a]/80 to-[#0e1226]/90 border border-amber-400/25 backdrop-blur-md shadow-xl hover:border-amber-400/50 transition-all duration-300"
          >
            {/* Ambient inner glow */}
            <div className="absolute inset-0 bg-blue-500/5 rounded-2xl pointer-events-none group-hover:bg-amber-400/5 transition-colors"></div>

            <div className="relative text-2xl sm:text-4xl md:text-5xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 tracking-wider">
              {String(item.value).padStart(2, '0')}
            </div>
            <div className="relative mt-1 text-[10px] sm:text-xs tracking-[0.2em] font-semibold text-slate-300 uppercase">
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {/* Calendar integration buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <a
          href={createGoogleCalendarUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#171d3d] hover:bg-[#202752] text-amber-200 text-xs sm:text-sm font-medium border border-amber-400/30 hover:border-amber-400 shadow-lg shadow-black/40 transition-all duration-200"
        >
          <Calendar className="w-4 h-4 text-amber-400" />
          <span>Agendar en Google Calendar</span>
          <ExternalLink className="w-3 h-3 opacity-60" />
        </a>

        <button
          onClick={downloadIcsFile}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#12162e] hover:bg-[#1a2042] text-slate-200 hover:text-white text-xs sm:text-sm font-medium border border-slate-700/60 hover:border-amber-400/40 shadow-lg transition-all duration-200"
        >
          <Download className="w-4 h-4 text-blue-400" />
          <span>Descargar recordatorio (.ics / Apple)</span>
        </button>
      </div>
    </div>
  );
};
