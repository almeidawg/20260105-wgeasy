// ============================================================
// Google Keep API - Integração Oficial (Workspace)
// ============================================================
// Documentação: https://developers.google.com/workspace/keep/api
// Requer: Google Workspace + Domain-wide Delegation
// ============================================================

import { google } from "googleapis";
import { createServiceAccountClientForService } from "./googleAuth";

const KEEP_SCOPES = [
  "https://www.googleapis.com/auth/keep",
  "https://www.googleapis.com/auth/keep.readonly",
];

// Email do usuário Workspace para impersonar (Domain-wide Delegation)
const KEEP_USER_EMAIL = process.env.GOOGLE_KEEP_USER_EMAIL || process.env.GOOGLE_SERVICE_ACCOUNT_SUBJECT;

// Prefixo para identificar notas do sistema WG-Easy
// (API do Keep não suporta labels, usamos prefixo no título como alternativa)
const WG_EASY_PREFIX = "[WG-Easy]";

interface KeepListItem {
  text: string;
  checked: boolean;
}

/**
 * Cria cliente autenticado do Google Keep
 * Usa Service Account com Domain-wide Delegation para impersonar o usuário
 * @param userEmail Email do usuário Workspace para impersonar (opcional, usa default se não informado)
 */
function createKeepClient(userEmail?: string) {
  const targetEmail = userEmail || KEEP_USER_EMAIL;

  if (!targetEmail) {
    throw new Error(
      "Email do usuário Workspace não informado e GOOGLE_KEEP_USER_EMAIL não configurado."
    );
  }

  console.log("[Keep] Criando cliente para usuário:", targetEmail);

  // Usa chave específica do Keep (GOOGLE_KEEP_SERVICE_ACCOUNT_KEY)
  // Se não existir, cai para a chave padrão (GOOGLE_SERVICE_ACCOUNT_KEY)
  // O subject é passado na criação do JWT para impersonação correta
  const auth = createServiceAccountClientForService(KEEP_SCOPES, 'keep', targetEmail);
  if (!auth) {
    throw new Error(
      "Service Account não configurada para Keep. Configure GOOGLE_KEEP_SERVICE_ACCOUNT_KEY ou GOOGLE_SERVICE_ACCOUNT_KEY no .env"
    );
  }

  return google.keep({ version: "v1", auth });
}

/**
 * Lista notas do Google Keep filtradas pelo prefixo WG-Easy
 * @param includeAll Se true, retorna todas as notas (para debug)
 * @param userEmail Email do usuário Workspace para impersonar (opcional)
 */
export async function listNotes(includeAll: boolean = false, userEmail?: string): Promise<any[]> {
  const keep = createKeepClient(userEmail);

  const response = await keep.notes.list({
    pageSize: 100,
  });

  const notes = response.data.notes || [];

  // Filtrar notas não deletadas
  let filteredNotes = notes.filter((note: any) => !note.trashed);

  // Filtrar apenas notas do WG-Easy (pelo prefixo no título)
  if (!includeAll) {
    filteredNotes = filteredNotes.filter((note: any) =>
      note.title?.startsWith(WG_EASY_PREFIX)
    );
  }

  // Formatar e remover o prefixo do título para exibição
  return filteredNotes.map((note: any) => {
    let displayTitle = note.title || "Sem título";

    // Remover prefixo [WG-Easy] para exibição mais limpa
    if (displayTitle.startsWith(WG_EASY_PREFIX)) {
      displayTitle = displayTitle.replace(WG_EASY_PREFIX, "").trim();
    }

    return {
      id: note.name?.replace("notes/", ""),
      title: displayTitle,
      originalTitle: note.title, // Título completo com prefixo
      text: extractNoteContent(note),
      items: extractListItems(note),
      createTime: note.createTime,
      updateTime: note.updateTime,
      isWGEasy: note.title?.startsWith(WG_EASY_PREFIX),
    };
  });
}

/**
 * Obtém uma nota específica por ID
 * @param noteId ID da nota
 * @param userEmail Email do usuário Workspace para impersonar (opcional)
 */
