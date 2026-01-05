#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script de Upload FTP para Hostinger - Upload Inteligente
Envia apenas arquivos essenciais com reconexao automatica
"""

import os
import sys
from ftplib import FTP
import time

# Configuracoes
FTP_HOST = "147.93.64.151"
FTP_USER = "u968231423.wgalmeida-com-br-238673.hostingersite.com"
FTP_PASS = "130300@$Wg"

# Caminhos
SITE_DIST = r"C:\Users\Atendimento\Documents\01VISUALSTUDIO_OFICIAL\site\dist"
SISTEMA_DIST = r"C:\Users\Atendimento\Documents\01VISUALSTUDIO_OFICIAL\sistema\wgeasy\frontend\dist"

# Extensoes essenciais para o site funcionar
EXTENSOES_ESSENCIAIS = {'.html', '.js', '.css', '.json', '.ico', '.svg', '.woff', '.woff2', '.ttf', '.eot'}

# Pastas a ignorar (midias pesadas)
PASTAS_IGNORAR = {'videos', 'images', '+ Apartamento', 'docs', 'projetopdfrestraunte'}

ftp = None

def conectar():
    """Conecta ao FTP"""
    global ftp
    print(f"Conectando ao FTP {FTP_HOST}...")
    ftp = FTP(FTP_HOST, timeout=120)
    ftp.login(FTP_USER, FTP_PASS)
    ftp.set_pasv(True)  # Modo passivo
    print(f"Conectado! Diretorio: {ftp.pwd()}")
    return ftp

def criar_diretorio(remote_dir):
    """Cria diretorio remoto se nao existir"""
    global ftp
    try:
        ftp.mkd(remote_dir)
        print(f"  [DIR] {remote_dir}")
    except:
        pass

def upload_arquivo(local_file, remote_file, tentativa=1):
    """Faz upload de um arquivo com retry"""
    global ftp
    max_tentativas = 3

    try:
        with open(local_file, 'rb') as f:
            ftp.storbinary(f'STOR {remote_file}', f)
        print(f"  [OK] {remote_file}")
        return True
    except Exception as e:
        if tentativa < max_tentativas:
            print(f"  [RETRY {tentativa}] {remote_file}")
            time.sleep(2)
            try:
                conectar()
            except:
                pass
            return upload_arquivo(local_file, remote_file, tentativa + 1)
        else:
            print(f"  [ERRO] {remote_file} - {e}")
            return False

def deve_enviar(filepath, filename):
    """Verifica se o arquivo deve ser enviado"""
    # Ignorar pastas de midia
    for pasta in PASTAS_IGNORAR:
        if pasta.lower() in filepath.lower():
            return False

    # Enviar .htaccess
    if filename == '.htaccess':
        return True

    # Verificar extensao
    _, ext = os.path.splitext(filename)
    return ext.lower() in EXTENSOES_ESSENCIAIS

def upload_site():
    """Upload dos arquivos essenciais do site"""
    global ftp

    print("\n" + "=" * 50)
    print("  UPLOAD SITE - Arquivos Essenciais")
    print("=" * 50)

    if not os.path.exists(SITE_DIST):
        print(f"ERRO: Pasta nao encontrada: {SITE_DIST}")
        return

    conectar()

    arquivos_enviados = 0
    arquivos_ignorados = 0
    erros = 0

    for root, dirs, files in os.walk(SITE_DIST):
        # Filtrar diretorios a ignorar
        dirs[:] = [d for d in dirs if d.lower() not in [p.lower() for p in PASTAS_IGNORAR]]

        rel_path = os.path.relpath(root, SITE_DIST)
        if rel_path == ".":
            rel_path = ""

        # Criar diretorio remoto
        if rel_path:
            remote_dir = "/" + rel_path.replace("\\", "/")
            criar_diretorio(remote_dir)

        for filename in files:
            local_file = os.path.join(root, filename)

            if not deve_enviar(local_file, filename):
                arquivos_ignorados += 1
                continue

            if rel_path:
                remote_file = "/" + rel_path.replace("\\", "/") + "/" + filename
            else:
                remote_file = "/" + filename

            if upload_arquivo(local_file, remote_file):
                arquivos_enviados += 1
            else:
                erros += 1

    try:
        ftp.quit()
    except:
        pass

    print("\n" + "-" * 50)
    print(f"  Enviados: {arquivos_enviados}")
    print(f"  Ignorados (midia): {arquivos_ignorados}")
    print(f"  Erros: {erros}")
    print("-" * 50)

def upload_sistema():
    """Upload dos arquivos do sistema"""
    global ftp

    print("\n" + "=" * 50)
    print("  UPLOAD SISTEMA")
    print("=" * 50)

    if not os.path.exists(SISTEMA_DIST):
        print(f"ERRO: Pasta nao encontrada: {SISTEMA_DIST}")
        return

    conectar()

    arquivos_enviados = 0
    erros = 0

    for root, dirs, files in os.walk(SISTEMA_DIST):
        rel_path = os.path.relpath(root, SISTEMA_DIST)
        if rel_path == ".":
            rel_path = ""

        # Criar diretorio remoto
        if rel_path:
            remote_dir = "/" + rel_path.replace("\\", "/")
            criar_diretorio(remote_dir)

        for filename in files:
            local_file = os.path.join(root, filename)

            if rel_path:
                remote_file = "/" + rel_path.replace("\\", "/") + "/" + filename
            else:
                remote_file = "/" + filename

            if upload_arquivo(local_file, remote_file):
                arquivos_enviados += 1
            else:
                erros += 1

    try:
        ftp.quit()
    except:
        pass

    print("\n" + "-" * 50)
    print(f"  Enviados: {arquivos_enviados}")
    print(f"  Erros: {erros}")
    print("-" * 50)

def main():
    print("=" * 50)
    print("  UPLOAD FTP INTELIGENTE - WG Almeida")
    print("=" * 50)

    if len(sys.argv) > 1:
        opcao = sys.argv[1]
    else:
        print("\nEscolha:")
        print("  1 - Site (apenas arquivos essenciais)")
        print("  2 - Sistema")
        print("  3 - Ambos")
        opcao = input("\nOpcao: ").strip()

    if opcao in ["1", "site"]:
        upload_site()
    elif opcao in ["2", "sistema"]:
        upload_sistema()
    elif opcao in ["3", "ambos"]:
        upload_site()
        upload_sistema()
    else:
        print("Opcao invalida")

if __name__ == "__main__":
    main()
