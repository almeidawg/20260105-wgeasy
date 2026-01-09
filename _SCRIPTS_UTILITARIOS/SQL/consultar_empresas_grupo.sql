-- ============================================================
-- Consultar as 4 Empresas do Grupo WG
-- ============================================================

SELECT
  id,
  razao_social,
  COALESCE(NULLIF(nome_fantasia, ''), razao_social) as nome_fantasia,
  cnpj,
  nucleo_id,
  email,
  telefone,
  cidade,
  estado,
  ativo
FROM empresas_grupo
WHERE ativo = true
ORDER BY nome_fantasia;
