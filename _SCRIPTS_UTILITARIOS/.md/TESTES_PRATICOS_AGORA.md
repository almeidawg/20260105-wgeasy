# 🧪 TESTES PRÁTICOS - SPRINT 1

**Data:** 2 de Janeiro de 2026
**Status:** Servidor iniciado
**Próximo:** Abrir navegador e testar

---

## 🚀 PASSO 1: SERVIDOR RODANDO

```
✅ Servidor iniciado
✅ Terminal: npx vite
✅ Aguardando no background
```

**Esperado:**

```
  VITE v5.x.x  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h + enter to show help
```

---

## 🌐 PASSO 2: ABRIR NO NAVEGADOR

### URL

```
http://localhost:5173/
```

### Páginas para Testar

1. **ComprasPage:** http://localhost:5173/compras
2. **UsuariosPage:** http://localhost:5173/usuarios

---

## 📱 PASSO 3: ATIVAR DEVTOOLS MOBILE

### Chrome/Edge

```
1. Abra DevTools: F12 ou Ctrl+Shift+I
2. Ative Device Toolbar: Ctrl+Shift+M
3. Selecione viewport
```

### Firefox

```
1. Abra DevTools: F12
2. Menu > More tools > Responsive Design Mode
3. Ctrl+Shift+M
```

---

## ✅ PASSO 4: TESTES DE RESPONSIVIDADE

### Viewport 1: Mobile 375px (iPhone SE)

**Abrir em DevTools:**

```
Device: iPhone SE (375 x 667)
```

**Página: /compras**

```
Validar:
☑ Tabela transformada em CARDS
☑ Cards com 1 coluna (vertical)
☑ Botão "Ações" clicável
☑ Sem scroll horizontal
☑ Bottom nav visível (80px espaço)
☑ Touch targets 48px+ de altura
☑ Scroll suave (60fps)
☑ Sem erros no console
```

**Esperado:**

```
Cada compra aparece como um CARD:
┌────────────────────────┐
│ Compra #001            │
│ Fornecedor: ABC        │
│ Data: 01/01/2024       │
│ Status: Pendente       │
│ [Ações ▼] [Editar]    │
└────────────────────────┘
```

**Página: /usuarios**

```
Validar:
☑ Tabela → Cards
☑ Usuários como cards
☑ Sem dropdown no mobile (ou adaptado)
☑ Botões clicáveis
☑ Bottom nav espaço
```

---

### Viewport 2: Tablet 768px (iPad)

**Abrir em DevTools:**

```
Device: iPad (768 x 1024)
```

**Página: /compras**

```
Validar:
☑ Transição Cards → Tabela
☑ Tabela com 5-6 colunas
☑ Sem scroll horizontal (ou mínimo)
☑ Touch targets mantidos
☑ Performance 60fps
```

**Esperado:**

```
Layout intermediário:
- Pode ser cards ou tabela
- Responsividade suave
- Sem quebra visual
```

---

### Viewport 3: Desktop 1024px+

**Desativar Device Emulation:** Ctrl+Shift+M

**Página: /compras**

```
Validar:
☑ Tabela HTML normal
☑ 9 colunas visíveis
☑ Sem cards, layout padrão
☑ Espaçamento normal
☑ Sem scroll horizontal
```

**Esperado:**

```
Tabela com 9 colunas:
Número | Fornecedor | Data | Previsão | Status | Urgência | Itens | Valor | Ações
```

---

### Viewport 4: Desktop Grande 1920px

**Maximize browser window**

**Página: /compras**

```
Validar:
☑ Tabela com espaçamento confortável
☑ Sem quebra de layout
☑ Scroll vertical apenas
☑ Performance normal
```

---

## 📊 PASSO 5: LIGHTHOUSE AUDIT

### Mobile Audit

**No Chrome DevTools:**

```
1. F12 (abrir DevTools)
2. Clique em "Lighthouse" (aba)
3. Selecione "Mobile"
4. Clique "Analyze page load"
5. Aguarde 30-60 segundos
```

**Métricas Esperadas:**

```
Performance:        50-60 (meta: 55+)
Accessibility:      70-85 (meta: 75+)
Best Practices:     85-95 (meta: 90+)
SEO:                90-100
OVERALL:            55-65 (meta: 60+)
```

**Comparação:**

```
Antes Sprint 1:     45
Depois Sprint 1:    55-60 (+33%)
```

---

## 🔍 PASSO 6: VALIDAÇÕES DETALHADAS

### Responsividade CSS

**DevTools > Elements**

```
1. Inspecione um elemento <table>
2. Procure por "display: none" ou similar
3. Verifique media query @media (max-width: 768px)
4. Confirme transformação Cards
```

### Touch Targets

**DevTools > Elements**

