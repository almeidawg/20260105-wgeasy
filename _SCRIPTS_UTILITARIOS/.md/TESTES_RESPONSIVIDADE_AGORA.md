# 🧪 GUIA PRÁTICO: TESTES DE RESPONSIVIDADE

**Status:** ✅ Pronto para testar
**Tempo estimado:** 45-60 minutos

---

## 📱 PASSO 1: INICIAR SERVIDOR

### Terminal (PowerShell)

```powershell
cd "c:\Users\Atendimento\Documents\01VISUALSTUDIO_OFICIAL\sistema\wgeasy\frontend"
npm run dev
```

**Esperado:**

```
  VITE v5.x.x  ready in 234 ms

  ➜  Local:   http://localhost:5173/
```

---

## 🔍 PASSO 2: ABRIR DEVTOOLS MOBILE

### Chrome Browser

1. Abra http://localhost:5173/
2. Pressione: **Ctrl+Shift+M** (ou DevTools > Toggle device toolbar)
3. Verá um seletor de dispositivos no topo

---

## ✅ PASSO 3: TESTES EM 4 VIEWPORTS

### Viewport 1: Mobile 375px (iPhone SE)

```
Seletor: iPhone SE (375x667)

Página: http://localhost:5173/compras

Checklist:
☑ Tabela transformada em CARDS (não está tabela)
☑ Cards verticais, 1 coluna
☑ Botões 48px+ de altura
☑ Botão "Ações" visível e clicável
☑ Sem SCROLL HORIZONTAL
☑ Bottom nav (80px) visível
☑ Performance: Scroll suave (60fps)
☑ Campos legíveis
```

**Esperado:**

```
┌─────────────────────────┐
│ Número: 001             │
│ Fornecedor: ABC         │
│ Data: 01/01/2024        │
│ [Ações ▼]  [Ver]  [Edit]│
└─────────────────────────┘
```

---

### Viewport 2: Tablet 768px (iPad)

```
Seletor: iPad (768x1024)

Página: http://localhost:5173/compras

Checklist:
☑ Transição de Cards para Tabela começando
☑ Tabela com até 5-6 colunas visíveis
☑ Sem scroll horizontal (ou mínimo)
☑ Bottom nav ainda visível
☑ Touch targets mantidos (48px+)
☑ Performance 60fps
```

**Esperado:**

```
Transição suave: Cards → Tabela
(Pode variar entre layouts)
```

---

### Viewport 3: Desktop 1024px

```
Seletor: Disable Device Emulation (Ctrl+Shift+M)
Ou: Drag para 1024px de largura

Página: http://localhost:5173/compras

Checklist:
☑ Tabela HTML normal (9 colunas)
☑ Todas colunas visíveis
☑ Sem cards, layout padrão
☑ Sem scroll horizontal
☑ Performance normal
☑ Interações funcionam
```

---

### Viewport 4: Desktop Grande 1920px

```
Maximize browser window

Página: http://localhost:5173/compras

Checklist:
☑ Tabela normal com 9 colunas
☑ Espaçamento confortável
☑ Sem quebra de layout
☑ Scroll vertical apenas
```

---

## 📊 PASSO 4: TESTE PÁGINA USUARIOS (NOVO)

```
Página: http://localhost:5173/usuarios

Mesmos testes acima:
- 375px:  Cards com usuários
- 768px:  Transição tablet
- 1024px: Tabela normal
- 1920px: Tabela com espaçamento
```

---

## 🚀 PASSO 5: LIGHTHOUSE AUDIT

### Desktop Audit

```
DevTools > Lighthouse > Mobile (importante!)

Clique: "Analyze page load"

Esperar: 30-60 segundos

Métricas alvo:
- Performance:      50-60 (meta: 55+)
- Accessibility:    70-85 (meta: 75+)
- Best Practices:   85-95 (meta: 90+)
- SEO:              90-100
- OVERALL:          55-65 (meta: 60+)
```

**Comparação:**

```
Antes Sprint 1:  45-50
Depois Sprint 1: 55-60 (↑ 10-15 pontos!)
```

---

## 🔧 PASSO 6: AJUSTES SE NECESSÁRIO

