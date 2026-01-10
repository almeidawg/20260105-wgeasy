// ==========================================
// WG EASY · ESTRUTURA DE MENU CORPORATIVO 2026
// Identidade Visual: WG Almeida
// ==========================================

export interface MenuItem {
  label: string;
  path: string;
  icon?: string;
  hoverColor?: string; // Cor personalizada para hover (núcleos)
  restrictTo?: string | string[]; // Restringir item a tipo(s) de usuário específico(s) (ex: "MASTER" ou ["MASTER", "ADMIN"])
}

export interface MenuSection {
  section: string;
  icon: string;
  items: MenuItem[];
  maxVisible?: number; // Limite de itens visíveis antes do "Ver mais"
  path?: string; // Caminho direto ao clicar no título da seção
  restrictTo?: string | string[]; // Restringir seção inteira a tipo(s) de usuário
}

const wgMenus: MenuSection[] = [
  {
    section: "Dashboard",
    icon: "📊",
    path: "/", // Clique no título navega direto para o Dashboard
    items: [
      { label: "Meu Financeiro", path: "/meu-financeiro", icon: "💳", restrictTo: "MASTER" }, // Apenas para Founder & CEO
      { label: "Visão Executiva", path: "/dashboard/executivo", icon: "📈", restrictTo: "MASTER" } // Dashboard estratégico CEO
    ]
  },
  {
    section: "Pessoas",
    icon: "👥",
    maxVisible: 4,
    items: [
      { label: "Clientes", path: "/pessoas/clientes" },
      { label: "Colaboradores", path: "/pessoas/colaboradores" },
      { label: "Especificadores", path: "/pessoas/especificadores" },
      { label: "Fornecedores", path: "/pessoas/fornecedores" }
    ]
  },
  {
    section: "Oportunidades",
    icon: "🎯",
    path: "/oportunidades", // Clique no título navega direto
    items: []
  },
  {
    section: "Comercial",
    icon: "💼",
    maxVisible: 4,
    items: [
      { label: "Estudo (EVF)", path: "/evf" },
      { label: "Análise de Projeto", path: "/analise-projeto" },
      { label: "Propostas", path: "/propostas" },
      { label: "Contratos", path: "/contratos" }
    ]
  },
  {
    section: "Arquitetura",
    icon: "🏛️",
    path: "/oportunidades/kanban/arquitetura", // Verde Mineral #5E9B94
    items: [
      { label: "Templates de Checklists", path: "/sistema/checklists", icon: "✅" }
    ]
  },
  {
    section: "Engenharia",
    icon: "⚙️",
    path: "/oportunidades/kanban/engenharia", // Azul Técnico #2B4580
    items: []
  },
  {
    section: "Marcenaria",
    icon: "🪵",
    path: "/oportunidades/kanban/marcenaria", // Marrom Carvalho #8B5E3C
    items: []
  },
  {
    section: "Planejamento",
    icon: "📋",
    path: "/planejamento", // Dashboard de Planejamento
    maxVisible: 5,
    items: [
      { label: "Novo Pedido", path: "/planejamento/novo", icon: "➕" },
      { label: "Composições", path: "/planejamento/composicoes", icon: "🧩" },
      { label: "Aprovações", path: "/planejamento/aprovacoes", icon: "✅" },
      { label: "Orçamentos", path: "/planejamento/orcamentos", icon: "📄" },
      { label: "Compras", path: "/compras", icon: "🛒" }
    ]
  },
  {
    section: "Serviços",
    icon: "🚚",
    path: "/servicos",
    items: []
  },
  {
    section: "Cronograma",
    icon: "📅",
    path: "/cronograma", // Clique no título navega direto para o Dashboard
    items: [
      { label: "Projetos", path: "/cronograma/projects" }
    ]
  },
  {
    section: "Financeiro",
    icon: "💰",
    maxVisible: 7,
    path: "/financeiro", // Clique no título navega direto para o Dashboard
    restrictTo: ["MASTER", "FINANCEIRO"], // ADMIN não vê esta seção
    items: [
      { label: "Projetos", path: "/financeiro/obras", restrictTo: ["MASTER", "FINANCEIRO"] },
      { label: "Lançamentos", path: "/financeiro/lancamentos", restrictTo: ["MASTER", "FINANCEIRO"] },
      { label: "SDP - Solicitações", path: "/financeiro/solicitacoes", restrictTo: ["MASTER", "FINANCEIRO"] },
      { label: "Reembolsos", path: "/financeiro/reembolsos", restrictTo: ["MASTER", "FINANCEIRO"] },
      { label: "Cobranças", path: "/financeiro/cobrancas", restrictTo: ["MASTER", "FINANCEIRO"] },
      { label: "Relatórios", path: "/financeiro/relatorios", restrictTo: ["MASTER", "FINANCEIRO"] },
      { label: "Comissões", path: "/financeiro/comissionamento", restrictTo: ["MASTER", "FINANCEIRO"] }
    ]
  },
  {
    section: "Jurídico",
    icon: "⚖️",
    path: "/juridico", // Clique no título navega direto (Dashboard com Clientes Ativos)
    items: [
      { label: "Assistência Jurídica", path: "/juridico/assistencia", icon: "🆘" }, // Visível para todos incluindo ADMIN
      { label: "Financeiro Jurídico", path: "/juridico/financeiro", icon: "💰", restrictTo: ["MASTER", "JURIDICO"] },
      { label: "Empresas do Grupo WG", path: "/juridico/empresas", icon: "🏢", restrictTo: ["MASTER", "JURIDICO"] },
      { label: "Modelos de Contrato", path: "/juridico/modelos", icon: "📝", restrictTo: ["MASTER", "JURIDICO"] }
    ]
  },
  {
    section: "WGXperience",
    icon: "⭐",
    items: [
      { label: "Portal do Cliente", path: "/portal-cliente" },
      { label: "Cadastro de Clientes", path: "/sistema/area-cliente/clientes" },
      { label: "Drive Compartilhado", path: "/sistema/area-cliente/drive" }
    ]
  },
  {
    section: "Pós Vendas",
    icon: "🛠️",
    maxVisible: 3,
    items: [
      { label: "Assistência", path: "/assistencia" },
      { label: "Termo de Aceite", path: "/termo-aceite" },
      { label: "Garantia", path: "/garantia" }
    ]
  },
  {
    section: "Onboarding",
    icon: "🚀",
    path: "/onboarding", // Clique no título navega direto
    items: []
  },
  {
    section: "WG Store",
    icon: "🛒",
    items: [
      { label: "Loja Virtual", path: "/wg-store" },
      { label: "Memorial de Acabamentos", path: "/memorial-acabamentos" }
    ]
  },
  {
    section: "Depósito WG",
    icon: "📦",
    path: "/deposito", // Clique no título navega direto
    items: []
  },
  {
    section: "Sistema",
    icon: "🔧",
    maxVisible: 11,
    restrictTo: "MASTER", // Apenas MASTER vê esta seção
    items: [
      { label: "Cadastros Pendentes", path: "/sistema/cadastros-pendentes", restrictTo: "MASTER" },
      { label: "Central de Links", path: "/sistema/central-links", restrictTo: "MASTER" },
      { label: "Central Import/Export", path: "/sistema/importar-exportar", restrictTo: "MASTER" },
      { label: "Empresas do Grupo WG", path: "/empresas", restrictTo: "MASTER" },
      { label: "Planta do Sistema", path: "/sistema/planta", restrictTo: "MASTER" },
      { label: "Precificação", path: "/sistema/precificacao", restrictTo: "MASTER" },
      { label: "Price List", path: "/pricelist", restrictTo: "MASTER" },
      { label: "Saúde do Sistema", path: "/sistema/saude", restrictTo: "MASTER" },
      { label: "Usuários", path: "/usuarios", restrictTo: "MASTER" }
    ]
  },
  {
    section: "Sessão",
    icon: "🚪",
    path: "/logout", // Clique no título faz logout direto
    items: []
  },
  // ============================================================
  // ÁREAS EXCLUSIVAS POR TIPO DE USUÁRIO
  // ============================================================
  {
    section: "Minha Área",
    icon: "👷",
    path: "/colaborador", // Área exclusiva do colaborador
    items: [
      { label: "Dashboard", path: "/colaborador", icon: "📊" },
      { label: "Meus Projetos", path: "/colaborador/projetos", icon: "📁" },
      { label: "Serviços", path: "/colaborador/servicos", icon: "🔧" },
      { label: "Materiais", path: "/colaborador/materiais", icon: "📦" },
      { label: "Diário de Obra", path: "/colaborador/diario-obra", icon: "📝" },
      { label: "Solicitações", path: "/colaborador/solicitacoes", icon: "📋" },
      { label: "Financeiro", path: "/colaborador/financeiro", icon: "💰" },
      { label: "Meu Perfil", path: "/colaborador/perfil", icon: "👤" }
    ]
  },
  {
    section: "Área do Cliente",
    icon: "🏠",
    path: "/area-cliente", // Área exclusiva do cliente
    items: [
      { label: "Meu Projeto", path: "/area-cliente", icon: "🏗️" },
      { label: "Arquivos", path: "/area-cliente/arquivos", icon: "📁" },
      { label: "Cronograma", path: "/wgx/cronograma", icon: "📅" },
      { label: "Financeiro", path: "/wgx/financeiro", icon: "💰" },
      { label: "Fornecedores", path: "/wgx/fornecedores", icon: "🔧" },
      { label: "Pós-Vendas", path: "/wgx/pos-vendas", icon: "🛠️" }
    ]
  }
];

export default wgMenus;

