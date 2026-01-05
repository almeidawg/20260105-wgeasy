# ⚡ GUIA RÁPIDO: COMEÇAR MOBILE AMANHÃ

**Data:** 2026-01-01
**Tempo para implementar:** 1 dia (críticos)
**Resultado esperado:** Mobile nav + responsive tables funcionando

---

## 🚀 DIA 1: Críticos (8 horas)

### ✅ Checklist de hoje

```
[ ] 09:00 - Ler AUDITORIA_MOBILE_NAVEGABILIDADE.md (30 min)
[ ] 09:30 - Criar MobileBottomNav.tsx (2h)
[ ] 11:30 - Criar ResponsiveTable.tsx (2h)
[ ] 13:30 - ALMOÇO (1h)
[ ] 14:30 - Aplicar em 2 páginas (1.5h)
[ ] 16:00 - Testar em mobile (1h)
[ ] 17:00 - Fix bugs (1h)
[ ] 18:00 - Git commit (30 min)
```

---

## PASSO 1: Criar MobileBottomNav (2 horas)

### 1.1 Criar arquivo

```bash
cd c:/Users/Atendimento/Documents/01VISUALSTUDIO_OFICIAL/sistema/wgeasy/frontend/src/components/mobile
touch MobileBottomNav.tsx
touch MobileMoreDrawer.tsx
```

### 1.2 Copiar código de MobileBottomNav.tsx

