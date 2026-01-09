# Correções Urgentes - Sistema WG Easy

## Data: 2026-01-09

---

## 1. ERROS ORIGINAIS (da solicitação)

### 1.1 Database error saving new user
- **Causa**: Trigger `on_auth_user_created` no Supabase Auth falhando
- **Solução**: Aplicar migration `20260109200000_fix_auth_user_trigger.sql`
- **Como aplicar**:
  ```sql
  -- Executar no SQL Editor do Supabase Dashboard
  -- Conteúdo do arquivo: supabase/migrations/20260109200000_fix_auth_user_trigger.sql
  ```

### 1.2 Edge Function returned non-2xx status
- **Causa**: Edge Functions não existiam no Supabase
- **Solução**: Deploy das Edge Functions criadas
- **Como aplicar**:
  ```bash
  cd E:/sistema/20260105-wgeasy
  supabase login
  supabase link --project-ref ahlqzzkxuutwoepirpzr
  supabase functions deploy criar-usuario-admin
  supabase functions deploy excluir-usuario-admin
  supabase functions deploy alterar-senha-admin
  ```

### 1.3 Cookie __cf_bm rejected
- **Causa**: Cookies do Cloudflare de terceiros sendo rejeitados
- **Status**: Aviso do navegador, NÃO afeta funcionalidade
- **Ação**: Nenhuma correção necessária (imagens carregam normalmente)

### 1.4 Source map error
- **Causa**: Build com source maps corrompidos
- **Solução**: Rebuild do frontend
- **Como aplicar**:
  ```bash
  cd E:/sistema/20260105-wgeasy/frontend
  npm run build
  ```

---

## 2. CORREÇÕES CRÍTICAS IDENTIFICADAS NA VARREDURA

### 2.1 Variáveis de Ambiente Críticas

Verificar se existem no `.env` do backend:
```env
INTERNAL_API_KEY=<chave_interna_obrigatoria>
GOOGLE_SERVICE_ACCOUNT_KEY=<service_account_json>
SUPABASE_URL=https://ahlqzzkxuutwoepirpzr.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
```

### 2.2 Backend server.ts - JWT Validation Bypass

**Arquivo**: `backend/src/server.ts` linha 97-99

**Problema atual**:
```typescript
if (!supabase) {
  console.warn("Supabase not configured - JWT validation disabled");
  return next(); // PERMITE SEM VALIDAÇÃO!
}
```

**Correção recomendada**:
```typescript
if (!supabase) {
  console.error("Supabase not configured - blocking request");
  return res.status(500).json({ error: "Authentication service unavailable" });
}
```

### 2.3 Tipagem com `any` no Backend

**Arquivos prioritários para correção**:
- `backend/src/financeiro/createParcelas.ts` - `lancamento: any`
- `backend/src/shared/calendarService.ts` - Retornos `Promise<any[]>`
- `backend/src/shared/googleKeepApi.ts` - 5 funções com `Promise<any>`

---

## 3. COMANDOS PARA APLICAR CORREÇÕES

### Passo 1: Aplicar Migration do Auth
```bash
# No Supabase Dashboard > SQL Editor
# Colar conteúdo de: supabase/migrations/20260109200000_fix_auth_user_trigger.sql
```

### Passo 2: Deploy das Edge Functions
```bash
cd E:/sistema/20260105-wgeasy
supabase functions deploy
```

### Passo 3: Rebuild do Frontend
```bash
cd E:/sistema/20260105-wgeasy/frontend
npm run build
```

### Passo 4: Reiniciar Backend
```bash
cd E:/sistema/20260105-wgeasy/backend
npm run dev
```

---

## 4. CHECKLIST DE VERIFICAÇÃO

- [ ] Migration do Auth aplicada
- [ ] Edge Functions deployadas
- [ ] Frontend rebuiltado
- [ ] Backend reiniciado
- [ ] Testar criação de novo usuário
- [ ] Verificar logs no Supabase Dashboard

---

## 5. ARQUIVOS CRIADOS/MODIFICADOS

| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| `supabase/migrations/20260109200000_fix_auth_user_trigger.sql` | Novo | Corrige trigger de criação de usuários |
| `supabase/functions/criar-usuario-admin/index.ts` | Novo | Edge Function para criar usuários |
| `supabase/functions/excluir-usuario-admin/index.ts` | Novo | Edge Function para excluir usuários |
| `supabase/functions/alterar-senha-admin/index.ts` | Novo | Edge Function para alterar senha |
| `supabase/functions/README.md` | Novo | Instruções de deploy |
| `CORRECOES_URGENTES.md` | Novo | Este documento |

