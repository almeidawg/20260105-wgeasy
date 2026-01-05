# SPRINT 5 - Plano de Features Avançadas para ResponsiveTable

**Data de Criação:** 2 de janeiro de 2026
**Status:** 📋 PLANEJADO
**Objetivo:** Implementar features avançadas de filtragem, virtualização, export e redimensionamento de colunas para otimizar a experience com datasets grandes.

---

## 📊 Visão Geral

Sprint 5 foca em **4 features complementares** que transformam o `ResponsiveTable` em um componente **enterprise-grade** para lidar com datasets de 1000+ registros com performance otimizada.

| Task      | Feature            | Prioridade | Esforço    | Status    |
| --------- | ------------------ | ---------- | ---------- | --------- |
| 1         | Advanced Filtering | 🟡 Alta    | 6-8h       | PLANEJADO |
| 2         | Virtualization     | 🔴 Crítica | 8-10h      | PLANEJADO |
| 3         | Export CSV/Excel   | 🟡 Alta    | 4-6h       | PLANEJADO |
| 4         | Column Resizing    | 🟢 Média   | 4-5h       | PLANEJADO |
| **Total** |                    |            | **22-29h** |           |

---

## 📋 Detalhamento de Tasks

### Task 1️⃣ : Advanced Filtering (6-8 horas)

**Objetivo:** Implementar opções de filtro avançadas além da busca por texto simples.

#### Features Implementadas:

**1.1 Range Filters (Min/Max)**

```typescript
// Para valores numéricos (valor_causa, dias_atraso, etc)
<RangeFilter
  label="Valor da Causa"
  min={0}
  max={1000000}
  onRange={(min, max) => applyFilter("valor_causa", { min, max })}
/>
```

- Input numérico duplo
- Validação: max >= min
- Integração com pipeline de sorting/pagination

**1.2 Multi-Select Filters**

```typescript
// Para campos com valores pré-definidos (status, prioridade, tipo)
<MultiSelectFilter
  label="Status"
  options={["PENDENTE", "EM_ANALISE", "RESOLVIDO"]}
  onSelect={(selected) => applyFilter("status", selected)}
/>
```

- Checkbox list ou select com controle
- AND/OR toggle (todos ou qualquer um)
- Lógica: `status IN ['PENDENTE', 'EM_ANALISE']`

**1.3 Date Range Picker**

```typescript
// Para datas (data_vencimento, created_at, etc)
<DateRangeFilter
  label="Data de Vencimento"
  onDateRange={(from, to) => applyFilter("data_vencimento", { from, to })}
/>
```

- Dois inputs de data
- Validação: from <= to
- Shortcut buttons: "Este mês", "Últimos 30 dias", "Este ano"

**1.4 Lógica de Filtros Compostos**

```typescript
// Sintaxe: filters = { status: ['PENDENTE'], prioridade: ['ALTA', 'URGENTE'], valor_causa: { min: 1000, max: 100000 } }
// Query: WHERE status IN ('PENDENTE') AND prioridade IN ('ALTA', 'URGENTE') AND valor_causa BETWEEN 1000 AND 100000
```

#### Componentes Novos:

1. `FilterBar.tsx` - Container principal de filtros

   - Layout responsivo (vertical mobile, horizontal desktop)
   - Botão "Limpar Filtros"
   - Badge de contagem de filtros ativos

2. `RangeFilter.tsx` - Filter numérico min/max

   - Dois inputs numéricos
   - Validação em tempo real

3. `MultiSelectFilter.tsx` - Filter multi-select

   - Checkbox list com scroll
   - Toggle AND/OR
   - "Select All" / "Deselect All"

4. `DateRangeFilter.tsx` - Filter de data range
   - Native date input
   - Shortcut buttons
   - Validação from <= to

#### Integração com ResponsiveTable:

```typescript
// Em ResponsiveTable.tsx
interface AdvancedFilters {
  textSearch?: string;
  rangeFilters?: Record<string, { min: number; max: number }>;
  multiSelectFilters?: Record<string, string[]>;
  dateRangeFilters?: Record<string, { from: string; to: string }>;
}

const filteredData = useMemo(() => {
  return data
    .filter((row) => applyTextSearch(row, textSearch))
    .filter((row) => applyRangeFilters(row, rangeFilters))
    .filter((row) => applyMultiSelectFilters(row, multiSelectFilters))
    .filter((row) => applyDateRangeFilters(row, dateRangeFilters));
}, [data, textSearch, rangeFilters, multiSelectFilters, dateRangeFilters]);
```

#### Estimativa de Implementação:

