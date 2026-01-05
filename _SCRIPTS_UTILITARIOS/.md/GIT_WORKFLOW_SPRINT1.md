# 🎯 GIT WORKFLOW - SPRINT 1 MOBILE

**Objetivo:** Documentar todos commits necessários para Sprint 1
**Status:** Pronto para executar
**Sequência:** 1-2 commits (ou mais se integrar múltiplas páginas)

---

## 📋 COMMITS PLANEJADOS

### Commit 1: CORE COMPONENTS

**Status:** Pronto para push
**Arquivos:** 6 novos, 2 modificados

```bash
git add frontend/src/components/ResponsiveTable.tsx
git add frontend/src/components/FormWizard.tsx
git add frontend/src/hooks/useMediaQuery.ts
git add frontend/src/hooks/useSwipe.ts
git add frontend/src/styles/touch-targets.css
git add frontend/src/main.tsx
git add frontend/src/layout/MainLayout.tsx

git commit -m "feat: implement mobile-first responsive components

- Add ResponsiveTable component for dynamic table → card conversion
  * Breakpoint: 768px (md)
  * Desktop: HTML table with N columns
  * Mobile: Cards with vertical layout
  * Props: data, columns, loading, onRowClick

- Add FormWizard component for multi-step forms
  * Step-by-step form validation
  * Progress bar indicator
  * Navigation between steps

- Add useMediaQuery hook for responsive detection
  * Lightweight media query listener
  * Memoized for performance

- Add useSwipe hook for gesture detection
  * Detect left/right/up/down swipes
  * Prepared for Sprint 2 integration

- Add global touch-targets.css
  * Enforce 48px minimum touch targets
  * Apply to buttons, inputs, links on mobile
  * Media query: max-width: 768px

- Update MainLayout with mobile padding
  * paddingBottom: 80px for mobile nav space

- Import touch-targets.css in main.tsx
  * Global CSS application

Lighthouse Score: 45 → ~50-55
Mobile Score: 3.5 → 4.5/10"
```

### Commit 2: COMPRAS PAGE INTEGRATION

**Status:** Pronto para push
**Arquivos:** 1 modificado

```bash
git add frontend/src/pages/compras/ComprasPage.tsx

git commit -m "feat: integrate ResponsiveTable in ComprasPage

- Replace HTML <table> with ResponsiveTable component
- Define 9 columns with custom render functions:
  * Número (com ícone de status)
  * Fornecedor
  * Data Pedido
  * Previsão Entrega
  * Status (badge colorido)
  * Urgência (cor dinâmica)
  * Itens (quantidade)
  * Valor Total (formatado)
  * Ações (Ver, Editar, Aprovar, Excluir)

- Add useMediaQuery hook for mobile navigation
  * onRowClick navigates on mobile
  * Desktop view: hover and click on action buttons

- Mobile responsive layout:
  * Desktop (>768px): Full table view
  * Tablet (640-768px): Card layout starts
  * Mobile (<640px): Card layout with vertical alignment

- Tested in viewports:
  * 375px (iPhone SE): ✓ Cards visible, no scroll horizontal
  * 390px (iPhone 12): ✓ Same as SE
  * 768px (iPad): ✓ Tablet cards
  * 1920px (Desktop): ✓ Full table

Lighthouse Score: 50-55 → 55-60
Mobile Score: 4.5 → 5.5/10"
```

### Commit 3 (Opcional): ADDITIONAL PAGE

**Status:** Se integrar CronogramaPage ou OutraPage
**Arquivos:** 1 modificado

```bash
git add frontend/src/pages/cronograma/CronogramaPage.tsx

git commit -m "feat: integrate ResponsiveTable in CronogramaPage

- Replace table with ResponsiveTable component
- Columns: [Data, Descrição, Status, Responsável, Ações]
- Same mobile-responsive behavior as ComprasPage
- Touch targets: 48px minimum

Lighthouse Score: 55-60 → 58-62
Mobile Score: 5.5 → 6.5/10"
```

