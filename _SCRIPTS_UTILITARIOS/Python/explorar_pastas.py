import os
import json

print('='*70)
print('EXPLORACAO DE PASTAS - GRUPO WG ALMEIDA')
print('='*70)
print()

# 1. Explorar E:\Grupo WG Almeida
print('1. ESTRUTURA E:\\Grupo WG Almeida:')
print('-'*50)
base_e = r'E:\Grupo WG Almeida'
if os.path.exists(base_e):
    for item in sorted(os.listdir(base_e)):
        path = os.path.join(base_e, item)
        if os.path.isdir(path):
            subcount = len(os.listdir(path)) if os.path.isdir(path) else 0
            print('  [PASTA] %s (%d itens)' % (item, subcount))
        else:
            print('  [ARQUIVO] %s' % item)
else:
    print('  Pasta nao encontrada')

# 2. Explorar D:\
print()
print('2. ESTRUTURA D:\\:')
print('-'*50)
base_d = r'D:\\'
if os.path.exists(base_d):
    for item in sorted(os.listdir(base_d))[:20]:
        path = os.path.join(base_d, item)
        if os.path.isdir(path):
            try:
                subcount = len(os.listdir(path))
            except:
                subcount = '?'
            print('  [PASTA] %s (%s itens)' % (item, subcount))
        else:
            print('  [ARQUIVO] %s' % item)
else:
    print('  Drive D nao encontrado')

# 3. Explorar pasta de Marketing
print()
print('3. PASTA DE MARKETING:')
print('-'*50)
marketing = r'E:\Grupo WG Almeida\6 . Marketing'
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
            print('  [ARQUIVO] %s' % item)
else:
    print('  Pasta nao encontrada')

# 4. Explorar Comercial (propostas, briefings)
print()
print('4. PASTA COMERCIAL:')
print('-'*50)
comercial = r'E:\Grupo WG Almeida\1 . Comercial'
if os.path.exists(comercial):
    for item in sorted(os.listdir(comercial)):
        path = os.path.join(comercial, item)
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

# 5. Explorar Arquitetura
print()
print('5. PASTA ARQUITETURA:')
print('-'*50)
arq = r'E:\Grupo WG Almeida\2 . Arquitetura'
if os.path.exists(arq):
    for item in sorted(os.listdir(arq))[:15]:
        path = os.path.join(arq, item)
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

# 6. Explorar Marcenaria
print()
print('6. PASTA MARCENARIA:')
print('-'*50)
marc = r'E:\Grupo WG Almeida\4 . Marcenaria'
if os.path.exists(marc):
    for item in sorted(os.listdir(marc))[:15]:
        path = os.path.join(marc, item)
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

# 7. Explorar Sistema (templates, documentos)
print()
print('7. PASTA SISTEMA:')
print('-'*50)
sistema = r'E:\Grupo WG Almeida\8 . Sistema'
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

# 8. Explorar Projetos Concluidos
print()
print('8. PROJETOS CONCLUIDOS (amostra):')
print('-'*50)
concluidos = r'E:\Grupo WG Almeida\11 . Projetos Concluídos'
if os.path.exists(concluidos):
    items = sorted(os.listdir(concluidos))
    print('  Total: %d projetos' % len(items))
    for item in items[-10:]:  # ultimos 10
        print('  - %s' % item)
else:
    print('  Pasta nao encontrada')
