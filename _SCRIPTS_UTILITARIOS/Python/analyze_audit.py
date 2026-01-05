import urllib.request
import json
import urllib.parse

url = "https://ahlqzzkxuutwoepirpzr.supabase.co/rest/v1/financeiro_lancamentos?observacoes=ilike.*AUDITORIA*&select=valor_total,observacoes,descricao"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobHF6emt4dXV0d29lcGlycHpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU3MTI0MywiZXhwIjoyMDc2MTQ3MjQzfQ.xWNEmZumCtyRdrIiotUIL41jlI168HyBgM4yHVDXPZo"

req = urllib.request.Request(url)
req.add_header("apikey", key)
req.add_header("Authorization", f"Bearer {key}")

with urllib.request.urlopen(req) as response:
    data = json.loads(response.read().decode())

# Separate by year
audit_2020 = [x for x in data if 'AUDITORIA 2020' in str(x.get('observacoes', ''))]
audit_2021 = [x for x in data if 'AUDITORIA 2021' in str(x.get('observacoes', ''))]
audit_2022 = [x for x in data if 'AUDITORIA 2022' in str(x.get('observacoes', ''))]
audit_2023 = [x for x in data if 'AUDITORIA 2023' in str(x.get('observacoes', ''))]

def format_brl(value):
    return f'R$ {value:,.2f}'.replace(',','X').replace('.',',').replace('X','.')

print('=' * 55)
print('    RESUMO FINAL - AUDITORIAS FINANCEIRAS')
print('    Grupo WG Almeida - Projetos Concluidos')
print('=' * 55)

total_geral = 0
total_lancamentos = 0

for ano, itens in [('2023', audit_2023), ('2022', audit_2022), ('2021', audit_2021), ('2020', audit_2020)]:
    if itens:
        total = sum(x['valor_total'] for x in itens)
        total_geral += total
        total_lancamentos += len(itens)
        print(f'\n  AUDITORIA {ano}:')
        print(f'    Lancamentos: {len(itens)}')
        print(f'    Valor Total: {format_brl(total)}')

print(f'\n{"=" * 55}')
print(f'  TOTAL GERAL AUDITADO: {format_brl(total_geral)}')
print(f'  Total de Lancamentos: {total_lancamentos}')
print('=' * 55)

# Show breakdown
print('\n\n--- DETALHAMENTO POR PROJETO ---\n')
for ano, itens in [('2020', audit_2020), ('2021', audit_2021), ('2022', audit_2022), ('2023', audit_2023)]:
    if itens:
        total = sum(x['valor_total'] for x in itens)
        print(f'--- {ano}: {format_brl(total)} ({len(itens)} lanc.) ---')
