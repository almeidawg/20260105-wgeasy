-- ============================================================================
-- Migration: Corrigir trigger de criacao de usuarios no Auth
-- Sistema WG Easy - Grupo WG Almeida
-- Data: 2026-01-09
-- Problema: "Database error saving new user" ao criar usuario via signUp
-- ============================================================================

-- ============================================================================
-- 1. DIAGNOSTICO: Listar triggers existentes no auth.users
-- Execute primeiro para verificar se existe trigger problemático
-- ============================================================================
-- SELECT trigger_name, event_manipulation, action_statement
-- FROM information_schema.triggers
-- WHERE event_object_schema = 'auth' AND event_object_table = 'users';

-- ============================================================================
-- 2. REMOVER TRIGGER PROBLEMÁTICO (se existir)
-- O trigger on_auth_user_created pode estar falhando ao tentar inserir
-- na tabela usuarios quando dados obrigatórios estão faltando
-- ============================================================================

-- Remover trigger antigo que pode estar causando erro
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- ============================================================================
-- 3. CRIAR FUNÇÃO SEGURA PARA HANDLE DE NOVOS USUARIOS
-- Esta função NÃO cria registro na tabela usuarios automaticamente
-- O registro será criado pelo frontend via usuariosApi.ts
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_pessoa_id UUID;
  v_tipo_usuario TEXT;
BEGIN
  -- Extrair dados do raw_user_meta_data se existirem
  v_pessoa_id := (NEW.raw_user_meta_data->>'pessoa_id')::UUID;
  v_tipo_usuario := COALESCE(NEW.raw_user_meta_data->>'tipo_usuario', 'CLIENTE');

  -- Se tiver pessoa_id no metadata, criar registro na tabela usuarios
  -- Caso contrário, NÃO criar (será criado pelo frontend)
  IF v_pessoa_id IS NOT NULL THEN
    BEGIN
      INSERT INTO public.usuarios (
        auth_user_id,
        pessoa_id,
        cpf,
        tipo_usuario,
        ativo,
        primeiro_acesso,
        criado_em,
        atualizado_em
      ) VALUES (
        NEW.id,
        v_pessoa_id,
        COALESCE(NEW.raw_user_meta_data->>'cpf', ''),
        v_tipo_usuario,
        true,
        true,
        NOW(),
        NOW()
      )
      ON CONFLICT (auth_user_id) DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
      -- Log do erro mas NÃO falha a criação do usuário no Auth
      RAISE WARNING 'Erro ao criar registro de usuario: %', SQLERRM;
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 4. RECRIAR TRIGGER COM TRATAMENTO DE ERRO
-- O trigger não falhará mais a criação do usuário no Auth
-- ============================================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 5. GARANTIR QUE TABELA USUARIOS TEM CONSTRAINT CORRETA
-- ============================================================================

-- Remover constraint duplicada se existir
ALTER TABLE public.usuarios DROP CONSTRAINT IF EXISTS usuarios_auth_user_id_key;

-- Adicionar constraint única para auth_user_id
ALTER TABLE public.usuarios
  ADD CONSTRAINT usuarios_auth_user_id_key UNIQUE (auth_user_id);

-- ============================================================================
-- 6. PERMITIR NULL em pessoa_id para usuários criados via signUp
-- ============================================================================

ALTER TABLE public.usuarios
  ALTER COLUMN pessoa_id DROP NOT NULL;

-- ============================================================================
-- 7. PERMITIR NULL em cpf para usuários criados via signUp
-- ============================================================================

ALTER TABLE public.usuarios
  ALTER COLUMN cpf DROP NOT NULL;

-- ============================================================================
-- 8. VERIFICAR SE EXISTE CONFLITO DE EMAIL NO AUTH
-- Execute manualmente para verificar duplicados
-- ============================================================================
-- SELECT email, COUNT(*)
-- FROM auth.users
-- GROUP BY email
-- HAVING COUNT(*) > 1;

-- ============================================================================
-- COMENTÁRIO FINAL
-- ============================================================================
COMMENT ON FUNCTION public.handle_new_user() IS
'Função segura para criar registro de usuario após signUp.
Não falha a criação do usuário no Auth mesmo se houver erro no INSERT.
Criado em 2026-01-09 para corrigir erro "Database error saving new user"';

