// src/lib/criticalPath.ts
import dayjs from "dayjs";

export interface TaskNode {
  id: string;
  titulo: string;
  inicio: string;
  fim: string;
  depende_de?: string[]; // IDs das tasks
}

export interface CriticalPathResult {
  caminhoCritico: string[];
  duracaoProjeto: number;
  mapaSlack: Record<string, number>;
}

export function calcularCriticalPath(tasks: TaskNode[]): CriticalPathResult {
  const duracoes: Record<string, number> = {};
  const predecessors: Record<string, string[]> = {};
  const earliestStart: Record<string, number> = {};
  const earliestFinish: Record<string, number> = {};
  const latestStart: Record<string, number> = {};
  const latestFinish: Record<string, number> = {};
  const slack: Record<string, number> = {};

  tasks.forEach((t) => {
    duracoes[t.id] = dayjs(t.fim).diff(dayjs(t.inicio), "day") || 1;
    predecessors[t.id] = t.depende_de ?? [];
  });

  // Forward pass
  tasks.forEach((t) => {
    if (predecessors[t.id].length === 0) {
      earliestStart[t.id] = 0;
    } else {
      earliestStart[t.id] = Math.max(
        ...predecessors[t.id].map((p) => earliestFinish[p] || 0)
      );
    }
    earliestFinish[t.id] = earliestStart[t.id] + duracoes[t.id];
  });

  const duracaoTotal = Math.max(...Object.values(earliestFinish));

  // Backward pass
  tasks
    .slice()
    .reverse()
    .forEach((t) => {
      const successors = tasks.filter((x) => (x.depende_de || []).includes(t.id));
      if (successors.length === 0) {
        latestFinish[t.id] = duracaoTotal;
      } else {
        latestFinish[t.id] = Math.min(
          ...successors.map((s) => latestStart[s.id] || duracaoTotal)
        );
      }
      latestStart[t.id] = latestFinish[t.id] - duracoes[t.id];
    });

  // Slack
  tasks.forEach((t) => {
    slack[t.id] = latestStart[t.id] - earliestStart[t.id];
  });

  // Caminho crítico = tasks com slack 0
  const caminho = tasks.filter((t) => slack[t.id] === 0).map((t) => t.id);

  return {
    caminhoCritico: caminho,
    duracaoProjeto: duracaoTotal,
    mapaSlack: slack,
  };
}
