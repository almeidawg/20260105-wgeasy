#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Explorar estrutura do FTP
"""

from ftplib import FTP

FTP_HOST = "147.93.64.151"
FTP_USER = "u968231423.wgalmeida-com-br-238673.hostingersite.com"
FTP_PASS = "130300@$Wg"

def listar_recursivo(ftp, path="/", nivel=0):
    """Lista diretorios recursivamente"""
    if nivel > 2:  # Limitar profundidade
        return

    try:
        ftp.cwd(path)
        items = []
        ftp.dir(items.append)

        for item in items:
            parts = item.split()
            if len(parts) >= 9:
                nome = " ".join(parts[8:])
                is_dir = item.startswith('d')

                indent = "  " * nivel
                tipo = "[DIR]" if is_dir else "[ARQ]"

                # Mostrar apenas diretorios ou arquivos importantes
                if is_dir:
                    print(f"{indent}{tipo} {nome}")

                    # Explorar subdiretorios interessantes
                    if nome not in ['.', '..', 'wp-content', 'wp-includes', 'wp-admin', 'assets', '.tmb', '.private']:
                        novo_path = path.rstrip('/') + '/' + nome
                        listar_recursivo(ftp, novo_path, nivel + 1)

    except Exception as e:
        print(f"Erro em {path}: {e}")

def main():
    print("=" * 60)
    print("  EXPLORANDO ESTRUTURA DO FTP")
    print("=" * 60)
    print()

    ftp = FTP(FTP_HOST, timeout=60)
    ftp.login(FTP_USER, FTP_PASS)

    print(f"Conectado! Diretorio inicial: {ftp.pwd()}")
    print()

    # Tentar ir para raiz absoluta
    try:
        ftp.cwd("/")
        print("Conteudo da RAIZ (/):")
        print("-" * 40)
        items = []
        ftp.dir(items.append)
        for item in items:
            print(item)
    except Exception as e:
        print(f"Erro ao acessar raiz: {e}")

    print()
    print("-" * 40)
    print("Explorando subdiretorios...")
    print("-" * 40)

    listar_recursivo(ftp, "/", 0)

    # Tentar acessar pastas comuns de subdominio
    print()
    print("-" * 40)
    print("Procurando subdominios...")
    print("-" * 40)

    pastas_teste = [
        "/domains",
        "/subdomains",
        "/easy",
        "/easy.wgalmeida.com.br",
        "/public_html/easy",
        "/../",
        "/home",
    ]

    for pasta in pastas_teste:
        try:
            ftp.cwd(pasta)
            print(f"[ENCONTRADO] {pasta}")
            items = []
            ftp.nlst()
            for item in ftp.nlst():
                print(f"    -> {item}")
        except:
            print(f"[NAO EXISTE] {pasta}")

    ftp.quit()

if __name__ == "__main__":
    main()
