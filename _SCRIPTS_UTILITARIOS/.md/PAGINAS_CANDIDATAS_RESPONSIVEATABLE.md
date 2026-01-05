# 📋 PÁGINAS CANDIDATAS - RESPONSIVEATABLE INTEGRATION

**Objetivo:** Identificar quais páginas devem usar ResponsiveTable
**Critério:** Páginas com tabelas/listagens com +3 colunas
**Prioridade:** Alta para Sprint 1 (integrar em 2-3 páginas)

---

## 🔍 AUDITORIA DE TABELAS NO SISTEMA

### ✅ PRONTA PARA INTEGRAÇÃO (Encontradas)

#### 1. **ComprasPage** - Status: ✅ JÁ INTEGRADA

- **Arquivo:** `frontend/src/pages/compras/ComprasPage.tsx`
- **Tabela Atual:** 9 colunas
- **Integração:** COMPLETA
- **Columns:** Número, Fornecedor, Data, Previsão, Status, Urgência, Itens, Valor, Ações

---

### ⏳ PRÓXIMAS PARA INTEGRAR

#### 2. **CronogramaPage**

- **Arquivo:** `frontend/src/pages/cronograma/CronogramaPage.tsx`
- **Descrição:** Listagem de cronogramas/timelines
- **Tabela Esperada:** Datas, marcos, status, responsável
- **Ação:** INTEGRAR PRÓXIMA
- **Complexidade:** Média
- **Tempo Estimado:** 30 min

#### 3. **ContratosPage**

- **Arquivo:** `frontend/src/pages/contratos/ContratosPage.tsx`
- **Descrição:** Listagem de contratos
- **Tabela Esperada:** Número contrato, fornecedor, datas, valor, status
- **Ação:** INTEGRAR SEGUNDA
- **Complexidade:** Média-Alta
- **Tempo Estimado:** 45 min

#### 4. **FinanceiroPage**

- **Arquivo:** `frontend/src/pages/financeiro/FinanceiroPage.tsx`
- **Descrição:** Lançamentos financeiros
- **Tabela Esperada:** Data, descrição, valor, categoria, status
- **Ação:** INTEGRAR TERCEIRA
- **Complexidade:** Alta (muitos dados)
- **Tempo Estimado:** 1 hora

---

## 📂 BUSCAR TABELAS NO CÓDIGO

### Para identificar mais páginas com tabelas:

```bash
# Procurar por tags <table>
grep -r "<table" frontend/src/pages --include="*.tsx"

# Procurar por componentes de dados
grep -r "map.*map" frontend/src/pages --include="*.tsx" | grep -v ".map("

# Procurar por DataGrid/Grid imports
grep -r "DataGrid\|Table\|Grid" frontend/src/pages --include="*.tsx"
```

---

## 🔨 TEMPLATE DE INTEGRAÇÃO

### Passo 1: Analisar Página Atual

```typescript
// Antes de integrar, identifique:
// 1. Nome da tabela
// 2. Número de colunas
// 3. Tipo de dados (interface)
// 4. Funções de ação (editar, deletar, etc)

// Exemplo ComprasPage:
interface Column {
  key: string;
  label: string;
  render: (item: DataType) => ReactNode;
}

const columns: Column[] = [
  { key: "numero", label: "Número", render: ... },
  { key: "fornecedor", label: "Fornecedor", render: ... },
  // etc...
];
```

### Passo 2: Importar Componentes

```typescript
import { ResponsiveTable } from "@/components/ResponsiveTable";
import { useMediaQuery } from "@/hooks/useMediaQuery";
```

### Passo 3: Definir Columns

```typescript
const columns = [
  {
    key: "id",
    label: "ID",
    render: (item) => item.id,
  },
  {
    key: "nome",
    label: "Nome",
    render: (item) => item.nome,
  },
  // Adicionar mais colunas...
];
```

### Passo 4: Substituir <table>

```typescript
// ANTES
<table>
  <thead>...</thead>
  <tbody>{items.map(...)}</tbody>
</table>

// DEPOIS
<ResponsiveTable
  data={items}
  columns={columns}
  loading={loading}
  onRowClick={(item) => {
    if (useMediaQuery("(max-width: 768px)")) {
      navigate(`/path/${item.id}`);
    }
  }}
/>
```

---

## 📊 MAPA MENTAL - TABELAS POR MÓDULO

