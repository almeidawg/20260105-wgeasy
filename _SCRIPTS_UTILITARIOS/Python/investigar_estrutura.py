import requests
import json

SUPABASE_URL = 'https://ahlqzzkxuutwoepirpzr.supabase.co'
SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobHF6emt4dXV0d29lcGlycHpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU3MTI0MywiZXhwIjoyMDc2MTQ3MjQzfQ.xWNEmZumCtyRdrIiotUIL41jlI168HyBgM4yHVDXPZo'

headers = {
    'apikey': SERVICE_ROLE_KEY,
    'Authorization': 'Bearer ' + SERVICE_ROLE_KEY,
    'Content-Type': 'application/json',
}

print('='*60)
print('INVESTIGACAO COMPLETA - ESTRUTURA DO BANCO')
print('='*60)
print()

# 1. Ver TODOS os campos de um lancamento MOMA
print('1. TODOS OS CAMPOS DE UM LANCAMENTO MOMA:')
response = requests.get(
    SUPABASE_URL + '/rest/v1/financeiro_lancamentos?select=*&origem=eq.MOMA_SDP&limit=1',
    headers=headers
)
if response.json():
    lanc = response.json()[0]
    for k, v in sorted(lanc.items()):
        if v is not None:
            print('   %s: %s' % (k, v))
print()

# 2. Verificar se existe VIEW que pode estar sendo usada
print('2. VERIFICANDO VIEWS:')
# Tentar acessar possiveis views
views = ['vw_lancamentos', 'v_lancamentos', 'lancamentos_view', 'financeiro_lancamentos_view']
for v in views:
    response = requests.get(
        SUPABASE_URL + '/rest/v1/' + v + '?limit=1',
        headers=headers
    )
    if response.status_code == 200:
        print('   VIEW ENCONTRADA: %s' % v)
print()

# 3. Verificar tabela financeiro_contas (diferente de contas_bancarias)
print('3. TABELA financeiro_contas:')
response = requests.get(
    SUPABASE_URL + '/rest/v1/financeiro_contas?select=*&limit=10',
    headers=headers
)
if response.status_code == 200:
    contas = response.json()
    print('   Total: %d' % len(contas))
    for c in contas[:5]:
        print('   - %s' % c)
else:
    print('   Erro ou nao existe: %s' % response.status_code)
print()

# 4. Verificar campo conta_id vs conta_bancaria_id
print('4. CAMPOS DE CONTA NO LANCAMENTO:')
response = requests.get(
    SUPABASE_URL + '/rest/v1/financeiro_lancamentos?select=id,conta_id,conta_bancaria_id&origem=like.MOMA*&limit=5',
    headers=headers
)
for l in response.json():
    print('   conta_id: %s | conta_bancaria_id: %s' % (l.get('conta_id'), l.get('conta_bancaria_id')))
print()

# 5. Verificar se existe campo "is_virtual" ou similar
print('5. CAMPOS QUE PODEM INDICAR VIRTUAL:')
response = requests.get(
    SUPABASE_URL + '/rest/v1/financeiro_lancamentos?select=*&origem=eq.MOMA_SDP&limit=1',
    headers=headers
)
if response.json():
    lanc = response.json()[0]
    campos_virtual = [k for k in lanc.keys() if 'virtual' in k.lower() or 'real' in k.lower() or 'tipo_conta' in k.lower()]
    print('   Campos encontrados: %s' % campos_virtual)
    for c in campos_virtual:
        print('   - %s: %s' % (c, lanc.get(c)))
print()

# 6. Verificar estrutura do nucleo
print('6. ESTRUTURA COMPLETA DO NUCLEO MOMA:')
response = requests.get(
    SUPABASE_URL + '/rest/v1/nucleos?select=*&nome=eq.MOMA%20Engenharia',
    headers=headers
)
if response.json():
    nucleo = response.json()[0]
    for k, v in sorted(nucleo.items()):
        print('   %s: %s' % (k, v))
print()

# 7. Verificar estrutura da conta bancaria virtual
print('7. ESTRUTURA COMPLETA DA CONTA VIRTUAL MOMA:')
response = requests.get(
    SUPABASE_URL + '/rest/v1/contas_bancarias?select=*&id=eq.b93f93cd-9a04-49b7-8ac8-b97dd4ea6437',
    headers=headers
)
if response.json():
    conta = response.json()[0]
    for k, v in sorted(conta.items()):
        print('   %s: %s' % (k, v))
print()

# 8. Verificar se o nucleo tem algum campo que indica se eh real
print('8. NUCLEOS - TODOS COM modelo_financeiro:')
response = requests.get(
    SUPABASE_URL + '/rest/v1/nucleos?select=nome,modelo_financeiro',
    headers=headers
)
for n in response.json():
    print('   %s: %s' % (n['nome'], n.get('modelo_financeiro')))
