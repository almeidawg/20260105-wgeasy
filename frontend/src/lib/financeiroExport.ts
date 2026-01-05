// src/lib/financeiroExport.ts
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { LancamentoFinanceiro } from "./financeiroApi";

export function exportarFinanceiroPDF(lista: LancamentoFinanceiro[]) {
  const doc = new jsPDF();
  doc.text("Relatório Financeiro - WG Easy", 14, 16);

  autoTable(doc, {
    startY: 22,
    head: [["Descrição", "Valor", "Tipo", "Status", "Vencimento", "Núcleo"]],
    body: lista.map((l) => [
      l.descricao,
      "R$ " + Number(l.valor_total || 0).toFixed(2),
      l.tipo,
      l.status ?? "-",
      l.vencimento ?? "-",
      l.nucleo ?? "-",
    ]),
  });

  doc.save("financeiro-wg.pdf");
}

export function exportarFinanceiroExcel(lista: LancamentoFinanceiro[]) {
  const plain = lista.map((l) => ({
    Descricao: l.descricao,
    Valor: Number(l.valor_total || 0),
    Tipo: l.tipo,
    Status: l.status ?? "",
    Vencimento: l.vencimento ?? "",
    Nucleo: l.nucleo ?? "",
    CategoriaID: l.categoria_id ?? "",
  }));

  const worksheet = XLSX.utils.json_to_sheet(plain);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Financeiro");
  XLSX.writeFile(workbook, "financeiro-wg.xlsx");
}
