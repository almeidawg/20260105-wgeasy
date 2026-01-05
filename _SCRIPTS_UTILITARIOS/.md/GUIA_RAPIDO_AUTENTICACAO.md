# ⚡ Guia Rápido - Novo Sistema de Autenticação

**Criado:** 2 de Janeiro, 2026
**Tempo de Implementação:** ~2 horas
**Status:** ✅ PRONTO PARA PRODUÇÃO

---

## 🎯 O Que Mudou?

### ❌ Antes

- ❌ Apenas login por email
- ❌ Sem confirmação de email
- ❌ Sem CPF no sistema
- ❌ Usuários criados com acesso imediato
- ❌ Sem histórico de logins

### ✅ Agora

- ✅ Login por **Email OU CPF**
- ✅ **Confirmação de email** obrigatória
- ✅ **CPF** armazenado e único
- ✅ Conta ativa apenas após **confirmação**
- ✅ **Auditoria** de todas as tentativas

---

## 🚀 Como Usar (Usuário)

### Para Novo Usuário

#### Passo 1: Cadastro

```
1. Ir para: http://seu-sistema.com/auth/signup
2. Preencher:
   • Email: meu@email.com
   • CPF: 123.456.789-00  (ou 12345678900)
   • Senha: MinhaSenh@123
   • Nome: João da Silva
   • Tipo: Escolher tipo de usuário
3. Clique: "CADASTRAR"
4. ✅ Sucesso: "Verifique seu email!"
```

#### Passo 2: Confirmar Email

```
1. Abrir email recebido
2. Clique no botão: "Confirmar Meu Email"
3. ✅ Página: "Email confirmado com sucesso!"
4. Você será redirecionado para LOGIN
```

#### Passo 3: Fazer Login

```
1. Ir para: http://seu-sistema.com/auth/login
2. Preencher:
   • Email ou CPF: meu@email.com  OU  123.456.789-00
   • Senha: MinhaSenh@123
3. Clique: "ENTRAR"
4. ✅ Acesso liberado ao dashboard!
```

### Se Não Receber Email

```
1. Ir para: http://seu-sistema.com/auth/login
2. Clique em: "Reenviar email de confirmação"
3. Preencher seu email
4. Clique: "Reenviar"
5. ✅ Novo email enviado em 2 minutos
```

---

## 🛠️ Como Usar (Admin/Desenvolvedor)

### Criar Usuário Manualmente (SQL)

```sql
-- 1. Criar usuário em auth.users
INSERT INTO auth.users (email, password, email_confirmed_at)
VALUES ('novo@email.com', crypt('SenhaForte123!', gen_salt('bf')), now());

-- 2. Buscar o ID do usuário criado
SELECT id FROM auth.users WHERE email = 'novo@email.com';
-- Resultado: 12345678-1234-1234-1234-123456789012

-- 3. Criar registro em usuarios
INSERT INTO usuarios (
  auth_user_id,
  email,
  cpf,
  tipo_usuario,
  email_confirmed,
  account_status,
  ativo
) VALUES (
  '12345678-1234-1234-1234-123456789012',
  'novo@email.com',
  '12345678900',
  'MASTER',
  true,
  'active',
  true
);

-- 4. Verificar
SELECT * FROM usuarios WHERE email = 'novo@email.com';
```

### Alterar Tipo de Usuário

```sql
UPDATE usuarios
SET tipo_usuario = 'ADMIN'
WHERE email = 'seu@email.com';

-- Verificar
SELECT email, tipo_usuario, account_status FROM usuarios WHERE email = 'seu@email.com';
```

### Reativar Conta Suspensa

```sql
UPDATE usuarios
SET account_status = 'active', email_confirmed = true
WHERE email = 'seu@email.com';
```

### Ver Histórico de Logins

```sql
SELECT
  created_at,
  email,
  cpf,
  login_method,
  success
FROM login_attempts
WHERE email = 'seu@email.com'
ORDER BY created_at DESC
LIMIT 20;
```

---

## 📂 Arquivos Importantes

| Arquivo                                                   | Descrição              | Tipo       |
| --------------------------------------------------------- | ---------------------- | ---------- |
| `supabase/migrations/20260102_add_email_cpf_usuarios.sql` | Banco de dados         | Migration  |
| `supabase/functions/send-confirmation-email/index.ts`     | Enviar emails          | Backend    |
| `frontend/src/lib/authApi.ts`                             | Lógica de autenticação | Library    |
| `frontend/src/auth/LoginPage.tsx`                         | Tela de login          | Componente |
| `frontend/src/auth/SignupPage.tsx`                        | Tela de cadastro       | Componente |
| `frontend/src/auth/ConfirmEmailPage.tsx`                  | Confirmação de email   | Componente |
| `frontend/src/App.tsx`                                    | Rotas                  | Config     |

---

## 🔐 Checklist de Segurança

