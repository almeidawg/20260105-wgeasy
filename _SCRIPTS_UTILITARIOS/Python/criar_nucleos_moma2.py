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

# 1. Criar nucleo MOMA Engenharia (sem referencias de conta)
print('1. Criando nucleo MOMA Engenharia...')
nucleo_moma_eng = {
    'nome': 'MOMA Engenharia',
    'descricao': 'Nucleo virtual para operacoes MOMA - Arquitetura e Engenharia',
    'cor': '#4A90D9',
    'ativo': True,
    'modelo_financeiro': 'virtual',
    'ordem_exibicao': 10
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
    print(f'   Status: {response.status_code}')
    print(f'   Resposta: {response.text[:300]}')
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
    'ordem_exibicao': 11
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
    print(f'   Status: {response.status_code}')
    print(f'   Resposta: {response.text[:300]}')
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

# 3. Verificar nucleos
print()
print('3. Todos os nucleos no sistema:')
response = requests.get(
    SUPABASE_URL + '/rest/v1/nucleos?select=id,nome,modelo_financeiro&order=ordem_exibicao',
    headers=headers
)
for n in response.json():
    virtual = '(VIRTUAL)' if n.get('modelo_financeiro') == 'virtual' else ''
    print(f'   - {n["nome"]} {virtual}')

# Se nucleos foram criados, atualizar lancamentos
if moma_eng_id and moma_plan_id:
    print()
    print('4. Atualizando lancamentos MOMA...')

    # Buscar lancamentos MOMA
    response = requests.get(
        SUPABASE_URL + '/rest/v1/financeiro_lancamentos?select=id,descricao&origem=like.MOMA*',
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

    # 5. Resumo final
    print()
    print('5. RESUMO LANCAMENTOS MOMA:')
    response = requests.get(
        SUPABASE_URL + '/rest/v1/financeiro_lancamentos?select=nucleo_id,valor_total,tipo&origem=like.MOMA*',
        headers=headers
    )
    lancamentos = response.json()

    por_nucleo = {}
    for l in lancamentos:
        nid = l.get('nucleo_id')
        if nid not in por_nucleo:
            por_nucleo[nid] = {'entrada': 0, 'saida': 0, 'count': 0}
        por_nucleo[nid]['count'] += 1
        if l.get('tipo') == 'entrada':
            por_nucleo[nid]['entrada'] += float(l.get('valor_total', 0) or 0)
        else:
            por_nucleo[nid]['saida'] += float(l.get('valor_total', 0) or 0)

    for nid, dados in por_nucleo.items():
        if nid == moma_eng_id:
            nome = 'MOMA Engenharia'
        elif nid == moma_plan_id:
            nome = 'MOMA Planejados'
        else:
            nome = str(nid)
        print(f'   {nome}:')
        print(f'     Lancamentos: {dados["count"]}')
        print(f'     Entradas: R$ {dados["entrada"]:,.2f}')
        print(f'     Saidas: R$ {dados["saida"]:,.2f}')
