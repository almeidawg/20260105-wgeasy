// ============================================================
// UTILITÁRIOS DO MÓDULO JURÍDICO
// Sistema WG Easy - Grupo WG Almeida
// Processamento de variáveis e geração de contratos
// ============================================================

import { supabaseRaw as supabase } from "@/lib/supabaseClient";

/* ==================== TIPOS ==================== */

export type DadosContrato = {
  empresa: EmpresaData | null;
  pessoa: PessoaData | null;
  contrato: ContratoData | null;
  parcelas: ParcelaData[];
  memorial: MemorialData | null;
};

type EmpresaData = {
  id: string;
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
  endereco_completo: string;
  inscricao_estadual?: string;
  inscricao_municipal?: string;
  banco?: string;
  agencia?: string;
  conta?: string;
  chave_pix?: string;
};

type PessoaData = {
  id: string;
  nome: string;
  cpf_cnpj: string;
  rg?: string;
  email?: string;
  telefone?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  tipo_pessoa: "fisica" | "juridica";
};

type ContratoData = {
  id: string;
  numero: string;
  valor_total: number;
  valor_mao_obra?: number;
  valor_materiais?: number;
  prazo_entrega_dias?: number;
  prorrogacao_dias?: number;
  data_inicio?: string;
  data_termino?: string;
};

type ParcelaData = {
  numero: number;
  descricao: string;
  valor: number;
  data_vencimento: string;
  forma_pagamento?: string;
};

type MemorialData = {
  texto_clausula_objeto?: string;
};

/* ==================== FUNÇÕES DE FORMATAÇÃO ==================== */

/**
 * Formata valor monetário para exibição
 */
export function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/**
 * Converte valor numérico para extenso
 */
export function valorPorExtenso(valor: number): string {
  const unidades = [
    "", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove",
    "dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"
  ];

  const dezenas = [
    "", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"
  ];

  const centenas = [
    "", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"
  ];

  function extenso(n: number): string {
    if (n === 0) return "zero";
    if (n === 100) return "cem";

    if (n < 20) return unidades[n];
    if (n < 100) {
      const d = Math.floor(n / 10);
      const u = n % 10;
      return dezenas[d] + (u > 0 ? " e " + unidades[u] : "");
    }
    if (n < 1000) {
      const c = Math.floor(n / 100);
      const resto = n % 100;
      return centenas[c] + (resto > 0 ? " e " + extenso(resto) : "");
    }
    if (n < 1000000) {
      const mil = Math.floor(n / 1000);
      const resto = n % 1000;
      const milTexto = mil === 1 ? "mil" : extenso(mil) + " mil";
      return milTexto + (resto > 0 ? (resto < 100 ? " e " : " ") + extenso(resto) : "");
    }
    if (n < 1000000000) {
      const milhao = Math.floor(n / 1000000);
      const resto = n % 1000000;
      const milhaoTexto = milhao === 1 ? "um milhão" : extenso(milhao) + " milhões";
      return milhaoTexto + (resto > 0 ? (resto < 1000 ? " e " : " ") + extenso(resto) : "");
    }

    return n.toString();
  }

  const parteInteira = Math.floor(valor);
  const centavos = Math.round((valor - parteInteira) * 100);

  let resultado = extenso(parteInteira);
  resultado += parteInteira === 1 ? " real" : " reais";

  if (centavos > 0) {
    resultado += " e " + extenso(centavos);
    resultado += centavos === 1 ? " centavo" : " centavos";
  }

  return resultado;
}

/**
 * Formata data para exibição
 */
export function formatarData(data: string | Date): string {
  const d = typeof data === "string" ? new Date(data) : data;
  return d.toLocaleDateString("pt-BR");
}

/**
 * Formata data por extenso
 */
export function dataPorExtenso(data: string | Date): string {
  const d = typeof data === "string" ? new Date(data) : data;

  const meses = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
  ];

  const dia = d.getDate();
  const mes = meses[d.getMonth()];
  const ano = d.getFullYear();

  return `${dia} de ${mes} de ${ano}`;
}

