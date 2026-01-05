# 🚀 CORRIGIR ERRO 400 - SCRIPT SQL PRONTO

**Problema:** Usuários com `email_confirmed = false` ou `account_status = 'pending'` **NÃO CONSEGUEM FAZER LOGIN**

**Solução:** Ativar todos os usuários de uma vez

---

## ⚡ QUICK FIX (Execute AGORA)

Copie e execute no **Supabase SQL Editor**:

```sql
-- =====================================================
-- ATIVAR TODOS OS USUÁRIOS
-- =====================================================

UPDATE usuarios
SET
  email_confirmed = true,
  account_status = 'active',
  email_confirmed_at = COALESCE(email_confirmed_at, now())
WHERE
  email_confirmed = false
  OR account_status != 'active';

-- Verificar que funcionou
SELECT
  COUNT(*) as total,
  SUM(CASE WHEN email_confirmed = true THEN 1 ELSE 0 END) as confirmados,
  SUM(CASE WHEN account_status = 'active' THEN 1 ELSE 0 END) as ativos
FROM usuarios;
```

**Resultado esperado:**

```
total | confirmados | ativos
------|-------------|-------
 N    |      N      |   N
(todos os números iguais = sucesso ✅)
```

---

## 🔍 ANTES DE EXECUTAR - Verificar Estado Atual

```sql
-- Ver quantos usuários estão bloqueados
SELECT
  COUNT(*) as total_usuarios,
  SUM(CASE WHEN email_confirmed = false THEN 1 ELSE 0 END) as bloqueados_email,
  SUM(CASE WHEN account_status != 'active' THEN 1 ELSE 0 END) as bloqueados_status,
  SUM(CASE WHEN email_confirmed = true AND account_status = 'active' THEN 1 ELSE 0 END) as pode_fazer_login
FROM usuarios;
```

---

## 🧪 TESTAR DEPOIS

Depois de executar o SQL acima:

1. **Ir para login page:** http://seu-sistema.com/auth/login
2. **Tentar com email válido + senha**
3. **Se funciona:** Problema resolvido! ✅

---

## 📋 DADOS DOS USUÁRIOS (Para Testar)

```sql
-- Ver usuários que agora podem fazer login
SELECT
  p.nome,
  p.email,
  u.cpf,
  u.tipo_usuario,
  u.email_confirmed,
  u.account_status,
  u.ativo
FROM usuarios u
LEFT JOIN pessoas p ON p.id = u.pessoa_id
WHERE u.email_confirmed = true AND u.account_status = 'active'
ORDER BY p.nome;
```

---

## ⚠️ IMPORTANTE

Depois de executar:

1. **Limpar cache do navegador:** Ctrl+Shift+Del
2. **Fazer logout:** Se estiver logado
3. **Fazer login novamente:** Com novo status
4. **Verificar erro 400:** Deve desaparecer ✅

---

## 🎯 Alternativa: Se Quiser Ser Mais Cuidadoso

Se só quer ativar usuários específicos:

```sql
-- Apenas MASTER e ADMIN
UPDATE usuarios
SET email_confirmed = true,
    account_status = 'active',
    email_confirmed_at = now()
WHERE tipo_usuario IN ('MASTER', 'ADMIN')
  AND (email_confirmed = false OR account_status != 'active');

-- Apenas com email definido
UPDATE usuarios
SET email_confirmed = true,
    account_status = 'active',
    email_confirmed_at = now()
WHERE email IS NOT NULL
  AND (email_confirmed = false OR account_status != 'active');

-- Apenas criados antes de data específica
UPDATE usuarios
SET email_confirmed = true,
    account_status = 'active',
    email_confirmed_at = now()
WHERE criado_em < NOW() - INTERVAL '30 days'
  AND (email_confirmed = false OR account_status != 'active');
```

---

## ✅ Checklist

- [ ] Abrir Supabase SQL Editor
- [ ] Executar query de verificação (ver estado atual)
- [ ] Executar UPDATE
- [ ] Verificar com SELECT COUNT
- [ ] Limpar cache do navegador
- [ ] Tentar fazer login
- [ ] Erro 400 desapareceu? ✅

---

**Execute agora e avise quando funcion ar!** 🚀
