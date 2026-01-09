// ============================================================
// BTG PACTUAL EMPRESAS - CONFIGURAÇÃO
// ============================================================

export const btgConfig = {
  // Credenciais
  clientId: process.env.BTG_CLIENT_ID || '',
  clientSecret: process.env.BTG_CLIENT_SECRET || '',

  // URLs
  apiUrl: process.env.BTG_USE_SANDBOX === 'true'
    ? process.env.BTG_SANDBOX_URL || 'https://api.sandbox.empresas.btgpactual.com'
    : process.env.BTG_API_URL || 'https://api.empresas.btgpactual.com',
  authUrl: process.env.BTG_AUTH_URL || 'https://id.btgpactual.com',

  // Webhook
  webhookSecret: process.env.BTG_WEBHOOK_SECRET || '',

  // Flags
  useSandbox: process.env.BTG_USE_SANDBOX === 'true',

  // Escopos necessários
  scopes: [
    'openid',
    'profile',
    'payments',
    'transfers',
    'bank-slips',
    'pix',
    'accounts',
    'statements'
  ].join(' ')
};

// Endpoints da API
export const btgEndpoints = {
  // Autenticação
  authorize: '/oauth/authorize',
  token: '/oauth/token',

  // Pagamentos
  payments: (companyId: string) => `/v1/companies/${companyId}/payments`,
  paymentById: (companyId: string, paymentId: string) => `/v1/companies/${companyId}/payments/${paymentId}`,

  // Boletos
  bankSlips: (companyId: string) => `/v1/companies/${companyId}/bank-slips`,
  bankSlipById: (companyId: string, slipId: string) => `/v1/companies/${companyId}/bank-slips/${slipId}`,

  // PIX Cobrança
  pixCollections: (companyId: string) => `/v1/companies/${companyId}/pix-cash-in/instant-collections`,
  pixCollectionById: (companyId: string, collectionId: string) => `/v1/companies/${companyId}/pix-cash-in/instant-collections/${collectionId}`,

  // Contas
  accounts: (companyId: string) => `/v1/companies/${companyId}/accounts`,
  balance: (companyId: string, accountId: string) => `/v1/companies/${companyId}/accounts/${accountId}/balance`,
  statements: (companyId: string, accountId: string) => `/v1/companies/${companyId}/accounts/${accountId}/statements`,

  // Empresa
  companies: '/v1/companies'
};

// Tipos de pagamento suportados
export type BTGPaymentType =
  | 'PIX_KEY'           // PIX por chave
  | 'PIX_QR_CODE'       // PIX copia e cola
  | 'PIX_REVERSAL'      // Devolução PIX
  | 'TED'               // Transferência TED
  | 'BANKSLIP'          // Pagamento de boleto
  | 'UTILITIES'         // Contas de consumo
  | 'DARF';             // Impostos

// Tipos de chave PIX
export type BTGPixKeyType = 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'EVP';

// Status de pagamento
export type BTGPaymentStatus =
  | 'PENDING'           // Aguardando aprovação
  | 'APPROVED'          // Aprovado
  | 'PROCESSING'        // Processando
  | 'COMPLETED'         // Concluído
  | 'REJECTED'          // Rejeitado
  | 'CANCELLED';        // Cancelado

// Status de boleto
export type BTGBankSlipStatus =
  | 'CREATED'           // Criado
  | 'REGISTERED'        // Registrado
  | 'PAID'              // Pago
  | 'CANCELLED'         // Cancelado
  | 'EXPIRED';          // Vencido

// Eventos de webhook
export type BTGWebhookEvent =
  // Boletos
  | 'bank-slips.created'
  | 'bank-slips.paid'
  | 'bank-slips.failed'
  | 'bank-slips.updated'
  | 'bank-slips.canceled'
  | 'bank-slips.reversed'
  | 'bank-slips.rejected'
  // PIX
  | 'instant-collections.paid'
  | 'instant-collections.unlinked'
  | 'automatic-pix.authorization-created'
  | 'automatic-pix.scheduling-approved'
  | 'automatic-pix.scheduling-paid'
  | 'automatic-pix.canceled'
  // Transferências
  | 'transfers.success'
  | 'transfers.processing'
  | 'transfers.failed'
  | 'transfers.canceled'
  | 'transfers.confirmed'
  | 'transfers.scheduled'
  // Pagamentos
  | 'payments.created'
  | 'payments.confirmed'
  | 'payments.failed'
  | 'payments.canceled'
  | 'payments.processed'
  | 'payments.scheduled'
  | 'payments.approval-authorized'
  | 'payments.approval-cancelled';

console.log(`[BTG] Configurado para ambiente: ${btgConfig.useSandbox ? 'SANDBOX' : 'PRODUÇÃO'}`);
console.log(`[BTG] API URL: ${btgConfig.apiUrl}`);
