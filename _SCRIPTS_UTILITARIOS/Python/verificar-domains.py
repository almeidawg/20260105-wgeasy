from ftplib import FTP

ftp = FTP("147.93.64.151", timeout=30)
ftp.login("u968231423.wgalmeida-com-br-238673.hostingersite.com", "130300@$Wg")

print("Diretorio atual:", ftp.pwd())
print()

# Tentar /domains
paths = ["/", "/domains", "/domains/violet-ant-264237.hostingersite.com"]

for path in paths:
    try:
        ftp.cwd(path)
        print(f"[OK] {path}")
        print("  Conteudo:")
        for item in ftp.nlst()[:10]:
            print(f"    - {item}")
    except Exception as e:
        print(f"[ERRO] {path}: {e}")
    print()

ftp.quit()
