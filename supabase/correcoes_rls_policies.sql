-- Correções de RLS e Policies para Supabase

ALTER TABLE public.analises ENABLE ROW LEVEL SECURITY;


DROP POLICY IF EXISTS "Permitir SELECT para usuários autenticados" ON public.checklist_template_itens;
CREATE POLICY "Permitir SELECT para usuários autenticados"
  ON public.checklist_template_itens
  FOR SELECT
  USING (auth.uid() IS NOT NULL);


DROP POLICY IF EXISTS "Permitir SELECT para usuários autenticados" ON public.cotacao_fornecedores;
CREATE POLICY "Permitir SELECT para usuários autenticados"
  ON public.cotacao_fornecedores
  FOR SELECT
  USING (auth.uid() IS NOT NULL);


DROP POLICY IF EXISTS "Permitir SELECT para usuários autenticados" ON z_archive_20260104.project_task_dependencies;
CREATE POLICY "Permitir SELECT para usuários autenticados"
  ON z_archive_20260104.project_task_dependencies
  FOR SELECT
  USING (auth.uid() IS NOT NULL);


DROP POLICY IF EXISTS "Permitir SELECT para usuários autenticados" ON z_archive_20260104.project_tasks;
CREATE POLICY "Permitir SELECT para usuários autenticados"
  ON z_archive_20260104.project_tasks
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Permitir INSERT para usuários autenticados" ON public.tasks;
CREATE POLICY "Permitir INSERT para usuários autenticados"
  ON public.tasks
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Permitir UPDATE para usuários autenticados" ON public.tasks;
CREATE POLICY "Permitir UPDATE para usuários autenticados"
  ON public.tasks
  FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);




