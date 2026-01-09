-- ============================================================
-- BTG PACTUAL EMPRESAS - TABELAS DE INTEGRAÇÃO
-- Execute este script no Supabase SQL Editor
-- ============================================================

-- Tabela para armazenar tokens de acesso BTG
CREATE TABLE IF NOT EXISTS btg_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_type VARCHAR(50) DEFAULT 'Bearer',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  scopes TEXT[],
  company_id VARCHAR(100), -- ID da empresa no BTG
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para busca por empresa
CREATE INDEX IF NOT EXISTS idx_btg_tokens_empresa ON btg_tokens(empresa_id);

-- Tabela para cobranças BTG (boletos e PIX)
CREATE TABLE IF NOT EXISTS btg_cobrancas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID REFERENCES contratos(id) ON DELETE SET NULL,
  parcela_id UUID, -- Referência à parcela se aplicável
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('BOLETO', 'PIX_COBRANCA')),
  btg_id VARCHAR(100) UNIQUE, -- ID no BTG
  valor DECIMAL(15,2) NOT NULL,
  data_vencimento DATE,
  status VARCHAR(20) DEFAULT 'CRIADO' CHECK (status IN (
    'CRIADO', 'REGISTRADO', 'ATIVO', 'PAGO', 'CANCELADO', 'EXPIRADO', 'FALHA'
  )),
  linha_digitavel VARCHAR(60),
  codigo_barras VARCHAR(50),
  emv TEXT, -- Código PIX copia e cola
  qr_code_base64 TEXT,
  pago_em TIMESTAMP WITH TIME ZONE,
  valor_pago DECIMAL(15,2),
  webhook_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para cobranças
CREATE INDEX IF NOT EXISTS idx_btg_cobrancas_contrato ON btg_cobrancas(contrato_id);
CREATE INDEX IF NOT EXISTS idx_btg_cobrancas_btg_id ON btg_cobrancas(btg_id);
CREATE INDEX IF NOT EXISTS idx_btg_cobrancas_status ON btg_cobrancas(status);

-- Tabela para pagamentos BTG (PIX, TED, boletos de fornecedores)
CREATE TABLE IF NOT EXISTS btg_pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  despesa_id UUID, -- Referência à despesa se aplicável
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN (
    'PIX_KEY', 'PIX_QR_CODE', 'PIX_REVERSAL', 'TED', 'BOLETO', 'UTILITIES', 'DARF'
  )),
  btg_id VARCHAR(100) UNIQUE, -- ID no BTG
  valor DECIMAL(15,2) NOT NULL,
  descricao TEXT,
  data_agendamento DATE,
  status VARCHAR(20) DEFAULT 'PENDENTE' CHECK (status IN (
    'PENDENTE', 'APROVADO', 'PROCESSANDO', 'EXECUTADO', 'REJEITADO', 'CANCELADO', 'FALHA'
  )),
  aprovado_em TIMESTAMP WITH TIME ZONE,
  aprovado_por VARCHAR(100),
  executado_em TIMESTAMP WITH TIME ZONE,
  comprovante_url TEXT,
  webhook_data JSONB,
  -- Dados do favorecido (para TED/PIX)
  favorecido_nome VARCHAR(200),
  favorecido_documento VARCHAR(20),
  favorecido_banco VARCHAR(10),
  favorecido_agencia VARCHAR(10),
  favorecido_conta VARCHAR(20),
  favorecido_pix_chave VARCHAR(200),
  favorecido_pix_tipo VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para pagamentos
CREATE INDEX IF NOT EXISTS idx_btg_pagamentos_despesa ON btg_pagamentos(despesa_id);
CREATE INDEX IF NOT EXISTS idx_btg_pagamentos_btg_id ON btg_pagamentos(btg_id);
CREATE INDEX IF NOT EXISTS idx_btg_pagamentos_status ON btg_pagamentos(status);

-- Tabela para log de webhooks
CREATE TABLE IF NOT EXISTS btg_webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  processado BOOLEAN DEFAULT FALSE,
  erro TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para busca por evento
CREATE INDEX IF NOT EXISTS idx_btg_webhook_logs_evento ON btg_webhook_logs(evento);
CREATE INDEX IF NOT EXISTS idx_btg_webhook_logs_processado ON btg_webhook_logs(processado);

-- Tabela para configuração da empresa no BTG
CREATE TABLE IF NOT EXISTS btg_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  btg_company_id VARCHAR(100), -- ID da empresa no BTG
  btg_account_id VARCHAR(100), -- ID da conta principal
  webhook_url TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  ultima_sincronizacao TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(empresa_id)
);

-- ============================================================
-- TRIGGERS PARA UPDATED_AT
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS btg_tokens_updated_at ON btg_tokens;
CREATE TRIGGER btg_tokens_updated_at
  BEFORE UPDATE ON btg_tokens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS btg_cobrancas_updated_at ON btg_cobrancas;
CREATE TRIGGER btg_cobrancas_updated_at
  BEFORE UPDATE ON btg_cobrancas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS btg_pagamentos_updated_at ON btg_pagamentos;
CREATE TRIGGER btg_pagamentos_updated_at
  BEFORE UPDATE ON btg_pagamentos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS btg_config_updated_at ON btg_config;
CREATE TRIGGER btg_config_updated_at
  BEFORE UPDATE ON btg_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- POLÍTICAS DE SEGURANÇA (RLS)
-- ============================================================

-- Habilitar RLS
ALTER TABLE btg_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE btg_cobrancas ENABLE ROW LEVEL SECURITY;
ALTER TABLE btg_pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE btg_webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE btg_config ENABLE ROW LEVEL SECURITY;

-- Política para service role (backend) - acesso total
CREATE POLICY "Service role full access btg_tokens" ON btg_tokens
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access btg_cobrancas" ON btg_cobrancas
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access btg_pagamentos" ON btg_pagamentos
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access btg_webhook_logs" ON btg_webhook_logs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access btg_config" ON btg_config
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Política para usuários autenticados (leitura de suas cobranças)
CREATE POLICY "Users can view own cobrancas" ON btg_cobrancas
  FOR SELECT TO authenticated
  USING (
    contrato_id IN (
      SELECT id FROM contratos WHERE cliente_id IN (
        SELECT id FROM pessoas WHERE auth_user_id = auth.uid()
      )
    )
  );

-- ============================================================
-- COMENTÁRIOS
-- ============================================================

COMMENT ON TABLE btg_tokens IS 'Armazena tokens de acesso OAuth2 do BTG Pactual';
COMMENT ON TABLE btg_cobrancas IS 'Cobranças geradas via BTG (boletos e PIX QR Code)';
COMMENT ON TABLE btg_pagamentos IS 'Pagamentos iniciados via BTG (PIX, TED, boletos)';
COMMENT ON TABLE btg_webhook_logs IS 'Log de webhooks recebidos do BTG';
COMMENT ON TABLE btg_config IS 'Configuração da integração BTG por empresa';
