// src/lib/pessoasApi.ts
// API principal para manipulação da tabela pessoas
// Usa tipos centralizados de @/types/pessoas

import { supabase } from "./supabaseClient";
import type {
  Pessoa,
  PessoaTipo,
  PessoaStatus,
  PessoaInput,
  PessoaDocumento,
  PessoaAvaliacao,
  PessoaObra,
} from "@/types/pessoas";

// Re-exportar tipos para compatibilidade com componentes antigos
export type {
  Pessoa,
  PessoaTipo,
  PessoaStatus,
  PessoaInput,
  PessoaDocumento,
  PessoaAvaliacao,
  PessoaObra,
} from "@/types/pessoas";

const TABLE = "pessoas";

function mapFromDb(row: any): Pessoa {
  return {
    id: row.id,
    nome: row.nome,
    email: row.email,
    telefone: row.telefone,
    // Campos opcionais (podem não existir no banco ainda)
    cpf: row.cpf ?? null,
    cnpj: row.cnpj ?? null,
    rg: row.rg ?? null,
    nacionalidade: row.nacionalidade ?? null,
    estado_civil: row.estado_civil ?? null,
    profissao: row.profissao ?? null,
    cargo: row.cargo ?? null,
    empresa: row.empresa ?? null,
    unidade: row.unidade ?? null,
    tipo: row.tipo,
    // Endereço
    cep: row.cep ?? null,
    logradouro: row.logradouro ?? null,
    numero: row.numero ?? null,
    complemento: row.complemento ?? null,
    bairro: row.bairro ?? null,
    cidade: row.cidade ?? null,
    estado: row.estado ?? null,
    pais: row.pais ?? null,
    // Endereço da obra
    obra_endereco_diferente: row.obra_endereco_diferente ?? false,
    obra_cep: row.obra_cep ?? null,
    obra_logradouro: row.obra_logradouro ?? null,
    obra_numero: row.obra_numero ?? null,
    obra_complemento: row.obra_complemento ?? null,
    obra_bairro: row.obra_bairro ?? null,
    obra_cidade: row.obra_cidade ?? null,
    obra_estado: row.obra_estado ?? null,
    // Dados bancários
    banco: row.banco ?? null,
    agencia: row.agencia ?? null,
    conta: row.conta ?? null,
    tipo_conta: row.tipo_conta ?? null,
    pix: row.pix ?? null,
    // Comissionamento (especificadores)
    categoria_comissao_id: row.categoria_comissao_id ?? null,
    is_master: row.is_master ?? null,
    indicado_por_id: row.indicado_por_id ?? null,
    // Informações adicionais
    contato_responsavel: row.contato_responsavel ?? null,
    observacoes: row.observacoes ?? null,
    drive_link: row.drive_link ?? null,
    avatar: row.avatar ?? null,
    avatar_url: row.avatar_url ?? null,
    foto_url: row.foto_url ?? null,
    status: row.status ?? "ativo",
    ativo: row.ativo ?? true,
    criado_em: row.criado_em,
    atualizado_em: row.atualizado_em,
  };
}

function mapDocumentoFromDb(row: any): PessoaDocumento {
  return {
    id: row.id,
    pessoa_id: row.pessoa_id,
    nome: row.nome ?? row.tipo ?? "Documento",
    tipo: row.tipo ?? "DOCUMENTO",
    url: row.url ?? row.arquivo_url ?? "",
    arquivo_url: row.arquivo_url ?? row.url ?? null,
    descricao: row.descricao ?? null,
    validade: row.validade ?? null,
    criado_em: row.criado_em ?? row.created_at ?? new Date().toISOString(),
  };
}

