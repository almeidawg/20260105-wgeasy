#!/usr/bin/env python3
"""
Upload FTP para WGEasy - easy.wgalmeida.com.br
"""

import ftplib
import os
import sys

# Configurações FTP
FTP_HOST = "147.93.64.151"
FTP_USER = "u968231423.easy.wgalmeida.com.br"
FTP_PASS = "WGEasy2026!"
LOCAL_PATH = r"C:\Users\Atendimento\Documents\01VISUALSTUDIO_OFICIAL\sistema\wgeasy\frontend\dist"
REMOTE_PATH = "/public_html"

def upload_directory(ftp, local_path, remote_path):
    """Upload recursivo de diretório"""
    total = 0
    success = 0

    for root, dirs, files in os.walk(local_path):
        # Calcula o caminho relativo
        rel_path = os.path.relpath(root, local_path)
        if rel_path == ".":
            current_remote = remote_path
        else:
            current_remote = f"{remote_path}/{rel_path}".replace("\\", "/")

        # Cria diretórios remotos se necessário
        try:
            ftp.mkd(current_remote)
            print(f"  [DIR] {current_remote}")
        except:
            pass  # Diretório já existe

        # Upload dos arquivos
        for filename in files:
            total += 1
            local_file = os.path.join(root, filename)
            remote_file = f"{current_remote}/{filename}"

            try:
                with open(local_file, "rb") as f:
                    ftp.storbinary(f"STOR {remote_file}", f)
                print(f"  [OK] {remote_file}")
                success += 1
            except Exception as e:
                print(f"  [ERRO] {remote_file} - {e}")

    return success, total

def main():
    print("=" * 50)
    print("  UPLOAD FTP - WGEasy Sistema")
    print("=" * 50)
    print(f"\nHost: {FTP_HOST}")
    print(f"User: {FTP_USER}")
    print(f"Destino: {REMOTE_PATH}")
    print(f"Origem: {LOCAL_PATH}\n")

    if not os.path.exists(LOCAL_PATH):
        print(f"[ERRO] Pasta não encontrada: {LOCAL_PATH}")
        sys.exit(1)

    print("Conectando ao FTP...")

    try:
        ftp = ftplib.FTP(FTP_HOST)
        ftp.login(FTP_USER, FTP_PASS)
        ftp.set_pasv(True)
        print("[OK] Conectado!\n")

        print("Iniciando upload...\n")
        success, total = upload_directory(ftp, LOCAL_PATH, REMOTE_PATH)

        ftp.quit()

        print("\n" + "=" * 50)
        print("  UPLOAD CONCLUÍDO!")
        print(f"  {success} de {total} arquivos enviados")
        print("=" * 50)

    except Exception as e:
        print(f"\n[ERRO] Falha na conexão: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
