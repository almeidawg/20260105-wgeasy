#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Upload Site WG Almeida - Credenciais atualizadas
"""

import os
import time
from ftplib import FTP

FTP_HOST = "147.93.64.151"
FTP_USER = "u968231423.wgalmeida.com.br"
FTP_PASS = "130300@" + "$" + "Wg"

SITE_DIST = r"C:\Users\Atendimento\Documents\01VISUALSTUDIO_OFICIAL\site\dist"
REMOTE_PATH = "/public_html"

EXTENSOES_ESSENCIAIS = {'.html', '.js', '.css', '.json', '.ico', '.svg', '.woff', '.woff2', '.ttf', '.eot'}
PASTAS_IGNORAR = {'videos', 'images', '+ apartamento', 'docs', 'projetopdfrestraunte'}

def conectar():
    ftp = FTP(FTP_HOST, timeout=30)
    ftp.login(FTP_USER, FTP_PASS)
    ftp.set_pasv(True)
    return ftp

def upload_com_retry(local_file, remote_file, max_tentativas=3):
    for tentativa in range(max_tentativas):
        try:
            ftp = conectar()
            with open(local_file, 'rb') as f:
                ftp.storbinary(f'STOR {remote_file}', f)
            ftp.quit()
            return True
        except Exception as e:
            if tentativa < max_tentativas - 1:
                time.sleep(1)
            else:
                print(f"  [FALHA] {remote_file} - {e}")
                return False
    return False

def criar_dir(remote_dir):
    try:
        ftp = conectar()
        ftp.mkd(remote_dir)
        ftp.quit()
        print(f"  [DIR] {remote_dir}")
    except:
        pass

def deve_enviar(filepath, filename):
    path_lower = filepath.lower()
    for pasta in PASTAS_IGNORAR:
        if pasta in path_lower:
            return False
    if filename == '.htaccess':
        return True
    _, ext = os.path.splitext(filename)
    return ext.lower() in EXTENSOES_ESSENCIAIS

def main():
    print("=" * 60)
    print("  UPLOAD SITE - wgalmeida.com.br")
    print("=" * 60)
    print()

    arquivos = []
    diretorios = set()

    for root, dirs, files in os.walk(SITE_DIST):
        dirs[:] = [d for d in dirs if d.lower() not in PASTAS_IGNORAR]
        rel_path = os.path.relpath(root, SITE_DIST)
        if rel_path == ".":
            rel_path = ""

        if rel_path:
            remote_dir = REMOTE_PATH + "/" + rel_path.replace("\\", "/")
            diretorios.add(remote_dir)

        for filename in files:
            local_file = os.path.join(root, filename)
            if not deve_enviar(local_file, filename):
                continue
            if rel_path:
                remote_file = REMOTE_PATH + "/" + rel_path.replace("\\", "/") + "/" + filename
            else:
                remote_file = REMOTE_PATH + "/" + filename
            arquivos.append((local_file, remote_file))

    print(f"Arquivos: {len(arquivos)}")
    print(f"Diretorios: {len(diretorios)}")
    print()

    print("Criando diretorios...")
    for d in sorted(diretorios):
        criar_dir(d)

    print("\nEnviando arquivos...")
    enviados = 0
    erros = 0

    for i, (local_file, remote_file) in enumerate(arquivos, 1):
        print(f"[{i}/{len(arquivos)}] {os.path.basename(remote_file)}", end=" ")
        if upload_com_retry(local_file, remote_file):
            print("[OK]")
            enviados += 1
        else:
            erros += 1

    print()
    print("=" * 60)
    print(f"  SITE ENVIADO!")
    print(f"  {enviados} OK, {erros} erros")
    print("=" * 60)
    print("\nAcesse: https://wgalmeida.com.br")

if __name__ == "__main__":
    main()