/**
 * Formata CPF
 */
export function formatarCPF(cpf: string): string {
  const numeros = cpf.replace(/\D/g, "");
  return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

/**
 * Formata CNPJ
 */
export function formatarCNPJ(cnpj: string): string {
  const numeros = cnpj.replace(/\D/g, "");
  return numeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
}

/**
 * Formata telefone
 */
export function formatarTelefone(telefone: string): string {
  const numeros = telefone.replace(/\D/g, "");
  if (numeros.length === 11) {
    return numeros.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  return numeros.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
}

/**
 * Formata CEP
 */
export function formatarCEP(cep: string): string {
  const numeros = cep.replace(/\D/g, "");
  return numeros.replace(/(\d{5})(\d{3})/, "$1-$2");
}

/* ==================== PROCESSAMENTO DE VARIÁVEIS ==================== */

/**
 * Processa todas as variáveis de um template de contrato
 */
export function processarVariaveis(template: string, dados: DadosContrato): string {
  let resultado = template;

  // Variáveis da EMPRESA
  if (dados.empresa) {
    const emp = dados.empresa;
    resultado = resultado.replace(/\{\{empresa\.razao_social\}\}/g, emp.razao_social || "");
    resultado = resultado.replace(/\{\{empresa\.nome_fantasia\}\}/g, emp.nome_fantasia || "");
    resultado = resultado.replace(/\{\{empresa\.cnpj\}\}/g, formatarCNPJ(emp.cnpj || ""));
    resultado = resultado.replace(/\{\{empresa\.endereco_completo\}\}/g, emp.endereco_completo || "");
    resultado = resultado.replace(/\{\{empresa\.inscricao_estadual\}\}/g, emp.inscricao_estadual || "");
    resultado = resultado.replace(/\{\{empresa\.inscricao_municipal\}\}/g, emp.inscricao_municipal || "");
    resultado = resultado.replace(/\{\{empresa\.banco\}\}/g, emp.banco || "");
    resultado = resultado.replace(/\{\{empresa\.agencia\}\}/g, emp.agencia || "");
    resultado = resultado.replace(/\{\{empresa\.conta\}\}/g, emp.conta || "");
    resultado = resultado.replace(/\{\{empresa\.chave_pix\}\}/g, emp.chave_pix || "");
  }

  // Variáveis da PESSOA
  if (dados.pessoa) {
    const p = dados.pessoa;
    resultado = resultado.replace(/\{\{pessoa\.nome\}\}/g, p.nome || "");

    // CPF ou CNPJ formatado conforme tipo
    const docFormatado = p.tipo_pessoa === "juridica"
      ? formatarCNPJ(p.cpf_cnpj || "")
      : formatarCPF(p.cpf_cnpj || "");
    resultado = resultado.replace(/\{\{pessoa\.cpf_cnpj\}\}/g, docFormatado);

    resultado = resultado.replace(/\{\{pessoa\.rg\}\}/g, p.rg || "");
    resultado = resultado.replace(/\{\{pessoa\.email\}\}/g, p.email || "");
    resultado = resultado.replace(/\{\{pessoa\.telefone\}\}/g, formatarTelefone(p.telefone || ""));
    resultado = resultado.replace(/\{\{pessoa\.logradouro\}\}/g, p.logradouro || "");
    resultado = resultado.replace(/\{\{pessoa\.numero\}\}/g, p.numero || "S/N");
    resultado = resultado.replace(/\{\{pessoa\.complemento\}\}/g, p.complemento || "");
    resultado = resultado.replace(/\{\{pessoa\.bairro\}\}/g, p.bairro || "");
    resultado = resultado.replace(/\{\{pessoa\.cidade\}\}/g, p.cidade || "");
    resultado = resultado.replace(/\{\{pessoa\.estado\}\}/g, p.estado || "");
    resultado = resultado.replace(/\{\{pessoa\.cep\}\}/g, formatarCEP(p.cep || ""));
  }

  // Variáveis do CONTRATO
  if (dados.contrato) {
    const c = dados.contrato;
    resultado = resultado.replace(/\{\{contrato\.numero\}\}/g, c.numero || "");
    resultado = resultado.replace(/\{\{contrato\.valor_total\}\}/g, formatarMoeda(c.valor_total || 0));
    resultado = resultado.replace(/\{\{contrato\.valor_extenso\}\}/g, valorPorExtenso(c.valor_total || 0));
    resultado = resultado.replace(/\{\{contrato\.prazo_execucao\}\}/g, String(c.prazo_entrega_dias || 0));
    resultado = resultado.replace(/\{\{contrato\.prorrogacao\}\}/g, String(c.prorrogacao_dias || 0));

    if (c.data_inicio) {
      resultado = resultado.replace(/\{\{contrato\.data_inicio\}\}/g, formatarData(c.data_inicio));
    }
    if (c.data_termino) {
      resultado = resultado.replace(/\{\{contrato\.data_termino\}\}/g, formatarData(c.data_termino));
    }
  }

  // Variáveis do SISTEMA
  resultado = resultado.replace(/\{\{sistema\.data_atual\}\}/g, formatarData(new Date()));
  resultado = resultado.replace(/\{\{sistema\.data_extenso\}\}/g, dataPorExtenso(new Date()));

  // MEMORIAL EXECUTIVO
  if (dados.memorial?.texto_clausula_objeto) {
    resultado = resultado.replace(/\{\{memorial_executivo\}\}/g, dados.memorial.texto_clausula_objeto);
  } else {
    resultado = resultado.replace(/\{\{memorial_executivo\}\}/g, "[Memorial Executivo não definido]");
  }

  // TABELA DE PARCELAS
  if (dados.parcelas.length > 0) {
    const tabelaParcelas = gerarTabelaParcelas(dados.parcelas);
    resultado = resultado.replace(/\{\{tabela_parcelas\}\}/g, tabelaParcelas);
  } else {
    resultado = resultado.replace(/\{\{tabela_parcelas\}\}/g, "[Parcelas não definidas]");
  }

  return resultado;
}

/**
 * Gera tabela HTML de parcelas
 */
export function gerarTabelaParcelas(parcelas: ParcelaData[]): string {
  if (parcelas.length === 0) return "";

  let html = `
    <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
      <thead>
        <tr style="background-color: #f5f5f5;">
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Parcela</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Descrição</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Valor</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Vencimento</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Forma</th>
        </tr>
      </thead>
      <tbody>
  `;

  parcelas.forEach((p) => {
    html += `
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">${p.numero}ª</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${p.descricao}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatarMoeda(p.valor)}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${formatarData(p.data_vencimento)}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${p.forma_pagamento || "-"}</td>
        </tr>
    `;
  });

  const total = parcelas.reduce((acc, p) => acc + p.valor, 0);

  html += `
        <tr style="background-color: #f5f5f5; font-weight: bold;">
          <td colspan="2" style="border: 1px solid #ddd; padding: 8px;">TOTAL</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatarMoeda(total)}</td>
          <td colspan="2" style="border: 1px solid #ddd; padding: 8px;"></td>
        </tr>
      </tbody>
    </table>
  `;

  return html;
}

/* ==================== VALIDAÇÃO ==================== */

/**
 * Valida se todos os dados obrigatórios estão preenchidos
 */
export function validarDadosContrato(dados: DadosContrato, variaveisObrigatorias: string[]): string[] {
  const erros: string[] = [];

  variaveisObrigatorias.forEach((variavel) => {
    const [categoria, campo] = variavel.split(".");

    switch (categoria) {
      case "pessoa":
        if (!dados.pessoa) {
          erros.push(`Dados do contratante não informados (${variavel})`);
        } else if (!(dados.pessoa as any)[campo]) {
          erros.push(`Campo obrigatório não preenchido: ${variavel}`);
        }
        break;

      case "empresa":
        if (!dados.empresa) {
          erros.push(`Dados da empresa não informados (${variavel})`);
        } else if (!(dados.empresa as any)[campo]) {
          erros.push(`Campo obrigatório não preenchido: ${variavel}`);
        }
        break;

      case "contrato":
        if (!dados.contrato) {
          erros.push(`Dados do contrato não informados (${variavel})`);
        } else if (!(dados.contrato as any)[campo]) {
          erros.push(`Campo obrigatório não preenchido: ${variavel}`);
        }
        break;
    }
  });

  return erros;
}

/* ==================== BUSCA DE DADOS ==================== */

/**
 * Busca todos os dados necessários para gerar o contrato
 */
export async function buscarDadosContrato(
  contratoId: string,
  empresaId?: string
): Promise<DadosContrato> {
  const resultado: DadosContrato = {
    empresa: null,
    pessoa: null,
    contrato: null,
    parcelas: [],
    memorial: null,
  };

  try {
    // Buscar contrato
    const { data: contrato } = await supabase
      .from("contratos")
      .select("*, pessoa:pessoas(*)")
      .eq("id", contratoId)
      .single();

    if (contrato) {
      resultado.contrato = {
        id: contrato.id,
        numero: contrato.numero,
        valor_total: contrato.valor_total,
        valor_mao_obra: contrato.valor_mao_obra,
        valor_materiais: contrato.valor_materiais,
        prazo_entrega_dias: contrato.prazo_entrega_dias,
        prorrogacao_dias: contrato.prorrogacao_dias || 30,
        data_inicio: contrato.data_inicio,
        data_termino: contrato.data_termino,
      };

      if (contrato.pessoa) {
        resultado.pessoa = {
          id: contrato.pessoa.id,
          nome: contrato.pessoa.nome,
          cpf_cnpj: contrato.pessoa.cpf_cnpj,
          rg: contrato.pessoa.rg,
          email: contrato.pessoa.email,
          telefone: contrato.pessoa.telefone,
          logradouro: contrato.pessoa.logradouro,
          numero: contrato.pessoa.numero,
          complemento: contrato.pessoa.complemento,
          bairro: contrato.pessoa.bairro,
          cidade: contrato.pessoa.cidade,
          estado: contrato.pessoa.estado,
          cep: contrato.pessoa.cep,
          tipo_pessoa: contrato.pessoa.tipo_pessoa || "fisica",
        };
      }
    }

    // Buscar empresa
    if (empresaId) {
      const { data: empresa } = await supabase
        .from("empresas")
        .select("*")
        .eq("id", empresaId)
        .single();

      if (empresa) {
        resultado.empresa = {
          id: empresa.id,
          razao_social: empresa.razao_social,
          nome_fantasia: empresa.nome_fantasia,
          cnpj: empresa.cnpj,
          endereco_completo: `${empresa.logradouro || ""}, ${empresa.numero || "S/N"}, ${empresa.bairro || ""}, ${empresa.cidade || ""}/${empresa.estado || ""}, CEP ${empresa.cep || ""}`,
          inscricao_estadual: empresa.inscricao_estadual,
          inscricao_municipal: empresa.inscricao_municipal,
          banco: empresa.banco,
          agencia: empresa.agencia,
          conta: empresa.conta,
          chave_pix: empresa.chave_pix,
        };
      }
    }

    // Buscar parcelas (financeiro)
    const { data: parcelas } = await supabase
      .from("financeiro_lancamentos")
      .select("*")
      .eq("contrato_id", contratoId)
      .eq("tipo", "entrada")
      .order("vencimento");

    if (parcelas) {
      resultado.parcelas = parcelas.map((p, i) => ({
        numero: i + 1,
        descricao: p.descricao,
        valor: p.valor_total,
        data_vencimento: p.vencimento,
        forma_pagamento: p.forma_pagamento,
      }));
    }

    // Buscar memorial executivo
    const { data: memorial } = await supabase
      .from("juridico_memorial_executivo")
      .select("texto_clausula_objeto")
      .eq("contrato_id", contratoId)
      .single();

    if (memorial) {
      resultado.memorial = memorial;
    }
  } catch (error) {
    console.error("Erro ao buscar dados do contrato:", error);
  }

  return resultado;
}

/* ==================== BUSCAR MODELO POR NÚCLEO ==================== */

export type ModeloContratoResumo = {
  id: string;
  codigo: string;
  nome: string;
  nucleo: string;
  versao: number;
  versao_texto: string;
  empresa_id: string | null;
  empresa_nome?: string;
};

/**
 * Busca modelos de contrato publicados para um núcleo específico
 */
export async function buscarModelosPorNucleo(
  nucleo: string
): Promise<ModeloContratoResumo[]> {
  try {
    const { data, error } = await supabase
      .from("juridico_modelos_contrato")
      .select(`
        id,
        codigo,
        nome,
        nucleo,
        versao,
        versao_texto,
        empresa_id,
        empresas(nome_fantasia)
      `)
      .eq("nucleo", nucleo)
      .eq("status", "publicado")
      .eq("ativo", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar modelos:", error);
      return [];
    }

    return (data || []).map((m: any) => ({
      id: m.id,
      codigo: m.codigo,
      nome: m.nome,
      nucleo: m.nucleo,
      versao: m.versao,
      versao_texto: m.versao_texto,
      empresa_id: m.empresa_id,
      empresa_nome: m.empresas?.nome_fantasia,
    }));
  } catch (error) {
    console.error("Erro ao buscar modelos por núcleo:", error);
    return [];
  }
}

/**
 * Busca o modelo padrão (mais recente) para um núcleo
 */
export async function buscarModeloPadraoPorNucleo(
  nucleo: string
): Promise<ModeloContratoResumo | null> {
  const modelos = await buscarModelosPorNucleo(nucleo);
  return modelos.length > 0 ? modelos[0] : null;
}

/* ==================== GERAÇÃO DE CONTRATO ==================== */

/**
 * Gera o contrato final a partir do modelo e dados
 */
export async function gerarContratoFinal(
  modeloId: string,
  contratoId: string
): Promise<{ sucesso: boolean; html?: string; erros?: string[] }> {
  try {
    // Buscar modelo
    const { data: modelo, error: modeloError } = await supabase
      .from("juridico_modelos_contrato")
      .select("*")
      .eq("id", modeloId)
      .single();

    if (modeloError || !modelo) {
      return { sucesso: false, erros: ["Modelo não encontrado"] };
    }

    if (modelo.status !== "publicado") {
      return { sucesso: false, erros: ["Somente modelos publicados podem ser usados"] };
    }

    // Buscar dados
    const dados = await buscarDadosContrato(contratoId, modelo.empresa_id);

    // Validar campos obrigatórios
    const erros = validarDadosContrato(dados, modelo.variaveis_obrigatorias || []);
    if (erros.length > 0) {
      return { sucesso: false, erros };
    }

    // Processar variáveis
    const html = processarVariaveis(modelo.conteudo_html, dados);

    // Salvar snapshot no contrato
    await supabase
      .from("contratos")
      .update({
        modelo_juridico_id: modeloId,
        versao_modelo: modelo.versao,
        conteudo_gerado: html,
        snapshot_modelo: {
          modelo_id: modelo.id,
          codigo: modelo.codigo,
          nome: modelo.nome,
          versao: modelo.versao,
          data_geracao: new Date().toISOString(),
        },
      })
      .eq("id", contratoId);

    // Registrar auditoria
    await supabase.from("juridico_auditoria").insert([
      {
        entidade: "contratos",
        entidade_id: contratoId,
        acao: "gerar_contrato",
        dados_depois: {
          modelo_id: modeloId,
          versao: modelo.versao,
        },
      },
    ]);

    return { sucesso: true, html };
  } catch (error: any) {
    console.error("Erro ao gerar contrato:", error);
    return { sucesso: false, erros: [error.message] };
  }
}
