// ============================================================
// SCRIPT: Importar Orçamentos para Pricelist
// Sistema WG Easy - Grupo WG Almeida
// Extrai dados dos orçamentos e cadastra no pricelist
// ============================================================

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Configuração Supabase - Service Role Key (bypassa RLS)
const SUPABASE_URL = "https://ahlqzzkxuutwoepirpzr.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobHF6emt4dXV0d29lcGlycHpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU3MTI0MywiZXhwIjoyMDc2MTQ3MjQzfQ.xWNEmZumCtyRdrIiotUIL41jlI168HyBgM4yHVDXPZo";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================================
// MAPA DE CATEGORIAS
// ============================================================

const CATEGORIAS_FORNECEDOR = {
  ELETRICA_HIDRAULICA: {
    nome: "Material Elétrico e Hidráulico",
    icone: "⚡",
    palavrasChave: ["eletric", "hidraulic", "maraca", "fio", "cabo", "disjuntor", "tubo pvc"]
  },
  GESSO_DRYWALL: {
    nome: "Gesso e Drywall",
    icone: "🏗️",
    palavrasChave: ["gesso", "drywall", "gdsul", "placo", "montante", "guia"]
  },
  FERRAMENTAS: {
    nome: "Ferramentas e Equipamentos",
    icone: "🔧",
    palavrasChave: ["ferramenta", "zona sul", "martelete", "furadeira", "esmerilhadeira"]
  },
  PROTECAO_OBRA: {
    nome: "Proteção de Obra",
    icone: "🛡️",
    palavrasChave: ["protecao", "salvabras", "salva obra", "salva piso", "lona", "fita crepe"]
  },
  MATERIAL_CONSTRUCAO: {
    nome: "Material de Construção Geral",
    icone: "🏠",
    palavrasChave: ["construcao", "cimento", "areia", "tijolo", "argamassa"]
  }
};

// ============================================================
// DADOS DOS ORÇAMENTOS EXTRAÍDOS
// ============================================================

// MARACA - Depósito Elétrico/Hidráulico
const FORNECEDOR_MARACA = {
  nome: "MARACA ELÉTRICA E HIDRÁULICA",
  cnpj: "06175265000107",
  telefone: "(11) 5873-8875",
  endereco: "AV. AUGUSTO CARDOSO - JD MARACA - São Paulo/SP",
  categoria: "ELETRICA_HIDRAULICA"
};