export async function listarPessoas(params?: {
  tipo?: PessoaTipo;
  ativo?: boolean;
  search?: string;
  status?: PessoaStatus | PessoaStatus[];
  incluirConcluidos?: boolean; // Se true, inclui pessoas com status 'concluido'
}): Promise<Pessoa[]> {
  let query = supabase.from(TABLE).select("*");

  if (params?.tipo) {
    query = query.eq("tipo", params.tipo);
  }

  if (typeof params?.ativo === "boolean") {
    query = query.eq("ativo", params.ativo);
  }

  // Filtro de status - exclui pessoas com status 'concluido' por padrão
  if (params?.status) {
    if (Array.isArray(params.status)) {
      query = query.in("status", params.status);
    } else {
      query = query.eq("status", params.status);
    }
  }

  if (params?.search && params.search.trim()) {
    const term = `%${params.search.trim()}%`;
    query = query.or(
      `nome.ilike.${term},email.ilike.${term},telefone.ilike.${term}`
    );
  }

  const { data, error } = await query.order("criado_em", {
    ascending: false,
  });

  if (error) {
    console.error("[listarPessoas] erro:", error);
    throw error;
  }

  return (data ?? []).map(mapFromDb);
}

export async function obterPessoa(id: string): Promise<Pessoa | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[obterPessoa] erro:", error);
    throw error;
  }

  return data ? mapFromDb(data) : null;
}

export async function listarDocumentosPessoa(
  pessoaId: string
): Promise<PessoaDocumento[]> {
  const { data, error } = await supabase
    .from("pessoas_documentos")
    .select("*")
    .eq("pessoa_id", pessoaId)
    .order("criado_em", { ascending: false });

  if (error) {
    console.error("[listarDocumentosPessoa] erro:", error);
    throw error;
  }

  return (data ?? []).map(mapDocumentoFromDb);
}

export async function criarPessoa(input: PessoaInput): Promise<Pessoa> {
  const payload = {
    ...input,
    ativo: input.ativo ?? true,
  };

  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    console.error("[criarPessoa] erro:", error);
    throw error;
  }

  return mapFromDb(data);
}

export async function atualizarPessoa(
  id: string,
  input: Partial<PessoaInput>
): Promise<Pessoa> {
  const { data, error } = await supabase
    .from(TABLE)
    .update(input)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("[atualizarPessoa] erro:", error);
    throw error;
  }

  return mapFromDb(data);
}

export async function desativarPessoa(id: string): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .update({ ativo: false })
    .eq("id", id);

  if (error) {
    console.error("[desativarPessoa] erro:", error);
    throw error;
  }
}

export async function deletarPessoa(id: string): Promise<void> {
  // Verificar se a pessoa é um cliente com oportunidades vinculadas
  const { data: oportunidades, error: oportError } = await supabase
    .from("oportunidades")
    .select("id")
    .eq("cliente_id", id);

  if (oportError) {
    console.error("[deletarPessoa] erro ao verificar oportunidades:", oportError);
    throw oportError;
  }

  if (oportunidades && oportunidades.length > 0) {
    throw new Error(
      `Não é possível deletar esta pessoa pois ela possui ${oportunidades.length} oportunidade(s) vinculada(s). ` +
      `Por favor, remova ou transfira as oportunidades antes de deletar.`
    );
  }

  // Se não tem oportunidades, pode deletar
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[deletarPessoa] erro:", error);
    throw error;
  }
}

export async function criarAvaliacao(
  pessoaId: string,
  avaliadorId: string,
  nota: number,
  comentario?: string
): Promise<PessoaAvaliacao> {
  const { data, error } = await supabase
    .from("pessoas_avaliacoes")
    .insert({
      pessoa_id: pessoaId,
      avaliador_id: avaliadorId,
      nota,
      comentario: comentario || null,
    })
    .select("*")
    .single();

  if (error) {
    console.error("[criarAvaliacao] erro:", error);
    throw error;
  }

  return {
    id: data.id,
    pessoa_id: data.pessoa_id,
    avaliador_id: data.avaliador_id,
    nota: data.nota,
    comentario: data.comentario ?? undefined,
    criado_em: data.criado_em ?? data.created_at ?? new Date().toISOString(),
  };
}

/**
 * Listar obras associadas a uma pessoa
 */
export async function listarObrasPessoa(pessoaId: string): Promise<PessoaObra[]> {
  const { data, error } = await supabase
    .from("pessoas_obras")
    .select("*")
    .eq("pessoa_id", pessoaId);

  if (error) {
    console.error("[listarObrasPessoa] erro:", error);
    throw error;
  }

  return data || [];
}

/**
 * Buscar primeiro lançamento financeiro de uma pessoa (data de vínculo)
 */
