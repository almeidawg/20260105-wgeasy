# 🔐 RESETAR SENHA - DARCIO

**Usuário:** darcio@dbadvogados.com.br
**UUID em auth.users:** 4ce0f848-d7ba-4a16-9fbc-586b3355920c
**Status:** ✅ Existe, ✅ Email confirmado

---

## 🎯 PROBLEMA

Usuário está correto em tudo, mas a **SENHA está errada**.

Possível causa:

- Senha foi criada diferente quando o usuário foi registrado originalmente
- Senha nunca foi setada corretamente em auth.users

---

## ✅ SOLUÇÃO - 3 Opções

### **OPÇÃO 1: Reset Password (RECOMENDADO)**

**No Supabase Dashboard:**

1. Ir para **Authentication > Users**
2. Procurar: `darcio@dbadvogados.com.br`
3. Clique no menu `...` (três pontos)
4. Selecione: **"Reset password"**
5. Sistema envia email para: `darcio@dbadvogados.com.br`
6. Darcio clica no link do email e define NOVA senha

**Resultado:** Novo link de reset enviado para o email ✅

---

### **OPÇÃO 2: Set Password (Admin - Direto no Dashboard)**

**No Supabase Dashboard:**

1. Ir para **Authentication > Users**
2. Procurar: `darcio@dbadvogados.com.br`
3. Clique no usuário para abrir detalhes
4. Procure por **"User Password"** ou similar
5. Clique em **"Set Password"**
6. Digite: `WGUpPe5Pdj!`
7. Clique **Save**

**Resultado:** Senha mudada imediatamente ✅

---

### **OPÇÃO 3: Criar Novo Usuário (Se preferir)**

Se quiser limpar tudo:

1. Delete o usuário em auth.users (vai perder histórico)
2. Crie novo com Dashboard:
   - Email: `darcio@dbadvogados.com.br`
   - Senha: `WGUpPe5Pdj!`
3. Copie o novo UUID
4. Atualize em `usuarios`:

```sql
UPDATE usuarios
SET auth_user_id = 'novo_uuid_aqui'
WHERE id = '513f32ac-371f-477a-a16b-c1021094a6d6';
```

---

## 🚀 PRÓXIMAS AÇÕES

### Se usar OPÇÃO 1 (Reset):

1. ✅ Darcio recebe email
2. ✅ Clica no link
3. ✅ Define nova senha
4. ✅ Faz login com nova senha

### Se usar OPÇÃO 2 (Set Direct):

1. ✅ Você define a senha
2. ✅ Darcio faz login com `WGUpPe5Pdj!` imediatamente

### Depois de qualquer opção:

```
URL: https://easy.wgalmeida.com.br/auth/login
Email: darcio@dbadvogados.com.br
Senha: WGUpPe5Pdj! (ou a nova que ele criou)
```

---

## ✅ Checklist Final

- [ ] Abrir Supabase Dashboard
- [ ] Ir para Authentication > Users
- [ ] Procurar: darcio@dbadvogados.com.br
- [ ] Escolher OPÇÃO 1 ou 2
- [ ] Executar
- [ ] Teste: darcio tenta fazer login
- [ ] Erro 400 desapareceu? ✅

---

**Qual opção você prefere?**

- **OPÇÃO 1:** Enviar email de reset (usuário define a senha)
- **OPÇÃO 2:** Você define a senha direto (mais rápido)
