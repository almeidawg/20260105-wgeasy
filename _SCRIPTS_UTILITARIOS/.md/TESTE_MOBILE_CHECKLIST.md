# 📱 CHECKLIST DE TESTES MOBILE - SPRINT 1

## 🎯 Objetivo

Validar implementação de componentes mobile-responsivos em produção

**Status:** ✅ Componentes criados e integrados
**Data:** Jan 1, 2026
**Responsável:** Testing Phase

---

## 🚀 PRÉ-TESTE (Setup)

### 1. Start Development Server

```bash
# Terminal 1: Frontend
cd sistema/wgeasy/frontend
npm install  # Se necessário
npm run dev
# Esperado: http://localhost:5173
```

### 2. Abre DevTools Mobile

```
Chrome: Ctrl+Shift+M  (ou Cmd+Shift+M no Mac)
Firefox: Ctrl+Shift+M (ou Cmd+Option+M no Mac)
```

### 3. Viewports para Testar

- **iPhone SE (375px)** - Menor viewport
- **iPhone 12 (390px)** - Padrão moderno
- **iPad Air (768px)** - Breakpoint Tailwind
- **Desktop (1920px)** - Validação horizontal

---

## ✅ TESTE 1: COMPONENTES RESPONSIVOS

### 1.1 ResponsiveTable em ComprasPage

**Acesso:** `http://localhost:5173/compras`

#### Desktop View (>768px)

- [ ] Tabela exibe com 9 colunas
- [ ] Headers: Número | Fornecedor | Data Pedido | Previsão | Status | Urgência | Itens | Valor | Ações
- [ ] Dados visualizáveis sem scroll horizontal
- [ ] Hover effect em linhas (background cinza claro)
- [ ] Links "Ver", "Editar" são clicáveis

#### Mobile View (<768px)

- [ ] Tabela convertida em CARDS
- [ ] Cada card ocupa 100% da largura
- [ ] Card tem padding adequado (16px)
- [ ] Card tem border e sombra
- [ ] Dados organizados verticalmente (label: valor)
- [ ] Botões de ação em coluna (flex-col)
- [ ] Scroll vertical suave sem scroll horizontal

#### Card Mobile Details

```
┌─────────────────────┐
│ Número: 001 🏢     │
│ Fornecedor: ABC     │
│ Data: 01/01/2026   │
│ Previsão: 05/01    │
│ Status: [Pendente]  │
│ Urgência: Normal    │
│ Itens: 5            │
│ Valor: R$ 1.234,56  │
│ [Ver] [Editar]      │
│ [Aprovar] [Excluir] │
└─────────────────────┘
```

### 1.2 MobileBottomNav

**Visualize em qualquer página**

#### Desktop (>768px)

- [ ] Bottom nav NÃO aparece (display: none)
- [ ] Conteúdo usa 100% da altura

#### Mobile (<768px)

- [ ] Bottom nav visível na base
- [ ] Altura: 80px (80px padding-bottom em main)
- [ ] 5 ícones principais + "Mais"
  - Dashboard
  - Compras
  - Contratos
  - Financeiro
  - Perfil
  - Mais (menu adicional)
- [ ] Clique em ícones navega corretamente
- [ ] "Mais" abre drawer com itens extras

---

## ✅ TESTE 2: TOUCH TARGETS (48px Mínimo)

### 2.1 Inspecionar Elemento

**Browser DevTools > Inspect Element**

#### Verificar Buttons

1. Abra ComprasPage em mobile (375px)
2. Click direito em qualquer botão
3. Inspect > Computed Styles
4. Verificar:
   - [ ] `min-width: 48px`
   - [ ] `min-height: 48px`
   - [ ] `padding: 12px` (mínimo)

#### Targets to Check

- [ ] "Novo Pedido" botão (header)
- [ ] "Ver" link (card action)
- [ ] "Editar" link (card action)
- [ ] "Aprovar" button (card action)
- [ ] Filter buttons (Todos, Pendentes, etc.)
- [ ] Bottom nav icons

#### CSS Applied

```css
/* touch-targets.css - Verificar se aplicado */
button,
a,
[role="button"],
input,
select {
  min-width: 48px;
  min-height: 48px;
  padding: 12px;
}
```

---

## ✅ TESTE 3: RESPONSIVIDADE POR BREAKPOINT

### 3.1 iPhone SE (375px)

```
Size: 375 x 667
Header: 1 coluna
Cards: Empilhadas verticalmente
Actions: Em coluna
Nav: Bottom nav 80px
```

- [ ] Sem scroll horizontal
- [ ] Conteúdo centralizado
- [ ] Botões alinhados
- [ ] Bottom nav visível
- [ ] Padding bottom = 80px aplicado

### 3.2 iPhone 12 (390px)

```
Size: 390 x 844
Header: Layout idêntico a SE
Cards: Mesmo layout SE
Actions: Em coluna
```

