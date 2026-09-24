import React, { useState, useRef } from 'react';
import {
  Lock,
  Unlock,
  Save,
  RotateCcw,
  Music,
  FileText,
  MapPin,
  Image,
  Gift,
  Share2,
  Check,
  AlertTriangle,
  ArrowLeft,
  ExternalLink,
  Volume2,
  Play,
  Pause,
  Eye,
  Sparkles,
  Calendar,
  Instagram,
  FileSpreadsheet,
} from 'lucide-react';
import { AppConfig } from '../types';
import { saveConfig, DEFAULT_CONFIG } from '../services/api';
import { extractYouTubeId } from '../utils/youtube';
import { BackgroundMusicPlayer } from './BackgroundMusicPlayer';
import { LOCAL_IMAGES, normalizeImageUrl, handleImageError } from '../utils/imageUtils';

interface AdminPanelProps {
  config: AppConfig;
  onConfigSaved: (newConfig: AppConfig) => void;
  onBackToInvitation: () => void;
  onGoToConfirmados: () => void;
}

const PASSWORD_CORRECTA = 'EventoSofi2026';
const ADMIN_AUTH_KEY = 'sofia_admin_authenticated_v1';

// Preset music tracks supporting both YouTube links and direct MP3 audio
const PRESET_TRACKS = [
  {
    name: 'Ed Sheeran - Perfect (Vals de 15) [YouTube]',
    url: 'https://www.youtube.com/watch?v=2Vv-BfVoq4g',
  },
  {
    name: 'Chayanne - Tiempo de Vals [YouTube]',
    url: 'https://www.youtube.com/watch?v=8q2gC-fVq9c',
  },
  {
    name: 'Christina Perri - A Thousand Years [YouTube]',
    url: 'https://www.youtube.com/watch?v=rtOvBOTyX00',
  },
  {
    name: 'Coldplay - Viva La Vida (Violín / Vals) [YouTube]',
    url: 'https://www.youtube.com/watch?v=1lyu1KKwC74',
  },
  {
    name: 'Piano Cinematográfico Vals (MP3)',
    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-cinematic-piano-112191.mp3',
  },
  {
    name: 'Vals Acústico Suave de Quinceañera (MP3)',
    url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=acoustic-guitars-ambient-uplifting-10940.mp3',
  },
];

// Preset images for Quinceañera
const PRESET_HERO_IMAGES = [
  {
    name: 'Globos Corazón Rosa y Vestido (Actual)',
    url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Elegancia Gala Rosa Pastel',
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Luces y Flores de Fiesta',
    url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Celebración con Brillo y Destellos',
    url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
  },
];

// Preset images for the final closing section ("Te Espero")
const PRESET_FINAL_IMAGES = [
  {
    name: 'Vestido Gala Iluminado (Actual)',
    url: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1000&q=80',
  },
  {
    name: 'Sonrisa y Celebración',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80',
  },
  {
    name: 'Corona y Destellos de Princesa',
    url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=80',
  },
  {
    name: 'Brindis y Bengalas Doradas',
    url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1000&q=80',
  },
  {
    name: 'Rosa Gold Noche Mágica',
    url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1000&q=80',
  },
];

