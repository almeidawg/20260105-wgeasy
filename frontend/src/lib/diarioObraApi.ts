/**
 * API para o módulo de Diário de Obra
 * Baseado na tabela obra_registros do banco de dados
 */

import { supabase } from "./supabaseClient";
import { googleDriveService as googleDriveBrowserService } from "@/services/googleDriveBrowserService";
import type {
  DiarioObra,
  DiarioObraFoto,
  DiarioObraInput,
  DiarioObraFotoInput,
  DiarioObraUpdateInput,
  DiarioObraFotoUpdateInput,
  DiarioObraFiltros,
} from "@/types/diarioObra";

// Re-exportar tipos para uso em componentes
export type {
  DiarioObra,
  DiarioObraFoto,
  DiarioObraInput,
  DiarioObraFotoInput,
  DiarioObraUpdateInput,
  DiarioObraFotoUpdateInput,
  DiarioObraFiltros,
} from "@/types/diarioObra";

// Tipo para opções de obras no select
export interface ObraOption {
  id: string;
  nome: string;
  cliente_nome: string;
  numero?: string;
}

// Alias para compatibilidade
export type OportunidadeOption = ObraOption;

const DIARIO_TABLE = "obra_registros";
const FOTOS_TABLE = "obra_registros_fotos";
const STORAGE_BUCKET = "diario-obra";

// ============================================================
// Funções auxiliares de mapeamento
// ============================================================

function mapDiarioFromDb(row: any): DiarioObra {
  return {
    id: row.id,
    cliente_id: row.cliente_id,
    colaborador_id: row.colaborador_id,
    data_registro: row.data_registro,
    titulo: row.titulo,
    descricao: row.descricao,
    clima: row.clima,
    equipe_presente: row.equipe_presente,
    percentual_avanco: row.percentual_avanco,
    pendencias: row.pendencias,
    observacoes: row.observacoes,
    etapa_cronograma_id: row.etapa_cronograma_id,
    criado_em: row.criado_em,
    atualizado_em: row.atualizado_em,
    cliente: row.cliente
      ? {
          id: row.cliente.id,
          nome: row.cliente.nome,
        }
      : undefined,
    colaborador: row.colaborador
      ? {
          id: row.colaborador.id,
          nome: row.colaborador.nome,
          avatar_url: row.colaborador.avatar_url,
        }
      : undefined,
    fotos: row.obra_registros_fotos?.map(mapFotoFromDb) ?? [],
  };
}

function mapFotoFromDb(row: any): DiarioObraFoto {
  return {
    id: row.id,
    registro_id: row.registro_id,
    arquivo_url: row.arquivo_url,
    descricao: row.descricao,
    legenda: row.legenda ?? null,
    ordem: row.ordem ?? 0,
    criado_em: row.criado_em,
  };
}

// ============================================================
// CRUD - Diário de Obra (obra_registros)
// ============================================================

/**
 * Cria um novo registro de diário de obra
 */
export async function criarRegistroDiario(
  input: DiarioObraInput
): Promise<DiarioObra> {
  const { data, error } = await supabase
    .from(DIARIO_TABLE)
    .insert({
      cliente_id: input.cliente_id,
      colaborador_id: input.colaborador_id,
      data_registro:
        input.data_registro || new Date().toISOString().split("T")[0],
      titulo: input.titulo || null,
      descricao: input.descricao || null,
      clima: input.clima || null,
      equipe_presente: input.equipe_presente || null,
      percentual_avanco: input.percentual_avanco || null,
      pendencias: input.pendencias || null,
      observacoes: input.observacoes || null,
    })
    .select(
      `
      *,
      cliente:cliente_id (id, nome),
      colaborador:colaborador_id (id, nome, avatar_url),
      obra_registros_fotos (*)
    `
    )
    .single();

  if (error) {
    console.error("Erro ao criar registro de diário:", error);
    throw new Error(`Erro ao criar registro: ${error.message}`);
  }

  return mapDiarioFromDb(data);
}

