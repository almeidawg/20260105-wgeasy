# 🔍 DIAGNÓSTICO DE LOGIN - Verificação de Usuários Cadastrados

**Data:** 2 de Janeiro, 2026
**Erro:** POST 400 Bad Request ao fazer login
**Localização:** LoginPage.tsx:242

---

## 📋 QUERIES PARA DIAGNOSTICAR

### QUERY 1: Listar Todos os Usuários e Status

Execute no **Supabase SQL Editor**:

```sql
-- Todos os usuários cadastrados com status completo
SELECT
  u.id,
  u.auth_user_id,
  p.nome as usuario_nome,
  p.email,
  u.cpf,
  u.tipo_usuario,
  u.ativo,
  u.email_confirmed,
  u.account_status,
  u.primeiro_acesso,
  u.criado_em,
  u.atualizado_em
FROM usuarios u
LEFT JOIN pessoas p ON p.id = u.pessoa_id
ORDER BY u.criado_em DESC;
```

**O que procurar:**

- ✅ `ativo = true` → Usuário está ativo
- ✅ `email_confirmed = true` → Email confirmado
- ✅ `account_status = 'active'` → Conta ativa
- ❌ `email_confirmed = false` → Email NÃO confirmado (problema!)
- ❌ `account_status = 'pending'` → Conta pendente (problema!)

---

### QUERY 2: Verificar Usuários em auth.users (Supabase Auth)

```sql
-- Verificar status de autenticação no Supabase
SELECT
  id,
  email,
  phone,
  confirmed_at,
  last_sign_in_at,
  created_at,
  updated_at
FROM auth.users
ORDER BY created_at DESC;
```

**O que procurar:**

- ✅ `confirmed_at IS NOT NULL` → Email confirmado
- ❌ `confirmed_at IS NULL` → Email NÃO confirmado (problema!)
- ❌ Usuário não existe aqui mas existe em `usuarios` (problema de sincronização!)

---

### QUERY 3: Comparar Usuários (usuarios vs auth.users)

```sql
-- Ver se há discrepâncias entre tabelas
SELECT
  u.id,
  p.nome,
  p.email,
  u.auth_user_id,
  CASE WHEN au.id IS NULL THEN '❌ NÃO EXISTE EM auth.users'
       WHEN au.confirmed_at IS NULL THEN '⚠️ EMAIL NÃO CONFIRMADO'
       ELSE '✅ USUARIO VALIDO'
  END as status
FROM usuarios u
LEFT JOIN pessoas p ON p.id = u.pessoa_id
LEFT JOIN auth.users au ON au.id = u.auth_user_id
WHERE u.ativo = true
ORDER BY p.nome;
```

---

### QUERY 4: Usuários Pendentes de Email

```sql
-- Quais usuários ainda não confirmaram email
SELECT
  p.nome,
  p.email,
  u.email_confirmed,
  u.account_status,
  au.confirmed_at,
  u.criado_em
FROM usuarios u
LEFT JOIN pessoas p ON p.id = u.pessoa_id
LEFT JOIN auth.users au ON au.id = u.auth_user_id
WHERE u.email_confirmed = false OR au.confirmed_at IS NULL
ORDER BY u.criado_em DESC;
```

---

### QUERY 5: Contar Usuários por Status

```sql
-- Resumo dos usuários por status
SELECT
  COUNT(*) as total_usuarios,
  SUM(CASE WHEN u.ativo = true THEN 1 ELSE 0 END) as ativos,
  SUM(CASE WHEN u.email_confirmed = true THEN 1 ELSE 0 END) as email_confirmado,
  SUM(CASE WHEN u.account_status = 'active' THEN 1 ELSE 0 END) as conta_ativa
FROM usuarios u;
```

---

## 🔧 VERIFICAR ERRO 400 - CAUSAS COMUNS

### ❌ Causa 1: Email NÃO Confirmado