```
🏠 DASHBOARD
└─ StatisticsCards (não precisa ResponsiveTable)

📦 COMPRAS
├─ ComprasPage ✅ INTEGRADA
├─ PedidoDetalhePage (pode ter sub-tabela)
└─ FornecedoresPage (lista de fornecedores)

📅 CRONOGRAMA
├─ CronogramaPage ⏳ INTEGRAR
└─ MilestonesPage (marcos do projeto)

📜 CONTRATOS
├─ ContratosPage ⏳ INTEGRAR
├─ ContratoDetalhePage (itens do contrato)
└─ CláusulasPage (cláusulas contratuais)

💰 FINANCEIRO
├─ FinanceiroPage ⏳ INTEGRAR
├─ LançamentosPage (lista de lançamentos)
├─ NF-EPage (nota fiscal eletrônica)
└─ RelatoriosPage (relatórios financeiros)

👥 COLABORADORES
├─ ColaboradoresPage (lista)
└─ EquipesPage (times)

⚙️ CONFIGURAÇÕES
└─ SettingsPage (não precisa)
```

---

## 🎯 QUICK INTEGRATION - 30 MIN SETUP

Para integrar rápido uma nova página:

### Arquivo: `PaginaExemploPage.tsx`

```typescript
import { ResponsiveTable } from "@/components/ResponsiveTable";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface DataItem {
  id: string;
  nome: string;
  status: string;
  // ... outros campos
}

export default function PaginaExemploPage() {
  const [items, setItems] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // ... dados e funções

  const columns = [
    {
      key: "id",
      label: "ID",
      render: (item: DataItem) => item.id,
    },
    {
      key: "nome",
      label: "Nome",
      render: (item: DataItem) => item.nome,
    },
    {
      key: "status",
      label: "Status",
      render: (item: DataItem) => (
        <span className="px-2 py-1 rounded text-xs text-white bg-blue-500">
          {item.status}
        </span>
      ),
    },
    {
      key: "acoes",
      label: "Ações",
      render: (item: DataItem) => (
        <div className="flex gap-2">
          <button onClick={() => editar(item.id)}>Editar</button>
          <button onClick={() => deletar(item.id)}>Deletar</button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1>Página Exemplo</h1>
      <ResponsiveTable
        data={items}
        columns={columns}
        loading={loading}
        onRowClick={(item) => {
          if (isMobile) {
            navigate(`/caminho/${item.id}`);
          }
        }}
      />
    </div>
  );
}
```

---

## 📈 PRIORIDADE DE INTEGRAÇÃO

### SPRINT 1 (Hoje - 4 horas)

```
✅ ComprasPage - FEITO
⏳ CronogramaPage - PRÓXIMO (30 min)
⏳ Uma página mais - à escolha (30 min)

Total: 1-2 páginas adicionais
```

### SPRINT 2 (Amanhã)

```
⏳ ContratosPage
⏳ FinanceiroPage
⏳ FornecedoresPage
⏳ ColaboradoresPage
```

---

## ✅ CHECKLIST POR PÁGINA

### Para cada página integrada:

```
[ ] Identificar tabela HTML original
[ ] Extrair columns definition
[ ] Criar render functions para cada coluna
[ ] Verificar tipos (TypeScript)
[ ] Testar em desktop (>768px)
    - [ ] Tabela normal com N colunas
    - [ ] Sem card layout
[ ] Testar em mobile (375px)
    - [ ] Cards empilhados
    - [ ] Sem scroll horizontal
    - [ ] 48px touch targets
[ ] Testar navegação onRowClick
[ ] Lighthouse audit
[ ] Git commit
```

---

## 🚀 PRÓXIMA AÇÃO

### Imediato (30 min):

```bash
# 1. Abrir CronogramaPage
code frontend/src/pages/cronograma/CronogramaPage.tsx

# 2. Copiar template acima
# 3. Adaptar columns para dados de cronograma
# 4. Testar em 375px e 1920px
# 5. Commit: "feat: integrate ResponsiveTable in CronogramaPage"
```

---

## 📝 OBSERVAÇÕES

- **ResponsiveTable é agnóstico** - funciona com qualquer tipo de dados
- **Suporta paginação** - pode ser adicionado depois
- **Suporta sorting** - pode ser adicionado depois
- **Suporta filtros** - pode ser adicionado depois
- **Mobile first** - prioriza UX mobile por padrão

---

## 🎯 TARGET

- ComprasPage: ✅ INTEGRADA
- CronogramaPage: ⏳ INTEGRAR PRÓXIMA (Sprint 1)
- ContratosPage: ⏳ INTEGRAR SEGUNDA
- **Meta:** 3-4 páginas com ResponsiveTable até fim Sprint 1

---

**Vamos lá! 🚀**
