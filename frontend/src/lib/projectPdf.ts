// src/lib/projectPdf.ts
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function gerarPdfCronograma(projeto: any, tarefas: any[]) {
  const doc = new jsPDF();

  doc.text(`Cronograma do Projeto: ${projeto.nome}`, 14, 16);
  doc.text(`Período: ${projeto.inicio} → ${projeto.fim}`, 14, 24);

  autoTable(doc, {
    startY: 32,
    head: [["Tarefa", "Responsável", "Início", "Fim", "Progresso"]],
    body: tarefas.map((t) => [
      t.titulo,
      t.responsavel ?? "-",
      t.inicio,
      t.fim,
      `${t.progresso || 0}%`,
    ]),
  });

  doc.save(`cronograma-${projeto.nome}.pdf`);
}
