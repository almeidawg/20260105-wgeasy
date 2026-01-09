# Estudo de Integração - API BTG Pactual Empresas

## 1. Visão Geral

O BTG Pactual Empresas oferece um conjunto completo de APIs para automação de processos financeiros empresariais. A integração permite automatizar rotinas bancárias, reduzir erros operacionais e manter controle financeiro centralizado.

**Portal de Desenvolvedores:** https://developers.empresas.btgpactual.com/

---

## 2. Requisitos para Integração

### 2.1 Conta e Plano
- **Conta PJ BTG Pactual** - Sem taxa de abertura/manutenção
- **Plano Avançado** - Obrigatório para APIs em produção
- **Usuário Desenvolvedor** - Cadastro na Área do Desenvolvedor

### 2.2 Credenciais
- **Client ID** - Identificador da aplicação
- **Client Secret** - Chave secreta da aplicação
- Gerados no Internet Banking pelo titular da conta

### 2.3 Ambientes
| Ambiente | URL Base |
|----------|----------|
| Sandbox | `https://api.sandbox.empresas.btgpactual.com` |
| Produção | `https://api.empresas.btgpactual.com` |

---

## 3. Autenticação OAuth 2.0

### 3.1 Fluxos Disponíveis

| Fluxo | Uso | Descrição |
|-------|-----|-----------|
| **Authorization Code** | Web Apps | Troca código de autorização por token após login/consentimento |
| **Authorization Code + PKCE** | Mobile/SPA | Para ambientes inseguros, usa chave PKCE dinâmica |
| **Refresh Token** | Renovação | Renova tokens sem novo login (cota por hora) |
| **Client Credentials** | Server-to-Server | Token sem interação do usuário |

### 3.2 Fluxo Obrigatório para Operações Financeiras

> **IMPORTANTE:** Para acessar dados de conta PJ, realizar transferências, emitir boletos, PIX e movimentações financeiras, é **OBRIGATÓRIO** usar o fluxo **Authorization Code**.

### 3.3 Exemplo de Fluxo Authorization Code

```
1. Redirecionar usuário para BTG ID
   GET https://id.btgpactual.com/authorize
   ?client_id={CLIENT_ID}
   &redirect_uri={REDIRECT_URI}
   &response_type=code
   &scope={ESCOPOS}
   &state={STATE}

2. Usuário faz login e autoriza

3. BTG redireciona para callback com código
   GET {REDIRECT_URI}?code={AUTH_CODE}&state={STATE}

4. Trocar código por token
   POST https://id.btgpactual.com/oauth/token
   Content-Type: application/x-www-form-urlencoded

   grant_type=authorization_code
   &code={AUTH_CODE}
   &client_id={CLIENT_ID}
   &client_secret={CLIENT_SECRET}
   &redirect_uri={REDIRECT_URI}

5. Resposta com tokens
   {
     "access_token": "eyJ...",
     "token_type": "Bearer",
     "expires_in": 3600,
     "refresh_token": "eyJ..."
   }
```

---

## 4. APIs Disponíveis

### 4.1 Pagamentos e Transferências

**Endpoint:** `POST /v1/companies/{companyId}/payments`

#### Tipos de Pagamento Suportados

| Tipo | Descrição | Requisito |
|------|-----------|-----------|
| `PIX_KEY` | PIX por chave | Chave PIX válida |
| `PIX_QR_CODE` | PIX copia e cola | Código EMV do QR Code |
| `PIX_REVERSAL` | Devolução PIX | `originalEndToEndId` |
| `TED` | Transferência TED | Dados bancários |
| `BANKSLIP` | Pagamento de boleto | Linha digitável |
| `UTILITIES` | Contas de consumo | Código de barras |
| `DARF` | Impostos federais | Dados do DARF |

