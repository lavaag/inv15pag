import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Lock,
  Unlock,
  KeyRound,
  FileSpreadsheet,
  FileText,
  Image,
  Printer,
  Search,
  Filter,
  RefreshCw,
  LogOut,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Heart,
  Music,
  Share2,
  Copy,
  Check,
  ArrowLeft,
  Users,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { RsvpRecord, DietarySummary, AppConfig } from '../types';
import { exportToExcelCsv, saveConfig } from '../services/api';
import {
  exportToWordDocument,
  exportToTxtDocument,
  generateFormattedGuestListText,
  formatGuestRecordSingleLine,
} from '../utils/exportFormatters';

interface ConfirmedPageProps {
  records: RsvpRecord[];
  summary: DietarySummary;
  config: AppConfig;
  onRefresh: () => void;
  onBackToInvitation?: () => void;
  onGoToAdmin?: () => void;
}

const PASSWORD_CORRECTA = 'EventoSofi2026';
const AUTH_STORAGE_KEY = 'sofia_confirmed_authenticated_v1';

export const ConfirmedPage: React.FC<ConfirmedPageProps> = ({
  records,
  summary,
  config,
  onRefresh,
  onBackToInvitation,
  onGoToAdmin,
}) => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('todos');
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [isExportingPng, setIsExportingPng] = useState(false);

  // Hidden canvas for PNG export
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Handle password submission
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === PASSWORD_CORRECTA) {
      setIsAuthenticated(true);
      setAuthError(false);
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
    } else {
      setAuthError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPasswordInput('');
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const searchLower = searchTerm.toLowerCase();
      const matchSearch =
        r.titularNombre.toLowerCase().includes(searchLower) ||
        r.telefono.toLowerCase().includes(searchLower) ||
        r.acompanantes.some((a) => a.nombre.toLowerCase().includes(searchLower));

      if (!matchSearch) return false;

      if (selectedFilter === 'todos') return true;
      if (selectedFilter === 'asisten') return r.asiste;
      if (selectedFilter === 'no_asisten') return !r.asiste;
      if (selectedFilter === 'celiacos') {
        return (
          r.condicionTitular.includes('Celíaco') ||
          r.acompanantes.some((a) => a.condicion.includes('Celíaco'))
        );
      }
      if (selectedFilter === 'vegetariano_vegano') {
        return (
          r.condicionTitular.includes('Vegetariano') ||
          r.condicionTitular.includes('Vegano') ||
          r.acompanantes.some(
            (a) => a.condicion.includes('Vegetariano') || a.condicion.includes('Vegano')
          )
        );
      }
      if (selectedFilter === 'especiales') {
        return (
          !r.condicionTitular.includes('tradicional') ||
          r.acompanantes.some((a) => !a.condicion.includes('tradicional'))
        );
      }
      return true;
    });
  }, [records, searchTerm, selectedFilter]);

  // State for format copying
  const [copiedFormat, setCopiedFormat] = useState(false);

  // 1. Export to Excel (.csv / .xlsx compatible)
  const handleExportExcel = () => {
    exportToExcelCsv(records);
  };

  // 2. Export to Word (.doc) with exact requested format
  const handleExportWord = () => {
    exportToWordDocument(records, config, summary);
  };

  // 3. Export to TXT (.txt)
  const handleExportTxt = () => {
    exportToTxtDocument(records, config);
  };

  // 4. Quick copy formatted list to clipboard
  const handleCopyRequestedFormat = () => {
    const text = generateFormattedGuestListText(records);
    navigator.clipboard.writeText(text);
    setCopiedFormat(true);
    setTimeout(() => setCopiedFormat(false), 3000);
  };

  // 5. Export to PDF (Native formatted print window)
  const handleExportPdf = () => {
    window.print();
  };

  // 4. Export to PNG Image (Canvas drawing)
  const handleExportPng = () => {
    setIsExportingPng(true);
    const canvas = document.createElement('canvas');
    const width = 1200;
    // Calculate required height based on rows
    const headerHeight = 280;
    const rowHeight = 70;
    const height = headerHeight + Math.max(records.length, 1) * rowHeight + 100;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsExportingPng(false);
      return;
    }

    // Background
    ctx.fillStyle = '#fbf8fa';
    ctx.fillRect(0, 0, width, height);

    // Header banner
    ctx.fillStyle = '#7e526a';
    ctx.fillRect(0, 0, width, 140);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Montserrat, sans-serif';
    ctx.fillText('MIS 15 SOFÍA — LISTA DE CONFIRMADOS', 50, 60);

    ctx.fillStyle = '#fce4ec';
    ctx.font = '20px Montserrat, sans-serif';
    ctx.fillText('10 de Octubre de 2026 • Clahe Eventos Berazategui', 50, 100);

    // Catering summary badges
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(50, 160, width - 100, 80);
    ctx.strokeStyle = '#d9bdcb';
    ctx.lineWidth = 1;
    ctx.strokeRect(50, 160, width - 100, 80);

    ctx.fillStyle = '#222222';
    ctx.font = 'bold 18px Montserrat, sans-serif';
    ctx.fillText(`TOTAL: ${summary.total} PERSONAS`, 70, 205);

    ctx.fillStyle = '#c06d7d';
    ctx.fillText(`🌾 Celíacos: ${summary.celiaco}`, 320, 205);

    ctx.fillStyle = '#2e7d32';
    ctx.fillText(`🥗 Veg/Vegano: ${summary.vegetariano + summary.vegano}`, 520, 205);

    ctx.fillStyle = '#6a4358';
    ctx.fillText(`🍽 Tradicional: ${summary.tradicional}`, 780, 205);

    ctx.fillStyle = '#888888';
    ctx.font = '14px Montserrat, sans-serif';
    ctx.fillText(`Actualizado: ${new Date().toLocaleString('es-AR')}`, 980, 205);

    // Table Header
    const tableTop = 270;
    ctx.fillStyle = '#7e526a';
    ctx.fillRect(50, tableTop, width - 100, 45);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px Montserrat, sans-serif';
    ctx.fillText('#', 70, tableTop + 28);
    ctx.fillText('INVITADO TITULAR', 120, tableTop + 28);
    ctx.fillText('ASISTENCIA', 380, tableTop + 28);
    ctx.fillText('MENÚ TITULAR', 520, tableTop + 28);
    ctx.fillText('ACOMPAÑANTES Y SUS CONDICIONES', 760, tableTop + 28);

    // Rows
    let currentY = tableTop + 45;
    records.forEach((r, idx) => {
      ctx.fillStyle = idx % 2 === 0 ? '#ffffff' : '#f7f2f5';
      ctx.fillRect(50, currentY, width - 100, rowHeight);
      ctx.strokeStyle = '#ede4e9';
      ctx.strokeRect(50, currentY, width - 100, rowHeight);

      // Index
      ctx.fillStyle = '#666666';
      ctx.font = '14px Montserrat, sans-serif';
      ctx.fillText(`${idx + 1}`, 70, currentY + 40);

      // Titular
      ctx.fillStyle = '#222222';
      ctx.font = 'bold 15px Montserrat, sans-serif';
      ctx.fillText(r.titularNombre.slice(0, 25), 120, currentY + 30);
      ctx.fillStyle = '#888888';
      ctx.font = '12px Montserrat, sans-serif';
      ctx.fillText(r.telefono || 'Sin teléfono', 120, currentY + 50);

      // Asiste
      if (r.asiste) {
        ctx.fillStyle = '#107c41';
        ctx.font = 'bold 14px Montserrat, sans-serif';
        ctx.fillText(`✓ SÍ (${r.totalPersonas} pers)`, 380, currentY + 40);
      } else {
        ctx.fillStyle = '#d83b01';
        ctx.font = 'bold 14px Montserrat, sans-serif';
        ctx.fillText('✕ NO ASISTE', 380, currentY + 40);
      }

      // Menú Titular
      ctx.fillStyle = '#7e526a';
      ctx.font = 'bold 13px Montserrat, sans-serif';
      ctx.fillText(r.condicionTitular.slice(0, 22), 520, currentY + 32);
      if (r.detalleCondicionTitular) {
        ctx.fillStyle = '#666666';
        ctx.font = '11px Montserrat, sans-serif';
        ctx.fillText(r.detalleCondicionTitular.slice(0, 26), 520, currentY + 50);
      }

      // Acompañantes
      ctx.fillStyle = '#333333';
      ctx.font = '12px Montserrat, sans-serif';
      if (r.acompanantes.length > 0) {
        const acompPreview = r.acompanantes
          .map((a) => `${a.nombre} [${a.condicion}]`)
          .join(', ');
        ctx.fillText(acompPreview.slice(0, 48), 760, currentY + 38);
      } else {
        ctx.fillStyle = '#999999';
        ctx.fillText('Sin acompañantes', 760, currentY + 38);
      }

      currentY += rowHeight;
    });

    // Download image
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `Lista_Confirmados_Sofia_${new Date().toISOString().slice(0, 10)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportingPng(false);
  };

  // Copy WhatsApp catering summary
  const copyWhatsAppSummary = () => {
    const text = `🎉 *CONFIRMADOS - MIS 15 SOFÍA* 🎉
