import requests
import openpyxl
from datetime import datetime
import re

SUPABASE_URL = 'https://ahlqzzkxuutwoepirpzr.supabase.co'
SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobHF6emt4dXV0d29lcGlycHpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU3MTI0MywiZXhwIjoyMDc2MTQ3MjQzfQ.xWNEmZumCtyRdrIiotUIL41jlI168HyBgM4yHVDXPZo'

headers = {
    'apikey': SERVICE_ROLE_KEY,
    'Authorization': 'Bearer ' + SERVICE_ROLE_KEY,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
}

print('='*60)
print('AUDITORIA E IMPORTACAO - CENTRO DE CUSTOS 2020')
print('='*60)
print()

# 1. Carregar dados existentes do sistema
print('1. Carregando dados existentes do sistema...')
response = requests.get(
    SUPABASE_URL + '/rest/v1/financeiro_lancamentos?select=data_competencia,valor_total,descricao&limit=10000',
    headers=headers
)
lancamentos_sistema = response.json()
print(f'   Lancamentos no sistema: {len(lancamentos_sistema)}')

# Criar set de chaves para comparacao rapida
chaves_existentes = set()
for l in lancamentos_sistema:
    data = l.get('data_competencia', '')
    valor = round(float(l.get('valor_total', 0) or 0), 2)
    chave = f"{data}_{valor}"
    chaves_existentes.add(chave)

# 2. Carregar pessoas existentes
response = requests.get(
    SUPABASE_URL + '/rest/v1/pessoas?select=nome&limit=1000',
    headers=headers
)
pessoas_sistema = response.json()
nomes_existentes = set([p['nome'].lower().strip() for p in pessoas_sistema if p.get('nome')])
print(f'   Pessoas no sistema: {len(pessoas_sistema)}')
print()

# 3. Ler Centro de Custos 2020
print('2. Lendo Centro de Custos 2020...')
wb = openpyxl.load_workbook(r'E:\Grupo WG Almeida\5 . Adm\3 . Financeiro\2. Centro de Custos\Centro de Custos_2020.xlsx')
ws = wb.active

lancamentos_novos = []
pessoas_novas = set()

def parse_valor(val):
    if val is None:
        return 0
    if isinstance(val, (int, float)):
        return abs(float(val))
    val_str = str(val).replace('R$', '').replace(' ', '').replace('.', '').replace(',', '.')
    try:
        return abs(float(val_str))
    except:
        return 0

for row in ws.iter_rows(min_row=2, values_only=True):
    data = row[0]  # data do pagamento
    valor = row[6]  # valor movimentado
    situacao = row[7]  # situacao
    operacao = row[8]  # operacao
    centro_custo = row[9]  # centro de custo
    tipo_excel = row[10]  # tipo
    cliente_forn = row[12]  # cliente/fornecedor
    obs = row[13]  # observacao

    # Validar
    if not data or data == '-':
        continue

    valor_float = parse_valor(valor)
    if valor_float == 0:
        continue

    # Data
    if isinstance(data, datetime):
        data_str = data.strftime('%Y-%m-%d')
    elif isinstance(data, str):
        try:
            data_str = datetime.strptime(data, '%Y-%m-%d %H:%M:%S').strftime('%Y-%m-%d')
        except:
            try:
                data_str = datetime.strptime(data, '%d/%m/%Y').strftime('%Y-%m-%d')
            except:
                continue
    else:
        continue

    # Verificar se ja existe
    chave = f"{data_str}_{round(valor_float, 2)}"
    if chave in chaves_existentes:
        continue

    # Tipo (entrada/saida)
    operacao_str = str(operacao).lower() if operacao else ''
    if 'receita' in operacao_str or 'recebido' in str(situacao).lower():
        tipo = 'entrada'
    else:
        tipo = 'saida'

    # Descricao
    desc_parts = []
    if cliente_forn and str(cliente_forn).strip() not in ['-', '- ()']:
        desc_parts.append(str(cliente_forn).strip()[:50])
    if centro_custo:
        desc_parts.append(str(centro_custo)[:30])
    if obs:
        desc_parts.append(str(obs)[:50])

    descricao = ' | '.join(desc_parts) if desc_parts else 'Centro de Custos 2020'

    lanc = {
        'tipo': tipo,
        'natureza': 'operacional',
        'descricao': descricao[:200],
        'valor_total': valor_float,
        'data_competencia': data_str,
        'status': 'pago' if 'pago' in str(situacao).lower() or 'realizado' in str(situacao).lower() else 'pendente',
        'nucleo': 'grupo',
        'origem': 'CENTRO_CUSTOS_2020'
    }

    lancamentos_novos.append(lanc)
    chaves_existentes.add(chave)  # Evitar duplicatas no mesmo arquivo

    # Coletar pessoa
    if cliente_forn and str(cliente_forn).strip() not in ['-', '- ()', '']:
        nome_limpo = re.sub(r'\s*\(.*\)$', '', str(cliente_forn)).strip()
        if nome_limpo and len(nome_limpo) > 2:
            if nome_limpo.lower() not in nomes_existentes:
                pessoas_novas.add(nome_limpo[:100])
                nomes_existentes.add(nome_limpo.lower())

print(f'   Lancamentos novos para importar: {len(lancamentos_novos)}')
print(f'   Pessoas novas para cadastrar: {len(pessoas_novas)}')
print()

# 4. Importar lancamentos
if lancamentos_novos:
    print('3. Importando lancamentos...')
    sucesso = 0
    erro = 0

    for i, lanc in enumerate(lancamentos_novos):
        response = requests.post(
            SUPABASE_URL + '/rest/v1/financeiro_lancamentos',
            headers=headers,
            json=lanc
        )

        if response.status_code in [200, 201]:
            sucesso += 1
            if sucesso % 100 == 0:
                print(f'   Importados: {sucesso}')
        else:
            erro += 1

    print(f'   RESULTADO: Sucesso={sucesso}, Erro={erro}')
    print()

# 5. Cadastrar pessoas novas
if pessoas_novas:
    print('4. Cadastrando pessoas novas...')
    sucesso_p = 0
    erro_p = 0

    for nome in list(pessoas_novas):
        nome_email = re.sub(r'[^a-zA-Z0-9]', '.', nome.lower())[:30]
        email = f'{nome_email}@fornecedor.wgalmeida.temp'

        pessoa = {
            'nome': nome,
            'email': email,
            'tipo': 'FORNECEDOR',
            'ativo': True,
            'observacoes': 'Importado do Centro de Custos 2020'
        }

        response = requests.post(
            SUPABASE_URL + '/rest/v1/pessoas',
            headers=headers,
            json=pessoa
        )

        if response.status_code in [200, 201]:
            sucesso_p += 1
        else:
            erro_p += 1

    print(f'   RESULTADO: Sucesso={sucesso_p}, Erro={erro_p}')

print()
print('='*60)
print('IMPORTACAO CONCLUIDA!')
print('='*60)