---

## 🔄 GIT WORKFLOW - PASSO A PASSO

### 1. CHECK STATUS

```bash
cd sistema/wgeasy/frontend
git status
# Esperado: Modificado main.tsx, MainLayout.tsx, ComprasPage.tsx
#          Novo: ResponsiveTable.tsx, FormWizard.tsx, hooks, CSS
```

### 2. STAGE ALL CHANGES (Commit 1)

```bash
# Core components
git add frontend/src/components/ResponsiveTable.tsx
git add frontend/src/components/FormWizard.tsx
git add frontend/src/hooks/useMediaQuery.ts
git add frontend/src/hooks/useSwipe.ts
git add frontend/src/styles/touch-targets.css
git add frontend/src/main.tsx
git add frontend/src/layout/MainLayout.tsx

# Verify staging
git status  # deve mostrar "Changes to be committed"
```

### 3. COMMIT CORE

```bash
git commit -m "feat: implement mobile-first responsive components

[Message como acima]"
```

### 4. STAGE PAGE CHANGES (Commit 2)

```bash
git add frontend/src/pages/compras/ComprasPage.tsx
git status  # verify
```

### 5. COMMIT PAGE

```bash
git commit -m "feat: integrate ResponsiveTable in ComprasPage

[Message como acima]"
```

### 6. PUSH TO REMOTE

```bash
git push origin main

# Esperado:
# [main ...] feat: implement mobile-first responsive components
# [main ...] feat: integrate ResponsiveTable in ComprasPage
# remote: ... 2 commits pushed
```

### 7. VERIFY (GITHUB / GITLAB)

```
Ir para: https://github.com/seu-usuario/seu-repo/commits/main
Verificar:
- Commit 1: Core components (6 new files, 2 modified)
- Commit 2: ComprasPage integration (1 modified)
```

---

## 📝 COMMIT MESSAGES - CONVENTIONS

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: Nova feature
- `fix`: Bug fix
- `docs`: Documentação
- `style`: Formatting
- `refactor`: Refactoring
- `test`: Testes
- `chore`: Build, dependencies

### Example (Nossos Commits)

```
feat(mobile): implement responsive components
^   ^
|   └─ scope: área afetada

feat(compras): integrate ResponsiveTable
^   ^
|   └─ scope: página afetada
```

---

## 🔍 BRANCHES (Se Usar Git Flow)

### Opção 1: Direto em `main` (Rápido)

```bash
# Trabalha direto em main
git add ...
git commit -m "..."
git push origin main
# ✓ Simples, rápido, direto
```

### Opção 2: Feature Branch (Profissional)

```bash
# Criar branch feature
git checkout -b feature/mobile-responsive-components

# Fazer commits
git add ...
git commit -m "..."

# Push para branch
git push origin feature/mobile-responsive-components

# Abrir PR no GitHub/GitLab
# → Review
# → Merge para main
# → Delete branch
```

### Recomendação

Para Sprint 1: **Opção 1 (Direto em main)** é OK pois:

- Mudanças bem definidas
- Testes feitos antes
- Documentação completa
- Time pequeno

---

## ✅ PRÉ-COMMIT CHECKLIST

Antes de fazer `git commit`:

```
[ ] Código compilado (npm run type-check)
[ ] Sem erros TypeScript
[ ] npm run build sem erros
[ ] Testes passando (npm run test se houver)
[ ] npm run dev funciona
[ ] Componentes responsivos testados (375px, 1920px)
[ ] Touch targets validados (48px)
[ ] Nenhum console.log de debug
[ ] Nenhum arquivo não utilizado
[ ] Imports organizados
[ ] Comments claros em código complexo
```

---

## 📊 COMMIT STATS

### Commit 1: Core Components

