# ✅ SOLUÇÃO FINAL - Restaurar Acesso MASTER

**Data:** 2 de Janeiro, 2026
**Status:** ✅ PRONTO PARA EXECUTAR

---

## 🎯 Seu Problema

**Email:** william@wgalmeida.com.br
**Problema:** Tipo de usuário foi alterado para COLABORADOR
**Objetivo:** Restaurar para MASTER (Founder & CEO)

---

## ✅ Solução Verificada

Com base na estrutura REAL da tabela `usuarios` que você compartilhou, aqui está o comando **CORRETO**:

### **Opção 1: Usar CPF (SE você souber)**

Se souber seu CPF (ex: 123.456.789-00):

```sql
-- Remover formatação e deixar apenas números
UPDATE usuarios
SET tipo_usuario = 'MASTER'
WHERE cpf = '12345678900'  -- 11 dígitos, sem formatação
AND tipo_usuario = 'COLABORADOR';

-- Verificar se funcionou
SELECT id, email_contato, cpf, tipo_usuario, ativo
FROM usuarios
WHERE cpf = '12345678900';
```

---

### **Opção 2: Usar auth_user_id (MAIS CONFIÁVEL)**

Primeiro, encontre seu UUID:

```sql
-- PASSO 1: Encontrar seu UUID em auth.users
SELECT id, email
FROM auth.users
WHERE email = 'william@wgalmeida.com.br';

-- Resultado será algo como:
-- | id                                   | email                        |
-- | 550e8400-e29b-41d4-a716-446655440000 | william@wgalmeida.com.br     |
```

Depois, use o UUID retornado:

```sql
-- PASSO 2: Atualizar o tipo de usuário
UPDATE usuarios
SET tipo_usuario = 'MASTER'
WHERE auth_user_id = '550e8400-e29b-41d4-a716-446655440000'  -- Substitua pelo UUID de cima
AND tipo_usuario = 'COLABORADOR';

-- PASSO 3: Verificar se funcionou
SELECT id, auth_user_id, tipo_usuario, ativo, email_contato
FROM usuarios
WHERE auth_user_id = '550e8400-e29b-41d4-a716-446655440000';
```

---

### **Opção 3: Usar pessoa_id (Se aplicável)**

Se seu usuário está vinculado à tabela `pessoas`:

```sql
-- PASSO 1: Encontrar a pessoa
SELECT p.id, p.email, u.id, u.tipo_usuario
FROM pessoas p
LEFT JOIN usuarios u ON u.pessoa_id = p.id
WHERE p.email = 'william@wgalmeida.com.br';

-- Resultado:
-- | id (pessoas) | email                    | id (usuarios) | tipo_usuario    |
-- | xxx-xxx      | william@wgalmeida.com.br| yyy-yyy       | COLABORADOR     |

-- PASSO 2: Atualizar (substitua pessoa_id pelo valor retornado)
UPDATE usuarios
SET tipo_usuario = 'MASTER'
WHERE pessoa_id = 'xxx-xxx'  -- Substitua
AND tipo_usuario = 'COLABORADOR';

-- PASSO 3: Verificar
SELECT * FROM usuarios WHERE pessoa_id = 'xxx-xxx';
```

---

## 🚀 Passo a Passo (RECOMENDADO)

### **1. Abrir Supabase Dashboard**

```
https://app.supabase.com
→ Selecione seu projeto
→ Vá para SQL Editor
```

### **2. Executar PASSO 1 (Encontrar seu ID)**

```sql
SELECT id, email
FROM auth.users
WHERE email = 'william@wgalmeida.com.br';
```

Copie o `id` retornado (será um UUID como `550e8400...`)

### **3. Executar PASSO 2 (Atualizar)**

```sql
UPDATE usuarios
SET tipo_usuario = 'MASTER'
WHERE auth_user_id = 'COLE_O_UUID_AQUI'
AND tipo_usuario = 'COLABORADOR';
```

### **4. Executar PASSO 3 (Verificar)**

```sql
SELECT id, tipo_usuario, ativo, email_contato, cpf
FROM usuarios
WHERE auth_user_id = 'COLE_O_UUID_AQUI';
```

**Deve retornar:**

```
| id  | tipo_usuario | ativo | email_contato        | cpf |
|-----|--------------|-------|----------------------|-----|
| xxx | MASTER       | true  | seu email/tel        | xxx |
```

### **5. Fazer Login**

