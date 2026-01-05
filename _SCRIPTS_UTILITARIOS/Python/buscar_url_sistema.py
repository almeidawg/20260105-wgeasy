import requests
import json

SUPABASE_URL = 'https://ahlqzzkxuutwoepirpzr.supabase.co'
SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobHF6emt4dXV0d29lcGlycHpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU3MTI0MywiZXhwIjoyMDc2MTQ3MjQzfQ.xWNEmZumCtyRdrIiotUIL41jlI168HyBgM4yHVDXPZo'

headers = {
    'apikey': SERVICE_ROLE_KEY,
    'Authorization': 'Bearer ' + SERVICE_ROLE_KEY,
    'Content-Type': 'application/json',
}

print('INVESTIGACAO PROFUNDA - CAMPOS QUE DEFINEM REAL/VIRTUAL')
print('='*60)
print()

# 1. Verificar TODAS as tabelas relacionadas
print('1. Verificando tabelas do sistema...')

tabelas = [
    'financeiro_lancamentos',
    'financeiro_contas',
    'contas_bancarias',
    'nucleos',
    'configuracoes',
    'parametros'
]

for t in tabelas:
    response = requests.get(
        SUPABASE_URL + '/rest/v1/' + t + '?limit=1',
        headers=headers
    )
    if response.status_code == 200:
        print('   [OK] %s' % t)
        if response.json():
            campos = list(response.json()[0].keys())
            # Procurar campos relacionados a real/virtual
            campos_relevantes = [c for c in campos if 'real' in c.lower() or 'virtual' in c.lower() or 'tipo' in c.lower() or 'modelo' in c.lower()]
            if campos_relevantes:
                print('       Campos relevantes: %s' % campos_relevantes)
    else:
        print('   [--] %s (nao existe)' % t)

# 2. Verificar como um lancamento MOMA se parece com JOIN
print()
print('2. Lancamento MOMA com dados do nucleo:')
response = requests.get(
    SUPABASE_URL + '/rest/v1/financeiro_lancamentos?select=id,descricao,nucleo,nucleo_id,conta_id,conta_bancaria_id,origem&origem=eq.MOMA_SDP&limit=1',
    headers=headers
)
if response.json():
    lanc = response.json()[0]
    print('   Lancamento:')
    for k, v in lanc.items():
        print('     %s: %s' % (k, v))

    # Buscar nucleo relacionado
    if lanc.get('nucleo_id'):
        response = requests.get(
            SUPABASE_URL + '/rest/v1/nucleos?select=nome,modelo_financeiro&id=eq.' + lanc['nucleo_id'],
            headers=headers
        )
        if response.json():
            print('   Nucleo vinculado:')
            for k, v in response.json()[0].items():
                print('     %s: %s' % (k, v))

    # Buscar conta_id relacionada (financeiro_contas)
    if lanc.get('conta_id'):
        response = requests.get(
            SUPABASE_URL + '/rest/v1/financeiro_contas?select=nome,tipo&id=eq.' + lanc['conta_id'],
            headers=headers
        )
        if response.json():
            print('   Conta (financeiro_contas):')
            for k, v in response.json()[0].items():
                print('     %s: %s' % (k, v))

    # Buscar conta_bancaria_id relacionada
    if lanc.get('conta_bancaria_id'):
        response = requests.get(
            SUPABASE_URL + '/rest/v1/contas_bancarias?select=nome,conta_real&id=eq.' + lanc['conta_bancaria_id'],
            headers=headers
        )
        if response.json():
            print('   Conta Bancaria (contas_bancarias):')
            for k, v in response.json()[0].items():
                print('     %s: %s' % (k, v))

# 3. Verificar se existe alguma view ou RPC
print()
print('3. Verificando views/RPCs possiveis...')
views = ['vw_lancamentos', 'vw_financeiro', 'lancamentos_completos', 'financeiro_view']
for v in views:
    response = requests.get(
        SUPABASE_URL + '/rest/v1/' + v + '?limit=1',
        headers=headers
    )
    if response.status_code == 200:
        print('   [ENCONTRADA] %s' % v)
        if response.json():
            print('   Campos: %s' % list(response.json()[0].keys()))

# 4. Listar projetos/apps relacionados
print()
print('4. Buscando URL do frontend...')
# Verificar se existe tabela de configuracao
response = requests.get(
    SUPABASE_URL + '/rest/v1/configuracoes?limit=10',
    headers=headers
)
if response.status_code == 200 and response.json():
    print('   Configuracoes encontradas:')
    for c in response.json():
        print('   - %s' % c)
