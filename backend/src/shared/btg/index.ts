// ============================================================
// BTG PACTUAL EMPRESAS - MÓDULO PRINCIPAL
// ============================================================

export * from './btgConfig';
export { default as btgAuth } from './btgAuth';
export { default as btgWebhooks } from './btgWebhooks';
export { default as btgService } from './btgService';

// Re-exportar funções principais para uso direto
export {
  getAuthorizationUrl,
  exchangeCodeForTokens,
  refreshAccessToken,
  isAuthenticated
} from './btgAuth';

export {
  validateWebhookSignature,
  processWebhook
} from './btgWebhooks';

export {
  setDefaultCompany,
  listarEmpresas,
  consultarSaldo,
  consultarExtrato,
  criarBoleto,
  cancelarBoleto,
  criarPixCobranca,
  criarPagamentoPix,
  criarPagamentoTed,
  criarPagamentoBoleto,
  consultarPagamento,
  cancelarPagamento
} from './btgService';