const ITENS_MARACA = [
  { codigo: "06030", descricao: "Areia Saco", unidade: "und", preco: 6.25 },
  { codigo: "21953", descricao: "Gesso 40kg", unidade: "und", preco: 46.00 },
  { codigo: "00820", descricao: "Caixa de Luz 4x4 Amarela Tigre", unidade: "und", preco: 7.90 },
  { codigo: "00831", descricao: "Caixa de Luz 4x2 Amarela Tigre", unidade: "und", preco: 3.90 },
  { codigo: "13138", descricao: "Tijolinho Pacote com 10", unidade: "pct", preco: 9.00 },
  { codigo: "02668", descricao: "Cimento 25kg Votoran", unidade: "und", preco: 25.90 },
  { codigo: "00076", descricao: "Caixa de Luz 4x2 Tigre Dryfix", unidade: "und", preco: 16.50 },
  { codigo: "09532", descricao: "Saco Entulho c/10", unidade: "pct", preco: 17.90 },
  { codigo: "00509", descricao: "Fita Crepe 48x50 3M 101LA", unidade: "und", preco: 12.95 },
  { codigo: "02333", descricao: "Papelão Ondulado 1,20m x 50m", unidade: "rolo", preco: 189.90 },
  { codigo: "09318", descricao: "Fita Crepe 24x50 3M 101LA", unidade: "und", preco: 7.50 },
  { codigo: "11460", descricao: "Saco Algodão Alvejado Extra", unidade: "und", preco: 6.50 },
  { codigo: "05157", descricao: "Tubo MR 3/4 25mm Tigre Barra", unidade: "und", preco: 34.50 },
  { codigo: "04303", descricao: "Joelho Azul 3/4 x 1/2 Tigre", unidade: "und", preco: 6.99 },
  { codigo: "07850", descricao: "Tubo Esgoto 1 1/2 Tigre 40mm Barra", unidade: "und", preco: 49.99 },
  { codigo: "04148", descricao: "Joelho MR 3/4 x 45 Tigre", unidade: "und", preco: 2.10 },
  { codigo: "04228", descricao: "Plugue PVC 1/2 Tigre", unidade: "und", preco: 1.99 },
  { codigo: "04623", descricao: "Joelho Esgoto 1 1/2 x 45 Tigre", unidade: "und", preco: 3.40 },
  { codigo: "04141", descricao: "Joelho MR 3/4 x 90 Tigre", unidade: "und", preco: 0.99 },
  { codigo: "04229", descricao: "Plugue PVC 3/4 Tigre", unidade: "und", preco: 2.90 },
  { codigo: "21483", descricao: "Veda Rosca 18x50m Tigre", unidade: "und", preco: 14.90 },
  { codigo: "01974", descricao: "Cola Tigre 175g Pote", unidade: "und", preco: 19.90 },
  { codigo: "11006", descricao: "Conduíte Tigre Amarelo 3/4 25m", unidade: "rolo", preco: 108.90 },
  { codigo: "10005", descricao: "Conduíte Tigre Amarelo 1\" 32mm", unidade: "rolo", preco: 114.90 },
  { codigo: "07661", descricao: "Bucha Nylon S 08", unidade: "und", preco: 0.13 },
  { codigo: "09919", descricao: "Parafuso Chipboard Chata 5,0x50", unidade: "und", preco: 0.40 },
  { codigo: "00174", descricao: "Fita Isolante 20m x 19mm 3M", unidade: "und", preco: 35.90 },
  { codigo: "00193", descricao: "Tijolo Baiano 15 Avulso", unidade: "und", preco: 2.90 },
  { codigo: "02120", descricao: "Condulete Múltiplo X 1", unidade: "und", preco: 15.90 },
  { codigo: "13239", descricao: "Conector para Condulete Múltiplo", unidade: "und", preco: 5.00 },
  { codigo: "15249", descricao: "Abraçadeira D c/ Cunha 1 Inca", unidade: "und", preco: 4.20 },
  { codigo: "00878", descricao: "Luva Unidut Reto Liso 1", unidade: "und", preco: 6.90 },
  { codigo: "05620", descricao: "Eletroduto Zincado 1 Barra c/3m", unidade: "und", preco: 24.90 },
  { codigo: "04490", descricao: "Placa Condulete Cega 1", unidade: "und", preco: 6.90 },
  { codigo: "06662", descricao: "Fio Flex 2,5mm Vermelho c/100m", unidade: "rolo", preco: 219.90 },
  { codigo: "06747", descricao: "Fio Flex 1,5mm Amarelo c/100m", unidade: "rolo", preco: 179.90 },
  { codigo: "06657", descricao: "Fio Flex 2,5mm Azul c/100m", unidade: "rolo", preco: 225.90 },
  { codigo: "06661", descricao: "Fio Flex 2,5mm Verde c/100m", unidade: "rolo", preco: 225.90 },
  { codigo: "06660", descricao: "Fio Flex 2,5mm Preto c/100m", unidade: "rolo", preco: 225.90 },
  { codigo: "08114", descricao: "Fio Flex 1,5mm Cinza c/100m", unidade: "rolo", preco: 169.90 },
  { codigo: "08406", descricao: "Fio Flex 6mm Vermelho Metro", unidade: "m", preco: 7.41 },
  { codigo: "06748", descricao: "Fio Flex 6mm Preto Metro", unidade: "m", preco: 7.41 },
  { codigo: "08563", descricao: "Disjuntor Steck Bipolar 16A DIN", unidade: "und", preco: 45.90 },
  { codigo: "08516", descricao: "Disjuntor Steck Unipolar 20A DIN", unidade: "und", preco: 12.90 },
  { codigo: "08593", descricao: "Disjuntor Steck Bipolar 20A DIN", unidade: "und", preco: 48.90 },
  { codigo: "08515", descricao: "Disjuntor Steck Unipolar 16A DIN", unidade: "und", preco: 12.90 },
  { codigo: "08514", descricao: "Disjuntor Steck Unipolar 10A DIN", unidade: "und", preco: 12.90 },
  { codigo: "05755", descricao: "Massa Corrida PVA Suvinil 18L", unidade: "lata", preco: 145.90 },
  { codigo: "22281", descricao: "Massa Corrida Acrílica Suvinil 18L", unidade: "lata", preco: 299.90 },
  { codigo: "02060", descricao: "Lixa de Massa 150", unidade: "und", preco: 1.10 },
  { codigo: "02049", descricao: "Lixa de Massa 180", unidade: "und", preco: 1.10 },
  { codigo: "16838", descricao: "Espaçador Nivelador Vermelho/Especial", unidade: "pct", preco: 99.90 },
  { codigo: "13969", descricao: "Cunha para Nivelamento de Piso", unidade: "pct", preco: 229.90 },
  { codigo: "15156", descricao: "Viaplus 7000 Fibras cx 18kg Viapol", unidade: "cx", preco: 269.90 },
  { codigo: "13454", descricao: "Multimassa Uso Geral (Massa Pronta)", unidade: "und", preco: 25.90 },
  { codigo: "04606", descricao: "Joelho Esgoto 1 1/2 c/ Anel Tigre", unidade: "und", preco: 8.25 },
  { codigo: "04298", descricao: "Bucha de Redução Sold Longa 1 1/4 x 3/4", unidade: "und", preco: 6.50 },
  { codigo: "04617", descricao: "Luva Esgoto 1 1/2 Tigre", unidade: "und", preco: 4.40 },
  { codigo: "12344", descricao: "Engate Cromado Malha de Aço 60cm", unidade: "und", preco: 29.90 },
  { codigo: "16874", descricao: "Fita Alta Tensão (Auto Fusão) 19mm", unidade: "und", preco: 46.90 },
  { codigo: "04619", descricao: "Junção Esgoto 1 1/2 Tigre", unidade: "und", preco: 5.90 },
  { codigo: "04624", descricao: "Joelho Esgoto 1 1/2 x 90 Tigre", unidade: "und", preco: 2.90 },
  { codigo: "15516", descricao: "Serra Starret 32D Bi Metal", unidade: "und", preco: 13.50 },
  { codigo: "02148", descricao: "Lixa de Ferro 100", unidade: "und", preco: 3.45 },
  { codigo: "04300", descricao: "Tee MR Soldável 3/4 Tigre", unidade: "und", preco: 1.75 },
  { codigo: "05618", descricao: "Eletroduto Zincado 3/4 Barra c/3m", unidade: "und", preco: 19.90 },
  { codigo: "01197", descricao: "Curva Zincada 1 1/4 Elcom", unidade: "und", preco: 15.90 },
  { codigo: "00330", descricao: "Curva Zincada 3/4 Elcom", unidade: "und", preco: 5.75 },
];

