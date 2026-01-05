# 🔄 RECRIAR USUÁRIO - GUIA COM UUIDS REAIS

**Email:** darcio@dbadvogados.com.br
**UUID ANTIGO:** 4ce0f848-d7ba-4a16-9fbc-586b3355920c
**UUID NOVO:** (vamos gerar)

---

## 📋 PASSO 1: Deletar usuário antigo de auth.users

Execute no **Supabase SQL Editor**:

```sql
-- Limpar referência em usuarios
UPDATE usuarios
SET auth_user_id = NULL
WHERE auth_user_id = '4ce0f848-d7ba-4a16-9fbc-586b3355920c';

-- Deletar de auth.users
DELETE FROM auth.users
WHERE id = '4ce0f848-d7ba-4a16-9fbc-586b3355920c';

-- Verificar
SELECT COUNT(*) FROM auth.users
WHERE email = 'darcio@dbadvogados.com.br';
-- Resultado: 0 (sucesso!)
```

✅ **Execute isso AGORA no SQL Editor**

---

## 📋 PASSO 2: Criar novo usuário no Dashboard

Ir para: **Authentication > Users > Create a new user**

```
Email: darcio@dbadvogados.com.br
Password: WGUpPe5Pdj!
```

Clique: **"Create user"**

---

## 📋 PASSO 3: Copiar o NOVO UUID

Quando criar, na lista de usuários, você verá:

```
Email: darcio@dbadvogados.com.br
UUID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx  ← COPIE ESTE
```

**Exemplo:** Se o novo UUID for `12345678-1234-1234-1234-123456789012`

---

## 📋 PASSO 4: Atualizar usuarios table

Execute NO SQL Editor, **SEM aspas** no UUID:

```sql
-- Template correto
UPDATE usuarios
SET auth_user_id = '12345678-1234-1234-1234-123456789012'
WHERE id = '513f32ac-371f-477a-a16b-c1021094a6d6';
```

⚠️ **IMPORTANTE:** Substitua `12345678-1234-1234-1234-123456789012` pelo UUID real que você copiou!

**Verificar:**

```sql
SELECT auth_user_id FROM usuarios
WHERE id = '513f32ac-371f-477a-a16b-c1021094a6d6';
```

Deve retornar o UUID que você colocou.

---

## 📋 PASSO 5: Testar login

```
URL: https://easy.wgalmeida.com.br/auth/login
Email: darcio@dbadvogados.com.br
Senha: WGUpPe5Pdj!
```

✅ **Deve funcionar agora!**

---

## 🚨 ERRO COMUM: "invalid input syntax for type uuid"

**Causa:** Você colocou a string literal `'NOVO_UUID_AQUI'`

**Solução:** Colocar um UUID REAL:

❌ ERRADO:

```sql
SET auth_user_id = 'NOVO_UUID_AQUI'
```

✅ CERTO:

```sql
SET auth_user_id = '12345678-1234-1234-1234-123456789012'
```

---

## ✅ Checklist

- [ ] Deletei usuário antigo (PASSO 1)
- [ ] Criei novo usuário no Dashboard (PASSO 2)
- [ ] Copiei o novo UUID (PASSO 3)
- [ ] Executei UPDATE com UUID REAL (PASSO 4)
- [ ] Verifiquei que auth_user_id foi atualizado
- [ ] Testei login (PASSO 5)
- [ ] Funciona? ✅

---

**Qual é o novo UUID que você copiou do Dashboard?**
Cole aqui e eu faço o SQL pronto para você!
