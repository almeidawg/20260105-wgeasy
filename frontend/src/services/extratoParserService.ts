// ========================================
// SERVIÇO DE PARSING DE EXTRATOS BANCÁRIOS
// Suporta: PDF, Excel (xlsx/xls), CSV, OFX
// ========================================

import * as XLSX from "xlsx";

// Configuração do backend
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";
const INTERNAL_API_KEY = import.meta.env.VITE_INTERNAL_API_KEY || "";

// Tipos minimais para representar células/linhas de uma planilha Excel
type ExcelCell = string | number | boolean | null;
type ExcelRow = ExcelCell[];
type ExcelTable = ExcelRow[];

export interface LinhaExtrato {
  data: string;
  descricao: string;
  valor: number;
  tipo: "entrada" | "saida";
  saldo?: number;
  documento?: string;
  raw?: string; // linha original para debug
}

export interface ResultadoParsing {
  sucesso: boolean;
  linhas: LinhaExtrato[];
  erros: string[];
  tipoArquivo: string;
  totalLinhas: number;
  dataInicio?: string;
  dataFim?: string;
}

// ========================================
// PARSER PRINCIPAL
// ========================================
export async function parseExtrato(file: File): Promise<ResultadoParsing> {
  const extension = file.name.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "csv":
      return parseCSV(file);
    case "xlsx":
    case "xls":
      return parseExcel(file);
    case "ofx":
      return parseOFX(file);
    case "pdf":
      return parsePDF(file);
    default:
      return {
        sucesso: false,
        linhas: [],
        erros: [`Formato não suportado: ${extension}`],
        tipoArquivo: extension || "desconhecido",
        totalLinhas: 0,
      };
  }
}

// ========================================
// PARSER CSV
// ========================================
async function parseCSV(file: File): Promise<ResultadoParsing> {
  const text = await file.text();
  const lines = text.split("\n").filter((l) => l.trim());
  const linhas: LinhaExtrato[] = [];
  const erros: string[] = [];

  // Detectar separador (vírgula, ponto-e-vírgula, tab)
  const separator = detectSeparator(lines[0]);

  // Pular cabeçalho
  const dataLines = lines.slice(1);

  for (let i = 0; i < dataLines.length; i++) {
    try {
      const cols = dataLines[i]
        .split(separator)
        .map((c) => c.trim().replace(/^"|"$/g, ""));

      if (cols.length < 3) continue;

      const linha = parseLinhaGenerica(cols);
      if (linha) {
        linhas.push(linha);
      }
    } catch (e: any) {
      erros.push(`Linha ${i + 2}: ${e.message}`);
    }
  }

  return {
    sucesso: linhas.length > 0,
    linhas,
    erros,
    tipoArquivo: "csv",
    totalLinhas: dataLines.length,
    dataInicio: linhas[0]?.data,
    dataFim: linhas[linhas.length - 1]?.data,
  };
}

