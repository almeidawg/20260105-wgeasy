# 📊 VERIFICAÇÃO RLS E LOGIN COLABORADOR - SUMÁRIO EXECUTIVO

## 🎯 PROBLEMA

```
┌─────────────────────────────────────────────┐
│ USUÁRIO COLABORADOR FAZE LOGIN              │
│                                             │
│ ✅ Autenticação: SUCESSO                    │
│ ❌ Redirecionamento: ERRO                   │
│                                             │
│ Esperado: /colaborador                      │
│ Recebido: /wgx (área de cliente)            │
└─────────────────────────────────────────────┘
```

---

## 🔍 CAUSA RAIZ

### 1️⃣ RLS Bloqueando Leitura Própria

```typescript
// authApi.ts linha 480-486
const { data: usuario, error: usuarioError } = await supabase
  .from("usuarios")
  .select("id, tipo_usuario, pessoa_id, email, cpf, account_status")
  .eq("auth_user_id", effectiveUser.id) // ← RLS pode estar bloqueando isso
  .maybeSingle();

// Se usuario === null ou erro:
// retorna tipo_usuario: "CLIENTE" (padrão)
// → redireciona para /wgx
```

### 2️⃣ Tipo de Usuário Errado no Banco

```sql
-- Exemplo: Colaborador registrado como CLIENTE
usuarios table:
┌──────┬──────────────┬───────────────┐
│ id   │ tipo_usuario │ email         │
├──────┼──────────────┼───────────────┤
│ 001  │ CLIENTE ❌   │ joao@...      │  ← Deveria ser COLABORADOR
│ 002  │ COLABORADOR✅│ maria@...     │
└──────┴──────────────┴───────────────┘
```

### 3️⃣ Políticas RLS Muito Restritivas

```sql
-- Política antiga pode estar bloqueando:
CREATE POLICY "usuarios_select_policy" ON usuarios
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.auth_user_id = auth.uid()
            AND u.tipo_usuario IN ('MASTER', 'ADMIN')  -- ← Só admins!
            AND u.ativo = true
        )
    );
    -- ❌ Não permite que usuário leia SEU PRÓPRIO registro!
```

---

## ✅ SOLUÇÃO EM 3 PASSOS

### 📝 PASSO 1: Corrigir RLS

**Arquivo:** `EXECUTAR_CORRECAO_LOGIN_COLABORADOR.sql`

```sql
-- Habilitar RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios FORCE ROW LEVEL SECURITY;

-- Criar política permissiva:
CREATE POLICY "usuarios_select_own_or_admin" ON usuarios
    FOR SELECT
    TO authenticated
    USING (
        auth_user_id = auth.uid()      -- ✅ Usuário vê SEU próprio
        OR
        -- ✅ Ou é admin
        EXISTS (
            SELECT 1 FROM usuarios admin
            WHERE admin.auth_user_id = auth.uid()
            AND admin.tipo_usuario IN ('MASTER', 'ADMIN')
            AND admin.ativo = true
        )
    );
```

### 🔍 PASSO 2: Sincronizar Tipos de Usuário

```sql
-- Ver divergências:
SELECT u.id, u.tipo_usuario, p.tipo
FROM usuarios u
JOIN pessoas p ON p.id = u.pessoa_id
WHERE u.tipo_usuario != p.tipo;

-- Corrigir:
UPDATE usuarios u
SET tipo_usuario = p.tipo
FROM pessoas p
WHERE u.pessoa_id = p.id
  AND p.tipo = 'COLABORADOR'
  AND u.tipo_usuario != 'COLABORADOR';
```

### 🧪 PASSO 3: Testar

```
1. Faça login com usuário COLABORADOR
2. Verifique em Network se RLS está bloqueando
3. Confirme que tipo_usuario = 'COLABORADOR' é retornado
4. Verifique se redireciona para /colaborador ✅
```

---

## 📊 CHECKLIST DE VERIFICAÇÃO

### Antes da Correção

