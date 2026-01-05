import requests
import json
import re

SUPABASE_URL = 'https://ahlqzzkxuutwoepirpzr.supabase.co'
SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobHF6emt4dXV0d29lcGlycHpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU3MTI0MywiZXhwIjoyMDc2MTQ3MjQzfQ.xWNEmZumCtyRdrIiotUIL41jlI168HyBgM4yHVDXPZo'

headers = {
    'apikey': SERVICE_ROLE_KEY,
    'Authorization': 'Bearer ' + SERVICE_ROLE_KEY,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
}

# Carregar lista de clientes
with open(r'C:\Users\Atendimento\Documents\AUDITORIA_CLIENTES.json', 'r', encoding='utf-8') as f:
    clientes = json.load(f)

# Filtrar apenas não cadastrados
nao_cadastrados = [c for c in clientes if not c['cadastrado']]

print(f'Total de clientes para cadastrar: {len(nao_cadastrados)}')
print()

sucesso = 0
erro = 0
erro_msg = ''

for i, c in enumerate(nao_cadastrados):
    nome = c['nome']

    # Limpar nome (remover caracteres especiais no final)
    nome = re.sub(r'\s*[\[\(].*$', '', nome).strip()

    # Gerar email temporário
    nome_email = re.sub(r'[^a-zA-Z0-9]', '.', nome.lower())[:30]
    email = f'{nome_email}@cliente.wgalmeida.temp'

    # Extrair data do projeto para observações
    data_projeto = c.get('data', '')
    if data_projeto and len(data_projeto) == 8:
        data_formatada = f'{data_projeto[6:8]}/{data_projeto[4:6]}/{data_projeto[:4]}'
    else:
        data_formatada = data_projeto

    cliente_data = {
        'nome': nome,
        'email': email,
        'tipo': 'CLIENTE',
        'ativo': True,
        'observacoes': f'Projeto Concluído - Data: {data_formatada} | Pasta: {c["pasta"]}'
    }

    response = requests.post(
        SUPABASE_URL + '/rest/v1/pessoas',
        headers=headers,
        json=cliente_data
    )

    if response.status_code in [200, 201]:
        sucesso += 1
        if sucesso % 50 == 0:
            print(f'Cadastrados: {sucesso}')
    else:
        erro += 1
        if not erro_msg:
            erro_msg = response.text[:200]

print()
print('=== RESULTADO ===')
print(f'Sucesso: {sucesso}')
print(f'Erro: {erro}')
if erro_msg:
    print(f'Detalhe erro: {erro_msg}')
