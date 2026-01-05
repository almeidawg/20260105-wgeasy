#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Deploy Sistema WGeasy para easy.wgalmeida.com.br
Usando conta FTP principal
"""

import os
import time
from ftplib import FTP

FTP_HOST = "147.93.64.151"
FTP_USER = "u968231423.easy.wgalmeida.com.br"
FTP_PASS = "WGEasy2026!"

SISTEMA_DIST = r"C:\Users\Atendimento\Documents\01VISUALSTUDIO_OFICIAL\sistema\wgeasy\frontend\dist"
REMOTE_PATH = "/public_html"

def conectar():
    ftp = FTP(FTP_HOST, timeout=30)
    ftp.login(FTP_USER, FTP_PASS)
    ftp.set_pasv(True)
    return ftp

def criar_dir_recursivo(ftp, remote_dir):
    """Criar diretorio e seus pais se necessario"""
    dirs = remote_dir.split('/')
    current = ""
    for d in dirs:
        if d:
            current += "/" + d
            try:
                ftp.mkd(current)
            except:
                pass

def upload_arquivo(ftp, local_file, remote_file):
    """Upload de um arquivo"""
    try:
        with open(local_file, 'rb') as f:
            ftp.storbinary(f'STOR {remote_file}', f)
        return True
    except Exception as e:
        return False

def main():
    print("=" * 60)
    print("  DEPLOY SISTEMA WG EASY")
    print("  Destino: easy.wgalmeida.com.br")
    print("=" * 60)
    print()

    # Testar conexao
    print("Conectando ao servidor FTP...")
    try:
        ftp = conectar()
        print(f"[OK] Conectado! Dir: {ftp.pwd()}")
    except Exception as e:
        print(f"[ERRO] Conexao falhou: {e}")
        return

    # Verificar diretorio destino
    print(f"\nNavegando para: {REMOTE_PATH}")
    try:
        ftp.cwd(REMOTE_PATH)
        print(f"[OK] Diretorio existe")
    except:
        print("[INFO] Criando diretorio...")
        criar_dir_recursivo(ftp, REMOTE_PATH)
        ftp.cwd(REMOTE_PATH)

    # Coletar arquivos
    print("\nColetando arquivos para upload...")
    arquivos = []
    diretorios = set()

    for root, dirs, files in os.walk(SISTEMA_DIST):
        rel_path = os.path.relpath(root, SISTEMA_DIST)
        if rel_path == ".":
            rel_path = ""

        if rel_path:
            remote_dir = REMOTE_PATH + "/" + rel_path.replace("\\", "/")
            diretorios.add(remote_dir)

        for filename in files:
            local_file = os.path.join(root, filename)
            if rel_path:
                remote_file = REMOTE_PATH + "/" + rel_path.replace("\\", "/") + "/" + filename
            else:
                remote_file = REMOTE_PATH + "/" + filename
            arquivos.append((local_file, remote_file))

    print(f"[INFO] {len(arquivos)} arquivos encontrados")
    print(f"[INFO] {len(diretorios)} diretorios a criar")
    print()

    # Criar diretorios
    print("Criando estrutura de diretorios...")
    for d in sorted(diretorios):
        criar_dir_recursivo(ftp, d)

    ftp.quit()

    # Upload arquivos
    print("\nEnviando arquivos...")
    enviados = 0
    erros = 0
    total = len(arquivos)

    for i, (local_file, remote_file) in enumerate(arquivos, 1):
        nome = os.path.basename(remote_file)
        nome_display = nome[:40] if len(nome) > 40 else nome

        # Reconectar para cada arquivo (mais estavel)
        try:
            ftp = conectar()
            if upload_arquivo(ftp, local_file, remote_file):
                print(f"[{i}/{total}] {nome_display} [OK]")
                enviados += 1
            else:
                print(f"[{i}/{total}] {nome_display} [ERRO]")
                erros += 1
            ftp.quit()
        except Exception as e:
            print(f"[{i}/{total}] {nome_display} [ERRO: {str(e)[:30]}]")
            erros += 1

    print()
    print("=" * 60)
    print(f"  DEPLOY CONCLUIDO!")
    print(f"  {enviados} enviados, {erros} erros")
    print("=" * 60)
    print("\nAcesse: https://easy.wgalmeida.com.br")

if __name__ == "__main__":
    main()
