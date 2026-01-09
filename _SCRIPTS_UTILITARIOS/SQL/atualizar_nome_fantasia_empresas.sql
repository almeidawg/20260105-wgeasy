-- ============================================================
-- Atualizar nome_fantasia das Empresas do Grupo WG
-- Para diferenciar cada empresa corretamente
-- ============================================================

-- 1. WG ALMEIDA ARQUITETURA E COMERCIO LTDA → WG ARQUITETURA
UPDATE empresas_grupo
SET nome_fantasia = 'WG ARQUITETURA'
WHERE id = '46d28245-70a1-49ac-b4e5-3bd6b8628614';

-- 2. WG ALMEIDA MARCENARIA DE ALTO PADRAO LTDA → WG MARCENARIA
UPDATE empresas_grupo
SET nome_fantasia = 'WG MARCENARIA'
WHERE id = 'ed2242f1-5e50-4dee-9322-0da9abc17d35';

-- 3. WG ALMEIDA REFORMAS ESPECIALIZADAS LTDA → WG REFORMAS
UPDATE empresas_grupo
SET nome_fantasia = 'WG REFORMAS'
WHERE id = '802ad403-deb2-4a24-a5c4-8e0a756d327d';

-- 4. W.G. DE ALMEIDA DESIGNER DE INTERIORES → Já está correto
-- (Mantém: W.G. DESIGNER DE INTERIORES)

-- ============================================================
-- VERIFICAÇÃO FINAL
-- ============================================================
SELECT
  id,
  razao_social,
  nome_fantasia,
  cnpj
FROM empresas_grupo
WHERE ativo = true
ORDER BY nome_fantasia;
