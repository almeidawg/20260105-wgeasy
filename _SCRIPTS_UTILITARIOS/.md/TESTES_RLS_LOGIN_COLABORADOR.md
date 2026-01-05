# 🧪 TESTES: Verificar RLS e Limpeza - GUIA PRÁTICO

## ✅ Teste 1: Verificar RLS Status

### 📍 Localização: Supabase → SQL Editor

```sql
-- Teste rápido: RLS habilitado?
SELECT
    tablename,
    rowsecurity,
    CASE WHEN rowsecurity THEN '✅ Habilitado' ELSE '❌ Desabilitado' END as status
FROM pg_tables
WHERE tablename IN ('usuarios', 'pessoas');
```

**Resultado esperado:**

```
tablename | rowsecurity | status
----------|-------------|------------------
usuarios  | true        | ✅ Habilitado
pessoas   | true        | ✅ Habilitado
```

---

## ✅ Teste 2: Verificar Políticas RLS

### 📍 Localização: Supabase → SQL Editor

```sql
-- Ver todas as políticas na tabela usuarios
SELECT
    policyname,
    permissive,
    qual,
    CASE
        WHEN policyname LIKE '%select%' THEN 'SELECT'
        WHEN policyname LIKE '%insert%' THEN 'INSERT'
        WHEN policyname LIKE '%update%' THEN 'UPDATE'
        WHEN policyname LIKE '%delete%' THEN 'DELETE'
        ELSE 'OUTRO'
    END as operacao
FROM pg_policies
WHERE tablename = 'usuarios'
ORDER BY policyname;
```

**Resultado esperado:**

```
policyname                    | permissive | qual | operacao
------------------------------|-----------|------|----------
usuarios_select_own_or_admin  | true      | USING| SELECT
usuarios_insert_admin_only    | true      | WITH | INSERT
usuarios_update_own_or_admin  | true      | USING| UPDATE
usuarios_delete_admin_only    | true      | WITH | DELETE
```

**O que significa:**

- ✅ `usuarios_select_own_or_admin` = Usuário vê seu próprio + admin vê tudo
- ✅ `usuarios_insert_admin_only` = Só admin cria usuários
- ✅ `usuarios_update_own_or_admin` = Usuário edita seu próprio + admin edita qualquer um
- ✅ `usuarios_delete_admin_only` = Só admin deleta

---

## ✅ Teste 3: Verificar Tipo de Usuário dos Colaboradores

### 📍 Localização: Supabase → SQL Editor

```sql
-- Ver se tipos estão sincronizados
SELECT
    u.id,
    u.email,
    u.tipo_usuario as tipo_usuario_atual,
    p.tipo as tipo_pessoa_esperado,
    p.nome,
    CASE
        WHEN u.tipo_usuario = p.tipo THEN '✅ OK'
        WHEN u.tipo_usuario IS NULL THEN '❌ NULL'
        ELSE '❌ DIVERGENTE'
    END as status
FROM usuarios u
LEFT JOIN pessoas p ON p.id = u.pessoa_id
WHERE p.tipo = 'COLABORADOR'
ORDER BY p.nome;
```

**Resultado esperado:**

```
id  | email           | tipo_usuario_atual | tipo_pessoa_esperado | nome   | status
----|-----------------|-------------------|----------------------|--------|--------
1   | joao@...        | COLABORADOR       | COLABORADOR         | João   | ✅ OK
2   | maria@...       | COLABORADOR       | COLABORADOR         | Maria  | ✅ OK
...
```

**Se houver divergências (tipo ❌ DIVERGENTE):**

```sql
-- Corrigir automaticamente
UPDATE usuarios u
SET tipo_usuario = p.tipo, atualizado_em = NOW()
FROM pessoas p
WHERE u.pessoa_id = p.id
  AND p.tipo = 'COLABORADOR'
  AND u.tipo_usuario != 'COLABORADOR';
```

---

## ✅ Teste 4: Verificar Campos Críticos

### 📍 Localização: Supabase → SQL Editor

```sql
-- Ver problemas nos registros
SELECT
    u.id,
    u.email,
    CASE WHEN u.auth_user_id IS NULL THEN '❌ SEM AUTH' ELSE '✅ OK' END as auth_user_id,
    CASE WHEN u.email_confirmed THEN '✅ CONFIRMADO' ELSE '❌ NÃO CONFIRMADO' END as email,
    CASE WHEN u.account_status = 'active' THEN '✅ ATIVO' ELSE '❌ ' || u.account_status END as account_status,
    CASE WHEN u.ativo THEN '✅ ATIVO' ELSE '❌ INATIVO' END as ativo
FROM usuarios u
JOIN pessoas p ON p.id = u.pessoa_id
WHERE p.tipo = 'COLABORADOR'
ORDER BY u.email;
```

**Resultado esperado:**

```
Todos os colaboradores devem ter:
✅ auth_user_id = preenchido
✅ email_confirmed = true
✅ account_status = 'active'
✅ ativo = true
```

**Correções se necessário:**

```sql
-- Confirmar emails não confirmados
UPDATE usuarios
SET email_confirmed = true, atualizado_em = NOW()
WHERE tipo_usuario = 'COLABORADOR'
  AND email_confirmed = false;

-- Ativar contas inativas
UPDATE usuarios
SET account_status = 'active', atualizado_em = NOW()
WHERE tipo_usuario = 'COLABORADOR'
  AND account_status != 'active';
```

---

