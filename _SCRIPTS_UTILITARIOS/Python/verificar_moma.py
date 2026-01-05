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
print('VERIFICACAO MOMA - CONTAS E LANCAMENTOS')
print('='*60)
print()

# 1. Verificar contas virtuais MOMA
print('1. CONTAS VIRTUAIS MOMA:')
response = requests.get(
    SUPABASE_URL + '/rest/v1/contas_bancarias?select=*&nome=ilike.*MOMA*',
    headers=headers
)
contas_moma = response.json()
print(f'   Contas encontradas: {len(contas_moma)}')
for c in contas_moma:
    print(f'   - ID: {c["id"]}')
    print(f'     Nome: {c["nome"]}')
    print(f'     Nucleo: {c.get("nucleo")}')
    print(f'     Conta Real: {c.get("conta_real")}')
    print()

# 2. Verificar lancamentos MOMA
print('2. LANCAMENTOS MOMA:')
response = requests.get(
    SUPABASE_URL + '/rest/v1/financeiro_lancamentos?select=id,tipo,nucleo,descricao,valor_total,origem,conta_bancaria_id&origem=like.MOMA*&limit=500',
    headers=headers
)
lancamentos_moma = response.json()
print(f'   Total lancamentos MOMA: {len(lancamentos_moma)}')

# Agrupar por origem
origens = {}
for l in lancamentos_moma:
    origem = l.get('origem', 'SEM_ORIGEM')
    if origem not in origens:
        origens[origem] = {'count': 0, 'valor': 0, 'com_conta': 0}
    origens[origem]['count'] += 1
    origens[origem]['valor'] += float(l.get('valor_total', 0) or 0)
    if l.get('conta_bancaria_id'):
        origens[origem]['com_conta'] += 1

print()
for origem, dados in origens.items():
    print(f'   {origem}:')
    print(f'     Quantidade: {dados["count"]}')
    print(f'     Valor Total: R$ {dados["valor"]:,.2f}')
    print(f'     Com conta vinculada: {dados["com_conta"]}')
    print()

# 3. Verificar nucleos usados
print('3. NUCLEOS NOS LANCAMENTOS MOMA:')
nucleos = {}
for l in lancamentos_moma:
    nucleo = l.get('nucleo', 'SEM_NUCLEO')
    if nucleo not in nucleos:
        nucleos[nucleo] = 0
    nucleos[nucleo] += 1

for nucleo, count in nucleos.items():
    print(f'   {nucleo}: {count} lancamentos')

# 4. Verificar estrutura da tabela
print()
print('4. VERIFICANDO ESTRUTURA DA TABELA LANCAMENTOS:')
response = requests.get(
    SUPABASE_URL + '/rest/v1/financeiro_lancamentos?select=*&limit=1',
    headers=headers
)
if response.json():
    campos = list(response.json()[0].keys())
    print(f'   Campos disponíveis: {campos}')

# 5. Verificar constraint do nucleo
print()
print('5. VERIFICANDO SE EXISTE CAMPO PARA NOME VIRTUAL DO NUCLEO:')
# Checar se existe algum campo adicional
response = requests.get(
    SUPABASE_URL + '/rest/v1/financeiro_lancamentos?select=*&origem=eq.MOMA_SDP&limit=3',
    headers=headers
)
exemplos = response.json()
if exemplos:
    print('   Exemplo de lancamento MOMA:')
    print(json.dumps(exemplos[0], indent=2, default=str))