#### Exemplo - Pagamento PIX por Chave
```json
POST /v1/companies/{companyId}/payments
Authorization: Bearer {ACCESS_TOKEN}
Content-Type: application/json

{
  "type": "PIX_KEY",
  "amount": 150.00,
  "description": "Pagamento fornecedor",
  "scheduledDate": "2026-01-15",
  "details": {
    "pixKey": "fornecedor@email.com",
    "pixKeyType": "EMAIL"
  }
}
```

#### Fluxo de Aprovação
> As requisições criam **"iniciações de pagamento"** que devem ser aprovadas via:
> - Internet Banking
> - Aplicativo Mobile
>
> Respeitando firmas e poderes da empresa. O dinheiro **NÃO** é movimentado instantaneamente.

---

### 4.2 Cobrança (Boletos)

**Endpoint:** `POST /v1/companies/{companyId}/bank-slips`

#### Funcionalidades
- Emissão de boletos únicos ou em lote
- Boletos parcelados
- Boletos híbridos (código de barras + QR Code PIX)
- Cálculo automático de juros e multa

#### Participantes
- **Cedente/Beneficiário:** Quem emite o boleto (sua empresa)
- **Sacado:** Quem paga o boleto (cliente)

#### Exemplo - Criar Boleto
```json
POST /v1/companies/{companyId}/bank-slips
Authorization: Bearer {ACCESS_TOKEN}
Content-Type: application/json

{
  "amount": 1500.00,
  "dueDate": "2026-02-15",
  "payer": {
    "name": "Cliente Exemplo Ltda",
    "documentNumber": "12345678000199",
    "address": {
      "street": "Rua Exemplo",
      "number": "123",
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "01310100"
    }
  },
  "description": "Serviço de arquitetura",
  "fine": {
    "percentage": 2.0,
    "daysAfterDue": 1
  },
  "interest": {
    "dailyPercentage": 0.033
  },
  "enablePixPayment": true
}
```

#### Liquidação
- Liquidação ocorre em **D+1** independente do horário
- Webhook `bank-slips.paid` retorna data em `settledAt`

---

### 4.3 PIX Cobrança (QR Code Dinâmico)

**Endpoint:** `POST /v1/companies/{companyId}/pix-cash-in/instant-collections`

#### Exemplo - Criar Cobrança PIX
```json
POST /v1/companies/{companyId}/pix-cash-in/instant-collections
Authorization: Bearer {ACCESS_TOKEN}
Content-Type: application/json

{
  "amount": 350.00,
  "expirationInMinutes": 60,
  "description": "Pagamento pedido #12345",
  "payer": {
    "name": "João Silva",
    "document": "12345678900"
  }
}
```

#### Resposta
```json
{
  "id": "abc123",
  "status": "ACTIVE",
  "amount": 350.00,
  "emv": "00020126580014br.gov.bcb.pix...",
  "qrCodeBase64": "data:image/png;base64,...",
  "expiresAt": "2026-01-09T15:00:00Z"
}
```

---

### 4.4 Saldo e Extrato

**Endpoints:**
- `GET /v1/companies/{companyId}/accounts/{accountId}/balance`
- `GET /v1/companies/{companyId}/accounts/{accountId}/statements`

#### Exemplo - Consultar Saldo
```json
GET /v1/companies/{companyId}/accounts/{accountId}/balance
Authorization: Bearer {ACCESS_TOKEN}

// Resposta
{
  "accountId": "acc-123",
  "balance": {
    "available": 45000.00,
    "blocked": 1500.00,
    "total": 46500.00
  },
  "updatedAt": "2026-01-09T10:30:00Z"
}
```

#### Exemplo - Consultar Extrato
```json
GET /v1/companies/{companyId}/accounts/{accountId}/statements
  ?startDate=2026-01-01
  &endDate=2026-01-09
Authorization: Bearer {ACCESS_TOKEN}

// Resposta
{
  "statements": [
    {
      "id": "tx-001",
      "date": "2026-01-08",
      "type": "CREDIT",
      "amount": 5000.00,
      "description": "PIX RECEBIDO",
      "balance": 45000.00
    },
    {
      "id": "tx-002",
      "date": "2026-01-07",
      "type": "DEBIT",
      "amount": 1200.00,
      "description": "TED ENVIADA",
      "balance": 40000.00
    }
  ]
}
```

