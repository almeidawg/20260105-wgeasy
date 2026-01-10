// ============================================================
// API SECURE - Helper para chamadas seguras ao backend
// Todas as chamadas a APIs externas devem passar pelo backend
// para não expor chaves de API no frontend
// ============================================================

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";
const INTERNAL_API_KEY = import.meta.env.VITE_INTERNAL_API_KEY || "";

/**
 * Verifica se a configuração está correta
 */
export function isBackendConfigured(): boolean {
  return Boolean(BACKEND_URL && INTERNAL_API_KEY);
}

/**
 * Headers padrão para requisições autenticadas
 */
function getHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    "x-internal-key": INTERNAL_API_KEY,
  };
}

/**
 * Chamada segura para OpenAI Chat Completions via backend
 */
export async function openaiChat(
  messages: any[],
  options?: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
  }
): Promise<any> {
  if (!isBackendConfigured()) {
    throw new Error(
      "Backend não configurado. Verifique VITE_BACKEND_URL e VITE_INTERNAL_API_KEY."
    );
  }

  const response = await fetch(`${BACKEND_URL}/api/openai/chat`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      model: options?.model || "gpt-4o",
      messages,
      max_tokens: options?.maxTokens || 4096,
      temperature: options?.temperature || 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Erro desconhecido" }));
    throw new Error(error.error || `Erro ${response.status}`);
  }

  return response.json();
}

/**
 * Chamada segura para OpenAI Vision via backend
 */
export async function openaiVision(
  images: string[],
  prompt: string
): Promise<any> {
  if (!isBackendConfigured()) {
    throw new Error(
      "Backend não configurado. Verifique VITE_BACKEND_URL e VITE_INTERNAL_API_KEY."
    );
  }

  const response = await fetch(`${BACKEND_URL}/api/openai/vision`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ images, prompt }),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Erro desconhecido" }));
    throw new Error(error.error || `Erro ${response.status}`);
  }

  return response.json();
}

/**
 * Chamada segura para Anthropic Claude via backend
 */
export async function anthropicChat(
  messages: any[],
  options?: {
    model?: string;
    maxTokens?: number;
  }
): Promise<any> {
  if (!isBackendConfigured()) {
    throw new Error(
      "Backend não configurado. Verifique VITE_BACKEND_URL e VITE_INTERNAL_API_KEY."
    );
  }

  const response = await fetch(`${BACKEND_URL}/api/anthropic/messages`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      model: options?.model || "claude-3-5-sonnet-20241022",
      messages,
      max_tokens: options?.maxTokens || 4096,
    }),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Erro desconhecido" }));
    throw new Error(error.error || `Erro ${response.status}`);
  }

  return response.json();
}

/**
 * Chamada segura para envio de email via backend
 */
export async function sendEmail(params: {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  attachments?: any[];
}): Promise<boolean> {
  if (!isBackendConfigured()) {
    throw new Error("Backend não configurado.");
  }

  const response = await fetch(`${BACKEND_URL}/api/email/send`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Erro desconhecido" }));
    throw new Error(error.error || `Erro ${response.status}`);
  }

  const data = await response.json();
  return data.success === true;
}

/**
 * Chamada segura para eventos do calendário via backend
 */
export async function getCalendarEvents(
  calendarId: string,
  options?: {
    timeMin?: string;
    timeMax?: string;
    maxResults?: number;
  }
): Promise<any[]> {
  if (!isBackendConfigured()) {
    throw new Error("Backend não configurado.");
  }

  const params = new URLSearchParams({ calendarId });
  if (options?.timeMin) params.append("timeMin", options.timeMin);
  if (options?.timeMax) params.append("timeMax", options.timeMax);
  if (options?.maxResults)
    params.append("maxResults", String(options.maxResults));

  const response = await fetch(`${BACKEND_URL}/api/calendar/events?${params}`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Erro desconhecido" }));
    throw new Error(error.error || `Erro ${response.status}`);
  }

  const data = await response.json();
  return data.events || [];
}

/**
 * Cria ou busca pasta do cliente no Google Drive
 */
export async function criarPastaCliente(
  clienteNome: string
): Promise<{ id: string; name: string; link: string }> {
  if (!isBackendConfigured()) {
    throw new Error("Backend não configurado.");
  }

  const response = await fetch(`${BACKEND_URL}/api/drive/cliente-folder`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ clienteNome }),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Erro desconhecido" }));
    throw new Error(error.error || `Erro ${response.status}`);
  }

  const data = await response.json();
  if (!data.success || !data.folder) {
    throw new Error("Falha ao criar pasta no Drive");
  }

  return data.folder;
}