// ========================================
// PARSER EXCEL
// ========================================
async function parseExcel(file: File): Promise<ResultadoParsing> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, {
    type: "array",
    cellDates: true,
    dateNF: "dd/mm/yyyy",
  });
  const linhas: LinhaExtrato[] = [];
  const erros: string[] = [];

  // Pegar primeira planilha
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  if (!sheet) {
    return {
      sucesso: false,
      linhas: [],
      erros: ["Planilha vazia ou não encontrada"],
      tipoArquivo: "excel",
      totalLinhas: 0,
    };
  }

  // Converter para JSON - tentar diferentes métodos
  let data: ExcelTable = [];

  try {
    // Primeiro, tentar com raw: false para obter valores formatados
    data = XLSX.utils.sheet_to_json<any>(sheet, {
      header: 1,
      raw: false,
      defval: "",
    });
  } catch (e) {
    try {
      // Fallback: tentar com raw: true
      data = XLSX.utils.sheet_to_json<any>(sheet, {
        header: 1,
        raw: true,
        defval: "",
      });
    } catch (e2: any) {
      return {
        sucesso: false,
        linhas: [],
        erros: [`Erro ao ler planilha: ${e2.message}`],
        tipoArquivo: "excel",
        totalLinhas: 0,
      };
    }
  }

  if (!data || data.length === 0) {
    return {
      sucesso: false,
      linhas: [],
      erros: ["Planilha não contém dados"],
      tipoArquivo: "excel",
      totalLinhas: 0,
    };
  }

  // Log para debug - primeiras linhas
  console.log("Primeiras 5 linhas da planilha:", data.slice(0, 5));

  // Detectar estrutura da planilha - encontrar cabeçalho e início dos dados
  const { headerRow, dataStartRow, columnMap } = detectExcelStructure(data);

  console.log("Estrutura detectada:", { headerRow, dataStartRow, columnMap });

  // Processar linhas de dados
  for (let i = dataStartRow; i < data.length; i++) {
    try {
      const row = data[i] as ExcelRow;
      if (!row || row.every((cell) => !cell || String(cell).trim() === ""))
        continue;

      const linha = parseLinhaExcelInteligente(row, columnMap);
      if (linha) {
        linhas.push(linha);
      }
    } catch (e: any) {
      erros.push(`Linha ${i + 1}: ${e.message}`);
    }
  }

  // Se não conseguiu com mapeamento, tentar método genérico
  if (linhas.length === 0) {
    console.log("Tentando método genérico de parsing...");
    for (let i = 0; i < data.length; i++) {
      try {
        const row = data[i] as ExcelRow;
        if (!row || row.length < 2) continue;

        const linha = parseLinhaExcel(row);
        if (linha) {
          linhas.push(linha);
        }
      } catch (e: any) {
        // Silenciar erros do método genérico
      }
    }
  }

  if (linhas.length === 0) {
    erros.push("Não foi possível identificar transações na planilha.");
    erros.push(
      "Verifique se o arquivo contém colunas de Data, Descrição e Valor."
    );
    erros.push(
      "Formatos esperados: Data (DD/MM/AAAA), Valor (1.234,56 ou -1.234,56)"
    );
  }

  return {
    sucesso: linhas.length > 0,
    linhas,
    erros,
    tipoArquivo: "excel",
    totalLinhas: data.length - dataStartRow,
    dataInicio: linhas[0]?.data,
    dataFim: linhas[linhas.length - 1]?.data,
  };
}

// Detectar estrutura da planilha Excel
function detectExcelStructure(data: ExcelTable): {
  headerRow: number;
  dataStartRow: number;
  columnMap: ColumnMap;
} {
  const columnMap: ColumnMap = {
    data: -1,
    descricao: -1,
    valor: -1,
    debito: -1,
    credito: -1,
    saldo: -1,
  };
  let headerRow = -1;
  let dataStartRow = 0;

  // Palavras-chave para identificar colunas
  const keywords = {
    data: [
      "data",
      "date",
      "dt",
      "dia",
      "lançamento",
      "lancamento",
      "movimento",
    ],
    descricao: [
      "descrição",
      "descricao",
      "historico",
      "histórico",
      "memo",
      "descrip",
      "lançamento",
      "lancamento",
      "transação",
      "transacao",
    ],
    valor: ["valor", "value", "quantia", "amount", "vlr"],
    debito: ["débito", "debito", "saída", "saida", "debit", "deb", "d"],
    credito: ["crédito", "credito", "entrada", "credit", "cred", "c"],
    saldo: ["saldo", "balance", "acumulado"],
  };

  // Procurar linha de cabeçalho nas primeiras 15 linhas
  for (let i = 0; i < Math.min(15, data.length); i++) {
    const row = data[i];
    if (!row) continue;

    let matchCount = 0;
    for (let j = 0; j < row.length; j++) {
      const cell = String(row[j] || "")
        .toLowerCase()
        .trim();

      if (keywords.data.some((k) => cell.includes(k))) {
        columnMap.data = j;
        matchCount++;
      }
      if (keywords.descricao.some((k) => cell.includes(k))) {
        columnMap.descricao = j;
        matchCount++;
      }
      if (
        keywords.valor.some((k) => cell.includes(k)) &&
        !keywords.debito.some((k) => cell.includes(k)) &&
        !keywords.credito.some((k) => cell.includes(k))
      ) {
        columnMap.valor = j;
        matchCount++;
      }
      if (keywords.debito.some((k) => cell.includes(k) || cell === k)) {
        columnMap.debito = j;
        matchCount++;
      }
      if (keywords.credito.some((k) => cell.includes(k) || cell === k)) {
        columnMap.credito = j;
        matchCount++;
      }
      if (keywords.saldo.some((k) => cell.includes(k))) {
        columnMap.saldo = j;
        matchCount++;
      }
    }

    if (matchCount >= 2) {
      headerRow = i;
      dataStartRow = i + 1;
      break;
    }
  }

  // Se não encontrou cabeçalho, procurar primeira linha com data
  if (headerRow === -1) {
    for (let i = 0; i < Math.min(20, data.length); i++) {
      const row = data[i];
      if (row && hasDateLikeValue(row)) {
        dataStartRow = i;
        // Assumir estrutura padrão: Data, Descrição, Valor
        if (row.length >= 3) {
          for (let j = 0; j < row.length; j++) {
            const cell = String(row[j] || "");
            if (columnMap.data === -1 && parseDataBrasileira(cell)) {
              columnMap.data = j;
            } else if (
              columnMap.valor === -1 &&
              parseValorBrasileiro(cell) !== null
            ) {
              columnMap.valor = j;
            }
          }
          // Descrição é a coluna mais longa que não é data nem valor
          let maxLen = 0;
          for (let j = 0; j < row.length; j++) {
            const cell = String(row[j] || "");
            if (
              j !== columnMap.data &&
              j !== columnMap.valor &&
              cell.length > maxLen
            ) {
              maxLen = cell.length;
              columnMap.descricao = j;
            }
          }
        }
        break;
      }
    }
  }

  return { headerRow, dataStartRow, columnMap };
}

