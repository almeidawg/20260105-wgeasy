// ============================================================
// BTG PACTUAL EMPRESAS - SERVIÇO PRINCIPAL
// ============================================================

import { createClient } from '@supabase/supabase-js';
import { btgConfig, btgEndpoints, BTGPaymentType, BTGPixKeyType } from './btgConfig';
import btgAuth from './btgAuth';

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Company ID padrão (será obtido da configuração ou banco)
let defaultCompanyId: string | null = null;

// ============================================================
// CLIENTE HTTP CONFIGURADO
// ============================================================

async function btgFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await btgAuth.getClientCredentialsToken();

  const response = await fetch(`${btgConfig.apiUrl}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  return response;
}

// ============================================================
// EMPRESA / CONTA
// ============================================================

/**
 * Lista empresas vinculadas à conta
 */
export async function listarEmpresas(): Promise<unknown[]> {
  const response = await btgFetch(btgEndpoints.companies);

  if (!response.ok) {
    throw new Error(`Erro ao listar empresas: ${response.status}`);
  }

  const data = await response.json();
  return data.companies || data;
}

/**
 * Define a empresa padrão para operações
 */
export function setDefaultCompany(companyId: string): void {
  defaultCompanyId = companyId;
  console.log(`[BTG Service] Empresa padrão definida: ${companyId}`);
}

/**
 * Obtém o Company ID (da configuração ou erro)
 */
function getCompanyId(companyId?: string): string {
  const id = companyId || defaultCompanyId;
  if (!id) {
    throw new Error('Company ID não configurado. Use setDefaultCompany() ou passe o ID.');
  }
  return id;
}

// ============================================================
// SALDO E EXTRATO
// ============================================================

/**
 * Consulta saldo da conta
 */
export async function consultarSaldo(
  accountId: string,
  companyId?: string
): Promise<{
  available: number;
  blocked: number;
  total: number;
}> {
  const cid = getCompanyId(companyId);
  const response = await btgFetch(btgEndpoints.balance(cid, accountId));

  if (!response.ok) {
    throw new Error(`Erro ao consultar saldo: ${response.status}`);
  }

  return response.json();
}

/**
 * Consulta extrato bancário
 */
export async function consultarExtrato(
  accountId: string,
  startDate: string,
  endDate: string,
  companyId?: string
): Promise<unknown[]> {
  const cid = getCompanyId(companyId);
  const params = new URLSearchParams({ startDate, endDate });
  const response = await btgFetch(
    `${btgEndpoints.statements(cid, accountId)}?${params}`
  );

  if (!response.ok) {
    throw new Error(`Erro ao consultar extrato: ${response.status}`);
  }

  const data = await response.json();
  return data.statements || data;
}

// ============================================================
// BOLETOS
// ============================================================

interface CriarBoletoParams {
  valor: number;
  dataVencimento: string;
  pagador: {
    nome: string;
    documento: string; // CPF ou CNPJ
    endereco?: {
      logradouro: string;
      numero: string;
      cidade: string;
      estado: string;
      cep: string;
    };
  };
  descricao?: string;
  multa?: { percentual: number; diasAposVencimento: number };
  juros?: { percentualDiario: number };
  habilitarPix?: boolean;
  contratoId?: string; // Para vincular ao sistema
}

/**
 * Cria um boleto de cobrança
 */
export async function criarBoleto(
  params: CriarBoletoParams,
  companyId?: string
): Promise<{
  id: string;
  barcode: string;
  digitableLine: string;
  emv?: string; // QR Code PIX se habilitado
  dueDate: string;
  amount: number;
}> {
  const cid = getCompanyId(companyId);

  const body = {
    amount: params.valor,
    dueDate: params.dataVencimento,
    payer: {
      name: params.pagador.nome,
      documentNumber: params.pagador.documento,
      address: params.pagador.endereco ? {
        street: params.pagador.endereco.logradouro,
        number: params.pagador.endereco.numero,
        city: params.pagador.endereco.cidade,
        state: params.pagador.endereco.estado,
        zipCode: params.pagador.endereco.cep
      } : undefined
    },
    description: params.descricao,
    fine: params.multa ? {
      percentage: params.multa.percentual,
      daysAfterDue: params.multa.diasAposVencimento
    } : undefined,
    interest: params.juros ? {
      dailyPercentage: params.juros.percentualDiario
    } : undefined,
    enablePixPayment: params.habilitarPix ?? true
  };

  const response = await btgFetch(btgEndpoints.bankSlips(cid), {
    method: 'POST',
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[BTG Service] Erro ao criar boleto:', error);
    throw new Error(`Erro ao criar boleto: ${response.status}`);
  }

  const boleto = await response.json();

  // Salvar no banco local
  await supabase.from('btg_cobrancas').insert({
    contrato_id: params.contratoId,
    tipo: 'BOLETO',
    btg_id: boleto.id,
    valor: params.valor,
    data_vencimento: params.dataVencimento,
    status: 'CRIADO',
    linha_digitavel: boleto.digitableLine,
    emv: boleto.emv
  });

  console.log(`[BTG Service] Boleto criado: ${boleto.id}`);
  return boleto;
}

/**
 * Cancela um boleto
 */
export async function cancelarBoleto(
  boletoId: string,
  companyId?: string
): Promise<void> {
  const cid = getCompanyId(companyId);

  const response = await btgFetch(btgEndpoints.bankSlipById(cid, boletoId), {
    method: 'DELETE'
  });

  if (!response.ok) {
    throw new Error(`Erro ao cancelar boleto: ${response.status}`);
  }

  await supabase
    .from('btg_cobrancas')
    .update({ status: 'CANCELADO' })
    .eq('btg_id', boletoId);

  console.log(`[BTG Service] Boleto cancelado: ${boletoId}`);
}

// ============================================================
// PIX COBRANÇA (QR CODE DINÂMICO)
// ============================================================

interface CriarPixCobrancaParams {
  valor: number;
  expiracaoMinutos?: number;
  descricao?: string;
  pagador?: {
    nome: string;
    documento: string;
  };
  contratoId?: string;
}

/**
 * Cria uma cobrança PIX (QR Code dinâmico)
 */
export async function criarPixCobranca(
  params: CriarPixCobrancaParams,
  companyId?: string
): Promise<{
  id: string;
  txid: string;
  emv: string; // Código copia e cola
  qrCodeBase64?: string;
  expiresAt: string;
}> {
  const cid = getCompanyId(companyId);

  const body = {
    amount: params.valor,
    expirationInMinutes: params.expiracaoMinutos || 60,
    description: params.descricao,
    payer: params.pagador ? {
      name: params.pagador.nome,
      document: params.pagador.documento
    } : undefined
  };

  const response = await btgFetch(btgEndpoints.pixCollections(cid), {
    method: 'POST',
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[BTG Service] Erro ao criar PIX cobrança:', error);
    throw new Error(`Erro ao criar PIX cobrança: ${response.status}`);
  }

  const pix = await response.json();

  // Salvar no banco local
  await supabase.from('btg_cobrancas').insert({
    contrato_id: params.contratoId,
    tipo: 'PIX_COBRANCA',
    btg_id: pix.id,
    valor: params.valor,
    status: 'ATIVO',
    emv: pix.emv
  });

  console.log(`[BTG Service] PIX cobrança criada: ${pix.id}`);
  return pix;
}

// ============================================================
// PAGAMENTOS
// ============================================================

interface CriarPagamentoPixParams {
  tipo: 'PIX_KEY' | 'PIX_QR_CODE';
  valor: number;
  descricao?: string;
  dataAgendamento?: string;
  // Para PIX_KEY
  chave?: string;
  tipoChave?: BTGPixKeyType;
  // Para PIX_QR_CODE
  emv?: string;
  despesaId?: string;
}

/**
 * Cria um pagamento PIX
 */
export async function criarPagamentoPix(
  params: CriarPagamentoPixParams,
  companyId?: string
): Promise<{
  id: string;
  status: string;
}> {
  const cid = getCompanyId(companyId);

  const body: Record<string, unknown> = {
    type: params.tipo,
    amount: params.valor,
    description: params.descricao,
    scheduledDate: params.dataAgendamento
  };

  if (params.tipo === 'PIX_KEY') {
    body.details = {
      pixKey: params.chave,
      pixKeyType: params.tipoChave
    };
  } else if (params.tipo === 'PIX_QR_CODE') {
    body.details = {
      emv: params.emv
    };
  }

  const response = await btgFetch(btgEndpoints.payments(cid), {
    method: 'POST',
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[BTG Service] Erro ao criar pagamento PIX:', error);
    throw new Error(`Erro ao criar pagamento PIX: ${response.status}`);
  }

  const pagamento = await response.json();

  // Salvar no banco local
  await supabase.from('btg_pagamentos').insert({
    despesa_id: params.despesaId,
    tipo: params.tipo,
    btg_id: pagamento.id,
    valor: params.valor,
    data_agendamento: params.dataAgendamento,
    status: 'PENDENTE'
  });

  console.log(`[BTG Service] Pagamento PIX criado: ${pagamento.id} (aguardando aprovação)`);
  return pagamento;
}

interface CriarPagamentoTedParams {
  valor: number;
  favorecido: {
    nome: string;
    documento: string;
    banco: string;
    agencia: string;
    conta: string;
    tipoConta: 'CHECKING' | 'SAVINGS';
  };
  descricao?: string;
  dataAgendamento?: string;
  despesaId?: string;
}

/**
 * Cria um pagamento TED
 */
export async function criarPagamentoTed(
  params: CriarPagamentoTedParams,
  companyId?: string
): Promise<{
  id: string;
  status: string;
}> {
  const cid = getCompanyId(companyId);

  const body = {
    type: 'TED',
    amount: params.valor,
    description: params.descricao,
    scheduledDate: params.dataAgendamento,
    details: {
      beneficiary: {
        name: params.favorecido.nome,
        document: params.favorecido.documento,
        bankCode: params.favorecido.banco,
        branchCode: params.favorecido.agencia,
        accountNumber: params.favorecido.conta,
        accountType: params.favorecido.tipoConta
      }
    }
  };

  const response = await btgFetch(btgEndpoints.payments(cid), {
    method: 'POST',
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[BTG Service] Erro ao criar pagamento TED:', error);
    throw new Error(`Erro ao criar pagamento TED: ${response.status}`);
  }

  const pagamento = await response.json();

  // Salvar no banco local
  await supabase.from('btg_pagamentos').insert({
    despesa_id: params.despesaId,
    tipo: 'TED',
    btg_id: pagamento.id,
    valor: params.valor,
    data_agendamento: params.dataAgendamento,
    status: 'PENDENTE'
  });

  console.log(`[BTG Service] Pagamento TED criado: ${pagamento.id} (aguardando aprovação)`);
  return pagamento;
}

interface CriarPagamentoBoletoParams {
  linhaDigitavel: string;
  valor?: number; // Opcional, usa valor do boleto se não informado
  dataAgendamento?: string;
  despesaId?: string;
}

/**
 * Cria um pagamento de boleto
 */
export async function criarPagamentoBoleto(
  params: CriarPagamentoBoletoParams,
  companyId?: string
): Promise<{
  id: string;
  status: string;
}> {
  const cid = getCompanyId(companyId);

  const body = {
    type: 'BANKSLIP',
    amount: params.valor,
    scheduledDate: params.dataAgendamento,
    details: {
      digitableLine: params.linhaDigitavel
    }
  };

  const response = await btgFetch(btgEndpoints.payments(cid), {
    method: 'POST',
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[BTG Service] Erro ao criar pagamento boleto:', error);
    throw new Error(`Erro ao criar pagamento boleto: ${response.status}`);
  }

  const pagamento = await response.json();

  // Salvar no banco local
  await supabase.from('btg_pagamentos').insert({
    despesa_id: params.despesaId,
    tipo: 'BOLETO',
    btg_id: pagamento.id,
    valor: params.valor,
    data_agendamento: params.dataAgendamento,
    status: 'PENDENTE'
  });

  console.log(`[BTG Service] Pagamento boleto criado: ${pagamento.id} (aguardando aprovação)`);
  return pagamento;
}

/**
 * Consulta status de um pagamento
 */
export async function consultarPagamento(
  pagamentoId: string,
  companyId?: string
): Promise<unknown> {
  const cid = getCompanyId(companyId);
  const response = await btgFetch(btgEndpoints.paymentById(cid, pagamentoId));

  if (!response.ok) {
    throw new Error(`Erro ao consultar pagamento: ${response.status}`);
  }

  return response.json();
}

/**
 * Cancela um pagamento pendente
 */
export async function cancelarPagamento(
  pagamentoId: string,
  companyId?: string
): Promise<void> {
  const cid = getCompanyId(companyId);

  const response = await btgFetch(btgEndpoints.paymentById(cid, pagamentoId), {
    method: 'DELETE'
  });

  if (!response.ok) {
    throw new Error(`Erro ao cancelar pagamento: ${response.status}`);
  }

  await supabase
    .from('btg_pagamentos')
    .update({ status: 'CANCELADO' })
    .eq('btg_id', pagamentoId);

  console.log(`[BTG Service] Pagamento cancelado: ${pagamentoId}`);
}

// ============================================================
// EXPORTAÇÕES
// ============================================================

export default {
  // Configuração
  setDefaultCompany,
  listarEmpresas,

  // Saldo e Extrato
  consultarSaldo,
  consultarExtrato,

  // Boletos
  criarBoleto,
  cancelarBoleto,

  // PIX Cobrança
  criarPixCobranca,

  // Pagamentos
  criarPagamentoPix,
  criarPagamentoTed,
  criarPagamentoBoleto,
  consultarPagamento,
  cancelarPagamento
};