/**
 * Atualiza um registro de diário existente
 */
export async function atualizarRegistroDiario(
  diarioId: string,
  input: DiarioObraUpdateInput
): Promise<DiarioObra> {
  const updateData: Record<string, any> = {
    atualizado_em: new Date().toISOString(),
  };

  if (input.titulo !== undefined) updateData.titulo = input.titulo;
  if (input.descricao !== undefined) updateData.descricao = input.descricao;
  if (input.clima !== undefined) updateData.clima = input.clima;
  if (input.equipe_presente !== undefined)
    updateData.equipe_presente = input.equipe_presente;
  if (input.percentual_avanco !== undefined)
    updateData.percentual_avanco = input.percentual_avanco;
  if (input.pendencias !== undefined) updateData.pendencias = input.pendencias;
  if (input.observacoes !== undefined)
    updateData.observacoes = input.observacoes;

  const { data, error } = await supabase
    .from(DIARIO_TABLE)
    .update(updateData)
    .eq("id", diarioId)
    .select(
      `
      *,
      cliente:cliente_id (id, nome),
      colaborador:colaborador_id (id, nome, avatar_url),
      obra_registros_fotos (*)
    `
    )
    .single();

  if (error) {
    console.error("Erro ao atualizar registro:", error);
    throw new Error(`Erro ao atualizar registro: ${error.message}`);
  }

  return mapDiarioFromDb(data);
}

/**
 * Exclui um registro de diário (cascade deleta as fotos)
 */
export async function excluirRegistroDiario(diarioId: string): Promise<void> {
  // Primeiro buscar as fotos para remover do Storage
  const { data: fotos } = await supabase
    .from(FOTOS_TABLE)
    .select("*")
    .eq("registro_id", diarioId);

  // Remover fotos do Supabase Storage
  if (fotos && fotos.length > 0) {
    const filePaths = fotos
      .map((f) => {
        const url = f.arquivo_url;
        // Extrair path do arquivo da URL do Supabase
        const match = url.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)/);
        return match ? match[1] : null;
      })
      .filter(Boolean);

    if (filePaths.length > 0) {
      await supabase.storage.from(STORAGE_BUCKET).remove(filePaths as string[]);
    }
  }

  // Excluir o registro (fotos são deletadas por cascade)
  const { error } = await supabase
    .from(DIARIO_TABLE)
    .delete()
    .eq("id", diarioId);

  if (error) {
    console.error("Erro ao excluir registro:", error);
    throw new Error(`Erro ao excluir registro: ${error.message}`);
  }
}

/**
 * Lista registros de diário por colaborador
 */
export async function listarDiariosPorColaborador(
  colaboradorId: string,
  filtros?: DiarioObraFiltros
): Promise<DiarioObra[]> {
  let query = supabase
    .from(DIARIO_TABLE)
    .select(
      `
      *,
      cliente:cliente_id (id, nome),
      colaborador:colaborador_id (id, nome, avatar_url),
      obra_registros_fotos (*)
    `
    )
    .eq("colaborador_id", colaboradorId);

  // Aplicar filtros opcionais
  if (filtros?.cliente_id) {
    query = query.eq("cliente_id", filtros.cliente_id);
  }
  if (filtros?.data_inicio) {
    query = query.gte("data_registro", filtros.data_inicio);
  }
  if (filtros?.data_fim) {
    query = query.lte("data_registro", filtros.data_fim);
  }

  const { data, error } = await query.order("data_registro", {
    ascending: false,
  });

  if (error) {
    console.error("Erro ao listar diários:", error);
    throw new Error(`Erro ao listar diários: ${error.message}`);
  }

  return (data || []).map(mapDiarioFromDb);
}

/**
 * Busca um registro específico de diário
 */
