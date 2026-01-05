import requests
import json

SUPABASE_URL = 'https://ahlqzzkxuutwoepirpzr.supabase.co'
SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobHF6emt4dXV0d29lcGlycHpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU3MTI0MywiZXhwIjoyMDc2MTQ3MjQzfQ.xWNEmZumCtyRdrIiotUIL41jlI168HyBgM4yHVDXPZo'

headers = {
    'apikey': SERVICE_ROLE_KEY,
    'Authorization': 'Bearer ' + SERVICE_ROLE_KEY,
    'Content-Type': 'application/json',
}

print('='*70)
print('ANALISE DE CONTRATOS E ESTRUTURA DO SISTEMA')
print('='*70)
print()

# 1. Listar contratos
print('1. CONTRATOS NO SISTEMA:')
print('-'*50)
response = requests.get(
    SUPABASE_URL + '/rest/v1/contratos?select=id,numero,titulo,status,unidade_negocio,valor_total,pessoas(nome)&order=created_at.desc&limit=20',
    headers=headers
)
if response.status_code == 200:
    contratos = response.json()
    print('Total (amostra): %d' % len(contratos))
    for c in contratos[:10]:
        cliente = c.get('pessoas', {}).get('nome', 'N/A') if c.get('pessoas') else 'N/A'
        print('  - %s | %s | %s | R$ %.2f' % (
            c.get('numero', 'S/N'),
            c.get('unidade_negocio', 'N/A'),
            cliente[:30],
            float(c.get('valor_total', 0) or 0)
        ))
else:
    print('Erro: %s' % response.text[:200])

# 2. Estrutura das tabelas importantes
print()
print('2. TABELAS DO SISTEMA:')
print('-'*50)
tabelas = [
    'contratos',
    'etapas',
    'tarefas',
    'propostas',
    'briefings',
    'termos_aceite',
    'categorias_financeiras',
    'nucleos',
    'oportunidades',
    'cronogramas',
    'checklist_items'
]

for tabela in tabelas:
    response = requests.get(
        SUPABASE_URL + '/rest/v1/' + tabela + '?limit=1',
        headers=headers
    )
    if response.status_code == 200:
        dados = response.json()
        if dados:
            campos = list(dados[0].keys())
            # Contar total
            response2 = requests.get(
                SUPABASE_URL + '/rest/v1/' + tabela + '?select=id',
                headers=headers
            )
            total = len(response2.json()) if response2.status_code == 200 else '?'
            print('  [OK] %s (%s registros)' % (tabela, total))
        else:
            print('  [OK] %s (vazio)' % tabela)
    else:
        print('  [--] %s (nao existe)' % tabela)

# 3. Etapas do sistema
print()
print('3. ETAPAS CADASTRADAS:')
print('-'*50)
response = requests.get(
    SUPABASE_URL + '/rest/v1/etapas?select=id,nome,ordem,nucleo&order=ordem',
    headers=headers
)
if response.status_code == 200:
    etapas = response.json()
    for e in etapas:
        print('  %02d. %s (%s)' % (e.get('ordem', 0), e.get('nome', 'N/A'), e.get('nucleo', 'N/A')))
else:
    print('  Erro ou tabela nao existe')

# 4. Categorias financeiras
print()
print('4. CATEGORIAS FINANCEIRAS:')
print('-'*50)
response = requests.get(
    SUPABASE_URL + '/rest/v1/categorias_financeiras?select=id,name,type&order=name',
    headers=headers
)
if response.status_code == 200:
    cats = response.json()
    print('  Total: %d' % len(cats))
    entradas = [c for c in cats if c.get('type') == 'entrada']
    saidas = [c for c in cats if c.get('type') == 'saida']
    print('  Entradas: %d | Saidas: %d' % (len(entradas), len(saidas)))
else:
    print('  Erro')

# 5. Nucleos
print()
print('5. NUCLEOS DO SISTEMA:')
print('-'*50)
response = requests.get(
    SUPABASE_URL + '/rest/v1/nucleos?select=nome,cor,modelo_financeiro&order=ordem_exibicao',
    headers=headers
)
if response.status_code == 200:
    for n in response.json():
        print('  - %s (%s) %s' % (n.get('nome'), n.get('modelo_financeiro', 'real'), n.get('cor', '')))