interface ColumnMap {
  data: number;
  descricao: number;
  valor: number;
  debito: number;
  credito: number;
  saldo: number;
}

// Parser inteligente usando mapeamento de colunas
function parseLinhaExcelInteligente(
  row: ExcelRow,
  columnMap: ColumnMap
): LinhaExtrato | null {
  let data: string | null = null;
  let descricao = "";
  let valor: number | null = null;
  let tipo: "entrada" | "saida" = "saida";

  // Extrair data
  if (columnMap.data >= 0 && row[columnMap.data]) {
    data = parseDataBrasileira(String(row[columnMap.data]));
  }

  // Extrair descrição
  if (columnMap.descricao >= 0 && row[columnMap.descricao]) {
    descricao = String(row[columnMap.descricao]).trim();
  }

  // Extrair valor - priorizar colunas separadas de débito/crédito
  if (columnMap.debito >= 0 || columnMap.credito >= 0) {
    const debito =
      columnMap.debito >= 0
        ? parseValorBrasileiro(String(row[columnMap.debito] || ""))
        : null;
    const credito =
      columnMap.credito >= 0
        ? parseValorBrasileiro(String(row[columnMap.credito] || ""))
        : null;

    if (debito !== null && Math.abs(debito) > 0) {
      valor = Math.abs(debito);
      tipo = "saida";
    } else if (credito !== null && Math.abs(credito) > 0) {
      valor = Math.abs(credito);
      tipo = "entrada";
    }
  }

  // Se não tem débito/crédito separado, usar coluna valor
  if (valor === null && columnMap.valor >= 0 && row[columnMap.valor]) {
    const parsedValor = parseValorBrasileiro(String(row[columnMap.valor]));
    if (parsedValor !== null) {
      valor = Math.abs(parsedValor);
      tipo = parsedValor >= 0 ? "entrada" : "saida";
    }
  }

  // Fallback: procurar data e valor em qualquer coluna
  if (!data || valor === null) {
    for (let i = 0; i < row.length; i++) {
      const cell = String(row[i] || "").trim();
      if (!cell) continue;

      if (!data) {
        const parsedDate = parseDataBrasileira(cell);
        if (parsedDate) {
          data = parsedDate;
          continue;
        }
      }

      if (valor === null) {
        const parsedValor = parseValorBrasileiro(cell);
        if (parsedValor !== null && Math.abs(parsedValor) > 0.01) {
          valor = Math.abs(parsedValor);
          tipo = parsedValor >= 0 ? "entrada" : "saida";
        }
      }
    }
  }

  // Fallback descrição: pegar a coluna de texto mais longa
  if (!descricao) {
    let maxLen = 0;
    for (let i = 0; i < row.length; i++) {
      const cell = String(row[i] || "").trim();
      if (
        cell.length > maxLen &&
        !parseDataBrasileira(cell) &&
        parseValorBrasileiro(cell) === null
      ) {
        maxLen = cell.length;
        descricao = cell;
      }
    }
  }

  // Validar linha
  if (data && valor !== null && valor > 0) {
    return {
      data,
      descricao: descricao || "Sem descrição",
      valor,
      tipo,
      raw: row.join(" | "),
    };
  }

  return null;
}

