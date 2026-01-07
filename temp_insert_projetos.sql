-- Inserir projetos com status permitido e nucleo permitido
insert into projetos (nome,status,nucleo,progresso)
values
  ('Projeto Engenharia', 'em_andamento', 'engenharia', 20),
  ('Projeto Arquitetura', 'em_andamento', 'arquitetura', 15)
on conflict do nothing;