// GDSUL - Gesso e Drywall
const FORNECEDOR_GDSUL = {
  nome: "GDSUL CONSTRUÇÕES INTELIGENTES LTDA",
  cnpj: "29028142000149",
  telefone: "(11) 5565-1521",
  endereco: "Av. Ver. João de Luca, 1811 - São Paulo/SP",
  email: "contato@gdsul.com",
  categoria: "GESSO_DRYWALL"
};

const ITENS_GDSUL = [
  { codigo: "2066", descricao: "Guia 48 x 3,00m Hiraco 01", unidade: "und", preco: 14.60 },
  { codigo: "2064", descricao: "Montante 48 x 3,00m Hiraco 01", unidade: "und", preco: 17.50 },
  { codigo: "1390", descricao: "Placa ST Branca 12,5mm 1,20x1,80 Placo", unidade: "und", preco: 38.90 },
  { codigo: "2193", descricao: "Fita Telada Azul 48mm x 90m GDTape", unidade: "und", preco: 15.80 },
  { codigo: "2523", descricao: "Gesso em Pó 40kg América", unidade: "und", preco: 34.60 },
  { codigo: "338", descricao: "Parafuso Chipboard 4,5x35mm Cento Âncora", unidade: "ct", preco: 12.95 },
  { codigo: "484", descricao: "Bucha Nº6 com Anel Cento IVPlast", unidade: "ct", preco: 3.05 },
  { codigo: "1481", descricao: "Parafuso Capetinha 4,2x13mm PB Cento", unidade: "ct", preco: 8.75 },
];