export async function buscarPrimeiroLancamento(pessoaId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("financeiro_lancamentos")
    .select("data_competencia")
    .eq("pessoa_id", pessoaId)
    .order("data_competencia", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[buscarPrimeiroLancamento] erro:", error);
    return null;
  }

  return data?.data_competencia || null;
}

/**
 * Listar pessoas com data de vínculo (primeiro lançamento financeiro)
 * Para CLIENTES: busca através dos contratos vinculados ou oportunidades
 * Para outros tipos: busca diretamente pelo pessoa_id
 */
export async function listarPessoasComDataVinculo(params?: {
  tipo?: PessoaTipo;
  ativo?: boolean;
  search?: string;
  status?: PessoaStatus | PessoaStatus[];
  incluirConcluidos?: boolean;
}): Promise<(Pessoa & { data_vinculo?: string | null })[]> {
  // Primeiro busca as pessoas
  let query = supabase.from(TABLE).select("*");

  if (params?.tipo) {
    query = query.eq("tipo", params.tipo);
  }

  if (typeof params?.ativo === "boolean") {
    query = query.eq("ativo", params.ativo);
  }

  // Filtro de status - exclui pessoas com status 'concluido' por padrão
  if (params?.status) {
    if (Array.isArray(params.status)) {
      query = query.in("status", params.status);
    } else {
      query = query.eq("status", params.status);
    }
  }

  if (params?.search?.trim()) {
    const term = `%${params.search.trim()}%`;
    query = query.or(
      `nome.ilike.${term},email.ilike.${term},telefone.ilike.${term},cpf.ilike.${term},cnpj.ilike.${term}`
    );
  }

  const { data: pessoas, error } = await query.order("criado_em", {
    ascending: false,
  });

  if (error) {
    console.error("[listarPessoasComDataVinculo] erro:", error);
    throw error;
  }

  if (!pessoas || pessoas.length === 0) {
    return [];
  }

  const pessoaIds = pessoas.map(p => p.id);
  const dataVinculoPorPessoa: Record<string, string> = {};

  // Para CLIENTES: buscar através de múltiplas fontes
  if (params?.tipo === "CLIENTE") {
    // 1. Buscar contratos dos clientes (com data_inicio e created_at)
    const { data: contratos, error: contratosError } = await supabase
      .from("contratos")
      .select("id, cliente_id, data_inicio, created_at")
      .in("cliente_id", pessoaIds);

    if (contratosError) {
      console.error("[listarPessoasComDataVinculo] erro contratos:", contratosError);
    }

    const contratosPorCliente: Record<string, typeof contratos> = {};
    const contratoIds: string[] = [];

    if (contratos && contratos.length > 0) {
      for (const c of contratos) {
        if (c.cliente_id) {
          if (!contratosPorCliente[c.cliente_id]) {
            contratosPorCliente[c.cliente_id] = [];
          }
          contratosPorCliente[c.cliente_id].push(c);
          contratoIds.push(c.id);
        }
      }

      // 2. Buscar lançamentos financeiros dos contratos
      if (contratoIds.length > 0) {
        const { data: lancamentos, error: lancError } = await supabase
          .from("financeiro_lancamentos")
          .select("contrato_id, data_competencia")
          .in("contrato_id", contratoIds)
          .order("data_competencia", { ascending: true });

        if (lancError) {
          console.error("[listarPessoasComDataVinculo] erro lancamentos:", lancError);
        }

        // Mapear contrato_id → cliente_id
        const contratoParaCliente: Record<string, string> = {};
        for (const c of contratos) {
          if (c.cliente_id) {
            contratoParaCliente[c.id] = c.cliente_id;
          }
        }

        // Primeiro lançamento por cliente (através do contrato) - pegar data mais antiga
        if (lancamentos) {
          for (const lanc of lancamentos) {
            if (lanc.contrato_id && lanc.data_competencia) {
              const clienteId = contratoParaCliente[lanc.contrato_id];
              if (clienteId) {
                const dataAtual = dataVinculoPorPessoa[clienteId];
                if (!dataAtual || lanc.data_competencia < dataAtual) {
                  dataVinculoPorPessoa[clienteId] = lanc.data_competencia;
                }
              }
            }
          }
        }
      }

      // 3. Fallback: usar data_inicio do contrato mais antigo
      for (const clienteId of Object.keys(contratosPorCliente)) {
        if (!dataVinculoPorPessoa[clienteId]) {
          const contratosCliente = contratosPorCliente[clienteId];
          // Ordenar por data_inicio (mais antiga primeiro)
          const contratoMaisAntigo = contratosCliente
            .filter(c => c.data_inicio)
            .sort((a, b) => new Date(a.data_inicio!).getTime() - new Date(b.data_inicio!).getTime())[0];

          if (contratoMaisAntigo?.data_inicio) {
            dataVinculoPorPessoa[clienteId] = contratoMaisAntigo.data_inicio;
          }
        }
      }

      // 4. Último fallback: usar created_at do contrato mais antigo
      for (const clienteId of Object.keys(contratosPorCliente)) {
        if (!dataVinculoPorPessoa[clienteId]) {
          const contratosCliente = contratosPorCliente[clienteId];
          const contratoMaisAntigo = contratosCliente
            .filter(c => c.created_at)
            .sort((a, b) => new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime())[0];

          if (contratoMaisAntigo?.created_at) {
            dataVinculoPorPessoa[clienteId] = contratoMaisAntigo.created_at.split('T')[0];
          }
        }
      }
    }

    // 5. Buscar lançamentos via projeto_id (projetos também têm cliente_id)
    const { data: projetosComId, error: projetosIdError } = await supabase
      .from("projetos")
      .select("id, cliente_id")
      .in("cliente_id", pessoaIds);

    if (projetosIdError) {
      console.error("[listarPessoasComDataVinculo] erro projetos:", projetosIdError);
    }

    if (projetosComId && projetosComId.length > 0) {
      const projetoIds = projetosComId.map(p => p.id);
      const projetoParaCliente: Record<string, string> = {};
      for (const p of projetosComId) {
        if (p.cliente_id) {
          projetoParaCliente[p.id] = p.cliente_id;
        }
      }

      // Buscar lançamentos pelos projeto_ids
      const { data: lancamentosProjeto, error: lancProjError } = await supabase
        .from("financeiro_lancamentos")
        .select("projeto_id, data_competencia")
        .in("projeto_id", projetoIds)
        .order("data_competencia", { ascending: true });

      if (lancProjError) {
        console.error("[listarPessoasComDataVinculo] erro lancamentos projeto:", lancProjError);
      }

      if (lancamentosProjeto) {
        for (const lanc of lancamentosProjeto) {
          if (lanc.projeto_id && lanc.data_competencia) {
            const clienteId = projetoParaCliente[lanc.projeto_id];
            // Só atualiza se não tiver data ou se a data for mais antiga
            if (clienteId) {
              const dataAtual = dataVinculoPorPessoa[clienteId];
              if (!dataAtual || lanc.data_competencia < dataAtual) {
                dataVinculoPorPessoa[clienteId] = lanc.data_competencia;
              }
            }
          }
        }
      }
    }

    // 6. Buscar oportunidades (alguns clientes podem ter oportunidade sem contrato)
    let clientesSemData = pessoaIds.filter(id => !dataVinculoPorPessoa[id]);
    if (clientesSemData.length > 0) {
      const { data: oportunidades, error: oportunidadesError } = await supabase
        .from("oportunidades")
        .select("cliente_id, criado_em")
        .in("cliente_id", clientesSemData)
        .order("criado_em", { ascending: true });

      if (oportunidadesError) {
        console.error("[listarPessoasComDataVinculo] erro oportunidades:", oportunidadesError);
      }

      if (oportunidades) {
        for (const oport of oportunidades) {
          if (oport.cliente_id && !dataVinculoPorPessoa[oport.cliente_id] && oport.criado_em) {
            dataVinculoPorPessoa[oport.cliente_id] = oport.criado_em.split('T')[0];
          }
        }
      }
    }

    // 7. Buscar projetos (fallback para created_at)
    clientesSemData = pessoaIds.filter(id => !dataVinculoPorPessoa[id]);
    if (clientesSemData.length > 0) {
      const { data: projetos, error: projetosError } = await supabase
        .from("projetos")
        .select("cliente_id, created_at")
        .in("cliente_id", clientesSemData)
        .order("created_at", { ascending: true });

      if (projetosError) {
        console.error("[listarPessoasComDataVinculo] erro projetos:", projetosError);
      }

      if (projetos) {
        for (const proj of projetos) {
          if (proj.cliente_id && !dataVinculoPorPessoa[proj.cliente_id] && proj.created_at) {
            dataVinculoPorPessoa[proj.cliente_id] = proj.created_at.split('T')[0];
          }
        }
      }
    }

    // 8. Buscar análises de projeto
    clientesSemData = pessoaIds.filter(id => !dataVinculoPorPessoa[id]);
    if (clientesSemData.length > 0) {
      const { data: analises, error: analisesError } = await supabase
        .from("analises_projeto")
        .select("cliente_id, created_at")
        .in("cliente_id", clientesSemData)
        .order("created_at", { ascending: true });

      if (analisesError) {
        console.error("[listarPessoasComDataVinculo] erro analises:", analisesError);
      }

      if (analises) {
        for (const analise of analises) {
          if (analise.cliente_id && !dataVinculoPorPessoa[analise.cliente_id] && analise.created_at) {
            dataVinculoPorPessoa[analise.cliente_id] = analise.created_at.split('T')[0];
          }
        }
      }
    }

    // 9. Buscar assistência técnica
    clientesSemData = pessoaIds.filter(id => !dataVinculoPorPessoa[id]);
    if (clientesSemData.length > 0) {
      const { data: assistencias, error: assistenciasError } = await supabase
        .from("assistencia_tecnica")
        .select("cliente_id, created_at")
        .in("cliente_id", clientesSemData)
        .order("created_at", { ascending: true });

      if (assistenciasError) {
        console.error("[listarPessoasComDataVinculo] erro assistencias:", assistenciasError);
      }

      if (assistencias) {
        for (const assist of assistencias) {
          if (assist.cliente_id && !dataVinculoPorPessoa[assist.cliente_id] && assist.created_at) {
            dataVinculoPorPessoa[assist.cliente_id] = assist.created_at.split('T')[0];
          }
        }
      }
    }

    // 10. Buscar lançamentos onde cliente é pessoa_id (entradas = recebimentos do cliente)
    // O workflow cria lançamentos de entrada com pessoa_id = cliente_id
    const { data: lancamentosCliente, error: lancClienteError } = await supabase
      .from("financeiro_lancamentos")
      .select("pessoa_id, data_competencia, tipo")
      .in("pessoa_id", pessoaIds)
      .eq("tipo", "entrada")
      .order("data_competencia", { ascending: true });

    if (lancClienteError) {
      console.error("[listarPessoasComDataVinculo] erro lancamentos cliente:", lancClienteError);
    }

    if (lancamentosCliente) {
      for (const lanc of lancamentosCliente) {
        if (lanc.pessoa_id && lanc.data_competencia) {
          const dataAtual = dataVinculoPorPessoa[lanc.pessoa_id];
          if (!dataAtual || lanc.data_competencia < dataAtual) {
            dataVinculoPorPessoa[lanc.pessoa_id] = lanc.data_competencia;
          }
        }
      }
    }

  } else {
    // Para outros tipos: buscar diretamente pelo pessoa_id nos lançamentos
    const { data: lancamentos, error: lancError } = await supabase
      .from("financeiro_lancamentos")
      .select("pessoa_id, data_competencia")
      .in("pessoa_id", pessoaIds)
      .order("data_competencia", { ascending: true });

    if (lancError) {
      console.error("[listarPessoasComDataVinculo] erro lancamentos:", lancError);
    }

    if (lancamentos) {
      for (const lanc of lancamentos) {
        if (lanc.pessoa_id && !dataVinculoPorPessoa[lanc.pessoa_id] && lanc.data_competencia) {
          dataVinculoPorPessoa[lanc.pessoa_id] = lanc.data_competencia;
        }
      }
    }
  }

  // Mapear pessoas com data de vínculo
  const pessoasComVinculo = pessoas.map(row => ({
    ...mapFromDb(row),
    data_vinculo: dataVinculoPorPessoa[row.id] || null,
  }));

  return pessoasComVinculo;
}