// ========================================
// PARSER OFX (Open Financial Exchange)
// ========================================
async function parseOFX(file: File): Promise<ResultadoParsing> {
  const text = await file.text();
  const linhas: LinhaExtrato[] = [];
  const erros: string[] = [];

  // Extrair transações do OFX
  const transacoes = text.match(/<STMTTRN>[\s\S]*?<\/STMTTRN>/gi) || [];

  for (const trn of transacoes) {
    try {
      const data = extractOFXTag(trn, "DTPOSTED")?.substring(0, 8);
      const valor = parseFloat(extractOFXTag(trn, "TRNAMT") || "0");
      const descricao =
        extractOFXTag(trn, "MEMO") || extractOFXTag(trn, "NAME") || "";

      if (data && valor !== 0) {
        linhas.push({
          data: formatOFXDate(data),
          descricao: descricao.trim(),
          valor: Math.abs(valor),
          tipo: valor >= 0 ? "entrada" : "saida",
        });
      }
    } catch (e: any) {
      erros.push(`Transação: ${e.message}`);
    }
  }

  return {
    sucesso: linhas.length > 0,
    linhas,
    erros,
    tipoArquivo: "ofx",
    totalLinhas: transacoes.length,
    dataInicio: linhas[0]?.data,
    dataFim: linhas[linhas.length - 1]?.data,
  };
}

// ========================================
// PARSER PDF (com IA Vision)
// Converte páginas em imagens e usa GPT-4o para extrair dados
// ========================================
async function parsePDF(file: File): Promise<ResultadoParsing> {
  const linhas: LinhaExtrato[] = [];
  const erros: string[] = [];

  try {
    // Importar pdf.js
    const pdfjsLib = await import("pdfjs-dist");

    // Configurar worker da pasta public
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

    // Carregar PDF
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    console.log(`[PDF Parser] PDF carregado: ${pdf.numPages} páginas`);

    // Processar cada página (máximo 10 páginas para não estourar limites)
    const maxPages = Math.min(pdf.numPages, 10);
    const paginasBase64: string[] = [];

    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const scale = 2; // Escala para melhor qualidade
        const viewport = page.getViewport({ scale });

        // Criar canvas
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
          erros.push(`Página ${pageNum}: Erro ao criar canvas`);
          continue;
        }

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // Renderizar página
        await page.render({
          canvasContext: context,
          viewport: viewport,
        } as any).promise;

        // Converter para base64 (JPEG para menor tamanho)
        const base64 = canvas.toDataURL("image/jpeg", 0.8);
        paginasBase64.push(base64);

        console.log(`[PDF Parser] Página ${pageNum} renderizada`);
      } catch (pageError: any) {
        erros.push(`Página ${pageNum}: ${pageError.message}`);
      }
    }

    if (paginasBase64.length === 0) {
      return {
        sucesso: false,
        linhas: [],
        erros: ["Não foi possível renderizar nenhuma página do PDF"],
        tipoArquivo: "pdf",
        totalLinhas: 0,
      };
    }

    // Enviar para IA Vision extrair dados
    console.log(
      `[PDF Parser] Enviando ${paginasBase64.length} páginas para IA...`
    );
    const linhasExtraidas = await extrairDadosPDFComIA(paginasBase64);

    if (linhasExtraidas.length > 0) {
      linhas.push(...linhasExtraidas);
    } else {
      erros.push("A IA não conseguiu extrair transações do PDF.");
      erros.push("Verifique se o PDF contém um extrato bancário legível.");
    }

    return {
      sucesso: linhas.length > 0,
      linhas,
      erros,
      tipoArquivo: "pdf",
      totalLinhas: linhas.length,
      dataInicio: linhas[0]?.data,
      dataFim: linhas[linhas.length - 1]?.data,
    };
  } catch (error: any) {
    console.error("[PDF Parser] Erro:", error);
    return {
      sucesso: false,
      linhas: [],
      erros: [
        `Erro ao processar PDF: ${error.message}`,
        "Tente exportar o extrato em formato Excel ou CSV.",
      ],
      tipoArquivo: "pdf",
      totalLinhas: 0,
    };
  }
}