export async function buscarDiario(diarioId: string): Promise<DiarioObra> {
  const { data, error } = await supabase
    .from(DIARIO_TABLE)
    .select(
      `
      *,
      cliente:cliente_id (id, nome),
      colaborador:colaborador_id (id, nome, avatar_url),
      obra_registros_fotos (*)
    `
    )
    .eq("id", diarioId)
    .single();

  if (error) {
    console.error("Erro ao buscar diário:", error);
    throw new Error(`Erro ao buscar diário: ${error.message}`);
  }

  return mapDiarioFromDb(data);
}

// ============================================================
// CRUD - Fotos do Diário
// ============================================================

/**
 * Upload de foto para o diário (Supabase Storage)
 */
export async function uploadFotoDiario(
  registroId: string,
  arquivo: File,
  descricao?: string,
  driveFolderId?: string
): Promise<DiarioObraFoto> {
  // 1. Gerar nome único para o arquivo
  const timestamp = Date.now();
  const extension = arquivo.name.split(".").pop() || "jpg";
  const fileName = `${registroId}/${timestamp}.${extension}`;

  // 2. Upload para Supabase Storage
  const { data: storageData, error: storageError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(fileName, arquivo, {
      cacheControl: "3600",
      upsert: false,
    });

  if (storageError) {
    console.error("Erro ao fazer upload para Storage:", storageError);
    throw new Error(`Erro no upload: ${storageError.message}`);
  }

  // 3. Obter URL pública do Supabase
  const {
    data: { publicUrl },
  } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName);

  // 4. Upload para Google Drive (se pasta fornecida)
  if (driveFolderId) {
    try {
      const driveResult = await googleDriveBrowserService.uploadArquivo(
        arquivo,
        driveFolderId
      );
      console.log("Foto enviada para Google Drive:", driveResult.name);
    } catch (driveError) {
      console.warn(
        "Falha ao enviar para Google Drive (continuando com Supabase):",
        driveError
      );
    }
  }

  // 5. Buscar ordem atual das fotos
  const { data: existingPhotos } = await supabase
    .from(FOTOS_TABLE)
    .select("ordem")
    .eq("registro_id", registroId)
    .order("ordem", { ascending: false })
    .limit(1);

  const nextOrdem = (existingPhotos?.[0]?.ordem ?? -1) + 1;

  // 6. Salvar registro no banco
  const { data, error } = await supabase
    .from(FOTOS_TABLE)
    .insert({
      registro_id: registroId,
      arquivo_url: publicUrl,
      descricao: descricao || null,
      ordem: nextOrdem,
    })
    .select()
    .single();

  if (error) {
    console.error("Erro ao salvar registro da foto:", error);
    throw new Error(`Erro ao salvar foto: ${error.message}`);
  }

  return mapFotoFromDb(data);
}

/**
 * Exclui uma foto do diário (Supabase Storage)
 */
export async function excluirFotoDiario(fotoId: string): Promise<void> {
  // 1. Buscar dados da foto
  const { data: foto, error: fetchError } = await supabase
    .from(FOTOS_TABLE)
    .select("*")
    .eq("id", fotoId)
    .single();

  if (fetchError) {
    throw new Error(`Erro ao buscar foto: ${fetchError.message}`);
  }

  // 2. Remover do Supabase Storage
  if (foto.arquivo_url) {
    const match = foto.arquivo_url.match(
      /\/storage\/v1\/object\/public\/[^/]+\/(.+)/
    );
    if (match) {
      await supabase.storage.from(STORAGE_BUCKET).remove([match[1]]);
    }
  }

  // 3. Remover registro do banco
  const { error } = await supabase.from(FOTOS_TABLE).delete().eq("id", fotoId);

  if (error) {
    throw new Error(`Erro ao excluir foto: ${error.message}`);
  }
}

/**
 * Atualiza descrição de uma foto
 */
