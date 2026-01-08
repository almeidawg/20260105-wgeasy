// ============================================================
// GOOGLE CALENDAR SERVICE - WG Easy
// Grupo WG Almeida
// ============================================================

import { google, calendar_v3 } from 'googleapis';
import {
  createServiceAccountClient,
} from './googleAuth';

// Configuração do OAuth2
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/auth/google/callback'
);

// API Key para leitura pública
const API_KEY = process.env.GOOGLE_CALENDAR_API_KEY;

// Cliente do Calendar
const calendar = google.calendar({ version: 'v3' });

type OAuth2ClientInstance = InstanceType<typeof google.auth.OAuth2>;
type JWTClientInstance = InstanceType<typeof google.auth.JWT>;

const CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
];

// ============================================================
// TIPOS
// ============================================================

export interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: string;
  }>;
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: string;
      minutes: number;
    }>;
  };
  colorId?: string;
}

// ============================================================
// FUNÇÕES DE AUTENTICAÇÃO
// ============================================================

/**
 * Gera URL de autenticação OAuth2
 */
export function getAuthUrl(): string {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ],
  });
}

/**
 * Troca código de autorização por tokens
 */
export async function getTokensFromCode(code: string): Promise<{
  access_token: string;
  refresh_token?: string;
}> {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  return {
    access_token: tokens.access_token || '',
    refresh_token: tokens.refresh_token || undefined,
  };
}

/**
 * Define tokens no cliente OAuth2
 */
export function setCredentials(tokens: { access_token: string; refresh_token?: string }) {
  oauth2Client.setCredentials(tokens);
}

async function resolveCalendarAuth(
  accessToken?: string
): Promise<OAuth2ClientInstance | JWTClientInstance> {
  if (accessToken) {
    oauth2Client.setCredentials({ access_token: accessToken });
    return oauth2Client;
  }

  const serviceAccount = createServiceAccountClient(CALENDAR_SCOPES);
  if (serviceAccount) {
    await serviceAccount.authorize();
    return serviceAccount;
  }

  if (process.env.GOOGLE_CALENDAR_REFRESH_TOKEN) {
    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_CALENDAR_REFRESH_TOKEN,
    });
    try {
      await oauth2Client.getAccessToken();
    } catch (error) {
      console.warn("Falha ao renovar token com refresh_token:", error);
    }
  }

  return oauth2Client;
}

// ============================================================
// FUNÇÕES DE LEITURA (API Key)
// ============================================================

/**
 * Lista eventos de um calendário público
 */
export async function listPublicEvents(
  calendarId: string,
  options?: {
    timeMin?: string;
    timeMax?: string;
    maxResults?: number;
  }
): Promise<CalendarEvent[]> {
  try {
    const response = await calendar.events.list({
      calendarId,
      key: API_KEY,
      timeMin: options?.timeMin || new Date().toISOString(),
      timeMax: options?.timeMax,
      maxResults: options?.maxResults || 50,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return (response.data.items || []) as CalendarEvent[];
  } catch (error) {
    console.error('Erro ao listar eventos:', error);
    return [];
  }
}

// ============================================================
// FUNÇÕES DE ESCRITA (OAuth2)
// ============================================================

/**
 * Cria um novo evento
 */
export async function createEvent(
  calendarId: string,
  event: CalendarEvent,
  accessToken?: string
): Promise<CalendarEvent | null> {
  try {
    const auth = await resolveCalendarAuth(accessToken);

    const response = await calendar.events.insert({
      auth,
      calendarId,
      requestBody: event as calendar_v3.Schema$Event,
      sendUpdates: 'all', // Envia convites para participantes
    });

    return response.data as CalendarEvent;
  } catch (error) {
    console.error('Erro ao criar evento:', error);
    return null;
  }
}

/**
 * Atualiza um evento existente
 */
export async function updateEvent(
  calendarId: string,
  eventId: string,
  event: Partial<CalendarEvent>,
  accessToken?: string
): Promise<CalendarEvent | null> {
  try {
    const auth = await resolveCalendarAuth(accessToken);

    const response = await calendar.events.patch({
      auth,
      calendarId,
      eventId,
      requestBody: event as calendar_v3.Schema$Event,
      sendUpdates: 'all',
    });

    return response.data as CalendarEvent;
  } catch (error) {
    console.error('Erro ao atualizar evento:', error);
    return null;
  }
}

/**
 * Deleta um evento
 */
export async function deleteEvent(
  calendarId: string,
  eventId: string,
  accessToken?: string
): Promise<boolean> {
  try {
    const auth = await resolveCalendarAuth(accessToken);

    await calendar.events.delete({
      auth,
      calendarId,
      eventId,
      sendUpdates: 'all',
    });

    return true;
  } catch (error) {
    console.error('Erro ao deletar evento:', error);
    return false;
  }
}

/**
 * Lista calendários do usuário
 */
export async function listCalendars(accessToken?: string): Promise<any[]> {
  try {
    const auth = await resolveCalendarAuth(accessToken);

    const response = await calendar.calendarList.list({
      auth,
    });

    return response.data.items || [];
  } catch (error) {
    console.error('Erro ao listar calendários:', error);
    return [];
  }
}

/**
 * Cria um evento rápido (com texto natural)
 */
export async function quickAdd(
  calendarId: string,
  text: string,
  accessToken?: string
): Promise<CalendarEvent | null> {
  try {
    const auth = await resolveCalendarAuth(accessToken);

    const response = await calendar.events.quickAdd({
      auth,
      calendarId,
      text, // Ex: "Reunião com cliente amanhã às 14h"
    });

    return response.data as CalendarEvent;
  } catch (error) {
    console.error('Erro ao criar evento rápido:', error);
    return null;
  }
}

export default {
  getAuthUrl,
  getTokensFromCode,
  setCredentials,
  listPublicEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  listCalendars,
  quickAdd,
};
