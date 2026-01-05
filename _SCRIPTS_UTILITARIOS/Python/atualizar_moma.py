import requests
import json

SUPABASE_URL = 'https://ahlqzzkxuutwoepirpzr.supabase.co'
SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobHF6emt4dXV0d29lcGlycHpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU3MTI0MywiZXhwIjoyMDc2MTQ3MjQzfQ.xWNEmZumCtyRdrIiotUIL41jlI168HyBgM4yHVDXPZo'

headers = {
    'apikey': SERVICE_ROLE_KEY,
    'Authorization': 'Bearer ' + SERVICE_ROLE_KEY,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
}

print('='*60)
print('ATUALIZACAO MOMA - UNIDADE DE NEGOCIO')
print('='*60)
print()

# IDs das contas virtuais MOMA
CONTA_MOMA_ENG = 'b93f93cd-9a04-49b7-8ac8-b97dd4ea6437'
CONTA_MOMA_PLAN = '66728ca8-35a0-40a4-adfd-7780769d9458'

# 1. Buscar todos os lancamentos MOMA
print('1. Buscando lancamentos MOMA...')
response = requests.get(
    SUPABASE_URL + '/rest/v1/financeiro_lancamentos?select=id,origem,descricao,conta_bancaria_id&origem=like.MOMA*',
    headers=headers
)
lancamentos = response.json()
print(f'   Total: {len(lancamentos)}')

# 2. Atualizar lancamentos para MOMA_ENGENHARIA ou MOMA_PLANEJADOS
print()
print('2. Atualizando unidade_negocio e vinculando conta virtual...')

sucesso = 0
erro = 0

for lanc in lancamentos:
    lanc_id = lanc['id']
    origem = lanc.get('origem', '')
    descricao = lanc.get('descricao', '').lower()

    # Determinar se é Engenharia ou Planejado
    # Por padrao MOMA é engenharia, mas se mencionar "planejado" vai para planejados
    if 'planejado' in descricao or 'planejados' in descricao or 'marcenaria' in descricao:
        unidade = 'MOMA_PLANEJADOS'
        conta_id = CONTA_MOMA_PLAN
    else:
        unidade = 'MOMA_ENGENHARIA'
        conta_id = CONTA_MOMA_ENG

    # Atualizar
    update_data = {
        'unidade_negocio': unidade,
        'conta_bancaria_id': conta_id
    }

    response = requests.patch(
        SUPABASE_URL + f'/rest/v1/financeiro_lancamentos?id=eq.{lanc_id}',
        headers=headers,
        json=update_data
    )

    if response.status_code in [200, 201, 204]:
        sucesso += 1
        if sucesso % 50 == 0:
            print(f'   Atualizados: {sucesso}')
    else:
        erro += 1
        if erro == 1:
            print(f'   Erro: {response.text[:200]}')

print()
print('='*60)
print('RESULTADO')
print('='*60)
print(f'Sucesso: {sucesso}')
print(f'Erro: {erro}')

# 3. Verificar resultado
print()
print('3. Verificando resultado...')
response = requests.get(
    SUPABASE_URL + '/rest/v1/financeiro_lancamentos?select=unidade_negocio,conta_bancaria_id&origem=like.MOMA*',
    headers=headers
)
lancamentos_atualizados = response.json()

# Contar por unidade_negocio
unidades = {}
contas = {}
for l in lancamentos_atualizados:
    un = l.get('unidade_negocio', 'SEM_UNIDADE')
    conta = l.get('conta_bancaria_id', 'SEM_CONTA')
    unidades[un] = unidades.get(un, 0) + 1
    contas[conta] = contas.get(conta, 0) + 1

print()
print('Por Unidade de Negocio:')
for un, count in unidades.items():
    print(f'   {un}: {count}')

print()
print('Por Conta Bancaria:')
for conta, count in contas.items():
    if conta == CONTA_MOMA_ENG:
        print(f'   MOMA Engenharia (Virtual): {count}')
    elif conta == CONTA_MOMA_PLAN:
        print(f'   MOMA Planejado (Virtual): {count}')
    else:
        print(f'   {conta}: {count}')
