import requests
import openpyxl
from datetime import datetime

SUPABASE_URL = 'https://ahlqzzkxuutwoepirpzr.supabase.co'
SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobHF6emt4dXV0d29lcGlycHpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU3MTI0MywiZXhwIjoyMDc2MTQ3MjQzfQ.xWNEmZumCtyRdrIiotUIL41jlI168HyBgM4yHVDXPZo'

headers = {
    'apikey': SERVICE_ROLE_KEY,
    'Authorization': 'Bearer ' + SERVICE_ROLE_KEY,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
}

wb = openpyxl.load_workbook(r'C:\Users\Atendimento\Documents\01VISUALSTUDIO_OFICIAL\EXTRATO_UNIFICADO_GRUPO_WG.xlsx')
ws = wb['LANCAMENTOS_UNIFICADOS']

lancamentos = []
contador = 1

for row in ws.iter_rows(min_row=2, values_only=True):
    empresa = row[1]
    if empresa != 'MARC':
        continue

    data = row[0]
    tipo_excel = row[2]
    valor = row[4]
    favorecido = row[5]
    categoria = row[9]
    centro_custo = row[10]
    descricao = row[11]
    mensagem_pix = row[12]

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

    tipo = 'saida' if tipo_excel == 'DESPESA' else 'entrada'
    valor_abs = abs(float(valor)) if valor else 0

    # Descricao simples
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
        'nucleo': 'marcenaria',
        'origem': 'BTG_IMPORTACAO'
    }

    lancamentos.append(lanc)
    contador += 1

print('Total de lancamentos ENG para inserir:', len(lancamentos))
print()

sucesso = 0
erro = 0
erro_msg = ''

# Inserir um por um para evitar problemas
for i, lanc in enumerate(lancamentos):
    response = requests.post(
        SUPABASE_URL + '/rest/v1/financeiro_lancamentos',
        headers=headers,
        json=lanc
    )

    if response.status_code in [200, 201]:
        sucesso += 1
        if sucesso % 20 == 0:
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
