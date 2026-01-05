# 🎨 MELHORIAS PÁGINA LOGIN - RESUMO

**Data:** 2 de Janeiro, 2026

---

## 1️⃣ LOGO SVG → PNG

**Problema:** Logo está em SVG em `/logo-wg-grupo.svg`

**Solução:**

- Você precisa de um arquivo PNG da logo WG
- **Caminho esperado:** `/public/logo-wg-grupo.png`
- **Tamanho recomendado:** 512x512 px (mínimo 256x256)
- **Qualidade:** 300+ dpi para nitidez

**Arquivo a atualizar:** [LoginPage.tsx](LoginPage.tsx#L452)

Linha 452 mudará de:

```tsx
src = "/logo-wg-grupo.svg";
```

Para:

```tsx
src = "/logo-wg-grupo.png";
```

---

## 2️⃣ CORRIGIR Z-INDEX - Texto "Email" e "Senha" atrás dos ícones

**Problema:**

- Texto do campo de email está atrás do ícone "Pessoa"
- Texto do campo de senha está atrás do ícone "Cadeado"

**Causa:**

- Label/span está com `relative` e está cobrindo o texto
- Precisa adicionar `z-10` ao input ou remover o que está cobrindo

**Linhas a corrigir:**

- Email: [LoginPage.tsx](LoginPage.tsx#L560-L575) - Adicionar `relative z-10` ao input
- Senha: [LoginPage.tsx](LoginPage.tsx#L625-L640) - Mesmo ajuste

---

## 3️⃣ NOVO CADASTRO COM APROVAÇÃO

**Fluxo desejado:**

```
1. Usuário clica "Criar nova conta"
2. Preenche formulário (email, senha, CPF, etc)
3. Sistema envia email de confirmação
4. Email confirmado → Status "PENDENTE_APROVACAO"
5. Admin recebe notificação no sistema
6. Admin aprova → Email ao usuário
7. Usuário pode fazer login
```

**Arquivos a criar/modificar:**

- Página de signup (já existe?)
- Email de aprovação
- Notificação para admin
- Dashboard admin com "Usuários Pendentes"

---

## 📋 CHECKLIST

- [ ] Você tem um arquivo PNG da logo WG em alta qualidade?
- [ ] Qual é o tamanho/formato do PNG?
- [ ] Quer manter email/CPF ou separar em 2 campos?
- [ ] Sistema de aprovação: aprovação automática ou manual do admin?

---

**Responda e faço as correções!**
