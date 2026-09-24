import { RsvpRecord, DietarySummary, AppConfig } from '../types';

const STORAGE_KEY = 'mis15_sofia_confirmados_v1';
const CONFIG_KEY = 'mis15_sofia_config_v1';

// Initial sample data if no data exists yet, so Sofía's family sees how it looks immediately
const INITIAL_RECORDS: RsvpRecord[] = [
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
  tituloIngreso: 'MIS 15 SOFÍA',
  fraseIngreso: 'QUIERO QUE SEAS PARTE DE ESTE MOMENTO TAN IMPORTANTE PARA MÍ',
  subtituloHero: 'FESTEJAMOS MIS 15',
  fraseEmotiva:
    'HAY MOMENTOS EN LA VIDA QUE SON INOLVIDABLES, Y COMPARTIRLOS CON QUIENES MÁS QUIERO LOS HACE ETERNOS.',

  fechaTexto: '10 DE OCTUBRE DE 2026',
  horaTexto: '21:00 HS',
  fechaIsoCountdown: '2026-10-10T21:00:00',
  fechaLimiteRsvp: '20 de Septiembre de 2026',
  lugarNombre: 'Clahe Eventos',
  lugarDireccion: 'Calle 158 N° 4561 (e/ 45 y 46), Plátanos, Berazategui',
  linkMaps:
    'https://www.google.com/maps/search/?api=1&query=Clahe+Eventos+Berazategui+Calle+158+4561',
  linkCalendar:
    'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Mis+15+Sof%C3%ADa+-+Clahe+Eventos&dates=20261011T000000Z/20261011T080000Z&details=%C2%A1Festejo+de+los+15+a%C3%B1os+de+Sof%C3%ADa+en+Clahe+Eventos+Berazategui!&location=Clahe+Eventos,+Calle+158+N%C2%B0+4561,+Pl%C3%A1tanos,+Berazategui',

  dressCodeTitulo: 'ELEGANTE',
  dressCodeDescripcion: 'EL COLOR BLANCO SE RESERVA PARA LA QUINCEAÑERA',

  musicaUrl:
    'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-cinematic-piano-112191.mp3',
  musicaTitulo: 'Romantic Cinematic Piano (Vals de 15)',

  heroImageUrl:
    'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80',
  dressCodeImageUrl:
    'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80',
  finalImageUrl:
    'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1000&q=80',
  galeriaFotos: [
    'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=600&q=80',
  ],

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

// Fetch all confirmed guests
export async function getConfirmedGuests(): Promise<{
  records: RsvpRecord[];
  summary: DietarySummary;
  config: AppConfig;
}> {
  try {
    const res = await fetch('/api/confirmados');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.records)) {
        return {
          records: data.records,
          summary: calculateDietarySummary(data.records),
          config: data.config || DEFAULT_CONFIG,
        };
      }
    }
  } catch (err) {
    console.warn('Backend API not reachable, using local storage cache', err);
  }

  // LocalStorage Fallback
  const stored = localStorage.getItem(STORAGE_KEY);
  const records: RsvpRecord[] = stored ? JSON.parse(stored) : INITIAL_RECORDS;
  const configStored = localStorage.getItem(CONFIG_KEY);
  const config: AppConfig = configStored ? JSON.parse(configStored) : DEFAULT_CONFIG;

  return {
    records,
    summary: calculateDietarySummary(records),
    config,
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

  // 1. Try server API
  try {
    const res = await fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRecord),
    });
    if (res.ok) {
      const json = await res.json();
      sheetSynced = !!json.sheetSynced;
    }
  } catch (err) {
    console.warn('Server API save failed, saving locally', err);
  }

  // 2. Also keep local storage up to date
  const stored = localStorage.getItem(STORAGE_KEY);
  const records: RsvpRecord[] = stored ? JSON.parse(stored) : [...INITIAL_RECORDS];
  records.unshift(newRecord);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));

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
  try {
    await fetch(`/api/confirmados/${id}`, { method: 'DELETE' });
  } catch (e) {
    console.warn('Server delete failed', e);
  }
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const records: RsvpRecord[] = JSON.parse(stored);
    const filtered = records.filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }
  return true;
}

// Get and Save Config
export function getConfig(): AppConfig {
  const stored = localStorage.getItem(CONFIG_KEY);
  return stored ? JSON.parse(stored) : DEFAULT_CONFIG;
}

export async function saveConfig(newConfig: Partial<AppConfig>): Promise<AppConfig> {
  const current = getConfig();
  const updated = { ...current, ...newConfig };
  localStorage.setItem(CONFIG_KEY, JSON.stringify(updated));

  try {
    await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
  } catch (e) {
    console.warn('Server config save failed', e);
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
