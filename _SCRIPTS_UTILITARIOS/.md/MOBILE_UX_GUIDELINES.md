# 📱 MOBILE UX GUIDELINES - QUICK REFERENCE

**Status:** ✅ Implementação iniciada em 2026-01-01

---

## 🎨 Design System Mobile

### Breakpoints

```css
Mobile:     0 - 640px   (sm:)
Tablet:   640 - 1024px  (md:)
Desktop: 1024px+        (lg:)

Padrão: Mobile-first (começar em mobile, depois expandir)
```

### Touch Targets

```
iOS:     Mínimo 44pt × 44pt (≈59px × 59px)
Android: Mínimo 48dp × 48dp (≈48px × 48px)

WGeasy: 48px × 48px em tudo (mobile)
        40px × 40px em desktop (opcional)
```

### Spacing (Mobile-first)

```
xs: 4px
sm: 8px
md: 12px
lg: 16px
xl: 24px
2xl: 32px

Padrão: lg (16px) para elementos principais
```

### Tipografia

```
Mobile:
- H1: 28px bold (títulos de página)
- H2: 24px bold (seções)
- Body: 16px (legível sem zoom)
- Small: 14px (helper text)
- Tiny: 12px (labels)

Desktop:
- H1: 32px bold
- H2: 28px bold
- Body: 14px (desktop pode ser menor)
```

---

## 🧩 Componentes Essenciais

### 1. ResponsiveTable

**Quando usar:**

- Listas de dados (compras, contratos, pessoas)
- > 3 colunas
- Ações por linha

**Comportamento:**

```
<768px:  Cada item é um CARD vertical
         [Título]
         [Campo1] [Campo2]
         [Campo3] [Ação botão]

≥768px:  Tabela normal com scroll horizontal se necessário
```

**Exemplo:**

```typescript
<ResponsiveTable
  data={items}
  columns={[
    { key: "numero", label: "Nº" },
    { key: "status", label: "Status" },
    { key: "valor", label: "Valor", render: (v) => formatarValor(v) },
  ]}
  onRowClick={(row) => navigate(`/item/${row.id}`)}
/>
```

---

### 2. FormWizard (Nova)

**Quando usar:**

- Formulários com >5 campos
- Fluxo complexo (ex: criar contrato)
- Validação por etapa

**Comportamento:**

```
Passo 1: Cliente e Valor (2 inputs)
   ↓
Passo 2: Distribuição (3 inputs)
   ↓
Passo 3: Detalhes (3 inputs)
   ↓
Passo 4: Revisão (confirmation)

Cada passo: 1 coluna em mobile, validação antes de prosseguir
```

**Exemplo:**

```typescript
<FormWizard
  steps={[
    { id: 'step1', title: 'Cliente', fields: [...] },
    { id: 'step2', title: 'Valores', fields: [...] },
  ]}
  onSubmit={(data) => saveContrato(data)}
/>
```

---

### 3. MobileBottomNav (Nova)

**Quando usar:**

- Navegação principal do app
- Deve estar em TODOS os layouts

**Estrutura:**

```
[Home] [Pessoas] [Comercial] [Projetos] [Mais ⋮]
  ↓
  Mais drawer:
  [Financeiro]
  [Estoque]
  [Relatórios]
  [Config]
```

**Padrão:**

```typescript
<MobileBottomNav userRole={userRole} />
```

---

### 4. ResponsiveModal (A implementar)

**Quando usar:**

- Seleção (cliente, produto, etc)
- Confirmação destrutiva
- Quick actions

**Comportamento:**

```
<768px:  Bottom Sheet (sobe do rodapé, cobre até 80% da tela)
         [X Fechar] (canto superior)
         [Conteúdo]
         [Botão ação full-width]

≥768px:  Dialog normal centered
```

---

## 🎯 Padrões de Navegação

### Deep Linking

```typescript
// ✅ CORRETO: Sempre permitir navegação direta
/contratos/123 → Abre contrato direto
/compras/456/editar → Abre forma de edição

// ❌ ERRADO: Exigir navegar por menu
// Se usuário digita /contratos/123 direto, deve funcionar
```

### Back Navigation

