#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script de Upload FTP para Hostinger
Faz upload de arquivos para o servidor
"""

import os
import sys
from ftplib import FTP

# Configuracoes
FTP_HOST = "147.93.64.151"
FTP_USER = "u968231423.wgalmeida-com-br-238673.hostingersite.com"
FTP_PASS = "130300@$Wg"

# Caminhos
SITE_DIST = r"C:\Users\Atendimento\Documents\01VISUALSTUDIO_OFICIAL\site\dist"
SISTEMA_DIST = r"C:\Users\Atendimento\Documents\01VISUALSTUDIO_OFICIAL\sistema\wgeasy\frontend\dist"

def upload_directory(ftp, local_path, remote_path=""):
    """Upload de um diretorio recursivamente"""
    files_uploaded = 0
    files_failed = 0

    for root, dirs, files in os.walk(local_path):
        # Calcular caminho relativo
        rel_path = os.path.relpath(root, local_path)
        if rel_path == ".":
            rel_path = ""

        # Criar diretorios remotos
        if rel_path:
            remote_dir = "/" + rel_path.replace("\\", "/")
            try:
                ftp.mkd(remote_dir)
                print(f"  [DIR] {remote_dir}")
            except:
                pass  # Diretorio pode ja existir

        # Upload dos arquivos
        for filename in files:
            local_file = os.path.join(root, filename)
            if rel_path:
                remote_file = "/" + rel_path.replace("\\", "/") + "/" + filename
            else:
                remote_file = "/" + filename

            try:
                with open(local_file, 'rb') as f:
                    ftp.storbinary(f'STOR {remote_file}', f)
                print(f"  [OK] {remote_file}")
                files_uploaded += 1
            except Exception as e:
                print(f"  [ERRO] {remote_file} - {e}")
                files_failed += 1

    return files_uploaded, files_failed

def main():
    print("=" * 50)
    print("  UPLOAD FTP - WG Almeida")
    print("=" * 50)
    print()

    # Escolher o que fazer upload
    if len(sys.argv) > 1:
        opcao = sys.argv[1]
    else:
        print("Escolha o que enviar:")
        print("  1 - Site (wgalmeida.com.br)")
        print("  2 - Sistema (easy.wgalmeida.com.br)")
        print("  3 - Ambos")
        opcao = input("\nOpcao: ").strip()

    uploads = []
    if opcao in ["1", "site", "ambos", "3"]:
        uploads.append(("Site", SITE_DIST))
    if opcao in ["2", "sistema", "ambos", "3"]:
        uploads.append(("Sistema", SISTEMA_DIST))

    if not uploads:
        print("Nenhuma opcao selecionada.")
        return

    # Conectar ao FTP
    print(f"\nConectando ao FTP {FTP_HOST}...")
    try:
        ftp = FTP(FTP_HOST, timeout=60)
        ftp.login(FTP_USER, FTP_PASS)
        print("Conectado com sucesso!")
        print(f"Diretorio atual: {ftp.pwd()}")
    except Exception as e:
        print(f"Erro ao conectar: {e}")
        return

    total_uploaded = 0
    total_failed = 0

    for nome, caminho in uploads:
        print()
        print("-" * 50)
        print(f"  Enviando: {nome}")
        print(f"  Origem: {caminho}")
        print("-" * 50)

        if not os.path.exists(caminho):
            print(f"  ERRO: Pasta nao encontrada: {caminho}")
            continue

        uploaded, failed = upload_directory(ftp, caminho)
        total_uploaded += uploaded
        total_failed += failed

        print(f"\n  {nome}: {uploaded} arquivos enviados, {failed} erros")

    ftp.quit()

    print()
    print("=" * 50)
    print(f"  UPLOAD CONCLUIDO!")
    print(f"  Total: {total_uploaded} enviados, {total_failed} erros")
    print("=" * 50)

if __name__ == "__main__":
    main()
