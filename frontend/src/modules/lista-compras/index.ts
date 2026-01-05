// ============================================================
// Lista de Compras - Módulo Exports
// Sistema WG Easy - Grupo WG Almeida
// ============================================================

// Página Principal
export { default as ListaComprasPage } from './components/ListaComprasPage';

// Componentes
export { default as DashboardFinanceiro } from './components/DashboardFinanceiro';
export { default as FiltrosLista } from './components/FiltrosLista';
export { default as ItemCard } from './components/ItemCard';
export { default as PricelistSearch } from './components/PricelistSearch';
export { default as AddItemModal } from './components/AddItemModal';
export { default as ComplementaresModal } from './components/ComplementaresModal';

// Hooks
export { useListaCompras } from './hooks/useListaCompras';
export { usePricelistSearch } from './hooks/usePricelistSearch';
export { useDashboard } from './hooks/useDashboard';
export { useComplementares } from './hooks/useComplementares';

// Types
export * from './types';

// Utils
export * from './utils/formatters';
