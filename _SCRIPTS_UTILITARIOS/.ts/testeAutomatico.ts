// ============================================================================
// SCRIPT DE TESTE AUTOMATIZADO - AUDITORIA COMPLETA
// Sistema: WGEasy - Grupo WG Almeida
// ============================================================================

import { createClient } from "@supabase/supabase-js";

// Configurar Supabase
const supabaseUrl = "https://ahlqzzkxuutwoepirpzr.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobHF6emt4dXV0d29lcGlycHpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NzEyNDMsImV4cCI6MjA3NjE0NzI0M30.gLz5lpB5YlQpTfxzJjmILZwGp_H_XsT81nM2vXDbs7Y";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================================================
// CORES PARA OUTPUT
// ============================================================================
const RESET = "\x1b[0m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const BLUE = "\x1b[34m";
const CYAN = "\x1b[36m";

function log(message: string, color = RESET) {
  console.log(`${color}${message}${RESET}`);
}

function success(message: string) {
  log(`✅ ${message}`, GREEN);
}

function error(message: string) {
  log(`❌ ${message}`, RED);
}

function info(message: string) {
  log(`ℹ️  ${message}`, CYAN);
}

function section(title: string) {
  log(`\n${"=".repeat(60)}`, BLUE);
  log(title, BLUE);
  log("=".repeat(60), BLUE);
}

// ============================================================================
// DADOS DE TESTE
// ============================================================================

const CLIENTES_TESTE = [
  {
    nome: "Maria Silva Construtora",
    email: "maria@silvaconst.com.br",
    telefone: "(11) 98765-4321",
    cpf: "12345678000190",
    logradouro: "Av. Paulista",
    numero: "1000",
    cidade: "São Paulo",
    estado: "SP",
    tipo: "CLIENTE",
    ativo: true,
  },
  {
    nome: "João Santos Empreendimentos",
    email: "joao@santosempr.com.br",
    telefone: "(11) 98765-4322",
    cpf: "23456789000191",
    logradouro: "Rua Augusta",
    numero: "500",
    cidade: "São Paulo",
    estado: "SP",
    tipo: "CLIENTE",
    ativo: true,
  },
  {
    nome: "Ana Costa Residencial",
    email: "ana@costaresid.com.br",
    telefone: "(11) 98765-4323",
    cpf: "12345678900",
    logradouro: "Rua dos Jardins",
    numero: "200",
    cidade: "São Paulo",
    estado: "SP",
    tipo: "CLIENTE",
    ativo: true,
  },
];

const COLABORADORES_TESTE = [
  {
    nome: "Pedro Oliveira",
    email: "pedro@wgalmeida.com.br",
    telefone: "(11) 98765-5001",
    cargo: "Arquiteto Senior",
    unidade: "Arquitetura",
    tipo: "COLABORADOR",
    ativo: true,
  },
  {
    nome: "Carla Mendes",
    email: "carla@wgalmeida.com.br",
    telefone: "(11) 98765-5002",
    cargo: "Engenheira Civil",
    unidade: "Engenharia",
    tipo: "COLABORADOR",
    ativo: true,
  },
  {
    nome: "Ricardo Santos",
    email: "ricardo@wgalmeida.com.br",
    telefone: "(11) 98765-5003",
    cargo: "Designer de Interiores",
    unidade: "Marcenaria",
    tipo: "COLABORADOR",
    ativo: true,
  },
];

const FORNECEDORES_TESTE = [
  {
    nome: "Madeireira São Paulo LTDA",
    email: "vendas@madeirsp.com.br",
    telefone: "(11) 3000-1000",
    cpf: "34567890000192",
    logradouro: "Av. Industrial",
    numero: "1500",
    cidade: "São Paulo",
    estado: "SP",
    tipo: "FORNECEDOR",
    ativo: true,
  },
  {
    nome: "Ferragens e Acabamentos",
    email: "contato@ferracaba.com.br",
    telefone: "(11) 3000-2000",
    cpf: "45678901000193",
    logradouro: "Rua das Ferramentas",
    numero: "800",
    cidade: "São Paulo",
    estado: "SP",
    tipo: "FORNECEDOR",
    ativo: true,
  },
];

const ESPECIFICADORES_TESTE = [
  {
    nome: "Beatriz Almeida",
    email: "beatriz@arquitetura.com.br",
    telefone: "(11) 98765-6001",
    cargo: "Arquiteta Especificadora",
    empresa: "Studio Almeida Arquitetura",
    tipo: "ESPECIFICADOR",
    ativo: true,
  },
  {
    nome: "Fernando Costa",
    email: "fernando@design.com.br",
    telefone: "(11) 98765-6002",
    cargo: "Designer de Produto",
    empresa: "Costa Design",
    tipo: "ESPECIFICADOR",
    ativo: true,
  },
];

// ============================================================================
// FUNÇÕES DE TESTE
// ============================================================================

async function criarPessoas(pessoas: any[], tipoNome: string) {
  section(`CRIANDO ${tipoNome.toUpperCase()}`);

  const resultados = [];

  for (const pessoa of pessoas) {
    try {
      info(`Criando: ${pessoa.nome}...`);

      const { data, error } = await supabase
        .from("pessoas")
        .insert(pessoa)
        .select()
        .single();

      if (error) {
        log(`Erro ao criar ${pessoa.nome}: ${error.message}`, RED);
        resultados.push({ nome: pessoa.nome, sucesso: false, erro: error.message });
      } else {
        success(`${pessoa.nome} criado(a) com ID: ${data.id}`);
        resultados.push({ nome: pessoa.nome, sucesso: true, id: data.id });
      }
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      log(`Exceção ao criar ${pessoa.nome}: ${errMsg}`, RED);
      console.error("Erro completo:", err);
      resultados.push({ nome: pessoa.nome, sucesso: false, erro: errMsg });
    }
  }

  return resultados;
}

async function verificarPessoas() {
  section("VERIFICANDO PESSOAS CRIADAS");

  try {
    const { data: clientes, error: e1 } = await supabase
      .from("pessoas")
      .select("*")
      .eq("tipo", "CLIENTE");

    const { data: colaboradores, error: e2 } = await supabase
      .from("pessoas")
      .select("*")
      .eq("tipo", "COLABORADOR");

    const { data: fornecedores, error: e3 } = await supabase
      .from("pessoas")
      .select("*")
      .eq("tipo", "FORNECEDOR");

    const { data: especificadores, error: e4 } = await supabase
      .from("pessoas")
      .select("*")
      .eq("tipo", "ESPECIFICADOR");

    if (e1 || e2 || e3 || e4) {
      log("Erro ao verificar pessoas", RED);
      return;
    }

    info(`Clientes no banco: ${clientes?.length || 0}`);
    info(`Colaboradores no banco: ${colaboradores?.length || 0}`);
    info(`Fornecedores no banco: ${fornecedores?.length || 0}`);
    info(`Especificadores no banco: ${especificadores?.length || 0}`);

    return {
      clientes: clientes || [],
      colaboradores: colaboradores || [],
      fornecedores: fornecedores || [],
      especificadores: especificadores || [],
    };
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    log(`Exceção ao verificar pessoas: ${errMsg}`, RED);
    console.error("Erro completo:", err);
    return null;
  }
}

// ============================================================================
// EXECUÇÃO PRINCIPAL
// ============================================================================

async function main() {
  log("\n🚀 INICIANDO AUDITORIA AUTOMATIZADA - FASE 1: PESSOAS\n", YELLOW);

  // Fazer login primeiro
  section("AUTENTICAÇÃO");
  info("Fazendo login...");

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: "admin@wgalmeida.com.br",
    password: "123456",
  });

  if (authError) {
    log(`Erro ao fazer login: ${authError.message}`, RED);
    process.exit(1);
  }

  success(`Login realizado com sucesso! Usuário: ${authData.user?.email}`);

  // Criar clientes
  const clientesResult = await criarPessoas(CLIENTES_TESTE, "CLIENTES");

  // Criar colaboradores
  const colaboradoresResult = await criarPessoas(COLABORADORES_TESTE, "COLABORADORES");

  // Criar fornecedores
  const fornecedoresResult = await criarPessoas(FORNECEDORES_TESTE, "FORNECEDORES");

  // Criar especificadores
  const especificadoresResult = await criarPessoas(ESPECIFICADORES_TESTE, "ESPECIFICADORES");

  // Verificar resultado final
  const pessoas = await verificarPessoas();

  // Resumo final
  section("RESUMO DA FASE 1");

  const clientesSucesso = clientesResult.filter(r => r.sucesso).length;
  const colaboradoresSucesso = colaboradoresResult.filter(r => r.sucesso).length;
  const fornecedoresSucesso = fornecedoresResult.filter(r => r.sucesso).length;
  const especificadoresSucesso = especificadoresResult.filter(r => r.sucesso).length;

  log(`\nClientes criados: ${clientesSucesso}/${CLIENTES_TESTE.length}`, clientesSucesso === CLIENTES_TESTE.length ? GREEN : RED);
  log(`Colaboradores criados: ${colaboradoresSucesso}/${COLABORADORES_TESTE.length}`, colaboradoresSucesso === COLABORADORES_TESTE.length ? GREEN : RED);
  log(`Fornecedores criados: ${fornecedoresSucesso}/${FORNECEDORES_TESTE.length}`, fornecedoresSucesso === FORNECEDORES_TESTE.length ? GREEN : RED);
  log(`Especificadores criados: ${especificadoresSucesso}/${ESPECIFICADORES_TESTE.length}`, especificadoresSucesso === ESPECIFICADORES_TESTE.length ? GREEN : RED);

  const totalSucesso = clientesSucesso + colaboradoresSucesso + fornecedoresSucesso + especificadoresSucesso;
  const totalEsperado = CLIENTES_TESTE.length + COLABORADORES_TESTE.length + FORNECEDORES_TESTE.length + ESPECIFICADORES_TESTE.length;

  if (totalSucesso === totalEsperado) {
    log(`\n🎉 FASE 1 CONCLUÍDA COM SUCESSO! ${totalSucesso}/${totalEsperado} pessoas criadas\n`, GREEN);
  } else {
    log(`\n⚠️  FASE 1 CONCLUÍDA COM ERROS: ${totalSucesso}/${totalEsperado} pessoas criadas\n`, YELLOW);
  }

  // Retornar IDs para próxima fase
  if (!pessoas) {
    log("\n❌ Erro: não foi possível recuperar pessoas criadas", RED);
    process.exit(1);
  }

  // FASE 2: OPORTUNIDADES
  await criarOportunidades(pessoas);

  return pessoas;
}

