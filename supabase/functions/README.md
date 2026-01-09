# Edge Functions - WG Easy Sistema

## Deploy das Edge Functions

Para fazer deploy das Edge Functions no Supabase:

### 1. Instalar Supabase CLI
```bash
npm install -g supabase
```

### 2. Login no Supabase
```bash
supabase login
```

### 3. Linkar com o projeto
```bash
cd E:/sistema/20260105-wgeasy
supabase link --project-ref ahlqzzkxuutwoepirpzr
```

### 4. Deploy das funções
```bash
# Deploy de todas as funções
supabase functions deploy criar-usuario-admin
supabase functions deploy excluir-usuario-admin
supabase functions deploy alterar-senha-admin

# Ou deploy de todas de uma vez
supabase functions deploy
```

### 5. Configurar secrets (se necessário)
As variáveis SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são injetadas automaticamente.

## Funções Disponíveis

### criar-usuario-admin
- **Endpoint**: `https://ahlqzzkxuutwoepirpzr.supabase.co/functions/v1/criar-usuario-admin`
- **Método**: POST
- **Body**: `{ email, senha, pessoa_id, tipo_usuario, cpf, nome, telefone }`
- **Descrição**: Cria usuário já confirmado no Auth usando Admin API

### excluir-usuario-admin
- **Endpoint**: `https://ahlqzzkxuutwoepirpzr.supabase.co/functions/v1/excluir-usuario-admin`
- **Método**: POST
- **Body**: `{ usuario_id, excluir_pessoa? }`
- **Descrição**: Exclui usuário do Auth e da tabela usuarios

### alterar-senha-admin
- **Endpoint**: `https://ahlqzzkxuutwoepirpzr.supabase.co/functions/v1/alterar-senha-admin`
- **Método**: POST
- **Body**: `{ usuario_id?, auth_user_id?, email?, nova_senha }`
- **Descrição**: Altera senha do usuário usando Admin API

## Testando localmente
```bash
supabase functions serve
```

## Logs
```bash
supabase functions logs criar-usuario-admin
```
