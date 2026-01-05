# 🔧 CORREÇÃO: Restaurar Usuário FOUNDER & CEO

**Data:** 2 de Janeiro, 2026
**Problema:** Usuário foi alterado de "FOUNDER & CEO" para "COLABORADOR"
**Solução:** Atualizar tipo_usuario de volta para "MASTER"

---

## ⚠️ Erro: Coluna 'email' não existe

Você recebeu um erro dizendo que a coluna `email` não existe na tabela `usuarios`. Vamos diagnosticar e corrigir:

---

## 🔍 Etapa 1: Diagnosticar Estrutura

Execute **isto primeiro** no Supabase SQL Editor:

```sql
-- Ver as colunas da tabela usuarios
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'usuarios'
ORDER BY ordinal_position;
```

Isto vai mostrar quais colunas realmente existem.

---

## ✅ Etapa 2: Escolher a Solução Correta

Dependendo do resultado, use **UMA DESTAS**:

### Se tem coluna `email`:

```sql
UPDATE usuarios
SET tipo_usuario = 'MASTER'
WHERE email = 'william@wgalmeida.com.br';

SELECT email, tipo_usuario FROM usuarios WHERE email = 'william@wgalmeida.com.br';
```

### Se tem coluna `pessoa_id`:

```sql
-- Encontrar pessoa
SELECT id, email FROM pessoas WHERE email = 'william@wgalmeida.com.br';

-- Atualizar usuario
UPDATE usuarios
SET tipo_usuario = 'MASTER'
WHERE pessoa_id = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';

-- Verificar
SELECT u.id, u.tipo_usuario, p.email
FROM usuarios u
LEFT JOIN pessoas p ON u.pessoa_id = p.id
WHERE u.tipo_usuario = 'MASTER';
```

### Se tem coluna `auth_user_id`:

```sql
-- Encontrar auth_user_id
SELECT id FROM auth.users WHERE email = 'william@wgalmeida.com.br';

-- Atualizar usando auth_user_id
UPDATE usuarios
SET tipo_usuario = 'MASTER'
WHERE auth_user_id = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';

-- Verificar
SELECT u.id, u.auth_user_id, u.tipo_usuario
FROM usuarios u
WHERE u.tipo_usuario = 'MASTER';
```

---

## 📋 Tipos de Usuário Agora Disponíveis

| Tipo            | Descrição            | Nível            |
| --------------- | -------------------- | ---------------- |
| **MASTER**      | Founder & CEO        | Nível 1 (Máximo) |
| **ADMIN**       | Administrador        | Nível 2          |
| **CLIENTE**     | Cliente              | Nível 3          |
| **COLABORADOR** | Colaborador Interno  | Nível 4          |
| **FORNECEDOR**  | Fornecedor/Prestador | Nível 5          |
| **JURIDICO**    | Setor Jurídico       | Nível 4          |
| **FINANCEIRO**  | Setor Financeiro     | Nível 4          |

---

## ✅ Verificação Final

Após atualizar, execute:

```sql
SELECT * FROM usuarios WHERE tipo_usuario = 'MASTER';
```

Deve retornar seu usuário com `tipo_usuario = MASTER` ✅

---

## 🚀 Próximas Ações

1. ✅ Diagnostique a estrutura
2. ✅ Escolha a opção correta
3. ✅ Execute o UPDATE
4. ✅ Verifique o resultado
5. ✅ Faça login para confirmar

---

_Problema resolvido em poucos passos!_
FROM usuarios
WHERE email = 'william@wgalmeida.com.br';

-- Deve retornar:
-- email: william@wgalmeida.com.br
-- tipo_usuario: MASTER ✅
-- ativo: true

```

---

## 📋 Tipos de Usuário Atualizados

Agora o sistema reconhece:

| Tipo            | Descrição            | Nível            |
| --------------- | -------------------- | ---------------- |
| **MASTER**      | Founder & CEO        | Nível 1 (Máximo) |
| **ADMIN**       | Administrador        | Nível 2          |
| **CLIENTE**     | Cliente              | Nível 3          |
| **COLABORADOR** | Colaborador Interno  | Nível 4          |
| **FORNECEDOR**  | Fornecedor/Prestador | Nível 5          |
| **JURIDICO**    | Setor Jurídico       | Nível 4          |
| **FINANCEIRO**  | Setor Financeiro     | Nível 4          |

---

## ✅ Pós-Correção

Após executar a migration:

1. ✅ Seu tipo será "MASTER"
2. ✅ Terá acesso a todos os módulos
3. ✅ SignupPage agora mostra opção "Master / Founder & CEO"
4. ✅ Novos usuários podem ser criados com esse tipo

---

## 🛡️ Prevenção Futura

Para evitar que isso aconteça novamente:

1. **Adicionar validação:** Impedir downgrade de MASTER sem confirmação
2. **Audit logs:** Registrar quem alterou o tipo de usuário
3. **Admin panel:** Criar interface para gerenciar tipos de usuário

---

## 📝 Arquivos Modificados

- ✅ `SignupPage.tsx` - Adicionados tipos MASTER e ADMIN
- ✅ `FIX_USER_TYPE_FOUNDER_CEO.sql` - Migration para correção
- ✅ Este arquivo - Instruções de correção

---

## 🚀 Próximas Ações

1. Execute a migration
2. Verifique que tipo_usuario = 'MASTER'
3. Teste login com sua conta
4. Verifique que tem acesso total ao sistema

---

_Correção rápida e simples. Problema resolvido em 2 minutos!_
```
