# 🔴 AUDITORIA CRÍTICA: Falha de Autenticação - 400 Bad Request

**Data:** 2 de janeiro de 2026
**Status:** 🔴 CRÍTICO - Sistema não funciona sem autenticação
**Erro:** `POST /auth/v1/token?grant_type=password 400 (Bad Request)`
**Localização:** `LoginPage.tsx:242`

---

## 📊 Resumo do Problema

### Erro Observado

```
POST https://ahlqzzkxuutwoepirpzr.supabase.co/auth/v1/token?grant_type=password 400 (Bad Request)
```

**O que significa:** Supabase está rejeitando as credenciais enviadas para autenticação.

### Possíveis Causas

1. **Usuário não existe na tabela `auth.users` do Supabase**
2. **Email não foi confirmado** (confirmação pendente)
3. **Usuário foi criado na tabela `usuarios` mas NÃO foi criado no Auth**
4. **Problema de sincronização entre `usuarios` e `auth.users`**
5. **Supabase não sabe como criar usuários novos** (falta de endpoint signup)
6. **Email e senha não correspondem**

---

## 🔍 Estrutura Atual - O Que Está Errado

### Cenário 1: Tentativa de Login

```
Fluxo Atual:
┌─────────────────────┐
│  LoginPage.tsx      │
│  email + password   │
└──────────┬──────────┘
           │
           ↓
┌──────────────────────────────────────┐
│ supabase.auth.signInWithPassword()   │
│ (tenta fazer login)                  │
└──────────┬───────────────────────────┘
           │
           ✗ FALHA 400 Bad Request
           │
           └─→ Usuário não existe em auth.users
               (nunca foi criado)
```

### Cenário 2: O Que Deveria Acontecer

```
Fluxo Correto:
┌──────────────────────────────────────┐
│  SignupPage.tsx                      │
│  email + password + dados            │
└──────────┬───────────────────────────┘
           │
           ↓
┌──────────────────────────────────────┐
│ supabase.auth.signUp()               │
│ (cria usuário em auth.users)         │
└──────────┬───────────────────────────┘
           │
           ✓ Sucesso: usuário criado
           │
           ↓
┌──────────────────────────────────────┐
│ Criar registro em usuarios table      │
│ (vincular usuario_id com auth_user_id)│
└──────────┬───────────────────────────┘
           │
           ✓ Sincronizado
           │
           ↓
┌──────────────────────────────────────┐
│  LoginPage.tsx                       │
│  email + password                    │
└──────────┬───────────────────────────┘
           │
           ↓
┌──────────────────────────────────────┐
│ supabase.auth.signInWithPassword()   │
│ (faz login)                          │
└──────────┬───────────────────────────┘
           │
           ✓ Sucesso: token gerado
           │
           ↓
        Dashboard
```

---

## 🗂️ Problemas Identificados

### Problema 1: Falta de Signup/Cadastro

**Status:** ❌ NÃO EXISTE
**Arquivo:** Nenhum (não existe)
**Descrição:** Não há forma de criar novos usuários

```
Sistema de Autenticação Incompleto:
├── ✅ LoginPage.tsx (login de usuários existentes)
├── ✅ Reset Password (recuperação de senha)
├── ✅ Google OAuth (login com Google)
└── ❌ SignupPage.tsx (FALTANDO - criar usuário novo)
    └── ❌ API para criar usuário em auth.users
    └── ❌ API para vincular com tabela usuarios
```

### Problema 2: Desconexão entre `auth.users` e `usuarios`

**Status:** ⚠️ PARCIAL
**Descrição:** LoginPage tenta vincular após login bem-sucedido, mas:

- Se não há usuário em `auth.users`, login falha ANTES
- Se há, tenta buscar em `usuarios` e vincular (linhas 280-300)
- **Problema:** Lógica de vinculação é paliativo, não solução

### Problema 3: Sem validação de usuário existente

**Status:** ⚠️ MISSING
**Descrição:** Não há verificação antes de tentar login:

```typescript
// Não há:
const usuario = await supabase
  .from("usuarios")
  .select("*")
  .eq("email", email)
  .maybeSingle();

if (!usuario) {
  setError("Usuário não encontrado");
  return;
}

// Deveria ter isso ANTES de tentar login
```

---

## 📋 Dados Esperados - O Que Deveria Existir

### Tabela `auth.users` (Supabase Auth - INVISÍVEL)

```
id (uuid)              ← Identificação única
email (varchar)        ← Chave para login
email_confirmed_at     ← Confirmação de email
encrypted_password     ← Hash da senha
created_at             ← Data criação
updated_at             ← Última atualização
... (outros campos internos)
```

### Tabela `usuarios` (Nossa tabela - VISÍVEL)

```
id (uuid PK)
auth_user_id (uuid FK → auth.users.id)  ← VINCULAÇÃO
pessoa_id (uuid FK → pessoas)
email (varchar)  ← cópia para referência
tipo_usuario (enum)
ativo (boolean)
created_at
updated_at
```

### O Vínculo Correto

```
auth.users                          usuarios
┌──────────────┐                   ┌──────────────┐
│ id: ABC123   │◄───auth_user_id───│ id: XYZ789   │
│ email: ...   │                   │ email: ...   │
│ password:... │                   │ pessoa_id:...│
└──────────────┘                   │ tipo_usuario:│
                                   └──────────────┘
```

---

## ✅ Solução Recomendada

### Passo 1: Criar SignupPage.tsx

Arquivo novo com função para:

