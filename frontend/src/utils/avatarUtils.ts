// ============================================================
// UTILS: Avatar e Iniciais
// Sistema WG Easy - Grupo WG Almeida
// ============================================================

import { supabaseRaw as supabase } from "@/lib/supabaseClient";

// Bucket de storage para avatares de pessoas
// 👉 Se o nome do bucket for outro, é só ajustar aqui.
export const PESSOAS_AVATAR_BUCKET = "avatars";

/**
 * Gera iniciais a partir do nome completo
 * Usa primeira letra do primeiro nome + primeira letra do último nome
 * Exemplos:
 * - "João Silva" → "JS"
 * - "Maria" → "MA"
 * - "Pedro Santos Costa" → "PC"
 */
export function gerarIniciais(nomeCompleto: string): string {
  if (!nomeCompleto || nomeCompleto.trim().length === 0) {
    return "??";
  }

  const partes = nomeCompleto.trim().split(/\s+/);

  if (partes.length === 1) {
    // Se tem apenas um nome, pega as duas primeiras letras
    const nome = partes[0];
    return nome.length >= 2
      ? nome.substring(0, 2).toUpperCase()
      : nome.substring(0, 1).toUpperCase();
  }

  // Pega primeira letra do primeiro nome + primeira letra do último nome
  const primeiroNome = partes[0];
  const ultimoNome = partes[partes.length - 1];

  return (primeiroNome[0] + ultimoNome[0]).toUpperCase();
}

/**
 * Gera cores de fundo aleatórias mas consistentes baseadas no nome
 * Mesma pessoa sempre terá a mesma cor
 */
export function gerarCorPorNome(nome: string): string {
  const cores = [
    "F25C26", // Laranja WG
    "3B82F6", // Azul
    "10B981", // Verde
    "8B5CF6", // Roxo
    "EF4444", // Vermelho
    "F59E0B", // Amarelo
    "EC4899", // Rosa
    "6366F1", // Indigo
  ];

  // Gera um índice baseado no nome (sempre o mesmo para o mesmo nome)
  let hash = 0;
  for (let i = 0; i < nome.length; i++) {
    hash = nome.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % cores.length;
  return cores[index];
}

/**
 * Gera URL para avatar usando ui-avatars.com API
 * @param nome - Nome completo da pessoa
 * @param backgroundColor - Cor de fundo em hex (sem #)
 * @param textColor - Cor do texto em hex (sem #)
 * @param size - Tamanho em pixels (padrão: 128)
 */
export function gerarAvatarUrl(
  nome: string,
  backgroundColor: string = gerarCorPorNome(nome || "WG"),
  textColor: string = "ffffff",
  size: number = 128
): string {
  const iniciais = gerarIniciais(nome);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    iniciais
  )}&background=${backgroundColor}&color=${textColor}&size=${size}&bold=true&format=svg`;
}

/**
 * Retorna a URL do avatar com fallback
 * Prioridade:
 * 1. avatar_url (storage)
 * 2. foto_url (legado ou externo)
 * 3. avatar (base64 antiga ou qualquer outra string de imagem)
 * 4. Avatar gerado com iniciais (ui-avatars)
 */
export function obterAvatarUrl(
  nome: string,
  avatar_url?: string | null,
  foto_url?: string | null,
  avatar?: string | null,
  backgroundColor?: string,
  textColor?: string,
  size?: number
): string {
  if (avatar_url) return avatar_url;
  if (foto_url) return foto_url;
  if (avatar) return avatar;
  return gerarAvatarUrl(nome, backgroundColor, textColor, size);
}

/**
 * Interface simples para trabalhar com a tabela pessoas
 */
export interface PessoaAvatarInfo {
  id: string;
  nome: string;
  avatar_url?: string | null;
  foto_url?: string | null;
  avatar?: string | null;
}

/**
 * Upload de avatar para Supabase Storage + atualização da tabela pessoas
 * - Salva no bucket definido em PESSOAS_AVATAR_BUCKET
 * - Atualiza o campo avatar_url na tabela pessoas
 * - Retorna a URL pública final
 */
export async function uploadAvatarPessoa(
  file: File,
  pessoaId: string
): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const filePath = `${pessoaId}/avatar-${Date.now()}.${ext}`;

  // Upload do arquivo
  const { error: uploadError } = await supabase.storage
    .from(PESSOAS_AVATAR_BUCKET)
    .upload(filePath, file, {
      upsert: true,
    });

  if (uploadError) {
    console.error("Erro ao fazer upload do avatar:", uploadError);
    throw uploadError;
  }

  // Recupera a URL pública
  const { data } = supabase.storage
    .from(PESSOAS_AVATAR_BUCKET)
    .getPublicUrl(filePath);

  const publicUrl = data.publicUrl;

  // Atualiza a tabela pessoas com a nova URL
  const { error: updateError } = await supabase
    .from("pessoas")
    .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
    .eq("id", pessoaId);

  if (updateError) {
    console.error("Erro ao atualizar avatar_url da pessoa:", updateError);
    // Não lança erro para não travar a UX — mas loga para inspeção
  }

  return publicUrl;
}

/**
 * Converte um arquivo em base64
 * Útil para salvar em campo avatar (legado) quando ainda não houver ID
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * Resolve a melhor URL de avatar a partir de um objeto pessoa
 */
export function getPessoaAvatarUrl(pessoa: PessoaAvatarInfo): string {
  return obterAvatarUrl(
    pessoa.nome,
    pessoa.avatar_url,
    pessoa.foto_url,
    pessoa.avatar
  );
}
