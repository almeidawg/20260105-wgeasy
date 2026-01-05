-- =====================================================
-- ATUALIZAR USUARIOS COM NOVO UUID
-- Email: darcio@dbadvogados.com.br
-- Novo UUID: 804bbb0b-8ece-459f-8e9f-0b97d6400d2e
-- =====================================================

-- PASSO 1: Atualizar
UPDATE usuarios
SET auth_user_id = '804bbb0b-8ece-459f-8e9f-0b97d6400d2e'
WHERE id = '513f32ac-371f-477a-a16b-c1021094a6d6';

-- PASSO 2: Verificar
SELECT
  id,
  auth_user_id,
  email_confirmed,
  account_status,
  ativo
FROM usuarios
WHERE id = '513f32ac-371f-477a-a16b-c1021094a6d6';

-- Resultado esperado:
-- | id | auth_user_id | email_confirmed | account_status | ativo |
-- | 513f32ac-371f-477a-a16b-c1021094a6d6 | 804bbb0b-8ece-459f-8e9f-0b97d6400d2e | true | active | true |