```typescript
// ✅ CORRETO: Sempre ter opção de voltar
- Swipe para direita (nativo)
- Botão voltar no header
- Breadcrumb responsivo

// ❌ ERRADO: Deixar usuário preso em page
```

### Breadcrumb em Mobile

```
<768px:
  [← Voltar] Página atual
  ou apenas [←] se muito pequenininho

≥768px:
  Home / Seção / Página / Subpage
```

---

## 🛠️ Snippets Rápidos

### Conditional Rendering

```typescript
import { useMediaQuery } from "@/hooks/useMediaQuery";

export function MyComponent() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(min-width: 768px)");

  if (isMobile) {
    return <MobileView />;
  }

  return <DesktopView />;
}
```

### Responsive Padding

```typescript
// Mobile: 16px, Desktop: 24px
<div className="px-4 md:px-6">
  Conteúdo
</div>

// Mobile: full width, Desktop: max-w-4xl
<div className="w-full md:max-w-4xl md:mx-auto">
  Conteúdo
</div>
```

### Swipe Gestures

```typescript
import { useSwipe } from "@/hooks/useSwipe";

export function SwipeExample() {
  const { onTouchStart, onTouchEnd } = useSwipe({
    onSwipeRight: () => console.log("Swipe right"),
    onSwipeLeft: () => console.log("Swipe left"),
  });

  return (
    <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      Faça swipe aqui
    </div>
  );
}
```

### Input Mobile-friendly

```typescript
<input
  type="tel"
  inputMode="tel"
  placeholder="(11) 99999-9999"
  className="text-base px-4 py-3 min-h-[48px]"
  // text-base: Previne zoom ao focar em iOS
/>

<input
  type="email"
  inputMode="email"
  placeholder="seu@email.com"
  className="text-base px-4 py-3 min-h-[48px]"
/>

<input
  type="text"
  inputMode="numeric"
  placeholder="Valor"
  className="text-base px-4 py-3 min-h-[48px]"
/>
```

---

## ⚠️ Erros Comuns a Evitar

### ❌ Erro 1: Touch targets pequenos

```typescript
// ERRADO
<button className="px-2 py-1 text-xs">Salvar</button>
// Apenas ~30px de altura

// CORRETO
<button className="px-4 py-3 text-base min-h-[48px]">Salvar</button>
```

### ❌ Erro 2: Dropdowns em mobile

```typescript
// ERRADO: Custom dropdown é difícil de usar em mobile
<Select>
  <SelectTrigger>Selecionar</SelectTrigger>
  <SelectContent>
    <SelectItem>Opção 1</SelectItem>
    ...
  </SelectContent>
</Select>;

// CORRETO: Use native select em mobile
{
  isMobile ? <select>...</select> : <SelectComponent />;
}
```

### ❌ Erro 3: Inputs com font-size < 16px

```typescript
// ERRADO: Causa zoom ao focar em iOS
<input className="text-sm px-2 py-1" />

// CORRETO: Mínimo 16px para não zoomar
<input className="text-base px-4 py-3" />
```

### ❌ Erro 4: Tabelas sem responsividade

```typescript
// ERRADO: Tabela com 8 colunas em mobile
<table>
  <tr>
    <td>ID</td>
    <td>Nome</td>
    <td>Email</td>
    <td>Telefone</td>
    <td>Endereco</td>
    <td>Tipo</td>
    <td>Status</td>
    <td>Acao</td>
  </tr>
</table>
// Resultado: scroll horizontal confuso

// CORRETO: Cards em mobile
<ResponsiveTable columns={[...]} data={...} />
```

### ❌ Erro 5: Modais gigantes

```typescript
// ERRADO: Dialog que ocupa >90% da tela em mobile
<Dialog open={true}>
  <DialogContent className="w-full h-full max-w-full">
    {/* 100 linhas de conteúdo */}
  </DialogContent>
</Dialog>;

// CORRETO: Bottom sheet em mobile, dialog em desktop
{
  isMobile ? <BottomSheet>...</BottomSheet> : <Dialog>...</Dialog>;
}
```

---

## 📋 Checklist: Antes de Deployar

### Mobile

