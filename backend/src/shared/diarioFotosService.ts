import { supabase } from "./supabaseClient";
import { uploadFileToFolder } from "./driveService";

const FOTOS_TABLE = "obra_registros_fotos";
const STORAGE_BUCKET = process.env.DIARIO_OBRA_BUCKET || "diario-obra";

export interface DiarioFotoPayload {
  registroId: string;
  buffer: Buffer;
  originalName: string;
  mimeType?: string;
  descricao?: string;
  driveFolderId?: string;
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function uploadDiarioFoto(payload: DiarioFotoPayload) {
  const { registroId, buffer, originalName, descricao, driveFolderId } = payload;
  const mimeType = payload.mimeType || "application/octet-stream";
  const timestamp = Date.now();
  const safeName = sanitizeFileName(originalName || `${timestamp}.jpg`);
  const storageKey = `${registroId}/${timestamp}_${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storageKey, buffer, {
      cacheControl: "3600",
      upsert: false,
      contentType: mimeType,
    });

  if (uploadError) {
    console.error("Erro ao fazer upload no Storage:", uploadError);
    throw uploadError;
  }

  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(storageKey);

  const publicUrl = urlData?.publicUrl;

  const { data: existingPhotos } = await supabase
    .from(FOTOS_TABLE)
    .select("ordem")
    .eq("registro_id", registroId)
    .order("ordem", { ascending: false })
    .limit(1);

  const nextOrdem = (existingPhotos?.[0]?.ordem ?? -1) + 1;

  const { data, error: insertError } = await supabase
    .from(FOTOS_TABLE)
    .insert({
      registro_id: registroId,
      arquivo_url: publicUrl,
      descricao: descricao || null,
      ordem: nextOrdem,
    })
    .select()
    .single();

  if (insertError) {
    console.error("Erro ao salvar registro da foto:", insertError);
    throw insertError;
  }

  if (driveFolderId) {
    try {
      await uploadFileToFolder(
        driveFolderId,
        safeName,
        buffer,
        mimeType
      );
    } catch (driveError) {
      console.warn(
        "Falha ao enviar foto para o Google Drive (continua com Supabase):",
        driveError
      );
    }
  }

  return data;
}
