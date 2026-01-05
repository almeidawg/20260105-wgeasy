-- =============================================
-- SCRIPT: Criar usuário JURIDICO para teste
-- Sistema WG Easy - Grupo WG Almeida
-- Data: 2026-01-02
-- =============================================

-- =============================================
-- 1. VERIFICAR USUÁRIOS JURIDICO EXISTENTES
-- =============================================

SELECT
    u.id,
    u.tipo_usuario,
    u.ativo,
    u.cpf,
    u.auth_user_id,
    p.nome,
    p.email,
    p.telefone
FROM usuarios u
LEFT JOIN pessoas p ON p.id = u.pessoa_id
WHERE u.tipo_usuario = 'JURIDICO';

-- =============================================
-- 2. SE NÃO EXISTIR, CRIAR PESSOA PARA JURIDICO
-- Execute esta parte apenas se não houver usuário JURIDICO
-- =============================================

-- Primeiro, verifique se já existe pessoa com este CPF
SELECT * FROM pessoas WHERE cpf = '00000000001';

-- Se não existir, criar a pessoa:
INSERT INTO pessoas (
    nome,
    tipo,
    cpf,
    email,
    telefone,
    ativo
) VALUES (
    'Advogado Teste WG',
    'colaborador',
    '00000000001',
    'juridico@wgalmeida.com.br',
    '11999990001',
    true
)
ON CONFLICT (cpf) DO NOTHING
RETURNING id, nome, email;

-- =============================================
-- 3. CRIAR USUÁRIO NA TABELA USUARIOS
-- IMPORTANTE: O auth_user_id precisa ser criado primeiro no Supabase Auth
-- Use o Dashboard do Supabase > Authentication > Users > Add User
-- Email: juridico@wgalmeida.com.br
-- Password: Juridico123!
-- =============================================

-- Após criar o auth user, copie o UUID gerado e use aqui:
-- SUBSTITUA 'SEU_AUTH_USER_ID_AQUI' pelo UUID real

/*
INSERT INTO usuarios (
    auth_user_id,
    pessoa_id,
    cpf,
    tipo_usuario,
    ativo,
    primeiro_acesso,
    cliente_pode_ver_valores,
    cliente_pode_ver_cronograma,
    cliente_pode_ver_documentos,
    cliente_pode_ver_proposta,
    cliente_pode_ver_contratos,
    cliente_pode_fazer_upload,
    cliente_pode_comentar,
    criado_em,
    atualizado_em
)
SELECT
    'SEU_AUTH_USER_ID_AQUI'::uuid,  -- Substitua pelo UUID do Auth
    p.id,
    p.cpf,
    'JURIDICO',
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    NOW(),
    NOW()
FROM pessoas p
WHERE p.cpf = '00000000001'
ON CONFLICT (pessoa_id) DO NOTHING
RETURNING id, tipo_usuario;
*/

-- =============================================
-- 4. ALTERNATIVA: Criar usuário DIRETO via SQL
-- (Requer service_role key - usar apenas em dev)
-- =============================================

-- Se você tem um usuário MASTER/ADMIN logado, use a interface do sistema:
-- 1. Vá em /pessoas/colaboradores
-- 2. Crie um colaborador com email válido
-- 3. Vá em /usuarios
-- 4. Clique em "Novo Usuário"
-- 5. Selecione a pessoa criada
-- 6. Escolha tipo "JURIDICO"
-- 7. A senha será gerada automaticamente (ex: 000Adv991)

-- =============================================
-- 5. VERIFICAR TIPOS DE USUÁRIO DISPONÍVEIS
-- =============================================

SELECT DISTINCT tipo_usuario, COUNT(*) as total
FROM usuarios
GROUP BY tipo_usuario
ORDER BY tipo_usuario;

-- =============================================
-- 6. VERIFICAR SE RLS PERMITE JURIDICO
-- =============================================

-- Checar políticas da tabela assistencia_juridica
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'assistencia_juridica';

-- =============================================
-- FIM DO SCRIPT
-- =============================================
