import { supabase } from "./supabaseClient";

interface UploadResult {
  foto: any;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export async function uploadFotoDiarioBackend(
  registroId: string,
  file: File,
  descricao?: string,
  driveFolderId?: string
) {
  const form = new FormData();
  form.append("foto", file);
  if (descricao) {
    form.append("descricao", descricao);
  }
  if (driveFolderId) {
    form.append("driveFolderId", driveFolderId);
  }

  const response = await fetch(`/api/diario-obras/${registroId}/fotos`, {
    method: "POST",
    body: form,
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Upload da foto falhou (${response.status}): ${errorText || "sem mensagem"}`
    );
  }

  const body: UploadResult = await response.json();
  return body.foto;
}
