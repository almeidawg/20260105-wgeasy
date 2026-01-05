// src/lib/templates/financeiroTemplate.ts
import * as XLSX from "xlsx";

/**
 * Gera e faz download de um arquivo Excel modelo para importação de lançamentos financeiros
 *
 * Colunas:
 * - Data (dd/mm/yyyy)
 * - Tipo (receita/despesa)
 * - Categoria
 * - Descrição
 * - Valor
 * - Forma Pagamento (dinheiro/pix/cartao_credito/cartao_debito/boleto/transferencia)
 * - Status (pendente/pago/cancelado)
 * - Contrato ID (opcional)
 * - Observações
 */
export function downloadFinanceiroTemplate() {
  // Cabeçalhos
  const headers = [
    "Data",
    "Tipo",
    "Categoria",
    "Descrição",
    "Valor",
    "Forma Pagamento",
    "Status",
    "Contrato ID",
    "Observações"
  ];

  // Linhas de exemplo
  const exampleRows = [
    [
      "01/12/2025",
      "receita",
      "Vendas",
      "Venda de material - Cliente ABC",
      "1500.00",
      "pix",
      "pago",
      "",
      "Pagamento via PIX"
    ],
    [
      "05/12/2025",
      "despesa",
      "Fornecedores",
      "Compra de materiais de construção",
      "850.50",
      "boleto",
      "pendente",
      "",
      "Vencimento em 15/12/2025"
    ],
    [
      "10/12/2025",
      "receita",
      "Serviços",
      "Execução de obra - Contrato 123",
      "5000.00",
      "transferencia",
      "pago",
      "CONT-123",
      "Primeira parcela do contrato"
    ],
    [
      "15/12/2025",
      "despesa",
      "Salários",
      "Pagamento de funcionários",
      "8500.00",
      "transferencia",
      "pendente",
      "",
      "Folha de pagamento dezembro/2025"
    ],
    [
      "20/12/2025",
      "receita",
      "Vendas",
      "Venda de serviço de instalação",
      "2300.00",
      "cartao_credito",
      "pago",
      "",
      "Parcelado em 3x"
    ]
  ];

  // Instruções
  const instructions = [
    ["INSTRUÇÕES PARA IMPORTAÇÃO DE LANÇAMENTOS FINANCEIROS"],
    [""],
    ["1. Preencha os dados nas colunas abaixo conforme o exemplo"],
    ["2. Campos obrigatórios: Data, Tipo, Categoria, Descrição, Valor, Forma Pagamento, Status"],
    ["3. Formato da Data: dd/mm/yyyy (ex: 01/12/2025)"],
    ["4. Tipos válidos: receita, despesa"],
    ["5. Formas de Pagamento válidas:"],
    ["   - dinheiro"],
    ["   - pix"],
    ["   - cartao_credito"],
    ["   - cartao_debito"],
    ["   - boleto"],
    ["   - transferencia"],
    ["6. Status válidos: pendente, pago, cancelado"],
    ["7. Use ponto para separar decimais (ex: 1500.00)"],
    ["8. Contrato ID é opcional (deixe em branco se não aplicável)"],
    ["9. Não altere os nomes das colunas"],
    ["10. Após preencher, importe o arquivo no sistema"],
    [""]
  ];

  // Criar planilha de instruções
  const instructionsSheet = XLSX.utils.aoa_to_sheet(instructions);

  // Criar planilha de dados
  const dataSheet = XLSX.utils.aoa_to_sheet([headers, ...exampleRows]);

  // Ajustar largura das colunas
  const columnWidths = [
    { wch: 12 }, // Data
    { wch: 12 }, // Tipo
    { wch: 18 }, // Categoria
    { wch: 40 }, // Descrição
    { wch: 15 }, // Valor
    { wch: 18 }, // Forma Pagamento
    { wch: 12 }, // Status
    { wch: 15 }, // Contrato ID
    { wch: 35 }  // Observações
  ];
  dataSheet['!cols'] = columnWidths;

  // Criar workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, instructionsSheet, "Instruções");
  XLSX.utils.book_append_sheet(workbook, dataSheet, "Lançamentos");

  // Download do arquivo
  XLSX.writeFile(workbook, "template-lancamentos-financeiros.xlsx");
}
