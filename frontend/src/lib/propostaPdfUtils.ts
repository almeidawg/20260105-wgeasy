// ============================================================
// UTILIDADES: Geração de PDF de Propostas Comerciais - NOVO LAYOUT
// Sistema WG Easy - Grupo WG Almeida
// Baseado no layout "Ambientes.pdf" - Organizado por Núcleos
// ============================================================

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { PropostaCompleta, PropostaItem } from "@/types/propostas";
import { getFormaPagamentoLabel } from "@/types/propostas";
import { listarAmbientesPorProposta, type Ambiente } from "./ambientesApi";
import {
  organizarItensPorNucleo,
  calcularSubtotaisPorNucleo,
  hexToRgb,
  CORES_NUCLEOS,
  TEXTOS_SOBRE_COR,
  TEXTO_INTRODUTORIO,
  sanitizarTextoPDF,
  type ItensPorNucleo,
  type SubtotaisPorNucleo,
} from "./pdfHelpers";
import { listarEmpresas, listarContasPorEmpresa } from "./empresasApi";
import {
  formatarBanco,
  formatarAgencia,
  formatarConta,
  getTipoContaLabel,
  getTipoChavePixLabel,
  formatarChavePix,
  formatarCNPJ,
} from "@/types/empresas";

/**
 * Gera código da proposta no formato ENG/YYYYMMDD#XXX-NOME
 */
function gerarCodigoProposta(proposta: PropostaCompleta): string {
  const nucleo = proposta.nucleo?.substring(0, 3).toUpperCase() || "ENG";
  const data = new Date();
  const dataStr = `${data.getFullYear()}${String(data.getMonth() + 1).padStart(2, "0")}${String(data.getDate()).padStart(2, "0")}`;
  const sequencial = proposta.numero || "001";
  const nomeCliente = proposta.cliente_nome
    ? proposta.cliente_nome.split(" ").slice(0, 2).join(" ").toUpperCase()
    : "CLIENTE";
  return `${nucleo}/${dataStr}#${sequencial}-${nomeCliente}`;
}

/**
 * Gera PDF da proposta comercial com novo layout por núcleos
 */