```
1. Clique em um botão
2. Verifique estilos (Styles panel)
3. Procure por "min-width: 48px"
4. Procure por "min-height: 48px"
5. Confirme em touch-targets.css
```

### Performance

**DevTools > Performance**

```
1. Abra aba Performance
2. Clique "Record"
3. Scroll na página
4. Clique "Stop"
5. Verifique FPS (esperado: 60)
```

---

## 🐛 TROUBLESHOOTING

### Se a página mostrar erro 404

```
Solução:
1. Verifique URL: http://localhost:5173/compras
2. Verifique se rota /compras existe
3. Verifique console para erros
4. Recarregue: F5 ou Ctrl+R
```

### Se ResponsiveTable não aparece como card

```
Possível causa: CSS não foi importado
Solução:
1. DevTools > Elements
2. Procure <style> tag
3. Verifique se touch-targets.css está lá
4. Procure por @media (max-width: 768px)

Ou:
1. DevTools > Console
2. Digite: getComputedStyle(document.querySelector('table')).display
3. Se retornar "none" em 375px = OK
4. Se retornar "table" = CSS não aplicado
```

### Se bottom nav não aparecer

```
Solução:
1. DevTools > Elements
2. Procure <main> tag
3. Verifique style="paddingBottom: 80px"
4. Se faltando, MainLayout não foi atualizado
```

### Se Lighthouse score < 55

```
Causas possíveis:
1. CSS não otimizado
2. Imagens grandes
3. Scripts não comprimidos
4. Fonte não otimizada

Solução:
1. Verifique console para warnings
2. Procure por "render-blocking"
3. Procure por "unused CSS"
4. Verifique tamanho de imagens
```

---

## 📋 CHECKLIST DE TESTES

### ✅ Teste 1: Mobile 375px (iPhone SE)

```
Compras Page:
☑ Aparecem como CARDS
☑ Sem scroll horizontal
☑ 48px touch targets
☑ Bottom nav espaço
☑ Scroll 60fps

Usuarios Page:
☑ Usuários como CARDS
☑ Sem scroll horizontal
☑ Clicáveis
☑ 48px botões
```

### ✅ Teste 2: Tablet 768px (iPad)

```
Compras Page:
☑ Transição Cards/Tabela
☑ 5-6 colunas
☑ Responsividade suave
☑ Sem scroll H
```

### ✅ Teste 3: Desktop 1024px+

```
Compras Page:
☑ Tabela HTML normal
☑ 9 colunas visíveis
☑ Sem alterações
☑ Scroll V apenas
```

### ✅ Teste 4: Lighthouse

```
Mobile Audit:
☑ Performance 50-60
☑ Accessibility 70-85
☑ Best Practices 85-95
☑ SEO 90-100
☑ OVERALL 55-65
```

### ✅ Teste 5: Console

```
No console:
☑ Sem erros críticos
☑ Sem warnings
☑ Sem undefined
```

---

## 🎯 CRITÉRIO DE SUCESSO

**Testes são SUCESSO quando:**

```
✅ Todos 4 viewports funcionam
✅ Sem scroll horizontal em mobile
✅ 48px touch targets em mobile
✅ Bottom nav espaço mantido (80px)
✅ Performance 60fps em scroll
✅ Lighthouse 55-60+
✅ Console limpo
✅ Sem breaking changes
```

---

## 📸 SCREENSHOTS (Opcional)

Para documentar:

```
1. 375px /compras:  Shift+Ctrl+S > Capture area
2. 375px /usuarios: Idem
3. 768px /compras:  Idem
4. 1024px /compras: Idem
5. Lighthouse:      Print screen (F11 screenshot)
```

Salvar em:

```
c:\Users\Atendimento\Documents\01VISUALSTUDIO_OFICIAL\SCREENSHOTS_SPRINT1\
```

---

## 🚀 PRÓXIMA ETAPA

Quando testes passarem com sucesso:

### Opção 1: Integrar em Mais Páginas (Sprint 2)

```
□ FinanceiroPage
□ CronogramaPage
□ OutrasPages com tabelas
```

### Opção 2: Deploy para Staging

```
□ Parar servidor (Ctrl+C)
□ Fazer build final
□ Deploy automático ou manual
```

### Opção 3: Validação Completa

```
□ Testes E2E (se configurado)
□ Smoke tests
□ QA manual
```

---

## 💾 PRÓXIMO COMANDO

Quando terminar os testes:

```bash
# Para o servidor (no terminal que rodando vite)
Ctrl + C

# Ir para a próxima etapa
git status
```

---

**Tempo total esperado:** 45-60 minutos
**Complexidade:** Média (visual + performance)
**Próxima ação:** Abrir http://localhost:5173 e testar!

🧪 **Começar testes agora!**
