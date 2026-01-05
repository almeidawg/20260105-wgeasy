#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Upload para /public_html - Substitui WordPress
"""

import os
from ftplib import FTP

FTP_HOST = "147.93.64.151"
FTP_USER = "u968231423.wgalmeida-com-br-238673.hostingersite.com"
FTP_PASS = "130300@$Wg"

SITE_DIST = r"C:\Users\Atendimento\Documents\01VISUALSTUDIO_OFICIAL\site\dist"
REMOTE_PATH = "/public_html"

EXTENSOES_ESSENCIAIS = {'.html', '.js', '.css', '.json', '.ico', '.svg', '.woff', '.woff2', '.ttf', '.eot', '.htaccess'}
PASTAS_IGNORAR = {'videos', 'images', '+ Apartamento', 'docs', 'projetopdfrestraunte'}

ftp = None

def conectar():
    global ftp
    print(f"Conectando ao FTP...")
    ftp = FTP(FTP_HOST, timeout=120)
    ftp.login(FTP_USER, FTP_PASS)
    ftp.set_pasv(True)
    print(f"Conectado!")
    return ftp

def criar_diretorio(remote_dir):
    global ftp
    try:
        ftp.mkd(remote_dir)
        print(f"  [DIR] {remote_dir}")
    except:
        pass

def upload_arquivo(local_file, remote_file):
    global ftp
    try:
        with open(local_file, 'rb') as f:
            ftp.storbinary(f'STOR {remote_file}', f)
        print(f"  [OK] {remote_file}")
        return True
    except Exception as e:
        print(f"  [ERRO] {remote_file} - {e}")
        return False

def deve_enviar(filepath, filename):
    for pasta in PASTAS_IGNORAR:
        if pasta.lower() in filepath.lower():
            return False
    if filename == '.htaccess':
        return True
    _, ext = os.path.splitext(filename)
    return ext.lower() in EXTENSOES_ESSENCIAIS

def main():
    global ftp

    print("=" * 60)
    print("  UPLOAD SITE PARA /public_html")
    print("  (Substituindo WordPress)")
    print("=" * 60)
    print()

    conectar()

    # Ir para public_html
    ftp.cwd(REMOTE_PATH)
    print(f"Diretorio: {ftp.pwd()}")
    print()

    arquivos_enviados = 0
    erros = 0

    for root, dirs, files in os.walk(SITE_DIST):
        dirs[:] = [d for d in dirs if d.lower() not in [p.lower() for p in PASTAS_IGNORAR]]

        rel_path = os.path.relpath(root, SITE_DIST)
        if rel_path == ".":
            rel_path = ""

        if rel_path:
            remote_dir = REMOTE_PATH + "/" + rel_path.replace("\\", "/")
            criar_diretorio(remote_dir)

        for filename in files:
            local_file = os.path.join(root, filename)

            if not deve_enviar(local_file, filename):
                continue

            if rel_path:
                remote_file = REMOTE_PATH + "/" + rel_path.replace("\\", "/") + "/" + filename
            else:
                remote_file = REMOTE_PATH + "/" + filename

            if upload_arquivo(local_file, remote_file):
                arquivos_enviados += 1
            else:
                erros += 1

    try:
        ftp.quit()
    except:
        pass

    print()
    print("=" * 60)
    print(f"  CONCLUIDO!")
    print(f"  {arquivos_enviados} arquivos enviados, {erros} erros")
    print("=" * 60)
    print()
    print("Acesse: https://wgalmeida.com.br")

if __name__ == "__main__":
    main()
