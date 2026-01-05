# 🔴 PAROU AQUI - Precisa do UUID REAL!

**PROBLEMA:** Você não substituiu `'NOVO_UUID_AQUI'` por um UUID real.

---

## ✅ SOLUÇÃO

### PASSO 1: Abrir Dashboard

```
https://app.supabase.com
→ Selecione seu projeto
→ Authentication > Users
```

### PASSO 2: Procurar o email

```
Procure por: darcio@dbadvogados.com.br
```

**Você pode ver este usuário na lista?**

- **SIM?** → Vá pro PASSO 3
- **NÃO?** → Crie primeiro! (Create a new user)

### PASSO 3: Ver o UUID

Clique no usuário `darcio@dbadvogados.com.br` para abrir.

Na página que abrir, procure por:

```
User UID
ou
UID
```

Copie o valor (será algo como: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

### PASSO 4: Cole o UUID aqui!

Responda com o UUID que você copiou.

---

## ❌ ERRADO

```sql
UPDATE usuarios
SET auth_user_id = 'NOVO_UUID_AQUI'  ← ERRADO! String literal!
```

## ✅ CORRETO

```sql
UPDATE usuarios
SET auth_user_id = '12345678-1234-1234-1234-123456789abc'  ← Exemplo
```

---

**Qual é o UUID que aparece no Dashboard?**

Cole aqui: `___________________________`
