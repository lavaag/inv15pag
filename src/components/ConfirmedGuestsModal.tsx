import React, { useState, useMemo } from 'react';
import {
  X,
  Download,
  Share2,
  FileSpreadsheet,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Utensils,
  Music,
  Trash2,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  Settings,
  AlertTriangle
} from 'lucide-react';
import { RsvpRecord, DietarySummary, AppConfig } from '../types';
import { exportToExcelCsv, deleteRsvp, saveConfig } from '../services/api';

interface ConfirmedGuestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: RsvpRecord[];
  summary: DietarySummary;
  config: AppConfig;
  onRefresh: () => void;
}

export const ConfirmedGuestsModal: React.FC<ConfirmedGuestsModalProps> = ({
  isOpen,
  onClose,
  records,
  summary,
  config,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('todos');
  const [showConfig, setShowConfig] = useState(false);
  const [webhookUrlInput, setWebhookUrlInput] = useState(config.googleSheetsWebhookUrl || '');
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Filter records (Always declare useMemo unconditionally before any early returns)
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
          r.acompanantes.some((a) => a.condicion.includes('Vegetariano') || a.condicion.includes('Vegano'))
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

  if (!isOpen) return null;

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el registro de ${name}?`)) {
      setIsDeleting(id);
      await deleteRsvp(id);
      onRefresh();
      setIsDeleting(null);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveConfig({ googleSheetsWebhookUrl: webhookUrlInput.trim() });
    setShowConfig(false);
    alert('Configuración guardada correctamente. Las nuevas confirmaciones se sincronizarán con tu planilla.');
  };

  // Copy Catering text summary for Clahe Eventos
  const copyCateringSummary = () => {
    const celiacosList: string[] = [];
    const vegetarianosList: string[] = [];
    const veganosList: string[] = [];
    const otrosList: string[] = [];

    records.filter(r => r.asiste).forEach((r) => {
      // Titular
      if (r.condicionTitular.includes('Celíaco')) celiacosList.push(`${r.titularNombre} (${r.detalleCondicionTitular || 'Celíaco'})`);
      else if (r.condicionTitular.includes('Vegetariano')) vegetarianosList.push(`${r.titularNombre} (Vegetariano)`);
      else if (r.condicionTitular.includes('Vegano')) veganosList.push(`${r.titularNombre} (Vegano)`);
      else if (!r.condicionTitular.includes('tradicional')) otrosList.push(`${r.titularNombre} (${r.condicionTitular}: ${r.detalleCondicionTitular || ''})`);

      // Acompañantes
      r.acompanantes.forEach((a) => {
        if (a.condicion.includes('Celíaco')) celiacosList.push(`${a.nombre} (${a.detalleCondicion || 'Celíaco'})`);
        else if (a.condicion.includes('Vegetariano')) vegetarianosList.push(`${a.nombre} (Vegetariano)`);
        else if (a.condicion.includes('Vegano')) veganosList.push(`${a.nombre} (Vegano)`);
        else if (!a.condicion.includes('tradicional')) otrosList.push(`${a.nombre} (${a.condicion}: ${a.detalleCondicion || ''})`);
      });
    });

    const text = `📋 *RESUMEN DE CONFIRMADOS - MIS 15 SOFÍA (CLAHE EVENTOS)*\n` +
      `📅 Fecha del evento: 10 de Octubre de 2026\n\n` +
      `👥 *TOTAL PERSONAS CONFIRMADAS: ${summary.total}*\n` +
      `🍽️ Menú Tradicional: ${summary.tradicional}\n` +
      `🌾 Celíacos (Sin TACC): ${summary.celiaco}\n` +
      `🥗 Vegetarianos: ${summary.vegetariano}\n` +
      `🌱 Veganos: ${summary.vegano}\n` +
      `🩺 Diabéticos / Otras alergias: ${summary.diabetico + summary.otraAlergia}\n\n` +
      `📝 *DETALLE DE INVITADOS CON MENÚ ESPECIAL:*\n` +
      (celiacosList.length ? `*Celíacos / Sin TACC:*\n${celiacosList.map(c => ` - ${c}`).join('\n')}\n` : '') +
      (vegetarianosList.length ? `*Vegetarianos:*\n${vegetarianosList.map(v => ` - ${v}`).join('\n')}\n` : '') +
      (veganosList.length ? `*Veganos:*\n${veganosList.map(v => ` - ${v}`).join('\n')}\n` : '') +
      (otrosList.length ? `*Otras condiciones:*\n${otrosList.map(o => ` - ${o}`).join('\n')}\n` : '');

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  // Google Apps Script code for 1-click integration
  const googleAppsScriptCode = `function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Headers if empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Fecha", "Titular", "Teléfono", "Asiste", "Total Personas", 
        "Condición Titular", "Detalle de Invitados y Menú", "Canción DJ", "Mensaje Dedicatoria"
      ]);
    }
    
    sheet.appendRow([
      data.fecha || new Date().toLocaleString(),
      data.titular,
      data.telefono,
      data.asiste,
      data.totalPersonas,
      data.condicionTitular,
      data.detalleInvitados,
      data.cancion,
      data.mensaje
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ "status": "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const copyAppsScript = () => {
    navigator.clipboard.writeText(googleAppsScriptCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl my-4 rounded-3xl bg-gradient-to-b from-[#131735] to-[#0a0d20] border border-amber-400/35 shadow-2xl text-white overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#171d42] border-b border-amber-400/20 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-serif font-bold text-white">
                  Lista de Confirmados en Tiempo Real
                </h3>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold uppercase tracking-wider border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  En Vivo
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Mis 15 Sofía • Clahe Eventos Berazategui • 10 de Octubre de 2026
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
              title="Configurar enlace con Google Sheets"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onRefresh}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
              title="Actualizar datos"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Google Sheets Setup Section Drawer if opened */}
        {showConfig && (
          <div className="p-5 bg-[#0f142e] border-b border-amber-400/20 text-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-amber-300 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                <span>Enlace Directo con tu Planilla de Google Sheets</span>
              </h4>
              <button
                onClick={() => setShowConfig(false)}
                className="text-slate-400 hover:text-white"
              >
                Cerrar
              </button>
            </div>

            <p className="text-slate-300 leading-relaxed">
              Podés conectar esta invitación a tu Google Sheet para que cada confirmación agregue una fila automáticamente en tiempo real.
            </p>

            <form onSubmit={handleSaveConfig} className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">
                  URL del Webhook de Google Apps Script:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={webhookUrlInput}
                    onChange={(e) => setWebhookUrlInput(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="flex-1 px-3 py-2 rounded-xl bg-[#161b3d] border border-slate-600 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl transition-colors"
                  >
                    Guardar URL
                  </button>
                </div>
              </div>
            </form>

            {/* Quick 30-second instructions */}
            <div className="p-3.5 rounded-xl bg-[#151b3a] border border-slate-700 text-slate-300 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">¿Cómo crearlo en 3 pasos rápidos?</span>
                <button
                  onClick={copyAppsScript}
                  className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-medium flex items-center gap-1"
                >
                  {copiedScript ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedScript ? '¡Código Copiado!' : 'Copiar Código de Apps Script'}</span>
                </button>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300">
                <li>Abrí una hoja en Google Sheets (ej: "Confirmados Mis 15 Sofía").</li>
                <li>Hacé clic en <strong>Extensiones → Apps Script</strong>, borrá todo y pegá el código copiado.</li>
                <li>Hacé clic en <strong>Implementar → Nueva implementación → Tipo: Aplicación web</strong>, en "Quién tiene acceso" elegí <strong>Cualquiera</strong> y pegá la URL arriba.</li>
              </ol>
            </div>
          </div>
        )}

        {/* Dietary & Catering Summary Counters */}
        <div className="p-4 sm:p-6 bg-[#0e122b]/90 border-b border-slate-800">
          <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">
            Resumen de Menús para Catering (Clahe Eventos)
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
            <div className="p-3 rounded-2xl bg-[#161c3c] border border-blue-500/30 text-center">
              <div className="text-2xl font-bold text-white font-cinzel">{summary.total}</div>
              <div className="text-[11px] text-blue-300 font-medium">Total Asisten</div>
            </div>

            <div className="p-3 rounded-2xl bg-[#161c3c] border border-amber-500/40 text-center">
              <div className="text-2xl font-bold text-amber-300 font-cinzel">{summary.celiaco}</div>
              <div className="text-[11px] text-amber-300 font-semibold">🌾 Celíacos (Sin TACC)</div>
            </div>

            <div className="p-3 rounded-2xl bg-[#161c3c] border border-emerald-500/40 text-center">
              <div className="text-2xl font-bold text-emerald-300 font-cinzel">{summary.vegetariano}</div>
              <div className="text-[11px] text-emerald-300 font-semibold">🥗 Vegetarianos</div>
            </div>

            <div className="p-3 rounded-2xl bg-[#161c3c] border border-teal-500/40 text-center">
              <div className="text-2xl font-bold text-teal-300 font-cinzel">{summary.vegano}</div>
              <div className="text-[11px] text-teal-300 font-semibold">🌱 Veganos</div>
            </div>

            <div className="p-3 rounded-2xl bg-[#161c3c] border border-purple-500/40 text-center">
              <div className="text-2xl font-bold text-purple-300 font-cinzel">
                {summary.diabetico + summary.otraAlergia}
              </div>
              <div className="text-[11px] text-purple-300 font-semibold">🩺 Alergias / Dietas</div>
            </div>

            <div className="p-3 rounded-2xl bg-[#161c3c] border border-slate-600/50 text-center">
              <div className="text-2xl font-bold text-slate-200 font-cinzel">{summary.tradicional}</div>
              <div className="text-[11px] text-slate-300 font-medium">🍽️ Menú Clásico</div>
            </div>
          </div>
        </div>

        {/* Actions & Filters Bar */}
        <div className="px-6 py-3.5 bg-[#121633] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o teléfono..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#181e42] border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'asisten', label: 'Confirmados' },
              { id: 'celiacos', label: 'Solo Celíacos' },
              { id: 'vegetariano_vegano', label: 'Veg/Vegano' },
              { id: 'especiales', label: 'Con Dieta Especial' },
              { id: 'no_asisten', label: 'No van' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedFilter === f.id
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'bg-[#181e42] text-slate-300 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Export buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportToExcelCsv(records)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all"
              title="Descargar archivo Excel con todos los comensales y dietas"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar Excel</span>
            </button>

            <button
              onClick={copyCateringSummary}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all"
              title="Copiar texto listo para enviar por WhatsApp al catering de Clahe Eventos"
            >
              {copiedSummary ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSummary ? '¡Copiado!' : 'Copiar para WhatsApp'}</span>
            </button>
          </div>
        </div>

        {/* Guests Table */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No se encontraron confirmaciones con los filtros seleccionados.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRecords.map((record) => (
                <div
                  key={record.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    record.asiste
                      ? 'bg-[#131838] border-slate-700/70 hover:border-amber-400/40'
                      : 'bg-[#191522] border-rose-900/40 opacity-75'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                          record.asiste
                            ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {record.asiste ? record.totalPersonas : 0}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className="font-semibold text-white text-sm sm:text-base">
                            {record.titularNombre}
                          </h5>
                          {record.asiste ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold flex items-center gap-1 border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{record.totalPersonas} {record.totalPersonas === 1 ? 'persona' : 'personas'}</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-semibold flex items-center gap-1 border border-rose-500/30">
                              <XCircle className="w-3 h-3" />
                              <span>No asiste</span>
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-3 mt-0.5">
                          <span>{new Date(record.fechaCreacion).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })} hs</span>
                          {record.telefono && <span>📞 {record.telefono}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => handleDelete(record.id, record.titularNombre)}
                        disabled={isDeleting === record.id}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Eliminar registro"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Individual Guest Dietary Breakdown */}
                  {record.asiste && (
                    <div className="mt-3 p-3.5 rounded-xl bg-[#0e122b] border border-slate-800 space-y-2">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Utensils className="w-3.5 h-3.5 text-amber-400" />
                        <span>Detalle de Comensales y Menú Solicitado:</span>
                      </div>

                      {/* Main guest row */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs py-1 border-b border-slate-800/80">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] text-slate-300 flex items-center justify-center font-bold">1</span>
                          <span className="text-white font-medium">{record.titularNombre}</span>
                          <span className="text-[11px] text-slate-400">(Titular)</span>
                        </div>
                        <div>
                          <DietaryBadge condition={record.condicionTitular} detail={record.detalleCondicionTitular} />
                        </div>
                      </div>

                      {/* Companions rows */}
                      {record.acompanantes.map((comp, idx) => (
                        <div key={comp.id} className="flex flex-wrap items-center justify-between gap-2 text-xs py-1 border-b border-slate-800/80 last:border-0">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] text-slate-300 flex items-center justify-center font-bold">{idx + 2}</span>
                            <span className="text-white font-medium">{comp.nombre}</span>
                            <span className="text-[11px] text-slate-400">(Acompañante)</span>
                          </div>
                          <div>
                            <DietaryBadge condition={comp.condicion} detail={comp.detalleCondicion} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Song and dedication details */}
                  {(record.cancionSugerida || record.mensajeDedicatoria) && (
                    <div className="mt-3 pt-2 flex flex-wrap gap-4 text-xs text-slate-300">
                      {record.cancionSugerida && (
                        <div className="flex items-center gap-1.5 text-blue-300">
                          <Music className="w-3.5 h-3.5" />
                          <span>Canción: "{record.cancionSugerida}"</span>
                        </div>
                      )}
                      {record.mensajeDedicatoria && (
                        <div className="text-amber-200/90 italic">
                          "{record.mensajeDedicatoria}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#14193d] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Mostrando {filteredRecords.length} de {records.length} registros</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            Cerrar Lista
          </button>
        </div>
      </div>
    </div>
  );
};

// Tag component for dietary condition
const DietaryBadge: React.FC<{ condition: string; detail?: string }> = ({ condition, detail }) => {
  if (condition.includes('Celíaco')) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-semibold">
        🌾 Celíaco / Sin TACC {detail ? `(${detail})` : ''}
      </span>
    );
  }
  if (condition.includes('Vegetariano')) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-semibold">
        🥗 Vegetariano {detail ? `(${detail})` : ''}
      </span>
    );
  }
  if (condition.includes('Vegano')) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 text-[11px] font-semibold">
        🌱 Vegano {detail ? `(${detail})` : ''}
      </span>
    );
  }
  if (condition.includes('Diabético')) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[11px] font-semibold">
        🩺 Diabético {detail ? `(${detail})` : ''}
      </span>
    );
  }
  if (condition.includes('Alergia') || condition.includes('lactosa')) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-semibold">
        ⚠️ {condition} {detail ? `(${detail})` : ''}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">
      🍽️ Menú Tradicional
    </span>
  );
};