**Ver:** [PLANO_IMPLEMENTACAO_MOBILE.md - Sprint 1, Tarefa 1](PLANO_IMPLEMENTACAO_MOBILE.md#sprint-1-críticos)

Código pronto acima ☝️ - Copiar e colar em `src/components/mobile/MobileBottomNav.tsx`

### 1.3 Copiar código de MobileMoreDrawer.tsx

**Ver:** [PLANO_IMPLEMENTACAO_MOBILE.md - Sprint 1, Tarefa 1](PLANO_IMPLEMENTACAO_MOBILE.md#sprint-1-críticos)

Código pronto acima ☝️ - Copiar e colar em `src/components/mobile/MobileMoreDrawer.tsx`

### 1.4 Validação

```bash
# Checar se importa sem erros
cd frontend
npm run type-check

# Deve mostrar 0 errors em MobileBottomNav.tsx
```

---

## PASSO 2: Atualizar Layouts (30 minutos)

### 2.1 MainLayout.tsx

**Antes:**

```typescript
export function MainLayout() {
  return (
    <div className="min-h-screen">
      <Topbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

**Depois:**

```typescript
import { MobileBottomNav } from "@/components/mobile/MobileBottomNav";
import { useAuth } from "@/auth/AuthContext";

export function MainLayout() {
  const { userRole } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />
      <div className="flex">
        <Sidebar className="hidden md:block" />
        <main className="flex-1 pb-20 md:pb-0">
          <Outlet />
        </main>
      </div>
      <MobileBottomNav userRole={userRole} />
    </div>
  );
}
```

### 2.2 FornecedorLayout.tsx (mesmo padrão)

### 2.3 ColaboradorLayout.tsx (mesmo padrão)

---

## PASSO 3: Criar useMediaQuery Hook (15 minutos)

```bash
touch src/hooks/useMediaQuery.ts
```

**Copiar código de:**
[PLANO_IMPLEMENTACAO_MOBILE.md - Sprint 1, Tarefa 2 - Hook necessário](PLANO_IMPLEMENTACAO_MOBILE.md#hook-necessário)

---

## PASSO 4: Criar ResponsiveTable (2 horas)

```bash
touch src/components/ResponsiveTable.tsx
```

**Copiar código completo de:**
[PLANO_IMPLEMENTACAO_MOBILE.md - Sprint 1, Tarefa 2](PLANO_IMPLEMENTACAO_MOBILE.md#tarefa-2-criar-responsivetable-componente-8h)

---

## PASSO 5: Testar em 2 Páginas (1.5 horas)

### 5.1 ComprasPage

**Antes:**

```typescript
import { Table } from "@/components/ui/Table";

export function ComprasPage() {
  const { compras } = useCompras();

  return (
    <div>
      <Table>
        <thead>
          <tr>
            <th>Número</th>
            <th>Fornecedor</th>
            <th>Valor</th>
            <th>Status</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          {compras.map((compra) => (
            <tr key={compra.id}>
              <td>{compra.numero}</td>
              <td>{compra.fornecedor.nome}</td>
              <td>{formatarValor(compra.valor_total)}</td>
              <td>{compra.status}</td>
              <td>{formatarData(compra.data_criacao)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
```

**Depois:**

```typescript
import { ResponsiveTable } from "@/components/ResponsiveTable";

export function ComprasPage() {
  const { compras } = useCompras();
  const navigate = useNavigate();

  const columns = [
    {
      key: "numero",
      label: "Número",
      render: (value) => `#${value}`,
    },
    {
      key: "fornecedor_nome",
      label: "Fornecedor",
    },
    {
      key: "valor_total",
      label: "Valor",
      render: (value) => formatarValor(value),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <Badge variant={value === "Aprovado" ? "success" : "warning"}>
          {value}
        </Badge>
      ),
    },
    {
      key: "data_criacao",
      label: "Data",
      render: (value) => formatarData(value),
    },
  ];

  return (
    <ResponsiveTable
      data={compras}
      columns={columns}
      onRowClick={(row) => navigate(`/compras/${row.id}`)}
    />
  );
}
```

### 5.2 ContratosPage (mesmo padrão)

---

## PASSO 6: Implementar Touch Targets (1 hora)

### 6.1 Criar touch-targets.css

```bash
touch src/styles/touch-targets.css
```

**Copiar código de:**
[PLANO_IMPLEMENTACAO_MOBILE.md - Sprint 1, Tarefa 3](PLANO_IMPLEMENTACAO_MOBILE.md#tarefa-3-implementar-touch-targets-4h)

### 6.2 Importar em main.tsx

```typescript
// src/main.tsx
import "@/styles/touch-targets.css";
```

---

## PASSO 7: Testar em Mobile (1 hora)

### 7.1 Iniciar dev server

```bash
cd frontend
npm run dev
```

### 7.2 Abrir Chrome DevTools

```
F12 → Toggle Device Toolbar (Ctrl+Shift+M)
```

### 7.3 Testar em 3 tamanhos

| Dispositivo | Resolução | Testar                    |
| ----------- | --------- | ------------------------- |
| iPhone SE   | 375px     | Bottom nav, touch targets |
| iPhone 12   | 390px     | Responsividade            |
| iPad        | 768px     | Layout desktop            |

### 7.4 Checklist

- [ ] Bottom nav visível em mobile
- [ ] Drawer abre/fecha suavemente
- [ ] Tabelas viram cards em mobile
- [ ] Touch targets têm 48px de altura mínima
- [ ] Sem overflow horizontal
- [ ] Sem elementos cortados

---

## PASSO 8: Commit no Git (30 minutos)

```bash
cd c:\Users\Atendimento\Documents\01VISUALSTUDIO_OFICIAL\sistema\wgeasy

# Adicionar arquivos
git add -A

# Commit
git commit -m "feat: mobile navigation e responsive tables

- Adicionar MobileBottomNav unificada
- Criar ResponsiveTable component (tabela em cards em mobile)
- Implementar useMediaQuery hook
- Adicionar touch targets (48px mínimo)
- Atualizar MainLayout, FornecedorLayout, ColaboradorLayout
- Testar em 3 tamanhos de tela (375px, 390px, 768px)

Score Lighthouse móvel: antes 5/10, meta 8/10"

# Push
git push origin main
```

---

## 🐛 Troubleshooting

### Problema: "Cannot find module MobileBottomNav"

**Solução:**

```typescript
// Verificar imports
import { MobileBottomNav } from "@/components/mobile/MobileBottomNav";

// Não use ../../../ paths, use alias @/
```

### Problema: Bottom nav não aparece em mobile

**Solução:**

```typescript
// Verificar que main tem pb-20 (padding-bottom)
<main className="pb-20 md:pb-0">

// Verificar que nav tem md:hidden
<MobileBottomNav className="md:hidden" />
```

### Problema: Cards muito grandes em mobile

**Solução:**

```typescript
// ResponsiveTable.tsx - ajustar grid
{isMobile ? (
  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
    {/* Reduzir de 2 para 1 coluna se muito pequeno */}
    {window.innerWidth < 380 && (
      <div className="grid grid-cols-1">
    )}
  </div>
) : (
  <table>...
)}
```

---

## 📊 Expectativa de Tempo

| Tarefa              | Tempo    | Status |
| ------------------- | -------- | ------ |
| MobileBottomNav     | 2h       | ⏳     |
| Atualizar layouts   | 30min    | ⏳     |
| useMediaQuery       | 15min    | ⏳     |
| ResponsiveTable     | 2h       | ⏳     |
| Testar em 2 páginas | 1.5h     | ⏳     |
| Touch targets       | 1h       | ⏳     |
| Teste em mobile     | 1h       | ⏳     |
| Git commit          | 30min    | ⏳     |
| **TOTAL**           | **8.5h** | ✅     |

---

## 🎯 Resultado Esperado no Final do Dia

✅ Mobile nav unificada em todos os layouts
✅ Tabelas se transformam em cards em <768px
✅ Touch targets 48px de altura mínima
✅ Testado em 3 tamanhos de tela
✅ Sem erros TypeScript
✅ Commitado no Git

**Score Esperado:** 6/10 → 8/10 (no Lighthouse móvel)

---

## 📅 Próximos Passos (Dia 2-3)

```
Dia 2:
- [ ] FormWizard para contratos (4h)
- [ ] Swipe gestures (2h)
- [ ] Testar em app real

Dia 3:
- [ ] BreadCrumbs responsive (1h)
- [ ] Pull-to-refresh (2h)
- [ ] Image optimization (2h)
- [ ] Deploy em staging (1h)
```

---

## 🔗 Arquivos Completos de Referência

1. [AUDITORIA_MOBILE_NAVEGABILIDADE.md](AUDITORIA_MOBILE_NAVEGABILIDADE.md) - Problemas detalhados
2. [PLANO_IMPLEMENTACAO_MOBILE.md](PLANO_IMPLEMENTACAO_MOBILE.md) - Código completo
3. Este arquivo - Quick start

---

**Começar amanhã em 9:00!** 🚀

```bash
# Seu primeiro comando amanhã:
cd c:\Users\Atendimento\Documents\01VISUALSTUDIO_OFICIAL\sistema\wgeasy/frontend
npm run dev

# Depois abrir Chrome DevTools (F12)
# Toggle device toolbar (Ctrl+Shift+M)
# Começar a implementar!
```
