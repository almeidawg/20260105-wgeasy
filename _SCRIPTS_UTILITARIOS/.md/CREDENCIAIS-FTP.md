# Credenciais FTP - Sistema WG Easy

## Sistema WG Easy (easy.wgalmeida.com.br)
- **Host:** 147.93.64.151
- **Usuário:** u968231423.easy.wgalmeida.com.br
- **Senha:** WGEasy2026!
- **Diretório remoto:** /public_html
- **URL:** https://easy.wgalmeida.com.br

## Site WG Almeida (wgalmeida.com.br)
- **Host:** 147.93.64.151
- **Usuário:** u968231423.wgalmeida.com.br
- **Senha:** WGEasy2026!
- **Diretório remoto:** /public_html
- **URL:** https://wgalmeida.com.br

---

## Como fazer deploy

### Sistema WG Easy:
```bash
cd C:\Users\Atendimento\Documents\01VISUALSTUDIO_OFICIAL\sistema\wgeasy\frontend
npm run build
python deploy-ftp.py
```

### Site WG Almeida:
```bash
cd C:\Users\Atendimento\Documents\01VISUALSTUDIO_OFICIAL\site
npm run build
python deploy-ftp.py
```

---
**Última atualização:** 17/12/2024