---

## 5. Webhooks

### 5.1 Configuração
Os webhooks são configurados na Área do Desenvolvedor e notificam eventos em tempo real.

### 5.2 Eventos Disponíveis

| Evento | Descrição |
|--------|-----------|
| `bank-slips.paid` | Boleto pago |
| `bank-slips.registered` | Boleto registrado |
| `bank-slips.cancelled` | Boleto cancelado |
| `pix.received` | PIX recebido |
| `pix.sent` | PIX enviado |
| `payment.approved` | Pagamento aprovado |
| `payment.rejected` | Pagamento rejeitado |

### 5.3 Exemplo de Payload Webhook
```json
{
  "event": "bank-slips.paid",
  "timestamp": "2026-01-09T14:30:00Z",
  "data": {
    "id": "boleto-123",
    "amount": 1500.00,
    "paidAmount": 1500.00,
    "settledAt": "2026-01-10",
    "payer": {
      "name": "Cliente Exemplo",
      "document": "12345678000199"
    }
  }
}
```

### 5.4 Autenticação do Webhook
> A autenticação do Webhook é exigida pelo BTG a cada **24 horas**.
> Recomenda-se executar rotina automática 3x ao dia para manter integração ativa.

---

## 6. Sandbox (Ambiente de Testes)

### 6.1 Características
- Respostas estáticas e controladas
- Simula todo o fluxo das APIs
- Sem movimentação real de dinheiro
- Headers especiais para cenários de teste

### 6.2 URL Sandbox
```
https://api.sandbox.empresas.btgpactual.com
```

### 6.3 Headers de Teste
```
X-Sandbox-Scenario: success
X-Sandbox-Scenario: error-insufficient-funds
X-Sandbox-Scenario: timeout
```

---

## 7. Proposta de Implementação para WG Easy

### 7.1 Módulos a Desenvolver

#### Módulo 1: Autenticação BTG
```
backend/src/services/btg/
├── btgAuth.ts           # Fluxo OAuth2
├── btgTokenManager.ts   # Gerenciamento de tokens
└── btgClient.ts         # Cliente HTTP configurado
```

#### Módulo 2: Pagamentos
```
backend/src/services/btg/
├── btgPayments.ts       # API de pagamentos
├── btgPix.ts            # Operações PIX
└── btgTed.ts            # Transferências TED
```

#### Módulo 3: Cobranças
```
backend/src/services/btg/
├── btgBoletos.ts        # Emissão de boletos
├── btgPixCobranca.ts    # QR Code dinâmico
└── btgWebhooks.ts       # Handler de webhooks
```

#### Módulo 4: Conciliação
```
backend/src/services/btg/
├── btgExtrato.ts        # Consulta de extratos
├── btgSaldo.ts          # Consulta de saldo
└── btgConciliacao.ts    # Conciliação automática
```

### 7.2 Tabelas Sugeridas

