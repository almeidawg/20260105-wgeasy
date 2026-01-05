import os

print('='*70)
print('EXPLORACAO DETALHADA - MARKETING E SISTEMA')
print('='*70)
print()

# 1. Marketing (com espaco antes do ponto)
print('1. PASTA MARKETING (6  . Marketing):')
print('-'*50)
marketing = r'E:\Grupo WG Almeida\6  . Marketing'
if os.path.exists(marketing):
    for item in sorted(os.listdir(marketing)):
        path = os.path.join(marketing, item)
        if os.path.isdir(path):
            try:
                subcount = len(os.listdir(path))
            except:
                subcount = '?'
            print('  [PASTA] %s (%s itens)' % (item, subcount))
        else:
            ext = os.path.splitext(item)[1].lower()
            print('  [%s] %s' % (ext or 'ARQUIVO', item))
else:
    print('  Pasta nao encontrada')

# 2. Sistema (com espaco antes do ponto)
print()
print('2. PASTA SISTEMA (8  . Sistema):')
print('-'*50)
sistema = r'E:\Grupo WG Almeida\8  . Sistema'
if os.path.exists(sistema):
    for item in sorted(os.listdir(sistema)):
        path = os.path.join(sistema, item)
        if os.path.isdir(path):
            try:
                subcount = len(os.listdir(path))
            except:
                subcount = '?'
            print('  [PASTA] %s (%s itens)' % (item, subcount))
        else:
            print('  [ARQUIVO] %s' % item)
else:
    print('  Pasta nao encontrada')

# 3. Area de Estudos
print()
print('3. AREA DE ESTUDOS (9  . Area de Estudos):')
print('-'*50)
estudos = r'E:\Grupo WG Almeida\9  . Área de Estudos'
if os.path.exists(estudos):
    for item in sorted(os.listdir(estudos)):
        path = os.path.join(estudos, item)
        if os.path.isdir(path):
            try:
                subcount = len(os.listdir(path))
            except:
                subcount = '?'
            print('  [PASTA] %s (%s itens)' % (item, subcount))
        else:
            print('  [ARQUIVO] %s' % item)
else:
    print('  Pasta nao encontrada')

# 4. Documentos Arquitetura
print()
print('4. DOCUMENTOS ARQUITETURA:')
print('-'*50)
docs_arq = r'E:\Grupo WG Almeida\2 . Arquitetura\3 . Documentos'
if os.path.exists(docs_arq):
    for item in sorted(os.listdir(docs_arq)):
        print('  - %s' % item)
else:
    print('  Pasta nao encontrada')

# 5. Bora Na Obra (D:\)
print()
print('5. BORA NA OBRA (D:\\):')
print('-'*50)
bora = r'D:\Bora Na Obra'
if os.path.exists(bora):
    for item in sorted(os.listdir(bora)):
        path = os.path.join(bora, item)
        if os.path.isdir(path):
            try:
                subcount = len(os.listdir(path))
            except:
                subcount = '?'
            print('  [PASTA] %s (%s itens)' % (item, subcount))
        else:
            print('  [ARQUIVO] %s' % item)
else:
    print('  Pasta nao encontrada')

# 6. MOMA (D:\)
print()
print('6. MOMA (D:\\):')
print('-'*50)
moma = r'D:\Moma'
if os.path.exists(moma):
    for item in sorted(os.listdir(moma))[:20]:
        path = os.path.join(moma, item)
        if os.path.isdir(path):
            try:
                subcount = len(os.listdir(path))
            except:
                subcount = '?'
            print('  [PASTA] %s (%s itens)' % (item, subcount))
        else:
            print('  [ARQUIVO] %s' % item)
else:
    print('  Pasta nao encontrada')

# 7. Juridico (contratos, termos)
print()
print('7. JURIDICO:')
print('-'*50)
juridico = r'E:\Grupo WG Almeida\7 . Juridico'
if os.path.exists(juridico):
    for item in sorted(os.listdir(juridico)):
        path = os.path.join(juridico, item)
        if os.path.isdir(path):
            try:
                subcount = len(os.listdir(path))
            except:
                subcount = '?'
            print('  [PASTA] %s (%s itens)' % (item, subcount))
        else:
            print('  [ARQUIVO] %s' % item)
else:
    print('  Pasta nao encontrada')

# 8. Fabrica Marcenaria
print()
print('8. FABRICA 4MAT (Marcenaria):')
print('-'*50)
fabrica = r'E:\Grupo WG Almeida\4 . Marcenaria\Fábrica 4Mat'
if os.path.exists(fabrica):
    for item in sorted(os.listdir(fabrica))[:15]:
        path = os.path.join(fabrica, item)
        if os.path.isdir(path):
            try:
                subcount = len(os.listdir(path))
            except:
                subcount = '?'
            print('  [PASTA] %s (%s itens)' % (item, subcount))
        else:
            print('  [ARQUIVO] %s' % item)
else:
    print('  Pasta nao encontrada')
