import React, { useState, useEffect, useMemo } from 'react';
import { RsvpRecord, DietaryCondition, DietarySummary, AppConfig } from '../types';
import { submitRsvp, exportToExcelCsv } from '../services/api';
import confetti from 'canvas-confetti';
import {
  Copy,
  Check,
  FileSpreadsheet,
  ExternalLink,
  Calendar as CalendarIcon,
  MapPin,
  Heart,
  Lock,
  Camera,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { LOCAL_IMAGES, normalizeImageUrl, handleImageError } from '../utils/imageUtils';

interface DigitalInvitationProps {
  records: RsvpRecord[];
  summary: DietarySummary;
  config: AppConfig;
  onOpenConfirmedModal: () => void;
  onRefreshData: () => void;
  onNavigate?: (route: 'invitation' | 'confirmados' | 'admin') => void;
}

interface GuestFormState {
  nombre: string;
  apellido: string;
  asiste: boolean;
  condicion: DietaryCondition;
  detalleCondicion: string;
}

export const DigitalInvitationCard: React.FC<DigitalInvitationProps> = ({
  records,
  summary,
  config,
  onOpenConfirmedModal,
  onRefreshData,
  onNavigate,
}) => {
  // Countdown target
  const targetDate = useMemo(() => {
    if (config.fechaIsoCountdown) {
      const parsed = new Date(config.fechaIsoCountdown).getTime();
      if (!isNaN(parsed)) return parsed;
    }
    return new Date('2026-10-10T21:00:00-03:00').getTime();
  }, [config.fechaIsoCountdown]);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const diff = targetDate - now;
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        });
      }
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  // RSVP Form State
  const [numPersonas, setNumPersonas] = useState<number>(1);
  const [guests, setGuests] = useState<GuestFormState[]>([
    {
      nombre: '',
      apellido: '',
      asiste: true,
      condicion: 'Ninguna (Menú tradicional)',
      detalleCondicion: '',
    },
  ]);
  const [telefonoContacto, setTelefonoContacto] = useState('');
  const [cancionSugerida, setCancionSugerida] = useState('');
  const [mensajeDedicatoria, setMensajeDedicatoria] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedAlias, setCopiedAlias] = useState(false);
  const [showGiftDetails, setShowGiftDetails] = useState(false);

  // Photo gallery modal state
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

  const galleryPhotos = useMemo(() => {
    if (Array.isArray(config.galeriaFotos) && config.galeriaFotos.length > 0) {
      return config.galeriaFotos;
    }
    return LOCAL_IMAGES.gallery;
  }, [config.galeriaFotos]);

  const handlePrevPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (activePhotoIndex !== null) {
      setActivePhotoIndex((prev) => (prev === null || prev === 0 ? galleryPhotos.length - 1 : prev - 1));
    }
  };

  const handleNextPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (activePhotoIndex !== null) {
      setActivePhotoIndex((prev) => (prev === null || prev >= galleryPhotos.length - 1 ? 0 : prev + 1));
    }
  };

  // Hidden host access state (triggered only via secret 4-tap or keyboard shortcut)
  const [secretClicks, setSecretClicks] = useState<number>(0);
  const [showSecretAccessModal, setShowSecretAccessModal] = useState<boolean>(false);

  const handleSecretTrigger = () => {
    setSecretClicks((prev) => {
      const next = prev + 1;
      if (next >= 4) {
        setShowSecretAccessModal(true);
        return 0;
      }
      return next;
    });
    setTimeout(() => setSecretClicks(0), 3000);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.altKey && e.key.toLowerCase() === 'a') ||
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a')
      ) {
        e.preventDefault();
        setShowSecretAccessModal((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update guests array when number of guests changes
  const handleNumPersonasChange = (count: number) => {
    setNumPersonas(count);
    const updated: GuestFormState[] = [];
    for (let i = 0; i < count; i++) {
      if (guests[i]) {
        updated.push(guests[i]);
      } else {
        updated.push({
          nombre: '',
          apellido: '',
          asiste: true,
          condicion: 'Ninguna (Menú tradicional)',
          detalleCondicion: '',
        });
      }
    }
    setGuests(updated);
  };

  const updateGuest = (index: number, field: keyof GuestFormState, val: any) => {
    const updated = [...guests];
    updated[index] = { ...updated[index], [field]: val };
    setGuests(updated);
  };

  const handleSubmitRsvp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Validations
    for (let i = 0; i < guests.length; i++) {
      if (!guests[i].nombre.trim() || !guests[i].apellido.trim()) {
        setErrorMessage(`Por favor completa nombre y apellido del Invitado ${i + 1}.`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const titular = guests[0];
      const acompanantesList = guests.slice(1).map((g, idx) => ({
        id: 'comp-' + Date.now() + '-' + idx,
        nombre: `${g.nombre.trim()} ${g.apellido.trim()}`,
        condicion: g.condicion,
        detalleCondicion: g.detalleCondicion.trim(),
      }));

      await submitRsvp({
        titularNombre: `${titular.nombre.trim()} ${titular.apellido.trim()}`,
        telefono: telefonoContacto.trim(),
        asiste: titular.asiste,
        condicionTitular: titular.condicion,
        detalleCondicionTitular: titular.detalleCondicion.trim(),
        acompanantes: acompanantesList,
        cancionSugerida: cancionSugerida.trim(),
        mensajeDedicatoria: mensajeDedicatoria.trim(),
      });

      setSubmitSuccess(true);
      confetti({
        particleCount: 110,
        spread: 75,
        origin: { y: 0.65 },
        colors: ['#c06d7d', '#7e526a', '#f5b5c3', '#ffffff'],
      });
      onRefreshData();
    } catch (err) {
      console.error(err);
      setErrorMessage('Ocurrió un error al registrar la confirmación. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyAlias = () => {
    navigator.clipboard.writeText(config.aliasCbu || 'SOFIA.MIS15.CLAHE');
    setCopiedAlias(true);
    setTimeout(() => setCopiedAlias(false), 2500);
  };

  // Google Calendar URL
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Mis 15 Sofía - Clahe Eventos')}&dates=20261011T000000Z/20261011T080000Z&details=${encodeURIComponent('¡Festejo de los 15 años de Sofía en Clahe Eventos Berazategui!')}&location=${encodeURIComponent('Clahe Eventos, Calle 158 N° 4561, Plátanos, Berazategui')}`;

  const mapsUrl = 'https://www.google.com/maps/search/?api=1&query=Clahe+Eventos+Berazategui+Calle+158+4561';

  return (
    <div className="w-full max-w-full md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto bg-white min-h-screen shadow-2xl relative font-montserrat text-[#2b2b2b] pb-24 overflow-hidden md:my-6 md:rounded-2xl border-x md:border border-[#ede6eb]">
      {/* ================= SECTION 1: HERO (Image 1) ================= */}
      <div className="relative w-full aspect-[9/14] sm:aspect-[16/10] md:aspect-auto md:h-[620px] lg:h-[700px] overflow-hidden bg-[#7e526a]">
        {/* Photo of quinceañera with rose-gold metallic heart balloons */}
        <img
          src={normalizeImageUrl(config.heroImageUrl, LOCAL_IMAGES.hero)}
          alt={`Mis 15 ${config.nombreQuinceanera || 'Sofía'}`}
          className="w-full h-full object-cover object-center filter brightness-[0.92] transition-opacity duration-300"
          loading="eager"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={(e) => handleImageError(e, LOCAL_IMAGES.hero)}
        />

        {/* Gradient overlay for soft text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/45"></div>

        {/* Text Overlay: MIS 15 & Sofía */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          <h1 className="text-white text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-montserrat font-bold tracking-[0.18em] uppercase drop-shadow-[0_2px_14px_rgba(0,0,0,0.5)]">
            {config.tituloIngreso || 'MIS 15'}
          </h1>
          <p className="font-script text-white text-6xl sm:text-7xl md:text-8xl lg:text-9xl -mt-2 md:-mt-4 drop-shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
            {config.nombreQuinceanera || 'Sofía'}
          </p>
        </div>

        {/* Countdown Rectangular Pink Cards at Bottom */}
        <div className="absolute bottom-4 md:bottom-8 inset-x-3 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-xl grid grid-cols-4 gap-2 md:gap-3 z-10 px-2 md:px-0">
          {[
            { value: timeLeft.days, label: 'DÍAS' },
            { value: timeLeft.hours, label: 'HORAS' },
            { value: timeLeft.minutes, label: 'MINUTOS' },
            { value: timeLeft.seconds, label: 'SEGUNDOS' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-[#c06d7d]/95 backdrop-blur-md rounded-none py-3 md:py-4 text-center text-white shadow-lg flex flex-col justify-center items-center"
            >
              <span className="text-2xl sm:text-3xl md:text-4xl font-montserrat font-medium tracking-tight leading-none">
                {String(item.value).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-[11px] md:text-xs font-montserrat font-normal tracking-[0.2em] uppercase mt-1">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ================= SECTION 2 & 3: ¿CUÁNDO? y ¿DÓNDE? (2 Columnas en PC) ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* ================= SECTION 2: ¿CUÁNDO? (Image 3) ================= */}
        <div className="bg-[#7e526a] text-white py-12 md:py-16 px-6 md:px-10 text-center space-y-4 flex flex-col justify-center items-center">
          {/* Minimalist wireframe calendar icon */}
          <div className="w-12 h-12 mx-auto flex items-center justify-center">
            <svg className="w-10 h-10 stroke-current text-white stroke-[1.2] fill-none" viewBox="0 0 24 24">
              <rect x="3" y="5" width="18" height="16" rx="1" />
              <line x1="3" y1="10" x2="21" y2="10" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="16" y1="2" x2="16" y2="6" />
            </svg>
          </div>

          <h2 className="text-2xl sm:text-3xl font-montserrat font-normal tracking-[0.16em] uppercase">
            ¿CUÁNDO?
          </h2>

          <div className="space-y-1">
            <p className="text-base sm:text-lg font-montserrat font-light tracking-[0.18em] uppercase">
              {config.fechaTexto || '10 DE OCTUBRE 2026'}
            </p>
            <p className="text-sm font-montserrat font-normal tracking-[0.2em]">
              | {config.horaTexto || '21:00 HS'} |
            </p>
          </div>

          <div className="pt-2">
            <a
              href={config.linkCalendar || googleCalendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block border border-white text-white px-7 py-2.5 text-[11px] font-montserrat tracking-[0.2em] uppercase hover:bg-white hover:text-[#7e526a] transition-all duration-300"
            >
              AGENDAR EN GOOGLE
            </a>
          </div>
        </div>

        {/* ================= SECTION 3: ¿DÓNDE? (Image 3) ================= */}
        <div className="bg-white text-[#7e526a] py-12 md:py-16 px-6 md:px-10 text-center space-y-4 flex flex-col justify-center items-center border-t md:border-t-0 md:border-l border-[#f0e2eb]">
          {/* Minimalist wireframe location pin icon */}
          <div className="w-12 h-12 mx-auto flex items-center justify-center">
            <svg className="w-10 h-10 stroke-current text-[#c06d7d] stroke-[1.2] fill-none" viewBox="0 0 24 24">
              <path d="M12 21s-7-6.5-7-11.5a7 7 0 0 1 14 0c0 5-7 11.5-7 11.5z" />
              <circle cx="12" cy="9.5" r="2.5" />
            </svg>
          </div>

          <h2 className="text-2xl sm:text-3xl font-montserrat font-normal tracking-[0.16em] uppercase text-[#7e526a]">
            ¿DÓNDE?
          </h2>

          <div className="space-y-1">
            <p className="text-base sm:text-lg font-montserrat font-normal tracking-[0.18em] uppercase text-[#7e526a]">
              {config.lugarNombre || 'CLAHE EVENTOS'}
            </p>
            <p className="text-xs font-montserrat font-light text-[#8e657b] tracking-wider max-w-[280px] mx-auto">
              {config.lugarDireccion || 'Calle 158 N° 4561 (e/ 45 y 46), Plátanos, Berazategui'}
            </p>
          </div>

          <div className="pt-2">
            <a
              href={config.linkMaps || mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block border border-[#c06d7d] text-[#c06d7d] px-7 py-2.5 text-[11px] font-montserrat tracking-[0.2em] uppercase hover:bg-[#c06d7d] hover:text-white transition-all duration-300"
            >
              COMO LLEGAR
            </a>
          </div>
        </div>
      </div>

      {/* ================= SECTION 4 & 5: DRESS CODE + FOTO (2 Columnas en PC) ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 items-stretch">
        {/* ================= SECTION 4: DRESS CODE (Image 4) ================= */}
        <div className="bg-[#7e526a] text-white py-12 md:py-16 px-6 md:px-10 text-center space-y-4 flex flex-col justify-center items-center">
          {/* Minimalist wireframe diamond icon */}
          <div className="w-12 h-12 mx-auto flex items-center justify-center">
            <svg className="w-10 h-10 stroke-current text-white stroke-[1.2] fill-none" viewBox="0 0 24 24">
              <path d="M6 3h12l4 7-10 11L2 10l4-7z" />
              <line x1="2" y1="10" x2="22" y2="10" />
              <line x1="12" y1="21" x2="8" y2="10" />
              <line x1="12" y1="21" x2="16" y2="10" />
              <line x1="6" y1="3" x2="8" y2="10" />
              <line x1="18" y1="3" x2="16" y2="10" />
            </svg>
          </div>

          <h2 className="text-2xl sm:text-3xl font-montserrat font-normal tracking-[0.16em] uppercase">
            DRESS CODE
          </h2>

          <div className="inline-block pb-1 border-b border-white px-4">
            <p className="text-base font-montserrat font-normal tracking-[0.2em] uppercase">
              {config.dressCodeTitulo || 'ELEGANTE'}
            </p>
          </div>

          <p className="text-[11px] sm:text-xs font-montserrat font-light tracking-[0.15em] uppercase text-white/90 max-w-[270px] mx-auto leading-relaxed pt-2">
            {config.dressCodeDescripcion || 'EL COLOR BLANCO SE RESERVA PARA LA QUINCEAÑERA'}
          </p>
        </div>

        {/* ================= SECTION 5: CELEBRATION PHOTO (Image 4 bottom) ================= */}
        <div className="w-full aspect-[4/5] md:aspect-auto md:h-full min-h-[360px] md:min-h-[460px] overflow-hidden bg-[#7e526a]">
          <img
            src={normalizeImageUrl(config.dressCodeImageUrl, LOCAL_IMAGES.dressCode)}
            alt="Elegancia"
            className="w-full h-full object-cover object-center transition-opacity duration-300"
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={(e) => handleImageError(e, LOCAL_IMAGES.dressCode)}
          />
        </div>
      </div>

      {/* ================= SECTION 6: QUOTE (Image 5 top) ================= */}
      <div className="bg-white py-14 md:py-20 px-8 text-center max-w-4xl mx-auto">
        {/* Top thin line */}
        <div className="w-full h-[1px] bg-[#c06d7d]/60 mb-6 md:mb-8"></div>

        <p className="text-[13px] sm:text-sm md:text-base font-montserrat font-normal tracking-[0.18em] text-[#c06d7d] uppercase leading-relaxed max-w-xl mx-auto">
          {config.fraseEmotiva || 'HAY MOMENTOS QUE NO SE PUEDEN BORRAR, PERSONAS QUE NO SE PUEDEN OLVIDAR Y RECUERDOS COMO ESTOS QUE SIEMPRE VOY A ATESORAR'}
        </p>

        {/* Bottom thin line */}
        <div className="w-full h-[1px] bg-[#c06d7d]/60 mt-6 md:mt-8"></div>
      </div>

      {/* ================= SECTION 7: REGALO (Image 5 bottom) ================= */}
      <div className="bg-[#7e526a] text-white py-12 md:py-16 px-6 text-center space-y-4">
        {/* Minimalist wireframe gift box icon with stars */}
        <div className="w-12 h-12 mx-auto flex items-center justify-center">
          <svg className="w-10 h-10 stroke-current text-white stroke-[1.2] fill-none" viewBox="0 0 24 24">
            <rect x="3" y="8" width="18" height="13" rx="1" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="12" y1="8" x2="12" y2="21" />
            <path d="M12 8c-2.5-3-5.5 0-2 2.5L12 8z" />
            <path d="M12 8c2.5-3 5.5 0 2 2.5L12 8z" />
          </svg>
        </div>

        <h2 className="text-2xl sm:text-3xl font-montserrat font-normal tracking-[0.16em] uppercase">
          REGALO
        </h2>

        <p className="text-[12px] sm:text-[13px] md:text-sm font-montserrat font-light tracking-[0.16em] uppercase leading-relaxed max-w-lg mx-auto text-white/95">
          {config.fraseRegalo || 'NADA ES MÁS IMPORTANTE QUE TU PRESENCIA, PERO SI DESEAS HACERME UN REGALO SERÁ RECIBIDO CON MUCHO AMOR. PODÉS HACERLO EN...'}
        </p>

        <div className="pt-2">
          <button
            onClick={() => setShowGiftDetails(!showGiftDetails)}
            className="border border-white text-white px-7 py-2.5 text-[11px] font-montserrat tracking-[0.2em] uppercase hover:bg-white hover:text-[#7e526a] transition-all duration-300"
          >
            {showGiftDetails ? 'OCULTAR DATOS' : 'VER DATOS BANCARIOS'}
          </button>
        </div>

        {/* Bank transfer drawer */}
        {showGiftDetails && (
          <div className="mt-4 p-5 md:p-6 rounded-none bg-white/10 border border-white/30 text-left text-xs space-y-2.5 max-w-md mx-auto animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white/80">ALIAS:</span>
              <span className="font-mono text-white font-bold tracking-wider">{config.aliasCbu || 'SOFIA.MIS15.CLAHE'}</span>
            </div>
            <div className="flex items-center justify-between text-white/80">
              <span>TITULAR:</span>
              <span className="font-medium text-white">{config.titularCbu || 'Sofía Álvarez / Familia'}</span>
            </div>
            <div className="flex items-center justify-between text-white/80">
              <span>BANCO:</span>
              <span className="font-medium text-white">{config.bancoNombre || 'Santander / Mercado Pago'}</span>
            </div>

            <div className="pt-2">
              <button
                onClick={copyAlias}
                className="w-full py-2 bg-white text-[#7e526a] text-xs font-bold tracking-widest uppercase hover:bg-[#f6d7e0] transition-colors flex items-center justify-center gap-1.5"
              >
                {copiedAlias ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAlias ? '¡ALIAS COPIADO!' : 'COPIAR ALIAS'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================= SECTION: BOOK DE FOTOS / GALERÍA DE RECUERDOS ================= */}
      <div className="bg-[#faf6f8] py-12 md:py-16 px-4 sm:px-6 md:px-8 border-y border-[#ede6eb]">
        <div className="max-w-4xl mx-auto text-center space-y-3 mb-8">
          <div className="w-10 h-10 mx-auto flex items-center justify-center text-[#c06d7d]">
            <Camera className="w-7 h-7 stroke-[1.4]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-montserrat font-normal tracking-[0.18em] uppercase text-[#7e526a]">
            BOOK DE FOTOS
          </h2>
          <div className="w-16 h-[1.5px] bg-[#c06d7d] mx-auto"></div>
          <p className="text-[11px] sm:text-xs font-montserrat text-[#7e526a]/80 tracking-[0.15em] uppercase">
            RECUERDOS DE MIS 15 • TOCÁ PARA AMPLIAR
          </p>
        </div>

        {/* 4 Photo Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto">
          {galleryPhotos.map((photoUrl, idx) => (
            <div
              key={idx}
              onClick={() => setActivePhotoIndex(idx)}
              className="group relative aspect-[3/4] overflow-hidden rounded-xs bg-[#7e526a]/15 cursor-pointer shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-[#e8dbe2]"
            >
              <img
                src={normalizeImageUrl(photoUrl, LOCAL_IMAGES.gallery[idx] || LOCAL_IMAGES.gallery[0])}
                alt={`Book Sofía foto ${idx + 1}`}
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                onError={(e) => handleImageError(e, LOCAL_IMAGES.gallery[idx] || LOCAL_IMAGES.gallery[0])}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                <span className="inline-flex items-center gap-1 text-white text-[10px] font-bold tracking-widest uppercase bg-black/50 backdrop-blur-xs px-2.5 py-1 rounded-xs self-center">
                  <Maximize2 className="w-3 h-3" />
                  <span>AMPLIAR</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= SECTION 8: CONFIRMÁ TU ASISTENCIA (Image 6) ================= */}
      <div id="rsvp-section" className="bg-[#7e526a] text-white py-12 px-6 text-center space-y-5">
        {/* Minimalist wireframe envelope with checkmark icon */}
        <div className="w-12 h-12 mx-auto flex items-center justify-center">
          <svg className="w-10 h-10 stroke-current text-white stroke-[1.2] fill-none" viewBox="0 0 24 24">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
            <circle cx="18" cy="16" r="3" fill="#7e526a" />
            <polyline points="16.5,16 17.5,17.2 19.5,14.8" />
          </svg>
        </div>

        <h2 className="text-2xl sm:text-3xl font-montserrat font-normal tracking-[0.16em] uppercase">
          CONFIRMÁ TU ASISTENCIA
        </h2>

        <p className="text-[12px] font-montserrat font-light tracking-[0.2em] uppercase text-white/90">
          ANTES DEL {config.fechaLimiteRsvp?.toUpperCase() || '20 DE SEPTIEMBRE 2026'}
        </p>

        {submitSuccess ? (
          /* Success confirmation block */
          <div className="p-6 bg-white/15 border border-white/40 text-center space-y-3 animate-fade-in">
            <div className="w-12 h-12 mx-auto rounded-full bg-white text-[#7e526a] flex items-center justify-center font-bold">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-montserrat font-bold uppercase tracking-wider">
              ¡CONFIRMACIÓN REGISTRADA!
            </h3>
            <p className="text-xs font-light text-white/90 leading-relaxed">
              Muchas gracias por confirmar. Tus datos y el menú especial ya están actualizados en tiempo real en la lista de Clahe Eventos.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setSubmitSuccess(false)}
                className="text-[11px] underline tracking-widest uppercase text-white/80 hover:text-white"
              >
                Confirmar otro invitado
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitRsvp} className="space-y-6 text-left pt-2">
            {errorMessage && (
              <div className="p-3 bg-rose-900/60 border border-rose-300 text-white text-xs">
                {errorMessage}
              </div>
            )}

            {/* Dropdown: NÚMERO DE PERSONAS A CONFIRMAR (Image 6) */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-montserrat font-medium tracking-[0.18em] uppercase text-white/90">
                NÚMERO DE PERSONAS A CONFIRMAR
              </label>
              <div className="relative">
                <select
                  value={numPersonas}
                  onChange={(e) => handleNumPersonasChange(Number(e.target.value))}
                  className="w-full bg-transparent border-b border-white text-white text-sm py-2 font-montserrat font-light focus:outline-none appearance-none cursor-pointer tracking-wider"
                >
                  <option value={1} className="bg-[#7e526a] text-white">1 PERSONA</option>
                  <option value={2} className="bg-[#7e526a] text-white">2 PERSONAS</option>
                  <option value={3} className="bg-[#7e526a] text-white">3 PERSONAS</option>
                  <option value={4} className="bg-[#7e526a] text-white">4 PERSONAS</option>
                  <option value={5} className="bg-[#7e526a] text-white">5 PERSONAS</option>
                  <option value={6} className="bg-[#7e526a] text-white">6 PERSONAS</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-white">
                  <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Guests Repeater Cards (Image 6) */}
            {guests.map((guest, idx) => (
              <div
                key={idx}
                className="space-y-4 pt-2"
              >
                <h3 className="text-xs font-montserrat font-bold tracking-[0.2em] uppercase text-white">
                  INVITADO {idx + 1}
                </h3>

                {/* Subcard with soft mauve background matching image 6 */}
                <div className="bg-white/15 p-5 space-y-4">
                  {/* Nombre */}
                  <div className="space-y-1">
                    <input
                      type="text"
                      required
                      value={guest.nombre}
                      onChange={(e) => updateGuest(idx, 'nombre', e.target.value)}
                      placeholder="NOMBRE *"
                      className="w-full bg-transparent border-b border-white/70 text-white placeholder-white/70 text-xs py-2 font-montserrat font-light focus:outline-none focus:border-white tracking-widest uppercase"
                    />
                  </div>

                  {/* Apellido */}
                  <div className="space-y-1">
                    <input
                      type="text"
                      required
                      value={guest.apellido}
                      onChange={(e) => updateGuest(idx, 'apellido', e.target.value)}
                      placeholder="APELLIDO *"
                      className="w-full bg-transparent border-b border-white/70 text-white placeholder-white/70 text-xs py-2 font-montserrat font-light focus:outline-none focus:border-white tracking-widest uppercase"
                    />
                  </div>

                  {/* Attendance buttons: ¡CONFIRMO! / NO PODRÉ ASISTIR */}
                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      onClick={() => updateGuest(idx, 'asiste', true)}
                      className={`w-full py-2.5 rounded-full border text-xs font-montserrat tracking-[0.2em] uppercase transition-all ${
                        guest.asiste
                          ? 'bg-white text-[#7e526a] border-white font-bold shadow-sm'
                          : 'border-white text-white hover:bg-white/10'
                      }`}
                    >
                      ¡CONFIRMO!
                    </button>

                    <button
                      type="button"
                      onClick={() => updateGuest(idx, 'asiste', false)}
                      className={`w-full py-2.5 rounded-full border text-xs font-montserrat tracking-[0.2em] uppercase transition-all ${
                        !guest.asiste
                          ? 'bg-white text-[#7e526a] border-white font-bold shadow-sm'
                          : 'border-white text-white hover:bg-white/10'
                      }`}
                    >
                      NO PODRÉ ASISTIR
                    </button>
                  </div>

                  {/* Question for dietary condition (As requested by user!) */}
                  {guest.asiste && (
                    <div className="space-y-2 pt-2 border-t border-white/20">
                      <label className="block text-[11px] font-montserrat font-semibold tracking-wider uppercase text-white">
                        ¿TIENE ALGUNA CONDICIÓN ALIMENTARIA O REQUERIMIENTO DE MENÚ? *
                      </label>
                      <select
                        value={guest.condicion}
                        onChange={(e) => updateGuest(idx, 'condicion', e.target.value as DietaryCondition)}
                        className="w-full bg-[#7e526a] border border-white/40 text-white text-xs p-2.5 focus:outline-none"
                      >
                        <option value="Ninguna (Menú tradicional)">Ninguna (Menú tradicional)</option>
                        <option value="Celíaco / Sin TACC">Celíaco / Sin TACC</option>
                        <option value="Vegetariano">Vegetariano</option>
                        <option value="Vegano">Vegano</option>
                        <option value="Diabético">Diabético</option>
                        <option value="Hipertenso / Sin sal">Hipertenso / Sin sal</option>
                        <option value="Intolerante a la lactosa">Intolerante a la lactosa</option>
                        <option value="Alergia alimentaria u otra">Alergia alimentaria u otra</option>
                      </select>

                      {(guest.condicion.includes('Alergia') || guest.condicion.includes('Celíaco')) && (
                        <input
                          type="text"
                          value={guest.detalleCondicion}
                          onChange={(e) => updateGuest(idx, 'detalleCondicion', e.target.value)}
                          placeholder="Especificar alergia (ej: mariscos, frutos secos, etc.)"
                          className="w-full bg-transparent border-b border-white/70 text-white placeholder-white/60 text-xs py-1.5 font-montserrat focus:outline-none"
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Teléfono de contacto */}
            <div className="space-y-1">
              <input
                type="tel"
                value={telefonoContacto}
                onChange={(e) => setTelefonoContacto(e.target.value)}
                placeholder="TELÉFONO O WHATSAPP DE CONTACTO"
                className="w-full bg-transparent border-b border-white/70 text-white placeholder-white/70 text-xs py-2 font-montserrat font-light focus:outline-none focus:border-white tracking-widest uppercase"
              />
            </div>

            {/* Song suggestion */}
            <div className="space-y-1">
              <input
                type="text"
                value={cancionSugerida}
                onChange={(e) => setCancionSugerida(e.target.value)}
                placeholder="¿QUÉ TEMA QUERÉS BAILAR EN LA FIESTA? (OPCIONAL)"
                className="w-full bg-transparent border-b border-white/70 text-white placeholder-white/70 text-xs py-2 font-montserrat font-light focus:outline-none focus:border-white tracking-widest uppercase"
              />
            </div>

            {/* Submit button */}
            <div className="pt-4 text-center max-w-md mx-auto">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-white text-[#7e526a] font-montserrat text-xs tracking-[0.25em] uppercase font-bold hover:bg-[#f6d7e0] transition-colors shadow-lg active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? 'ENVIANDO...' : 'ENVIAR RESPUESTA'}
              </button>
              <p className="text-[10px] text-white/75 tracking-wider mt-2">
                Queda registrado en tiempo real en la lista de confirmados
              </p>
            </div>
          </form>
        )}
      </div>

      {/* ================= SECTION 9: TE ESPERO PHOTO & FOOTER (Image 7) ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 items-stretch bg-white border-t border-[#ede6eb]">
        {/* Photo */}
        <div className="w-full aspect-[4/5] md:aspect-auto md:h-full min-h-[360px] md:min-h-[460px] overflow-hidden bg-[#7e526a]">
          <img
            src={normalizeImageUrl(config.finalImageUrl, LOCAL_IMAGES.final)}
            alt={config.nombreQuinceanera || "Sofía"}
            className="w-full h-full object-cover object-center transition-opacity duration-300"
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={(e) => handleImageError(e, LOCAL_IMAGES.final)}
          />
        </div>

        {/* White Footer Block */}
        <div className="bg-white py-14 md:py-16 px-6 md:px-10 text-center space-y-3 flex flex-col justify-center items-center">
          {/* Wireframe heart balloon icon (Image 7) - Secret 4-tap access for host */}
          <div
            onClick={handleSecretTrigger}
            title="Sofía"
            className="w-12 h-12 mx-auto flex items-center justify-center cursor-default select-none transition-transform active:scale-90"
          >
            <svg className="w-8 h-10 stroke-current text-[#c06d7d] stroke-[1.2] fill-none" viewBox="0 0 24 30">
              <path d="M12 18 C7 14, 2 10, 2 6 C2 2.7, 4.7 0, 8 0 C10 0, 11.5 1, 12 2.5 C12.5 1, 14 0, 16 0 C19.3 0, 22 2.7, 22 6 C22 10, 17 14, 12 18 Z" />
              <path d="M12 18 L11 20 L13 20 Z" />
              <path d="M12 20 Q10 24, 13 27 Q11 29, 12 30" />
            </svg>
          </div>

          <h3 className="text-xl sm:text-2xl md:text-3xl font-montserrat font-normal tracking-[0.16em] uppercase text-[#c06d7d]">
            TE ESPERO
          </h3>

          <p className="font-script text-[#c06d7d] text-6xl sm:text-7xl md:text-8xl -mt-1">
            {config.nombreQuinceanera || 'Sofía'}
          </p>

          {/* Clean minimal closing note */}
          <div className="pt-4 space-y-1">
            <p className="text-[11px] font-montserrat font-medium tracking-[0.2em] text-[#8e657b] uppercase">
              {config.fechaTexto || '10 DE OCTUBRE DE 2026'} &bull; {config.lugarNombre || 'CLAHE EVENTOS'}
            </p>
            <p className="text-[10px] font-montserrat font-light tracking-[0.2em] text-[#b395a5] uppercase">
              {config.lugarDireccion || 'Berazategui, Buenos Aires'}
            </p>
            <div className="pt-3 flex justify-center">
              <button
                type="button"
                onClick={() => setShowSecretAccessModal(true)}
                className="text-[10px] text-[#bda8b4] hover:text-[#7e526a] tracking-widest uppercase flex items-center gap-1.5 transition-colors opacity-60 hover:opacity-100 py-1 px-2"
                title="Acceso para Anfitriones (/admin y /confirmados)"
              >
                <Lock className="w-3 h-3" />
                <span>Acceso Anfitriones</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Private Host Access Modal: Triggered via heart tap, Alt+A, or subtle host lock */}
      {showSecretAccessModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-[#e8dbe2] animate-in fade-in zoom-in-95 duration-200">
            <div className="w-10 h-10 mx-auto rounded-full bg-[#7e526a]/10 flex items-center justify-center text-[#7e526a]">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold tracking-widest uppercase text-[#7e526a]">
              Acceso Privado para Anfitriones
            </h4>
            <p className="text-xs text-[#666]">
              Panel de gestión y confirmaciones reservado para la quinceañera y organizadores.
            </p>
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowSecretAccessModal(false);
                  if (onNavigate) {
                    onNavigate('confirmados');
                  } else {
                    window.location.href = '/confirmados';
                  }
                }}
                className="block w-full py-3 bg-[#7e526a] text-white text-xs font-bold tracking-widest uppercase hover:bg-[#684156] transition-colors"
              >
                Ver Lista de Confirmados
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSecretAccessModal(false);
                  if (onNavigate) {
                    onNavigate('admin');
                  } else {
                    window.location.href = '/admin';
                  }
                }}
                className="block w-full py-3 border border-[#7e526a] text-[#7e526a] text-xs font-bold tracking-widest uppercase hover:bg-[#f7edf2] transition-colors"
              >
                Editar Contenido y Música (/admin)
              </button>
              <button
                type="button"
                onClick={() => setShowSecretAccessModal(false)}
                className="w-full py-2 text-xs text-[#999] hover:text-[#333] transition-colors pt-1"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal for Photo Gallery */}
      {activePhotoIndex !== null && (
        <div
          onClick={() => setActivePhotoIndex(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-fade-in"
        >
          <button
            onClick={() => setActivePhotoIndex(null)}
            className="absolute top-5 right-5 p-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors z-20"
            title="Cerrar"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={handlePrevPhoto}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/15 hover:bg-white/30 text-white transition-colors z-20"
            title="Foto anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[85vh] flex flex-col items-center select-none"
          >
            <img
              src={normalizeImageUrl(
                galleryPhotos[activePhotoIndex],
                LOCAL_IMAGES.gallery[activePhotoIndex] || LOCAL_IMAGES.gallery[0]
              )}
              alt={`Book Sofía foto ${activePhotoIndex + 1}`}
              className="max-h-[75vh] w-auto max-w-full rounded-xs object-contain shadow-2xl border border-white/20"
              loading="eager"
              decoding="async"
              referrerPolicy="no-referrer"
              onError={(e) =>
                handleImageError(
                  e,
                  LOCAL_IMAGES.gallery[activePhotoIndex] || LOCAL_IMAGES.gallery[0]
                )
              }
            />
            <p className="mt-3 text-xs sm:text-sm font-medium tracking-widest uppercase text-white/80">
              Foto {activePhotoIndex + 1} de {galleryPhotos.length} • Mis 15 Sofía
            </p>
          </div>

          <button
            onClick={handleNextPhoto}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/15 hover:bg-white/30 text-white transition-colors z-20"
            title="Foto siguiente"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
};
