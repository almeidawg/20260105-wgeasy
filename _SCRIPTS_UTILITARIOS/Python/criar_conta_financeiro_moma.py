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
print('CRIANDO CONTAS MOMA EM financeiro_contas')
print('='*60)
print()

# IDs dos nucleos MOMA
NUCLEO_MOMA_ENG = '958f5870-4b39-4388-bd1c-44e31e274e84'
NUCLEO_MOMA_PLAN = '7136283c-91ad-4567-9188-8b96d975366a'

# 1. Verificar estrutura de financeiro_contas
print('1. Estrutura de financeiro_contas:')
response = requests.get(
    SUPABASE_URL + '/rest/v1/financeiro_contas?select=*&limit=1',
    headers=headers
)
if response.json():
    campos = list(response.json()[0].keys())
    print('   Campos: %s' % campos)
print()

# 2. Criar conta MOMA Engenharia em financeiro_contas
print('2. Criando conta MOMA Engenharia...')
conta_moma_eng = {
    'nucleo_id': NUCLEO_MOMA_ENG,
    'nucleo': 'engenharia',  # valor do constraint
    'nome': 'MOMA Engenharia (Virtual)',
    'tipo': 'virtual',
    'saldo_inicial': 0,
    'ativa': True
}

response = requests.post(
    SUPABASE_URL + '/rest/v1/financeiro_contas',
    headers=headers,
    json=conta_moma_eng
)

if response.status_code in [200, 201]:
    conta_eng_id = response.json()[0]['id']
    print('   Criada! ID: %s' % conta_eng_id)
else:
    print('   Status: %s' % response.status_code)
    print('   Erro: %s' % response.text[:300])
    # Tentar buscar se ja existe
    response = requests.get(
        SUPABASE_URL + '/rest/v1/financeiro_contas?nome=like.*MOMA*Engenharia*',
        headers=headers
    )
    if response.json():
        conta_eng_id = response.json()[0]['id']
        print('   Ja existe! ID: %s' % conta_eng_id)
    else:
        conta_eng_id = None

# 3. Criar conta MOMA Planejados em financeiro_contas
print()
print('3. Criando conta MOMA Planejados...')
conta_moma_plan = {
    'nucleo_id': NUCLEO_MOMA_PLAN,
    'nucleo': 'arquitetura',  # valor do constraint
    'nome': 'MOMA Planejados (Virtual)',
    'tipo': 'virtual',
    'saldo_inicial': 0,
    'ativa': True
}

response = requests.post(
    SUPABASE_URL + '/rest/v1/financeiro_contas',
    headers=headers,
    json=conta_moma_plan
)

if response.status_code in [200, 201]:
    conta_plan_id = response.json()[0]['id']
    print('   Criada! ID: %s' % conta_plan_id)
else:
    print('   Status: %s' % response.status_code)
    print('   Erro: %s' % response.text[:300])
    # Tentar buscar se ja existe
    response = requests.get(
        SUPABASE_URL + '/rest/v1/financeiro_contas?nome=like.*MOMA*Planejados*',
        headers=headers
    )
    if response.json():
        conta_plan_id = response.json()[0]['id']
        print('   Ja existe! ID: %s' % conta_plan_id)
    else:
        conta_plan_id = None

# 4. Verificar contas criadas
print()
print('4. Contas em financeiro_contas:')
response = requests.get(
    SUPABASE_URL + '/rest/v1/financeiro_contas?select=id,nome,tipo,nucleo_id',
    headers=headers
)
for c in response.json():
    virtual = '(VIRTUAL)' if c.get('tipo') == 'virtual' else ''
    print('   - %s %s' % (c['nome'], virtual))

# 5. Atualizar lancamentos MOMA com conta_id
if conta_eng_id:
    print()
    print('5. Atualizando lancamentos MOMA com conta_id...')

    response = requests.get(
        SUPABASE_URL + '/rest/v1/financeiro_lancamentos?select=id,descricao&origem=like.MOMA*',
        headers=headers
    )
    lancamentos = response.json()
    print('   Total: %d' % len(lancamentos))

    sucesso = 0
    erro = 0

    for lanc in lancamentos:
        lanc_id = lanc['id']
        descricao = lanc.get('descricao', '').lower()

        # Determinar conta
        if 'planejado' in descricao or 'marcenaria' in descricao:
            conta_id = conta_plan_id
        else:
            conta_id = conta_eng_id

        # Atualizar conta_id
        response = requests.patch(
            SUPABASE_URL + '/rest/v1/financeiro_lancamentos?id=eq.%s' % lanc_id,
            headers=headers,
            json={'conta_id': conta_id}
        )

        if response.status_code in [200, 201, 204]:
            sucesso += 1
            if sucesso % 50 == 0:
                print('   Atualizados: %d' % sucesso)
        else:
            erro += 1
            if erro == 1:
                print('   Erro: %s' % response.text[:150])

    print()
    print('   Sucesso: %d' % sucesso)
    print('   Erro: %d' % erro)

# 6. Verificar resultado
print()
print('6. Verificando lancamentos MOMA:')
response = requests.get(
    SUPABASE_URL + '/rest/v1/financeiro_lancamentos?select=id,conta_id,nucleo_id&origem=like.MOMA*&limit=3',
    headers=headers
)
for l in response.json():
    print('   conta_id: %s | nucleo_id: %s' % (l.get('conta_id'), l.get('nucleo_id')[:8] if l.get('nucleo_id') else None))
