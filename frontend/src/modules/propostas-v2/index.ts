// ============================================================
// Propostas V2 - Módulo Exports
// Sistema WG Easy - Grupo WG Almeida
// ============================================================

// Página Principal
export { default as PropostaEmissaoPageV2 } from './components/PropostaEmissaoPageV2';
export { default as PropostaEmissaoPageV3 } from './components/PropostaEmissaoPageV3';

// Componentes
export { default as ClienteCard } from './components/ClienteCard';
export { default as AmbientesCard } from './components/AmbientesCard';
export { default as CondicoesComerciaisCard } from './components/CondicoesComerciaisCard';
export { default as AmbientesLista } from './components/AmbientesLista';
export { default as PricelistBusca } from './components/PricelistBusca';
export { default as ItensPropostaPanel } from './components/ItensPropostaPanel';

// Hooks
export { useClientes } from './hooks/useClientes';
export { useAmbientes } from './hooks/useAmbientes';
export { usePricelistBusca } from './hooks/usePricelistBusca';
export { useItensProposta } from './hooks/useItensProposta';
export { useCondicoesComerciais } from './hooks/useCondicoesComerciais';
export { useSugestoesIA } from './hooks/useSugestoesIA';

// Types
export * from './types';
