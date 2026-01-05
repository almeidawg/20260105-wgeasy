# 🔐 SOLUÇÃO - Criar/Resetar Senha em Supabase

**Usuário:** DARCIO CANDIDO BARBOSA
**Email:** darcio@dbadvogados.com.br
**Problema:** Usuário existe em `usuarios` mas não consegue fazer login

---

## ⚠️ IMPORTANTE - Limitação do Supabase

**NÃO é possível SET senha via SQL direto!**

Supabase criptografa senhas e só permite mudar via:

1. ✅ API de Autenticação (signUp/resetPassword)
2. ✅ Dashboard do Supabase (Admin Panel)
3. ❌ SQL direto (NÃO FUNCIONA)

---

## 🔧 SOLUÇÃO 1: Usar Supabase Dashboard (MAIS FÁCIL)

### Passo 1: Abrir Supabase Dashboard

```
https://app.supabase.com
→ Selecione seu projeto
→ Vá para Authentication > Users
```

### Passo 2: Procurar o usuário

```
Buscar por: darcio@dbadvogados.com.br
```

### Passo 3: Se não existir, criar

Clique em **"Create a new user"**:

```
Email: darcio@dbadvogados.com.br
Password: WGUpPe5Pdj!
```

Clique **"Create User"**

### Passo 4: Copiar o UUID

Quando criar, copie o `id` (UUID) do usuário

### Passo 5: Atualizar a tabela usuarios

Execute no SQL Editor:

```sql
UPDATE usuarios
SET auth_user_id = 'COLE_O_UUID_AQUI'
WHERE id = (
  SELECT u.id FROM usuarios u
  LEFT JOIN pessoas p ON p.id = u.pessoa_id
  WHERE LOWER(p.email) = 'darcio@dbadvogados.com.br'
);

-- Verificar
SELECT auth_user_id, id FROM usuarios
WHERE id = (
  SELECT u.id FROM usuarios u
  LEFT JOIN pessoas p ON p.id = u.pessoa_id
  WHERE LOWER(p.email) = 'darcio@dbadvogados.com.br'
);
```

### Passo 6: Testar login

```
URL: https://easy.wgalmeida.com.br
Email: darcio@dbadvogados.com.br
Senha: WGUpPe5Pdj!
```

---

## 🔧 SOLUÇÃO 2: Script de Reset (Se já existe)

Se o usuário JÁ EXISTE em auth.users mas a senha está errada:

### Via Supabase Dashboard

1. Ir para **Authentication > Users**
2. Encontrar o usuário
3. Clique em **"..."** menu
4. Selecione **"Reset password"**
5. Sistema envia email com link para resetar
6. Usuário clica no link e define nova senha

---

## 🔧 SOLUÇÃO 3: Via SQL (Se auth_user_id está NULL)

Se `usuarios.auth_user_id` está `NULL`, precisa sincronizar:

```sql
-- PASSO 1: Encontrar o UUID do usuário em auth.users
SELECT id, email
FROM auth.users
WHERE email = 'darcio@dbadvogados.com.br';

-- Resultado será algo como:
-- | id                                   | email                      |
-- | 550e8400-e29b-41d4-a716-446655440000 | darcio@dbadvogados.com.br  |

-- PASSO 2: Copie o UUID e execute:
UPDATE usuarios
SET auth_user_id = '550e8400-e29b-41d4-a716-446655440000'  -- Cole o UUID aqui
WHERE id = (
  SELECT u.id FROM usuarios u
  LEFT JOIN pessoas p ON p.id = u.pessoa_id
  WHERE LOWER(p.email) = 'darcio@dbadvogados.com.br'
);

-- PASSO 3: Verificar
SELECT auth_user_id FROM usuarios
WHERE id = (
  SELECT u.id FROM usuarios u
  LEFT JOIN pessoas p ON p.id = u.pessoa_id
  WHERE LOWER(p.email) = 'darcio@dbadvogados.com.br'
);
```

---

## ✅ Checklist

- [ ] Execute [VERIFICAR_DARCIO.sql](VERIFICAR_DARCIO.sql) para diagnosticar
- [ ] Identifique se:
  - [ ] Usuário NÃO existe em auth.users → Criar via Dashboard
  - [ ] Usuário existe mas auth_user_id é NULL → Atualizar tabela
  - [ ] Usuário existe mas senha errada → Reset Password
- [ ] Teste login com email + senha: `WGUpPe5Pdj!`
- [ ] Se funcionar → Usuário precisa mudar senha no primeiro acesso

---

## 🚀 RESUMO RÁPIDO

| Situação                       | Solução                      |
| ------------------------------ | ---------------------------- |
| Não existe em auth.users       | Criar no Dashboard           |
| Existe mas auth_user_id = NULL | Copiar UUID e UPDATE         |
| Existe mas senha errada        | Reset Password no Dashboard  |
| Tudo OK                        | Deve fazer login normalmente |

---

## 📞 Dúvidas

**P: Por que preciso do UUID?**
R: `auth_user_id` em `usuarios` precisa apontar para o usuário em `auth.users`

**P: Posso mudar senha via SQL?**
R: Não. Supabase criptografa. Use Dashboard ou Reset Password.

**P: E se o usuário esqueceu a senha?**
R: Usar "Forgot Password" na login page, que envia email de reset.

---

**Execute agora e avise o resultado!** 🚀