- [ ] Todos botões ≥48px altura
- [ ] Sem overflow horizontal
- [ ] Inputs com text-base (16px)
- [ ] Breadcrumb responsivo ou escondido
- [ ] Tabelas como cards <768px
- [ ] Formulários em wizard
- [ ] Drawer/side-menu funcionando
- [ ] Bottom nav em TODOS layouts

### Tablet

- [ ] Layout intermediário (não desktop, não mobile)
- [ ] Sidebar escondido, bottom nav visível
- [ ] Tabelas em cards ainda (ou tabela pequenininha)
- [ ] Inputs ainda confortáveis

### Desktop

- [ ] Sidebar visível
- [ ] Bottom nav escondido
- [ ] Tabelas em tabela normal
- [ ] 2-3 colunas em grids

### Accessibility

- [ ] Contrast ratio ≥4.5:1
- [ ] Touch targets ≥48px
- [ ] Sem elementos apenas visuais
- [ ] Keyboard navigation funciona
- [ ] Screen reader friendly

### Performance

- [ ] Lighthouse score ≥80 (mobile)
- [ ] LCP <2.5s
- [ ] FID <100ms
- [ ] CLS <0.1

---

## 📊 Testing Devices

### Essencial (testar com DevTools)

- iPhone 12 mini (375px)
- iPhone 12 (390px)
- iPhone 12 Pro Max (428px)
- iPad (768px)
- iPad Pro (1024px)

### Real (se possível)

- iPhone real
- Android real
- Tablet real

### DevTools Chrome

```
F12 → Toggle device toolbar (Ctrl+Shift+M)
→ Select responsive
→ Choose device
```

---

## 🚀 Performance Tips

### Images

```typescript
// ❌ Carregar imagem full-size em mobile
<img src="/image-2000x2000.jpg" className="w-full" />

// ✅ Adaptar tamanho por viewport
<picture>
  <source media="(max-width: 768px)" srcSet="/image-400.webp" />
  <source media="(max-width: 1024px)" srcSet="/image-800.webp" />
  <img src="/image-2000.webp" />
</picture>
```

### CSS

```css
/* ❌ Carregar tudo sempre */
.hidden-mobile {
  display: none;
}
.hidden-desktop {
  display: block;
}

/* ✅ Mobile-first: só esconder o necessário */
@media (min-width: 768px) {
  .hidden-desktop {
    display: none;
  }
}
```

### JavaScript

```typescript
// ❌ Carregar componentes desktop mesmo em mobile
import HeavyDesktopComponent from "@/components/desktop"; // 100kb

// ✅ Code splitting
const HeavyDesktopComponent = lazy(() => import("@/components/desktop"));

// Usar apenas se desktop
{
  isDesktop && <HeavyDesktopComponent />;
}
```

---

## 📚 Documentação Extra

- [AUDITORIA_MOBILE_NAVEGABILIDADE.md](AUDITORIA_MOBILE_NAVEGABILIDADE.md) - Problemas detalhados
- [PLANO_IMPLEMENTACAO_MOBILE.md](PLANO_IMPLEMENTACAO_MOBILE.md) - Código completo
- [GUIA_RAPIDO_MOBILE_DIA1.md](GUIA_RAPIDO_MOBILE_DIA1.md) - Quick start

---

## 💬 Exemplo: "Como Fazer X em Mobile?"

### Q: Como fazer um menu em mobile?

```typescript
<MobileBottomNav userRole={userRole} /> // Pronto!
```

### Q: Como fazer tabela em mobile?

```typescript
<ResponsiveTable
  data={items}
  columns={columns}
  onRowClick={(item) => navigate(`/item/${item.id}`)}
/>
```

### Q: Como fazer formulário longo em mobile?

```typescript
<FormWizard steps={steps} onSubmit={handleSubmit} />
```

### Q: Como fazer dropdown em mobile?

```typescript
// Use native select!
<select>
  <option>Opção 1</option>
  <option>Opção 2</option>
</select>
```

### Q: Como fazer swipe?

```typescript
const { onTouchStart, onTouchEnd } = useSwipe({
  onSwipeRight: goBack,
  onSwipeLeft: openMenu,
});

return (
  <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
    ...
  </div>
);
```

---

**Last Updated:** 2026-01-01
**Version:** 1.0
**Status:** 🟢 Active