- [ ] Idêntico ao SE (mesmo breakpoint)
- [ ] Nenhuma scrollbar horizontal

### 3.3 iPad Air (768px)

```
Size: 768 x 1024
Header: 2 colunas
Cards: Podem ser lado-a-lado
Actions: Em linha (inline)
Nav: Escondida
```

- [ ] Transição tablet começada
- [ ] Bottom nav começa a sumir
- [ ] Pode mostrar 2 cards por linha

### 3.4 Desktop (1920px)

```
Size: 1920 x 1080
Tabela: 9 colunas visíveis
Header: Inline buttons
Actions: Todos visíveis
```

- [ ] Tabela completa sem cards
- [ ] Desktop experience normal
- [ ] Nenhum mobile styling

---

## ✅ TESTE 4: GESTOS E INTERATIVIDADE

### 4.1 Swipe Gesture (Preparação)

**Nota:** ResponsiveTable ainda não tem swipe. Será Sprint 2.

- [ ] Preparado para adicionar useSwipe hook depois

### 4.2 Touch Interactions

- [ ] Tap botão = ativa corretamente
- [ ] Double-tap card = funciona sem zoom
- [ ] Long-press = sem comportamento padrão quebrado

### 4.3 Clicks & Navigation

Em mobile (375px):

- [ ] Click "Ver" em card navega para `/compras/{id}`
- [ ] Click "Novo Pedido" navega para `/compras/novo`
- [ ] Click icon bottom nav = navegação funciona
- [ ] Back button = retorna corretamente

---

## ✅ TESTE 5: ESTILO E UX

### 5.1 Cores & Contrast

- [ ] Status badges visíveis em mobile (contraste adequado)
- [ ] Texto legível (tamanho >14px em mobile)
- [ ] Links diferenciados de texto normal
- [ ] Urgência color coding visível

### 5.2 Performance

- [ ] Página carrega em <2s
- [ ] Scroll suave (60fps)
- [ ] Sem lag ao clicar botões
- [ ] Dev Tools > Performance > 60fps maintained

### 5.3 Layout Adjustment

- [ ] Não há content cutoff no mobile
- [ ] Margins & padding apropriados
- [ ] Sem espaço branco excessivo
- [ ] Safe area respeitada (notch devices)

---

## ✅ TESTE 6: LOADING STATES

### 6.1 ComprasPage Loading

1. Abra `http://localhost:5173/compras` em mobile
2. Antes de dados carregar:
   - [ ] Exibe texto "Carregando pedidos de compra..."
   - [ ] Loading display centralizado
   - [ ] Não quebra layout

### 6.2 Empty State

1. Filtre pedidos (ex: Status = "Entregues")
2. Se sem dados:
   - [ ] Exibe "Nenhum pedido encontrado."
   - [ ] Mensagem centralizada
   - [ ] Sugestão clara

---

## ✅ TESTE 7: BROWSER COMPATIBILITY

### Chrome DevTools

- [ ] Teste em Chrome Latest
- [ ] Teste em Chrome Mobile Emulation
- [ ] F12 > Responsive Design Mode

### Firefox Developer

- [ ] Teste em Firefox Latest
- [ ] Responsive Design Mode (Ctrl+Shift+M)

### Safari (se Mac)

- [ ] Teste em Safari
- [ ] Responsive Design Mode

---

## 📊 TESTE 8: LIGHTHOUSE AUDIT

### Run Audit

1. Open DevTools (F12)
2. Click "Lighthouse" tab
3. Click "Analyze page load"
4. Select "Mobile"

### Expected Scores (Sprint 1)

```
Performance: 50-60
Accessibility: 70-80
Best Practices: 80-90
SEO: 90-100
OVERALL: 65-75 (Aceitável)
```

**Target:** Melhorar de 45 → 60

### Common Issues to Fix

- [ ] Image optimization (próxima sprint)
- [ ] Lazy loading (próxima sprint)
- [ ] Critical CSS (já aplicado)

---

## 🐛 TESTE 9: DEBUGGING

### Common Issues & Fixes

#### Problema: Bottom nav não visível

```bash
# Check em MainLayout.tsx
# Deve ter: paddingBottom: '80px'
# Check em MobileBottomNav.tsx: display: none em mobile
```

#### Problema: Cards não aparecem em mobile

```bash
# Check ResponsiveTable.tsx
# useMediaQuery deve retornar true (<768px)
# Renderização condicional em componente
```

#### Problema: Touch targets <48px

```bash
# Verificar se touch-targets.css importado em main.tsx
# import '@/styles/touch-targets.css'
# Usar DevTools Inspect para verificar estilos aplicados
```

#### Problema: Scroll horizontal indesejado

```bash
# Verificar: overflow-x: hidden no container
# Cards devem ter: width: 100%
# Não usar fixed widths que excedem viewport
```

### DevTools Console

```javascript
// Verificar se hooks funcionam
// Abrir Console tab
console.log(useMediaQuery("(max-width: 768px)")); // deve retornar true/false
```

