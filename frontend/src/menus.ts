const menus = [
  {
    section: "Principal",
    items: [{ label: "Dashboard", icon: "??", path: "/" }],
  },
  {
    section: "Gestao",
    items: [
      {
        label: "Pessoas",
        icon: "??",
        path: "/pessoas",
        children: [
          { label: "Clientes", path: "/pessoas/clientes" },
          { label: "Colaboradores", path: "/pessoas/colaboradores" },
          { label: "Fornecedores", path: "/pessoas/fornecedores" },
          { label: "Especificadores", path: "/pessoas/especificadores" },
        ],
      },
      {
        label: "Comercial",
        icon: "??",
        path: "/comercial",
        children: [
          { label: "Oportunidades", path: "/oportunidades" },
          { label: "Propostas", path: "/propostas" },
          { label: "Contratos", path: "/contratos" },
        ],
      },
    ],
  },
  {
    section: "Projetos",
    items: [
      { label: "Arquitetura", icon: "??", path: "/arquitetura/kanban" },
      { label: "Engenharia", icon: "??", path: "/engenharia/kanban" },
      { label: "Marcenaria", icon: "??", path: "/marcenaria" },
      { label: "Projetos", icon: "??", path: "/projects" },
    ],
  },
  {
    section: "Operacoes",
    items: [
      {
        label: "Operacoes",
        icon: "??",
        path: "/operacoes",
        children: [
          { label: "Compras", path: "/compras" },
          { label: "Ideias", path: "/operacoes/ideias" },
          { label: "Planejamento", path: "/operacoes/planejamento" },
          { label: "Aprovacoes", path: "/operacoes/aprovacoes" },
        ],
      },
      {
        label: "Cronogramas",
        icon: "???",
        path: "/cronograma",
        children: [
          { label: "Visao Geral", path: "/cronograma" },
          { label: "Projetos", path: "/cronograma/projects" },
          { label: "Times", path: "/cronograma/teams" },
          { label: "Catalogo", path: "/cronograma/catalog" },
          { label: "Kanban", path: "/cronograma/kanban" },
          { label: "Graficos", path: "/cronograma/graficos" },
          { label: "Financeiro", path: "/cronograma/financeiro" },
        ],
      },
      { label: "Assistencia", icon: "??", path: "/assistencia" },
    ],
  },
  {
    section: "Financeiro",
    items: [
      {
        label: "Financeiro",
        icon: "??",
        path: "/financeiro",
        children: [
          { label: "Dashboard", path: "/financeiro" },
          { label: "Lancamentos", path: "/financeiro/lancamentos" },
          { label: "Cobrancas", path: "/financeiro/cobrancas" },
          { label: "Reembolsos", path: "/financeiro/reembolsos" },
          { label: "Comissionamento", path: "/financeiro/comissionamento" },
          { label: "Obras", path: "/financeiro/obras" },
          { label: "Categorias", path: "/financeiro/categorias" },
          { label: "Importar Extrato", path: "/financeiro/importar-extrato" },
          { label: "Relatorios", path: "/financeiro/relatorios" },
        ],
      },
    ],
  },
  {
    section: "Sistema",
    items: [
      {
        label: "Onboarding",
        icon: "??",
        path: "/onboarding",
        children: [
          { label: "Clientes", path: "/onboarding/clientes" },
          { label: "Time WG", path: "/onboarding/time" },
        ],
      },
      { label: "WGStore", icon: "??", path: "/wg-store" },
      {
        label: "Administrativo",
        icon: "??",
        path: "/administrativo",
        children: [
          { label: "Usuarios", path: "/usuarios" },
          { label: "Configuracoes", path: "/configuracoes" },
          { label: "Comissoes", path: "/administrativo/comissoes" },
          { label: "Price List", path: "/administrativo/precos" },
          { label: "Precificacao", path: "/sistema/precificacao" },
        ],
      },
      { label: "Sair", icon: "??", path: "/logout" },
    ],
  },
];

export default menus;