- FilterBar component: 1h
- RangeFilter component: 1h
- MultiSelectFilter component: 1.5h
- DateRangeFilter component: 1.5h
- Integração com ResponsiveTable: 1.5h
- Testes e refinamento: 1h

**Total: 6-8 horas**

---

### Task 2️⃣ : Virtualization (8-10 horas)

**Objetivo:** Otimizar rendering de 1000+ registros usando `react-window`.

#### Features Implementadas:

**2.1 Virtual Scrolling**

```typescript
import { FixedSizeList } from "react-window";

// Renderiza apenas os rows visíveis + buffer
<FixedSizeList
  height={600}
  itemCount={filteredData.length}
  itemSize={48}
  width="100%"
  overscanCount={5}
>
  {({ index, style }) => (
    <div style={style}>
      <Row data={filteredData[index]} />
    </div>
  )}
</FixedSizeList>;
```

**2.2 Auto Height Adjustment**

```typescript
// Detecta container height e ajusta dinamicamente
<VirtualizedTable
  data={filteredData}
  columns={columns}
  maxHeight="100vh"
  overscan={5}
/>
```

**2.3 Performance Metrics**

```typescript
// Dashboard de performance
<PerformanceMetrics>
  - Rendering: 45ms (target < 50ms)
  - Virtual rows: 20 visible, 980 virtualized
  - Memory: 2.3MB (vs 8.5MB sem virtualization)
</PerformanceMetrics>
```

#### Componentes Novos:

1. `VirtualizedResponsiveTable.tsx` - Wrapper especializado

   - Detecção automática de altura
   - Overscan configuration
   - Row height calculation

2. `VirtualRow.tsx` - Componente row otimizado

   - Memoizado para evitar re-renders
   - Lazy loading de data complexa

3. `VirtualizationConfig.ts` - Configurações globais
   - Item size
   - Overscan count
   - Buffer strategy

#### Integração com ResponsiveTable:

```typescript
// Adicionar modo virtualization
interface ResponsiveTableProps {
  // ... existing props
  enableVirtualization?: boolean;
  maxHeight?: number | string;
  itemSize?: number;
  overscan?: number;
}

// Detectar automaticamente se usar virtualization
const shouldVirtualize = data.length > 500 && enableVirtualization;
```

#### Benchmarks Esperados:

| Scenario            | Sem Virtualização | Com Virtualização | Ganho    |
| ------------------- | ----------------- | ----------------- | -------- |
| Rendering 1000 rows | 2500ms            | 150ms             | 16.6x ✨ |
| Memory (loaded)     | 12MB              | 2.8MB             | 4.3x     |
| Scroll FPS          | 30 FPS            | 60 FPS            | 2x       |
| First Paint         | 1800ms            | 200ms             | 9x       |

#### Estimativa de Implementação:

- Integração react-window: 2h
- VirtualizedResponsiveTable component: 2h
- VirtualRow optimization: 1.5h
- Auto-height detection: 1.5h
- Performance monitoring: 1h
- Testing (Chrome DevTools profiling): 1.5h

**Total: 8-10 horas**

---

### Task 3️⃣ : Export CSV/Excel (4-6 horas)

**Objetivo:** Permitir export dos dados com filtros/sorting aplicados.

#### Features Implementadas:

**3.1 CSV Export**

```typescript
// Com filtros e sorting aplicados
exportToCSV({
  data: filteredSortedData,
  filename: `juridico_${new Date().toISOString().split("T")[0]}.csv`,
  encoding: "UTF-8-BOM", // Para Excel aceitar caracteres acentuados
  delimiter: ";", // Padrão Brasil
});
```

**3.2 Excel Export (XLSX)**

```typescript
// Usando library exceljs ou xlsx
exportToExcel({
  data: filteredSortedData,
  filename: `juridico_${new Date().toISOString().split("T")[0]}.xlsx`,
  sheetName: "Assistências",
  columns: [
    { header: "Título", key: "titulo", width: 30 },
    { header: "Status", key: "status", width: 15 },
    // ... mais colunas
  ],
  styles: {
    header: { fill: "CCCCCC", bold: true },
    alternating: { fill: "F5F5F5" },
  },
});
```

**3.3 Formato Customizável**

```typescript
// Template de export
<ExportDialog>
  ☑ CSV ☑ Excel ☐ PDF (futuro) --- Colunas a exportar: ☑ Título ☑ Status ☑
  Prioridade ☐ Data Abertura --- Incluir apenas filtrados: ON/OFF Incluir apenas
  visíveis: ON/OFF
</ExportDialog>
```

#### Componentes Novos:

1. `ExportButton.tsx` - Botão de export

   - Menu dropdown com opções
   - Ícone de download