---

## 🎬 TESTE 10: RECORDING & VALIDATION

### Screenshot Checklist

Tire screenshots em 3 viewports:

#### 375px (iPhone SE)

- [ ] Compras Page card layout
- [ ] Bottom nav visível
- [ ] Botões alinhados
- **Salvar:** `screenshots/mobile-375.png`

#### 768px (iPad)

- [ ] Transição tablet começada
- [ ] 2 cards por linha (opcional)
- **Salvar:** `screenshots/tablet-768.png`

#### 1920px (Desktop)

- [ ] Tabela completa 9 colunas
- [ ] Sem mobile styling
- **Salvar:** `screenshots/desktop-1920.png`

### Video Recording

1. Open DevTools > Console
2. Press F12 > Three dots > More tools > Recorder
3. Record user flow:
   - [ ] Load page
   - [ ] Scroll cards
   - [ ] Click action button
   - [ ] Navigate to detail page
4. Replay & validate smoothness

---

## ✅ TESTE 11: CROSS-BROWSER

### Chrome

- [ ] Desktop (1920px) ✓
- [ ] Mobile Emulation (375px) ✓
- [ ] Tablet Emulation (768px) ✓

### Firefox

- [ ] Desktop (1920px) ✓
- [ ] Responsive Mode (375px) ✓
- [ ] Responsive Mode (768px) ✓

### Safari (Mac only)

- [ ] Desktop (1920px) ✓
- [ ] Responsive Mode (375px) ✓

---

## 🚀 TESTE 12: PERFORMANCE

### Metrics to Check

#### First Contentful Paint (FCP)

- [ ] <1.5s on mobile (Fast)
- [ ] <1.0s on desktop

#### Largest Contentful Paint (LCP)

- [ ] <2.5s on mobile (Good)
- [ ] <1.5s on desktop

#### Cumulative Layout Shift (CLS)

- [ ] <0.1 (Good - sem shifting)

#### Time to Interactive (TTI)

- [ ] <5s on mobile
- [ ] <3s on desktop

### Check in DevTools

1. F12 > Performance tab
2. Click Record
3. Scroll page, interact
4. Click Stop
5. Look for:
   - [ ] Smooth 60fps
   - [ ] No jank/stuttering
   - [ ] CSS animations smooth

---

## 📋 TESTE 13: ACCESSIBILITY

### Keyboard Navigation

- [ ] Tab key navega entre botões
- [ ] Shift+Tab retorna
- [ ] Enter ativa botões
- [ ] Escape fecha modals

### Screen Reader (NVDA/JAWS/VoiceOver)

- [ ] Alt text em imagens lido corretamente
- [ ] Labels em inputs claros
- [ ] Status badges anunciados
- [ ] Navigation hierarquia clara

### Color Contrast

- [ ] Text 4.5:1 contrast ratio (AA)
- [ ] Large text 3:1 (AA)
- [ ] UI components 3:1 (AA)

**Tool:** axe DevTools > Scan > Check results

---

## ✅ FINAL CHECKLIST

### Critical Path

- [ ] Componentes criados (✓ já feito)
- [ ] CSS integrado (✓ já feito)
- [ ] Layout atualizado (✓ já feito)
- [ ] ComprasPage integrada (✓ já feito)
- [ ] Dev server inicia sem erros
- [ ] Sem TypeScript errors: `npm run type-check`
- [ ] Responsividade funciona (3+ breakpoints)
- [ ] Touch targets 48px mínimo
- [ ] Performance aceitável (<2s)
- [ ] Accessibility atendida (WCAG AA)

### Testing Sign-Off

```
[ ] Backend integração OK
[ ] Frontend testes OK
[ ] Mobile UX OK (375px, 768px, 1920px)
[ ] Performance OK (<2s)
[ ] Accessibility OK (WCAG AA)
[ ] Ready for Staging Deploy
```

---

## 🎯 PRÓXIMOS PASSOS (Sprint 2)

### Após validar Sprint 1:

1. **Integrate em mais páginas** (Cronograma, Contratos, Financeiro)
2. **FormWizard implementation** (formulários multi-step)
3. **Swipe gestures** (useSwipe em listagens)
4. **Breadcrumbs responsive** (Trail mobile colapsível)
5. **Image optimization** (WebP, lazy load)

### Deploy Sequence

```
1. ✅ Local test (AGORA)
2. ⏳ Git commit & push
3. ⏳ Deploy to staging
4. ⏳ QA approval
5. ⏳ Deploy to production
```

---

## 📝 NOTAS

**Session:** Jan 1, 2026
**Components:** ResponsiveTable, FormWizard, useMediaQuery, useSwipe, touch-targets.css
**Time Budget:** 4 horas para testes + 2 horas para deploy
**Target:** Lighthouse score 45 → 60+
**Success Criteria:** ✅ Mobile first, app-like UX, 48px touch targets

---

**Good luck! 🚀 Report any issues in Discord.**