```sql
-- Usuários sem email confirmado
SELECT p.nome, p.email, u.email_confirmed, u.account_status
FROM usuarios u
LEFT JOIN pessoas p ON p.id = u.pessoa_id
WHERE u.email_confirmed = false OR u.account_status = 'pending';
```

**Solução:** Confirmar email primeiro

- Enviar link de confirmação
- Ou executar:

```sql
UPDATE usuarios
SET email_confirmed = true,
    account_status = 'active',
    email_confirmed_at = now()
WHERE id = 'usuario_id_aqui';
```

---

### ❌ Causa 2: Usuário Não Existe em auth.users

```sql
-- Usuários sem auth_user_id válido
SELECT p.nome, p.email, u.auth_user_id
FROM usuarios u
LEFT JOIN pessoas p ON p.id = u.pessoa_id
WHERE u.auth_user_id IS NULL OR NOT EXISTS (
  SELECT 1 FROM auth.users au WHERE au.id = u.auth_user_id
);
```

**Solução:** Recriar usuário em Supabase Auth ou atualizar auth_user_id

---

### ❌ Causa 3: Usuário Inativo

```sql
-- Usuários desativados
SELECT p.nome, p.email, u.ativo, u.account_status
FROM usuarios u
LEFT JOIN pessoas p ON p.id = u.pessoa_id
WHERE u.ativo = false;
```

**Solução:** Ativar usuário

```sql
UPDATE usuarios SET ativo = true WHERE id = 'usuario_id_aqui';
```

---

### ❌ Causa 4: Email Diferente Entre Tabelas

```sql
-- Verificar se emails coincidem
SELECT
  p.email as email_pessoas,
  au.email as email_auth,
  CASE WHEN p.email != au.email THEN '❌ DIFERENTE'
       ELSE '✅ OK'
  END as status
FROM usuarios u
JOIN pessoas p ON p.id = u.pessoa_id
LEFT JOIN auth.users au ON au.id = u.auth_user_id
WHERE au.id IS NOT NULL;
```

**Solução:** Sincronizar emails

---

## ✅ SCRIPT COMPLETO DE DIAGNÓSTICO

```sql
-- =====================================================
-- DIAGNÓSTICO COMPLETO DE LOGIN
-- =====================================================

-- 1. Contar usuários por status
SELECT '=== RESUMO ===' as info;
SELECT
  'Total usuários:' as metric,
  COUNT(*) as value
FROM usuarios;

SELECT
  'Usuários ativos:' as metric,
  COUNT(*) as value
FROM usuarios WHERE ativo = true;

SELECT
  'Emails confirmados:' as metric,
  COUNT(*) as value
FROM usuarios WHERE email_confirmed = true;

SELECT
  'Contas ativas:' as metric,
  COUNT(*) as value
FROM usuarios WHERE account_status = 'active';

-- 2. Listar problemas
SELECT '=== PROBLEMAS ENCONTRADOS ===' as info;

SELECT
  p.nome,
  p.email,
  'Email não confirmado' as problema,
  u.email_confirmed
FROM usuarios u
LEFT JOIN pessoas p ON p.id = u.pessoa_id
WHERE u.email_confirmed = false;

SELECT
  p.nome,
  p.email,
  'Usuário não existe em auth.users' as problema,
  u.auth_user_id
FROM usuarios u
LEFT JOIN pessoas p ON p.id = u.pessoa_id
WHERE u.auth_user_id IS NULL OR NOT EXISTS (
  SELECT 1 FROM auth.users au WHERE au.id = u.auth_user_id
);

SELECT
  p.nome,
  p.email,
  'Usuário inativo' as problema,
  u.ativo
FROM usuarios u
LEFT JOIN pessoas p ON p.id = u.pessoa_id
WHERE u.ativo = false;

-- 3. Listar usuários OK (podem fazer login)
SELECT '=== USUÁRIOS OK PARA LOGIN ===' as info;
SELECT
  p.nome,
  p.email,
  u.cpf,
  u.tipo_usuario,
  u.ativo,
  u.email_confirmed,
  u.account_status
FROM usuarios u
LEFT JOIN pessoas p ON p.id = u.pessoa_id
WHERE u.ativo = true
  AND u.email_confirmed = true
  AND u.account_status = 'active'
  AND u.auth_user_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM auth.users au WHERE au.id = u.auth_user_id);
```

