# 🚀 GUIA RÁPIDO - Migração para Nova Estrutura

## Status: ✅ ESTRUTURA CRIADA

As novas pastas foram criadas. Agora você pode começar a organizar seus arquivos.

---

## 📋 CHECKLIST DE MIGRAÇÃO

### Fase 1: Documentação
- [ ] Mover arquivos `*.md` com "AUDITORIA" → `_DOCUMENTACAO/01-Auditorias/`
- [ ] Mover arquivos `*.md` com "GUIA", "QUICK_START", "IMPLEMENTACAO" → `_DOCUMENTACAO/02-Guias-Tecnicas/`
- [ ] Mover arquivos `*.md` com "SPRINT", "PLANO", "ROADMAP" → `_DOCUMENTACAO/03-Sprints-Planning/`
- [ ] Mover arquivos `*.md` com "SOLUCAO", "FIX", "PROBLEMA" → `_DOCUMENTACAO/04-Resolucao-Problemas/`

### Fase 2: Scripts
- [ ] Mover `*.py` → `_SCRIPTS_UTILITARIOS/Python/`
- [ ] Mover `*.ps1` → `_SCRIPTS_UTILITARIOS/PowerShell/`
- [ ] Mover `*.sql` → `_SCRIPTS_UTILITARIOS/SQL/`

### Fase 3: Dados
- [ ] Mover `*.json` (auditoria) → `_DADOS/Auditoria/`
- [ ] Mover `*.xlsx` (extratos) → `_DADOS/Extratos-Financeiros/`
- [ ] Arquivos temporários → `_DADOS/Temp/` (com data de expiração)
- [ ] Backups antigos → `_DADOS/Backups/`

### Fase 4: Desenvolvimento
- [ ] Mover `.env*`, `config.*` → `_DESENVOLVIMENTO/Config-Environments/`
- [ ] Mover `database/` → `_DESENVOLVIMENTO/Database/`
- [ ] Mover scripts de deploy → `_DESENVOLVIMENTO/Deploy-Scripts/`
- [ ] Mover testes → `_DESENVOLVIMENTO/Testes/`

### Fase 5: Administração
- [ ] Mover senhas/credenciais → `_ADMIN/Credenciais-Acesso/`
- [ ] Mover modelos Office → `_ADMIN/Modelos-Office/`
- [ ] Mover cronogramas → `_ADMIN/Cronograma-Projetos/`

### Fase 6: Finalização
- [ ] Backup dos arquivos originais em `00_ARQUIVOS_RAIZ_BACKUP/`
- [ ] Deletar `00_ARQUIVOS_RAIZ_BACKUP/` (após 30 dias)
- [ ] Atualizar `.gitignore` para pastas sensíveis
- [ ] Criar `README.md` em cada pasta principal
- [ ] Comunicar equipe sobre nova estrutura

---

## 🎯 Arquivos para Movimentar (Exemplos)

### Documentação de Auditoria
```
AUDITORIA_AUTH_400.md → _DOCUMENTACAO/01-Auditorias/
AUDITORIA_LOGINPAGE.md → _DOCUMENTACAO/01-Auditorias/
AUDITORIA_SITE_WG_ALMEIDA.md → _DOCUMENTACAO/01-Auditorias/
DIAGNOSTICO_LOGIN_400.md → _DOCUMENTACAO/04-Resolucao-Problemas/
```

### Guias Técnicos
```
GUIA_IMPLEMENTACAO_MELHORIAS.md → _DOCUMENTACAO/02-Guias-Tecnicas/
GUIA_RAPIDO_AUTENTICACAO.md → _DOCUMENTACAO/02-Guias-Tecnicas/
QUICK_START_AUTH.md → _DOCUMENTACAO/02-Guias-Tecnicas/
IMPLEMENTACAO_AUTENTICACAO_COMPLETA.md → _DOCUMENTACAO/02-Guias-Tecnicas/
```

### Sprints e Planning
```
GIT_WORKFLOW_SPRINT1.md → _DOCUMENTACAO/03-Sprints-Planning/
SPRINT1_ENTREGA_FINAL.md → _DOCUMENTACAO/03-Sprints-Planning/
SPRINT2_CONCLUSAO.md → _DOCUMENTACAO/03-Sprints-Planning/
SPRINT5_PLANO.md → _DOCUMENTACAO/03-Sprints-Planning/
```

### Scripts Python
```
deploy-sistema-easy.py → _SCRIPTS_UTILITARIOS/Python/
upload-ftp.py → _SCRIPTS_UTILITARIOS/Python/
test-ftp-novo.py → _SCRIPTS_UTILITARIOS/Python/
analyze_audit.py → _SCRIPTS_UTILITARIOS/Python/
```

