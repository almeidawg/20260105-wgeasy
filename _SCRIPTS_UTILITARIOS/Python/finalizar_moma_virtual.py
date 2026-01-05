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
print('FINALIZANDO CONFIGURACAO MOMA VIRTUAL')
print('='*60)
print()

NUCLEO_MOMA_ENG = '958f5870-4b39-4388-bd1c-44e31e274e84'
NUCLEO_MOMA_PLAN = '7136283c-91ad-4567-9188-8b96d975366a'

# 1. Buscar conta MOMA Engenharia
print('1. Conta MOMA Engenharia em financeiro_contas:')
response = requests.get(
    SUPABASE_URL + '/rest/v1/financeiro_contas?select=*&nome=like.*MOMA*Engenharia*',
    headers=headers
)
if response.json():
    conta_eng = response.json()[0]
    CONTA_ENG_ID = conta_eng['id']
    print('   ID: %s' % CONTA_ENG_ID)
    print('   Nome: %s' % conta_eng['nome'])
    print('   nucleo_id: %s' % conta_eng['nucleo_id'])
else:
    CONTA_ENG_ID = None
    print('   NAO ENCONTRADA')

# 2. Criar conta MOMA Planejados
print()
print('2. Criando conta MOMA Planejados...')
conta_plan = {
    'nucleo_id': NUCLEO_MOMA_PLAN,
    'nucleo': 'arquitetura',
    'nome': 'MOMA Planejados (Virtual)',
    'tipo': 'conta_corrente',
    'saldo_inicial': 0,
    'ativa': True
}

response = requests.post(
    SUPABASE_URL + '/rest/v1/financeiro_contas',
    headers=headers,
    json=conta_plan
)

if response.status_code in [200, 201]:
    CONTA_PLAN_ID = response.json()[0]['id']
    print('   Criada! ID: %s' % CONTA_PLAN_ID)
else:
    # Buscar se ja existe
    response = requests.get(
        SUPABASE_URL + '/rest/v1/financeiro_contas?select=id&nome=like.*MOMA*Planejados*',
        headers=headers
    )
    if response.json():
        CONTA_PLAN_ID = response.json()[0]['id']
        print('   Ja existe! ID: %s' % CONTA_PLAN_ID)
    else:
        CONTA_PLAN_ID = None
        print('   Erro: %s' % response.text[:100])

# 3. Atualizar nucleos MOMA para apontar para as contas
print()
print('3. Atualizando nucleos MOMA com conta_entrada_id e conta_saida_id...')

if CONTA_ENG_ID:
    response = requests.patch(
        SUPABASE_URL + '/rest/v1/nucleos?id=eq.%s' % NUCLEO_MOMA_ENG,
        headers=headers,
        json={
            'conta_entrada_id': CONTA_ENG_ID,
            'conta_saida_id': CONTA_ENG_ID
        }
    )
    print('   MOMA Engenharia: %s' % ('OK' if response.status_code in [200, 201, 204] else response.text[:100]))

if CONTA_PLAN_ID:
    response = requests.patch(
        SUPABASE_URL + '/rest/v1/nucleos?id=eq.%s' % NUCLEO_MOMA_PLAN,
        headers=headers,
        json={
            'conta_entrada_id': CONTA_PLAN_ID,
            'conta_saida_id': CONTA_PLAN_ID
        }
    )
    print('   MOMA Planejados: %s' % ('OK' if response.status_code in [200, 201, 204] else response.text[:100]))

# 4. Verificar nucleos atualizados
print()
print('4. Nucleos MOMA atualizados:')
response = requests.get(
    SUPABASE_URL + '/rest/v1/nucleos?select=nome,modelo_financeiro,conta_entrada_id,conta_saida_id&nome=like.*MOMA*',
    headers=headers
)
for n in response.json():
    print('   %s:' % n['nome'])
    print('     modelo_financeiro: %s' % n.get('modelo_financeiro'))
    print('     conta_entrada_id: %s' % n.get('conta_entrada_id'))
    print('     conta_saida_id: %s' % n.get('conta_saida_id'))

# 5. Verificar contas em financeiro_contas
print()
print('5. Contas MOMA em financeiro_contas:')
response = requests.get(
    SUPABASE_URL + '/rest/v1/financeiro_contas?select=id,nome,nucleo_id&nome=like.*MOMA*',
    headers=headers
)
for c in response.json():
    print('   - %s (nucleo_id: %s)' % (c['nome'], c['nucleo_id'][:8] if c['nucleo_id'] else None))

# 6. Resumo final lancamentos
print()
print('6. RESUMO LANCAMENTOS MOMA:')
response = requests.get(
    SUPABASE_URL + '/rest/v1/financeiro_lancamentos?select=conta_id,nucleo_id,valor_total,tipo&origem=like.MOMA*',
    headers=headers
)
lancamentos = response.json()

total_entrada = sum(l['valor_total'] for l in lancamentos if l['tipo'] == 'entrada')
total_saida = sum(l['valor_total'] for l in lancamentos if l['tipo'] == 'saida')

print('   Total lancamentos: %d' % len(lancamentos))
print('   Com conta_id: %d' % len([l for l in lancamentos if l.get('conta_id')]))
print('   Com nucleo_id: %d' % len([l for l in lancamentos if l.get('nucleo_id')]))
print()
print('   Entradas: R$ %.2f' % total_entrada)
print('   Saidas: R$ %.2f' % total_saida)

print()
print('='*60)
print('CONFIGURACAO MOMA VIRTUAL COMPLETA!')
print('='*60)
