// src/utils/gerarPdfObra.ts

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Obra {
  cliente: string;
  endereco: string;
  status: string;
  previsao_entrega: string;
}

export function gerarPdfObra(obra: Obra, arquivos: string[], assinatura?: string) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Ficha Técnica da Obra", 14, 20);

  doc.setFontSize(12);
  doc.text(`Cliente: ${obra.cliente}`, 14, 30);
  doc.text(`Endereço: ${obra.endereco}`, 14, 38);
  doc.text(`Status: ${obra.status}`, 14, 46);
  doc.text(`Previsão de Entrega: ${obra.previsao_entrega}`, 14, 54);

  doc.setFontSize(14);
  doc.text("Arquivos Anexos:", 14, 70);
  doc.setFontSize(11);

  let y = 76;
  arquivos.forEach((file, index) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.text(`- ${file}`, 16, y);
    y += 6;
  });

  if (assinatura) {
    doc.addPage();
    doc.setFontSize(14);
    doc.text("Assinatura Digital:", 14, 30);
    doc.addImage(assinatura, "PNG", 14, 40, 160, 60);
  }

  doc.save("ficha_obra.pdf");
}
