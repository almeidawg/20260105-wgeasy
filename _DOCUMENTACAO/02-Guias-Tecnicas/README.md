# 🏢 WGEASY-SISTEMA

Pasta centralizada para todos os arquivos, scripts, documentação e recursos do **Sistema WG Easy** (ERP Principal).

## 📁 Estrutura

```
WGEASY-SISTEMA/
├── 01VISUALSTUDIO_OFICIAL/        ← Código-fonte principal (Visual Studio)
├── 04wgeasy-desktop/              ← Aplicação Desktop (Electron/similar)
├── 01WGeasy Sistema/              ← Projeto relacionado WG Easy
├── 20260103_LimpezaEasy/          ← Limpeza de dados/otimizações
├── wgeasy/                        ← Repositório Git principal
│
├── 📚 Documentação/
│   ├── Auditorias (*.md)
│   ├── Guias Técnicos (*.md)
│   ├── Sprints & Planning (*.md)
│   └── Resolução de Problemas (*.md)
│
├── 🛠️ Scripts/
│   ├── Deploy (*.py, *.ps1)
│   ├── Upload/FTP (*.py)
│   ├── Banco de Dados (*.sql)
│   └── Testes (*.py, *.sh)
│
└── 📊 Dados/
    ├── Auditoria (*.json)
    ├── Backups (*.json)
    └── Testes e Temp
```

## 🎯 Conteúdo Principal

### Código-Fonte
- **01VISUALSTUDIO_OFICIAL/** - Código principal do WG Easy em Visual Studio
- **04wgeasy-desktop/** - Versão desktop da aplicação
- **wgeasy/** - Repositório Git com histórico completo

### Documentação
Todos os arquivos `.md` relacionados a WG Easy:
- Guias de implementação
- Auditorias (autenticação, login, segurança)
- Sprints e planejamento
- Resoluções de problemas
- Documentação técnica

### Scripts e Automação
Scripts em Python, PowerShell e SQL:
- `deploy-*.py` - Deploy do sistema
- `upload-*.py` - Upload para servidor
- `test-*.py` - Testes automatizados
- `*.sql` - Scripts de banco de dados
- `executar-*.ps1` - Scripts de execução

### Dados e Backups
- `AUDITORIA_CLIENTES.json` - Dados de auditoria
- Arquivos temporários de testes
- Backups de dados

## 🚀 Como Usar

### Desenvolvimento
```bash
cd wgeasy
# Trabalhar com o repositório Git
```

### Deploy
```bash
python deploy-sistema-easy.py
# ou
python upload-sistema-easy.py
```

### Manutenção
```bash
# Executar SQL de manutenção
python executar_sql_direto.py
```

### Testes
```bash
python test-ftp-novo.py
python test-mobile-sprint1.sh
```

## 📋 Checklist de Localização

Procurando algo do WG Easy? Está aqui:

- ✅ **Código-fonte?** → Veja `01VISUALSTUDIO_OFICIAL/` ou `wgeasy/`
- ✅ **App Desktop?** → `04wgeasy-desktop/`
- ✅ **Como fazer deploy?** → Procure `GUIA_IMPLEMENTACAO_MELHORIAS.md`
- ✅ **Erro de autenticação?** → Veja `FIX_ERRO_400_LOGIN.md`
- ✅ **Script SQL?** → Procure `_*.sql`
- ✅ **Upload para servidor?** → `upload-*.py`
- ✅ **Teste de responsividade?** → `TESTES_RESPONSIVIDADE_AGORA.md`

## 🔑 Arquivos Importantes

| Arquivo | Propósito |
|---------|-----------|
| `COMECE_AQUI.md` | Ponto de entrada para novos dev |
| `DOCUMENTACAO.md` | Documentação geral do sistema |
| `GUIA_RAPIDO_AUTENTICACAO.md` | Como usar autenticação |
| `IMPLEMENTACAO_AUTENTICACAO_COMPLETA.md` | Implementar autenticação |
| `QUICK_START_AUTH.md` | Quick start de autenticação |
| `FIX_ERRO_400_LOGIN.md` | Solução de erros 400 |

## 🔄 Últimas Alterações

- 2026-01-04: Consolidação de todos os arquivos WG Easy nesta pasta
- Organização profissional de scripts, documentação e código

## 👥 Responsável

Equipe de Desenvolvimento WG Easy

## 🔒 Segurança

⚠️ **Atenção:**
- Credenciais em arquivos `.env` devem estar em `.gitignore`
- Scripts com dados sensíveis não devem estar no repositório público
- Senhas/tokens devem ser gerenciados com segurança

## 📞 Suporte

Para dúvidas sobre esta pasta ou arquivos:
1. Consulte a documentação pertinente
2. Verifique os guias em Markdown
3. Execute os scripts de teste
4. Entre em contato com a equipe de desenvolvimento

---

**Status:** ✅ Centralizado  
**Última atualização:** 2026-01-04  
**Versão:** 1.0
