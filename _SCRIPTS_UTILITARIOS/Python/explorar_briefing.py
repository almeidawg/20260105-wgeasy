import os

print('='*70)
print('EXPLORACAO - BRIEFING E DOCUMENTOS ARQUITETURA')
print('='*70)
print()

# 1. Briefing
print('1. PASTA BRIEFING:')
print('-'*50)
briefing = r'E:\Grupo WG Almeida\2 . Arquitetura\3 . Documentos\1. Briefing'
if os.path.exists(briefing):
    for item in sorted(os.listdir(briefing)):
        print('  - %s' % item)
else:
    print('  Pasta nao encontrada')

# 2. Especificacoes Tecnicas
print()
print('2. ESPECIFICACOES TECNICAS:')
print('-'*50)
espec = r'E:\Grupo WG Almeida\2 . Arquitetura\3 . Documentos\Especificações Técnicas'
if os.path.exists(espec):
    for item in sorted(os.listdir(espec)):
        print('  - %s' % item)
else:
    print('  Pasta nao encontrada')

# 3. Moodboard
print()
print('3. MOODBOARD:')
print('-'*50)
mood = r'E:\Grupo WG Almeida\2 . Arquitetura\3 . Documentos\Moodboard'
if os.path.exists(mood):
    for item in sorted(os.listdir(mood)):
        print('  - %s' % item)
else:
    print('  Pasta nao encontrada')

# 4. Formularios
print()
print('4. FORMULARIOS:')
print('-'*50)
form = r'E:\Grupo WG Almeida\2 . Arquitetura\3 . Documentos\Formulários'
if os.path.exists(form):
    for item in sorted(os.listdir(form)):
        print('  - %s' % item)
else:
    print('  Pasta nao encontrada')

# 5. Area de Inspiracao
print()
print('5. AREA DE INSPIRACAO:')
print('-'*50)
insp = r'E:\Grupo WG Almeida\2 . Arquitetura\3 . Documentos\Area de Inspiração'
if os.path.exists(insp):
    for item in sorted(os.listdir(insp)):
        print('  - %s' % item)
else:
    print('  Pasta nao encontrada')

# 6. Projeto Final Apresentacao
print()
print('6. PROJETO FINAL APRESENTACAO:')
print('-'*50)
proj = r'E:\Grupo WG Almeida\2 . Arquitetura\3 . Documentos\Projeto Final Apresentação'
if os.path.exists(proj):
    for item in sorted(os.listdir(proj)):
        print('  - %s' % item)
else:
    print('  Pasta nao encontrada')

# 7. Missao e Valores
print()
print('7. MISSAO E VALORES:')
print('-'*50)
missao = r'E:\Grupo WG Almeida\6  . Marketing\Missão _ Valores'
if os.path.exists(missao):
    for item in sorted(os.listdir(missao)):
        print('  - %s' % item)
else:
    print('  Pasta nao encontrada')

# 8. Contratos Juridico - Arquitetura
print()
print('8. CONTRATOS ARQUITETURA:')
print('-'*50)
cont_arq = r'E:\Grupo WG Almeida\7 . Juridico\1 . Contrato Projeto Arquitetônico'
if os.path.exists(cont_arq):
    for item in sorted(os.listdir(cont_arq)):
        print('  - %s' % item)
else:
    print('  Pasta nao encontrada')

# 9. Contratos Marcenaria
print()
print('9. CONTRATOS MARCENARIA:')
print('-'*50)
cont_marc = r'E:\Grupo WG Almeida\7 . Juridico\3 . Contrato para Marcenaria'
if os.path.exists(cont_marc):
    for item in sorted(os.listdir(cont_marc)):
        print('  - %s' % item)
else:
    print('  Pasta nao encontrada')

# 10. Contratos Reformas
print()
print('10. CONTRATOS REFORMAS/ENGENHARIA:')
print('-'*50)
cont_ref = r'E:\Grupo WG Almeida\7 . Juridico\2 . Contrato para Reformas'
if os.path.exists(cont_ref):
    for item in sorted(os.listdir(cont_ref)):
        print('  - %s' % item)
else:
    print('  Pasta nao encontrada')

# 11. Treinamento de Vendas
print()
print('11. TREINAMENTO DE VENDAS:')
print('-'*50)
treino = r'E:\Grupo WG Almeida\6  . Marketing\Treinamento de Vendas'
if os.path.exists(treino):
    for item in sorted(os.listdir(treino)):
        print('  - %s' % item)
else:
    print('  Pasta nao encontrada')

# 12. Fluxograma
print()
print('12. FLUXOGRAMA:')
print('-'*50)
fluxo = r'E:\Grupo WG Almeida\6  . Marketing\Fluxograma'
if os.path.exists(fluxo):
    for item in sorted(os.listdir(fluxo)):
        print('  - %s' % item)
else:
    print('  Pasta nao encontrada')

# 13. Manual de Processos
print()
print('13. MANUAL DE PROCESSOS:')
print('-'*50)
manual = r'E:\Grupo WG Almeida\6  . Marketing\Manual de Processos Operacionais'
if os.path.exists(manual):
    for item in sorted(os.listdir(manual)):
        print('  - %s' % item)
else:
    print('  Pasta nao encontrada')

# 14. Business Plan
print()
print('14. BUSINESS PLAN:')
print('-'*50)
bplan = r'E:\Grupo WG Almeida\6  . Marketing\Bussines Plan'
if os.path.exists(bplan):
    for item in sorted(os.listdir(bplan)):
        print('  - %s' % item)
else:
    print('  Pasta nao encontrada')

# 15. Estilos de Decoracao (Area de Estudos)
print()
print('15. ESTILOS DE DECORACAO:')
print('-'*50)
estilos = r'E:\Grupo WG Almeida\9  . Área de Estudos\Estilos de Decoração'
if os.path.exists(estilos):
    for item in sorted(os.listdir(estilos)):
        print('  - %s' % item)
else:
    print('  Pasta nao encontrada')
