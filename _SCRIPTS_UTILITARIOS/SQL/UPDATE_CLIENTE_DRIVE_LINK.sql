-- Atualizar drive_link do cliente Rafael de Souza Lacerda
-- Cliente ID: a8921a1a-4c1f-4cd5-b8e3-f72d951dc951

UPDATE pessoas
SET drive_link = 'https://drive.google.com/drive/folders/1cSFZ8mL39I6W4dD2IKUb_7DlYgmIh4KW'
WHERE id = 'a8921a1a-4c1f-4cd5-b8e3-f72d951dc951';

-- Verificar se atualizou
SELECT id, nome, drive_link
FROM pessoas
WHERE id = 'a8921a1a-4c1f-4cd5-b8e3-f72d951dc951';
