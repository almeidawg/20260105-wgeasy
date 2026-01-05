export function padronizarNome(nome: string) {
  return nome
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase())
    .trim();
}

export function formatarCPF(cpf: string) {
  return cpf.replace(/\D/g, "").replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function formatarRG(rg: string) {
  return rg.replace(/\D/g, "").replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, "$1.$2.$3-$4");
}

export function formatarTelefone(telefone: string) {
  const v = telefone.replace(/\D/g, "");
  if (v.length === 11) return v.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  return v.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
}

export async function buscarCEP(cep: string) {
  const clean = cep.replace(/\D/g, "");
  const resp = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
  return await resp.json();
}

// ================================================================
// FORMATAÇÃO DE MOEDA
// ================================================================

/**
 * Formata número como moeda brasileira (R$)
 */
export function formatarMoeda(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return "R$ 0,00";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor);
}

/**
 * Formata número como moeda compacta (1.5k, 2.3M)
 */
export function formatarMoedaCompacta(valor: number): string {
  if (valor >= 1000000) {
    return `R$ ${(valor / 1000000).toFixed(1)}M`;
  }
  if (valor >= 1000) {
    return `R$ ${(valor / 1000).toFixed(1)}k`;
  }
  return formatarMoeda(valor);
}

/**
 * Remove formatação de moeda e retorna número
 * @param valorFormatado - String formatada como "R$ 1.234,56"
 * @returns Número sem formatação
 */
export function desformatarMoeda(valorFormatado: string): number {
  if (!valorFormatado) return 0;

  // Remove R$, espaços, pontos de milhar
  const valor = valorFormatado
    .replace("R$", "")
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  return parseFloat(valor) || 0;
}

/**
 * Formata input de moeda enquanto o usuário digita
 * @param valor - Valor atual do input
 * @returns Valor formatado
 */
export function formatarMoedaInput(valor: string): string {
  // Remove tudo que não é número
  const apenasNumeros = valor.replace(/\D/g, "");

  if (!apenasNumeros) return "";

  // Converte para número (centavos)
  const numero = parseInt(apenasNumeros) / 100;

  // Formata
  return formatarMoeda(numero);
}

// ================================================================
// FORMATAÇÃO DE DATAS
// ================================================================

/**
 * Formata uma data para o padrão brasileiro (dd/mm/aaaa)
 * @param data - String ISO, Date object, ou null/undefined
 * @returns String formatada como dd/mm/aaaa ou "—" se inválida
 */
export function formatarData(data: string | Date | null | undefined): string {
  if (!data) return "—";

  try {
    const dateObj = typeof data === "string" ? new Date(data) : data;

    // Verificar se a data é válida
    if (isNaN(dateObj.getTime())) return "—";

    return dateObj.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  } catch {
    return "—";
  }
}

/**
 * Formata uma data e hora para o padrão brasileiro (dd/mm/aaaa HH:mm)
 * @param data - String ISO, Date object, ou null/undefined
 * @returns String formatada como dd/mm/aaaa HH:mm ou "—" se inválida
 */
export function formatarDataHora(data: string | Date | null | undefined): string {
  if (!data) return "—";

  try {
    const dateObj = typeof data === "string" ? new Date(data) : data;

    // Verificar se a data é válida
    if (isNaN(dateObj.getTime())) return "—";

    return dateObj.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return "—";
  }
}

/**
 * Converte uma data ISO para o formato YYYY-MM-DD (para inputs type="date")
 * @param data - String ISO ou Date object
 * @returns String no formato YYYY-MM-DD ou string vazia
 */
export function dataParaInput(data: string | Date | null | undefined): string {
  if (!data) return "";

  try {
    const dateObj = typeof data === "string" ? new Date(data) : data;

    // Verificar se a data é válida
    if (isNaN(dateObj.getTime())) return "";

    // Extrair apenas a parte da data (YYYY-MM-DD)
    const dataISO = dateObj.toISOString();
    return dataISO.split("T")[0];
  } catch {
    return "";
  }
}

/**
 * Normaliza texto de data digitada (aceita dd/mm/aaaa) para ISO yyyy-mm-dd.
 * Se já estiver em ISO, retorna igual.
 */
export function normalizarDataIsoOuBr(valor: string): string {
  if (!valor) return "";
  const v = valor.trim();
  // Se já vier em formato ISO (yyyy-mm-dd)
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  // dd/mm/aaaa
  const m = v.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m) {
    const [_, d, mo, y] = m;
    const dd = d.padStart(2, "0");
    const mm = mo.padStart(2, "0");
    return `${y}-${mm}-${dd}`;
  }
  return v;
}

/**
 * Converte uma data/hora ISO para o formato datetime-local input
 * @param data - String ISO ou Date object
 * @returns String no formato YYYY-MM-DDTHH:mm ou string vazia
 */
export function dataHoraParaInput(data: string | Date | null | undefined): string {
  if (!data) return "";

  try {
    const dateObj = typeof data === "string" ? new Date(data) : data;

    // Verificar se a data é válida
    if (isNaN(dateObj.getTime())) return "";

    // Formato: YYYY-MM-DDTHH:mm
    const ano = dateObj.getFullYear();
    const mes = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dia = String(dateObj.getDate()).padStart(2, '0');
    const hora = String(dateObj.getHours()).padStart(2, '0');
    const minuto = String(dateObj.getMinutes()).padStart(2, '0');

    return `${ano}-${mes}-${dia}T${hora}:${minuto}`;
  } catch {
    return "";
  }
}

/**
 * Retorna a data atual no formato ISO (yyyy-mm-dd)
 * Útil para inicializar campos de data com a data de hoje
 */
export function getTodayISO(): string {
  return new Date().toISOString().split("T")[0];
}
