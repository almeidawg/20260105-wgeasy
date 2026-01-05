# 🔴 ANÁLISE: Login Colaborador Indo para /wgx ao invés de /colaborador

## 📋 RESUMO DO PROBLEMA

```
✅ Login: FUNCIONANDO (autenticação bem-sucedida)
❌ Redirecionamento: ERRADO (vai para /wgx ao invés de /colaborador)
```

**Sintoma:** Usuário tipo `COLABORADOR` faz login mas é redirecionado para `/wgx` (área de clientes) ao invés de `/colaborador` (área do colaborador).

---

## 🔍 RAÍZES POSSÍVEIS

### Raiz 1: RLS Bloqueando Leitura do Próprio Usuário

**Localização:** [authApi.ts](sistema/wgeasy/frontend/src/lib/authApi.ts#L480-L486)

```typescript
// Essa query pode estar bloqueada por RLS!
const { data: usuario, error: usuarioError } = await supabase
  .from("usuarios")
  .select("id, tipo_usuario, pessoa_id, email, cpf, account_status")
  .eq("auth_user_id", effectiveUser.id)
  .eq("email_confirmed", true)
  .eq("account_status", "active")
  .maybeSingle();
```

**Se houver erro ou `usuario` for null:**

- A função retorna um objeto padrão com `tipo_usuario: "CLIENTE"` (linha 503)
- LoginPage recebe `CLIENTE` e redireciona para `/wgx`

### Raiz 2: Tipo de Usuário Registrado Errado

**Verificação:** Na tabela `usuarios`, a coluna `tipo_usuario` pode estar como:

- `CLIENTE` (errado)
- `COLABORADOR` (correto)
- NULL (crítico)

### Raiz 3: Políticas RLS Muito Restritivas

**Arquivo:** `CORRECOES-RLS-V2.sql`

Políticas podem estar bloqueando leitura do próprio usuário.

---

## 🛠️ CORREÇÃO EM 3 PASSOS

### PASSO 1: Habilitar RLS com Políticas Permissivas

**Execute no Supabase SQL Editor:**

```sql
-- Habilitar RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios FORCE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS "usuarios_select_own_or_admin" ON usuarios;
DROP POLICY IF EXISTS "usuarios_select_policy" ON usuarios;

-- NOVA POLÍTICA: Usuário vê seu próprio registro OU admin vê todos
CREATE POLICY "usuarios_select_own_or_admin" ON usuarios
    FOR SELECT
    TO authenticated
    USING (
        -- ✅ Usuário vê seu próprio registro
        auth_user_id = auth.uid()
        OR
        -- ✅ Admin/Master veem todos
        EXISTS (
            SELECT 1 FROM usuarios admin
            WHERE admin.auth_user_id = auth.uid()
            AND admin.tipo_usuario IN ('MASTER', 'ADMIN')
            AND admin.ativo = true
        )
    );
```

**O que essa política faz:**

- ✅ Permite que qualquer usuário autenticado veja SEU PRÓPRIO registro
- ✅ Permite que MASTER/ADMIN vejam todos
- ✅ Bloqueia que clientes vejam dados de outros

### PASSO 2: Verificar e Corrigir Tipo de Usuário

```sql
-- Ver quem está como CLIENTE mas deveria ser COLABORADOR
SELECT
    u.id,
    u.auth_user_id,
    u.tipo_usuario,
    u.email,
    p.nome,
    p.tipo as tipo_pessoa
FROM usuarios u
LEFT JOIN pessoas p ON p.id = u.pessoa_id
WHERE p.tipo = 'COLABORADOR'
  AND u.tipo_usuario != 'COLABORADOR'
ORDER BY u.email;

-- SE HOUVER DIVERGÊNCIAS, CORRIGIR:
UPDATE usuarios u
SET tipo_usuario = p.tipo
FROM pessoas p
WHERE u.pessoa_id = p.id
  AND p.tipo = 'COLABORADOR'
  AND u.tipo_usuario != 'COLABORADOR';
```

### PASSO 3: Testar o Fluxo

```
1. Faça login com um usuário COLABORADOR
2. Verifique se:
   ✅ Autenticação sucede
   ✅ RLS não bloqueia a query de `usuarios`
   ✅ `usuario.tipo_usuario` retorna 'COLABORADOR'
   ✅ Redirecionamento para `/colaborador`
```

---

## 📊 PONTOS DE VERIFICAÇÃO

### 1. RLS Status

```sql
-- Verificar se RLS está ativado
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'usuarios';

-- Resultado esperado:
tablename  | rowsecurity
-----------|------------
usuarios   | true
```

### 2. Políticas RLS

```sql
-- Ver todas as políticas
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename = 'usuarios'
ORDER BY policyname;

-- Resultado esperado: pelo menos 4 políticas (SELECT, INSERT, UPDATE, DELETE)
```

### 3. Usuários Colaboradores

```sql
-- Ver quantos colaboradores estão com tipo errado
SELECT
    COUNT(*) as total,
    COUNT(CASE WHEN u.tipo_usuario = 'COLABORADOR' THEN 1 END) as correto,
    COUNT(CASE WHEN u.tipo_usuario != 'COLABORADOR' THEN 1 END) as errado
FROM usuarios u
JOIN pessoas p ON p.id = u.pessoa_id
WHERE p.tipo = 'COLABORADOR';
```

---

## 🔧 LIMPEZA NO SUPABASE

Se houver dados desorganizados, limpe assim:

```sql
-- 1. Remover políticas antigas
DROP POLICY IF EXISTS "usuarios_select_policy" ON usuarios;
DROP POLICY IF EXISTS "usuarios_select_old" ON usuarios;
DROP POLICY IF EXISTS "usuarios_insert_policy" ON usuarios;
DROP POLICY IF EXISTS "usuarios_update_policy" ON usuarios;
DROP POLICY IF EXISTS "usuarios_delete_policy" ON usuarios;

-- 2. Recriar com novas políticas (veja PASSO 1 acima)

-- 3. Verificar integridade
SELECT COUNT(*) as total_usuarios,
       COUNT(CASE WHEN tipo_usuario IS NULL THEN 1 END) as null_tipos,
       COUNT(CASE WHEN auth_user_id IS NULL THEN 1 END) as sem_auth_user_id
FROM usuarios;
```

---

## 📁 ARQUIVOS ENVOLVIDOS

- ✅ [authApi.ts](sistema/wgeasy/frontend/src/lib/authApi.ts) - Função `login()` linhas 330-525
- ✅ [LoginPage.tsx](sistema/wgeasy/frontend/src/auth/LoginPage.tsx) - Redirecionamento linhas 264-302
- ✅ [ColaboradorOnlyRoute.tsx](sistema/wgeasy/frontend/src/auth/ColaboradorOnlyRoute.tsx) - Proteção de rota
- ✅ Políticas RLS em `CORRECOES-RLS-V2.sql`

---

## ✨ RESULTADO ESPERADO

Após aplicar as correções:

```
Entrada: usuario.tipo_usuario = "COLABORADOR"
         ↓
LoginPage linha 280: case "COLABORADOR"
         ↓
redirectUrl = "/colaborador"
         ↓
navigate("/colaborador")
         ↓
ColaboradorLayout carrega com sucesso ✅
```

---

## 🚨 CHECKLIST FINAL

- [ ] Executar PASSO 1 (RLS Policies)
- [ ] Executar PASSO 2 (Corrigir tipos)
- [ ] Testar login com usuário COLABORADOR
- [ ] Verificar que redireciona para `/colaborador`
- [ ] Confirmar que RLS não bloqueia leitura própria
- [ ] Verificar console do navegador para erros
- [ ] Validar no Supabase Logs (API e SQL)
