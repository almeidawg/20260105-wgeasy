# SECURITY

Runbook rápido para rotacionar chaves e proteger o projeto

1) Rotacionar chaves no Supabase
   - No Supabase Console, gere uma nova `Service Role` key e uma nova `anon` key.
   - NÃO remova as chaves antigas até que CI/hosting e staging estejam atualizados.

2) Atualizar variáveis de ambiente
   - Backend: definir `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`.
   - Frontend (build): definir `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
   - Definir `INTERNAL_API_KEY` para proteger proxies de AI.
   - Atualizar segredos no provedor (Vercel, Netlify, GitHub Actions, Azure, etc.).

3) Deploy em staging e validação
   - Deployar em staging primeiro.
   - Validar acessos: testar endpoints protegidos (`/api/openai/*`, `/api/anthropic/*`).
   - Validar RLS: garantir que políticas não usam `USING (true)` indiscriminadamente; testar acesso por tenancy/owner.

4) Remoção segura das chaves antigas
   - Após staging OK, remover chaves antigas e monitorar logs por 24h.

5) Purgar histórico (opcional, coordenado)
   - Somente após rotacionamento: reescrever histórico (git filter-repo / BFG), forçar push para remotes e informar a equipe para clonar novamente.

6) Checklist rápido pós-rotacionamento
   - Todas as variáveis de ambiente atualizadas no CI/hosting? ✅
   - Endpoints protegidos com `INTERNAL_API_KEY`? ✅
   - RLS testado em staging? ✅
   - Backup do banco feito antes de alterações em produção? ✅

Notas:
- Não commit secrets em código. Use env vars ou secret manager.
- Se quiser, posso inicializar git aqui, criar branch e abrir um PR com as mudanças aplicadas (requer permissão para criar remotes). 
