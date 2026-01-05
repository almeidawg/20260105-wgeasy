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
print('DIAGNOSTICO E CORRECAO MOMA')
print('='*60)
print()

# 1. Verificar estado atual dos lancamentos MOMA
print('1. ESTADO ATUAL DOS LANCAMENTOS MOMA:')
response = requests.get(
    SUPABASE_URL + '/rest/v1/financeiro_lancamentos?select=id,nucleo,nucleo_id,conta_bancaria_id&origem=like.MOMA*&limit=5',
    headers=headers
)
exemplos = response.json()
print('   Exemplo de lancamento:')
for e in exemplos[:2]:
    print(f'   - nucleo (texto): {e.get("nucleo")}')
    print(f'   - nucleo_id (UUID): {e.get("nucleo_id")}')
    print(f'   - conta_bancaria_id: {e.get("conta_bancaria_id")}')
    print()

# 2. Verificar nucleos virtuais
print('2. NUCLEOS MOMA:')
response = requests.get(
    SUPABASE_URL + '/rest/v1/nucleos?select=id,nome,modelo_financeiro&nome=like.*MOMA*',
    headers=headers
)
nucleos_moma = response.json()
for n in nucleos_moma:
    print(f'   - {n["nome"]}: modelo={n.get("modelo_financeiro")} | ID={n["id"]}')

MOMA_ENG_ID = None
MOMA_PLAN_ID = None
for n in nucleos_moma:
    if 'Engenharia' in n['nome']:
        MOMA_ENG_ID = n['id']
    if 'Planejados' in n['nome']:
        MOMA_PLAN_ID = n['id']

# 3. Verificar contas virtuais
print()
print('3. CONTAS VIRTUAIS:')
response = requests.get(
    SUPABASE_URL + '/rest/v1/contas_bancarias?select=id,nome,conta_real&conta_real=eq.false',
    headers=headers
)
contas_virtuais = response.json()
for c in contas_virtuais:
    print(f'   - {c["nome"]}: conta_real={c["conta_real"]} | ID={c["id"]}')

CONTA_MOMA_ENG = 'b93f93cd-9a04-49b7-8ac8-b97dd4ea6437'
CONTA_MOMA_PLAN = '66728ca8-35a0-40a4-adfd-7780769d9458'

# 4. Corrigir: Limpar campo nucleo (texto) e garantir nucleo_id
print()
print('4. CORRIGINDO LANCAMENTOS MOMA...')
print('   Limpando campo "nucleo" e mantendo apenas "nucleo_id"')

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
        nucleo_id = MOMA_PLAN_ID
        conta_id = CONTA_MOMA_PLAN
    else:
        nucleo_id = MOMA_ENG_ID
        conta_id = CONTA_MOMA_ENG

    # Atualizar - limpar nucleo texto e definir nucleo_id
    update_data = {
        'nucleo': None,  # Limpar o campo texto
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
            print(f'   Corrigidos: {sucesso}')
    else:
        erro += 1
        if erro <= 3:
            print(f'   Erro: {response.text[:150]}')

print()
print(f'   Sucesso: {sucesso}')
print(f'   Erro: {erro}')

# 5. Verificar resultado
print()
print('5. VERIFICANDO RESULTADO:')
response = requests.get(
    SUPABASE_URL + '/rest/v1/financeiro_lancamentos?select=id,nucleo,nucleo_id,conta_bancaria_id&origem=like.MOMA*&limit=3',
    headers=headers
)
for e in response.json():
    print(f'   - nucleo: {e.get("nucleo")} | nucleo_id: {e.get("nucleo_id")[:8] if e.get("nucleo_id") else None}...')

# 6. Contar por nucleo_id
print()
print('6. RESUMO POR NUCLEO:')
response = requests.get(
    SUPABASE_URL + '/rest/v1/financeiro_lancamentos?select=nucleo_id&origem=like.MOMA*',
    headers=headers
)
contagem = {}
for l in response.json():
    nid = l.get('nucleo_id')
    contagem[nid] = contagem.get(nid, 0) + 1

for nid, count in contagem.items():
    if nid == MOMA_ENG_ID:
        print(f'   MOMA Engenharia (virtual): {count}')
    elif nid == MOMA_PLAN_ID:
        print(f'   MOMA Planejados (virtual): {count}')
    else:
        print(f'   {nid}: {count}')