export async function gerarPropostaPDF(proposta: PropostaCompleta) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const marginRight = 25; // Margem direita maior para não sobrepor logos

  let yPos = margin;

  // Variável para armazenar a imagem do timbrado
  let timbradoImg: HTMLImageElement | null = null;
  let timbradoHeight = 0;

  // ============================================================
  // 1. TIMBRADO
  // ============================================================
  try {
    const img = new Image();
    img.src = "/timbrado-wg.png";

    await new Promise((resolve, reject) => {
      img.onload = () => {
        const imgWidth = pageWidth;
        const imgHeight = (img.height * imgWidth) / img.width;
        doc.addImage(img, "PNG", 0, 0, imgWidth, imgHeight);
        timbradoImg = img;
        timbradoHeight = imgHeight;
        resolve(true);
      };
      img.onerror = reject;
    });
  } catch (error) {
    console.warn("Não foi possível carregar o timbrado:", error);
  }

  // Função para adicionar timbrado em novas páginas
  function adicionarTimbrado() {
    if (timbradoImg) {
      doc.addImage(timbradoImg, "PNG", 0, 0, pageWidth, timbradoHeight);
    }
  }

  yPos = 38;

  // ============================================================
  // 2. TÍTULO
  // ============================================================
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(46, 46, 46);
  doc.text("PROPOSTA COMERCIAL", pageWidth / 2, yPos, { align: "center" });
  yPos += 5;

  // Data da proposta logo abaixo do título
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  const dataAtual = new Date().toLocaleDateString("pt-BR");
  doc.text(`Proposta comercial gerada em ${dataAtual}`, pageWidth / 2, yPos, { align: "center" });
  yPos += 8;

  // ============================================================
  // 3. CLIENTE E OBJETO (Lado a lado)
  // ============================================================
  const colMiddle = pageWidth / 2;
  const clienteYStart = yPos;
  const contentWidth = pageWidth - margin - marginRight; // Largura útil considerando margem direita

  // URL base do sistema (para botões de aprovação)
  const baseUrl = window.location.origin;
  const propostaId = proposta.id;

  // Gerar código da proposta
  const codigoProposta = gerarCodigoProposta(proposta);

  // CLIENTE (esquerda)
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(242, 92, 38);
  doc.text("CLIENTE", margin, yPos);
  yPos += 6;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(46, 46, 46);
  doc.text(sanitizarTextoPDF(`Nome: ${proposta.cliente_nome || "N/A"}`), margin, yPos);
  yPos += 5;

  // Código da proposta gerado automaticamente
  doc.text(sanitizarTextoPDF(`Proposta: ${codigoProposta}`), margin, yPos);
  yPos += 5;

  if (proposta.validade_dias) {
    doc.text(sanitizarTextoPDF(`Validade: ${proposta.validade_dias} dias`), margin, yPos);
    yPos += 4;
  }

  // BOTÕES DE APROVAÇÃO (direita)
  let yPosObjeto = clienteYStart;

  // Botões de Aprovar e Recusar
  const btnWidth = 38;
  const btnHeight = 8;
  const btnGap = 4;

  // Botão APROVAR PROPOSTA (verde da marca)
  doc.setFillColor(94, 155, 148);
  doc.rect(colMiddle, yPosObjeto, btnWidth, btnHeight, "F");
  doc.setFontSize(6);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("APROVAR PROPOSTA", colMiddle + btnWidth / 2, yPosObjeto + 5.5, { align: "center" });
  doc.link(colMiddle, yPosObjeto, btnWidth, btnHeight, {
    url: `${baseUrl}/proposta/${propostaId}/aprovar`,
  });

  // Botão RECUSAR (cinza escuro)
  doc.setFillColor(80, 80, 80);
  doc.rect(colMiddle + btnWidth + btnGap, yPosObjeto, btnWidth, btnHeight, "F");
  doc.setFontSize(6);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("RECUSAR", colMiddle + btnWidth + btnGap + btnWidth / 2, yPosObjeto + 5.5, { align: "center" });
  doc.link(colMiddle + btnWidth + btnGap, yPosObjeto, btnWidth, btnHeight, {
    url: `${baseUrl}/proposta/${propostaId}/recusar`,
  });

  yPosObjeto += btnHeight + 4;

  yPos = Math.max(yPos, yPosObjeto) + 6;

  // ============================================================
  // 4. TEXTO INTRODUTÓRIO
  // ============================================================
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  const introLines = doc.splitTextToSize(sanitizarTextoPDF(TEXTO_INTRODUTORIO), contentWidth);
  doc.text(introLines, margin, yPos);
  yPos += introLines.length * 3.5 + 10;

  // Verificar se precisa de nova página
  if (yPos > pageHeight - 60) {
    doc.addPage();
    adicionarTimbrado();
    yPos = 40;
  }

  // ============================================================
  // 5. SEÇÃO AMBIENTES (se houver)
  // ============================================================
  let ambientes: Ambiente[] = [];
  try {
    ambientes = await listarAmbientesPorProposta(proposta.id);

    if (ambientes && ambientes.length > 0) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(46, 46, 46);
      doc.text("AMBIENTES", margin, yPos);
      yPos += 6;

      const ambientesData = ambientes.map((amb) => [
        sanitizarTextoPDF(amb.nome),
        `${amb.largura.toFixed(2)} x ${amb.comprimento.toFixed(2)}m`,
        `${amb.pe_direito.toFixed(2)}m`,
        `${amb.area_piso.toFixed(2)}m2`,
        `${amb.area_parede.toFixed(2)}m2`,
        `${amb.perimetro.toFixed(2)}ml`,
      ]);

      const totais = ambientes.reduce(
        (acc, amb) => ({
          piso: acc.piso + amb.area_piso,
          parede: acc.parede + amb.area_parede,
          perimetro: acc.perimetro + amb.perimetro,
        }),
        { piso: 0, parede: 0, perimetro: 0 }
      );

      autoTable(doc, {
        startY: yPos,
        head: [["Ambiente", "Dimensoes", "Pe-direito", "Piso", "Parede", "Perimetro"]],
        body: ambientesData,
        foot: [[
          "TOTAIS",
          "",
          "",
          `${totais.piso.toFixed(2)}m2`,
          `${totais.parede.toFixed(2)}m2`,
          `${totais.perimetro.toFixed(2)}ml`,
        ]],
        theme: "grid",
        headStyles: {
          fillColor: [150, 150, 150],
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: "bold",
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [46, 46, 46],
        },
        footStyles: {
          fillColor: [150, 150, 150],
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: "bold",
        },
        margin: { left: margin, right: marginRight },
      });

      yPos = ((doc as any).lastAutoTable?.finalY ?? 0) + 10;

      // Verificar se precisa de nova página
      if (yPos > pageHeight - 60) {
        doc.addPage();
        adicionarTimbrado();
        yPos = 40;
      }
    }
  } catch (error) {
    console.error("Erro ao carregar ambientes:", error);
  }

  // ============================================================
  // 6. ORGANIZAR ITENS POR NÚCLEO
  // ============================================================
  const itensPorNucleo = organizarItensPorNucleo(proposta.itens, proposta.nucleo ?? undefined);
  const subtotais = calcularSubtotaisPorNucleo(itensPorNucleo);

  // ============================================================
  // 7. FUNÇÃO AUXILIAR: Gerar seção de núcleo
  // ============================================================
  function gerarSecaoNucleo(
    titulo: string,
    cor: string,
    itens: PropostaItem[],
    subtotal: number,
    textoSobreCor?: string,
    nomeCorExibicao?: string
  ) {
    if (itens.length === 0) return;

    // Verificar se precisa de nova página
    if (yPos > pageHeight - 80) {
      doc.addPage();
      adicionarTimbrado();
      yPos = 40;
    }

    const [r, g, b] = hexToRgb(cor);

    // Título do núcleo com código da cor
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(r, g, b);
    doc.text(sanitizarTextoPDF(titulo), margin, yPos);

    // Código da cor ao lado do título
    if (nomeCorExibicao) {
      const tituloWidth = doc.getTextWidth(sanitizarTextoPDF(titulo));
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(120, 120, 120);
      doc.text(sanitizarTextoPDF(`  ${nomeCorExibicao} ${cor}`), margin + tituloWidth, yPos);
    }
    yPos += 6;

    // Texto "sobre a cor"
    if (textoSobreCor) {
      doc.setFontSize(7);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(120, 120, 120);
      const textoLines = doc.splitTextToSize(sanitizarTextoPDF(textoSobreCor), contentWidth);
      doc.text(textoLines, margin, yPos);
      yPos += textoLines.length * 3 + 6;
    }

    // Tabela de itens
    const tableData = itens.map((item) => [
      item.codigo || "-",
      sanitizarTextoPDF(item.nome),
      item.unidade || "un",
      item.quantidade.toString(),
      proposta.exibir_valores
        ? new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(item.valor_unitario)
        : "-",
      proposta.exibir_valores
        ? new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(item.valor_subtotal)
        : "-",
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [["Codigo", "Item", "Un.", "Qtd", "Valor Unit.", "Subtotal"]],
      body: tableData,
      theme: "striped",
      headStyles: {
        fillColor: [r, g, b],
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: "bold",
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [46, 46, 46],
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { left: margin, right: marginRight },
    });

    yPos = ((doc as any).lastAutoTable?.finalY ?? 0) + 4;

    // Subtotal
    if (proposta.exibir_valores && subtotal > 0) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal"); // Mais discreto
      doc.setTextColor(r, g, b);
      const subtotalTexto = `Subtotal: ${new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(subtotal)}`;
      doc.text(subtotalTexto, pageWidth - marginRight, yPos, { align: "right" });
      yPos += 10;
    }
  }

  // ============================================================
  // 8. GERAR NÚCLEO ARQUITETURA
  // ============================================================
  gerarSecaoNucleo(
    "NÚCLEO ARQUITETURA",
    CORES_NUCLEOS.arquitetura,
    itensPorNucleo.arquitetura as PropostaItem[],
    subtotais.arquitetura,
    TEXTOS_SOBRE_COR.arquitetura,
    "Verde Arquitetura"
  );

  // ============================================================
  // 9. GERAR NÚCLEO ENGENHARIA (Mão de Obra + Materiais)
  // ============================================================
  if (
    itensPorNucleo.engenharia.maoDeObra.length > 0 ||
    itensPorNucleo.engenharia.materiais.length > 0
  ) {
    // Verificar se precisa de nova página
    if (yPos > pageHeight - 80) {
      doc.addPage();
      adicionarTimbrado();
      yPos = 40;
    }

    const [r, g, b] = hexToRgb(CORES_NUCLEOS.engenharia);

    // Título do núcleo com código da cor
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(r, g, b);
    doc.text("NUCLEO ENGENHARIA", margin, yPos);

    // Código da cor ao lado do título
    const tituloEngWidth = doc.getTextWidth("NUCLEO ENGENHARIA");
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    doc.text(`  Azul Engenharia ${CORES_NUCLEOS.engenharia}`, margin + tituloEngWidth, yPos);
    yPos += 4; // Subir mais perto do título (era 6)

    // Texto "sobre a cor" - justificado com margem direita maior
    doc.setFontSize(7);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(120, 120, 120);
    const textoEngenhariaWidth = contentWidth - 8; // Margem direita aumentada (2 letras)
    const textoEngenhariaSanitizado = sanitizarTextoPDF(TEXTOS_SOBRE_COR.engenharia);
    const textoLines = doc.splitTextToSize(
      textoEngenhariaSanitizado,
      textoEngenhariaWidth
    );
    // Texto justificado manualmente (jsPDF não tem justify nativo)
    textoLines.forEach((line: string, index: number) => {
      if (index < textoLines.length - 1) {
        // Todas as linhas exceto a última: justificado
        const words = line.split(' ');
        if (words.length > 1) {
          const lineWidth = textoEngenhariaWidth;
          const textWidth = doc.getTextWidth(line);
          const spaceWidth = (lineWidth - textWidth + doc.getTextWidth(' ') * (words.length - 1)) / (words.length - 1);
          let xOffset = margin;
          words.forEach((word: string, wordIndex: number) => {
            doc.text(word, xOffset, yPos + index * 3);
            xOffset += doc.getTextWidth(word) + spaceWidth;
          });
        } else {
          doc.text(line, margin, yPos + index * 3);
        }
      } else {
        // Última linha: alinhada à esquerda
        doc.text(line, margin, yPos + index * 3);
      }
    });
    yPos += textoLines.length * 3 + 6; // Reduzido de 8 para 6

    // Secao MAO DE OBRA
    if (itensPorNucleo.engenharia.maoDeObra.length > 0) {
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(r, g, b);
      doc.text("MAO DE OBRA", margin, yPos);
      yPos += 5;

      const tableData = (itensPorNucleo.engenharia.maoDeObra as PropostaItem[]).map((item) => [
        item.codigo || "-",
        sanitizarTextoPDF(item.nome),
        item.unidade || "un",
        item.quantidade.toString(),
        proposta.exibir_valores
          ? new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(item.valor_unitario)
          : "-",
        proposta.exibir_valores
          ? new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(item.valor_subtotal)
          : "-",
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [["Codigo", "Item", "Un.", "Qtd", "Valor Unit.", "Subtotal"]],
        body: tableData,
        theme: "striped",
        headStyles: {
          fillColor: [r, g, b],
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: "bold",
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [46, 46, 46],
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { left: margin, right: marginRight },
      });

      yPos = ((doc as any).lastAutoTable?.finalY ?? 0) + 4;

      // Subtotal Mao de Obra (mais discreto)
      if (proposta.exibir_valores && subtotais.engenharia.maoDeObra > 0) {
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(r, g, b);
        doc.text(
          `Subtotal Mao de Obra: ${new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(subtotais.engenharia.maoDeObra)}`,
          pageWidth - marginRight,
          yPos,
          { align: "right" }
        );
        yPos += 8;
      }
    }

    // Secao MATERIAIS
    if (itensPorNucleo.engenharia.materiais.length > 0) {
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(r, g, b);
      doc.text("MATERIAIS", margin, yPos);
      yPos += 5;

      const tableData = (itensPorNucleo.engenharia.materiais as PropostaItem[]).map((item) => [
        item.codigo || "-",
        sanitizarTextoPDF(item.nome),
        item.unidade || "un",
        item.quantidade.toString(),
        proposta.exibir_valores
          ? new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(item.valor_unitario)
          : "-",
        proposta.exibir_valores
          ? new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(item.valor_subtotal)
          : "-",
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [["Codigo", "Item", "Un.", "Qtd", "Valor Unit.", "Subtotal"]],
        body: tableData,
        theme: "striped",
        headStyles: {
          fillColor: [r, g, b],
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: "bold",
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [46, 46, 46],
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { left: margin, right: marginRight },
      });

      yPos = ((doc as any).lastAutoTable?.finalY ?? 0) + 4;

      // Subtotal Materiais (mais discreto)
      if (proposta.exibir_valores && subtotais.engenharia.materiais > 0) {
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(r, g, b);
        doc.text(
          `Subtotal Materiais: ${new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(subtotais.engenharia.materiais)}`,
          pageWidth - marginRight,
          yPos,
          { align: "right" }
        );
        yPos += 10;
      }
    }
  }

  // ============================================================
  // 10. GERAR NÚCLEO MARCENARIA
  // ============================================================
  gerarSecaoNucleo(
    "NÚCLEO MARCENARIA",
    CORES_NUCLEOS.marcenaria,
    itensPorNucleo.marcenaria as PropostaItem[],
    subtotais.marcenaria,
    TEXTOS_SOBRE_COR.marcenaria,
    "Marrom Marcenaria"
  );

  // ============================================================
  // 11. GERAR SEÇÃO PRODUTOS
  // ============================================================
  gerarSecaoNucleo(
    "PRODUTOS",
    CORES_NUCLEOS.produtos,
    itensPorNucleo.produtos as PropostaItem[],
    subtotais.produtos,
    TEXTOS_SOBRE_COR.produtos,
    "Laranja WG"
  );

  // ============================================================
  // 12. VALOR TOTAL GLOBAL
  // ============================================================
  if (proposta.exibir_valores) {
    // Verificar se precisa de nova página
    if (yPos > pageHeight - 100) {
      doc.addPage();
      adicionarTimbrado();
      yPos = 40;
    }

    yPos += 10;

    // Fundo cinza claro (mais discreto)
    doc.setFillColor(248, 248, 248);
    doc.rect(margin, yPos - 5, pageWidth - margin - marginRight, 12, "F");

    // Texto VALOR TOTAL GLOBAL (mais discreto - fonte menor e normal)
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    const valorGlobal = `Valor Total Global: ${new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(proposta.valor_total)}`;
    doc.text(valorGlobal, pageWidth / 2, yPos + 3, { align: "center" });
    yPos += 15;

    // Grid de valores por núcleo (2x2) - boxes menores e mais discretos
    const boxWidth = (pageWidth - margin * 3 - marginRight) / 2;
    const boxHeight = 16; // Altura reduzida para todos os boxes
    const gap = 6; // Gap menor

    let boxX = margin;
    let boxY = yPos;

    // Função para desenhar box de núcleo (mais compacto)
    function desenharBoxNucleo(
      titulo: string,
      valor: number,
      cor: string,
      x: number,
      y: number
    ) {
      const [r, g, b] = hexToRgb(cor);

      // Fundo do box
      doc.setFillColor(r, g, b);
      doc.rect(x, y, boxWidth, boxHeight, "F");

      // Título e valor na mesma linha (mais compacto, sem negrito)
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(255, 255, 255);
      const tituloSimples = titulo.replace("\n", " ");
      doc.text(tituloSimples, x + 4, y + 10);

      // Valor na mesma linha (sem negrito - igual à caixa cinza)
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const valorFormatado = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(valor);
      doc.text(valorFormatado, x + boxWidth - 4, y + 10, { align: "right" });
    }

    // BARRA AZUL ENGENHARIA - Logo abaixo do Valor Total Global
    if (subtotais.engenharia.total > 0) {
      const barraHeight = 12;
      const barraWidth = pageWidth - margin - marginRight;
      const [rEng, gEng, bEng] = hexToRgb(CORES_NUCLEOS.engenharia);

      // Fundo azul ocupando toda a largura
      doc.setFillColor(rEng, gEng, bEng);
      doc.rect(margin, boxY, barraWidth, barraHeight, "F");

      // Texto VALOR TOTAL ENGENHARIA
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(255, 255, 255);
      doc.text("VALOR TOTAL ENGENHARIA", margin + 5, boxY + 8);

      // Valor
      const valorEngFormatado = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(subtotais.engenharia.total);
      doc.text(valorEngFormatado, margin + barraWidth - 5, boxY + 8, { align: "right" });

      // BOTÕES ABAIXO DA BARRA AZUL
      const btnBarraWidth = 45;
      const btnBarraHeight = 10;
      const btnBarraGap = 8;
      const btnBarraY = boxY + barraHeight + 5;
      const btnBarraX = margin + barraWidth - btnBarraWidth * 2 - btnBarraGap;

      // Botão APROVAR PROPOSTA (verde da marca)
      doc.setFillColor(94, 155, 148);
      doc.rect(btnBarraX, btnBarraY, btnBarraWidth, btnBarraHeight, "F");
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("APROVAR PROPOSTA", btnBarraX + btnBarraWidth / 2, btnBarraY + 7, { align: "center" });
      doc.link(btnBarraX, btnBarraY, btnBarraWidth, btnBarraHeight, {
        url: `${baseUrl}/proposta/${propostaId}/aprovar`,
      });

      // Botão RECUSAR (cinza escuro)
      doc.setFillColor(80, 80, 80);
      doc.rect(btnBarraX + btnBarraWidth + btnBarraGap, btnBarraY, btnBarraWidth, btnBarraHeight, "F");
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("RECUSAR", btnBarraX + btnBarraWidth + btnBarraGap + btnBarraWidth / 2, btnBarraY + 7, { align: "center" });
      doc.link(btnBarraX + btnBarraWidth + btnBarraGap, btnBarraY, btnBarraWidth, btnBarraHeight, {
        url: `${baseUrl}/proposta/${propostaId}/recusar`,
      });

      boxY = btnBarraY + btnBarraHeight + 10;
    }

    // Arquitetura
    if (subtotais.arquitetura > 0) {
      desenharBoxNucleo(
        "VALOR TOTAL ARQUITETURA",
        subtotais.arquitetura,
        CORES_NUCLEOS.arquitetura,
        boxX,
        boxY
      );
    }

    // Marcenaria (ao lado da arquitetura)
    if (subtotais.marcenaria > 0) {
      desenharBoxNucleo(
        "VALOR TOTAL MARCENARIA",
        subtotais.marcenaria,
        CORES_NUCLEOS.marcenaria,
        boxX + boxWidth + gap,
        boxY
      );
    }

    boxY += boxHeight + gap;

    // Produtos (linha de baixo, esquerda)
    if (subtotais.produtos > 0) {
      desenharBoxNucleo(
        "VALOR TOTAL PRODUTOS",
        subtotais.produtos,
        CORES_NUCLEOS.produtos,
        boxX,
        boxY
      );
    }

    yPos = boxY + boxHeight + 15;
  }

  // ============================================================
  // 13. CONDIÇÕES DE PAGAMENTO
  // ============================================================
  if (proposta.forma_pagamento && proposta.exibir_valores) {
    // Verificar se precisa de nova página
    if (yPos > pageHeight - 80) {
      doc.addPage();
      adicionarTimbrado();
      yPos = 40;
    }

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(46, 46, 46);
    doc.text("CONDICOES DE PAGAMENTO", margin, yPos);
    yPos += 6;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    doc.text(
      `Forma: ${getFormaPagamentoLabel(proposta.forma_pagamento)}`,
      margin,
      yPos
    );
    yPos += 5;

    if (proposta.percentual_entrada && proposta.percentual_entrada > 0) {
      const valorEntrada = (proposta.valor_total * proposta.percentual_entrada) / 100;
      doc.text(
        `Entrada: ${proposta.percentual_entrada}% - ${new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(valorEntrada)}`,
        margin,
        yPos
      );
      yPos += 5;
    }

    if (proposta.numero_parcelas && proposta.numero_parcelas > 0) {
      const valorRestante =
        proposta.valor_total -
        (proposta.percentual_entrada
          ? (proposta.valor_total * proposta.percentual_entrada) / 100
          : 0);
      const valorParcela = valorRestante / proposta.numero_parcelas;
      doc.text(
        `Parcelas: ${proposta.numero_parcelas}x de ${new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(valorParcela)}`,
        margin,
        yPos
      );
      yPos += 5;
    }

    yPos += 5;

    // ============================================================
    // 13.1 DADOS BANCÁRIOS DA ENGENHARIA
    // ============================================================
    try {
      // Buscar empresa de engenharia
      const empresas = await listarEmpresas();
      const empresaEngenharia = empresas.find(
        (e) => e.nucleo_nome?.toLowerCase().includes("engenharia") ||
               e.nome_fantasia?.toLowerCase().includes("engenharia")
      );

      if (empresaEngenharia) {
        const contasEngenharia = await listarContasPorEmpresa(empresaEngenharia.id);
        const contaPadrao = contasEngenharia.find((c) => c.padrao) || contasEngenharia[0];

        if (contaPadrao) {
          yPos += 3;
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(43, 69, 128); // Azul Engenharia
          doc.text("DADOS PARA PAGAMENTO", margin, yPos);
          yPos += 5;

          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(60, 60, 60);
          doc.text(sanitizarTextoPDF(`Favorecido: ${empresaEngenharia.razao_social}`), margin, yPos);
          yPos += 4;
          doc.text(`CNPJ: ${formatarCNPJ(empresaEngenharia.cnpj)}`, margin, yPos);
          yPos += 4;
          doc.text(sanitizarTextoPDF(`Banco: ${formatarBanco(contaPadrao.banco_codigo, contaPadrao.banco_nome)}`), margin, yPos);
          yPos += 4;
          doc.text(`Agencia: ${formatarAgencia(contaPadrao.agencia, contaPadrao.agencia_digito)}`, margin, yPos);
          yPos += 4;
          doc.text(sanitizarTextoPDF(`Conta: ${formatarConta(contaPadrao.conta, contaPadrao.conta_digito)} (${getTipoContaLabel(contaPadrao.tipo_conta)})`), margin, yPos);
          yPos += 4;

          if (contaPadrao.pix_tipo && contaPadrao.pix_chave) {
            doc.text(sanitizarTextoPDF(`PIX (${getTipoChavePixLabel(contaPadrao.pix_tipo)}): ${formatarChavePix(contaPadrao.pix_tipo, contaPadrao.pix_chave)}`), margin, yPos);
            yPos += 4;
          }

          yPos += 3;
        }
      }
    } catch (error) {
      console.error("Erro ao buscar dados bancários da engenharia:", error);
    }
  }

  // Prazo de Execucao
  if (proposta.prazo_execucao_dias) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(46, 46, 46);
    doc.text("PRAZO DE EXECUCAO", margin, yPos);
    yPos += 6;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    doc.text(`${proposta.prazo_execucao_dias} dias uteis`, margin, yPos);
    yPos += 8;
  }

  // Botões de aprovação já estão dentro do card azul da Engenharia

  // ============================================================
  // 15. RODAPE
  // ============================================================
  const footerY = pageHeight - 15;
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text(
    "Esta proposta e valida conforme prazo especificado e esta sujeita a disponibilidade.",
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

  // ============================================================
  // 15. SALVAR PDF
  // ============================================================
  const fileName = `Proposta_${proposta.numero || proposta.id}_${new Date().getTime()}.pdf`;
  doc.save(fileName);
}
