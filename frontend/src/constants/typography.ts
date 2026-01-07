// ============================================================
// CONSTANTES DE TIPOGRAFIA
// Sistema WG Easy - Grupo WG Almeida
// Padrões de tamanho e peso de fonte para todo o sistema
// ============================================================

export const TYPOGRAPHY = {
  // Títulos de página
  pageTitle: "text-2xl font-semibold",
  pageSubtitle: "text-sm text-gray-500",

  // Cards de status/métricas
  statNumber: "text-xl font-bold",
  statLabel: "text-xs font-medium",
  statDescription: "text-xs text-gray-400",

  // Cards de cliente/entidade
  cardTitle: "text-sm font-semibold",
  cardSubtitle: "text-xs text-gray-500",
  cardMeta: "text-xs text-gray-400",

  // Seções dentro de páginas
  sectionTitle: "text-lg font-semibold",
  sectionSubtitle: "text-sm text-gray-500",

  // Botões de ação
  actionTitle: "text-sm font-medium",
  actionSubtitle: "text-xs text-gray-500",

  // Badges/Tags
  badge: "text-xs font-medium px-2 py-0.5",
  badgeSmall: "text-[10px] font-medium px-1.5 py-0.5",

  // Tabelas
  tableHeader: "text-xs font-semibold uppercase text-gray-500",
  tableCell: "text-sm",
  tableCellSmall: "text-xs text-gray-500",

  // Formulários
  formLabel: "text-sm font-medium text-gray-700",
  formHelper: "text-xs text-gray-500",
  formError: "text-xs text-red-600",

  // Links e navegação
  navItem: "text-sm font-medium",
  navItemActive: "text-sm font-semibold",
  breadcrumb: "text-sm text-gray-500",

  // Modais e Sheets
  modalTitle: "text-lg font-semibold",
  modalDescription: "text-sm text-gray-500",

  // Mensagens/Alertas
  alertTitle: "text-sm font-semibold",
  alertDescription: "text-xs",

  // Valores monetários
  moneyLarge: "text-xl font-bold",
  moneyMedium: "text-base font-semibold",
  moneySmall: "text-sm font-medium",
} as const;

// Tipo para autocomplete
export type TypographyKey = keyof typeof TYPOGRAPHY;
