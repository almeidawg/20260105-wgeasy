from ftplib import FTP

ftp = FTP("147.93.64.151", timeout=30)
senha = "130300@" + "$" + "Wg"
ftp.login("u968231423.wgalmeida-com-br-238673.hostingersite.com", senha)
print("Conectado!")
print("PWD:", ftp.pwd())

# Listar raiz
ftp.cwd("/")
print("\nConteudo raiz /:")
items = ftp.nlst()
for item in items:
    print(f"  {item}")

# Verificar domains
print("\n\nVerificando /domains...")
try:
    ftp.cwd("/domains")
    print("Conteudo de /domains:")
    for item in ftp.nlst():
        print(f"  {item}")

    # Verificar violet-ant
    print("\nVerificando violet-ant...")
    try:
        ftp.cwd("/domains/violet-ant-264237.hostingersite.com")
        print("Conteudo:")
        for item in ftp.nlst():
            print(f"  {item}")
    except Exception as e:
        print(f"Erro: {e}")
except Exception as e:
    print(f"Erro ao acessar /domains: {e}")

ftp.quit()
