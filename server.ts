import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const dataDir = path.resolve(__dirname, 'data');
const guestsFile = path.join(dataDir, 'guests.json');
const configFile = path.join(dataDir, 'config.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(guestsFile)) {
  fs.writeFileSync(guestsFile, JSON.stringify([
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
  ], null, 2));
}

if (!fs.existsSync(configFile)) {
  fs.writeFileSync(configFile, JSON.stringify({
    aliasCbu: 'SOFIA.MIS15.CLAHE',
    titularCbu: 'Sofía Álvarez / Familia',
    bancoNombre: 'Banco Santander / Mercado Pago',
    cbuCompleto: '0720123488000034567891',
    instagramTag: '@sofi_mis15',
    googleSheetsWebhookUrl: ''
  }, null, 2));
}

// GET /api/confirmados
app.get('/api/confirmados', (req, res) => {
  try {
    const rawRecords = fs.readFileSync(guestsFile, 'utf-8');
    const records = JSON.parse(rawRecords);
    const rawConfig = fs.readFileSync(configFile, 'utf-8');
    const config = JSON.parse(rawConfig);
    res.json({ records, config });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/rsvp
app.post('/api/rsvp', async (req, res) => {
  try {
    const newRecord = req.body;
    const rawRecords = fs.readFileSync(guestsFile, 'utf-8');
    const records = JSON.parse(rawRecords);
    records.unshift(newRecord);
    fs.writeFileSync(guestsFile, JSON.stringify(records, null, 2));

    let sheetSynced = false;
    try {
      const config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
      if (config.googleSheetsWebhookUrl && config.googleSheetsWebhookUrl.startsWith('http')) {
        const fetchRes = await fetch(config.googleSheetsWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newRecord),
        });
        sheetSynced = fetchRes.ok;
      }
    } catch (sheetErr) {
      console.warn('Google Sheets sync warning:', sheetErr);
    }

    res.json({ success: true, record: newRecord, sheetSynced });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/confirmados/:id
app.delete('/api/confirmados/:id', (req, res) => {
  try {
    const rawRecords = fs.readFileSync(guestsFile, 'utf-8');
    const records = JSON.parse(rawRecords);
    const filtered = records.filter((r: any) => r.id !== req.params.id);
    fs.writeFileSync(guestsFile, JSON.stringify(filtered, null, 2));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/config
app.post('/api/config', (req, res) => {
  try {
    const updatedConfig = req.body;
    fs.writeFileSync(configFile, JSON.stringify(updatedConfig, null, 2));
    res.json({ success: true, config: updatedConfig });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Static assets
const publicDir = path.resolve(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir, { maxAge: '30d' }));
}

const distDir = path.resolve(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir, { maxAge: '7d' }));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
