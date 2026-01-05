#!/usr/bin/env python3
"""Upload script for WGeasy frontend to Hostinger FTP"""

import os
import ftplib
from pathlib import Path

FTP_HOST = "147.93.64.151"
FTP_USER = "u968231423.easy.wgalmeida.com.br"
FTP_PASS = "WGEasy2026!"
LOCAL_PATH = Path(r"C:\Users\Atendimento\Documents\01VISUALSTUDIO_OFICIAL\sistema\wgeasy\frontend\dist")
REMOTE_PATH = "/public_html"

def ensure_remote_dir(ftp, path):
    """Create remote directory if it doesn't exist"""
    dirs = path.split('/')
    current = ""
    for d in dirs:
        if d:
            current += "/" + d
            try:
                ftp.cwd(current)
            except:
                try:
                    ftp.mkd(current)
                    print(f"  [DIR] {current}")
                except:
                    pass

def upload_file(ftp, local_file, remote_file):
    """Upload a single file"""
    try:
        with open(local_file, 'rb') as f:
            ftp.storbinary(f'STOR {remote_file}', f)
        print(f"  [OK] {remote_file}")
        return True
    except Exception as e:
        print(f"  [ERRO] {remote_file} - {e}")
        return False

def main():
    print("=" * 50)
    print("  UPLOAD FTP - WGeasy Sistema (Python)")
    print("=" * 50)
    print(f"\nHost: {FTP_HOST}")
    print(f"Destino: {REMOTE_PATH}")
    print(f"Origem: {LOCAL_PATH}")
    print("\nConectando...")

    ftp = ftplib.FTP(FTP_HOST)
    ftp.login(FTP_USER, FTP_PASS)
    print("Conectado!\n")

    # Get all files
    files = list(LOCAL_PATH.rglob('*'))
    files = [f for f in files if f.is_file()]
    total = len(files)
    success = 0

    print(f"Enviando {total} arquivos...\n")

    for i, local_file in enumerate(files, 1):
        rel_path = local_file.relative_to(LOCAL_PATH)
        remote_file = f"{REMOTE_PATH}/{str(rel_path).replace(chr(92), '/')}"
        remote_dir = os.path.dirname(remote_file)

        # Create directory if needed
        if remote_dir != REMOTE_PATH:
            ensure_remote_dir(ftp, remote_dir)

        print(f"[{i}/{total}] {rel_path}")
        if upload_file(ftp, str(local_file), remote_file):
            success += 1

    ftp.quit()

    print("\n" + "=" * 50)
    print(f"  UPLOAD CONCLUIDO!")
    print(f"  {success} de {total} arquivos enviados")
    print("=" * 50)

if __name__ == "__main__":
    main()