📍 Clahe Eventos Berazategui (10 de Octubre de 2026)

📊 *RESUMEN DE ASISTENCIA Y CATERING:*
• Total Confirmados: ${summary.total} personas
• Menú Tradicional: ${summary.tradicional}
• Celíacos / Sin TACC: ${summary.celiaco}
• Vegetarianos: ${summary.vegetariano}
• Veganos: ${summary.vegano}
• Otras condiciones / Alergias: ${summary.diabetico + summary.hipertenso + summary.lactosa + summary.otraAlergia}

📋 *DETALLE DE INVITADOS:*
${records
  .filter((r) => r.asiste)
  .map(
    (r, i) =>
      `${i + 1}. ${r.titularNombre} (${r.condicionTitular})${
        r.acompanantes.length > 0
          ? `\n   + Acompañantes: ${r.acompanantes
              .map((a) => `${a.nombre} [${a.condicion}]`)
              .join(', ')}`
          : ''
      }`
  )
  .join('\n\n')}

✨ Actualizado automáticamente en vivo.`;

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 3000);
  };

  // ----------------------------------------------------
  // SCREEN 1: PASSWORD LOCK SCREEN
  // ----------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full bg-[#f7f2f5] flex items-center justify-center p-4 font-montserrat">
        <div className="w-full max-w-md bg-white border border-[#e8dbe2] shadow-2xl p-8 text-center space-y-6">
          {/* Logo / Monogram */}
          <div className="w-16 h-16 mx-auto rounded-full bg-[#7e526a]/10 border border-[#7e526a]/30 flex items-center justify-center text-[#7e526a]">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-[0.16em] uppercase text-[#7e526a]">
              Acceso Anfitriones
            </h1>
            <p className="text-xs text-[#8e657b] tracking-wider uppercase mt-1">
              Lista de Confirmados • Mis 15 Sofía
            </p>
          </div>

          <p className="text-xs text-[#555] leading-relaxed">
            Ingresá la contraseña de organizador para ver la lista de invitados confirmados en tiempo real y descargarla en <strong>Planilla, Word, PNG o PDF</strong>.
          </p>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-[11px] font-semibold tracking-widest uppercase text-[#7e526a] mb-1.5">
                Contraseña de Acceso
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
              INGRESAR A LA LISTA
            </button>
          </form>

          <div className="pt-2 flex items-center justify-center gap-4 text-xs">
            {onBackToInvitation && (
              <button
                onClick={onBackToInvitation}
                className="text-[#7e526a] hover:underline inline-flex items-center gap-1 font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver a la invitación</span>
              </button>
            )}
            {onGoToAdmin && (
              <>
                <span className="text-gray-300">•</span>
                <button
                  onClick={onGoToAdmin}
                  className="text-[#7e526a] hover:underline inline-flex items-center gap-1 font-medium"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Panel Admin</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // SCREEN 2: AUTHENTICATED CONFIRMED GUESTS DASHBOARD
  // ----------------------------------------------------
  return (
    <div className="min-h-screen w-full bg-[#f8f5f7] text-[#2b2b2b] font-montserrat pb-20">
      {/* Top Navbar */}
      <header className="bg-[#7e526a] text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBackToInvitation && (
              <button
                onClick={onBackToInvitation}
                className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors"
                title="Volver a la invitación"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h1 className="text-sm sm:text-base font-bold tracking-wider uppercase">
                Confirmados • Mis 15 Sofía
              </h1>
              <p className="text-[10px] sm:text-[11px] text-white/80">
                Clahe Eventos Berazategui • 10 de Octubre de 2026
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onGoToAdmin && (
              <button
                onClick={onGoToAdmin}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold tracking-wider uppercase flex items-center gap-1.5 transition-colors"
                title="Editar contenido de la página"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Panel Admin</span>
              </button>
            )}

            <button
              onClick={onRefresh}
              className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
              title="Actualizar datos"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-black/20 hover:bg-black/30 text-white text-xs font-semibold rounded-none tracking-wider uppercase flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-6 space-y-6">
        {/* Banner with Live Indicator */}
        <div className="bg-white border border-[#e8dbe2] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#7e526a]">
              Lista en vivo y actualizada en tiempo real
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyWhatsAppSummary}
              className="px-3 py-1.5 bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#128C7E] text-xs font-semibold border border-[#25D366]/30 flex items-center gap-1.5 transition-colors"
            >
              {copiedSummary ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSummary ? '¡Copiado para WhatsApp!' : 'Copiar Resumen para Catering'}</span>
            </button>
          </div>
        </div>

        {/* ================= EXPORT BUTTONS BAR (Planilla, Word, TXT, Copiar Formato, PNG, PDF) ================= */}
        <div className="bg-white border border-[#e8dbe2] p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-[#7e526a] flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-[#c06d7d]" />
                <span>DESCARGAR LISTA DE CONFIRMADOS</span>
              </h2>
              <p className="text-[11px] text-[#666] mt-0.5">
                Incluye formato especial estructurado: <em>1- Nombre... | contacto... | Menú... | Acompañante 1... | Menu Acompañante 1...</em>
              </p>
            </div>
            <span className="text-[11px] text-[#888]">Elegí el formato que prefieras:</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
            {/* 1. Planilla / Excel */}
            <button
              onClick={handleExportExcel}
              className="p-3 bg-[#107c41]/10 hover:bg-[#107c41]/20 border border-[#107c41]/30 text-[#107c41] flex flex-col items-center justify-center text-center gap-1.5 transition-all group active:scale-95"
            >
              <FileSpreadsheet className="w-5 h-5 text-[#107c41] group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold tracking-wider uppercase">PLANILLA EXCEL</span>
              <span className="text-[9px] text-[#107c41]/80">Formato .CSV</span>
            </button>

            {/* 2. Word (.doc) */}
            <button
              onClick={handleExportWord}
              className="p-3 bg-[#2b579a]/10 hover:bg-[#2b579a]/20 border border-[#2b579a]/30 text-[#2b579a] flex flex-col items-center justify-center text-center gap-1.5 transition-all group active:scale-95"
            >
              <FileText className="w-5 h-5 text-[#2b579a] group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold tracking-wider uppercase">WORD (.DOC)</span>
              <span className="text-[9px] text-[#2b579a]/80">Con formato lista</span>
            </button>

            {/* 3. TXT */}
            <button
              onClick={handleExportTxt}
              className="p-3 bg-purple-900/10 hover:bg-purple-900/20 border border-purple-300 text-purple-900 flex flex-col items-center justify-center text-center gap-1.5 transition-all group active:scale-95"
            >
              <FileText className="w-5 h-5 text-purple-800 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold tracking-wider uppercase">TEXTO (.TXT)</span>
              <span className="text-[9px] text-purple-700">Para bloc de notas</span>
            </button>

            {/* 4. Copiar Formato Directo */}
            <button
              onClick={handleCopyRequestedFormat}
              className="p-3 bg-rose-900/10 hover:bg-rose-900/20 border border-rose-300 text-rose-900 flex flex-col items-center justify-center text-center gap-1.5 transition-all group active:scale-95"
            >
              {copiedFormat ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5 text-rose-800 group-hover:scale-110 transition-transform" />}
              <span className="text-[11px] font-bold tracking-wider uppercase">
                {copiedFormat ? '¡COPIADO!' : 'COPIAR LISTA'}
              </span>
              <span className="text-[9px] text-rose-700">Formato exacto</span>
            </button>

            {/* 5. PDF / Imprimir */}
            <button
              onClick={handleExportPdf}
              className="p-3 bg-[#d83b01]/10 hover:bg-[#d83b01]/20 border border-[#d83b01]/30 text-[#d83b01] flex flex-col items-center justify-center text-center gap-1.5 transition-all group active:scale-95"
            >
              <Printer className="w-5 h-5 text-[#d83b01] group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold tracking-wider uppercase">IMPRIMIR / PDF</span>
              <span className="text-[9px] text-[#d83b01]/80">Vista imprimible</span>
            </button>

            {/* 6. Imagen PNG */}
            <button
              onClick={handleExportPng}
              disabled={isExportingPng}
              className="p-3 bg-[#7e526a]/10 hover:bg-[#7e526a]/20 border border-[#7e526a]/30 text-[#7e526a] flex flex-col items-center justify-center text-center gap-1.5 transition-all group active:scale-95"
            >
              <Image className="w-5 h-5 text-[#7e526a] group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold tracking-wider uppercase">
                {isExportingPng ? 'GENERANDO...' : 'IMAGEN PNG'}
              </span>
              <span className="text-[9px] text-[#7e526a]/80">Para el celular</span>
            </button>
          </div>

          {/* Formatted List Preview Box */}
          <div className="bg-[#faf5f8] border border-[#e2d1db] p-4 rounded-none space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#7e526a] uppercase tracking-wider flex items-center gap-1.5">
                <span>📋 Vista Previa del Formato Solicitado ({records.filter(r => r.asiste).length} confirmados):</span>
              </span>
              <button
                onClick={handleCopyRequestedFormat}
                className="text-[11px] px-3 py-1 bg-[#7e526a] hover:bg-[#684156] text-white font-semibold uppercase tracking-wider flex items-center gap-1 transition-colors"
              >
                {copiedFormat ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedFormat ? '¡Copiado!' : 'Copiar Todo'}</span>
              </button>
            </div>

            <div className="max-h-48 overflow-y-auto bg-white p-3 border border-[#d9bdcb] font-mono text-[11px] text-[#333] space-y-1.5 leading-relaxed select-text">
              {records.filter(r => r.asiste).length === 0 ? (
                <p className="text-gray-400 italic">No hay invitados confirmados aún.</p>
              ) : (
                records
                  .filter(r => r.asiste)
                  .map((record, idx) => (
                    <div
                      key={record.id || idx}
                      className="p-1.5 hover:bg-[#fcf5f9] border-b border-gray-100 last:border-b-0 flex items-start justify-between gap-2"
                    >
                      <span className="break-all">{formatGuestRecordSingleLine(record, idx + 1)}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(formatGuestRecordSingleLine(record, idx + 1));
                          setCopiedFormat(true);
                          setTimeout(() => setCopiedFormat(false), 2000);
                        }}
                        title="Copiar esta línea"
                        className="text-gray-400 hover:text-[#7e526a] shrink-0"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

        {/* ================= CATERING SUMMARY METRICS ================= */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white border border-[#e8dbe2] p-4 text-center">
            <span className="text-2xl sm:text-3xl font-bold text-[#7e526a] block leading-none">
              {summary.total}
            </span>
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#888] mt-1.5 block">
              TOTAL ASISTENTES
            </span>
          </div>

          <div className="bg-white border border-[#e8dbe2] p-4 text-center">
            <span className="text-2xl sm:text-3xl font-bold text-[#6a4358] block leading-none">
              {summary.tradicional}
            </span>
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#888] mt-1.5 block">
              MENÚ TRADICIONAL
            </span>
          </div>

          <div className="bg-white border border-amber-300/80 bg-amber-50/40 p-4 text-center">
            <span className="text-2xl sm:text-3xl font-bold text-amber-700 block leading-none">
              {summary.celiaco}
            </span>
            <span className="text-[10px] font-bold tracking-widest uppercase text-amber-800 mt-1.5 block">
              🌾 CELÍACO (SIN TACC)
            </span>
          </div>

          <div className="bg-white border border-emerald-300/80 bg-emerald-50/40 p-4 text-center">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-700 block leading-none">
              {summary.vegetariano}
            </span>
            <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-800 mt-1.5 block">
              🥗 VEGETARIANO
            </span>
          </div>

          <div className="bg-white border border-teal-300/80 bg-teal-50/40 p-4 text-center">
            <span className="text-2xl sm:text-3xl font-bold text-teal-700 block leading-none">
              {summary.vegano}
            </span>
            <span className="text-[10px] font-bold tracking-widest uppercase text-teal-800 mt-1.5 block">
              🌱 VEGANO
            </span>
          </div>

          <div className="bg-white border border-rose-300/80 bg-rose-50/40 p-4 text-center">
            <span className="text-2xl sm:text-3xl font-bold text-rose-700 block leading-none">
              {summary.diabetico + summary.hipertenso + summary.lactosa + summary.otraAlergia}
            </span>
            <span className="text-[10px] font-bold tracking-widest uppercase text-rose-800 mt-1.5 block">
              ⚠️ OTRAS DIETAS / ALERGIAS
            </span>
          </div>
        </div>

        {/* ================= SEARCH & FILTER CONTROLS ================= */}
        <div className="bg-white border border-[#e8dbe2] p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-sm">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#888]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, teléfono o acompañante..."
              className="w-full bg-[#faf6f8] border border-[#d9bdcb] pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#7e526a] tracking-wider"
            />
          </div>

          {/* Filter pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'asisten', label: 'Solo Asisten' },
              { id: 'celiacos', label: '🌾 Celíacos' },
              { id: 'vegetariano_vegano', label: '🥗 Veg/Vegano' },
              { id: 'especiales', label: '⚠️ Dietas Especiales' },
              { id: 'no_asisten', label: 'No Asisten' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id)}
                className={`px-3 py-1.5 text-xs font-semibold tracking-wider uppercase transition-colors ${
                  selectedFilter === f.id
                    ? 'bg-[#7e526a] text-white shadow-sm'
                    : 'bg-[#faf6f8] text-[#666] hover:bg-[#eee3ea] border border-[#e0d3db]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ================= GUEST LIST TABLE / CARDS ================= */}
        <div className="bg-white border border-[#e8dbe2] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#eee] flex items-center justify-between">
            <span className="text-xs font-bold tracking-widest uppercase text-[#7e526a]">
              Invitados Registrados ({filteredRecords.length})
            </span>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#888] space-y-2">
              <Users className="w-8 h-8 mx-auto text-[#bbb]" />
              <p>No se encontraron registros que coincidan con la búsqueda o el filtro.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#eee]">
              {filteredRecords.map((r, idx) => (
                <div key={r.id || idx} className="p-4 sm:p-5 hover:bg-[#faf7f9] transition-colors space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-[#7e526a]/15 text-[#7e526a] text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-[#2b2b2b] tracking-wide">
                          {r.titularNombre}
                        </h3>
                        <span className="text-xs text-[#888]">
                          {r.telefono || 'Sin teléfono'} • {new Date(r.fechaCreacion).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {r.asiste ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>CONFIRMA ({r.totalPersonas} {r.totalPersonas === 1 ? 'persona' : 'personas'})</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-800 text-xs font-bold rounded-full">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>NO PODRÁ ASISTIR</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Conditions & Companions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                    {/* Titular Menu */}
                    <div className="bg-[#faf5f8] border border-[#e8dbe2] p-3 space-y-1">
                      <span className="text-[10px] font-bold text-[#8e657b] uppercase tracking-wider block">
                        Menú Titular:
                      </span>
                      <p className="font-semibold text-[#7e526a]">
                        {r.condicionTitular}
                      </p>
                      {r.detalleCondicionTitular && (
                        <p className="text-[11px] text-[#666] italic">
                          Detalle: {r.detalleCondicionTitular}
                        </p>
                      )}
                    </div>

                    {/* Companions */}
                    <div className="bg-[#faf5f8] border border-[#e8dbe2] p-3 space-y-1">
                      <span className="text-[10px] font-bold text-[#8e657b] uppercase tracking-wider block">
                        Acompañantes ({r.acompanantes.length}):
                      </span>
                      {r.acompanantes.length > 0 ? (
                        <ul className="space-y-1">
                          {r.acompanantes.map((a, aIdx) => (
                            <li key={a.id || aIdx} className="text-[#333]">
                              • <strong>{a.nombre}</strong>:{' '}
                              <span className="text-[#7e526a] font-semibold">{a.condicion}</span>
                              {a.detalleCondicion && (
                                <span className="text-[11px] text-[#666]"> ({a.detalleCondicion})</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-[#888] italic">Sin acompañantes</span>
                      )}
                    </div>
                  </div>

                  {/* Dedication and Song */}
                  {(r.cancionSugerida || r.mensajeDedicatoria) && (
                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#666] pt-1">
                      {r.cancionSugerida && (
                        <span className="flex items-center gap-1 text-[#7e526a]">
                          <Music className="w-3.5 h-3.5" />
                          <span>Canción: <strong>{r.cancionSugerida}</strong></span>
                        </span>
                      )}
                      {r.mensajeDedicatoria && (
                        <span className="flex items-center gap-1 italic text-[#555]">
                          <Heart className="w-3.5 h-3.5 text-[#c06d7d]" />
                          <span>"{r.mensajeDedicatoria}"</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
