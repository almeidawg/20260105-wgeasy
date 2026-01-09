// Script para executar SQL das tabelas BTG no Supabase
const { Client } = require('pg');

// Credenciais do Supabase PostgreSQL
const connectionString = 'postgresql://postgres.ahlqzzkxuutwoepirpzr:130300%40%24Wgalmeida@aws-1-sa-east-1.pooler.supabase.com:5432/postgres';

async function executarSQL() {
  const client = new Client({ connectionString });

  try {
    console.log('Conectando ao Supabase PostgreSQL...');
    await client.connect();
    console.log('Conectado!\n');

    // Executar cada bloco SQL separadamente
    const blocos = [
      // 1. Tabela btg_tokens
      {
        nome: 'Criar tabela btg_tokens',
        sql: `
          CREATE TABLE IF NOT EXISTS btg_tokens (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            empresa_id UUID,
            access_token TEXT NOT NULL,
            refresh_token TEXT,
            token_type VARCHAR(50) DEFAULT 'Bearer',
            expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
            scopes TEXT[],
            company_id VARCHAR(100),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          )
        `
      },
      // 2. Tabela btg_cobrancas
      {
        nome: 'Criar tabela btg_cobrancas',
        sql: `
          CREATE TABLE IF NOT EXISTS btg_cobrancas (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            contrato_id UUID,
            parcela_id UUID,
            tipo VARCHAR(20) NOT NULL,
            btg_id VARCHAR(100) UNIQUE,
            valor DECIMAL(15,2) NOT NULL,
            data_vencimento DATE,
            status VARCHAR(20) DEFAULT 'CRIADO',
            linha_digitavel VARCHAR(60),
            codigo_barras VARCHAR(50),
            emv TEXT,
            qr_code_base64 TEXT,
            pago_em TIMESTAMP WITH TIME ZONE,
            valor_pago DECIMAL(15,2),
            webhook_data JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          )
        `
      },
      // 3. Tabela btg_pagamentos
      {
        nome: 'Criar tabela btg_pagamentos',
        sql: `
          CREATE TABLE IF NOT EXISTS btg_pagamentos (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            despesa_id UUID,
            tipo VARCHAR(20) NOT NULL,
            btg_id VARCHAR(100) UNIQUE,
            valor DECIMAL(15,2) NOT NULL,
            descricao TEXT,
            data_agendamento DATE,
            status VARCHAR(20) DEFAULT 'PENDENTE',
            aprovado_em TIMESTAMP WITH TIME ZONE,
            aprovado_por VARCHAR(100),
            executado_em TIMESTAMP WITH TIME ZONE,
            comprovante_url TEXT,
            webhook_data JSONB,
            favorecido_nome VARCHAR(200),
            favorecido_documento VARCHAR(20),
            favorecido_banco VARCHAR(10),
            favorecido_agencia VARCHAR(10),
            favorecido_conta VARCHAR(20),
            favorecido_pix_chave VARCHAR(200),
            favorecido_pix_tipo VARCHAR(20),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          )
        `
      },
      // 4. Tabela btg_webhook_logs
      {
        nome: 'Criar tabela btg_webhook_logs',
        sql: `
          CREATE TABLE IF NOT EXISTS btg_webhook_logs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            evento VARCHAR(100) NOT NULL,
            payload JSONB NOT NULL,
            processado BOOLEAN DEFAULT FALSE,
            erro TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          )
        `
      },
      // 5. Tabela btg_config
      {
        nome: 'Criar tabela btg_config',
        sql: `
          CREATE TABLE IF NOT EXISTS btg_config (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            empresa_id UUID,
            btg_company_id VARCHAR(100),
            btg_account_id VARCHAR(100),
            webhook_url TEXT,
            ativo BOOLEAN DEFAULT TRUE,
            ultima_sincronizacao TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          )
        `
      },
      // 6. Índices
      {
        nome: 'Criar índices',
        sql: `
          CREATE INDEX IF NOT EXISTS idx_btg_tokens_empresa ON btg_tokens(empresa_id);
          CREATE INDEX IF NOT EXISTS idx_btg_cobrancas_contrato ON btg_cobrancas(contrato_id);
          CREATE INDEX IF NOT EXISTS idx_btg_cobrancas_btg_id ON btg_cobrancas(btg_id);
          CREATE INDEX IF NOT EXISTS idx_btg_cobrancas_status ON btg_cobrancas(status);
          CREATE INDEX IF NOT EXISTS idx_btg_pagamentos_despesa ON btg_pagamentos(despesa_id);
          CREATE INDEX IF NOT EXISTS idx_btg_pagamentos_btg_id ON btg_pagamentos(btg_id);
          CREATE INDEX IF NOT EXISTS idx_btg_pagamentos_status ON btg_pagamentos(status);
          CREATE INDEX IF NOT EXISTS idx_btg_webhook_logs_evento ON btg_webhook_logs(evento);
          CREATE INDEX IF NOT EXISTS idx_btg_webhook_logs_processado ON btg_webhook_logs(processado)
        `
      },
      // 7. Função de updated_at
      {
        nome: 'Criar função update_updated_at_column',
        sql: `
          CREATE OR REPLACE FUNCTION update_btg_updated_at()
          RETURNS TRIGGER AS $$
          BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
          END;
          $$ LANGUAGE plpgsql
        `
      },
      // 8. Triggers
      {
        nome: 'Criar triggers de updated_at',
        sql: `
          DROP TRIGGER IF EXISTS btg_tokens_updated_at ON btg_tokens;
          CREATE TRIGGER btg_tokens_updated_at BEFORE UPDATE ON btg_tokens
            FOR EACH ROW EXECUTE FUNCTION update_btg_updated_at();

          DROP TRIGGER IF EXISTS btg_cobrancas_updated_at ON btg_cobrancas;
          CREATE TRIGGER btg_cobrancas_updated_at BEFORE UPDATE ON btg_cobrancas
            FOR EACH ROW EXECUTE FUNCTION update_btg_updated_at();

          DROP TRIGGER IF EXISTS btg_pagamentos_updated_at ON btg_pagamentos;
          CREATE TRIGGER btg_pagamentos_updated_at BEFORE UPDATE ON btg_pagamentos
            FOR EACH ROW EXECUTE FUNCTION update_btg_updated_at();

          DROP TRIGGER IF EXISTS btg_config_updated_at ON btg_config;
          CREATE TRIGGER btg_config_updated_at BEFORE UPDATE ON btg_config
            FOR EACH ROW EXECUTE FUNCTION update_btg_updated_at()
        `
      },
      // 9. Habilitar RLS
      {
        nome: 'Habilitar RLS',
        sql: `
          ALTER TABLE btg_tokens ENABLE ROW LEVEL SECURITY;
          ALTER TABLE btg_cobrancas ENABLE ROW LEVEL SECURITY;
          ALTER TABLE btg_pagamentos ENABLE ROW LEVEL SECURITY;
          ALTER TABLE btg_webhook_logs ENABLE ROW LEVEL SECURITY;
          ALTER TABLE btg_config ENABLE ROW LEVEL SECURITY
        `
      },
      // 10. Políticas RLS para service_role
      {
        nome: 'Criar políticas RLS (btg_tokens)',
        sql: `
          DROP POLICY IF EXISTS "Service role full access btg_tokens" ON btg_tokens;
          CREATE POLICY "Service role full access btg_tokens" ON btg_tokens
            FOR ALL TO service_role USING (true) WITH CHECK (true)
        `
      },
      {
        nome: 'Criar políticas RLS (btg_cobrancas)',
        sql: `
          DROP POLICY IF EXISTS "Service role full access btg_cobrancas" ON btg_cobrancas;
          CREATE POLICY "Service role full access btg_cobrancas" ON btg_cobrancas
            FOR ALL TO service_role USING (true) WITH CHECK (true)
        `
      },
      {
        nome: 'Criar políticas RLS (btg_pagamentos)',
        sql: `
          DROP POLICY IF EXISTS "Service role full access btg_pagamentos" ON btg_pagamentos;
          CREATE POLICY "Service role full access btg_pagamentos" ON btg_pagamentos
            FOR ALL TO service_role USING (true) WITH CHECK (true)
        `
      },
      {
        nome: 'Criar políticas RLS (btg_webhook_logs)',
        sql: `
          DROP POLICY IF EXISTS "Service role full access btg_webhook_logs" ON btg_webhook_logs;
          CREATE POLICY "Service role full access btg_webhook_logs" ON btg_webhook_logs
            FOR ALL TO service_role USING (true) WITH CHECK (true)
        `
      },
      {
        nome: 'Criar políticas RLS (btg_config)',
        sql: `
          DROP POLICY IF EXISTS "Service role full access btg_config" ON btg_config;
          CREATE POLICY "Service role full access btg_config" ON btg_config
            FOR ALL TO service_role USING (true) WITH CHECK (true)
        `
      },
      // 11. Comentários
      {
        nome: 'Adicionar comentários nas tabelas',
        sql: `
          COMMENT ON TABLE btg_tokens IS 'Armazena tokens de acesso OAuth2 do BTG Pactual';
          COMMENT ON TABLE btg_cobrancas IS 'Cobranças geradas via BTG (boletos e PIX QR Code)';
          COMMENT ON TABLE btg_pagamentos IS 'Pagamentos iniciados via BTG (PIX, TED, boletos)';
          COMMENT ON TABLE btg_webhook_logs IS 'Log de webhooks recebidos do BTG';
          COMMENT ON TABLE btg_config IS 'Configuração da integração BTG por empresa'
        `
      }
    ];

    for (const bloco of blocos) {
      try {
        console.log(`➜ ${bloco.nome}...`);
        await client.query(bloco.sql);
        console.log('  ✅ OK\n');
      } catch (err) {
        if (err.message.includes('already exists') || err.message.includes('já existe')) {
          console.log('  ⚠️ Já existe (ignorado)\n');
        } else {
          console.error(`  ❌ Erro: ${err.message}\n`);
        }
      }
    }

    console.log('═'.repeat(50));
    console.log('✅ Script SQL executado com sucesso!');
    console.log('═'.repeat(50));

    // Verificar tabelas criadas
    const { rows } = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name LIKE 'btg_%'
      ORDER BY table_name
    `);

    console.log('\n📋 Tabelas BTG criadas no banco:');
    if (rows.length === 0) {
      console.log('   (nenhuma tabela encontrada)');
    } else {
      rows.forEach(r => console.log(`   ✓ ${r.table_name}`));
    }

  } catch (error) {
    console.error('❌ Erro de conexão:', error.message);
  } finally {
    await client.end();
    console.log('\n🔌 Conexão encerrada.');
  }
}

executarSQL();