export async function getNote(noteId: string, userEmail?: string): Promise<any> {
  const keep = createKeepClient(userEmail);

  const response = await keep.notes.get({
    name: `notes/${noteId}`,
  });

  const note = response.data;
  return {
    id: note.name?.replace("notes/", ""),
    title: note.title || "Sem título",
    text: extractNoteContent(note),
    items: extractListItems(note),
    createTime: note.createTime,
    updateTime: note.updateTime,
  };
}

/**
 * Cria uma nova nota com prefixo WG-Easy
 * @param data Dados da nota (título, texto, itens)
 * @param userEmail Email do usuário Workspace para impersonar (opcional)
 */
export async function createNote(data: {
  title: string;
  text?: string;
  items?: Array<{ text: string; checked?: boolean }>;
}, userEmail?: string): Promise<any> {
  const keep = createKeepClient(userEmail);

  // Adicionar prefixo WG-Easy ao título (se ainda não tiver)
  let finalTitle = data.title || "Sem título";
  if (!finalTitle.startsWith(WG_EASY_PREFIX)) {
    finalTitle = `${WG_EASY_PREFIX} ${finalTitle}`;
  }

  // Construir o requestBody corretamente
  const requestBody: any = {
    title: finalTitle,
  };

  // Se tiver items válidos, criar como lista
  const validItems = data.items?.filter((item) => item.text?.trim());
  if (validItems && validItems.length > 0) {
    requestBody.body = {
      list: {
        listItems: validItems.map((item) => ({
          text: { text: item.text.trim() },
          checked: item.checked || false,
        })),
      },
    };
  } else {
    // Criar como texto (API Keep requer body)
    requestBody.body = {
      text: { text: data.text?.trim() || " " },
    };
  }

  console.log("[Google Keep] Criando nota:", JSON.stringify(requestBody, null, 2));

  const response = await keep.notes.create({
    requestBody,
  });

  return {
    id: response.data.name?.replace("notes/", ""),
    title: response.data.title,
    success: true,
  };
}

/**
 * Deleta uma nota
 * @param noteId ID da nota a ser deletada
 * @param userEmail Email do usuário Workspace para impersonar (opcional)
 */
export async function deleteNote(noteId: string, userEmail?: string): Promise<boolean> {
  const keep = createKeepClient(userEmail);

  // Garantir que o noteId não tenha o prefixo "notes/" duplicado
  const cleanId = noteId.replace(/^notes\//, "");
  const fullName = `notes/${cleanId}`;

  console.log("[Google Keep API] deleteNote - noteId recebido:", noteId);
  console.log("[Google Keep API] deleteNote - ID limpo:", cleanId);
  console.log("[Google Keep API] deleteNote - Nome completo:", fullName);

  await keep.notes.delete({
    name: fullName,
  });

  return true;
}

/**
 * Verifica se a API está configurada e funcionando
 */
export async function checkConnection(): Promise<{
  success: boolean;
  message: string;
  notesCount?: number;
  totalNotes?: number;
}> {
  try {
    // Buscar notas WG-Easy
    const wgNotes = await listNotes(false);
    // Buscar todas as notas para comparação
    const allNotes = await listNotes(true);

    return {
      success: true,
      message: `Conectado! ${wgNotes.length} notas WG-Easy de ${allNotes.length} total.`,
      notesCount: wgNotes.length,
      totalNotes: allNotes.length,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Erro ao conectar com Google Keep",
    };
  }
}

/**
 * Sincroniza notas no login (para dashboard)
 */
export async function syncNotesOnLogin(): Promise<any[]> {
  try {
    return await listNotes();
  } catch (error) {
    console.error("Erro ao sincronizar notas do Keep:", error);
    return [];
  }
}

// ============================================================
// Funções auxiliares
// ============================================================

function extractNoteContent(note: any): string {
  if (note.body?.text?.text) {
    return note.body.text.text;
  }
  if (note.body?.list?.listItems) {
    return note.body.list.listItems
      .map((item: any) => `${item.checked ? "☑" : "☐"} ${item.text?.text || ""}`)
      .join("\n");
  }
  return "";
}

function extractListItems(note: any): KeepListItem[] | null {
  if (!note.body?.list?.listItems) return null;

  return note.body.list.listItems.map((item: any) => ({
    text: item.text?.text || "",
    checked: item.checked || false,
  }));
}

