// src/constants/oportunidades.ts
export const ESTAGIOS = [
  "Lead",
  "Qualificação",
  "Proposta",
  "Negociação",
  "Fechamento",
  "Perdida",
] as const;

export type Estagio = (typeof ESTAGIOS)[number];

export const NUCLEOS = [
  "Arquitetura",
  "Engenharia",
  "Marcenaria",
] as const;

export type Nucleo = (typeof NUCLEOS)[number];

// 🎨 Cores Oficiais WG - Sistema de Identidade Visual
// Baseado nas cores da marca Grupo WG Almeida
export const CORES_NUCLEOS = {
  Arquitetura: {
    primary: "#5E9B94",      // Verde Mineral WG (cor principal)
    secondary: "#E5F3F1",    // Verde claro (fundo suave)
    text: "#2D4D47",         // Verde escuro (texto)
    border: "#7FB3AB",       // Verde médio (borda)
    hover: "#4A7D77",        // Verde hover (mais escuro)
  },
  Engenharia: {
    primary: "#2B4580",      // Azul Técnico WG (cor principal)
    secondary: "#E8ECF5",    // Azul claro (fundo suave)
    text: "#1A2A4D",         // Azul escuro (texto)
    border: "#5571A8",       // Azul médio (borda)
    hover: "#1F3566",        // Azul hover (mais escuro)
  },
  Marcenaria: {
    primary: "#8B5E3C",      // Marrom Carvalho WG (cor principal)
    secondary: "#F5EDE5",    // Marrom claro (fundo suave)
    text: "#4D3422",         // Marrom escuro (texto)
    border: "#A87959",       // Marrom médio (borda)
    hover: "#6D4A2E",        // Marrom hover (mais escuro)
  },
} as const;

// Função para obter cores de um núcleo
export function getCoresNucleo(nucleo: Nucleo) {
  return CORES_NUCLEOS[nucleo];
}
