import { RsvpRecord, DietarySummary, AppConfig } from '../types';
import { LOCAL_IMAGES, normalizeImageUrl } from '../utils/imageUtils';

const STORAGE_KEY = 'mis15_sofia_confirmados_v1';
const CONFIG_KEY = 'mis15_sofia_config_v1';

// Initial records with Sofía's confirmed guests
const INITIAL_RECORDS: RsvpRecord[] = [
  {
    titularNombre: "Ignacio Fredes",
    telefono: "1143543454",
    asiste: false,
    condicionTitular: "Ninguna (Menú tradicional)",
    detalleCondicionTitular: "",
    acompanantes: [],
    cancionSugerida: "",
    mensajeDedicatoria: "",
    id: "rsvp-1790252157885-np0yt",
    fechaCreacion: "2026-09-24T12:15:57.885Z",
    totalPersonas: 0
  },
  {
    titularNombre: "Gonzalo Fredes",
    telefono: "1143543454",
    asiste: true,
    condicionTitular: "Vegetariano",
    detalleCondicionTitular: "",
    acompanantes: [],
    cancionSugerida: "",
    mensajeDedicatoria: "",
    id: "rsvp-1790252136030-6dabn",
    fechaCreacion: "2026-09-24T12:15:36.030Z",
    totalPersonas: 1
  },
  {
    titularNombre: "mATIAS gONZALEZ",
    telefono: "1122334455",
    asiste: true,
    condicionTitular: "Ninguna (Menú tradicional)",
    detalleCondicionTitular: "",
    acompanantes: [],
    cancionSugerida: "El hechizo RKT",
    mensajeDedicatoria: "",
    id: "rsvp-1790251895864-p5jci",
    fechaCreacion: "2026-09-24T12:11:35.864Z",
    totalPersonas: 1
  },
  {
    id: 'rsvp-1',
    fechaCreacion: '2026-09-20T14:30:00.000Z',
    titularNombre: 'Valentina Martínez',
    telefono: '+54 11 4521-8899',
    asiste: true,
    condicionTitular: 'Ninguna (Menú tradicional)',
    totalPersonas: 2,
    cancionSugerida: 'Dua Lipa - Levitating',
    mensajeDedicatoria: '¡Qué emoción Sofi! No veo la hora de bailar con vos toda la noche.',
    acompanantes: [
      {
        id: 'guest-1-1',
        nombre: 'Lucas Benítez',
        condicion: 'Celíaco / Sin TACC',
        detalleCondicion: 'Celiaquía diagnosticada, vajilla separada'
      }
    ]
  },
  {
    id: 'rsvp-2',
    fechaCreacion: '2026-09-21T18:15:00.000Z',
    titularNombre: 'Familia Rossi (Martín y Laura)',
    telefono: '+54 11 6392-1144',
    asiste: true,
    condicionTitular: 'Vegetariano',
    totalPersonas: 3,
    cancionSugerida: 'Coldplay - A Sky Full of Stars',
    mensajeDedicatoria: '¡Felices 15 Sofi hermosa! Te queremos mucho la tía Lau y el tío Martín.',
    acompanantes: [
      {
        id: 'guest-2-1',
        nombre: 'Martín Rossi',
        condicion: 'Ninguna (Menú tradicional)'
      },
      {
        id: 'guest-2-2',
        nombre: 'Camila Rossi',
        condicion: 'Vegano',
        detalleCondicion: 'Vegana estricta'
      }
    ]
  },
  {
    id: 'rsvp-3',
    fechaCreacion: '2026-09-22T10:00:00.000Z',
    titularNombre: 'Julieta Giménez',
    telefono: '+54 11 5022-7711',
    asiste: true,
    condicionTitular: 'Ninguna (Menú tradicional)',
    totalPersonas: 1,
    cancionSugerida: 'Emilia & Tini - La_Original.mp3',
    mensajeDedicatoria: '¡Amiga te amoooo! Va a ser la mejor fiesta del año en Clahe.',
    acompanantes: []
  }
];

