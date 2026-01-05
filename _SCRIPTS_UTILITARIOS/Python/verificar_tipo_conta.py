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
print('VERIFICANDO VALORES PERMITIDOS')
print('='*60)
print()

# 1. Ver todos os tipos de conta existentes
print('1. Tipos de conta em financeiro_contas:')
response = requests.get(
    SUPABASE_URL + '/rest/v1/financeiro_contas?select=tipo',
    headers=headers
)
tipos = set()
for c in response.json():
    tipos.add(c.get('tipo'))
print('   Valores existentes: %s' % tipos)
print()

# 2. Tentar criar com tipo conta_corrente
print('2. Testando criar com tipo "conta_corrente"...')
NUCLEO_MOMA_ENG = '958f5870-4b39-4388-bd1c-44e31e274e84'

conta_test = {
    'nucleo_id': NUCLEO_MOMA_ENG,
    'nucleo': 'engenharia',
    'nome': 'MOMA Engenharia (Virtual)',
    'tipo': 'conta_corrente',
    'saldo_inicial': 0,
    'ativa': True
}

response = requests.post(
    SUPABASE_URL + '/rest/v1/financeiro_contas',
    headers=headers,
    json=conta_test
)

if response.status_code in [200, 201]:
    print('   SUCESSO! ID: %s' % response.json()[0]['id'])
    conta_eng_id = response.json()[0]['id']
else:
    print('   Erro: %s' % response.text[:200])
    conta_eng_id = None

# 3. Buscar se conta foi criada
print()
print('3. Contas com MOMA no nome:')
response = requests.get(
    SUPABASE_URL + '/rest/v1/financeiro_contas?select=id,nome,tipo&nome=like.*MOMA*',
    headers=headers
)
for c in response.json():
    print('   - %s (tipo: %s)' % (c['nome'], c['tipo']))
    if 'Engenharia' in c['nome']:
        conta_eng_id = c['id']

# 4. Se conta existe, atualizar lancamentos
if conta_eng_id:
    print()
    print('4. Atualizando lancamentos MOMA com conta_id...')

    response = requests.get(
        SUPABASE_URL + '/rest/v1/financeiro_lancamentos?select=id&origem=like.MOMA*',
        headers=headers
    )
    lancamentos = response.json()
    print('   Total: %d' % len(lancamentos))

    sucesso = 0
    for lanc in lancamentos:
        response = requests.patch(
            SUPABASE_URL + '/rest/v1/financeiro_lancamentos?id=eq.%s' % lanc['id'],
            headers=headers,
            json={'conta_id': conta_eng_id}
        )
        if response.status_code in [200, 201, 204]:
            sucesso += 1
            if sucesso % 50 == 0:
                print('   Atualizados: %d' % sucesso)

    print('   Total atualizado: %d' % sucesso)

# 5. Verificar
print()
print('5. Verificando resultado:')
response = requests.get(
    SUPABASE_URL + '/rest/v1/financeiro_lancamentos?select=conta_id&origem=like.MOMA*&limit=3',
    headers=headers
)
for l in response.json():
    print('   conta_id: %s' % l.get('conta_id'))