### Scripts SQL
```
ATIVAR_USUARIOS_LOGIN.sql → _SCRIPTS_UTILITARIOS/SQL/
ATUALIZAR_DARCIO_UUID.sql → _SCRIPTS_UTILITARIOS/SQL/
CRIAR_APROVACOES_PENDENTES.sql → _SCRIPTS_UTILITARIOS/SQL/
DELETAR_E_RECRIAR_DARCIO.sql → _SCRIPTS_UTILITARIOS/SQL/
```

### Dados
```
AUDITORIA_CLIENTES.json → _DADOS/Auditoria/
EXTRATO_UNIFICADO_GRUPO_WG.xlsx → _DADOS/Extratos-Financeiros/
ARQ-Extrato_BTG_WGeasy_Financeiro.xlsx → _DADOS/Extratos-Financeiros/
```

---

## 📌 Estrutura Recomendada para Projetos

Dentro de `_PROJETOS_ATIVOS/01-WGeasy-Principal/`:
```
01-WGeasy-Principal/
├── src/              (código-fonte)
├── tests/            (testes)
├── docs/             (documentação específica)
├── config/           (configurações)
├── public/           (arquivos públicos)
├── package.json
├── README.md
└── .git
```

---

## 🔐 Configurar .gitignore

Adicione ao `.gitignore`:
```gitignore
# Admin e Credenciais
_ADMIN/Credenciais-Acesso/
_ADMIN/**/*.enc

# Desenvolvimento
_DESENVOLVIMENTO/Config-Environments/.env*
_DESENVOLVIMENTO/Config-Environments/*.key
_DESENVOLVIMENTO/Config-Environments/*.secret

# Dados sensíveis
_DADOS/Backups/**/*.sql
_DADOS/Temp/

# Logs e cache
*.log
*.tmp
.DS_Store
Thumbs.db

# IDE
.vscode/*
.cursor/*
.idea/
*.swp
*.swo

# Node modules e dependências
node_modules/
*.egg-info/
__pycache__/
```

---

## 💡 Dicas Profissionais

### 1. Documentar Tudo
Crie um `README.md` em cada pasta importante:
```markdown
# [Nome da Pasta]
Descrição breve do que contém.

## Estrutura
- Arquivo 1: Descrição
- Arquivo 2: Descrição

## Como usar
Passo a passo de como usar os arquivos.
```

### 2. Versionamento
Prefixe arquivos temporários com data:
```
2026-01-04_relatorio-auditoria.md
2026-01-04_teste-desempenho.json
```

### 3. Backups
Crie backup do estado anterior:
```powershell
# Windows
xcopy "00_ARQUIVOS_RAIZ_BACKUP" "Backup/backup-2026-01-04" /E /I
```

### 4. Automação
Use scripts para mover arquivos automaticamente:
```python
# Exemplo: script para mover arquivos .md com "AUDITORIA"
import os
import shutil

origem = "."
destino = "_DOCUMENTACAO/01-Auditorias"

for arquivo in os.listdir(origem):
    if "AUDITORIA" in arquivo.upper() and arquivo.endswith(".md"):
        shutil.move(arquivo, os.path.join(destino, arquivo))
        print(f"Movido: {arquivo}")
```

---

## ✅ Após Completar a Migração

1. **Teste a estrutura**
   - Encontre um arquivo: Consegue rapidamente?
   - Crie novo projeto: Usa a estrutura corretamente?

2. **Comunique à equipe**
   - Compartilhe INDEX.md e STRUCTURE.txt
   - Treine novos membros
   - Documente convenções

3. **Automatize**
   - Configure scripts para manter organização
   - Implemente CI/CD aware of nova estrutura
   - Crie hooks Git para validação

4. **Monitore**
   - Verifique regularmente se novos arquivos seguem padrão
   - Arquive dados antigos periodicamente
   - Revise e atualize documentação

---

## 🆘 Dúvidas Frequentes

**P: Onde coloco um arquivo que serve para múltiplos projetos?**
R: Em `_SCRIPTS_UTILITARIOS/` ou `_DOCUMENTACAO/`, dependendo do tipo.

**P: E se não tenho projeto novo ainda?**
R: Use `_PROJETOS_ATIVOS/00-Template-Baseline` como referência.

**P: Como proteger credenciais?**
R: Coloque em `_ADMIN/Credenciais-Acesso/` e adicione ao `.gitignore`.

**P: Preciso manter a pasta antiga?**
R: Sim, por 30 dias em `00_ARQUIVOS_RAIZ_BACKUP/`, depois archive.

---

## 📞 Próximas Ações

1. ✅ Estrutura criada
2. ⏳ **Migrar arquivos existentes** (em andamento)
3. 📝 Criar README em cada pasta
4. 🔐 Configurar .gitignore
5. 👥 Comunicar à equipe
6. 🚀 Implementar CI/CD aware da nova estrutura

---

**Status:** Pronto para migração
**Última atualização:** 2026-01-04
**Versão:** 1.0