// ========================================
// EXTRAIR DADOS DO PDF COM IA VISION
// ========================================
async function extrairDadosPDFComIA(
  paginasBase64: string[]
): Promise<LinhaExtrato[]> {
  // Usar backend proxy para não expor API key no frontend
  if (!INTERNAL_API_KEY) {
    console.error("[PDF Parser] VITE_INTERNAL_API_KEY não configurada");
    return [];
  }

  const linhas: LinhaExtrato[] = [];

  const prompt = `Você é um especialista em extrair dados de extratos bancários.

Analise as imagens do extrato bancário e extraia TODAS as transações encontradas.

Para CADA transação, extraia:
- Data (formato YYYY-MM-DD)
- Descrição (texto da transação)
- Valor (número positivo)
- Tipo: "entrada" para créditos/depósitos, "saida" para débitos/pagamentos

IMPORTANTE:
- Extraia TODAS as transações visíveis
- Use valores absolutos (sempre positivos)
- Identifique corretamente se é entrada ou saída pelo contexto (crédito/débito, +/-, etc)
- Ignore linhas de saldo, cabeçalhos e rodapés

Retorne APENAS um array JSON válido, sem explicações:
[
  {"data": "2025-01-15", "descricao": "PIX RECEBIDO FULANO", "valor": 1500.00, "tipo": "entrada"},
  {"data": "2025-01-16", "descricao": "PAGTO BOLETO LUZ", "valor": 250.50, "tipo": "saida"}
]

Se não encontrar transações, retorne: []`;

  try {
    const response = await fetch(`${BACKEND_URL}/api/openai/vision`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-key": INTERNAL_API_KEY,
      },
      body: JSON.stringify({
        images: paginasBase64,
        prompt: prompt,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[PDF Parser] Erro backend:", errorText);
      return [];
    }

    const data = await response.json();
    const responseText = data.choices?.[0]?.message?.content || "[]";

    // Extrair JSON da resposta
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("[PDF Parser] Não encontrou JSON na resposta");
      return [];
    }

    const transacoes = JSON.parse(jsonMatch[0]);

    for (const t of transacoes) {
      if (t.data && t.descricao && t.valor !== undefined) {
        linhas.push({
          data: t.data,
          descricao: String(t.descricao).trim(),
          valor: Math.abs(parseFloat(t.valor)),
          tipo: t.tipo === "entrada" ? "entrada" : "saida",
        });
      }
    }

    console.log(`[PDF Parser] ${linhas.length} transações extraídas`);
    return linhas;
  } catch (error: any) {
    console.error("[PDF Parser] Erro ao chamar IA:", error);
    return [];
  }
}

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

