// ============================================================================
// EXPORTAÇÃO EVF - Excel e PDF
// Sistema WG Easy - Grupo WG Almeida
// ============================================================================

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { EVFItem, formatarMoeda, formatarNumero, PADRAO_LABELS, PadraoAcabamento } from "@/types/evf";

interface DadosExportacaoEVF {
  titulo: string;
  cliente?: string;
  metragem: number;
  padrao: PadraoAcabamento;
  valorTotal: number;
  valorM2Medio: number;
  itens: EVFItem[];
  observacoes?: string;
  dataExportacao?: Date;
}

/**
 * Exporta o estudo EVF para PDF
 */
export function exportarEVFParaPDF(dados: DadosExportacaoEVF): void {
  const doc = new jsPDF();
  const dataExportacao = dados.dataExportacao || new Date();

  // Header
  doc.setFontSize(18);
  doc.setTextColor(43, 69, 128); // Azul WG
  doc.text("Estudo de Viabilidade Financeira", 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Gerado em: ${dataExportacao.toLocaleDateString("pt-BR")} às ${dataExportacao.toLocaleTimeString("pt-BR")}`, 14, 28);

  // Informações gerais
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);

  let y = 40;

  doc.setFont("helvetica", "bold");
  doc.text("Título:", 14, y);
  doc.setFont("helvetica", "normal");
  doc.text(dados.titulo, 35, y);
  y += 8;

  if (dados.cliente) {
    doc.setFont("helvetica", "bold");
    doc.text("Cliente:", 14, y);
    doc.setFont("helvetica", "normal");
    doc.text(dados.cliente, 35, y);
    y += 8;
  }

  doc.setFont("helvetica", "bold");
  doc.text("Metragem:", 14, y);
  doc.setFont("helvetica", "normal");
  doc.text(`${formatarNumero(dados.metragem)} m²`, 45, y);
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.text("Padrão:", 14, y);
  doc.setFont("helvetica", "normal");
  doc.text(PADRAO_LABELS[dados.padrao].label, 35, y);
  y += 8;

  // Cards de resumo
  doc.setFillColor(245, 245, 245);
  doc.rect(14, y, 88, 20, "F");
  doc.rect(108, y, 88, 20, "F");

  doc.setFont("helvetica", "bold");
  doc.text("Valor Total", 20, y + 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.text(formatarMoeda(dados.valorTotal), 20, y + 16);

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Valor por m²", 114, y + 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.text(formatarMoeda(dados.valorM2Medio), 114, y + 16);

  y += 30;

  // Tabela de categorias
  doc.setFontSize(12);
  doc.setFont(undefined, "bold");
  doc.text("Detalhamento por Categoria", 14, y);
  y += 5;

  autoTable(doc, {
    startY: y,
    head: [[
      "Categoria",
      "R$/m²",
      "Previsão",
      "Mínimo (-15%)",
      "Máximo (+15%)",
      "Estudo Real",
      "%"
    ]],
    body: dados.itens.map((item) => [
      item.nome,
      formatarMoeda(item.valorM2Ajustado),
      formatarMoeda(item.valorPrevisao),
      formatarMoeda(item.valorMinimo),
      formatarMoeda(item.valorMaximo),
      formatarMoeda(item.valorEstudoReal),
      `${formatarNumero(item.percentualTotal, 1)}%`
    ]),
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [43, 69, 128], // Azul WG
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [248, 248, 248],
    },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { halign: "right", cellWidth: 22 },
      2: { halign: "right", cellWidth: 26 },
      3: { halign: "right", cellWidth: 26 },
      4: { halign: "right", cellWidth: 26 },
      5: { halign: "right", cellWidth: 26 },
      6: { halign: "right", cellWidth: 16 },
    },
    foot: [[
      "TOTAL",
      "",
      formatarMoeda(dados.itens.reduce((s, i) => s + i.valorPrevisao, 0)),
      formatarMoeda(dados.itens.reduce((s, i) => s + i.valorMinimo, 0)),
      formatarMoeda(dados.itens.reduce((s, i) => s + i.valorMaximo, 0)),
      formatarMoeda(dados.valorTotal),
      "100%"
    ]],
    footStyles: {
      fillColor: [43, 69, 128],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
  });

  // Observações
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable?.finalY || y + 100;

  if (dados.observacoes) {
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    doc.text("Observações:", 14, finalY + 10);
    doc.setFont(undefined, "normal");
    doc.text(dados.observacoes, 14, finalY + 18, { maxWidth: 180 });
  }

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("WG Easy - Sistema de Gestão | Grupo WG Almeida", 14, pageHeight - 10);
  doc.text("Este documento é uma estimativa e pode sofrer alterações.", 14, pageHeight - 5);

  // Salvar
  const nomeArquivo = `EVF-${dados.titulo.replace(/[^a-zA-Z0-9]/g, "-")}-${dataExportacao.toISOString().split("T")[0]}.pdf`;
  doc.save(nomeArquivo);
}

/**
 * Exporta o estudo EVF para Excel
 */
export function exportarEVFParaExcel(dados: DadosExportacaoEVF): void {
  const dataExportacao = dados.dataExportacao || new Date();

  // Dados para a planilha
  const dadosExcel = dados.itens.map((item) => ({
    "Categoria": item.nome,
    "R$/m² Base": item.valorM2Base,
    "R$/m² Ajustado": item.valorM2Ajustado,
    "Valor Previsão": item.valorPrevisao,
    "Valor Mínimo (-15%)": item.valorMinimo,
    "Valor Máximo (+15%)": item.valorMaximo,
    "Valor Estudo Real": item.valorEstudoReal,
    "% do Total": item.percentualTotal,
  }));

  // Adicionar linha de total
  dadosExcel.push({
    "Categoria": "TOTAL",
    "R$/m² Base": dados.itens.reduce((s, i) => s + i.valorM2Base, 0),
    "R$/m² Ajustado": dados.itens.reduce((s, i) => s + i.valorM2Ajustado, 0),
    "Valor Previsão": dados.itens.reduce((s, i) => s + i.valorPrevisao, 0),
    "Valor Mínimo (-15%)": dados.itens.reduce((s, i) => s + i.valorMinimo, 0),
    "Valor Máximo (+15%)": dados.itens.reduce((s, i) => s + i.valorMaximo, 0),
    "Valor Estudo Real": dados.valorTotal,
    "% do Total": 100,
  });

  // Criar planilha de categorias
  const worksheetCategorias = XLSX.utils.json_to_sheet(dadosExcel);

  // Criar planilha de resumo
  const resumo = [
    ["ESTUDO DE VIABILIDADE FINANCEIRA"],
    [],
    ["Título", dados.titulo],
    ["Cliente", dados.cliente || "-"],
    ["Metragem Total", `${dados.metragem} m²`],
    ["Padrão de Acabamento", PADRAO_LABELS[dados.padrao].label],
    [],
    ["VALORES"],
    ["Valor Total", dados.valorTotal],
    ["Valor por m²", dados.valorM2Medio],
    [],
    ["Observações", dados.observacoes || "-"],
    [],
    ["Exportado em", dataExportacao.toLocaleString("pt-BR")],
  ];
  const worksheetResumo = XLSX.utils.aoa_to_sheet(resumo);

  // Criar workbook e adicionar planilhas
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheetResumo, "Resumo");
  XLSX.utils.book_append_sheet(workbook, worksheetCategorias, "Categorias");

  // Ajustar largura das colunas
  worksheetCategorias["!cols"] = [
    { wch: 30 }, // Categoria
    { wch: 12 }, // R$/m² Base
    { wch: 14 }, // R$/m² Ajustado
    { wch: 16 }, // Valor Previsão
    { wch: 18 }, // Valor Mínimo
    { wch: 18 }, // Valor Máximo
    { wch: 18 }, // Valor Estudo Real
    { wch: 12 }, // % do Total
  ];

  worksheetResumo["!cols"] = [
    { wch: 25 },
    { wch: 40 },
  ];

  // Salvar arquivo
  const nomeArquivo = `EVF-${dados.titulo.replace(/[^a-zA-Z0-9]/g, "-")}-${dataExportacao.toISOString().split("T")[0]}.xlsx`;
  XLSX.writeFile(workbook, nomeArquivo);
}

/**
 * Exporta apenas a tabela de categorias para Excel (simples)
 */
export function exportarCategoriasEVFParaExcel(
  itens: EVFItem[],
  titulo: string = "EVF"
): void {
  const dataExportacao = new Date();

  const dados = itens.map((item) => ({
    "Categoria": item.nome,
    "R$/m² Ajustado": item.valorM2Ajustado,
    "Valor Previsão": item.valorPrevisao,
    "Valor Estudo Real": item.valorEstudoReal,
    "% do Total": item.percentualTotal,
  }));

  const worksheet = XLSX.utils.json_to_sheet(dados);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Categorias");

  worksheet["!cols"] = [
    { wch: 30 },
    { wch: 14 },
    { wch: 16 },
    { wch: 18 },
    { wch: 12 },
  ];

  const nomeArquivo = `${titulo}-Categorias-${dataExportacao.toISOString().split("T")[0]}.xlsx`;
  XLSX.writeFile(workbook, nomeArquivo);
}