1. Validar email (não existe em auth.users)
2. Chamar `supabase.auth.signUp()` para criar usuário
3. Criar registro em `usuarios` table com vinculação
4. Redirecionar para confirmar email ou login

### Passo 2: Adicionar Admin/Setup Endpoint

Para criar usuários de teste:

```typescript
// POST /api/admin/create-user
{
  email: "usuario@example.com",
  password: "senha123",
  nome: "Nome do Usuário",
  tipo_usuario: "JURIDICO"
}
```

### Passo 3: Melhorar LoginPage.tsx

Adicionar:

1. Validação prévia de usuário existente
2. Mensagens de erro melhores
3. Link para "Não tem conta? Cadastre-se"
4. Verificação de email confirmado

### Passo 4: Implementar Email Confirmation

Supabase enviará email com link de confirmação.

---

## 🔧 Implementação Imediata

### Opção A: Criar usuários de teste via Supabase Dashboard (RÁPIDO)

1. Ir para https://app.supabase.com/project/[project-id]/auth
2. Clicar em "Add user"
3. Email + Password (isso cria em `auth.users`)
4. Depois criar registro em `usuarios` table

### Opção B: Criar API Endpoint de Signup (CORRETO)

Criar arquivo:

```
frontend/src/lib/authApi.ts

export async function signup(
  email: string,
  password: string,
  nome: string,
  tipo_usuario: string
) {
  // 1. Criar em auth.users
  const { data, error: signupError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nome, tipo_usuario }
    }
  })

  if (signupError) throw signupError

  // 2. Criar em usuarios table
  await supabase.from('usuarios').insert({
    auth_user_id: data.user?.id,
    email,
    tipo_usuario,
    ativo: true
  })

  return data
}
```

---

## 🧪 Teste Atual

### Reproduzir o Erro

1. Abrir LoginPage
2. Digitar: `teste@example.com` / `senha123`
3. Clicar Login
4. **Erro:** 400 Bad Request

**Motivo:** `teste@example.com` não existe em `auth.users`

---

## 📈 Checklist de Correção

- [ ] Verificar se há usuários em `auth.users` (Supabase Dashboard)
- [ ] Se não houver, criar usuário de teste via Dashboard
- [ ] Criar correspondente em `usuarios` table
- [ ] Testar login novamente
- [ ] Criar SignupPage.tsx para novos usuários
- [ ] Adicionar link "Cadastre-se" em LoginPage
- [ ] Implementar verificação de email
- [ ] Adicionar testes de autenticação
- [ ] Documentar fluxo de autenticação

---

## 🚨 Ações Imediatas

### HOJE:

1. **Criar usuário de teste:**

   - Ir para Supabase Dashboard
   - Auth → Users → Add user
   - Email: `admin@wgalmeida.com.br`, Password: `Admin@123`
   - Click "Create user"

2. **Vincular na tabela usuarios:**

   ```sql
   INSERT INTO usuarios (auth_user_id, email, tipo_usuario, ativo)
   VALUES (
     (SELECT id FROM auth.users WHERE email = 'admin@wgalmeida.com.br'),
     'admin@wgalmeida.com.br',
     'MASTER',
     true
   )
   ```

3. **Testar login:**
   - Abrir LoginPage
   - Digitar credentials
   - Deve funcionar ✓

### SEMANA QUE VEM:

1. Criar SignupPage.tsx
2. Implementar API de signup
3. Adicionar verificação de email
4. Documentar fluxo completo

---

## 📚 Arquivos Relacionados

```
Sistema de Autenticação:
├── frontend/src/auth/
│   ├── LoginPage.tsx (existe, mas sem signup)
│   ├── ResetPassword.tsx (existe)
│   └── SignupPage.tsx ❌ FALTANDO
│
├── frontend/src/lib/
│   ├── supabaseClient.ts (existe)
│   └── authApi.ts ❌ FALTANDO (funções de auth)
│
└── Database (Supabase)
    ├── auth.users (existe, invisível)
    └── usuarios (existe, precisa vincular)
```

---

## 🔐 Diagrama de Fluxo Correto

```
┌─────────────────────────────────────────────────────────────┐
│                   FLUXO DE AUTENTICAÇÃO CORRETO              │
└─────────────────────────────────────────────────────────────┘

NOVO USUÁRIO:
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│ SignupPage   │────→│ supabase.auth    │────→│ auth.users   │
│ (form)       │     │ .signUp()        │     │ (criado)     │
└──────────────┘     └──────────────────┘     └──────────────┘
                                                       │
                                                       ↓
                                                  ┌──────────────┐
                                                  │ usuarios     │
                                                  │ table        │
                                                  │ (vinculado)  │
                                                  └──────────────┘

USUÁRIO EXISTENTE:
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│ LoginPage    │────→│ supabase.auth    │────→│ Dashboard    │
│ (form)       │     │ .signInWithPass()│     │ (logado)     │
└──────────────┘     └──────────────────┘     └──────────────┘
                            ✓ (auth.users verificado)
```

---

## 💡 Conclusão

**O sistema de autenticação está INCOMPLETO:**

1. ❌ Não há forma de criar novos usuários (falta SignupPage)
2. ⚠️ Desvinculação entre `auth.users` e `usuarios` table
3. ⚠️ LoginPage assume usuário já existe
4. ⚠️ Sem validação prévia de usuário

**Solução:** Implementar SignupPage.tsx + melhorar vinculação entre tabelas.

---

**Status:** 🔴 BLOQUEADOR - Sistema não funciona sem isso
**Prioridade:** CRÍTICA
**Próximo Passo:** Criar usuário de teste + implementar SignupPage
