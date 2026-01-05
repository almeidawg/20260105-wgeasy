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

wb = openpyxl.load_workbook(r'C:\Users\Atendimento\Documents\01VISUALSTUDIO_OFICIAL\ARQ-Extrato_BTG_WGeasy_Financeiro.xlsx')
ws = wb['Lancamentos']

lancamentos = []

def parse_valor(val):
    """Converte R$ 1.234,56 para 1234.56"""
    if val is None:
        return 0
    if isinstance(val, (int, float)):
        return abs(float(val))
    val_str = str(val)
    # Remove R$, espaços e pontos de milhar
    val_str = val_str.replace('R$', '').replace(' ', '').replace('.', '')
    # Troca vírgula por ponto
    val_str = val_str.replace(',', '.')
    try:
        return abs(float(val_str))
    except:
        return 0

for row in ws.iter_rows(min_row=2, values_only=True):
    if not any(cell for cell in row):
        continue

    data = row[0]
    tipo_excel = row[2]  # SAÍDA ou ENTRADA
    valor = row[4]
    favorecido = row[5]
    categoria = row[7]
    centro_custo = row[8]
    descricao = row[9]
    mensagem_pix = row[10]

    # Data
    if isinstance(data, datetime):
        data_str = data.strftime('%Y-%m-%d')
    elif isinstance(data, str):
        try:
            data_str = datetime.strptime(data, '%d/%m/%Y').strftime('%Y-%m-%d')
        except:
            data_str = datetime.now().strftime('%Y-%m-%d')
    else:
        data_str = datetime.now().strftime('%Y-%m-%d')

    # Tipo
    tipo_str = str(tipo_excel).upper() if tipo_excel else ''
    tipo = 'entrada' if 'ENTRADA' in tipo_str else 'saida'

    # Valor
    valor_abs = parse_valor(valor)
    if valor_abs == 0:
        continue

    # Descricao
    desc = str(favorecido)[:100] if favorecido else 'Lancamento BTG'
    if categoria:
        desc = desc + ' | ' + str(categoria)

    lanc = {
        'tipo': tipo,
        'natureza': 'operacional',
        'descricao': desc,
        'valor_total': valor_abs,
        'data_competencia': data_str,
        'status': 'pago',
        'nucleo': 'arquitetura',
        'origem': 'BTG_IMPORTACAO'
    }

    lancamentos.append(lanc)

print('Total de lancamentos ARQ para inserir:', len(lancamentos))
print()

sucesso = 0
erro = 0
erro_msg = ''

for i, lanc in enumerate(lancamentos):
    response = requests.post(
        SUPABASE_URL + '/rest/v1/financeiro_lancamentos',
        headers=headers,
        json=lanc
    )

    if response.status_code in [200, 201]:
        sucesso += 1
        if sucesso % 100 == 0:
            print('Inseridos:', sucesso)
    else:
        erro += 1
        if not erro_msg:
            erro_msg = response.text[:200]

print()
print('=== RESULTADO ===')
print('Sucesso:', sucesso)
print('Erro:', erro)
if erro_msg:
    print('Detalhe:', erro_msg)
