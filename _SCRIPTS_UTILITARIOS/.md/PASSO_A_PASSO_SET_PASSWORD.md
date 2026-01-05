# 🔐 SET PASSWORD - GUIA PASSO A PASSO

**Usuário:** darcio@dbadvogados.com.br
**Nova Senha:** WGUpPe5Pdj!
**UUID:** 4ce0f848-d7ba-4a16-9fbc-586b3355920c

---

## 📱 PASSO 1: Abrir Supabase Dashboard

Acesse: https://app.supabase.com

---

## 📱 PASSO 2: Selecionar Seu Projeto

Procure e clique no seu projeto (ex: ahlqzzkxuutwoepirpzr)

---

## 📱 PASSO 3: Ir para Authentication

No menu lateral esquerdo:

```
Authentication → Users
```

---

## 📱 PASSO 4: Procurar o Usuário

Na barra de busca, procure por:

```
darcio@dbadvogados.com.br
```

Você deve ver este resultado:

```
Email: darcio@dbadvogados.com.br
Created: Dec 22, 2025
```

---

## 📱 PASSO 5: Abrir Detalhes do Usuário

Clique em `darcio@dbadvogados.com.br` para abrir o perfil

---

## 📱 PASSO 6: Encontrar Opção de Senha

Na página de detalhes do usuário, procure por:

```
User Password
```

Você deve ver um campo ou botão com opção para:

- ✅ "Set password"
- ✅ "Change password"
- ✅ "Update password"

Clique nele.

---

## 📱 PASSO 7: Digitar a Senha

No campo que abrir, digite:

```
WGUpPe5Pdj!
```

**Cuidado:** Copiar exatamente (maiúsculas, minúsculas, símbolos)

---

## 📱 PASSO 8: Salvar

Clique em:

```
Save
ou
Update
ou
Confirm
```

Você deve ver uma mensagem de confirmação ✅

---

## 🎉 PRONTO!

Agora teste o login:

```
URL: https://easy.wgalmeida.com.br/auth/login
Email: darcio@dbadvogados.com.br
Senha: WGUpPe5Pdj!
```

**Deve funcionar agora!** ✅

---

## ⚠️ Se não conseguir encontrar o campo de senha

**Alternativa:** Use SQL direto no Supabase

1. Ir para: **SQL Editor**
2. Copiar e colar este comando:

```sql
-- Resetar senha para o usuário
SELECT auth.uid();  -- Apenas para verificar que você pode executar SQL

-- Nota: Você não pode mudar senha via SQL direto
-- Precisa usar Dashboard mesmo
```

**Ou use a função de reset:**

```sql
-- Enviar email de reset
SELECT
  auth.reset_password_email(
    'darcio@dbadvogados.com.br',
    'https://easy.wgalmeida.com.br/auth/reset-password'
  );
```

---

## ✅ Checklist

- [ ] Abrir https://app.supabase.com
- [ ] Selecionar projeto
- [ ] Ir para Authentication > Users
- [ ] Procurar: darcio@dbadvogados.com.br
- [ ] Clique para abrir detalhes
- [ ] Encontrar "Set password"
- [ ] Digitar: WGUpPe5Pdj!
- [ ] Clique Save
- [ ] Ver mensagem de sucesso ✅
- [ ] Teste login
- [ ] Funciona? 🎉

---

**Já fez? Teste o login agora!** 🚀
