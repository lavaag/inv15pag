import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, Plugin} from 'vite';

function apiServerPlugin(): Plugin {
  const dataDir = path.resolve(process.cwd(), 'data');
  const guestsFile = path.join(dataDir, 'guests.json');
  const configFile = path.join(dataDir, 'config.json');

  // Ensure data dir exists
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Ensure default files
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

  return {
    name: 'api-server-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        res.setHeader('Content-Type', 'application/json');

        // GET /api/confirmados
        if (req.method === 'GET' && url.pathname === '/api/confirmados') {
          try {
            const rawRecords = fs.readFileSync(guestsFile, 'utf-8');
            const records = JSON.parse(rawRecords);
            const rawConfig = fs.readFileSync(configFile, 'utf-8');
            const config = JSON.parse(rawConfig);
            res.end(JSON.stringify({ records, config }));
          } catch (err: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        // POST /api/rsvp
        if (req.method === 'POST' && url.pathname === '/api/rsvp') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const newRecord = JSON.parse(body);
              const rawRecords = fs.readFileSync(guestsFile, 'utf-8');
              const records = JSON.parse(rawRecords);
              records.unshift(newRecord);
              fs.writeFileSync(guestsFile, JSON.stringify(records, null, 2));

              // Check if Google Sheets Webhook is configured
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

              res.end(JSON.stringify({ success: true, record: newRecord, sheetSynced }));
            } catch (err: any) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        // DELETE /api/confirmados/:id
        if (req.method === 'DELETE' && url.pathname.startsWith('/api/confirmados/')) {
          const id = url.pathname.replace('/api/confirmados/', '');
          try {
            const rawRecords = fs.readFileSync(guestsFile, 'utf-8');
            const records = JSON.parse(rawRecords);
            const filtered = records.filter((r: any) => r.id !== id);
            fs.writeFileSync(guestsFile, JSON.stringify(filtered, null, 2));
            res.end(JSON.stringify({ success: true }));
          } catch (err: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        // POST /api/config
        if (req.method === 'POST' && url.pathname === '/api/config') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const updatedConfig = JSON.parse(body);
              fs.writeFileSync(configFile, JSON.stringify(updatedConfig, null, 2));
              res.end(JSON.stringify({ success: true, config: updatedConfig }));
            } catch (err: any) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiServerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