/**
 * Busca pasta existente no Google Drive
 */
export async function buscarPastaDrive(
  nome: string,
  parentId?: string
): Promise<{ id: string; name: string; webViewLink: string } | null> {
  if (!isBackendConfigured()) {
    throw new Error("Backend não configurado.");
  }

  const params = new URLSearchParams({ name: nome });
  if (parentId) params.append("parentId", parentId);

  const response = await fetch(`${BACKEND_URL}/api/drive/find-folder?${params}`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Erro desconhecido" }));
    throw new Error(error.error || `Erro ${response.status}`);
  }

  const data = await response.json();
  return data.found ? data.folder : null;
}

// ============================================================
// CALENDAR SERVICE ACCOUNT (SA) - Para uso sem login do usuário
// ============================================================

/**
 * Verifica se Service Account do Calendar está configurada
 */
export async function getCalendarSAStatus(): Promise<{ configured: boolean; calendarId?: string; error?: string }> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/calendar/status`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      return { configured: false, error: `HTTP ${response.status}` };
    }

    return await response.json();
  } catch (error: any) {
    console.error("[apiSecure] Erro ao verificar status do calendar:", error);
    return { configured: false, error: error.message };
  }
}

/**
 * Busca eventos do Calendar via Service Account
 * @param options Opções de filtro (timeMin, timeMax, maxResults, userEmail)
 */
export async function getCalendarSAEvents(options?: {
  timeMin?: string;
  timeMax?: string;
  maxResults?: number;
  userEmail?: string;
}): Promise<{ events?: any[]; error?: string }> {
  try {
    const params = new URLSearchParams();
    if (options?.timeMin) params.append("timeMin", options.timeMin);
    if (options?.timeMax) params.append("timeMax", options.timeMax);
    if (options?.maxResults) params.append("maxResults", String(options.maxResults));
    if (options?.userEmail) params.append("userEmail", options.userEmail);

    const response = await fetch(`${BACKEND_URL}/api/calendar/sa/events?${params}`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Erro desconhecido" }));
      return { error: error.error || `HTTP ${response.status}` };
    }

    return await response.json();
  } catch (error: any) {
    console.error("[apiSecure] Erro ao buscar eventos:", error);
    return { error: error.message };
  }
}

/**
 * Cria evento no Calendar via Service Account
 */
export async function createCalendarSAEvent(event: {
  summary: string;
  description?: string;
  location?: string;
  start: { dateTime?: string; date?: string; timeZone?: string };
  end: { dateTime?: string; date?: string; timeZone?: string };
  colorId?: string;
}): Promise<{ event?: any; error?: string }> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/calendar/sa/events`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Erro desconhecido" }));
      return { error: error.error || `HTTP ${response.status}` };
    }

    return await response.json();
  } catch (error: any) {
    console.error("[apiSecure] Erro ao criar evento:", error);
    return { error: error.message };
  }
}

/**
 * Atualiza evento no Calendar via Service Account
 */
export async function updateCalendarSAEvent(
  eventId: string,
  event: {
    summary?: string;
    description?: string;
    location?: string;
    start?: { dateTime?: string; date?: string; timeZone?: string };
    end?: { dateTime?: string; date?: string; timeZone?: string };
    colorId?: string;
  }
): Promise<{ event?: any; error?: string }> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/calendar/sa/events/${eventId}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Erro desconhecido" }));
      return { error: error.error || `HTTP ${response.status}` };
    }

    return await response.json();
  } catch (error: any) {
    console.error("[apiSecure] Erro ao atualizar evento:", error);
    return { error: error.message };
  }
}

/**
 * Deleta evento no Calendar via Service Account
 */
export async function deleteCalendarSAEvent(eventId: string): Promise<{ success?: boolean; error?: string }> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/calendar/sa/events/${eventId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Erro desconhecido" }));
      return { error: error.error || `HTTP ${response.status}` };
    }

    return await response.json();
  } catch (error: any) {
    console.error("[apiSecure] Erro ao deletar evento:", error);
    return { error: error.message };
  }
}

export default {
  isBackendConfigured,
  openaiChat,
  openaiVision,
  anthropicChat,
  sendEmail,
  getCalendarEvents,
  criarPastaCliente,
  buscarPastaDrive,
  // Calendar Service Account
  getCalendarSAStatus,
  getCalendarSAEvents,
  createCalendarSAEvent,
  updateCalendarSAEvent,
  deleteCalendarSAEvent,
};