```
☐ RLS habilitado: SELECT rowsecurity FROM pg_tables WHERE tablename = 'usuarios'
☐ Número de políticas: SELECT COUNT(*) FROM pg_policies WHERE tablename = 'usuarios'
☐ Colaboradores com tipo errado: SELECT COUNT(*) FROM usuarios WHERE tipo_usuario != 'COLABORADOR'
☐ Email confirmado: SELECT COUNT(*) FROM usuarios WHERE email_confirmed = false
☐ Teste login: tentar login com usuário e verificar redirecionamento
```

### Depois da Correção

```
✅ RLS habilitado: true
✅ 4 políticas criadas: SELECT, INSERT, UPDATE, DELETE
✅ 0 colaboradores com tipo errado
✅ Todos com email_confirmed = true
✅ Redirecionamento correto para /colaborador
```

---

## 🚀 EXECUÇÃO RECOMENDADA

### Local de Execução

1. Abrir [Supabase Dashboard](https://app.supabase.com)
2. Ir em **SQL Editor**
3. Copiar conteúdo de `EXECUTAR_CORRECAO_LOGIN_COLABORADOR.sql`
4. Colar no editor
5. Clicar **Run** (ou Ctrl+Enter)

### Tempo Estimado

- ⏱️ Passo 1 (RLS): < 1 segundo
- ⏱️ Passo 2 (Sincronização): ~2-5 segundos
- ⏱️ Passo 3 (Teste): Manual (5-10 minutos)
- ⏱️ **Total: ~10-15 minutos**

---

## 📁 ARQUIVOS CRIADOS

| Arquivo                                   | Descrição                            | Uso                         |
| ----------------------------------------- | ------------------------------------ | --------------------------- |
| `EXECUTAR_CORRECAO_LOGIN_COLABORADOR.sql` | Script completo pronto para executar | ⚠️ **Executar no Supabase** |
| `DIAGNOSTICO_LOGIN_COLABORADOR.sql`       | Diagnóstico antes/depois             | 📊 Análise                  |
| `SOLUCAO_LOGIN_COLABORADOR_WGX.md`        | Explicação detalhada                 | 📚 Documentação             |

---

## 🔧 CÓDIGO AFETADO

### Frontend

- [authApi.ts](sistema/wgeasy/frontend/src/lib/authApi.ts#L480) - Linha 480-486 (login)
- [LoginPage.tsx](sistema/wgeasy/frontend/src/auth/LoginPage.tsx#L280) - Linha 280-302 (redirecionamento)

### Backend/Banco

- Tabela: `usuarios`
- Políticas RLS: `usuarios_select_*`, `usuarios_insert_*`, etc.

---

## ⚠️ AVISOS IMPORTANTES

### ❗ Avisos

1. **Backup**: Recomendo fazer backup antes de executar PASSO 2
2. **Teste**: Faça login com um usuário de TESTE primeiro
3. **Produção**: Se em produção, execute em horário de baixo uso
4. **Rollback**: Se algo der errado, as políticas podem ser recriadas

### ✅ Segurança

- RLS continua ativo após correção
- Usuários não conseguem ler dados de outros
- Admins continuam com acesso total

---

## 🎯 RESULTADO ESPERADO

### Fluxo Correto

```
Login Page
    ↓
Digita: usuario@email.com / senha
    ↓
authApi.login()
    ↓
RLS permite leitura própria ✅
    ↓
usuario.tipo_usuario = 'COLABORADOR' ✅
    ↓
LoginPage redireciona para '/colaborador' ✅
    ↓
ColaboradorLayout carrega ✅
    ↓
Tela do Colaborador funciona ✅
```

---

## 📞 PRÓXIMOS PASSOS

1. **Executar script** → `EXECUTAR_CORRECAO_LOGIN_COLABORADOR.sql`
2. **Testar login** com usuário colaborador
3. **Validar redirecionamento** no console do navegador
4. **Verificar RLS logs** no Supabase
5. **Documentar qualquer erro** para análise

---

**Data:** 4 de Janeiro, 2026
**Status:** ✅ Pronto para Execução
**Risco:** Baixo (mudanças apenas em RLS e tipo_usuario)