```sql
-- Tokens de acesso BTG
CREATE TABLE btg_tokens (
  id UUID PRIMARY KEY,
  empresa_id UUID REFERENCES empresas(id),
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP,
  scopes TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Cobranças BTG (boletos/PIX)
CREATE TABLE btg_cobrancas (
  id UUID PRIMARY KEY,
  contrato_id UUID REFERENCES contratos(id),
  tipo VARCHAR(20), -- BOLETO, PIX_COBRANCA
  btg_id VARCHAR(100),
  valor DECIMAL(15,2),
  data_vencimento DATE,
  status VARCHAR(20),
  emv TEXT, -- código PIX copia e cola
  linha_digitavel VARCHAR(50),
  pago_em TIMESTAMP,
  valor_pago DECIMAL(15,2),
  webhook_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Pagamentos BTG
CREATE TABLE btg_pagamentos (
  id UUID PRIMARY KEY,
  despesa_id UUID REFERENCES despesas(id),
  tipo VARCHAR(20), -- PIX, TED, BOLETO
  btg_id VARCHAR(100),
  valor DECIMAL(15,2),
  data_agendamento DATE,
  status VARCHAR(20), -- PENDENTE, APROVADO, EXECUTADO, REJEITADO
  aprovado_em TIMESTAMP,
  aprovado_por VARCHAR(100),
  comprovante_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Log de webhooks
CREATE TABLE btg_webhook_logs (
  id UUID PRIMARY KEY,
  evento VARCHAR(50),
  payload JSONB,
  processado BOOLEAN DEFAULT FALSE,
  erro TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 7.3 Fluxos de Integração

#### Fluxo 1: Cobrança de Cliente
```
1. Usuário cria cobrança no sistema
2. Sistema chama API BTG para gerar boleto/PIX
3. Boleto/QR Code exibido no portal do cliente
4. Cliente paga
5. BTG envia webhook de pagamento
6. Sistema atualiza status e registra recebimento
```

#### Fluxo 2: Pagamento de Fornecedor
```
1. Usuário registra despesa com dados de pagamento
2. Sistema cria iniciação de pagamento via API
3. Administrador aprova no app BTG
4. BTG processa o pagamento
5. Webhook notifica conclusão
6. Sistema registra comprovante
```

#### Fluxo 3: Conciliação Bancária
```
1. Job diário consulta extrato via API
2. Sistema compara com lançamentos internos
3. Identifica pagamentos recebidos
4. Atualiza status de cobranças
5. Gera relatório de conciliação
```

---

## 8. Considerações Importantes

### 8.1 Segurança
- **NUNCA** armazenar `client_secret` no frontend
- Usar variáveis de ambiente para credenciais
- Implementar refresh token antes da expiração
- Validar assinatura de webhooks

### 8.2 Aprovação de Pagamentos
- Pagamentos **NÃO** são instantâneos via API
- Requerem aprovação manual no app/internet banking
- Respeitar alçadas e poderes da empresa

### 8.3 Limitações
- Cota de refresh token por hora
- Ambiente produção requer Plano Avançado
- Algumas operações podem ter delay de D+1

---

## 9. Próximos Passos

1. [ ] Abrir conta BTG Pactual Empresas (se não tiver)
2. [ ] Contratar Plano Avançado
3. [ ] Cadastrar usuário desenvolvedor
4. [ ] Criar aplicação e obter credenciais
5. [ ] Configurar ambiente Sandbox
6. [ ] Implementar módulo de autenticação
7. [ ] Implementar emissão de boletos
8. [ ] Implementar PIX cobrança
9. [ ] Configurar webhooks
10. [ ] Implementar pagamentos
11. [ ] Implementar conciliação bancária
12. [ ] Testes em Sandbox
13. [ ] Migração para Produção

---

## 10. Links Úteis

- [Portal de Desenvolvedores](https://developers.empresas.btgpactual.com/)
- [Documentação Inicial](https://developers.empresas.btgpactual.com/docs/comecando)
- [Fluxos de Autenticação](https://developers.empresas.btgpactual.com/docs/fluxos-de-autentica%C3%A7%C3%A3o)
- [API de Pagamentos](https://developers.empresas.btgpactual.com/docs/pagamentos)
- [API de Boletos](https://developers.empresas.btgpactual.com/docs/boletos)
- [Saldo e Extrato](https://developers.empresas.btgpactual.com/docs/contas-pessoa-juridica)
- [Console do Desenvolvedor](https://console.developers.empresas.btgpactual.com/)

**Contato para Implantação:** implantacao@btgpactual.com
