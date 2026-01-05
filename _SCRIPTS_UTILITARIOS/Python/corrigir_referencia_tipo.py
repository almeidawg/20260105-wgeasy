import requests

SUPABASE_URL = 'https://ahlqzzkxuutwoepirpzr.supabase.co'
SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobHF6emt4dXV0d29lcGlycHpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU3MTI0MywiZXhwIjoyMDc2MTQ3MjQzfQ.xWNEmZumCtyRdrIiotUIL41jlI168HyBgM4yHVDXPZo'

headers = {
    'apikey': SERVICE_ROLE_KEY,
    'Authorization': 'Bearer ' + SERVICE_ROLE_KEY,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
}

print('='*60)
print('CORRIGINDO CAMPO referencia_tipo PARA "V" (VIRTUAL)')
print('='*60)
print()

# 1. Verificar valor atual
print('1. Verificando valores atuais de referencia_tipo nos MOMA:')
response = requests.get(
    SUPABASE_URL + '/rest/v1/financeiro_lancamentos?select=referencia_tipo&origem=like.MOMA*',
    headers=headers
)
lancamentos = response.json()
valores = {}
for l in lancamentos:
    v = l.get('referencia_tipo') or 'NULL'
    valores[v] = valores.get(v, 0) + 1
print('   Distribuicao atual:')
for v, count in valores.items():
    print('     %s: %d' % (v, count))

# 2. Atualizar todos para "V"
print()
print('2. Atualizando todos os lancamentos MOMA para referencia_tipo = "V"...')

response = requests.get(
    SUPABASE_URL + '/rest/v1/financeiro_lancamentos?select=id&origem=like.MOMA*',
    headers=headers
)
lancamentos = response.json()
print('   Total: %d' % len(lancamentos))

sucesso = 0
erro = 0

for lanc in lancamentos:
    response = requests.patch(
        SUPABASE_URL + '/rest/v1/financeiro_lancamentos?id=eq.%s' % lanc['id'],
        headers=headers,
        json={'referencia_tipo': 'V'}
    )
    if response.status_code in [200, 201, 204]:
        sucesso += 1
        if sucesso % 50 == 0:
            print('   Atualizados: %d' % sucesso)
    else:
        erro += 1
        if erro == 1:
            print('   ERRO: %s' % response.text[:200])

print()
print('   Sucesso: %d' % sucesso)
print('   Erro: %d' % erro)

# 3. Verificar resultado
print()
print('3. Verificando resultado:')
response = requests.get(
    SUPABASE_URL + '/rest/v1/financeiro_lancamentos?select=referencia_tipo&origem=like.MOMA*',
    headers=headers
)
lancamentos = response.json()
valores = {}
for l in lancamentos:
    v = l.get('referencia_tipo') or 'NULL'
    valores[v] = valores.get(v, 0) + 1
print('   Distribuicao apos atualizacao:')
for v, count in valores.items():
    print('     %s: %d' % (v, count))

print()
print('='*60)
if valores.get('V', 0) == len(lancamentos):
    print('SUCESSO! Todos os lancamentos MOMA agora sao VIRTUAIS (V)')
print('='*60)
