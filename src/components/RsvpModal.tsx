import React, { useState } from 'react';
import { X, Check, Heart, Plus, Trash2, Utensils, AlertCircle, Music, MessageSquare, Phone, User, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DietaryCondition, GuestItem } from '../types';
import { submitRsvp } from '../services/api';

interface RsvpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DIETARY_OPTIONS: DietaryCondition[] = [
  'Ninguna (Menú tradicional)',
  'Celíaco / Sin TACC',
  'Vegetariano',
  'Vegano',
  'Diabético',
  'Hipertenso / Sin sal',
  'Intolerante a la lactosa',
  'Alergia alimentaria u otra',
];

export const RsvpModal: React.FC<RsvpModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [titularNombre, setTitularNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [asiste, setAsiste] = useState<boolean>(true);
  const [condicionTitular, setCondicionTitular] = useState<DietaryCondition>('Ninguna (Menú tradicional)');
  const [detalleCondicionTitular, setDetalleCondicionTitular] = useState('');
  const [acompanantes, setAcompanantes] = useState<GuestItem[]>([]);
  const [cancionSugerida, setCancionSugerida] = useState('');
  const [mensajeDedicatoria, setMensajeDedicatoria] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [sheetSynced, setSheetSynced] = useState(false);

  if (!isOpen) return null;

  const handleAddAcompanante = () => {
    const newGuest: GuestItem = {
      id: 'comp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      nombre: '',
      condicion: 'Ninguna (Menú tradicional)',
      detalleCondicion: '',
    };
    setAcompanantes([...acompanantes, newGuest]);
  };

  const handleUpdateAcompanante = (id: string, field: keyof GuestItem, value: any) => {
    setAcompanantes(
      acompanantes.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleRemoveAcompanante = (id: string) => {
    setAcompanantes(acompanantes.filter((item) => item.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!titularNombre.trim()) {
      setErrorMessage('Por favor ingresa tu nombre y apellido completo.');
      return;
    }

    if (asiste) {
      // Validate companion names if any
      for (let i = 0; i < acompanantes.length; i++) {
        if (!acompanantes[i].nombre.trim()) {
          setErrorMessage(`Por favor escribe el nombre del acompañante #${i + 1}.`);
          return;
        }
      }
    }

    setIsSubmitting(true);

    try {
      const res = await submitRsvp({
        titularNombre: titularNombre.trim(),
        telefono: telefono.trim(),
        asiste,
        condicionTitular,
        detalleCondicionTitular: detalleCondicionTitular.trim(),
        acompanantes: asiste ? acompanantes : [],
        cancionSugerida: cancionSugerida.trim(),
        mensajeDedicatoria: mensajeDedicatoria.trim(),
      });

      setSheetSynced(res.sheetSynced);
      setIsSubmitted(true);

      // Launch victory confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#3B82F6', '#EC4899', '#10B981'],
      });

      onSuccess();
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Ocurrió un error al guardar la confirmación. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate WhatsApp message to send confirmation directly to host if desired
  const generateWhatsAppConfirmation = () => {
    const listado = [
      `• Titular: ${titularNombre} (${condicionTitular}${detalleCondicionTitular ? ` - ${detalleCondicionTitular}` : ''})`,
      ...acompanantes.map((a, i) => `• Acompañante ${i + 1}: ${a.nombre} (${a.condicion}${a.detalleCondicion ? ` - ${a.detalleCondicion}` : ''})`),
    ].join('\n');

    const text = `¡Hola Sofi! 💖 Confirmo asistencia para tus 15 años en Clahe Eventos (10 de Octubre 2026):\n\n` +
      `Estado: ${asiste ? '¡SÍ, ASISTO! 🎉' : 'No podré asistir 😢'}\n` +
      (asiste ? `Total Personas: ${1 + acompanantes.length}\n` +
      `Detalle de Invitados y Menú:\n${listado}\n` +
      (cancionSugerida ? `Tema para el DJ: ${cancionSugerida}\n` : '') +
      (mensajeDedicatoria ? `Mensaje: "${mensajeDedicatoria}"\n` : '') : '') +
      `\n¡Nos vemos pronto! ✨`;

    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl my-6 rounded-3xl bg-gradient-to-b from-[#151a38] to-[#0c0f24] border border-amber-400/35 shadow-2xl text-white overflow-hidden">
        {/* Top decorative header */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-amber-900/20 border-b border-amber-400/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-white">
                Confirmación de Asistencia
              </h3>
              <p className="text-xs text-amber-300/80 font-medium">
                Mis 15 Sofía • Clahe Eventos
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {isSubmitted ? (
            /* Success confirmation screen */
            <div className="py-6 text-center space-y-5">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-400/40 flex items-center justify-center text-emerald-400 animate-bounce">
                <Check className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h4 className="text-2xl font-serif font-bold text-white">
                  {asiste ? '¡Gracias por confirmar!' : 'Mensaje registrado'}
                </h4>
                <p className="text-sm text-slate-300 max-w-sm mx-auto">
                  {asiste
                    ? `¡Qué alegría contar con vos, ${titularNombre}! Tu lugar y el menú de cada invitado ya quedaron guardados en tiempo real.`
                    : `Lamentamos que no puedas venir, ${titularNombre}. ¡Gracias por avisarnos con tiempo!`}
                </p>
              </div>

              {/* Real-time sync badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Actualizado en la lista del evento en tiempo real</span>
              </div>

              {/* Confirmation Details Card */}
              {asiste && (
                <div className="text-left p-4 rounded-2xl bg-[#0f132b] border border-slate-700/60 text-xs space-y-2">
                  <div className="font-semibold text-amber-300 uppercase tracking-wider mb-2">
                    Resumen registrado para Clahe Eventos:
                  </div>
                  <div>
                    <span className="text-slate-400">Titular:</span>{' '}
                    <span className="font-medium text-white">{titularNombre}</span>{' '}
                    <span className="text-amber-200">({condicionTitular})</span>
                  </div>
                  {acompanantes.map((a, i) => (
                    <div key={i}>
                      <span className="text-slate-400">Acompañante {i + 1}:</span>{' '}
                      <span className="font-medium text-white">{a.nombre}</span>{' '}
                      <span className="text-blue-300">({a.condicion})</span>
                    </div>
                  ))}
                  {cancionSugerida && (
                    <div className="pt-1 text-slate-300">
                      <span className="text-slate-400">Tema pedido:</span> 🎵 {cancionSugerida}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 flex flex-col gap-3">
                <a
                  href={generateWhatsAppConfirmation()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Enviar confirmación por WhatsApp a Sofía</span>
                </a>

                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          ) : (
            /* RSVP Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Attendance Choice Buttons */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-amber-200 uppercase tracking-wider">
                  ¿Asistirás a la fiesta? *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAsiste(true)}
                    className={`py-3 px-4 rounded-2xl border text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                      asiste
                        ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-lg shadow-amber-400/20'
                        : 'bg-[#10142c] text-slate-300 border-slate-700/60 hover:border-slate-500'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    <span>¡Sí, asistiré! 🎉</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAsiste(false)}
                    className={`py-3 px-4 rounded-2xl border text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                      !asiste
                        ? 'bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/20'
                        : 'bg-[#10142c] text-slate-300 border-slate-700/60 hover:border-slate-500'
                    }`}
                  >
                    <X className="w-4 h-4" />
                    <span>No podré ir 😢</span>
                  </button>
                </div>
              </div>

              {/* Titular Details */}
              <div className="space-y-4 p-4 rounded-2xl bg-[#0f132d]/80 border border-slate-700/50">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    <span>Tu Nombre y Apellido (Titular) *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={titularNombre}
                    onChange={(e) => setTitularNombre(e.target.value)}
                    placeholder="Ej: Lucía Pérez"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#161c3e] border border-slate-600/80 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-sm transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-400" />
                    <span>Teléfono o WhatsApp de contacto</span>
                  </label>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="Ej: 11 5566-7788"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#161c3e] border border-slate-600/80 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-sm transition-colors"
                  />
                </div>

                {/* Dietary condition for Titular */}
                {asiste && (
                  <div className="pt-2 border-t border-slate-700/60">
                    <label className="block text-xs font-medium text-amber-200 mb-1.5 flex items-center gap-1.5">
                      <Utensils className="w-3.5 h-3.5 text-amber-400" />
                      <span>Condición Alimentaria de {titularNombre.trim() || 'Titular'}:</span>
                    </label>
                    <select
                      value={condicionTitular}
                      onChange={(e) => setCondicionTitular(e.target.value as DietaryCondition)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#161c3e] border border-slate-600/80 text-white focus:outline-none focus:border-amber-400 text-sm transition-colors"
                    >
                      {DIETARY_OPTIONS.map((opt) => (
                        <option key={opt} value={opt} className="bg-[#12162e] text-white">
                          {opt}
                        </option>
                      ))}
                    </select>

                    {(condicionTitular.includes('Alergia') || condicionTitular.includes('Celíaco')) && (
                      <input
                        type="text"
                        value={detalleCondicionTitular}
                        onChange={(e) => setDetalleCondicionTitular(e.target.value)}
                        placeholder="Especificar detalle (ej: alergia a mariscos, frutos secos, etc.)"
                        className="mt-2 w-full px-3 py-2 rounded-xl bg-[#12162e] border border-amber-400/40 text-xs text-amber-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Companions Section (Only if attending) */}
              {asiste && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-amber-200 uppercase tracking-wider">
                        Acompañantes ({acompanantes.length})
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Agregá a tus acompañantes y la condición alimentaria de cada uno
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddAcompanante}
                      className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-400/30 text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Acompañante</span>
                    </button>
                  </div>

                  {acompanantes.map((comp, idx) => (
                    <div
                      key={comp.id}
                      className="p-4 rounded-2xl bg-[#0f132e] border border-slate-700/70 space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-300">
                          Acompañante #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAcompanante(comp.id)}
                          className="text-slate-400 hover:text-rose-400 p-1 transition-colors"
                          title="Eliminar acompañante"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Companion Name */}
                      <div>
                        <input
                          type="text"
                          required
                          value={comp.nombre}
                          onChange={(e) => handleUpdateAcompanante(comp.id, 'nombre', e.target.value)}
                          placeholder={`Nombre y Apellido del acompañante #${idx + 1}`}
                          className="w-full px-3.5 py-2 rounded-xl bg-[#161c3e] border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-xs"
                        />
                      </div>

                      {/* Companion Dietary condition */}
                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1 flex items-center gap-1">
                          <Utensils className="w-3 h-3 text-amber-400" />
                          <span>Condición alimentaria:</span>
                        </label>
                        <select
                          value={comp.condicion}
                          onChange={(e) => handleUpdateAcompanante(comp.id, 'condicion', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-[#161c3e] border border-slate-600 text-white focus:outline-none focus:border-amber-400 text-xs"
                        >
                          {DIETARY_OPTIONS.map((opt) => (
                            <option key={opt} value={opt} className="bg-[#12162e]">
                              {opt}
                            </option>
                          ))}
                        </select>

                        {(comp.condicion.includes('Alergia') || comp.condicion.includes('Celíaco')) && (
                          <input
                            type="text"
                            value={comp.detalleCondicion || ''}
                            onChange={(e) => handleUpdateAcompanante(comp.id, 'detalleCondicion', e.target.value)}
                            placeholder="Detalle de alergia / requerimiento del acompañante"
                            className="mt-1.5 w-full px-3 py-1.5 rounded-xl bg-[#12162e] border border-amber-400/40 text-[11px] text-amber-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Song suggestion & Message */}
              {asiste && (
                <div className="space-y-4 pt-1">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Music className="w-3.5 h-3.5 text-amber-400" />
                      <span>¿Qué canción no puede faltar para que bailes en la pista?</span>
                    </label>
                    <input
                      type="text"
                      value={cancionSugerida}
                      onChange={(e) => setCancionSugerida(e.target.value)}
                      placeholder="Ej: Dua Lipa - Levitating / Tiago PZK"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#161c3e] border border-slate-600/80 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-sm transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                      <span>Mensaje o dedicatoria para Sofía (Opcional)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={mensajeDedicatoria}
                      onChange={(e) => setMensajeDedicatoria(e.target.value)}
                      placeholder="Dejale unas lindas palabras a la quinceañera..."
                      className="w-full px-4 py-2.5 rounded-xl bg-[#161c3e] border border-slate-600/80 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-sm transition-colors resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-sm uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Heart className="w-4 h-4 fill-slate-950" />
                      <span>{asiste ? 'Confirmar Asistencia' : 'Enviar Respuesta'}</span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-center text-slate-400 mt-2">
                  Se actualizará automáticamente en la lista de confirmados de Clahe Eventos
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
