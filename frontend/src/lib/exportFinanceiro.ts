// src/lib/exportFinanceiro.ts
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { LancamentoFinanceiro } from "./financeiroApi";

export function exportarPDF(lista: LancamentoFinanceiro[]) {
  const doc = new jsPDF();

  doc.text("Relatório Financeiro - WG Easy", 14, 16);

  autoTable(doc, {
    startY: 22,
    head: [["Descrição", "Valor", "Tipo", "Status", "Vencimento"]],
    body: lista.map(l => [
      l.descricao ?? "",
      "R$ " + Number(l.valor_total ?? 0).toFixed(2),
      l.tipo ?? "",
      l.status ?? "",
      l.vencimento ?? ""
    ]),
  });

  doc.save("financeiro-wg.pdf");
}

export function exportarExcel(lista: LancamentoFinanceiro[]) {
  const worksheet = XLSX.utils.json_to_sheet(lista);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Financeiro");

  XLSX.writeFile(workbook, "financeiro-wg.xlsx");
}
