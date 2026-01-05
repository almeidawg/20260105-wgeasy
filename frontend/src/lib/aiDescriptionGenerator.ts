// ============================================================
// AI Description Generator - Gerador de Descrições com IA
// Sistema WG Easy - Grupo WG Almeida
// ============================================================

import type { TipoPricelist } from "@/types/pricelist";

/**
 * Gerar descrição didática para um item do pricelist
 */
export async function gerarDescricaoIA(
  nome: string,
  tipo: TipoPricelist,
  categoria?: string
): Promise<string> {
  // Simular delay de API
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Templates base por tipo
  const templates: Record<TipoPricelist, string> = {
    mao_obra: gerarDescricaoMaoObra(nome, categoria),
    material: gerarDescricaoMaterial(nome, categoria),
    servico: gerarDescricaoServico(nome, categoria),
    produto: gerarDescricaoMaterial(nome, categoria), // Produtos usam mesma lógica de materiais
  };

  return templates[tipo] || `${nome} - Item do tipo ${tipo}`;
}

/**
 * Gerar descrição para Mão de Obra
 */
function gerarDescricaoMaoObra(nome: string, categoria?: string): string {
  const nomeLower = nome.toLowerCase();

  // Projetos Arquitetônicos
  if (
    nomeLower.includes("projeto") ||
    nomeLower.includes("arquitetônico") ||
    nomeLower.includes("arquitetonico")
  ) {
    return `Serviço profissional de elaboração de ${nome.toLowerCase()}. Inclui levantamento de necessidades, desenvolvimento de plantas técnicas, especificações e documentação completa conforme normas técnicas e legislação vigente.`;
  }

  // Visitas e Vistorias
  if (nomeLower.includes("visita") || nomeLower.includes("vistoria")) {
    return `Serviço de ${nome.toLowerCase()} realizado por profissional habilitado. Inclui deslocamento, análise técnica no local, registro fotográfico, medições necessárias e elaboração de relatório técnico detalhado.`;
  }

  // Instalações
  if (nomeLower.includes("instalação") || nomeLower.includes("instalacao")) {
    return `Serviço de ${nome.toLowerCase()} executado por profissional qualificado. Inclui preparação do local, montagem, testes funcionais e limpeza final. Garantia de execução conforme especificações técnicas.`;
  }

  // Pinturas
  if (nomeLower.includes("pintura")) {
    return `Serviço de ${nome.toLowerCase()} executado por pintor profissional. Inclui preparação da superfície (lixamento, correção de imperfeições), aplicação de primers quando necessário e acabamento final com número adequado de demãos.`;
  }

  // Alvenaria
  if (
    nomeLower.includes("alvenaria") ||
    nomeLower.includes("pedreiro") ||
    nomeLower.includes("construção") ||
    nomeLower.includes("construcao")
  ) {
    return `Mão de obra especializada em ${nome.toLowerCase()}. Execução de serviços de construção civil incluindo preparo de massas, assentamento, nivelamento, prumo e acabamentos básicos. Profissional com experiência comprovada.`;
  }

  // Elétrica
  if (nomeLower.includes("elétrica") || nomeLower.includes("eletrica") || nomeLower.includes("eletricista")) {
    return `Serviço de ${nome.toLowerCase()} realizado por eletricista certificado. Inclui instalação de pontos, passagem de fiação, conexões, testes de continuidade e isolamento. Execução conforme NBR 5410.`;
  }

  // Hidráulica
  if (
    nomeLower.includes("hidráulica") ||
    nomeLower.includes("hidraulica") ||
    nomeLower.includes("encanador") ||
    nomeLower.includes("tubulação") ||
    nomeLower.includes("tubulacao")
  ) {
    return `Serviço de ${nome.toLowerCase()} executado por profissional especializado. Inclui corte, conexão, soldagem (quando aplicável), vedação e testes de pressão e estanqueidade. Garantia contra vazamentos.`;
  }

  // Marcenaria
  if (nomeLower.includes("marcenaria") || nomeLower.includes("marceneiro") || nomeLower.includes("móveis") || nomeLower.includes("moveis")) {
    return `Serviço especializado de ${nome.toLowerCase()}. Inclui corte, montagem, acabamento e ajustes finais. Execução com ferramentas profissionais e atenção aos detalhes de nivelamento e prumo.`;
  }

  // Genérico
  return `Mão de obra qualificada para ${nome.toLowerCase()}. Serviço executado por profissional com experiência na área, seguindo as melhores práticas e normas técnicas aplicáveis. Inclui ferramentas básicas e limpeza do local.`;
}

/**
 * Gerar descrição para Material
 */
