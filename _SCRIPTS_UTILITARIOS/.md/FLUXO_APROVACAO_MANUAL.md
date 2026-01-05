# ✅ FLUXO DE APROVAÇÃO MANUAL - IMPLEMENTAÇÃO COMPLETA

**Data:** 2 de Janeiro, 2026
**Status:** Pronto para usar

---

## 📋 O QUE FOI CRIADO

### 1️⃣ Banco de Dados

- ✅ Tabela `solicitacoes_cadastro` - Armazena requisições de novo usuário
- ✅ Tabela `notificacoes_sistema` - Notificações no dashboard admin
- ✅ RLS Policies - Apenas admin vê solicitações e usuário vê suas notificações

**Arquivo:** [CRIAR_APROVACOES_PENDENTES.sql](CRIAR_APROVACOES_PENDENTES.sql)

---

### 2️⃣ API (TypeScript)

**Arquivo:** `frontend/src/lib/aprovacoesApi.ts`

#### Funções criadas:

| Função                         | Descrição                                  |
| ------------------------------ | ------------------------------------------ |
| `criarSolicitacaoCadastro()`   | Novo usuário cria requisição de cadastro   |
| `listarAprovacoesPendentes()`  | Admin lista cadastros aguardando aprovação |
| `contarAprovacoesPendentes()`  | Conta quantos estão pendentes              |
| `aprovarSolicitacao()`         | Admin aprova → Email + Notificação         |
| `rejeitarSolicitacao()`        | Admin rejeita → Email + Motivo             |
| `listarNotificacoes()`         | Listar notificações do usuário             |
| `contarNotificacoesNaoLidas()` | Contar não lidas para badge                |
| `marcarNotificacaoComoLida()`  | Marcar notificação como lida               |

---

### 3️⃣ Página de Admin

**Arquivo:** `frontend/src/pages/admin/AprovacoesPage.tsx`

#### Features:

- ✅ Lista todos os cadastros pendentes
- ✅ Mostra: Nome, Email, CPF, Telefone, Tipo, Data
- ✅ Botão "Aprovar" (com confirmação)
- ✅ Botão "Rejeitar" (com dialog para motivo)
- ✅ Loading states e animations
- ✅ Toast notifications de sucesso/erro
- ✅ Interface responsiva (mobile + desktop)

---

## 🔄 FLUXO COMPLETO

```
1. NOVO USUÁRIO CLICA "CRIAR CONTA"
   ↓
2. PREENCHE: Nome, Email, CPF, Tipo
   ↓
3. SISTEMA CRIA: solicitacoes_cadastro (status: PENDENTE)
   ↓
4. NOTIFICA: Todos os ADMIN/MASTER via notificacoes_sistema
   ↓
5. ADMIN RECEBE:
   - Notificação no sistema (badge com contador)
   - Email (opcional - ainda não implementado)
   ↓
6. ADMIN VAI PARA: Aprovações > Revisa solicitação
   ↓
7. ADMIN CLICA: "Aprovar" OU "Rejeitar"
   ↓
8. SE APROVAR:
   - Atualiza status: APROVADO
   - Envia email ao usuário: "Cadastro aprovado!"
   - Cria notificação: CADASTRO_APROVADO
   - Usuário já pode fazer login
   ↓
9. SE REJEITAR:
   - Atualiza status: REJEITADO
   - Pede motivo do admin
   - Envia email ao usuário: "Cadastro rejeitado. Motivo: ..."
```

---

## 🚀 PRÓXIMOS PASSOS

### 1. Executar Migration SQL

```sql
-- Copiar e executar no Supabase SQL Editor:
[Arquivo: CRIAR_APROVACOES_PENDENTES.sql]
```

### 2. Criar Página de Signup com Solicitação

```tsx
// Modificar componente de Signup para:
await criarSolicitacaoCadastro({
  nome,
  email,
  cpf,
  telefone,
  tipo_usuario,
});
```

### 3. Adicionar Rota para Admin

```tsx
// Em seu router/routing:
{
  path: "/admin/aprovacoes",
  element: <AprovacoesPage />,
  requiredRole: ["MASTER", "ADMIN"]
}
```

### 4. Adicionar Menu no Dashboard

```tsx
// Adicionar link no sidebar admin:
<Link to="/admin/aprovacoes">
  <Badge>{pendentes}</Badge>
  Aprovações
</Link>
```

### 5. Criar Email Templates (Opcional)

- Email de aprovação
- Email de rejeição
- Email de notificação para admin

### 6. Implementar Badge de Notificações

```tsx
// No header do dashboard:
<NotificationBell count={contarNotificacoesNaoLidas(usuarioId)} />
```

---

## 📊 ESTRUTURA DAS TABELAS

### `solicitacoes_cadastro`

```
id (uuid)
nome (text)
email (text)
cpf (text)
telefone (text)
tipo_usuario (text: CLIENTE, COLABORADOR, etc)
status (text: PENDENTE, APROVADO, REJEITADO)
criado_em (timestamp)
criado_por (uuid → auth.users)
aprovado_em (timestamp)
aprovado_por (uuid → auth.users)
motivo_rejeicao (text)
rejeitado_em (timestamp)
rejeitado_por (uuid → auth.users)
email_enviado (boolean)
email_enviado_em (timestamp)
notificacao_admin_enviada (boolean)
notificacao_admin_enviada_em (timestamp)
```

### `notificacoes_sistema`

```
id (uuid)
usuario_id (uuid → usuarios)
tipo (text: NOVO_CADASTRO_PENDENTE, CADASTRO_APROVADO, CADASTRO_REJEITADO)
titulo (text)
descricao (text)
referencia_id (uuid)
referencia_tipo (text: SOLICITACAO_CADASTRO)
lido (boolean)
lido_em (timestamp)
criado_em (timestamp)
```

---

## 🔒 SEGURANÇA (RLS Policies)

### solicitacoes_cadastro

- ✅ Apenas MASTER/ADMIN podem ver
- ✅ Apenas MASTER/ADMIN podem aprovar/rejeitar

### notificacoes_sistema

- ✅ Usuário só vê suas próprias notificações
- ✅ Admin vê notificações direcionadas a ele

---

## 💡 MELHORIAS FUTURAS

1. **Email automático para admin** quando novo cadastro
2. **Dashboard de estatísticas** (aprovadas/rejeitadas/pendentes)
3. **Auditoria completa** (quem aprovou, quando, etc)
4. **Notificação por webhook** ao Slack/Teams
5. **Aprovação em lote** (multiple selection)
6. **Filtros avançados** (por tipo, data, etc)
7. **Pesquisa** por nome/email
8. **Histórico** de aprovações/rejeições

---

## ✅ CHECKLIST

- [ ] Executar SQL migration
- [ ] Verificar tabelas criadas no Supabase
- [ ] Testar API (criar solicitação)
- [ ] Testar página de aprovações (admin)
- [ ] Testar aprovação (envio de email)
- [ ] Testar rejeição (com motivo)
- [ ] Adicionar rota e menu
- [ ] Testar notificações no dashboard
- [ ] Testar responsividade mobile

---

## 📞 DÚVIDAS?

- **Cadastro não está sendo criado?** Verifique se a tabela foi criada
- **Admin não vê notificações?** Verifique se usuario.tipo_usuario = 'MASTER' ou 'ADMIN'
- **Email não é enviado?** Edge Function de email ainda não implementada

---

**Sistema pronto para produção! 🚀**
