/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RsvpRecord, AppConfig, DietarySummary } from '../types';

/**
 * Formats a single RSVP record according to the exact user specification:
 * "1- Nombre: Ignacio Fredes | contacto: 1143543454 | Menú : Ninguna (Menú tradicional) | Acompañante 1: Ejemplo | Menu Acompañante 1:"
 */
export function formatGuestRecordSingleLine(r: RsvpRecord, index: number): string {
  const parts: string[] = [
    `${index}- Nombre: ${r.titularNombre || 'Sin nombre'}`,
    `contacto: ${r.telefono || 'Sin especificar'}`,
    `Menú : ${r.condicionTitular || 'Ninguna (Menú tradicional)'}${r.detalleCondicionTitular ? ` (${r.detalleCondicionTitular})` : ''}`,
  ];

  if (r.acompanantes && r.acompanantes.length > 0) {
    r.acompanantes.forEach((acomp, aIdx) => {
      parts.push(`Acompañante ${aIdx + 1}: ${acomp.nombre || 'Sin nombre'}`);
      const compMenu = acomp.condicion || 'Ninguna (Menú tradicional)';
      const compDetalle = acomp.detalleCondicion ? ` (${acomp.detalleCondicion})` : '';
      parts.push(`Menu Acompañante ${aIdx + 1}: ${compMenu}${compDetalle}`);
    });
  } else {
    // If no companions, show companion 1 as Ninguno for clear tabular alignment
    parts.push('Acompañante 1: Ninguno');
    parts.push('Menu Acompañante 1: -');
  }

  return parts.join(' | ');
}

/**
 * Generates the entire guest list in raw text matching the required format
 */
export function generateFormattedGuestListText(records: RsvpRecord[]): string {
  const confirmedOnly = records.filter((r) => r.asiste);
  if (confirmedOnly.length === 0) {
    return 'No hay invitados confirmados registrados aún.';
  }

  return confirmedOnly
    .map((record, idx) => formatGuestRecordSingleLine(record, idx + 1))
    .join('\n');
}

/**
 * Generates and downloads a Microsoft Word (.doc) document containing
 * the exact requested format prominently, plus an overview summary and detailed table.
 */