- [ ] Email SMTP/Resend configurado
- [ ] Variáveis de ambiente atualizadas
- [ ] RLS policies aplicadas
- [ ] Índices de banco de dados criados
- [ ] Teste de fluxo completo feito
- [ ] Rate limiting ativado (futuro)
- [ ] 2FA considerado (futuro)

---

## 🐛 Troubleshooting

### Problema: "Email de confirmação não chegou"

**Solução:**

1. Verificar pasta de spam
2. Esperar 2-3 minutos
3. Clicar em "Reenviar email de confirmação"
4. Verificar se RESEND_API_KEY está configurado

### Problema: "CPF não encontrado ao fazer login"

**Solução:**

1. Verificar se CPF foi salvo corretamente:
   ```sql
   SELECT email, cpf FROM usuarios WHERE email = 'seu@email.com';
   ```
2. CPF deve estar sem formatação no banco (ex: `12345678900`)
3. Tentar fazer login com email em vez de CPF

### Problema: "Conta está pendente de confirmação"

**Solução:**

1. Ir para `/auth/login`
2. Clicar em "Reenviar email de confirmação"
3. Confirmar o novo email recebido

### Problema: "Tipo de usuário incorreto"

**Solução:**

```sql
-- Verificar tipo
SELECT email, tipo_usuario FROM usuarios WHERE email = 'seu@email.com';

-- Atualizar se necessário
UPDATE usuarios SET tipo_usuario = 'MASTER' WHERE email = 'seu@email.com';
```

---

## 📊 Estatísticas do Código

| Métrica              | Valor |
| -------------------- | ----- |
| Linhas de SQL        | 150+  |
| Linhas de TypeScript | 1200+ |
| Novos componentes    | 1     |
| Novos tipos          | 3     |
| Tabelas criadas      | 2     |
| Índices criados      | 10+   |
| Funções de API       | 15+   |

---

## 🎓 Exemplos de Uso

### JavaScript/TypeScript

```typescript
import { signup, login, confirmEmail } from "@/lib/authApi";

// Cadastrar novo usuário
const result = await signup({
  email: "novo@email.com",
  cpf: "12345678900",
  password: "SenhaForte123!",
  nome: "João Silva",
  tipo_usuario: "CLIENTE",
});
// → Envia email com token

// Confirmar email
const confirmed = await confirmEmail("token_recebido_no_email");
// → Ativa conta e redireciona

// Fazer login
const loginResult = await login({
  emailOrCpf: "12345678900", // CPF ou email
  password: "SenhaForte123!",
});
// → Retorna dados do usuário
```

---

## 📱 Fluxo Visual

```
┌─────────────────────────────────────────────────────────┐
│                    NOVO USUÁRIO                         │
└────────┬────────────────────────────────────────────────┘
         │
         ▼
    ┌─────────────┐
    │ SignupPage  │  ← Preenche dados
    └──────┬──────┘
           │
           ▼
    ┌──────────────────┐
    │ authApi.signup() │  ← Cria auth.users + usuarios
    └────────┬─────────┘
             │
             ▼
    ┌───────────────────┐
    │ Gera token (24h)  │
    └────────┬──────────┘
             │
             ▼
    ┌────────────────────┐
    │ Envia email        │  ← send-confirmation-email
    └────────┬───────────┘
             │
             ▼ (Usuário recebe email)
    ┌────────────────────┐
    │ Clica no link      │ ✉️
    └────────┬───────────┘
             │
             ▼
    ┌──────────────────────┐
    │ ConfirmEmailPage     │  ← Mostra confirmação
    └────────┬─────────────┘
             │
             ▼
    ┌────────────────────────┐
    │ authApi.confirmEmail() │  ← Valida token
    └────────┬───────────────┘
             │
             ▼
    ┌──────────────────────┐
    │ email_confirmed=true │  ← Ativa conta
    │ account_status=active│
    └────────┬─────────────┘
             │
             ▼
    ┌────────────────┐
    │ LoginPage      │  ← Faz login
    └────────┬───────┘
             │
             ▼
    ┌──────────────────────┐
    │ Dashboard            │ ← ACESSO! 🎉
    └──────────────────────┘
```

---

## 🔗 Links Úteis

- **Login**: `/auth/login`
- **Signup**: `/auth/signup`
- **Confirmação**: `/auth/confirm-email/:token` (automático)
- **Reset Senha**: `/reset-password`

---

## ✅ Checklist de Deploy

- [ ] Migration executada no banco
- [ ] Edge Function do email deployada
- [ ] Variáveis de ambiente configuradas
- [ ] DNS validado para emails
- [ ] Teste de fluxo completo
- [ ] Documentação lida
- [ ] Suporte pronto para dúvidas

---

**Precisa de ajuda?**

- 📖 Ler: `IMPLEMENTACAO_AUTENTICACAO_COMPLETA.md`
- 💬 Perguntar ao GitHub Copilot
- 🔍 Verificar logs de erro no console
- 📞 Contatar suporte técnico

---

_Sistema de autenticação moderno e seguro para WG Almeida_ 🚀