export async function atualizarDescricaoFoto(
  fotoId: string,
  descricao: string
): Promise<DiarioObraFoto> {
  const { data, error } = await supabase
    .from(FOTOS_TABLE)
    .update({ descricao })
    .eq("id", fotoId)
    .select()
    .single();

  if (error) {
    throw new Error(`Erro ao atualizar descrição: ${error.message}`);
  }

  return mapFotoFromDb(data);
}

// Alias para compatibilidade
export const atualizarLegendaFoto = atualizarDescricaoFoto;

/**
 * Reordena fotos do diário
 */
export async function reordenarFotos(
  fotoIds: string[]
): Promise<DiarioObraFoto[]> {
  const results: DiarioObraFoto[] = [];

  for (let i = 0; i < fotoIds.length; i++) {
    const { data, error } = await supabase
      .from(FOTOS_TABLE)
      .update({ ordem: i })
      .eq("id", fotoIds[i])
      .select()
      .single();

    if (error) {
      console.error("Erro ao reordenar foto:", error);
      continue;
    }

    results.push(mapFotoFromDb(data));
  }

  return results;
}

// ============================================================
// Funções auxiliares
// ============================================================

/**
 * Lista obras disponíveis para o colaborador criar diário
 */
export async function listarObrasParaDiario(
  colaboradorId?: string
): Promise<ObraOption[]> {
  // Buscar obras ativas (em andamento)
  const { data, error } = await supabase
    .from("obras")
    .select(
      `
      id,
      nome,
      numero,
      cliente:cliente_id (id, nome)
    `
    )
    .in("status", ["EM_ANDAMENTO", "INICIADA", "EM_EXECUCAO", "ATIVA"])
    .order("nome");

  if (error) {
    console.error("Erro ao listar obras:", error);
    throw new Error(`Erro ao listar obras: ${error.message}`);
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    nome: row.nome || `Obra ${row.numero || row.id}`,
    cliente_nome: row.cliente?.nome || "Cliente não definido",
    numero: row.numero,
  }));
}

// Alias para manter compatibilidade
export const listarOportunidadesParaDiario = listarObrasParaDiario;

/**
 * Busca a pasta "04 . Diário de Obra" do cliente no Google Drive
 */
export async function buscarPastaDiarioObra(
  clienteFolderId: string
): Promise<string | null> {
  try {
    const subpastas = await googleDriveBrowserService.listarSubpastas(
      clienteFolderId
    );
    const pastaDiario = subpastas.find((p) =>
      p.name.toLowerCase().includes("diário de obra")
    );
    return pastaDiario?.id || null;
  } catch (error) {
    console.warn("Erro ao buscar pasta Diário de Obra:", error);
    return null;
  }
}

/**
 * Cria ou obtém subpasta de data dentro do Diário de Obra
 * Ex: "04 . Diário de Obra/2026-01-05"
 */
export async function obterPastaDiarioPorData(
  diarioObraFolderId: string,
  data: string
): Promise<string> {
  try {
    // Verificar se já existe pasta com a data
    const subpastas = await googleDriveBrowserService.listarSubpastas(
      diarioObraFolderId
    );
    const pastaData = subpastas.find((p) => p.name === data);

    if (pastaData) {
      return pastaData.id;
    }

    // Criar nova pasta com a data
    const novaPasta = await googleDriveBrowserService.criarPasta(
      data,
      diarioObraFolderId
    );
    return novaPasta.folderId;
  } catch (error) {
    console.error("Erro ao obter/criar pasta de data:", error);
    throw error;
  }
}

/**
 * Verifica se o colaborador é dono do registro (pode editar/excluir)
 */
export async function verificarPermissaoDiario(
  diarioId: string,
  colaboradorId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from(DIARIO_TABLE)
    .select("colaborador_id")
    .eq("id", diarioId)
    .single();

  if (error || !data) return false;
  return data.colaborador_id === colaboradorId;
}