// ZONA SUL - Ferramentas
const FORNECEDOR_ZONA_SUL = {
  nome: "DEPÓSITO ZONA SUL",
  cnpj: "",
  telefone: "(11) 5545-1900",
  endereco: "Av. Interlagos, 1386 C Grande - São Paulo/SP",
  categoria: "FERRAMENTAS"
};

const ITENS_ZONA_SUL = [
  { codigo: "00536400387", descricao: "Martelete Rompedor Worker 620W 220V", unidade: "und", preco: 649.90 },
  { codigo: "00536400378", descricao: "Esmerilhadeira Worker Angular 4.1/2 220V 650W c/6 Discos", unidade: "und", preco: 219.90 },
  { codigo: "00536400235", descricao: "Ponteiro SDS Plus Worker 250mm", unidade: "und", preco: 14.90 },
  { codigo: "00536400214", descricao: "Talhadeira SDS Plus 40x250mm Worker", unidade: "und", preco: 19.90 },
  { codigo: "0004100093", descricao: "Disco Corte Inox Stanley 4.1/2", unidade: "und", preco: 3.90 },
];

// SALVABRAS - Proteção de Obra
const FORNECEDOR_SALVABRAS = {
  nome: "SALVABRAS SOLUÇÕES EM PROTEÇÃO LTDA",
  cnpj: "16557984000146",
  telefone: "0800 591 9352",
  endereco: "Rua Anhanguera, 425 - Osasco/SP",
  email: "contato@salvabras.com.br",
  categoria: "PROTECAO_OBRA"
};

const ITENS_SALVABRAS = [
  { codigo: "P00012", descricao: "Kraft Salva Obra 4X Mais Resistente L1,20m C25m 400g", unidade: "rolo", preco: 101.05 },
  { codigo: "P00022", descricao: "Filme Stretch Polietileno Salva Metais L10cm C75m", unidade: "cx", preco: 14.32 },
  { codigo: "P00090", descricao: "Fita Crepe Premium 24mm x 50m Salvabras", unidade: "und", preco: 10.43 },
  { codigo: "P00089", descricao: "Fita Crepe Premium 48mm x 50m Salvabras", unidade: "und", preco: 20.88 },
  { codigo: "P00020", descricao: "Filme Autoadesivo Salva Bancada L60cm C25m", unidade: "und", preco: 71.94 },
  { codigo: "P00019", descricao: "Filme Autoadesivo Salva Bancada L60cm C50m", unidade: "und", preco: 137.59 },
  { codigo: "P00024", descricao: "Protetor para Ralo Salva Ralo 100mm", unidade: "und", preco: 1.62 },
  { codigo: "P00023", descricao: "Protetor para Ralo Salva Ralo 150mm", unidade: "und", preco: 2.49 },
  { codigo: "P00120", descricao: "Protetor para Quina Salva Quina Flexível L5cm P5cm 1,20m", unidade: "und", preco: 2.42 },
  { codigo: "P00065", descricao: "Protetor para Quina Salva Quina Rígido L5cm P5cm C1,20m", unidade: "und", preco: 5.04 },
  { codigo: "P00021", descricao: "Protetor para Quina Salva Quina Rígido L5cm P5cm C1,80m", unidade: "und", preco: 6.79 },
  { codigo: "P00064", descricao: "Protetor para Calçados Salva Pé cx c/10", unidade: "cx", preco: 72.00 },
  { codigo: "P00031", descricao: "Isolamento Salva Ambiente com Zíper Kit", unidade: "kit", preco: 395.65 },
  { codigo: "P00117", descricao: "Isolamento Salva Ambiente Magnético A2,10m L1,20m", unidade: "und", preco: 114.06 },
  { codigo: "P00074", descricao: "Coletor de Entulho Ráfia L50cm A70cm cx c/10", unidade: "cx", preco: 28.36 },
];

