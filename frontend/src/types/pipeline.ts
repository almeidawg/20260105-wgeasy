// src/types/pipeline.ts

export type TipoItem = "projeto" | "obra" | "orcamento";
export type StatusItem =
  | "em_andamento"
  | "concluido"
  | "aguardando_aprovacao"
  | "em_analise"
  | "atrasado";

export type UnidadeWG = "Arquitetura" | "Engenharia" | "Marcenaria";

export interface PipelineItem {
  id: string;
  tipo: TipoItem;
  unidade: UnidadeWG;
  titulo: string;
  cliente: string;
  valor: number | null;
  status: StatusItem;
  prazo: string | null;        // ISO date
  prazo_label: string | null;  // label já formatada (ex: "Mar/2026")
  progresso: number | null;
  created_at: string;
  updated_at: string;
}
