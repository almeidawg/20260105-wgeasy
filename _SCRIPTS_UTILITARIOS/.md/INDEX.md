# 📁 ESTRUTURA PROFISSIONAL - GrupoWGAlmeida Sistema

## 📋 Visão Geral

Esta pasta foi reorganizada seguindo as melhores práticas de gestão de projetos e dados. A estrutura é clara, escalável e facilita a localização de arquivos e documentação.

---

## 📂 ESTRUTURA PRINCIPAL

### 🎯 `_PROJETOS_ATIVOS/`
Contém todos os projetos em desenvolvimento ativo da empresa.

- **01-WGeasy-Principal** - Sistema ERP principal WGeasy
  - Código-fonte da aplicação
  - Configurações específicas do projeto
  - Testes e validações

- **02-WGeasy-Desktop** - Aplicação desktop WGeasy
  - Código desktop/Electron
  - Builds compiladas
  - Recursos específicos desktop

- **03-Website-Oficial** - Website corporativo
  - HTML, CSS, JS
  - Assets e midia web
  - Configurações de hosting

---

### 📚 `_DOCUMENTACAO/`
Toda a documentação técnica e de negócio organizada por categoria.

- **01-Auditorias** - Relatórios de auditoria de sistemas
  - Auditoria de autenticação
  - Auditoria de login
  - Auditoria financeira
  - Auditoria de segurança

- **02-Guias-Tecnicas** - Guias e manuais técnicos
  - Guias de implementação
  - Guias de integração
  - Guias rápidos (Quick Start)
  - Documentação de APIs

- **03-Sprints-Planning** - Planejamento e entrega de sprints
  - Planos de sprint
  - Relatórios de conclusão
  - Roadmap técnico
  - Planning documentation

- **04-Resolucao-Problemas** - Soluções e correções
  - Fixes de erros específicos
  - Fluxos de aprovação
  - Guias de reset/recuperação
  - Manutenção corretiva

---

### 🛠️ `_SCRIPTS_UTILITARIOS/`
Scripts de automação organizados por linguagem.

- **Python/** - Scripts Python
  - Deploy scripts
  - Upload utilities
  - Testes automatizados
  - Utilitários FTP/SSH

- **PowerShell/** - Scripts Windows PowerShell
  - Deploy scripts
  - Gerenciamento de sistema
  - Automação de tarefas

- **SQL/** - Scripts de banco de dados
  - Queries de auditoria
  - Scripts de setup
  - Migrações de dados
  - Correções de dados

---

### 💾 `_DADOS/`
Dados, arquivos e backups do sistema.

- **Auditoria/** - Dados de auditoria exportados
  - Relatórios JSON
  - Logs de auditoria
  - Registros de eventos

- **Extratos-Financeiros/** - Documentos financeiros
  - Extratos bancários
  - Planilhas de reconciliação
  - Arquivos de faturamento

- **Backups/** - Backups de dados e código
  - Backups de banco de dados
  - Snapshots de código
  - Histórico de versões

- **Temp/** - Arquivos temporários
  - Arquivos em processamento
  - Testes temporários
  - Cache limpo periodicamente

- **Midia/** - Arquivos de mídia
  - Imagens
  - PDFs
  - Vídeos
  - Documentos

---

### 🔧 `_DESENVOLVIMENTO/`
Arquivos técnicos de desenvolvimento e deployment.

- **Config-Environments/** - Configurações de ambientes
  - .env files
  - Config por staging/production
  - Secrets locais

- **Database/** - Arquivos de banco de dados
  - Dumps SQL
  - Migrações
  - Esquemas

- **Deploy-Scripts/** - Scripts de deployment
  - Deploy para produção
  - Deploy para staging
  - CI/CD pipelines

- **Testes/** - Arquivos de teste
  - Testes de funcionalidade
  - Testes de responsividade
  - Test reports

---

### 🔐 `_ADMIN/`
Arquivos administrativos e de gestão.

- **Credenciais-Acesso/** - Informações de acesso
  - Senhas criptografadas
  - Chaves de API
  - Tokens de autenticação
  - *⚠️ PROTEGER COM GIT IGNORE*

- **Modelos-Office/** - Templates corporativos
  - Modelos Word
  - Modelos Excel
  - Templates de documentos

- **Cronograma-Projetos/** - Planejamento de projetos
  - Calendários
  - Timelines
  - Milestones
  - Cronogramas

---

### 📦 `00_ARQUIVOS_RAIZ_BACKUP/`
Backup dos arquivos originais da raiz (antes da reorganização).
- Manter por segurança por 30 dias, depois arquivar ou deletar.

---

### 🚫 PASTAS MANTIDAS (Referência)
Pastas do sistema mantidas como estão:
- `.cloudflared/` - Configuração Cloudflare
- `.git/` - Repositório Git
- `.github/` - Workflows GitHub
- `.vscode/` - Configurações VS Code
- `Backup/` - Backups históricos
- `FeedbackHub/` - Hub de feedback
- `Robos IA/` - Bots/automações IA
- `WindowsPowerShell/` - Perfil PowerShell

---

## 📌 CONVENÇÕES E PADRÕES

### Nomenclatura de Arquivos
- ✅ Use hífens para separar palavras: `deploy-producao.py`
- ✅ Use datas no formato YYYY-MM-DD: `2026-01-04_relatorio.md`
- ✅ Use nomes descritivos e em inglês para código
- ✅ Use nomes em português para documentação

### Padrão de Subpastas
```
Categoria/
├── 01-Item-Principal/
├── 02-Item-Secundario/
└── README.md (explicação da categoria)
```

### .gitignore Recomendado
```
# Credenciais e secrets
_ADMIN/Credenciais-Acesso/
.env
.env.local

# Temporários
_DADOS/Temp/
*.tmp
*.log

# Backups automáticos
_DADOS/Backups/*.sql.gz
```

---

## 🚀 PRÓXIMAS AÇÕES

1. **Mover arquivos existentes** para suas novas localizações
2. **Criar README.md** em cada subpasta com detalhes específicos
3. **Configurar .gitignore** para pastas sensíveis
4. **Documentar acesso** para novos membros da equipe
5. **Automatizar backups** das pastas críticas

---

## 📞 CONTATO E SUPORTE

Para dúvidas sobre a estrutura:
- Verifique o README da pasta específica
- Consulte a documentação em `_DOCUMENTACAO/`
- Entre em contato com o administrador do projeto

---

**Última atualização:** 2026-01-04
**Versão:** 1.0
**Status:** ✅ Estrutura implantada
