#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script para listar dominios no servidor Hostinger via SFTP
"""

import paramiko
import sys

# Credenciais
HOST = "147.93.64.151"
PORT = 22
USER = "u968231423.wgalmeida-com-br-238673.hostingersite.com"
PASS = "130300@$Wg"

def listar_dominios():
    print("=" * 50)
    print("  LISTANDO DOMINIOS NO SERVIDOR HOSTINGER")
    print("=" * 50)
    print()

    try:
        # Criar cliente SSH
        transport = paramiko.Transport((HOST, PORT))
        transport.connect(username=USER, password=PASS)

        # Criar cliente SFTP
        sftp = paramiko.SFTPClient.from_transport(transport)

        # Listar pasta /domains
        print("Dominios encontrados em /domains/:")
        print("-" * 50)

        dominios = sftp.listdir("/domains")

        for dominio in sorted(dominios):
            print(f"  - {dominio}")

            # Verificar se tem public_html
            try:
                path = f"/domains/{dominio}/public_html"
                sftp.stat(path)
                print(f"    -> {path}")
            except:
                pass

        print()
        print("-" * 50)
        print()

        # Procurar especificamente por easy
        print("Procurando por 'easy' nos nomes...")
        easy_dominios = [d for d in dominios if 'easy' in d.lower()]

        if easy_dominios:
            print("Encontrado:")
            for d in easy_dominios:
                print(f"  -> /domains/{d}/public_html")
        else:
            print("Nenhum dominio com 'easy' encontrado.")
            print("Procurando alternativas com 'wg' ou 'almeida'...")
            wg_dominios = [d for d in dominios if 'wg' in d.lower() or 'almeida' in d.lower()]
            for d in wg_dominios:
                print(f"  -> /domains/{d}/public_html")

        sftp.close()
        transport.close()

        print()
        print("=" * 50)
        print("  CONEXAO ENCERRADA COM SUCESSO")
        print("=" * 50)

    except Exception as e:
        print(f"Erro: {e}")
        sys.exit(1)

if __name__ == "__main__":
    listar_dominios()