// ============================================================
// FUNÇÕES DE IMPORTAÇÃO
// ============================================================

async function buscarOuCriarCategoria(codigo, dados) {
  console.log(`  📂 Buscando categoria: ${dados.nome}`);

  // Buscar existente
  const { data: existente } = await supabase
    .from("fornecedor_categorias")
    .select("id")
    .eq("codigo", codigo)
    .single();

  if (existente) {
    console.log(`     ✅ Categoria já existe: ${existente.id}`);
    return existente.id;
  }

  // Criar nova
  const { data: nova, error } = await supabase
    .from("fornecedor_categorias")
    .insert({
      codigo: codigo,
      nome: dados.nome,
      icone: dados.icone,
      ativo: true
    })
    .select("id")
    .single();

  if (error) {
    console.error(`     ❌ Erro ao criar categoria:`, error.message);
    return null;
  }

  console.log(`     ✨ Categoria criada: ${nova.id}`);
  return nova.id;
}

async function buscarOuCriarFornecedor(dados, categoriaId) {
  console.log(`  🏢 Buscando fornecedor: ${dados.nome}`);

  // Buscar por CNPJ
  if (dados.cnpj) {
    const { data: porCnpj } = await supabase
      .from("pessoas")
      .select("id")
      .eq("cnpj", dados.cnpj)
      .eq("tipo", "FORNECEDOR")
      .single();

    if (porCnpj) {
      console.log(`     ✅ Fornecedor encontrado por CNPJ: ${porCnpj.id}`);
      return porCnpj.id;
    }
  }

  // Buscar por nome
  const { data: porNome } = await supabase
    .from("pessoas")
    .select("id")
    .eq("tipo", "FORNECEDOR")
    .ilike("nome", `%${dados.nome.split(" ")[0]}%`)
    .limit(1);

  if (porNome && porNome.length > 0) {
    console.log(`     ✅ Fornecedor encontrado por nome: ${porNome[0].id}`);
    return porNome[0].id;
  }

  // Criar novo (observacoes usado para armazenar endereço textual)
  const { data: novo, error } = await supabase
    .from("pessoas")
    .insert({
      nome: dados.nome,
      cnpj: dados.cnpj || null,
      tipo: "FORNECEDOR",
      telefone: dados.telefone,
      email: dados.email || null,
      observacoes: dados.endereco ? `Endereço: ${dados.endereco}` : null,
      ativo: true
    })
    .select("id")
    .single();

  if (error) {
    console.error(`     ❌ Erro ao criar fornecedor:`, error.message);
    return null;
  }

  console.log(`     ✨ Fornecedor criado: ${novo.id}`);

  // Vincular categoria
  if (categoriaId) {
    await supabase.from("fornecedor_categoria_vinculo").insert({
      fornecedor_id: novo.id,
      categoria_id: categoriaId,
      principal: true
    });
    console.log(`     🔗 Categoria vinculada`);
  }

  return novo.id;
}

async function buscarOuCriarCategoriaPricelist(nome) {
  // Buscar existente
  const { data: existente } = await supabase
    .from("pricelist_categorias")
    .select("id")
    .eq("nome", nome)
    .eq("tipo", "material")
    .single();

  if (existente) return existente.id;

  // Criar nova
  const { data: nova } = await supabase
    .from("pricelist_categorias")
    .insert({
      nome: nome,
      tipo: "material",
      ativo: true
    })
    .select("id")
    .single();

  return nova?.id || null;
}

async function cadastrarItensPricelist(itens, fornecedorId, categoriaId) {
  console.log(`  📦 Cadastrando ${itens.length} itens no pricelist...`);

  let cadastrados = 0;
  let existentes = 0;
  let erros = 0;

  for (const item of itens) {
    // Verificar se já existe pelo código
    const { data: existente } = await supabase
      .from("pricelist_itens")
      .select("id")
      .eq("codigo", item.codigo)
      .single();

    if (existente) {
      existentes++;
      continue;
    }

    // Cadastrar novo item
    const { error } = await supabase
      .from("pricelist_itens")
      .insert({
        nome: item.descricao,
        codigo: item.codigo,
        tipo: "material",
        unidade: item.unidade,
        preco: item.preco,
        fornecedor_id: fornecedorId,
        categoria_id: categoriaId,
        ativo: true
      });

    if (error) {
      console.error(`     ❌ Erro ao cadastrar ${item.descricao}:`, error.message);
      erros++;
    } else {
      cadastrados++;
    }
  }

  console.log(`     ✅ Cadastrados: ${cadastrados} | Existentes: ${existentes} | Erros: ${erros}`);
  return { cadastrados, existentes, erros };
}

