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
print('CRIANDO NUCLEOS MOMA (VIRTUAIS)')
print('='*60)
print()

# IDs das contas virtuais MOMA
CONTA_MOMA_ENG = 'b93f93cd-9a04-49b7-8ac8-b97dd4ea6437'
CONTA_MOMA_PLAN = '66728ca8-35a0-40a4-adfd-7780769d9458'

# 1. Criar nucleo MOMA Engenharia
print('1. Criando nucleo MOMA Engenharia...')
nucleo_moma_eng = {
    'nome': 'MOMA Engenharia',
    'descricao': 'Nucleo virtual para operacoes MOMA - Arquitetura e Engenharia',
    'cor': '#4A90D9',
    'ativo': True,
    'modelo_financeiro': 'virtual',
    'ordem_exibicao': 10,
    'conta_entrada_id': CONTA_MOMA_ENG,
    'conta_saida_id': CONTA_MOMA_ENG
}

response = requests.post(
    SUPABASE_URL + '/rest/v1/nucleos',
    headers=headers,
    json=nucleo_moma_eng
)

if response.status_code in [200, 201]:
    moma_eng_id = response.json()[0]['id']
    print(f'   Criado! ID: {moma_eng_id}')
else:
    print(f'   Erro: {response.text[:200]}')
    # Tentar buscar se ja existe
    response = requests.get(
        SUPABASE_URL + '/rest/v1/nucleos?nome=eq.MOMA%20Engenharia',
        headers=headers
    )
    if response.json():
        moma_eng_id = response.json()[0]['id']
        print(f'   Ja existe! ID: {moma_eng_id}')
    else:
        moma_eng_id = None

# 2. Criar nucleo MOMA Planejados
print()
print('2. Criando nucleo MOMA Planejados...')
nucleo_moma_plan = {
    'nome': 'MOMA Planejados',
    'descricao': 'Nucleo virtual para operacoes MOMA - Planejados e Marcenaria',
    'cor': '#8B5E3C',
    'ativo': True,
    'modelo_financeiro': 'virtual',
    'ordem_exibicao': 11,
    'conta_entrada_id': CONTA_MOMA_PLAN,
    'conta_saida_id': CONTA_MOMA_PLAN
}

response = requests.post(
    SUPABASE_URL + '/rest/v1/nucleos',
    headers=headers,
    json=nucleo_moma_plan
)

if response.status_code in [200, 201]:
    moma_plan_id = response.json()[0]['id']
    print(f'   Criado! ID: {moma_plan_id}')
else:
    print(f'   Erro: {response.text[:200]}')
    # Tentar buscar se ja existe
    response = requests.get(
        SUPABASE_URL + '/rest/v1/nucleos?nome=eq.MOMA%20Planejados',
        headers=headers
    )
    if response.json():
        moma_plan_id = response.json()[0]['id']
        print(f'   Ja existe! ID: {moma_plan_id}')
    else:
        moma_plan_id = None

# 3. Atualizar lancamentos MOMA com o nucleo_id
if moma_eng_id:
    print()
    print('3. Atualizando lancamentos MOMA...')

    # Buscar lancamentos MOMA
    response = requests.get(
        SUPABASE_URL + '/rest/v1/financeiro_lancamentos?select=id,descricao,conta_bancaria_id&origem=like.MOMA*',
        headers=headers
    )
    lancamentos = response.json()
    print(f'   Total: {len(lancamentos)}')

    sucesso = 0
    erro = 0

    for lanc in lancamentos:
        lanc_id = lanc['id']
        descricao = lanc.get('descricao', '').lower()

        # Determinar nucleo
        if 'planejado' in descricao or 'marcenaria' in descricao:
            nucleo_id = moma_plan_id
            conta_id = CONTA_MOMA_PLAN
        else:
            nucleo_id = moma_eng_id
            conta_id = CONTA_MOMA_ENG

        # Atualizar
        update_data = {
            'nucleo_id': nucleo_id,
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

# 4. Verificar nucleos criados
print()
print('4. Nucleos MOMA no sistema:')
response = requests.get(
    SUPABASE_URL + '/rest/v1/nucleos?nome=like.*MOMA*',
    headers=headers
)
for n in response.json():
    print(f'   - {n["nome"]} (ID: {n["id"]}, modelo: {n.get("modelo_financeiro")})')

# 5. Verificar lancamentos por nucleo_id
print()
print('5. Lancamentos por nucleo_id:')
response = requests.get(
    SUPABASE_URL + '/rest/v1/financeiro_lancamentos?select=nucleo_id&origem=like.MOMA*',
    headers=headers
)
nucleos_count = {}
for l in response.json():
    nid = l.get('nucleo_id', 'SEM_NUCLEO')
    nucleos_count[nid] = nucleos_count.get(nid, 0) + 1

for nid, count in nucleos_count.items():
    if nid == moma_eng_id:
        print(f'   MOMA Engenharia: {count}')
    elif nid == moma_plan_id:
        print(f'   MOMA Planejados: {count}')
    else:
        print(f'   {nid}: {count}')
