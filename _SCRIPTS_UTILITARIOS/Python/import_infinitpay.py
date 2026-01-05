import requests
from datetime import datetime

SUPABASE_URL = 'https://ahlqzzkxuutwoepirpzr.supabase.co'
SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobHF6emt4dXV0d29lcGlycHpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU3MTI0MywiZXhwIjoyMDc2MTQ3MjQzfQ.xWNEmZumCtyRdrIiotUIL41jlI168HyBgM4yHVDXPZo'

headers = {
    'apikey': SERVICE_ROLE_KEY,
    'Authorization': 'Bearer ' + SERVICE_ROLE_KEY,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
}

print('='*60)
print('IMPORTACAO INFINITPAY - VENDAS CARTAO DE CREDITO')
print('='*60)
print()

# Transacoes extraidas dos PDFs InfinitPay
transacoes = [
    # GRUPO WG ALMEIDA (CNPJ: 46.836.926/0001-12)
    {'data': '2025-06-03', 'valor_bruto': 35500.00, 'taxa': 2687.35, 'nucleo': 'grupo', 'parcelas': '5x', 'empresa': 'GRUPO WG ALMEIDA'},
    {'data': '2025-03-19', 'valor_bruto': 136127.00, 'taxa': 9324.70, 'nucleo': 'grupo', 'parcelas': '4x', 'empresa': 'GRUPO WG ALMEIDA'},
    {'data': '2025-01-21', 'valor_bruto': 83826.00, 'taxa': 4518.22, 'nucleo': 'grupo', 'parcelas': '2x', 'empresa': 'GRUPO WG ALMEIDA'},

    # W.G.DESIGNER DE INTERIORES (CNPJ: 14.540.890/0001-39) - Transacoes principais
    {'data': '2025-12-16', 'valor_bruto': 4830.00, 'taxa': 365.87, 'nucleo': 'designer', 'parcelas': '5x', 'empresa': 'W.G.DESIGNER'},
    {'data': '2025-12-12', 'valor_bruto': 1500.00, 'taxa': 113.69, 'nucleo': 'designer', 'parcelas': '5x', 'empresa': 'W.G.DESIGNER'},
    {'data': '2025-12-05', 'valor_bruto': 820.00, 'taxa': 62.13, 'nucleo': 'designer', 'parcelas': '5x', 'empresa': 'W.G.DESIGNER'},
    {'data': '2025-11-21', 'valor_bruto': 15000.00, 'taxa': 1077.00, 'nucleo': 'designer', 'parcelas': '10x', 'empresa': 'W.G.DESIGNER'},
    {'data': '2025-11-11', 'valor_bruto': 7000.00, 'taxa': 502.60, 'nucleo': 'designer', 'parcelas': '10x', 'empresa': 'W.G.DESIGNER'},
    {'data': '2025-10-24', 'valor_bruto': 12000.00, 'taxa': 861.60, 'nucleo': 'designer', 'parcelas': '10x', 'empresa': 'W.G.DESIGNER'},
    {'data': '2025-10-07', 'valor_bruto': 13500.00, 'taxa': 969.30, 'nucleo': 'designer', 'parcelas': '10x', 'empresa': 'W.G.DESIGNER'},
    {'data': '2025-09-27', 'valor_bruto': 2100.00, 'taxa': 150.78, 'nucleo': 'designer', 'parcelas': '10x', 'empresa': 'W.G.DESIGNER'},
    {'data': '2025-09-23', 'valor_bruto': 7350.00, 'taxa': 527.73, 'nucleo': 'designer', 'parcelas': '10x', 'empresa': 'W.G.DESIGNER'},
    {'data': '2025-09-18', 'valor_bruto': 5850.00, 'taxa': 420.03, 'nucleo': 'designer', 'parcelas': '10x', 'empresa': 'W.G.DESIGNER'},
    {'data': '2025-08-14', 'valor_bruto': 2200.00, 'taxa': 157.96, 'nucleo': 'designer', 'parcelas': '10x', 'empresa': 'W.G.DESIGNER'},
    {'data': '2025-07-16', 'valor_bruto': 6800.00, 'taxa': 488.24, 'nucleo': 'designer', 'parcelas': '10x', 'empresa': 'W.G.DESIGNER'},
    {'data': '2025-06-05', 'valor_bruto': 2250.00, 'taxa': 161.55, 'nucleo': 'designer', 'parcelas': '10x', 'empresa': 'W.G.DESIGNER'},
    {'data': '2025-05-08', 'valor_bruto': 10700.00, 'taxa': 768.26, 'nucleo': 'designer', 'parcelas': '10x', 'empresa': 'W.G.DESIGNER'},
    {'data': '2025-03-17', 'valor_bruto': 6500.00, 'taxa': 466.70, 'nucleo': 'designer', 'parcelas': '10x', 'empresa': 'W.G.DESIGNER'},
    {'data': '2024-12-19', 'valor_bruto': 34000.00, 'taxa': 1782.40, 'nucleo': 'designer', 'parcelas': '12x', 'empresa': 'W.G.DESIGNER'},
    {'data': '2024-11-22', 'valor_bruto': 8500.00, 'taxa': 610.30, 'nucleo': 'designer', 'parcelas': '10x', 'empresa': 'W.G.DESIGNER'},
    {'data': '2024-06-21', 'valor_bruto': 22000.00, 'taxa': 1085.84, 'nucleo': 'designer', 'parcelas': '12x', 'empresa': 'W.G.DESIGNER'},
    {'data': '2024-06-04', 'valor_bruto': 4740.00, 'taxa': 268.97, 'nucleo': 'designer', 'parcelas': '6x', 'empresa': 'W.G.DESIGNER'},
    {'data': '2024-02-07', 'valor_bruto': 8500.00, 'taxa': 424.15, 'nucleo': 'designer', 'parcelas': '10x', 'empresa': 'W.G.DESIGNER'},
    {'data': '2023-11-30', 'valor_bruto': 5500.00, 'taxa': 274.45, 'nucleo': 'designer', 'parcelas': '10x', 'empresa': 'W.G.DESIGNER'},
    {'data': '2023-11-21', 'valor_bruto': 10100.00, 'taxa': 503.99, 'nucleo': 'designer', 'parcelas': '10x', 'empresa': 'W.G.DESIGNER'},
    {'data': '2023-08-07', 'valor_bruto': 12000.00, 'taxa': 598.80, 'nucleo': 'designer', 'parcelas': '10x', 'empresa': 'W.G.DESIGNER'},

    # WG ALMEIDA ARQUITETURA E COMERCIO LTDA (CNPJ: 45.150.970/0001-01)
    {'data': '2025-12-12', 'valor_bruto': 4320.00, 'taxa': 327.26, 'nucleo': 'arquitetura', 'parcelas': '3x', 'empresa': 'WG ALMEIDA ARQ'},
    {'data': '2025-12-12', 'valor_bruto': 13800.00, 'taxa': 1310.03, 'nucleo': 'arquitetura', 'parcelas': '6x', 'empresa': 'WG ALMEIDA ARQ'},

    # SumUp (nucleo grupo)
    {'data': '2024-04-01', 'valor_bruto': 44369.64, 'taxa': 0, 'nucleo': 'grupo', 'parcelas': 'Visa', 'empresa': 'SUMUP'},
]