## ✅ Teste 5: Simular Login (Browser DevTools)

### 📍 Localização: Console do Navegador (F12)

Após fazer login com usuário colaborador:

```javascript
// Ver dados do usuário autenticado
const { data } = await supabase.auth.getUser();
console.log("Auth User:", data.user);

// Ver tipo_usuario do usuário
const { data: usuario } = await supabase
  .from("usuarios")
  .select("id, tipo_usuario, pessoa_id")
  .eq("auth_user_id", data.user.id)
  .maybeSingle();

console.log("Usuario DB:", usuario);
// Deve retornar: { id: '...', tipo_usuario: 'COLABORADOR', pessoa_id: '...' }
```

**Resultado esperado:**

```javascript
Usuario DB: {
  id: 'xxxxx',
  tipo_usuario: 'COLABORADOR',  // ← Deve ser COLABORADOR!
  pessoa_id: 'yyyyy'
}
```

---

## ✅ Teste 6: Verificar Redirecionamento

### 📍 Localização: Console do Navegador (F12)

```javascript
// Ver URL atual após login
console.log("URL atual:", window.location.pathname);
// Esperado: /colaborador ✅

// Ver se há erro no useNavigate
// (procure por mensagens como "Navigate to /wgx" ou similar)
```

### Network Tab (F12 → Network)

1. Limpar logs: `Ctrl+L`
2. Fazer login
3. Procurar por requisições para `/usuarios`
4. Verificar:
   - ✅ Status 200 OK (não 403 Forbidden)
   - ✅ Response contém `tipo_usuario: 'COLABORADOR'`

---

## ✅ Teste 7: Teste Completo End-to-End

### 📍 Execução Manual (5-10 minutos)

```bash
# 1. Selecionar usuário colaborador de teste
# Exemplo: joao.silva@wgalmeida.com.br

# 2. Abrir navegador em modo anônimo/privado (evita cache)
# Ctrl+Shift+N (Chrome/Edge) ou Ctrl+Shift+P (Firefox)

# 3. Acessar: https://easy.wgalmeida.com.br/login

# 4. Digitar credenciais
Email: joao.silva@wgalmeida.com.br
Senha: (a que foi gerada/enviada)

# 5. Observar:
✅ Login sucede (sem erro 400)
✅ Página carrega (não fica em branco)
✅ Redireciona para /colaborador
✅ ColaboradorLayout aparece
✅ Menu lateral mostra "Portal do Colaborador"

# 6. Se houver erro, abrir DevTools (F12)
- Console: procurar por erros vermelhos
- Network: procurar por requisições falhadas (403, 500)
- Application → Cookies: verificar se session existe

# 7. Verificar RLS Logs no Supabase
- Ir em: Supabase Dashboard → Logs → API
- Procurar por requisições do usuário
- Ver se há erros de RLS (22P02, 42501, etc)
```

---

## 🔴 Teste 8: Diagnóstico de Erro (Se Login Falhar)

### Passo 1: Ver erro na query

```sql
-- Executar COMO o usuário que está falhando:
-- (Usar service_role key para simular como usuario específico)

SELECT
    id, tipo_usuario, pessoa_id, email, account_status
FROM usuarios
WHERE auth_user_id = 'UUID_DO_USUARIO_AQUI';
-- Se retornar vazio ou erro → RLS está bloqueando
```

### Passo 2: Ver qual política está bloqueando

```sql
-- Ver todas as políticas e seu USING clause
SELECT policyname, qual, permissive
FROM pg_policies
WHERE tablename = 'usuarios'
  AND qual = 'USING'
ORDER BY policyname;
```

### Passo 3: Teste de política específica

```sql
-- Testar se a política de SELECT está funcionando:
-- (Executar como usuario autenticado no Supabase)

-- Isso deve retornar seu próprio registro:
SELECT id, tipo_usuario, email
FROM usuarios
WHERE auth_user_id = auth.uid();
```

---

## 📊 Resumo de Testes

| Teste   | O Que Verifica      | Esperado       | Comando                                                    |
| ------- | ------------------- | -------------- | ---------------------------------------------------------- |
| Teste 1 | RLS Habilitado      | true           | `SELECT rowsecurity FROM pg_tables`                        |
| Teste 2 | Políticas Criadas   | 4 políticas    | `SELECT COUNT(*) FROM pg_policies`                         |
| Teste 3 | Tipos Sincronizados | 0 divergências | `SELECT * FROM usuarios WHERE tipo_usuario != tipo_pessoa` |
| Teste 4 | Campos Válidos      | Sem NULLs      | `SELECT * FROM usuarios WHERE auth_user_id IS NULL`        |
| Teste 5 | Login Query         | 200 OK         | DevTools Console                                           |
| Teste 6 | Redirecionamento    | /colaborador   | Browser URL                                                |
| Teste 7 | E2E                 | Tudo funciona  | Manual test                                                |
| Teste 8 | Debug               | Achar erro     | SQL + Console                                              |

---

## ✅ Checklist Final

- [ ] Teste 1: RLS = true
- [ ] Teste 2: 4 políticas criadas
- [ ] Teste 3: 0 divergências de tipo
- [ ] Teste 4: Sem campos NULL
- [ ] Teste 5: Login retorna tipo correto
- [ ] Teste 6: Redireciona para /colaborador
- [ ] Teste 7: E2E funciona sem erros
- [ ] Teste 8: Nenhum erro de RLS

---

**Todos os testes passando? ✅ Sistema pronto!**
