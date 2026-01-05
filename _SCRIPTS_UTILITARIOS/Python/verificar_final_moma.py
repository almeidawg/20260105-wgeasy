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
print('VERIFICACAO FINAL - LANCAMENTOS MOMA')
print('='*60)
print()

# Buscar lancamentos MOMA com JOIN nos nucleos e contas
print('LANCAMENTOS MOMA COM DETALHES:')
print()

response = requests.get(
    SUPABASE_URL + '/rest/v1/financeiro_lancamentos?select=id,tipo,valor_total,nucleo,nucleo_id,conta_bancaria_id,origem,descricao&origem=like.MOMA*',
    headers=headers
)
lancamentos = response.json()

# Buscar nucleos
response = requests.get(
    SUPABASE_URL + '/rest/v1/nucleos?select=id,nome,modelo_financeiro',
    headers=headers
)
nucleos = {n['id']: n for n in response.json()}

# Buscar contas
response = requests.get(
    SUPABASE_URL + '/rest/v1/contas_bancarias?select=id,nome,conta_real',
    headers=headers
)
contas = {c['id']: c for c in response.json()}

# Analisar
virtual_count = 0
real_count = 0
sem_nucleo = 0

for l in lancamentos:
    nucleo_id = l.get('nucleo_id')
    conta_id = l.get('conta_bancaria_id')

    nucleo_info = nucleos.get(nucleo_id, {})
    conta_info = contas.get(conta_id, {})

    modelo = nucleo_info.get('modelo_financeiro', 'N/A')
    conta_real = conta_info.get('conta_real', True)

    if modelo == 'virtual' and conta_real == False:
        virtual_count += 1
    elif nucleo_id is None:
        sem_nucleo += 1
    else:
        real_count += 1

print('Total de lancamentos MOMA: %d' % len(lancamentos))
print()
print('  [OK] VIRTUAL (nucleo virtual + conta virtual): %d' % virtual_count)
print('  [X]  REAL (nucleo real ou conta real): %d' % real_count)
print('  [?]  SEM NUCLEO: %d' % sem_nucleo)
print()

# Mostrar exemplos
print('EXEMPLO DE LANCAMENTO:')
if lancamentos:
    l = lancamentos[0]
    nucleo_id = l.get('nucleo_id')
    conta_id = l.get('conta_bancaria_id')

    nucleo_info = nucleos.get(nucleo_id, {})
    conta_info = contas.get(conta_id, {})

    print('  ID: %s...' % l["id"][:20])
    print('  Tipo: %s' % l["tipo"])
    print('  Valor: R$ %.2f' % l["valor_total"])
    print('  Origem: %s' % l["origem"])
    print()
    print('  NUCLEO:')
    print('    - nucleo (texto): %s' % l.get("nucleo"))
    print('    - nucleo_id: %s' % nucleo_id)
    print('    - Nome: %s' % nucleo_info.get("nome"))
    print('    - modelo_financeiro: %s' % nucleo_info.get("modelo_financeiro"))
    print()
    print('  CONTA:')
    print('    - conta_bancaria_id: %s' % conta_id)
    print('    - Nome: %s' % conta_info.get("nome"))
    print('    - conta_real: %s' % conta_info.get("conta_real"))

print()
print('='*60)
if virtual_count == len(lancamentos):
    print('STATUS: TODOS OS LANCAMENTOS MOMA SAO VIRTUAIS!')
else:
    print('STATUS: %d lancamentos ainda como REAL' % real_count)
print('='*60)