lancamentos = []

for t in transacoes:
    # Entrada (valor bruto recebido)
    entrada = {
        'tipo': 'entrada',
        'natureza': 'operacional',
        'descricao': f"InfinitPay {t['empresa']} - Venda Cartao {t['parcelas']}",
        'valor_total': t['valor_bruto'],
        'data_competencia': t['data'],
        'status': 'pago',
        'nucleo': t['nucleo'],
        'origem': 'INFINITPAY'
    }
    lancamentos.append(entrada)

    # Taxa (saida - se houver)
    if t['taxa'] > 0:
        taxa = {
            'tipo': 'saida',
            'natureza': 'operacional',
            'descricao': f"Taxa InfinitPay {t['empresa']} - {t['parcelas']}",
            'valor_total': t['taxa'],
            'data_competencia': t['data'],
            'status': 'pago',
            'nucleo': t['nucleo'],
            'origem': 'INFINITPAY_TAXA'
        }
        lancamentos.append(taxa)

print(f'Total de lancamentos para inserir: {len(lancamentos)}')
print(f'  - Entradas (vendas): {len(transacoes)}')
print(f'  - Saidas (taxas): {len([t for t in transacoes if t["taxa"] > 0])}')
print()

# Calcular totais
total_bruto = sum(t['valor_bruto'] for t in transacoes)
total_taxas = sum(t['taxa'] for t in transacoes)
total_liquido = total_bruto - total_taxas

print(f'Resumo Financeiro:')
print(f'  Valor Bruto: R$ {total_bruto:,.2f}')
print(f'  Taxas: R$ {total_taxas:,.2f}')
print(f'  Valor Liquido: R$ {total_liquido:,.2f}')
print()

# Inserir no banco
sucesso = 0
erro = 0
erro_msg = ''

for lanc in lancamentos:
    response = requests.post(
        SUPABASE_URL + '/rest/v1/financeiro_lancamentos',
        headers=headers,
        json=lanc
    )

    if response.status_code in [200, 201]:
        sucesso += 1
        if sucesso % 10 == 0:
            print(f'Inseridos: {sucesso}')
    else:
        erro += 1
        if not erro_msg:
            erro_msg = response.text[:200]

print()
print('='*60)
print('RESULTADO IMPORTACAO')
print('='*60)
print(f'Sucesso: {sucesso}')
print(f'Erro: {erro}')
if erro_msg:
    print(f'Detalhe: {erro_msg}')

# Resumo por nucleo
print()
print('Resumo por Nucleo:')
for nucleo in ['grupo', 'designer', 'arquitetura']:
    vendas = sum(t['valor_bruto'] for t in transacoes if t['nucleo'] == nucleo)
    taxas = sum(t['taxa'] for t in transacoes if t['nucleo'] == nucleo)
    print(f'  {nucleo.upper()}: Vendas R$ {vendas:,.2f} | Taxas R$ {taxas:,.2f} | Liquido R$ {vendas-taxas:,.2f}')