export function exportToWordDocument(
  records: RsvpRecord[],
  config: AppConfig,
  summary: DietarySummary
) {
  const quinceaneraName = config.nombreQuinceanera || 'Sofía';
  const eventDate = config.fechaTexto || 'Sábado 10 de Octubre de 2026';
  const salon = config.lugarNombre || 'Clahe Eventos Berazategui';

  const confirmedRecords = records.filter((r) => r.asiste);

  // 1. Generate the exact lines requested by the user
  const formattedLines = confirmedRecords.map((r, idx) => {
    const lineText = formatGuestRecordSingleLine(r, idx + 1);
    return `
      <div style="font-family: 'Consolas', 'Courier New', monospace; font-size: 11pt; padding: 6px 10px; margin-bottom: 4px; background-color: ${idx % 2 === 0 ? '#ffffff' : '#f9f5f8'}; border-left: 3px solid #7e526a; border-bottom: 1px solid #eee;">
        <strong>${lineText}</strong>
      </div>
    `;
  }).join('');

  // 2. Generate detailed table for catering
  const tableRows = confirmedRecords.map((r, idx) => {
    const acompList = r.acompanantes.length > 0
      ? r.acompanantes.map((a, i) => `• <strong>${a.nombre}</strong> (${a.condicion}${a.detalleCondicion ? ` - ${a.detalleCondicion}` : ''})`).join('<br/>')
      : '<span style="color: #888;">Sin acompañantes</span>';

    return `
      <tr style="border-bottom: 1px solid #e0d0d8; background-color: ${idx % 2 === 0 ? '#ffffff' : '#fdfbfc'};">
        <td style="padding: 8px 10px; border: 1px solid #d4c2cc; text-align: center; font-weight: bold;">${idx + 1}</td>
        <td style="padding: 8px 10px; border: 1px solid #d4c2cc;">
          <strong>${r.titularNombre}</strong><br/>
          <span style="color: #666; font-size: 9pt;">Tel: ${r.telefono}</span>
        </td>
        <td style="padding: 8px 10px; border: 1px solid #d4c2cc; text-align: center; font-weight: bold; color: #107c41;">
          ${r.totalPersonas}
        </td>
        <td style="padding: 8px 10px; border: 1px solid #d4c2cc;">
          <span style="color: #7e526a; font-weight: bold;">${r.condicionTitular}</span>
          ${r.detalleCondicionTitular ? `<br/><small style="color: #666;">(${r.detalleCondicionTitular})</small>` : ''}
        </td>
        <td style="padding: 8px 10px; border: 1px solid #d4c2cc; font-size: 9.5pt;">
          ${acompList}
        </td>
        <td style="padding: 8px 10px; border: 1px solid #d4c2cc; font-size: 9pt; color: #555;">
          ${r.cancionSugerida || '-'}
        </td>
      </tr>
    `;
  }).join('');

  const wordHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>Lista de Invitados Confirmados - Mis 15 ${quinceaneraName}</title>
      <style>
        body { font-family: 'Calibri', 'Segoe UI', Arial, sans-serif; color: #222; margin: 30px; }
        h1 { color: #7e526a; font-size: 22pt; margin-bottom: 2px; }
        h2 { color: #555; font-size: 13pt; font-weight: normal; margin-top: 0; margin-bottom: 16px; }
        h3 { color: #7e526a; font-size: 14pt; margin-top: 24px; margin-bottom: 8px; border-bottom: 2px solid #7e526a; padding-bottom: 4px; }
        .summary-card { background-color: #f7eff3; border: 1px solid #d9bdcb; padding: 12px 18px; margin-bottom: 22px; border-radius: 4px; }
        .summary-stat { display: inline-block; margin-right: 20px; font-size: 11pt; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 10pt; }
        th { background-color: #7e526a; color: #ffffff; padding: 10px 8px; text-align: left; border: 1px solid #7e526a; }
        .footer-note { margin-top: 30px; font-size: 9pt; color: #888; border-top: 1px solid #ddd; padding-top: 8px; }
      </style>
    </head>
    <body>
      <h1>MIS 15 ${quinceaneraName.toUpperCase()} — LISTA OFICIAL DE INVITADOS</h1>
      <h2>${eventDate} • ${salon}</h2>

      <div class="summary-card">
        <div class="summary-stat"><strong>Total Personas Confirmadas:</strong> ${summary.total}</div>
        <div class="summary-stat"><strong>Menú Tradicional:</strong> ${summary.tradicional}</div>
        <div class="summary-stat"><strong>Celíacos (Sin TACC):</strong> ${summary.celiaco}</div>
        <div class="summary-stat"><strong>Vegetarianos:</strong> ${summary.vegetariano}</div>
        <div class="summary-stat"><strong>Veganos:</strong> ${summary.vegano}</div>
        <div class="summary-stat"><strong>Otras Dietas / Alergias:</strong> ${summary.diabetico + summary.hipertenso + summary.lactosa + summary.otraAlergia}</div>
      </div>

      <h3>FORMATO RÁPIDO SOLICITADO (NOMBRE | CONTACTO | MENÚ | ACOMPAÑANTE 1 | MENU ACOMPAÑANTE 1)</h3>
      <div style="margin-bottom: 24px;">
        ${formattedLines}
      </div>

      <h3>DETALLE GENERAL Y CONTROL DE CATERING</h3>
      <table>
        <thead>
          <tr>
            <th style="width: 35px; text-align: center;">#</th>
            <th style="width: 220px;">Invitado Titular</th>
            <th style="width: 60px; text-align: center;">Total</th>
            <th style="width: 170px;">Menú Titular</th>
            <th>Acompañantes y sus Menús</th>
            <th style="width: 160px;">Canción Sugerida</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>

      <div class="footer-note">
        Documento generado automáticamente el ${new Date().toLocaleString('es-AR')}.
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', wordHtml], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Invitados_Mis15_${quinceaneraName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads a clean TXT file containing the exact format requested
 */
export function exportToTxtDocument(records: RsvpRecord[], config: AppConfig) {
  const quinceaneraName = config.nombreQuinceanera || 'Sofía';
  const content = generateFormattedGuestListText(records);
  const header = `LISTA DE INVITADOS CONFIRMADOS - MIS 15 ${quinceaneraName.toUpperCase()}\nFecha de exportación: ${new Date().toLocaleString('es-AR')}\n--------------------------------------------------------------------------------\n\n`;

  const blob = new Blob([header + content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Lista_Invitados_Mis15_${quinceaneraName.replace(/\s+/g, '_')}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