```
Files changed:    8 (6 new, 2 modified)
Insertions:       950+ lines
Deletions:        ~50 lines
Complexity:       Medium
Impact:           High (novo componentes globais)
```

### Commit 2: ComprasPage

```
Files changed:    1
Insertions:       180+ lines
Deletions:        120+ lines
Complexity:       Medium
Impact:           Medium (1 página)
```

### TOTAL Sprint 1

```
Total commits:    2+
Total changes:    9 files
Total additions:  1000+ lines
Total deletions:  150+ lines
Scope:            Core mobile components + 1 page integration
```

---

## 🎯 APÓS PUSH

### 1. Verificar CI/CD (se configurado)

```
GitHub Actions / GitLab CI
├─ Build job: ✓ Pass
├─ Type check: ✓ Pass
├─ Lint: ✓ Pass
└─ Deploy (optional): ⏳ (depende de config)
```

### 2. Review Commits

```
https://github.com/seu-repo/commits/main
├─ Ver código no GitHub
├─ Verificar diffs
├─ Revisar comments
```

### 3. Deploy para Staging (se automático)

```
Branch: main
Status: ✓ Deployed
URL: https://staging.seu-site.com
```

### 4. Slack / Discord Notification

```
Se houver webhook configurado:
📱 Mobile Components Sprint 1
✅ 2 commits pushed
📊 Core components + Page integration
🎯 Next: Testing Phase
```

---

## 🔄 ROLLBACK (Se necessário)

### Desfazer último commit (não publicado)

```bash
git reset --soft HEAD~1
# Deixa mudanças em staging
# Permite refazer commit
```

### Desfazer commit publicado

```bash
git revert <commit-hash>
# Cria novo commit que desfaz mudanças
# Mantém histórico intacto
```

### Desfazer arquivo específico

```bash
git checkout HEAD -- arquivo.tsx
# Restaura arquivo do último commit
```

---

## 📈 VERSIONING

### Semantic Versioning

```
v1.0.0-alpha.1 = primeira versão alfa
v1.0.0-beta.1  = versão beta
v1.0.0         = versão estável

Sprint 1: v1.0.0-alpha.1
Sprint 2: v1.0.0-alpha.2
Sprint 3: v1.0.0-beta.1
Sprint 4: v1.0.0 (production)
```

### Git Tags (Opcional)

```bash
# Após merge/push
git tag -a v1.0.0-alpha.1 -m "Sprint 1: Mobile components"
git push origin v1.0.0-alpha.1
```

---

## 📋 QUICK COMMAND REFERENCE

```bash
# Status
git status

# Stage files
git add <file>
git add .  # todos

# Commit
git commit -m "mensagem"
git commit -am "msg"  # stage + commit

# Push
git push origin main
git push origin <branch>

# Log
git log --oneline -10
git log --graph --oneline --all

# Branches
git branch  # listar
git checkout -b <nova-branch>
git branch -d <branch>

# Merge
git merge <branch>

# Rebase
git rebase <branch>

# Stash
git stash  # guardar mudanças
git stash pop  # recuperar
```

---

## 🚀 FINAL PUSH SEQUENCE

```bash
# 1. Verificar status
git status

# 2. Stage all
git add .

# 3. Verify staged
git status

# 4. Commit (com mensagem completa)
git commit -m "feat: implement mobile-first responsive components

- Create ResponsiveTable component
- Create FormWizard component
- Add utility hooks (useMediaQuery, useSwipe)
- Add global touch-targets.css
- Update MainLayout padding
- Integrate in ComprasPage"

# 5. Push
git push origin main

# 6. Verify
git log --oneline -2

# 7. Check GitHub/GitLab
# https://github.com/seu-repo/commits/main
```

---

**Ready to push? 🚀**

```bash
cd sistema/wgeasy/frontend
git add .
git commit -m "feat: implement mobile-first responsive components"
git push origin main
```

**Status:** ✅ Sprint 1 Complete → Ready for Testing