export const DEFAULT_CONFIG: AppConfig = {
  adminPassword: 'EventoSofi2026',
  nombreQuinceanera: 'Sofía',
  tituloIngreso: 'MIS XV',
  fraseIngreso: 'QUIERO QUE SEAS PARTE DE ESTE MOMENTO TAN IMPORTANTE PARA MÍ',
  subtituloHero: 'FESTEJAMOS MIS 15',
  fraseEmotiva:
    'HAY MOMENTOS EN LA VIDA QUE SON INOLVIDABLES, Y COMPARTIRLOS CON QUIENES MÁS QUIERO LOS HACE ETERNOS.',

  fechaTexto: '10 DE OCTUBRE DE 2026',
  horaTexto: '21:00 HS',
  fechaIsoCountdown: '2026-10-10T21:00:00',
  fechaLimiteRsvp: '20 de Septiembre de 2026',
  lugarNombre: 'Clahe Eventos Berazategui',
  lugarDireccion: 'Av. Eva Peron 3678, B1884 Berazategui, Provincia de Buenos Aires',
  linkMaps: 'https://maps.app.goo.gl/iiYnhgRXMxxULKzQ6',
  linkCalendar:
    'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Mis+15+Sof%C3%ADa+-+Clahe+Eventos&dates=20261011T000000Z/20261011T080000Z&details=%C2%A1Festejo+de+los+15+a%C3%B1os+de+Sof%C3%ADa+en+Clahe+Eventos+Berazategui!&location=Clahe+Eventos,+Calle+158+N%C2%B0+4561,+Pl%C3%A1tanos,+Berazategui',

  dressCodeTitulo: 'ELEGANTE',
  dressCodeDescripcion: 'EL COLOR BLANCO SE RESERVA PARA LA QUINCEAÑERA',

  musicaUrl:
    'https://www.youtube.com/watch?v=Z9a4dzEGJxw&list=RDZ9a4dzEGJxw&start_radio=1&pp=ygUQdGVuZ28gdW4gZmVsbGluZ6AHAQ%3D%3D',
  musicaTitulo: 'PEPU- TENGO UN FEELING',

  heroImageUrl: LOCAL_IMAGES.hero,
  dressCodeImageUrl: LOCAL_IMAGES.dressCode,
  finalImageUrl: LOCAL_IMAGES.final,
  galeriaFotos: [...LOCAL_IMAGES.gallery],

  fraseRegalo:
    'NADA ES MÁS IMPORTANTE QUE TU PRESENCIA, PERO SI QUERÉS HACERME UN REGALO PODÉS COLABORAR CON MI VIAJE...',
  aliasCbu: 'SOFIA.MIS15.CLAHE',
  titularCbu: 'Sofía Álvarez / Familia',
  bancoNombre: 'Banco Santander / Mercado Pago',
  cbuCompleto: '0720123488000034567891',

  instagramTag: '@sofi_mis15',
  instagramUrl: 'https://instagram.com',
  googleSheetsWebhookUrl: '',
};

// Calculate summary counts
export function calculateDietarySummary(records: RsvpRecord[]): DietarySummary {
  const summary: DietarySummary = {
    tradicional: 0,
    celiaco: 0,
    vegetariano: 0,
    vegano: 0,
    diabetico: 0,
    hipertenso: 0,
    lactosa: 0,
    otraAlergia: 0,
    total: 0
  };

  records
    .filter((r) => r.asiste)
    .forEach((record) => {
      // Main guest
      countCondition(record.condicionTitular, summary);
      summary.total++;

      // Companions
      record.acompanantes.forEach((comp) => {
        countCondition(comp.condicion, summary);
        summary.total++;
      });
    });

  return summary;
}

function countCondition(cond: string, summary: DietarySummary) {
  if (cond.includes('Celíaco')) summary.celiaco++;
  else if (cond.includes('Vegetariano')) summary.vegetariano++;
  else if (cond.includes('Vegano')) summary.vegano++;
  else if (cond.includes('Diabético')) summary.diabetico++;
  else if (cond.includes('Hipertenso')) summary.hipertenso++;
  else if (cond.includes('lactosa')) summary.lactosa++;
  else if (cond.includes('Alergia') || cond.includes('otra')) summary.otraAlergia++;
  else summary.tradicional++;
}

