// src/lib/uploadDocumentoPessoa.ts
import { supabase } from "@/lib/supabaseClient";
import { PessoaDocumento } from "./pessoasApi";

export async function uploadDocumentoPessoa(
  pessoaId: string,
  arquivo: File,
  tipo: string,
  validade?: string
): Promise<PessoaDocumento> {
  const extensao = arquivo.name.split(".").pop();
  const nomeArquivo = `${pessoaId}/${Date.now()}.${extensao}`;

  const { error: uploadError } = await supabase.storage
    .from("pessoas-docs")
    .upload(nomeArquivo, arquivo);

  if (uploadError) throw uploadError;

  const { data: signed } = await supabase.storage
    .from("pessoas-docs")
    .createSignedUrl(nomeArquivo, 60 * 60 * 24); // 24h

  const arquivo_url = signed?.signedUrl;

  const { data, error } = await supabase
    .from("pessoas_documentos")
    .insert({
      pessoa_id: pessoaId,
      tipo,
      arquivo_url,
      validade: validade || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as PessoaDocumento;
}
