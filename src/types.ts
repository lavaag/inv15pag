export type DietaryCondition =
  | 'Ninguna (Menú tradicional)'
  | 'Celíaco / Sin TACC'
  | 'Vegetariano'
  | 'Vegano'
  | 'Diabético'
  | 'Hipertenso / Sin sal'
  | 'Intolerante a la lactosa'
  | 'Alergia alimentaria u otra';

export interface GuestItem {
  id: string;
  nombre: string;
  condicion: DietaryCondition;
  detalleCondicion?: string; // e.g. "Alergia a frutos secos / mariscos"
  esMenor?: boolean;
}

export interface RsvpRecord {
  id: string;
  fechaCreacion: string; // ISO string
  titularNombre: string;
  telefono: string;
  asiste: boolean;
  condicionTitular: DietaryCondition;
  detalleCondicionTitular?: string;
  acompanantes: GuestItem[];
  totalPersonas: number;
  cancionSugerida?: string;
  mensajeDedicatoria?: string;
}

export interface DietarySummary {
  tradicional: number;
  celiaco: number;
  vegetariano: number;
  vegano: number;
  diabetico: number;
  hipertenso: number;
  lactosa: number;
  otraAlergia: number;
  total: number;
}

export interface AppConfig {
  // General & Host Security
  adminPassword?: string;

  // Celebrated Person & Main Titles
  nombreQuinceanera?: string;
  tituloIngreso?: string;
  fraseIngreso?: string;
  subtituloHero?: string;
  fraseEmotiva?: string;

  // Date, Time & Venue
  fechaTexto?: string;
  horaTexto?: string;
  fechaIsoCountdown?: string;
  fechaLimiteRsvp?: string;
  lugarNombre?: string;
  lugarDireccion?: string;
  linkMaps?: string;
  linkCalendar?: string;

  // Dress Code
  dressCodeTitulo?: string;
  dressCodeDescripcion?: string;

  // Music
  musicaUrl?: string;
  musicaTitulo?: string;

  // Images
  heroImageUrl?: string;
  dressCodeImageUrl?: string;
  galeriaFotos?: string[];
  finalImageUrl?: string;

  // Gift & Bank
  fraseRegalo?: string;
  aliasCbu?: string;
  titularCbu?: string;
  bancoNombre?: string;
  cbuCompleto?: string;

  // Social & Integrations
  instagramTag?: string;
  instagramUrl?: string;
  googleSheetsWebhookUrl?: string;
  sheetPublicViewUrl?: string;
}

export interface TriviaQuestion {
  id: number;
  pregunta: string;
  opciones: string[];
  respuestaCorrecta: number; // index
  explicacion: string;
}
