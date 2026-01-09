// ============================================================
// BTG PACTUAL EMPRESAS - HANDLER DE WEBHOOKS
// ============================================================

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { btgConfig, BTGWebhookEvent } from './btgConfig';

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Interface para payload de webhook
interface BTGWebhookPayload {
  event: BTGWebhookEvent;
  timestamp: string;
  data: Record<string, unknown>;
}

// Interface para boleto pago
interface BankSlipPaidData {
  id: string;
  barcode: string;
  digitableLine: string;
  amount: number;
  paidAmount: number;
  settledAt: string;
  payer: {
    name: string;
    document: string;
  };
}

// Interface para PIX recebido
interface PixCollectionPaidData {
  id: string;
  txid: string;
  amount: number;
  paidAmount: number;
  paidAt: string;
  endToEndId: string;
  payer: {
    name: string;
    document: string;
  };
}

// Interface para transferência
interface TransferData {
  id: string;
  type: string;
  amount: number;
  status: string;
  scheduledDate?: string;
  executedAt?: string;
}

// Interface para pagamento
interface PaymentData {
  id: string;
  type: string;
  amount: number;
  status: string;
  scheduledDate?: string;
  executedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
}

/**
 * Valida a assinatura do webhook (se configurada)
 */
export function validateWebhookSignature(
  payload: string,
  signature: string
): boolean {
  if (!btgConfig.webhookSecret) {
    console.warn('[BTG Webhook] Webhook secret não configurado - assinatura não validada');
    return true; // Aceitar sem validação se não houver secret
  }

  const expectedSignature = crypto
    .createHmac('sha256', btgConfig.webhookSecret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Processa webhook recebido do BTG
 */
export async function processWebhook(payload: BTGWebhookPayload): Promise<void> {
  console.log(`[BTG Webhook] Evento recebido: ${payload.event}`);

  // Salvar log do webhook
  await logWebhook(payload);

  // Rotear para handler específico
  switch (payload.event) {
    // === BOLETOS ===
    case 'bank-slips.paid':
      await handleBankSlipPaid(payload.data as unknown as BankSlipPaidData);
      break;
    case 'bank-slips.created':
      await handleBankSlipCreated(payload.data);
      break;
    case 'bank-slips.canceled':
      await handleBankSlipCanceled(payload.data);
      break;
    case 'bank-slips.failed':
      await handleBankSlipFailed(payload.data);
      break;

    // === PIX COBRANÇA ===
    case 'instant-collections.paid':
      await handlePixCollectionPaid(payload.data as unknown as PixCollectionPaidData);
      break;

    // === TRANSFERÊNCIAS ===
    case 'transfers.success':
    case 'transfers.confirmed':
      await handleTransferSuccess(payload.data as unknown as TransferData);
      break;
    case 'transfers.failed':
    case 'transfers.canceled':
      await handleTransferFailed(payload.data as unknown as TransferData);
      break;

    // === PAGAMENTOS ===
    case 'payments.confirmed':
    case 'payments.processed':
      await handlePaymentConfirmed(payload.data as unknown as PaymentData);
      break;
    case 'payments.failed':
    case 'payments.canceled':
      await handlePaymentFailed(payload.data as unknown as PaymentData);
      break;
    case 'payments.approval-authorized':
      await handlePaymentApproved(payload.data as unknown as PaymentData);
      break;

    default:
      console.log(`[BTG Webhook] Evento não tratado: ${payload.event}`);
  }
}

/**
 * Salva log do webhook no banco
 */
async function logWebhook(payload: BTGWebhookPayload): Promise<void> {
  try {
    await supabase.from('btg_webhook_logs').insert({
      evento: payload.event,
      payload: payload,
      processado: false
    });
  } catch (error) {
    console.error('[BTG Webhook] Erro ao salvar log:', error);
  }
}

/**
 * Marca webhook como processado
 */
async function markWebhookProcessed(btgId: string, evento: string): Promise<void> {
  try {
    await supabase
      .from('btg_webhook_logs')
      .update({ processado: true })
      .match({ 'payload->data->id': btgId, evento });
  } catch (error) {
    console.error('[BTG Webhook] Erro ao marcar como processado:', error);
  }
}

// ============================================================
// HANDLERS DE BOLETOS
// ============================================================

async function handleBankSlipPaid(data: BankSlipPaidData): Promise<void> {
  console.log(`[BTG Webhook] Boleto pago: ${data.id} - R$ ${data.paidAmount}`);

  try {
    // Atualizar cobrança no sistema
    const { data: cobranca, error } = await supabase
      .from('btg_cobrancas')
      .update({
        status: 'PAGO',
        pago_em: data.settledAt,
        valor_pago: data.paidAmount,
        webhook_data: data
      })
      .eq('btg_id', data.id)
      .select('id, contrato_id')
      .single();

    if (error) {
      console.error('[BTG Webhook] Erro ao atualizar cobrança:', error);
      return;
    }

    // Se tiver contrato vinculado, atualizar financeiro
    if (cobranca?.contrato_id) {
      await registrarRecebimento(cobranca.contrato_id, data.paidAmount, 'BOLETO', data.id);
    }

    await markWebhookProcessed(data.id, 'bank-slips.paid');
    console.log(`[BTG Webhook] Boleto ${data.id} processado com sucesso`);
  } catch (error) {
    console.error('[BTG Webhook] Erro ao processar boleto pago:', error);
  }
}

async function handleBankSlipCreated(data: Record<string, unknown>): Promise<void> {
  console.log(`[BTG Webhook] Boleto criado: ${data.id}`);
  // Geralmente já temos o registro, apenas atualizar status se necessário
}

async function handleBankSlipCanceled(data: Record<string, unknown>): Promise<void> {
  console.log(`[BTG Webhook] Boleto cancelado: ${data.id}`);

  await supabase
    .from('btg_cobrancas')
    .update({ status: 'CANCELADO', webhook_data: data })
    .eq('btg_id', data.id);
}

async function handleBankSlipFailed(data: Record<string, unknown>): Promise<void> {
  console.log(`[BTG Webhook] Boleto falhou: ${data.id}`);

  await supabase
    .from('btg_cobrancas')
    .update({ status: 'FALHA', webhook_data: data })
    .eq('btg_id', data.id);
}

// ============================================================
// HANDLERS DE PIX COBRANÇA
// ============================================================

async function handlePixCollectionPaid(data: PixCollectionPaidData): Promise<void> {
  console.log(`[BTG Webhook] PIX recebido: ${data.id} - R$ ${data.paidAmount}`);

  try {
    // Atualizar cobrança no sistema
    const { data: cobranca, error } = await supabase
      .from('btg_cobrancas')
      .update({
        status: 'PAGO',
        pago_em: data.paidAt,
        valor_pago: data.paidAmount,
        webhook_data: data
      })
      .eq('btg_id', data.id)
      .select('id, contrato_id')
      .single();

    if (error) {
      console.error('[BTG Webhook] Erro ao atualizar cobrança PIX:', error);
      return;
    }

    // Se tiver contrato vinculado, atualizar financeiro
    if (cobranca?.contrato_id) {
      await registrarRecebimento(cobranca.contrato_id, data.paidAmount, 'PIX', data.endToEndId);
    }

    console.log(`[BTG Webhook] PIX ${data.id} processado com sucesso`);
  } catch (error) {
    console.error('[BTG Webhook] Erro ao processar PIX:', error);
  }
}

// ============================================================
// HANDLERS DE TRANSFERÊNCIAS
// ============================================================

async function handleTransferSuccess(data: TransferData): Promise<void> {
  console.log(`[BTG Webhook] Transferência concluída: ${data.id}`);

  await supabase
    .from('btg_pagamentos')
    .update({
      status: 'EXECUTADO',
      webhook_data: data
    })
    .eq('btg_id', data.id);
}

async function handleTransferFailed(data: TransferData): Promise<void> {
  console.log(`[BTG Webhook] Transferência falhou: ${data.id}`);

  await supabase
    .from('btg_pagamentos')
    .update({
      status: 'FALHA',
      webhook_data: data
    })
    .eq('btg_id', data.id);
}

// ============================================================
// HANDLERS DE PAGAMENTOS
// ============================================================

async function handlePaymentConfirmed(data: PaymentData): Promise<void> {
  console.log(`[BTG Webhook] Pagamento confirmado: ${data.id}`);

  const { data: pagamento } = await supabase
    .from('btg_pagamentos')
    .update({
      status: 'EXECUTADO',
      webhook_data: data
    })
    .eq('btg_id', data.id)
    .select('id, despesa_id')
    .single();

  // Atualizar despesa como paga
  if (pagamento?.despesa_id) {
    await supabase
      .from('despesas')
      .update({ status: 'PAGO', data_pagamento: new Date().toISOString() })
      .eq('id', pagamento.despesa_id);
  }
}

async function handlePaymentFailed(data: PaymentData): Promise<void> {
  console.log(`[BTG Webhook] Pagamento falhou: ${data.id}`);

  await supabase
    .from('btg_pagamentos')
    .update({
      status: 'FALHA',
      webhook_data: data
    })
    .eq('btg_id', data.id);
}

async function handlePaymentApproved(data: PaymentData): Promise<void> {
  console.log(`[BTG Webhook] Pagamento aprovado: ${data.id}`);

  await supabase
    .from('btg_pagamentos')
    .update({
      status: 'APROVADO',
      aprovado_em: data.approvedAt,
      aprovado_por: data.approvedBy,
      webhook_data: data
    })
    .eq('btg_id', data.id);
}

// ============================================================
// FUNÇÕES AUXILIARES
// ============================================================

/**
 * Registra recebimento no módulo financeiro
 */
async function registrarRecebimento(
  contratoId: string,
  valor: number,
  tipo: 'BOLETO' | 'PIX',
  referencia: string
): Promise<void> {
  try {
    // Buscar próxima parcela pendente do contrato
    const { data: parcela } = await supabase
      .from('parcelas')
      .select('id')
      .eq('contrato_id', contratoId)
      .eq('status', 'PENDENTE')
      .order('data_vencimento', { ascending: true })
      .limit(1)
      .single();

    if (parcela) {
      // Marcar parcela como paga
      await supabase
        .from('parcelas')
        .update({
          status: 'PAGO',
          data_pagamento: new Date().toISOString(),
          valor_pago: valor,
          forma_pagamento: tipo,
          referencia_pagamento: referencia
        })
        .eq('id', parcela.id);

      console.log(`[BTG Webhook] Parcela ${parcela.id} marcada como paga`);
    }
  } catch (error) {
    console.error('[BTG Webhook] Erro ao registrar recebimento:', error);
  }
}

export default {
  validateWebhookSignature,
  processWebhook
};