export function sanitizeConfig(cfg: Partial<AppConfig>): AppConfig {
  const merged: AppConfig = { ...DEFAULT_CONFIG, ...cfg };
  merged.heroImageUrl = normalizeImageUrl(merged.heroImageUrl, LOCAL_IMAGES.hero);
  merged.dressCodeImageUrl = normalizeImageUrl(merged.dressCodeImageUrl, LOCAL_IMAGES.dressCode);
  merged.finalImageUrl = normalizeImageUrl(merged.finalImageUrl, LOCAL_IMAGES.final);
  if (Array.isArray(merged.galeriaFotos) && merged.galeriaFotos.length > 0) {
    merged.galeriaFotos = merged.galeriaFotos.map((img, idx) =>
      normalizeImageUrl(img, LOCAL_IMAGES.gallery[idx] || LOCAL_IMAGES.gallery[0])
    );
  } else {
    merged.galeriaFotos = [...LOCAL_IMAGES.gallery];
  }
  return merged;
}

// Fetch all confirmed guests
export async function getConfirmedGuests(): Promise<{
  records: RsvpRecord[];
  summary: DietarySummary;
  config: AppConfig;
}> {
  // LocalStorage Cache
  const stored = localStorage.getItem(STORAGE_KEY);
  let localRecords: RsvpRecord[] = stored ? JSON.parse(stored) : INITIAL_RECORDS;

  const configStored = localStorage.getItem(CONFIG_KEY);
  let localConfig: AppConfig = configStored
    ? sanitizeConfig(JSON.parse(configStored))
    : DEFAULT_CONFIG;

  try {
    const res = await fetch('/api/confirmados');
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (Array.isArray(data.records)) {
        // Merge records preserving all confirmations
        const recordsMap = new Map<string, RsvpRecord>();
        [...localRecords, ...data.records].forEach((r) => {
          if (r.id) recordsMap.set(r.id, r);
        });
        const mergedRecords = Array.from(recordsMap.values());
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedRecords));

        const mergedConfig: AppConfig = sanitizeConfig({
          ...DEFAULT_CONFIG,
          ...(data.config || {}),
          ...(configStored ? JSON.parse(configStored) : {}),
        });
        localStorage.setItem(CONFIG_KEY, JSON.stringify(mergedConfig));

        return {
          records: mergedRecords,
          summary: calculateDietarySummary(mergedRecords),
          config: mergedConfig,
        };
      }
    }
  } catch (err) {
    console.warn('Backend API not reachable, using local storage cache', err);
  }

  return {
    records: localRecords,
    summary: calculateDietarySummary(localRecords),
    config: localConfig,
  };
}

// Save RSVP
export async function submitRsvp(record: Omit<RsvpRecord, 'id' | 'fechaCreacion' | 'totalPersonas'>): Promise<{ success: boolean; record: RsvpRecord; sheetSynced: boolean }> {
  const newRecord: RsvpRecord = {
    ...record,
    id: 'rsvp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    fechaCreacion: new Date().toISOString(),
    totalPersonas: record.asiste ? 1 + (record.acompanantes?.length || 0) : 0,
  };

  let sheetSynced = false;

  // 1. Keep local storage up to date immediately
  const stored = localStorage.getItem(STORAGE_KEY);
  const records: RsvpRecord[] = stored ? JSON.parse(stored) : [...INITIAL_RECORDS];
  records.unshift(newRecord);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));

  // 2. Try server API
  try {
    const res = await fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRecord),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const json = await res.json();
      sheetSynced = !!json.sheetSynced;
    }
  } catch (err) {
    console.warn('Server API save failed, stored locally', err);
  }

  // 3. Direct Google Sheets Webhook sync from client if configured
  const config = getConfig();
  if (config.googleSheetsWebhookUrl) {
    try {
      await sendToGoogleSheetsWebhook(config.googleSheetsWebhookUrl, newRecord);
      sheetSynced = true;
    } catch (e) {
      console.warn('Client Google Sheets Webhook call failed:', e);
    }
  }

  return { success: true, record: newRecord, sheetSynced };
}

// Delete an RSVP
export async function deleteRsvp(id: string): Promise<boolean> {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const records: RsvpRecord[] = JSON.parse(stored);
    const filtered = records.filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }

  try {
    await fetch(`/api/confirmados/${id}`, { method: 'DELETE' });
  } catch (e) {
    console.warn('Server delete failed', e);
  }
  return true;
}

// Get and Save Config
export function getConfig(): AppConfig {
  const stored = localStorage.getItem(CONFIG_KEY);
  return stored ? sanitizeConfig(JSON.parse(stored)) : DEFAULT_CONFIG;
}