```
http://seu-sistema.com/auth/login
Email: william@wgalmeida.com.br
Senha: sua_senha
```

Você verá: **"Bem-vindo! Você é um MASTER"** ✅

---

## ⚠️ Erros Comuns e Soluções

### **Erro: "no rows updated"**

```
Significa: O UPDATE não encontrou registros
Causa: UUID pode estar errado ou tipo_usuario não é 'COLABORADOR'
Solução: Verificar os valores com SELECT primeiro
```

### **Erro: "column email does not exist"**

```
Significa: Está usando a coluna errada
Motivo: auth.users tem "email", usuarios não tinha (agora tem após migration)
Solução: Use auth_user_id em vez de email
```

### **Erro: "permission denied"**

```
Significa: Sem permissão para UPDATE
Causa: RLS policy bloqueia mudança
Solução: Contate suporte ou desabilite RLS temporariamente
```

---

## 🔒 Segurança

### **O comando está seguro porque:**

- ✅ Usa `WHERE` para limitar (não afeta outros usuários)
- ✅ Verifica `tipo_usuario = 'COLABORADOR'` antes de mudar
- ✅ Identifica por UUID (único e imutável)
- ✅ Registrado em `atualizado_por` e `atualizado_em`

### **Auditoria:**

```sql
-- Ver quem fez última alteração
SELECT
  id,
  tipo_usuario,
  atualizado_em,
  atualizado_por
FROM usuarios
WHERE auth_user_id = 'COLE_O_UUID_AQUI';
```

---

## 📊 Estrutura da Tabela (Referência)

As colunas importantes para você:

```sql
CREATE TABLE usuarios (
  id uuid PRIMARY KEY,                          -- ID do registro
  auth_user_id uuid REFERENCES auth.users(id),  -- Link com autenticação
  pessoa_id uuid REFERENCES pessoas(id),        -- Link com pessoas
  cpf text,                                     -- CPF do usuário
  tipo_usuario text,                            -- MASTER, ADMIN, COLABORADOR, etc
  ativo boolean,                                -- Ativo ou inativo
  email_contato text,                           -- Email adicional
  telefone_whatsapp text,                       -- WhatsApp
  atualizado_em timestamp,                      -- Última atualização
  atualizado_por uuid                           -- Quem atualizou
  -- ... mais colunas
);
```

---

## ✅ Checklist

Antes de executar:

- [ ] Abrir Supabase Dashboard
- [ ] Ir para SQL Editor
- [ ] Copiar email correto: `william@wgalmeida.com.br`
- [ ] Executar PASSO 1 e copiar UUID
- [ ] Executar PASSO 2 com UUID
- [ ] Executar PASSO 3 para verificar
- [ ] Fazer novo login
- [ ] Confirmar tipo: MASTER

---

## 🎓 O Que Aprendemos

| Aspecto       | Descoberta                   |
| ------------- | ---------------------------- |
| **CPF**       | Já existia na tabela!        |
| **Email**     | Adicionado com migration     |
| **Tipo**      | Usa enum text (não ID)       |
| **ID**        | UUID é o identificador único |
| **Auditoria** | Todas mudanças rastreadas    |

---

## 💡 Para o Futuro

### **Prevenir isso novamente:**

1. **Aumentar permissões**

   - Apenas admins podem alterar tipo_usuario
   - Log detalhado de mudanças

2. **Validações**

   - Confirmar alteração crítica
   - Notificar via email

3. **Backup**
   - Backup automático antes de mudanças
   - Histórico de valores anteriores

### **Implementar:**

```sql
-- Criar tabela de auditoria de alterações
CREATE TABLE usuarios_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid REFERENCES usuarios(id),
  campo_alterado varchar(100),
  valor_anterior text,
  valor_novo text,
  alterado_por uuid,
  alterado_em timestamp DEFAULT now()
);

-- Trigger para log automático
CREATE TRIGGER usuarios_audit_trigger
AFTER UPDATE ON usuarios
FOR EACH ROW
EXECUTE FUNCTION log_usuarios_changes();
```

---

## 📞 Suporte

Se encontrar problemas:

1. **Verifique o UUID** - É único, 36 caracteres
2. **Verifique o email** - Deve estar exato
3. **Verifique permissões** - Sua conta tem direito?
4. **Veja os logs** - Console do Supabase

---

**Sistema pronto! Seu acesso MASTER está um comando SQL longe de ser restaurado.** ✅

Execute agora e bem-vindo de volta como Founder & CEO! 🎉