async function importarFornecedor(fornecedor, itens) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`🚀 Importando: ${fornecedor.nome}`);
  console.log(`${"=".repeat(60)}`);

  // 1. Criar/buscar categoria do fornecedor
  const catFornecedor = CATEGORIAS_FORNECEDOR[fornecedor.categoria];
  const categoriaFornecedorId = await buscarOuCriarCategoria(fornecedor.categoria, catFornecedor);

  // 2. Criar/buscar fornecedor
  const fornecedorId = await buscarOuCriarFornecedor(fornecedor, categoriaFornecedorId);

  if (!fornecedorId) {
    console.error("❌ Não foi possível criar/encontrar fornecedor");
    return;
  }

  // 3. Criar/buscar categoria no pricelist
  const categoriaPricelistId = await buscarOuCriarCategoriaPricelist(catFornecedor.nome);

  // 4. Cadastrar itens
  const resultado = await cadastrarItensPricelist(itens, fornecedorId, categoriaPricelistId);

  console.log(`\n✅ Importação de ${fornecedor.nome} concluída!`);
  return resultado;
}

// ============================================================
// EXECUÇÃO PRINCIPAL
// ============================================================

async function main() {
  console.log("\n");
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║  IMPORTAÇÃO DE ORÇAMENTOS PARA PRICELIST                   ║");
  console.log("║  Sistema WG Easy - Grupo WG Almeida                        ║");
  console.log("╚════════════════════════════════════════════════════════════╝");

  const resultados = {
    total: { cadastrados: 0, existentes: 0, erros: 0 }
  };

  try {
    // Importar MARACA
    const r1 = await importarFornecedor(FORNECEDOR_MARACA, ITENS_MARACA);
    if (r1) {
      resultados.total.cadastrados += r1.cadastrados;
      resultados.total.existentes += r1.existentes;
      resultados.total.erros += r1.erros;
    }

    // Importar GDSUL
    const r2 = await importarFornecedor(FORNECEDOR_GDSUL, ITENS_GDSUL);
    if (r2) {
      resultados.total.cadastrados += r2.cadastrados;
      resultados.total.existentes += r2.existentes;
      resultados.total.erros += r2.erros;
    }

    // Importar ZONA SUL
    const r3 = await importarFornecedor(FORNECEDOR_ZONA_SUL, ITENS_ZONA_SUL);
    if (r3) {
      resultados.total.cadastrados += r3.cadastrados;
      resultados.total.existentes += r3.existentes;
      resultados.total.erros += r3.erros;
    }

    // Importar SALVABRAS
    const r4 = await importarFornecedor(FORNECEDOR_SALVABRAS, ITENS_SALVABRAS);
    if (r4) {
      resultados.total.cadastrados += r4.cadastrados;
      resultados.total.existentes += r4.existentes;
      resultados.total.erros += r4.erros;
    }

    // Resumo final
    console.log("\n");
    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log("║  RESUMO FINAL DA IMPORTAÇÃO                                ║");
    console.log("╠════════════════════════════════════════════════════════════╣");
    console.log(`║  ✅ Itens cadastrados:  ${String(resultados.total.cadastrados).padStart(4)}                              ║`);
    console.log(`║  📦 Itens existentes:   ${String(resultados.total.existentes).padStart(4)}                              ║`);
    console.log(`║  ❌ Erros:              ${String(resultados.total.erros).padStart(4)}                              ║`);
    console.log("╚════════════════════════════════════════════════════════════╝");

  } catch (error) {
    console.error("\n❌ Erro na importação:", error);
  }
}

main();