/**
 * Mesclar duas pessoas duplicadas
 * Move todos os vínculos do origem para o destino e deleta o origem
 * @param destinoId ID da pessoa que será mantida
 * @param origemId ID da pessoa que será mesclada e deletada
 */
export async function mesclarPessoas(destinoId: string, origemId: string): Promise<{ success: boolean; message: string }> {
  if (destinoId === origemId) {
    throw new Error("IDs de origem e destino devem ser diferentes");
  }

  // Tabelas que têm referência a pessoa_id ou cliente_id
  const tabelasComPessoaId = [
    { tabela: "financeiro_lancamentos", coluna: "pessoa_id" },
    { tabela: "pessoas_documentos", coluna: "pessoa_id" },
    { tabela: "pessoas_avaliacoes", coluna: "pessoa_id" },
    { tabela: "pessoas_obras", coluna: "pessoa_id" },
  ];

  const tabelasComClienteId = [
    { tabela: "contratos", coluna: "cliente_id" },
    { tabela: "oportunidades", coluna: "cliente_id" },
    { tabela: "projetos", coluna: "cliente_id" },
    { tabela: "analises_projeto", coluna: "cliente_id" },
    { tabela: "assistencia_tecnica", coluna: "cliente_id" },
    { tabela: "cronogramas", coluna: "cliente_id" },
    { tabela: "acessos_cliente", coluna: "cliente_id" },
  ];

  let totalAtualizado = 0;

  // Atualizar referências pessoa_id
  for (const { tabela, coluna } of tabelasComPessoaId) {
    const { error, count } = await supabase
      .from(tabela)
      .update({ [coluna]: destinoId })
      .eq(coluna, origemId);

    if (error) {
      console.warn(`[mesclarPessoas] Erro ao atualizar ${tabela}.${coluna}:`, error.message);
    } else if (count) {
      totalAtualizado += count;
      console.log(`[mesclarPessoas] ${tabela}: ${count} registros atualizados`);
    }
  }

  // Atualizar referências cliente_id
  for (const { tabela, coluna } of tabelasComClienteId) {
    const { error, count } = await supabase
      .from(tabela)
      .update({ [coluna]: destinoId })
      .eq(coluna, origemId);

    if (error) {
      console.warn(`[mesclarPessoas] Erro ao atualizar ${tabela}.${coluna}:`, error.message);
    } else if (count) {
      totalAtualizado += count;
      console.log(`[mesclarPessoas] ${tabela}: ${count} registros atualizados`);
    }
  }

  // Buscar dados da pessoa origem para mesclar campos vazios
  const { data: origem } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", origemId)
    .single();

  const { data: destino } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", destinoId)
    .single();

  if (origem && destino) {
    // Mesclar campos vazios do destino com dados da origem
    const camposParaMesclar: Partial<PessoaInput> = {};
    const camposTexto = [
      "email", "telefone", "cpf", "cnpj", "rg", "nacionalidade", "estado_civil",
      "profissao", "cargo", "empresa", "unidade", "cep", "logradouro", "numero",
      "complemento", "bairro", "cidade", "estado", "pais", "banco", "agencia",
      "conta", "tipo_conta", "pix", "contato_responsavel", "observacoes",
      "drive_link", "avatar_url", "foto_url"
    ];

    for (const campo of camposTexto) {
      if (!destino[campo] && origem[campo]) {
        (camposParaMesclar as any)[campo] = origem[campo];
      }
    }

    // Se tiver campos para atualizar, fazer o update
    if (Object.keys(camposParaMesclar).length > 0) {
      await supabase
        .from(TABLE)
        .update(camposParaMesclar)
        .eq("id", destinoId);
      console.log(`[mesclarPessoas] Campos mesclados:`, Object.keys(camposParaMesclar));
    }
  }

  // Deletar a pessoa origem
  const { error: deleteError } = await supabase
    .from(TABLE)
    .delete()
    .eq("id", origemId);

  if (deleteError) {
    console.error("[mesclarPessoas] Erro ao deletar origem:", deleteError);
    throw new Error(`Erro ao deletar pessoa origem: ${deleteError.message}`);
  }

  return {
    success: true,
    message: `Mesclagem concluída. ${totalAtualizado} registros transferidos.`
  };
}
