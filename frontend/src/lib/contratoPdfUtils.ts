// ============================================================
// UTILIDADES: Geração de PDF de Contratos
// Sistema WG Easy - Grupo WG Almeida
// ============================================================

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { ContratoCompleto, ContratoItem } from "@/types/contratos";
import {
  getUnidadeNegocioLabel,
  getStatusContratoLabel,
  formatarData,
  formatarValor,
} from "@/types/contratos";

/**
 * Gera PDF do contrato com timbrado da empresa
 */
export async function gerarContratoPDF(
  contrato: ContratoCompleto,
  itens: ContratoItem[]
) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;

  // Adicionar timbrado PREENCHENDO A PÁGINA INTEIRA
  try {
    const img = new Image();
    img.src = "/timbrado-wg.png";

    await new Promise((resolve, reject) => {
      img.onload = () => {
        // Calcular dimensões para preencher a página inteira (edge-to-edge)
        const imgWidth = pageWidth; // Largura total da página (sem margens)
        const imgHeight = (img.height * imgWidth) / img.width;

        // Adicionar imagem de ponta a ponta (x=0, y=0)
        doc.addImage(img, "PNG", 0, 0, imgWidth, imgHeight);
        resolve(true);
      };
      img.onerror = reject;
    });
  } catch (error) {
    console.warn("Não foi possível carregar o timbrado:", error);
  }

  // Posição inicial do conteúdo (após o timbrado)
  let yPos = 38;

  // Título do contrato
  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(46, 46, 46);
  doc.text("CONTRATO DE PRESTAÇÃO DE SERVIÇOS", pageWidth / 2, yPos, {
    align: "center",
  });

  yPos += 8;

  // Número do contrato
  if (contrato.numero) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(242, 92, 38);
    doc.text(`Contrato Nº: ${contrato.numero}`, pageWidth / 2, yPos, {
      align: "center",
    });
    yPos += 6;
  }

  // Data de emissão
  const dataEmissao = new Date(contrato.created_at);
  const dataFormatada = dataEmissao.toLocaleDateString("pt-BR");
  const horaFormatada = dataEmissao.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Emitido em: ${dataFormatada} às ${horaFormatada}`,
    pageWidth / 2,
    yPos,
    { align: "center" }
  );
  yPos += 6;

  // Status do contrato
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(242, 92, 38);
  doc.text(
    `Status: ${getStatusContratoLabel(contrato.status)}`,
    pageWidth / 2,
    yPos,
    { align: "center" }
  );
  yPos += 8;

  // CONTRATANTE / CONTRATADO (cards centralizados)
  const infoBoxWidth = pageWidth - margin * 2;
  const infoBoxPadding = 8;
  const infoLineHeight = 4.5;

  const contratanteDados = [
    contrato.cliente_nome || contrato.cliente?.nome
      ? `Nome: ${contrato.cliente_nome || contrato.cliente?.nome}`
      : "Nome: N/A",
    contrato.cliente?.email ? `E-mail: ${contrato.cliente.email}` : null,
    contrato.cliente?.telefone ? `Telefone: ${contrato.cliente.telefone}` : null,
  ].filter(Boolean) as string[];

  const contratadoDados = [
    "Grupo WG Almeida",
    `Unidade: ${getUnidadeNegocioLabel(contrato.unidade_negocio)}`,
    "Atendimento: atendimento@wgalmeida.com.br",
  ];

  const blocoAltura = (conteudo: string[]) =>
    infoBoxPadding * 2 + 6 + conteudo.length * infoLineHeight + 2;

  const infoBoxHeight = Math.max(
    blocoAltura(contratanteDados),
    blocoAltura(contratadoDados)
  );

  doc.setFillColor(246, 246, 246);
  doc.setDrawColor(225, 225, 225);
  doc.roundedRect(margin, yPos, infoBoxWidth, infoBoxHeight, 3, 3, "FD");

  const colLeftCenter = margin + infoBoxWidth * 0.25;
  const colRightCenter = margin + infoBoxWidth * 0.75;
  const linhaDivisorX = margin + infoBoxWidth / 2;

  doc.setDrawColor(225, 225, 225);
  doc.line(
    linhaDivisorX,
    yPos + 4,
    linhaDivisorX,
    yPos + infoBoxHeight - 4
  );

  const desenharColuna = (titulo: string, dados: string[], centerX: number) => {
    let colunaY = yPos + infoBoxPadding;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(242, 92, 38);
    doc.text(titulo, centerX, colunaY, { align: "center" });

    colunaY += 6;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(46, 46, 46);

    dados.forEach((texto) => {
      doc.text(texto, centerX, colunaY, { align: "center" });
      colunaY += infoLineHeight;
    });
  };

  desenharColuna("CONTRATANTE", contratanteDados, colLeftCenter);
  desenharColuna("CONTRATADO", contratadoDados, colRightCenter);

  yPos += infoBoxHeight + 10;

  // OBJETO DO CONTRATO
  if (contrato.descricao) {
    // Verificar se precisa de nova página
    if (yPos > pageHeight - 80) {
      doc.addPage();
      yPos = margin + 15;
    }

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(242, 92, 38);
    doc.text("OBJETO DO CONTRATO", margin, yPos);
    yPos += 6;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(46, 46, 46);
    const descricaoLines = doc.splitTextToSize(
      contrato.descricao,
      pageWidth - margin * 2
    );
    doc.text(descricaoLines, margin, yPos);
    yPos += descricaoLines.length * 5 + 10;
  }

  // ITENS DO CONTRATO
  if (itens && itens.length > 0) {
    // Verificar se precisa de nova página
    if (yPos > pageHeight - 80) {
      doc.addPage();
      yPos = margin + 15;
    }

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(242, 92, 38);
    doc.text("ITENS DO CONTRATO", margin, yPos);
    yPos += 6;

    // Separar itens por tipo
    const itensMaoObra = itens.filter((item) => item.tipo === "mao_obra");
    const itensMateriais = itens.filter((item) => item.tipo === "material");

    // Função auxiliar para criar tabela de itens
    const criarTabelaItens = (
      itensArray: ContratoItem[],
      titulo: string,
      cor: [number, number, number]
    ) => {
      if (itensArray.length === 0) return;

      const tableData = itensArray.map((item) => {
        const unitario = item.valor_unitario ?? item.preco_unitario ?? 0;
        const subtotal =
          item.valor_total ??
          item.preco_total ??
          unitario * (item.quantidade || 0);
        const producao =
          item.producao_diaria
            ? `${item.producao_diaria.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })} ${(item.unidade || "un")}/dia`
            : "—";
        const dias =
          item.dias_estimados ??
          (item.producao_diaria && item.producao_diaria > 0
            ? (item.quantidade || 0) / item.producao_diaria
            : null);

        return [
          item.descricao,
          item.unidade || "un",
          item.quantidade.toString(),
          producao,
          dias
            ? `${dias.toLocaleString("pt-BR", {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              })}`
            : "—",
          formatarValor(unitario),
          formatarValor(subtotal),
        ];
      });

      // Calcular total
      const total = itensArray.reduce((acc, item) => {
        const subtotal =
          item.valor_total ??
          item.preco_total ??
          (item.valor_unitario ?? item.preco_unitario ?? 0) *
            (item.quantidade || 0);
        return acc + subtotal;
      }, 0);

      autoTable(doc, {
        startY: yPos,
        head: [[titulo, "Un.", "Qtd", "Prod./dia", "Dias", "Valor Unit.", "Subtotal"]],
        body: tableData,
        foot: [["SUBTOTAL " + titulo.toUpperCase(), "", "", "", "", "", formatarValor(total)]],
        theme: "striped",
        headStyles: {
          fillColor: cor,
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: "bold",
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [46, 46, 46],
        },
        footStyles: {
          fillColor: cor,
          textColor: [255, 255, 255],
          fontSize: 8,
          fontStyle: "bold",
          halign: "right",
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        columnStyles: {
          0: { cellWidth: 55 },
          1: { cellWidth: 15 },
          2: { cellWidth: 18 },
          3: { cellWidth: 30 },
          4: { cellWidth: 20 },
          5: { cellWidth: 30 },
          6: { cellWidth: 30 },
        },
        margin: { left: margin, right: margin },
      });

      yPos = ((doc as any).lastAutoTable?.finalY ?? 0) + 8;
    };

    // Criar tabela de Mão de Obra
    if (itensMaoObra.length > 0) {
      criarTabelaItens(itensMaoObra, "Mão de Obra", [59, 130, 246]);
    }

    // Criar tabela de Materiais
    if (itensMateriais.length > 0) {
      criarTabelaItens(itensMateriais, "Materiais", [245, 158, 11]);
    }

    yPos += 5;
  }

  // VALORES TOTAIS
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(242, 92, 38);
  doc.text("VALORES", margin, yPos);
  yPos += 6;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(46, 46, 46);

  if (contrato.valor_mao_obra > 0) {
    doc.text(`Mão de Obra: ${formatarValor(contrato.valor_mao_obra)}`, margin, yPos);
    yPos += 5;
  }

  if (contrato.valor_materiais > 0) {
    doc.text(`Materiais: ${formatarValor(contrato.valor_materiais)}`, margin, yPos);
    yPos += 8;
  }

  // VALOR TOTAL com fundo laranja e texto branco
  const valorTotalTexto = `VALOR TOTAL: ${formatarValor(contrato.valor_total)}`;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");

  // Medir largura do texto
  const textWidth = doc.getTextWidth(valorTotalTexto);
  const paddingH = 4;
  const paddingV = 3;
  const boxHeight = 8;

  // Desenhar retângulo laranja de fundo
  doc.setFillColor(242, 92, 38);
  doc.rect(
    margin - paddingH,
    yPos - boxHeight + paddingV,
    textWidth + paddingH * 2,
    boxHeight,
    "F"
  );

  // Texto branco por cima
  doc.setTextColor(255, 255, 255);
  doc.text(valorTotalTexto, margin, yPos);

  yPos += 10;

  // PRAZOS
  if (contrato.data_inicio || contrato.data_previsao_termino) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(242, 92, 38);
    doc.text("PRAZOS DE EXECUÇÃO", margin, yPos);
    yPos += 6;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(46, 46, 46);

    if (contrato.data_inicio) {
      doc.text(`Data de Início: ${formatarData(contrato.data_inicio)}`, margin, yPos);
      yPos += 5;
    }

    if (contrato.data_previsao_termino) {
      doc.text(
        `Previsão de Término: ${formatarData(contrato.data_previsao_termino)}`,
        margin,
        yPos
      );
      yPos += 5;
    }

    if (contrato.prazo_entrega_dias) {
      doc.text(`Prazo: ${contrato.prazo_entrega_dias} dias úteis`, margin, yPos);
      yPos += 8;
    }

    yPos += 3;
  }

  // CONDIÇÕES CONTRATUAIS
  if (contrato.condicoes_contratuais) {
    // Verificar se precisa de nova página
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = margin + 15;
    }

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(242, 92, 38);
    doc.text("CONDIÇÕES CONTRATUAIS", margin, yPos);
    yPos += 6;

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(46, 46, 46);
    const condicoesLines = doc.splitTextToSize(
      contrato.condicoes_contratuais,
      pageWidth - margin * 2
    );
    doc.text(condicoesLines, margin, yPos);
    yPos += condicoesLines.length * 4 + 8;
  }

  // OBSERVAÇÕES
  if (contrato.observacoes) {
    // Verificar se precisa de nova página
    if (yPos > pageHeight - 50) {
      doc.addPage();
      yPos = margin + 15;
    }

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(242, 92, 38);
    doc.text("OBSERVAÇÕES", margin, yPos);
    yPos += 6;

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(46, 46, 46);
    const observacoesLines = doc.splitTextToSize(
      contrato.observacoes,
      pageWidth - margin * 2
    );
    doc.text(observacoesLines, margin, yPos);
    yPos += observacoesLines.length * 4 + 10;
  }

  // ASSINATURAS (se houver)
  if (
    contrato.status === "ativo" ||
    contrato.status === "concluido" ||
    contrato.assinatura_cliente_base64 ||
    contrato.assinatura_responsavel_base64
  ) {
    // Verificar se precisa de nova página
    if (yPos > pageHeight - 80) {
      doc.addPage();
      yPos = margin + 15;
    }

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(242, 92, 38);
    doc.text("ASSINATURAS", margin, yPos);
    yPos += 10;

    const assinaturaY = yPos;
    const assinaturaWidth = 60;
    const assinaturaHeight = 30;

    // Assinatura Cliente (esquerda)
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);

    // Linha para assinatura cliente
    doc.line(margin, assinaturaY + assinaturaHeight, margin + assinaturaWidth, assinaturaY + assinaturaHeight);
    doc.text("CONTRATANTE", margin, assinaturaY + assinaturaHeight + 5);
    if (contrato.cliente_nome) {
      doc.text(contrato.cliente_nome, margin, assinaturaY + assinaturaHeight + 9);
    }

    // Assinatura Responsável (direita)
    const responsavelX = pageWidth - margin - assinaturaWidth;
    doc.line(responsavelX, assinaturaY + assinaturaHeight, responsavelX + assinaturaWidth, assinaturaY + assinaturaHeight);
    doc.text("CONTRATADO", responsavelX, assinaturaY + assinaturaHeight + 5);
    doc.text("Grupo WG Almeida", responsavelX, assinaturaY + assinaturaHeight + 9);

    if (contrato.data_assinatura) {
      doc.setFontSize(7);
      doc.text(
        `Assinado em: ${formatarData(contrato.data_assinatura)}`,
        pageWidth / 2,
        assinaturaY + assinaturaHeight + 14,
        { align: "center" }
      );
    }
  }

  // Rodapé
  const footerY = pageHeight - 15;
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text(
    "Este contrato é válido e vinculante para ambas as partes.",
    pageWidth / 2,
    footerY,
    { align: "center" }
  );
  doc.text(
    "Grupo WG Almeida - Arquitetura, Engenharia e Marcenaria",
    pageWidth / 2,
    footerY + 4,
    { align: "center" }
  );

  // Salvar PDF
  const fileName = `Contrato_${contrato.numero || contrato.id}_${new Date().getTime()}.pdf`;
  doc.save(fileName);
}