function gerarDescricaoMaterial(nome: string, categoria?: string): string {
  const nomeLower = nome.toLowerCase();

  // Tintas
  if (nomeLower.includes("tinta")) {
    const tipo = nomeLower.includes("acrílica") || nomeLower.includes("acrilica")
      ? "acrílica"
      : nomeLower.includes("látex") || nomeLower.includes("latex")
      ? "látex"
      : nomeLower.includes("esmalte")
      ? "esmalte sintético"
      : "de alta qualidade";

    return `Tinta ${tipo} para aplicação em superfícies ${nomeLower.includes("parede") ? "de alvenaria" : "diversas"}. Produto de ${nomeLower.includes("premium") || nomeLower.includes("profissional") ? "linha profissional" : "boa qualidade"} com alto poder de cobertura, secagem rápida e acabamento durável. Rendimento médio conforme especificações do fabricante.`;
  }

  // Cimento e Argamassa
  if (nomeLower.includes("cimento") || nomeLower.includes("argamassa")) {
    return `Material para construção civil de qualidade certificada. ${nome} próprio para uso em obras residenciais e comerciais. Armazenar em local seco e protegido. Seguir instruções de preparo e aplicação do fabricante.`;
  }

  // Blocos e Tijolos
  if (nomeLower.includes("bloco") || nomeLower.includes("tijolo")) {
    return `${nome} para construção de alvenaria. Dimensões padronizadas conforme normas técnicas. Material resistente, com boa capacidade de isolamento térmico e acústico. Verificar integridade antes da aplicação.`;
  }

  // Tubos e Conexões
  if (
    nomeLower.includes("tubo") ||
    nomeLower.includes("conexão") ||
    nomeLower.includes("conexao") ||
    nomeLower.includes("registro")
  ) {
    const material = nomeLower.includes("pvc")
      ? "PVC"
      : nomeLower.includes("cobre")
      ? "cobre"
      : nomeLower.includes("ppr")
      ? "PPR"
      : "material de qualidade";

    return `${nome} fabricado em ${material} para instalações hidrossanitárias. Produto certificado, resistente à pressão e corrosão. Garantia de estanqueidade quando instalado corretamente. Seguir especificações técnicas do fabricante.`;
  }

  // Materiais Elétricos
  if (
    nomeLower.includes("fio") ||
    nomeLower.includes("cabo") ||
    nomeLower.includes("disjuntor") ||
    nomeLower.includes("tomada") ||
    nomeLower.includes("interruptor")
  ) {
    return `Material elétrico certificado pelo INMETRO. ${nome} adequado para instalações elétricas residenciais e comerciais. Seguir as especificações da NBR 5410. Instalação deve ser realizada por profissional habilitado.`;
  }

  // Ferragens e Metais
  if (
    nomeLower.includes("ferro") ||
    nomeLower.includes("aço") ||
    nomeLower.includes("aco") ||
    nomeLower.includes("vergalhão") ||
    nomeLower.includes("vergalhao")
  ) {
    return `Material metálico de qualidade controlada para construção civil. ${nome} com certificação de resistência conforme normas técnicas. Armazenar protegido de umidade para evitar oxidação prematura.`;
  }

  // Pisos e Revestimentos
  if (
    nomeLower.includes("piso") ||
    nomeLower.includes("porcelanato") ||
    nomeLower.includes("cerâmica") ||
    nomeLower.includes("ceramica") ||
    nomeLower.includes("azulejo")
  ) {
    return `Revestimento cerâmico de qualidade para pisos e/ou paredes. ${nome} com acabamento durável e fácil manutenção. Verificar classificação de uso (PEI) e aplicação recomendada. Requerer assentamento profissional para melhor resultado.`;
  }

  // Madeiras
  if (nomeLower.includes("madeira") || nomeLower.includes("compensado") || nomeLower.includes("mdf")) {
    return `Material em madeira ou derivados para construção e marcenaria. ${nome} com tratamento adequado e dimensões precisas. Armazenar em local seco e ventilado. Verificar qualidade antes da aplicação.`;
  }

  // Genérico
  return `${nome} - Material de construção de qualidade certificada. Produto selecionado para garantir durabilidade e bom desempenho na aplicação. Seguir recomendações do fabricante quanto a armazenamento, manuseio e instalação.`;
}

/**
 * Gerar descrição para Serviço
 */
function gerarDescricaoServico(nome: string, categoria?: string): string {
  const nomeLower = nome.toLowerCase();

  // Consultoria e Assessoria
  if (nomeLower.includes("consultoria") || nomeLower.includes("assessoria")) {
    return `Serviço de ${nome.toLowerCase()} especializado. Atendimento por profissional qualificado com análise detalhada, orientações técnicas e elaboração de relatório ou parecer quando aplicável. Suporte durante todo o processo.`;
  }

  // Gerenciamento
  if (nomeLower.includes("gerenciamento") || nomeLower.includes("gestão") || nomeLower.includes("gestao")) {
    return `${nome} profissional com acompanhamento sistemático. Inclui planejamento, coordenação de equipes, controle de cronograma e custos, relatórios periódicos e garantia de conformidade com especificações do projeto.`;
  }

  // Manutenção
  if (nomeLower.includes("manutenção") || nomeLower.includes("manutencao")) {
    return `Serviço de ${nome.toLowerCase()} preventiva e/ou corretiva. Execução por equipe técnica qualificada, com diagnóstico preciso, uso de ferramentas apropriadas e teste de funcionamento após intervenção.`;
  }

  // Limpeza
  if (nomeLower.includes("limpeza")) {
    return `Serviço profissional de ${nome.toLowerCase()}. Execução com produtos adequados, equipamentos de proteção individual e técnicas apropriadas para cada tipo de superfície. Garantia de resultado satisfatório.`;
  }

  // Transporte e Logística
  if (
    nomeLower.includes("transporte") ||
    nomeLower.includes("frete") ||
    nomeLower.includes("entrega") ||
    nomeLower.includes("mobilização") ||
    nomeLower.includes("mobilizacao")
  ) {
    return `${nome} com segurança e pontualidade. Serviço realizado com veículo adequado, cuidados no manuseio de materiais e equipamentos. Cobertura de seguro quando aplicável.`;
  }

  // Genérico
  return `${nome} - Serviço profissional executado com qualidade e comprometimento. Atendimento por equipe qualificada, uso de ferramentas e equipamentos adequados. Garantia de satisfação do cliente.`;
}

/**
 * Validar se o texto gerado é apropriado
 */
export function validarDescricaoGerada(descricao: string): boolean {
  return (
    descricao.length >= 50 &&
    descricao.length <= 1000 &&
    !descricao.includes("undefined") &&
    !descricao.includes("null")
  );
}