export async function saveConfig(newConfig: Partial<AppConfig>): Promise<AppConfig> {
  const current = getConfig();
  const updated: AppConfig = sanitizeConfig({ ...current, ...newConfig });
  localStorage.setItem(CONFIG_KEY, JSON.stringify(updated));

  try {
    await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
  } catch (e) {
    console.warn('Server config save failed, saved locally', e);
  }
  return updated;
}

// Send data to Google Sheets Webhook (Google Apps Script)
export async function sendToGoogleSheetsWebhook(webhookUrl: string, record: RsvpRecord): Promise<boolean> {
  if (!webhookUrl || !webhookUrl.startsWith('http')) return false;

  // Flatten companions list for spreadsheet columns
  const detalleInvitados = [
    `Titular: ${record.titularNombre} (${record.condicionTitular}${record.detalleCondicionTitular ? ` - ${record.detalleCondicionTitular}` : ''})`,
    ...record.acompanantes.map(
      (c, idx) => `Acompañante ${idx + 1}: ${c.nombre} (${c.condicion}${c.detalleCondicion ? ` - ${c.detalleCondicion}` : ''})`
    )
  ].join(' | ');

  const payload = {
    fecha: new Date(record.fechaCreacion).toLocaleString('es-AR'),
    titular: record.titularNombre,
    telefono: record.telefono,
    asiste: record.asiste ? 'SÍ CONFIRMADO' : 'NO ASISTE',
    totalPersonas: record.totalPersonas,
    condicionTitular: record.condicionTitular,
    detalleCondicionTitular: record.detalleCondicionTitular || '',
    detalleInvitados,
    cancion: record.cancionSugerida || '',
    mensaje: record.mensajeDedicatoria || '',
    esCeliaco: record.condicionTitular.includes('Celíaco') || record.acompanantes.some(a => a.condicion.includes('Celíaco')) ? 'SÍ' : 'NO',
    esVegetariano: record.condicionTitular.includes('Vegetariano') || record.acompanantes.some(a => a.condicion.includes('Vegetariano')) ? 'SÍ' : 'NO',
    esVegano: record.condicionTitular.includes('Vegano') || record.acompanantes.some(a => a.condicion.includes('Vegano')) ? 'SÍ' : 'NO'
  };

  try {
    // Mode no-cors avoids CORS preflight blockage in browsers for Apps Script webhooks
    await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return true;
  } catch (error) {
    console.error('Error posting to Google Sheets Webhook:', error);
    return false;
  }
}

// Download list as CSV / Excel
export function exportToExcelCsv(records: RsvpRecord[]) {
  // UTF-8 BOM so Excel opens with proper accents and Spanish characters
  const BOM = '\uFEFF';
  const headers = [
    'Fecha de Registro',
    'Invitado Titular',
    'Teléfono',
    'Asiste',
    'Total Personas',
    'Condición Titular',
    'Detalle Titular',
    'Todos los Invitados y sus Menús Especiales',
    'Canción Sugerida',
    'Mensaje / Saludo'
  ];

  const rows = records.map((r) => {
    const detalleComensales = [
      `1. ${r.titularNombre} [${r.condicionTitular}${r.detalleCondicionTitular ? ` - ${r.detalleCondicionTitular}` : ''}]`,
      ...r.acompanantes.map(
        (a, i) => `${i + 2}. ${a.nombre} [${a.condicion}${a.detalleCondicion ? ` - ${a.detalleCondicion}` : ''}]`
      )
    ].join(' ; ');

    return [
      escapeCsv(new Date(r.fechaCreacion).toLocaleString('es-AR')),
      escapeCsv(r.titularNombre),
      escapeCsv(r.telefono),
      r.asiste ? 'SI' : 'NO',
      r.totalPersonas,
      escapeCsv(r.condicionTitular),
      escapeCsv(r.detalleCondicionTitular || '-'),
      escapeCsv(detalleComensales),
      escapeCsv(r.cancionSugerida || '-'),
      escapeCsv(r.mensajeDedicatoria || '-')
    ].join(';');
  });

  const csvContent = BOM + [headers.join(';'), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Mis_15_Sofia_Confirmados_ClaheEventos_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function escapeCsv(str: string): string {
  if (!str) return '""';
  const replaced = String(str).replace(/"/g, '""');
  return `"${replaced}"`;
}