function detectSeparator(line: string): string {
  const separators = [";", ",", "\t", "|"];
  let maxCount = 0;
  let bestSep = ",";

  for (const sep of separators) {
    const count = (
      line.match(new RegExp(sep.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) ||
      []
    ).length;
    if (count > maxCount) {
      maxCount = count;
      bestSep = sep;
    }
  }

  return bestSep;
}

function parseLinhaGenerica(cols: string[]): LinhaExtrato | null {
  // Tentar encontrar data, descrição e valor nas colunas
  let data: string | null = null;
  let descricao: string | null = null;
  let valor: number | null = null;
  let tipo: "entrada" | "saida" = "saida";

  for (const col of cols) {
    // Tentar como data
    if (!data) {
      const parsedDate = parseDataBrasileira(col);
      if (parsedDate) {
        data = parsedDate;
        continue;
      }
    }

    // Tentar como valor
    if (valor === null) {
      const parsedValor = parseValorBrasileiro(col);
      if (parsedValor !== null) {
        valor = Math.abs(parsedValor);
        tipo = parsedValor >= 0 ? "entrada" : "saida";
        continue;
      }
    }

    // O resto é descrição
    if (col.length > 3 && !data && valor === null) {
      descricao = col;
    }
  }

  // Se não encontrou descrição, pegar a coluna mais longa
  if (!descricao) {
    descricao = cols.reduce((a, b) => (a.length > b.length ? a : b), "");
  }

  if (data && descricao && valor !== null) {
    return { data, descricao, valor, tipo };
  }

  return null;
}

function parseLinhaExcel(row: ExcelRow): LinhaExtrato | null {
  // Padrões comuns de extratos bancários
  // Coluna 0: Data | Coluna 1: Descrição | Coluna 2: Valor ou Débito | Coluna 3: Crédito

  let data: string | null = null;
  let descricao = "";
  let valor: number | null = null;
  let tipo: "entrada" | "saida" = "saida";

  for (let i = 0; i < row.length; i++) {
    const cell = row[i];
    if (cell === null || cell === undefined || cell === "") continue;

    const cellStr = String(cell).trim();

    // Tentar como data
    if (!data) {
      const parsedDate = parseDataBrasileira(cellStr);
      if (parsedDate) {
        data = parsedDate;
        continue;
      }
    }

    // Tentar como valor
    const parsedValor = parseValorBrasileiro(cellStr);
    if (parsedValor !== null && Math.abs(parsedValor) > 0) {
      if (valor === null) {
        valor = Math.abs(parsedValor);
        tipo = parsedValor >= 0 ? "entrada" : "saida";
      } else if (parsedValor > 0 && tipo === "saida") {
        // Se já tem valor negativo e esse é positivo, é crédito
        tipo = "entrada";
        valor = parsedValor;
      }
      continue;
    }

    // Descrição (texto mais longo)
    if (cellStr.length > descricao.length && cellStr.length > 5) {
      descricao = cellStr;
    }
  }

  if (data && descricao && valor !== null && valor > 0) {
    return { data, descricao, valor, tipo };
  }

  return null;
}

function parseDataBrasileira(str: string): string | null {
  if (!str) return null;

  const trimmed = String(str).trim();

  // Padrões de data brasileira: DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
  const patterns = [
    /^(\d{2})[\/\-\.](\d{2})[\/\-\.](\d{4})$/, // DD/MM/YYYY
    /^(\d{2})[\/\-\.](\d{2})[\/\-\.](\d{2})$/, // DD/MM/YY
    /^(\d{4})[\/\-\.](\d{2})[\/\-\.](\d{2})$/, // YYYY-MM-DD
    /^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/, // D/M/YYYY
    /^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2})$/, // D/M/YY
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) {
      let dia, mes, ano;

      if (pattern === patterns[2]) {
        // YYYY-MM-DD
        [, ano, mes, dia] = match;
      } else {
        [, dia, mes, ano] = match;
        if (ano.length === 2) {
          ano = parseInt(ano) > 50 ? `19${ano}` : `20${ano}`;
        }
      }

      return `${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
    }
  }

  // Verificar se é número serial do Excel (dias desde 1900-01-01)
  const numValue = parseFloat(trimmed);
  if (!isNaN(numValue) && numValue > 30000 && numValue < 60000) {
    // É provavelmente uma data serial do Excel
    const excelDate = excelSerialToDate(numValue);
    if (excelDate) {
      return excelDate;
    }
  }

  // Tentar parse de Date do JavaScript
  const date = new Date(trimmed);
  if (
    !isNaN(date.getTime()) &&
    date.getFullYear() > 1990 &&
    date.getFullYear() < 2100
  ) {
    return date.toISOString().split("T")[0];
  }

  return null;
}

// Converter número serial do Excel para data
function excelSerialToDate(serial: number): string | null {
  // Excel conta dias desde 1900-01-01, mas com bug do ano bissexto de 1900
  // Ajustar para bug do Excel (conta 29/02/1900 que não existe)
  const utcDays = Math.floor(serial - 25569); // 25569 = dias entre 1900 e 1970
  const utcValue = utcDays * 86400 * 1000;
  const date = new Date(utcValue);

  if (!isNaN(date.getTime())) {
    return date.toISOString().split("T")[0];
  }
  return null;
}

function parseValorBrasileiro(str: string): number | null {
  if (!str) return null;

  // Limpar string
  let cleaned = String(str).trim();

  // Verificar se é negativo (débito)
  const isNegative =
    cleaned.includes("-") ||
    cleaned.toLowerCase().includes("d") ||
    cleaned.includes("(");

  // Remover caracteres não numéricos exceto vírgula e ponto
  cleaned = cleaned.replace(/[^\d,.\-]/g, "");

  if (!cleaned || cleaned === "-") return null;

  // Converter formato brasileiro (1.234,56) para número
  // Se tem vírgula, assume que é separador decimal
  if (cleaned.includes(",")) {
    cleaned = cleaned.replace(/\./g, "").replace(",", ".");
  }

  const valor = parseFloat(cleaned);

  if (isNaN(valor)) return null;

  return isNegative ? -Math.abs(valor) : valor;
}

function hasDateLikeValue(row: any[]): boolean {
  return row.some((cell) => {
    if (!cell) return false;
    const str = String(cell);
    return /\d{2}[\/\-\.]\d{2}[\/\-\.]\d{2,4}/.test(str);
  });
}

function extractOFXTag(text: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}>([^<\\s]+)`, "i");
  const match = text.match(regex);
  return match ? match[1] : null;
}

function formatOFXDate(date: string): string {
  // Formato OFX: YYYYMMDD
  if (date.length >= 8) {
    const year = date.substring(0, 4);
    const month = date.substring(4, 6);
    const day = date.substring(6, 8);
    return `${year}-${month}-${day}`;
  }
  return date;
}

// ========================================
// EXPORTAR TIPOS
// ========================================
export type { LinhaExtrato, ResultadoParsing };