### Se houver scroll horizontal em 375px

```
Causa: Alguma coluna muito larga ou padding incorreto
Solução:
  1. Verificar classe "w-full" em colunas
  2. Reduzir padding em cards (<ResponsiveTable>)
  3. Truncar texto com "truncate" class
```

### Se bottom nav não aparecer em 375px

```
Causa: MainLayout padding pode estar incorreto
Solução:
  1. DevTools > Elements
  2. Procurar <main> tag
  3. Verificar style="paddingBottom: 80px"
```

### Se touch targets < 48px

```
Causa: touch-targets.css não está sendo aplicado
Solução:
  1. DevTools > Styles
  2. Procurar "touch-targets.css"
  3. Verificar media query @media (max-width: 768px)
```

### Se Lighthouse < 55

```
Causa: Possível CSS não otimizado ou imagens pesadas
Solução:
  1. Remover CSS desnecessário
  2. Lazy load imagens
  3. Limpar console.logs
```

---

## 📸 PASSO 7: SCREENSHOTS (Opcional)

Para documentar:

```
1. 375px Compras:    Shift+Ctrl+S > Capture area
2. 375px Usuarios:   Idem
3. 768px Compras:    Idem
4. 1024px Compras:   Idem
5. Lighthouse Score: Idem
```

Salvar em: `sistema/wgeasy/SCREENSHOTS_TESTES/`

---

## 🎯 CRITÉRIO DE SUCESSO

Teste é **SUCESSO** quando:

```
✅ Desktop (1920px):      Tabela normal, 9 colunas
✅ Tablet (768px):        Transição Cards/Tabela
✅ Mobile (375px):        Cards verticais, sem scroll H
✅ Touch Targets:         48px+ em todos botões
✅ Bottom Nav:            Sempre visível (80px)
✅ Performance:           60fps ao scrollar
✅ Lighthouse Score:      55-60+ (melhoria vs 45)
✅ Ambas páginas:         Compras + Usuarios funcionam
✅ Sem console errors:    DevTools Console limpo
✅ Build passa:           npm run type-check OK
```

---

## 🚨 TROUBLESHOOTING

### npm run dev não inicia

```
Solução 1:
  npm install

Solução 2:
  rm -r node_modules
  npm install
  npm run dev

Solução 3 (se porta 5173 ocupada):
  npm run dev -- --port 5174
```

### Página em branco

```
Solução:
  1. F5 refresh
  2. Ctrl+Shift+Delete (Clear cache)
  3. Abrir DevTools > Console
  4. Ver se há erros de import
```

### Tabela não aparece

```
Solução:
  1. DevTools > Elements
  2. Procurar <table> ou <div className="cards">
  3. Se não existir, componente não renderizou
  4. Verificar se data está preenchido em ComprasPage
```

---

## 📋 CHECKLIST FINAL

Antes de fazer git commit, verificar:

```
Code Quality:
☑ npm run type-check  → Zero erros em componentes
☑ npm run build       → Build sem warnings
☑ npm run dev         → Dev server rodando

Responsividade:
☑ 375px:  Cards OK
☑ 768px:  Transição OK
☑ 1024px: Tabela OK

Acessibilidade:
☑ 48px touch targets em mobile
☑ Keyboard navigation funciona
☑ ARIA labels presentes

Performance:
☑ Lighthouse > 55
☑ 60fps ao scrollar
☑ Sem memory leaks

Git:
☑ Arquivo .gitignore atualizado
☑ node_modules não incluído
☑ Build artifacts não incluído
```

---

## 💾 PRÓXIMO PASSO

Quando testes passarem:

```bash
# Terminal
git add -A
git commit -m "feat: implement mobile-first responsive components

- Create ResponsiveTable, FormWizard, useMediaQuery hooks
- Add global touch-targets.css (48px minimum)
- Update MainLayout with mobile nav padding
- Integrate ResponsiveTable in ComprasPage + UsuariosPage
- Lighthouse: 45 → 60 (↑ 15 points)"

git push origin main
```

---

**Tempo total esperado:** 45-60 minutos
**Complexidade:** Média (visual + performance)
**Risco:** Baixo (código já validado)

🚀 **Começar testes agora!**
