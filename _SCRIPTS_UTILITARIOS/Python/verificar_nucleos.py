import requests
import json

SUPABASE_URL = 'https://ahlqzzkxuutwoepirpzr.supabase.co'
SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobHF6emt4dXV0d29lcGlycHpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU3MTI0MywiZXhwIjoyMDc2MTQ3MjQzfQ.xWNEmZumCtyRdrIiotUIL41jlI168HyBgM4yHVDXPZo'

headers = {
    'apikey': SERVICE_ROLE_KEY,
    'Authorization': 'Bearer ' + SERVICE_ROLE_KEY,
    'Content-Type': 'application/json',
}

# Verificar se existe tabela nucleos
print('1. VERIFICANDO TABELA NUCLEOS:')
response = requests.get(
    SUPABASE_URL + '/rest/v1/nucleos?select=*',
    headers=headers
)
print(f'   Status: {response.status_code}')
if response.status_code == 200:
    nucleos = response.json()
    print(f'   Nucleos encontrados: {len(nucleos)}')
    for n in nucleos:
        print(f'   - {n}')
else:
    print('   Tabela nucleos nao existe ou erro')

# Verificar valores unicos de unidade_negocio existentes
print()
print('2. VALORES EXISTENTES DE UNIDADE_NEGOCIO:')
response = requests.get(
    SUPABASE_URL + '/rest/v1/financeiro_lancamentos?select=unidade_negocio&limit=1000',
    headers=headers
)
lancamentos = response.json()
unidades = set()
for l in lancamentos:
    un = l.get('unidade_negocio')
    if un:
        unidades.add(un)
print(f'   Valores unicos: {unidades if unidades else "Nenhum preenchido"}')

# Verificar se existe tabela unidades_negocio
print()
print('3. VERIFICANDO TABELA UNIDADES_NEGOCIO:')
response = requests.get(
    SUPABASE_URL + '/rest/v1/unidades_negocio?select=*',
    headers=headers
)
print(f'   Status: {response.status_code}')
if response.status_code == 200:
    unidades = response.json()
    print(f'   Unidades encontradas: {len(unidades)}')
    for u in unidades:
        print(f'   - {u}')

# Tentar atualizar apenas com valor simples
print()
print('4. TESTANDO ATUALIZACAO COM VALORES SIMPLES:')

# Pegar um lancamento MOMA para teste
response = requests.get(
    SUPABASE_URL + '/rest/v1/financeiro_lancamentos?select=id&origem=eq.MOMA_SDP&limit=1',
    headers=headers
)
if response.json():
    test_id = response.json()[0]['id']

    # Tentar com "moma"
    print(f'   Testando update em {test_id}...')

    # Testar com observacoes
    response = requests.patch(
        SUPABASE_URL + f'/rest/v1/financeiro_lancamentos?id=eq.{test_id}',
        headers={**headers, 'Prefer': 'return=representation'},
        json={'observacoes': 'NUCLEO_VIRTUAL: MOMA_ENGENHARIA | Contrato vinculado'}
    )
    print(f'   Teste observacoes: {response.status_code}')

    # Testar com referencia_tipo
    response = requests.patch(
        SUPABASE_URL + f'/rest/v1/financeiro_lancamentos?id=eq.{test_id}',
        headers={**headers, 'Prefer': 'return=representation'},
        json={'referencia_tipo': 'MOMA_ENGENHARIA'}
    )
    print(f'   Teste referencia_tipo: {response.status_code}')
    if response.status_code not in [200, 201, 204]:
        print(f'   Erro: {response.text[:100]}')

# Verificar contas bancarias e campo virtual
print()
print('5. CONTAS BANCARIAS - ESTRUTURA:')
response = requests.get(
    SUPABASE_URL + '/rest/v1/contas_bancarias?select=*&limit=5',
    headers=headers
)
if response.json():
    print(f'   Campos: {list(response.json()[0].keys())}')
    print()
    print('   Contas virtuais (conta_real=false):')
    response = requests.get(
        SUPABASE_URL + '/rest/v1/contas_bancarias?select=id,nome,nucleo,conta_real&conta_real=eq.false',
        headers=headers
    )
    for c in response.json():
        print(f'   - {c["nome"]} (nucleo: {c["nucleo"]}, real: {c["conta_real"]})')