// ============================================================================
// FASE 2: OPORTUNIDADES
// ============================================================================

async function criarOportunidades(pessoas: any) {
  section("FASE 2: CRIANDO OPORTUNIDADES");

  const clientes = pessoas.clientes;
  const colaboradores = pessoas.colaboradores;

  if (clientes.length === 0) {
    log("Nenhum cliente disponível para vincular oportunidades", RED);
    return;
  }

  if (colaboradores.length === 0) {
    log("Nenhum colaborador disponível para vincular como responsável", RED);
    return;
  }

  const OPORTUNIDADES_TESTE = [
    {
      titulo: "Projeto Residencial Alto Padrão - Jardins",
      cliente_id: clientes[0].id,
      descricao: "Reforma completa de apartamento 300m² nos Jardins com projeto arquitetônico e de interiores",
      valor: 850000,
      estagio: "qualificacao",
      status: "novo",
      origem: "Indicação",
      data_abertura: new Date().toISOString(),
      data_fechamento_prevista: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      observacoes: "Cliente com alto padrão de exigência, projeto premium"
    },
    {
      titulo: "Construção Comercial - Escritório Corporativo",
      cliente_id: clientes[1].id,
      descricao: "Novo escritório corporativo 1200m² com engenharia completa e marcenaria",
      valor: 2500000,
      estagio: "proposta",
      status: "proposta_enviada",
      origem: "Website",
      data_abertura: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      data_fechamento_prevista: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      observacoes: "Proposta enviada, aguardando aprovação do cliente"
    },
    {
      titulo: "Residência Completa - Casa 400m²",
      cliente_id: clientes[2].id,
      descricao: "Projeto completo de casa térrea com 4 suítes, área gourmet e piscina",
      valor: 1200000,
      estagio: "negociacao",
      status: "negociacao",
      origem: "Redes Sociais",
      data_abertura: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      data_fechamento_prevista: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      observacoes: "Em negociação de valores e prazos"
    },
    {
      titulo: "Reforma de Fachada Comercial",
      cliente_id: clientes[0].id,
      descricao: "Modernização de fachada de loja 150m²",
      valor: 180000,
      estagio: "qualificacao",
      status: "em_andamento",
      origem: "Telefone",
      data_abertura: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      data_fechamento_prevista: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      observacoes: "Projeto rápido, cliente quer iniciar em 2 meses"
    },
    {
      titulo: "Projeto de Marcenaria Sob Medida",
      cliente_id: clientes[1].id,
      descricao: "Móveis planejados para apartamento completo 180m²",
      valor: 320000,
      estagio: "fechamento",
      status: "ganho",
      origem: "Indicação",
      data_abertura: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      data_fechamento_prevista: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      data_fechamento_real: new Date().toISOString(),
      observacoes: "Oportunidade ganha! Contrato assinado"
    },
  ];

  const resultados = [];

  for (const oportunidade of OPORTUNIDADES_TESTE) {
    try {
      info(`Criando: ${oportunidade.titulo}...`);

      const { data, error } = await supabase
        .from("oportunidades")
        .insert(oportunidade)
        .select()
        .single();

      if (error) {
        log(`Erro ao criar ${oportunidade.titulo}: ${error.message}`, RED);
        resultados.push({ titulo: oportunidade.titulo, sucesso: false, erro: error.message });
      } else {
        success(`${oportunidade.titulo} criada com ID: ${data.id}`);
        resultados.push({ titulo: oportunidade.titulo, sucesso: true, id: data.id });
      }
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      log(`Exceção ao criar ${oportunidade.titulo}: ${errMsg}`, RED);
      console.error("Erro completo:", err);
      resultados.push({ titulo: oportunidade.titulo, sucesso: false, erro: errMsg });
    }
  }

  // Verificar resultado
  const { data: oportunidadesCriadas } = await supabase
    .from("oportunidades")
    .select("*");

  section("RESUMO DA FASE 2");
  info(`Oportunidades no banco: ${oportunidadesCriadas?.length || 0}`);

  const sucesso = resultados.filter(r => r.sucesso).length;
  log(`\nOportunidades criadas: ${sucesso}/${OPORTUNIDADES_TESTE.length}`, sucesso === OPORTUNIDADES_TESTE.length ? GREEN : RED);

  if (sucesso === OPORTUNIDADES_TESTE.length) {
    log(`\n🎉 FASE 2 CONCLUÍDA COM SUCESSO! ${sucesso}/${OPORTUNIDADES_TESTE.length} oportunidades criadas\n`, GREEN);
  } else {
    log(`\n⚠️  FASE 2 CONCLUÍDA COM ERROS: ${sucesso}/${OPORTUNIDADES_TESTE.length} oportunidades criadas\n`, YELLOW);
  }

  return resultados;
}

// Executar
main().catch((err) => {
  const errMsg = err?.message || String(err);
  log(`Erro fatal: ${errMsg}`, RED);
  console.error("Erro completo:", err);
  process.exit(1);
});