2. `ExportDialog.tsx` - Modal de configuração

   - Checkbox list de colunas
   - Toggle para filtros
   - Button de confirmação

3. `exportUtils.ts` - Funções de export
   - `exportToCSV(data, config)`
   - `exportToExcel(data, config)`
   - `formatCurrency(value)` - Para R$ no export
   - `formatDate(date)` - Para datas

#### Tratamento de Dados:

```typescript
// Normalizar dados para export
function prepareDataForExport(data, columns, config) {
  return data.map((row) => {
    return columns.reduce((acc, col) => {
      const value = row[col.key];

      // Aplicar formatação conforme o tipo
      if (col.type === "currency") {
        acc[col.header] = formatCurrency(value);
      } else if (col.type === "date") {
        acc[col.header] = formatDate(value);
      } else {
        acc[col.header] = String(value || "");
      }

      return acc;
    }, {});
  });
}
```

#### Estimativa de Implementação:

- ExportButton component: 1h
- ExportDialog component: 1h
- CSV export logic: 1h
- Excel export logic (com formatação): 1.5h
- Testes: 0.5h

**Total: 4-6 horas**

---

### Task 4️⃣ : Column Resizing (4-5 horas)

**Objetivo:** Permitir redimensionamento de colunas com persistência.

#### Features Implementadas:

**4.1 Drag-to-Resize Headers**

```typescript
// Header resizável
<table>
  <thead>
    <tr>
      <th>
        <span>Título</span>
        <Resizer
          onResize={(newWidth) => updateColumnWidth("titulo", newWidth)}
          onResizeEnd={(finalWidth) => persistColumnWidth("titulo", finalWidth)}
        />
      </th>
    </tr>
  </thead>
</table>
```

**4.2 Persistência em LocalStorage**

```typescript
// Salvar widths do usuário
const columnWidths = {
  "juridico-titulo": 250,
  "juridico-status": 120,
  "juridico-prioridade": 100,
  // ... mais colunas
};

localStorage.setItem("table-column-widths", JSON.stringify(columnWidths));

// Carregar na próxima sessão
const savedWidths = JSON.parse(
  localStorage.getItem("table-column-widths") || "{}"
);
```

**4.3 Reset para Default**

```typescript
// Botão para resetar layouts customizados
<button
  onClick={() => {
    localStorage.removeItem("table-column-widths");
    location.reload();
  }}
>
  Reset Layout
</button>
```

**4.4 Min/Max Width Constraints**

```typescript
// Impedir colunas muito pequenas ou grandes
const constraints = {
  minWidth: 80, // Min 80px
  maxWidth: 600, // Max 600px
};
```

#### Componentes Novos:

1. `ColumnResizer.tsx` - Handle de redimensionamento

   - Draggable resize handle
   - Visual feedback (hover, drag)
   - Double-click para reset

2. `useColumnWidths.ts` - Hook customizado
   - Gerenciar widths state
   - Persistência em localStorage
   - Reset logic

#### Integração com ResponsiveTable:

```typescript
interface ResponsiveTableProps {
  // ... existing props
  enableColumnResizing?: boolean;
  persistColumnWidths?: boolean;
  tableId?: string; // Para localStorage key
  columnDefaults?: Record<string, number>;
}

// Em ResponsiveTable.tsx
const [columnWidths, setColumnWidths] = useColumnWidths(tableId);

const renderHeader = (col) => (
  <th style={{ width: columnWidths[col.key] }}>
    {col.header}
    {enableColumnResizing && (
      <ColumnResizer
        onResize={(width) =>
          setColumnWidths({ ...columnWidths, [col.key]: width })
        }
      />
    )}
  </th>
);
```

#### Estimativa de Implementação:

- ColumnResizer component: 1.5h
- useColumnWidths hook: 1h
- Integration com ResponsiveTable: 1h
- localStorage persistence: 0.5h
- Testing e refinement: 0.5h

**Total: 4-5 horas**

---

## 🔄 Integração Cross-Task

### Pipeline de Dados Completo

```
Raw Data (1000+ registros)
    ↓
[Advanced Filters] ← Aplicar filtros avançados
    ↓
[Sort Pipeline] ← Sorting por coluna
    ↓
[Pagination] ← Dividir em páginas (10 registros)
    ↓
[Virtualization] ← Renderizar apenas visíveis (20 rows)
    ↓
[Column Widths] ← Respeitar larguras personalizadas
    ↓
Rendered Table ✨
    ↓
[Export] → CSV/Excel com dados filtrados
```

### Exemplo de Uso Completo:

```tsx
<ResponsiveTable<AssistenciaJuridica>
  data={rawData} // 1000+ registros
  columns={columns}
  // Task 1: Advanced Filtering
  enableFiltering={true}
  advancedFilters={{
    textSearch: "trabalhista",
    rangeFilters: { valor_causa: { min: 1000, max: 50000 } },
    multiSelectFilters: { status: ["PENDENTE", "EM_ANDAMENTO"] },
    dateRangeFilters: {
      data_abertura: { from: "2024-01-01", to: "2024-12-31" },
    },
  }}
  // Task 2: Virtualization
  enableVirtualization={true}
  maxHeight="100vh"
  // Task 3: Export
  enableExport={true}
  exportFormats={["csv", "xlsx"]}
  // Task 4: Column Resizing
  enableColumnResizing={true}
  persistColumnWidths={true}
  tableId="juridico_table"
/>
```

---

## 📦 Dependencies Necessários

```bash
npm install --save \
  react-window \           # Virtualization
  date-fns \               # Date manipulation
  exceljs \                # Excel export
  papaparse \              # CSV handling
  lucide-react             # Icons (resizing handles)
```

---

## ✅ Critérios de Aceitação

### Task 1: Advanced Filtering

- [ ] FilterBar renderiza corretamente em mobile e desktop
- [ ] Range filters funcionam com min/max validation
- [ ] Multi-select filters suportam AND/OR logic
- [ ] Date range filters com shortcut buttons
- [ ] Limpeza de filtros reseta estado corretamente
- [ ] TypeScript: 0 errors

### Task 2: Virtualization

- [ ] Suporta 1000+ registros sem lag
- [ ] FPS mantido em 60 ao scroll
- [ ] Memory usage < 5MB mesmo com dataset grande
- [ ] Sorting/pagination funcionam com virtualization
- [ ] Auto-height detection funciona
- [ ] TypeScript: 0 errors

### Task 3: Export

- [ ] CSV export com delimiter correto
- [ ] Excel export com formatação (headers, alternating rows)
- [ ] Currency e dates formatados corretamente
- [ ] Export dialog permite selection de colunas
- [ ] "Apenas filtrados" toggle funciona
- [ ] TypeScript: 0 errors

### Task 4: Column Resizing

- [ ] Headers são draggable
- [ ] Widths persistem após reload
- [ ] Min/max constraints respeitados
- [ ] Double-click para reset
- [ ] localStorage persists across sessions
- [ ] TypeScript: 0 errors

---

## 📈 Métricas de Sucesso

| Métrica                 | Baseline (Sprint 4) | Target (Sprint 5) | Ganho |
| ----------------------- | ------------------- | ----------------- | ----- |
| Rendering 1000 rows     | N/A                 | 150ms             | -     |
| Memory (1000 rows)      | 10MB                | 2.8MB             | 3.5x  |
| Scroll FPS              | 45 FPS              | 60 FPS            | 1.33x |
| Filter + Sort time      | 80ms                | 45ms              | 1.77x |
| Export time (1000 rows) | N/A                 | < 2s              | -     |
| TypeScript Errors       | 0                   | 0                 | ✅    |

---

## 🗓️ Timeline

| Phase       | Duration | Tasks          | Output                            |
| ----------- | -------- | -------------- | --------------------------------- |
| **Phase 1** | 2 days   | Task 1 + 2     | Advanced filters + virtualization |
| **Phase 2** | 1.5 days | Task 3         | Export functionality              |
| **Phase 3** | 1 day    | Task 4         | Column resizing                   |
| **Phase 4** | 0.5 days | Testing & docs | SPRINT5_CONCLUSAO.md              |
| **Total**   | ~5 days  | 4 tasks        | Production-ready                  |

---

## 🚀 Próximos Passos

1. ✅ **Aprovação** - User confirma plano
2. 🔄 **Implementation** - Iniciar Task 1 (Advanced Filtering)
3. 📋 **Daily standups** - Acompanhar progresso
4. 🧪 **Testing** - QA antes de merge
5. 📚 **Documentation** - Atualizar SPRINT5_CONCLUSAO.md
6. 🎯 **Deployment** - Deploy para produção

---

## 📝 Notas Importantes

- **Backward Compatibility:** Todas as features são opcionais via props
- **Performance:** Virtualization é crítica para não degradar com datasets grandes
- **Browser Support:** IE11 não suportado (react-window + ES6 classes)
- **Mobile:** Column resizing desabilitado em mobile, apenas drag-to-scroll
- **Accessibility:** ARIA labels para all interactive elements

---

**Status: 📋 PLANEJADO** | **Atualização: 2 de janeiro, 2026** | **Próxima Revisão: Após Task 1**
