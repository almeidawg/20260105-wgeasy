from ftplib import FTP

FTP_HOST = "147.93.64.151"
FTP_USER = "u968231423.wgalmeida.com.br"
FTP_PASS = "130300@" + "$" + "Wg"

print("Conectando...")
print(f"Host: {FTP_HOST}")
print(f"User: {FTP_USER}")

ftp = FTP(FTP_HOST, timeout=30)
ftp.login(FTP_USER, FTP_PASS)
print("Conectado!")
print(f"Diretorio: {ftp.pwd()}")

print("\nConteudo raiz /:")
ftp.cwd("/")
for item in ftp.nlst():
    print(f"  {item}")

print("\nVerificando /domains...")
try:
    ftp.cwd("/domains")
    print("Conteudo de /domains:")
    for item in ftp.nlst():
        print(f"  {item}")
except Exception as e:
    print(f"Erro: {e}")

ftp.quit()
print("\nConexao OK!")