export const AdminPanel: React.FC<AdminPanelProps> = ({
  config,
  onConfigSaved,
  onBackToInvitation,
  onGoToConfirmados,
}) => {
  // Authentication
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Active admin tab
  const [activeTab, setActiveTab] = useState<
    'musica' | 'textos' | 'fechaylugar' | 'imagenes' | 'regalos' | 'redes'
  >('musica');

  // Form State
  const [formData, setFormData] = useState<AppConfig>({
    ...DEFAULT_CONFIG,
    ...config,
  });

  // Saving states
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Audio preview in admin
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === PASSWORD_CORRECTA) {
      setIsAuthenticated(true);
      setAuthError(false);
      localStorage.setItem(ADMIN_AUTH_KEY, 'true');
    } else {
      setAuthError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPasswordInput('');
    localStorage.removeItem(ADMIN_AUTH_KEY);
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      setIsPreviewPlaying(false);
    }
  };

  const handleChange = (field: keyof AppConfig, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setSaveSuccess(false);
  };

  const handleGalleryImageChange = (index: number, value: string) => {
    const updated = [...(formData.galeriaFotos || DEFAULT_CONFIG.galeriaFotos || [])];
    updated[index] = value;
    handleChange('galeriaFotos', updated);
  };

  const handleTogglePreviewAudio = () => {
    setIsPreviewPlaying((prev) => !prev);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const saved = await saveConfig(formData);
      onConfigSaved(saved);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      console.error(err);
      alert('Error al guardar los cambios.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefault = () => {
    if (
      window.confirm(
        '¿Estás seguro de restablecer todos los textos, imágenes y música a los valores originales de Sofía?'
      )
    ) {
      setFormData(DEFAULT_CONFIG);
      saveConfig(DEFAULT_CONFIG).then((saved) => {
        onConfigSaved(saved);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      });
    }
  };

  // ---------------------------------------------------------------------
  // SCREEN 1: PASSWORD LOCK SCREEN
  // ---------------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full bg-[#f7f2f5] flex items-center justify-center p-4 font-montserrat">
        <div className="w-full max-w-md bg-white border border-[#e8dbe2] shadow-2xl p-8 text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#7e526a]/10 border border-[#7e526a]/30 flex items-center justify-center text-[#7e526a]">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-[0.16em] uppercase text-[#7e526a]">
              Panel de Control /admin
            </h1>
            <p className="text-xs text-[#8e657b] tracking-wider uppercase mt-1">
              Edición de Textos, Canción, Fotos y Links
            </p>
          </div>

          <p className="text-xs text-[#666] leading-relaxed">
            Ingresá la contraseña de administrador para modificar en vivo la música, textos de la invitación, fotos, dirección y los links de los botones.
          </p>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-[11px] font-semibold tracking-widest uppercase text-[#7e526a] mb-1.5">
                Contraseña de Administrador
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setAuthError(false);
                  }}
                  placeholder="Ingresá la contraseña..."
                  className="w-full bg-[#faf5f8] border border-[#d9bdcb] text-[#2b2b2b] text-sm p-3 focus:outline-none focus:border-[#7e526a] tracking-wider transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#7e526a] underline"
                >
                  {showPassword ? 'Ocultar' : 'Ver'}
                </button>
              </div>
              {authError && (
                <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Contraseña incorrecta. Por favor verificá e intentá de nuevo.</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-[#7e526a] hover:bg-[#684156] active:scale-[0.98] text-white font-bold text-xs tracking-[0.25em] uppercase transition-all shadow-md"
            >
              INGRESAR AL PANEL ADMIN
            </button>
          </form>

          <div className="pt-2 flex items-center justify-center gap-4 text-xs">
            <button
              onClick={onBackToInvitation}
              className="text-[#7e526a] hover:underline inline-flex items-center gap-1 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a la invitación</span>
            </button>
            <span className="text-gray-300">•</span>
            <button
              onClick={onGoToConfirmados}
              className="text-[#7e526a] hover:underline inline-flex items-center gap-1 font-medium"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Ver confirmados</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------
  // SCREEN 2: ADMIN EDITING DASHBOARD
  // ---------------------------------------------------------------------
  return (
    <div className="min-h-screen w-full bg-[#f8f5f7] text-[#2b2b2b] font-montserrat pb-28">
      {/* Hidden audio element for preview */}
      <audio ref={previewAudioRef} src={formData.musicaUrl} />

      {/* Top Navbar */}
      <header className="bg-[#7e526a] text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToInvitation}
              className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors"
              title="Volver a la invitación"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-sm sm:text-base font-bold tracking-wider uppercase flex items-center gap-1.5">
                <span>Panel de Administración</span>
                <span className="px-2 py-0.5 text-[10px] bg-white/20 rounded font-normal">/admin</span>
              </h1>
              <p className="text-[10px] sm:text-[11px] text-white/80">
                Personalizá la música, textos, fotos y links de la invitación
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onGoToConfirmados}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold tracking-wider uppercase flex items-center gap-1.5 transition-colors hidden sm:flex"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Ver Confirmados</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-black/20 hover:bg-black/30 text-white text-xs font-semibold tracking-wider uppercase transition-colors"
            >
              Salir
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-6xl mx-auto px-4 flex items-center gap-1 overflow-x-auto text-xs no-scrollbar border-t border-white/10">
          {[
            { id: 'musica', label: 'Música', icon: Music },
            { id: 'textos', label: 'Textos y Frases', icon: FileText },
            { id: 'fechaylugar', label: 'Fecha y Salón', icon: MapPin },
            { id: 'imagenes', label: 'Fotos y Galería', icon: Image },
            { id: 'regalos', label: 'Regalos / CBU', icon: Gift },
            { id: 'redes', label: 'Redes y Links', icon: Share2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-2.5 font-semibold tracking-wider uppercase whitespace-nowrap flex items-center gap-1.5 border-b-2 transition-colors ${
                  isActive
                    ? 'border-white text-white bg-white/10'
                    : 'border-transparent text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        {/* Save feedback toast */}
        {saveSuccess && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-none flex items-center justify-between shadow-sm animate-fadeIn">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider">¡Cambios guardados con éxito!</p>
                <p className="text-[11px] text-emerald-700">La invitación y todos los visitantes ya ven la información actualizada.</p>
              </div>
            </div>
            <button
              onClick={onBackToInvitation}
              className="px-3 py-1 bg-emerald-700 text-white text-xs font-bold tracking-wider uppercase hover:bg-emerald-800 transition-colors"
            >
              Ver Invitación
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: MÚSICA DE FONDO */}
        {/* ========================================================================= */}
        {activeTab === 'musica' && (
          <div className="bg-white border border-[#e8dbe2] p-6 shadow-sm space-y-6">
            {/* Background Music Player for admin preview */}
            <BackgroundMusicPlayer
              url={formData.musicaUrl}
              isPlaying={isPreviewPlaying}
              onPlayStateChange={setIsPreviewPlaying}
            />

            <div className="border-b border-[#eee] pb-3">
              <h2 className="text-sm font-bold tracking-wider uppercase text-[#7e526a] flex items-center gap-2">
                <Music className="w-4 h-4 text-[#c06d7d]" />
                <span>Canción y Música de Fondo (YouTube o MP3)</span>
              </h2>
              <p className="text-xs text-[#666] mt-1">
                Podés poner un link de <strong>YouTube</strong> o un archivo <strong>MP3</strong>. La música sonará automáticamente cuando los invitados ingresen a la invitación.
              </p>
            </div>

            {/* Test Player Bar */}
            <div className="bg-[#faf5f8] border border-[#e8dbe2] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleTogglePreviewAudio}
                  className="w-12 h-12 rounded-full bg-[#7e526a] hover:bg-[#684156] text-white flex items-center justify-center shadow-md transition-transform active:scale-95 shrink-0"
                >
                  {isPreviewPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>
                <div>
                  <span className="text-[11px] font-bold text-[#7e526a] uppercase tracking-wider block">
                    {isPreviewPlaying ? 'Reproduciendo audio de prueba...' : 'Escuchar audio configurado'}
                  </span>
                  <span className="text-xs text-[#555] font-medium">
                    {formData.musicaTitulo || 'Romantic Cinematic Piano'}
                  </span>
                </div>
              </div>
              <span className="text-[11px] text-[#888]">
                {extractYouTubeId(formData.musicaUrl)
                  ? '🎵 Modo YouTube activo'
                  : '🎵 Modo Audio Directo (MP3)'}
              </span>
            </div>

            {/* Song Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7e526a] mb-1">
                Título o Nombre de la Canción
              </label>
              <input
                type="text"
                value={formData.musicaTitulo || ''}
                onChange={(e) => handleChange('musicaTitulo', e.target.value)}
                placeholder="Ej: Ed Sheeran - Perfect o Vals de los 15"
                className="w-full bg-[#faf6f8] border border-[#d9bdcb] p-2.5 text-xs text-[#2b2b2b] focus:outline-none focus:border-[#7e526a]"
              />
            </div>

            {/* Song Direct URL or YouTube link */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7e526a] mb-1">
                Link de YouTube o Enlace de Audio (MP3)
              </label>
              <input
                type="text"
                value={formData.musicaUrl || ''}
                onChange={(e) => handleChange('musicaUrl', e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... o https://youtu.be/... o archivo .mp3"
                className="w-full bg-[#faf6f8] border border-[#d9bdcb] p-2.5 text-xs text-[#2b2b2b] focus:outline-none focus:border-[#7e526a] font-mono"
              />
              {extractYouTubeId(formData.musicaUrl) ? (
                <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-[11px] flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    ¡Link de YouTube válido detectado! (Video ID: <strong>{extractYouTubeId(formData.musicaUrl)}</strong>). La canción sonará directamente desde YouTube sin cortes.
                  </span>
                </div>
              ) : (
                <span className="text-[11px] text-[#888] mt-1 block">
                  Pegá cualquier link de YouTube (videos normales, shorts o música) o un archivo directo MP3. ¡Listo, sonará esa canción!
                </span>
              )}
            </div>

            {/* Presets */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7e526a] mb-2">
                Opciones Recomendadas para Quinceañera (Hacé clic para aplicar):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PRESET_TRACKS.map((track, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      handleChange('musicaUrl', track.url);
                      handleChange('musicaTitulo', track.name);
                    }}
                    className={`p-3 text-left border text-xs transition-colors flex items-center justify-between ${
                      formData.musicaUrl === track.url
                        ? 'border-[#7e526a] bg-[#7e526a]/10 text-[#7e526a] font-bold'
                        : 'border-[#e0d3db] hover:bg-[#faf5f8] text-[#555]'
                    }`}
                  >
                    <span>{track.name}</span>
                    {formData.musicaUrl === track.url && <Check className="w-4 h-4 text-[#7e526a]" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: TEXTOS Y FRASES */}
        {/* ========================================================================= */}
        {activeTab === 'textos' && (
          <div className="bg-white border border-[#e8dbe2] p-6 shadow-sm space-y-6">
            <div className="border-b border-[#eee] pb-3">
              <h2 className="text-sm font-bold tracking-wider uppercase text-[#7e526a] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#c06d7d]" />
                <span>Textos Principales y Frases Emotivas</span>
              </h2>
              <p className="text-xs text-[#666] mt-1">
                Editá todos los encabezados, mensajes y textos que verán los invitados.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7e526a] mb-1">
                  Nombre de la Quinceañera
                </label>
                <input
                  type="text"
                  value={formData.nombreQuinceanera || ''}
                  onChange={(e) => handleChange('nombreQuinceanera', e.target.value)}
                  className="w-full bg-[#faf6f8] border border-[#d9bdcb] p-2.5 text-xs text-[#2b2b2b] focus:outline-none focus:border-[#7e526a]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7e526a] mb-1">
                  Título de la Portada
                </label>
                <input
                  type="text"
                  value={formData.tituloIngreso || ''}
                  onChange={(e) => handleChange('tituloIngreso', e.target.value)}
                  className="w-full bg-[#faf6f8] border border-[#d9bdcb] p-2.5 text-xs text-[#2b2b2b] focus:outline-none focus:border-[#7e526a]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7e526a] mb-1">
                Frase de la Pantalla de Ingreso (Antes de pulsar INGRESAR)
              </label>
              <textarea
                rows={2}
                value={formData.fraseIngreso || ''}
                onChange={(e) => handleChange('fraseIngreso', e.target.value)}
                className="w-full bg-[#faf6f8] border border-[#d9bdcb] p-2.5 text-xs text-[#2b2b2b] focus:outline-none focus:border-[#7e526a]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7e526a] mb-1">
                Frase Emotiva Central
              </label>
              <textarea
                rows={3}
                value={formData.fraseEmotiva || ''}
                onChange={(e) => handleChange('fraseEmotiva', e.target.value)}
                className="w-full bg-[#faf6f8] border border-[#d9bdcb] p-2.5 text-xs text-[#2b2b2b] focus:outline-none focus:border-[#7e526a]"
              />
            </div>

            <div className="border-t border-[#eee] pt-4 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#7e526a]">
                Código de Vestimenta (Dress Code)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#7e526a] mb-1">
                    Título de Dress Code
                  </label>
                  <input
                    type="text"
                    value={formData.dressCodeTitulo || ''}
                    onChange={(e) => handleChange('dressCodeTitulo', e.target.value)}
                    className="w-full bg-[#faf6f8] border border-[#d9bdcb] p-2.5 text-xs text-[#2b2b2b] focus:outline-none focus:border-[#7e526a]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#7e526a] mb-1">
                    Aclaración de Color / Reservas
                  </label>
                  <input
                    type="text"
                    value={formData.dressCodeDescripcion || ''}
                    onChange={(e) => handleChange('dressCodeDescripcion', e.target.value)}
                    className="w-full bg-[#faf6f8] border border-[#d9bdcb] p-2.5 text-xs text-[#2b2b2b] focus:outline-none focus:border-[#7e526a]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: FECHA, SALÓN Y LINKS DE BOTONES */}
        {/* ========================================================================= */}
        {activeTab === 'fechaylugar' && (
          <div className="bg-white border border-[#e8dbe2] p-6 shadow-sm space-y-6">
            <div className="border-b border-[#eee] pb-3">
              <h2 className="text-sm font-bold tracking-wider uppercase text-[#7e526a] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#c06d7d]" />
                <span>Fecha, Salón y Botones de Ubicación</span>
              </h2>
              <p className="text-xs text-[#666] mt-1">
                Configurá el horario, la dirección y a qué links redirigen los botones "CÓMO LLEGAR" y "AGENDAR".
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7e526a] mb-1">
                  Fecha Visible (Texto)
                </label>
                <input
                  type="text"
                  value={formData.fechaTexto || ''}
                  onChange={(e) => handleChange('fechaTexto', e.target.value)}
                  placeholder="Ej: 10 DE OCTUBRE DE 2026"
                  className="w-full bg-[#faf6f8] border border-[#d9bdcb] p-2.5 text-xs text-[#2b2b2b] focus:outline-none focus:border-[#7e526a]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7e526a] mb-1">
                  Horario de Inicio (Texto)
                </label>
                <input
                  type="text"
                  value={formData.horaTexto || ''}
                  onChange={(e) => handleChange('horaTexto', e.target.value)}
                  placeholder="Ej: 21:00 HS"
                  className="w-full bg-[#faf6f8] border border-[#d9bdcb] p-2.5 text-xs text-[#2b2b2b] focus:outline-none focus:border-[#7e526a]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7e526a] mb-1">
                  Fecha y Hora de Cuenta Regresiva (En vivo)
                </label>
                <input
                  type="datetime-local"
                  value={formData.fechaIsoCountdown?.slice(0, 16) || '2026-10-10T21:00'}
                  onChange={(e) => handleChange('fechaIsoCountdown', e.target.value)}
                  className="w-full bg-[#faf6f8] border border-[#d9bdcb] p-2.5 text-xs text-[#2b2b2b] focus:outline-none focus:border-[#7e526a]"
                />
                <span className="text-[11px] text-[#888] mt-1 block">
                  El reloj calculará los días, horas y minutos exactos hasta este momento.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7e526a] mb-1">
                  Fecha Límite de Confirmación (RSVP)
                </label>
                <input
                  type="text"
                  value={formData.fechaLimiteRsvp || ''}
                  onChange={(e) => handleChange('fechaLimiteRsvp', e.target.value)}
                  placeholder="Ej: 20 de Septiembre de 2026"
                  className="w-full bg-[#faf6f8] border border-[#d9bdcb] p-2.5 text-xs text-[#2b2b2b] focus:outline-none focus:border-[#7e526a]"
                />
              </div>
            </div>

            <div className="border-t border-[#eee] pt-4 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#7e526a]">
                Datos del Salón de Eventos
              </h3>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7e526a] mb-1">
                  Nombre del Salón
                </label>
                <input
                  type="text"
                  value={formData.lugarNombre || ''}
                  onChange={(e) => handleChange('lugarNombre', e.target.value)}
                  placeholder="Ej: Clahe Eventos"
                  className="w-full bg-[#faf6f8] border border-[#d9bdcb] p-2.5 text-xs text-[#2b2b2b] focus:outline-none focus:border-[#7e526a]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7e526a] mb-1">
                  Dirección Completa
                </label>
                <input
                  type="text"
                  value={formData.lugarDireccion || ''}
                  onChange={(e) => handleChange('lugarDireccion', e.target.value)}
                  placeholder="Ej: Calle 158 N° 4561 (e/ 45 y 46), Plátanos, Berazategui"
                  className="w-full bg-[#faf6f8] border border-[#d9bdcb] p-2.5 text-xs text-[#2b2b2b] focus:outline-none focus:border-[#7e526a]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7e526a] mb-1">
                  Link del Botón "CÓMO LLEGAR" (Google Maps)
                </label>
                <input
                  type="text"
                  value={formData.linkMaps || ''}
                  onChange={(e) => handleChange('linkMaps', e.target.value)}
                  placeholder="https://maps.google.com/?q=..."
                  className="w-full bg-[#faf6f8] border border-[#d9bdcb] p-2.5 text-xs text-[#2b2b2b] focus:outline-none focus:border-[#7e526a] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7e526a] mb-1">
                  Link del Botón "AGENDAR" (Google Calendar)
                </label>
                <input
                  type="text"
                  value={formData.linkCalendar || ''}
                  onChange={(e) => handleChange('linkCalendar', e.target.value)}
                  placeholder="https://calendar.google.com/..."
                  className="w-full bg-[#faf6f8] border border-[#d9bdcb] p-2.5 text-xs text-[#2b2b2b] focus:outline-none focus:border-[#7e526a] font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: IMÁGENES Y FOTOS */}
        {/* ========================================================================= */}
        {activeTab === 'imagenes' && (
          <div className="bg-white border border-[#e8dbe2] p-6 shadow-sm space-y-6">
            <div className="border-b border-[#eee] pb-3">
              <h2 className="text-sm font-bold tracking-wider uppercase text-[#7e526a] flex items-center gap-2">
                <Image className="w-4 h-4 text-[#c06d7d]" />
                <span>Imágenes de la Tarjeta y Galería</span>
              </h2>
              <p className="text-xs text-[#666] mt-1">
                Podés pegar URLs de tus fotos (de Unsplash, Imgur, Google Drive público o tu servidor).
              </p>
            </div>

            {/* Portada Principal */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7e526a]">
                Foto de Portada Principal (Hero)
              </label>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="w-32 h-44 border border-[#e8dbe2] overflow-hidden bg-gray-100 shrink-0 shadow-sm">
                  <img
                    src={normalizeImageUrl(formData.heroImageUrl, LOCAL_IMAGES.hero)}
                    alt="Preview Portada"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => handleImageError(e, LOCAL_IMAGES.hero)}
                  />
                </div>
                <div className="flex-1 space-y-2 w-full">
                  <input
                    type="text"
                    value={formData.heroImageUrl || ''}
                    onChange={(e) => handleChange('heroImageUrl', e.target.value)}
                    placeholder="/images/hero.jpg o link directo..."
                    className="w-full bg-[#faf6f8] border border-[#d9bdcb] p-2.5 text-xs text-[#2b2b2b] focus:outline-none focus:border-[#7e526a] font-mono"
                  />
                  <div className="flex flex-wrap gap-2 pt-1">
                    {PRESET_HERO_IMAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleChange('heroImageUrl', preset.url)}
                        className="text-[10px] px-2.5 py-1 bg-[#faf6f8] border border-[#d9bdcb] hover:bg-[#7e526a] hover:text-white transition-colors"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Dress code photo */}
            <div className="border-t border-[#eee] pt-4 space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7e526a]">
                Foto Sección Dress Code (Elegante)
              </label>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="w-24 h-24 border border-[#e8dbe2] overflow-hidden bg-gray-100 shrink-0 shadow-sm">
                  <img
                    src={normalizeImageUrl(formData.dressCodeImageUrl, LOCAL_IMAGES.dressCode)}
                    alt="Dress code preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => handleImageError(e, LOCAL_IMAGES.dressCode)}
                  />
                </div>
                <div className="flex-1 w-full">
                  <input
                    type="text"
                    value={formData.dressCodeImageUrl || ''}
                    onChange={(e) => handleChange('dressCodeImageUrl', e.target.value)}
                    className="w-full bg-[#faf6f8] border border-[#d9bdcb] p-2.5 text-xs text-[#2b2b2b] focus:outline-none focus:border-[#7e526a] font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Galería de 4 Fotos */}
            <div className="border-t border-[#eee] pt-4 space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7e526a]">
                Galería de Fotos (4 imágenes)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[0, 1, 2, 3].map((index) => {
                  const currentImg =
                    formData.galeriaFotos?.[index] ||
                    DEFAULT_CONFIG.galeriaFotos?.[index] ||
                    LOCAL_IMAGES.gallery[index];
                  return (
                    <div key={index} className="flex items-center gap-3 bg-[#faf6f8] p-2 border border-[#e8dbe2]">
                      <div className="w-14 h-14 bg-gray-200 overflow-hidden shrink-0 border border-gray-300">
                        <img
                          src={normalizeImageUrl(currentImg, LOCAL_IMAGES.gallery[index])}
                          alt={`Foto ${index + 1}`}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => handleImageError(e, LOCAL_IMAGES.gallery[index])}
                        />
                      </div>
                      <div className="flex-1">
                        <span className="text-[10px] font-bold text-[#7e526a] uppercase block">
                          Foto {index + 1}
                        </span>
                        <input
                          type="text"
                          value={currentImg}
                          onChange={(e) => handleGalleryImageChange(index, e.target.value)}
                          className="w-full bg-white border border-[#d9bdcb] p-1.5 text-[11px] text-[#2b2b2b] focus:outline-none focus:border-[#7e526a] font-mono mt-1"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Última Foto del Final (Sección 'Te Espero') */}
            <div className="border-t border-[#eee] pt-4 space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7e526a]">
                Última Foto del Final de la Web (Sección "Te espero")
              </label>
              <p className="text-[11px] text-[#666]">
                Esta es la foto grande que acompaña el mensaje final de despedida y agradecimiento de la quinceañera.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="w-28 h-36 border border-[#e8dbe2] overflow-hidden bg-gray-100 shrink-0 shadow-sm">
                  <img
                    src={normalizeImageUrl(formData.finalImageUrl, LOCAL_IMAGES.final)}
                    alt="Preview Foto Final"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => handleImageError(e, LOCAL_IMAGES.final)}
                  />
                </div>
                <div className="flex-1 space-y-2 w-full">
                  <input
                    type="text"
                    value={formData.finalImageUrl || ''}
                    onChange={(e) => handleChange('finalImageUrl', e.target.value)}
                    placeholder="https://images.unsplash.com/... (o link directo a tu foto)"
                    className="w-full bg-[#faf6f8] border border-[#d9bdcb] p-2.5 text-xs text-[#2b2b2b] focus:outline-none focus:border-[#7e526a] font-mono"
                  />
                  <div className="flex flex-wrap gap-2 pt-1">
                    {PRESET_FINAL_IMAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleChange('finalImageUrl', preset.url)}
                        className="text-[10px] px-2.5 py-1 bg-[#faf6f8] border border-[#d9bdcb] hover:bg-[#7e526a] hover:text-white transition-colors"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: REGALOS Y DATOS BANCARIOS */}
        {/* ========================================================================= */}
        {activeTab === 'regalos' && (
          <div className="bg-white border border-[#e8dbe2] p-6 shadow-sm space-y-6">
            <div className="border-b border-[#eee] pb-3">
              <h2 className="text-sm font-bold tracking-wider uppercase text-[#7e526a] flex items-center gap-2">
                <Gift className="w-4 h-4 text-[#c06d7d]" />
                <span>Datos Bancarios y Regalo</span>
              </h2>
              <p className="text-xs text-[#666] mt-1">
                Información para los invitados que quieran colaborar con regalos mediante transferencia.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7e526a] mb-1">
                Frase de Regalo
              </label>
              <textarea
                rows={2}
                value={formData.fraseRegalo || ''}
                onChange={(e) => handleChange('fraseRegalo', e.target.value)}
                className="w-full bg-[#faf6f8] border border-[#d9bdcb] p-2.5 text-xs text-[#2b2b2b] focus:outline-none focus:border-[#7e526a]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7e526a] mb-1">
                  Alias CBU / Mercado Pago (Para copiar con un clic)
                </label>
                <input
                  type="text"
                  value={formData.aliasCbu || ''}
                  onChange={(e) => handleChange('aliasCbu', e.target.value)}
                  placeholder="SOFIA.MIS15.CLAHE"
                  className="w-full bg-[#faf6f8] border border-[#d9bdcb] p-2.5 text-xs text-[#2b2b2b] focus:outline-none focus:border-[#7e526a] font-bold text-[#7e526a]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7e526a] mb-1">
                  Titular de la Cuenta
                </label>
                <input
                  type="text"
                  value={formData.titularCbu || ''}
                  onChange={(e) => handleChange('titularCbu', e.target.value)}
                  placeholder="Sofía Álvarez / Familia"
                  className="w-full bg-[#faf6f8] border border-[#d9bdcb] p-2.5 text-xs text-[#2b2b2b] focus:outline-none focus:border-[#7e526a]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7e526a] mb-1">
                  Banco / Billetera Virtual
                </label>
                <input
                  type="text"
                  value={formData.bancoNombre || ''}
                  onChange={(e) => handleChange('bancoNombre', e.target.value)}
                  placeholder="Banco Santander / Mercado Pago"
                  className="w-full bg-[#faf6f8] border border-[#d9bdcb] p-2.5 text-xs text-[#2b2b2b] focus:outline-none focus:border-[#7e526a]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7e526a] mb-1">
                  CBU Completo (Opcional)
                </label>
                <input
                  type="text"
                  value={formData.cbuCompleto || ''}
                  onChange={(e) => handleChange('cbuCompleto', e.target.value)}
                  placeholder="0720123488000034567891"
                  className="w-full bg-[#faf6f8] border border-[#d9bdcb] p-2.5 text-xs text-[#2b2b2b] focus:outline-none focus:border-[#7e526a] font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: REDES, INSTAGRAM Y GOOGLE SHEETS */}
        {/* ========================================================================= */}
        {activeTab === 'redes' && (
          <div className="bg-white border border-[#e8dbe2] p-6 shadow-sm space-y-6">
            <div className="border-b border-[#eee] pb-3">
              <h2 className="text-sm font-bold tracking-wider uppercase text-[#7e526a] flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#c06d7d]" />
                <span>Instagram y Google Sheets Webhook</span>
              </h2>
              <p className="text-xs text-[#666] mt-1">
                Conectá el Instagram de la fiesta y la sincronización con tu planilla de Google Sheets.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7e526a] mb-1">
                  Usuario de Instagram (Tag visible)
                </label>
                <input
                  type="text"
                  value={formData.instagramTag || ''}
                  onChange={(e) => handleChange('instagramTag', e.target.value)}
                  placeholder="@sofi_mis15"
                  className="w-full bg-[#faf6f8] border border-[#d9bdcb] p-2.5 text-xs text-[#2b2b2b] focus:outline-none focus:border-[#7e526a]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7e526a] mb-1">
                  Link del Botón "SEGUIR EN INSTAGRAM"
                </label>
                <input
                  type="text"
                  value={formData.instagramUrl || ''}
                  onChange={(e) => handleChange('instagramUrl', e.target.value)}
                  placeholder="https://instagram.com/sofi_mis15"
                  className="w-full bg-[#faf6f8] border border-[#d9bdcb] p-2.5 text-xs text-[#2b2b2b] focus:outline-none focus:border-[#7e526a] font-mono"
                />
              </div>
            </div>

            <div className="border-t border-[#eee] pt-4 space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7e526a]">
                URL Webhook de Google Sheets (Google Apps Script)
              </label>
              <input
                type="text"
                value={formData.googleSheetsWebhookUrl || ''}
                onChange={(e) => handleChange('googleSheetsWebhookUrl', e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full bg-[#faf6f8] border border-[#d9bdcb] p-2.5 text-xs text-[#2b2b2b] focus:outline-none focus:border-[#7e526a] font-mono"
              />
              <p className="text-[11px] text-[#666] leading-relaxed">
                Si configurás un Google Apps Script Webhook, cada confirmación recibida se enviará de inmediato a tu hoja de cálculo con el nombre del titular, acompañantes y condición alimentaria.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* BOTTOM ACTION BAR (GUARDAR / RESTABLECER / VER) */}
        {/* ========================================================================= */}
        <div className="bg-white border border-[#e8dbe2] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md sticky bottom-4 z-30">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-[#555] text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 transition-colors border border-gray-300 w-full sm:w-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Valores Iniciales</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onBackToInvitation}
              className="px-4 py-3 bg-[#faf5f8] hover:bg-[#f2e6ed] text-[#7e526a] border border-[#d9bdcb] text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 transition-colors w-full sm:w-auto"
            >
              <Eye className="w-4 h-4" />
              <span>Ver Invitación</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-7 py-3 bg-[#7e526a] hover:bg-[#684156] active:scale-[0.98] text-white text-xs font-bold tracking-[0.2em] uppercase flex items-center justify-center gap-2 shadow-lg transition-all w-full sm:w-auto"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