---

## 🛠️ PASSOS PARA CORRIGIR

### Passo 1: Executar Diagnóstico

```
1. Ir em Supabase > SQL Editor
2. Executar QUERY 5 (contar por status)
3. Ver quantos usuários têm cada status
```

### Passo 2: Identificar Problema

```
Se email_confirmado < total:
  → Problema: Emails não confirmados

Se usuarios ≠ auth.users count:
  → Problema: Sincronização perdida

Se contas inativas > 0:
  → Problema: Usuários desativados
```

### Passo 3: Corrigir

```
Para emails não confirmados:
  UPDATE usuarios SET email_confirmed = true,
                     account_status = 'active'
  WHERE email_confirmed = false;

Para usuários desativados:
  UPDATE usuarios SET ativo = true
  WHERE ativo = false;

Para auth_user_id nulo:
  → Precisa recriar em auth.users
```

### Passo 4: Testar

```
1. Tentar fazer login com usuário OK
2. Se erro 400: Ver console (F12) para mensagem detalhada
3. Se funciona: Problema resolvido! ✅
```

---

## 🔍 DEBUG NO NAVEGADOR

Quando receber erro 400, verificar no **Console (F12)**:

```javascript
// A resposta do Supabase dirá qual é o problema:

// ❌ Erro comum:
// "Email not confirmed"
// → Solução: Confirmar email

// ❌ Erro comum:
// "Invalid login credentials"
// → Solução: Email/senha incorretos

// ❌ Erro comum:
// "User not found"
// → Solução: Usuário não existe em auth.users

// ❌ Erro comum:
// "User is disabled"
// → Solução: Usuário está desativado
```

---

## 📝 CHECKLIST DE VERIFICAÇÃO

Antes de fazer login, verificar:

- [ ] Email confirmado? (`email_confirmed = true`)
- [ ] Conta ativa? (`account_status = 'active'`)
- [ ] Usuário ativo? (`ativo = true`)
- [ ] Existe em auth.users? (`auth_user_id não é NULL`)
- [ ] Email correto? (sem espaços, minúsculas)
- [ ] Senha correta? (verificar caps lock)
- [ ] Email = email em auth.users? (podem estar diferentes)

---

## 💡 QUICK FIX

Se você tem muitos usuários com problema, executar:

```sql
-- Ativar todos os usuários cadastrados
UPDATE usuarios
SET ativo = true,
    email_confirmed = true,
    account_status = 'active',
    email_confirmed_at = COALESCE(email_confirmed_at, now())
WHERE ativo = false OR email_confirmed = false OR account_status != 'active';

-- Verificar que funcionou
SELECT COUNT(*) as agora_ok FROM usuarios
WHERE ativo = true AND email_confirmed = true AND account_status = 'active';
```

---

## 🚨 ERRO 400 - SOLUÇÃO RÁPIDA

Se nenhum usuário consegue fazer login:

```sql
-- 1. Ver quantos usuários estão OK
SELECT COUNT(*) as usuarios_ok FROM usuarios
WHERE ativo = true
  AND email_confirmed = true
  AND account_status = 'active'
  AND auth_user_id IS NOT NULL;

-- 2. Se resultado = 0, executar:
UPDATE usuarios
SET email_confirmed = true,
    account_status = 'active',
    email_confirmed_at = now()
WHERE email_confirmed = false;

-- 3. Testar login novamente
-- Deve funcionar agora! ✅
```

---

**Execute as queries acima no Supabase SQL Editor e me compartilhe os resultados para eu resolver o problema!** 🔧
