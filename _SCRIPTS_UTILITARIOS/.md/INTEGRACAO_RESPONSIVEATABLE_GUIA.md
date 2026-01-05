# 📊 INTEGRAÇÃO RESPONSIVEATABLE - GUIA PRÁTICO

**Sprint:** 1-2 (Expandindo de 2 para 10+ páginas)
**Tempo:** 30 minutos por página
**Dificuldade:** Fácil (usar template)

---

## 🎯 OBJETIVO

Integrar `ResponsiveTable` em mais páginas que têm tabelas HTML simples.

---

## 📋 PÁGINAS CANDIDATAS

### 🔥 Alta Prioridade (Fácil)

```
1. FinanceiroPage.tsx
   └─ Tabela de lançamentos financeiros
   └─ 7 colunas
   └─ Sem dropdown menus
   └─ Estimado: 20 min

2. AssistenciaPage.tsx
   └─ Tabela de ordens de serviço
   └─ 6 colunas
   └─ Dados simples
   └─ Estimado: 20 min

3. ContratoPage.tsx
   └─ Tabela de contratos
   └─ 8 colunas
   └─ Sem dependências complexas
   └─ Estimado: 20 min
```

### 🟡 Média Prioridade (Médio)

```
4. PropostasPage.tsx
   └─ Tabela de propostas
   └─ 7 colunas
   └─ Alguns dropdowns
   └─ Estimado: 25 min

5. ObraSituacaoPage.tsx
   └─ Tabela de situação de obras
   └─ 8 colunas
   └─ Status com cores
   └─ Estimado: 25 min

6. QuantitativosPage.tsx
   └─ Tabela de quantitativos
   └─ 6 colunas
   └─ Valores monetários
   └─ Estimado: 25 min
```

### 🟢 Baixa Prioridade (Depois)

```
7. PessoasPage
8. ClientesPage
9. PricelistPage
10. DashboardsPage (múltiplas tabelas)
```

---

## 🔧 TEMPLATE DE INTEGRAÇÃO

### Passo 1: Encontrar a Tabela

**Abra a página:**

```tsx
// src/pages/financeiro/FinanceiroPage.tsx

// Procure por:
<table>
  <thead>
    <tr>
      <th>Coluna 1</th>
      <th>Coluna 2</th>
      ...
    </tr>
  </thead>
  <tbody>
    {lançamentos.map((item) => (
      <tr key={item.id}>
        <td>{item.campo1}</td>
        <td>{item.campo2}</td>
      </tr>
    ))}
  </tbody>
</table>
```

---

### Passo 2: Definir Colunas

**No início do arquivo:**

```tsx
import { ResponsiveTable } from "@/components/ResponsiveTable";
import { useMediaQuery } from "@/hooks/useMediaQuery";

// No componente:
const columns = [
  {
    key: "numero",
    label: "Número",
    render: (item) => item.numero || "—",
  },
  {
    key: "data",
    label: "Data",
    render: (item) => new Date(item.data).toLocaleDateString("pt-BR"),
  },
  {
    key: "descricao",
    label: "Descrição",
    render: (item) => item.descricao,
  },
  {
    key: "valor",
    label: "Valor",
    render: (item) => `R$ ${item.valor?.toFixed(2) || 0}`,
  },
  {
    key: "status",
    label: "Status",
    render: (item) => (
      <span className={`badge badge-${item.status}`}>{item.status}</span>
    ),
  },
  {
    key: "acoes",
    label: "Ações",
    render: (item) => (
      <div className="flex gap-2">
        <button onClick={() => editar(item.id)}>Editar</button>
        <button onClick={() => deletar(item.id)}>Deletar</button>
      </div>
    ),
  },
];
```

---

### Passo 3: Substituir Tabela

**ANTES:**

```tsx
<table>
  <thead>
    <tr>
      <th>Número</th>
      <th>Data</th>
      ...
    </tr>
  </thead>
  <tbody>
    {items.map((item) => (
      <tr key={item.id}>
        <td>{item.numero}</td>
        <td>{new Date(item.data).toLocaleDateString()}</td>
        ...
      </tr>
    ))}
  </tbody>
</table>
```

**DEPOIS:**

```tsx
<ResponsiveTable
  data={items}
  columns={columns}
  loading={loading}
  onRowClick={(item) => navigate(`/financeiro/${item.id}`)}
/>
```

---

## 📝 EXEMPLO COMPLETO: FinanceiroPage

```tsx
// src/pages/financeiro/FinanceiroPage.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ResponsiveTable } from "@/components/ResponsiveTable";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { listarLancamentos } from "@/lib/financeirosApi";

export default function FinanceiroPage() {
  const navigate = useNavigate();
  const [lancamentos, setLancamentos] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Definir colunas
  const columns = [
    {
      key: "numero",
      label: "Número",
      render: (item) => item.numero,
    },
    {
      key: "data",
      label: "Data",
      render: (item) => new Date(item.data).toLocaleDateString("pt-BR"),
    },
    {
      key: "descricao",
      label: "Descrição",
      render: (item) => item.descricao,
    },
    {
      key: "valor",
      label: "Valor",
      render: (item) => `R$ ${item.valor.toFixed(2)}`,
    },
    {
      key: "status",
      label: "Status",
      render: (item) => (
        <span
          className={`px-2 py-1 rounded text-sm font-medium
          ${
            item.status === "pago"
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {item.status}
        </span>
      ),
    },
    {
      key: "acoes",
      label: "Ações",
      render: (item) => (
        <button
          className="px-3 py-2 text-sm bg-blue-500 text-white rounded"
          onClick={() => navigate(`/financeiro/${item.id}`)}
        >
          Ver Detalhes
        </button>
      ),
    },
  ];

  // Carregar dados
  useEffect(() => {
    carregarLancamentos();
  }, []);

  async function carregarLancamentos() {
    setLoading(true);
    try {
      const dados = await listarLancamentos();
      setLancamentos(dados);
    } finally {
      setLoading(false);
    }
  }

  // 2. Usar ResponsiveTable
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Financeiro</h1>

      <ResponsiveTable
        data={lancamentos}
        columns={columns}
        loading={loading}
        onRowClick={(item) => navigate(`/financeiro/${item.id}`)}
      />
    </div>
  );
}
```

---

## ✅ CHECKLIST POR PÁGINA

### Passo 1: Importar Componentes

```tsx
import { ResponsiveTable } from "@/components/ResponsiveTable";
import { useMediaQuery } from "@/hooks/useMediaQuery";
```

### Passo 2: Definir Colunas

```tsx
const columns = [
  { key: "campo1", label: "Label 1", render: (item) => ... },
  { key: "campo2", label: "Label 2", render: (item) => ... },
  // ...
];
```

### Passo 3: Substituir Tabela

```tsx
// Remover: <table>...</table>
// Adicionar:
<ResponsiveTable
  data={items}
  columns={columns}
  loading={loading}
  onRowClick={(item) => navigate(`/${item.id}`)}
/>
```

### Passo 4: Testar

```
□ npm run type-check (verificar erros)
□ Abrir em navegador
□ Testar em 375px (cards)
□ Testar em 1920px (tabela)
```

### Passo 5: Commit

```bash
git add src/pages/financeiro/FinanceiroPage.tsx
git commit -m "feat: integrate ResponsiveTable in FinanceiroPage"
git push
```

---

## 🎯 ORDEM RECOMENDADA

### Hoje (Sprint 1 - Finalização)

```
Nenhuma necessária (Sprint 1 complete)
```

### Semana que vem (Sprint 2 - Dia 1-2)

```
1. FinanceiroPage (20 min)
2. AssistenciaPage (20 min)
3. ContratoPage (20 min)
   TOTAL: 1 hora
```

### Sprint 2 - Dia 3-4

```
4. PropostasPage (25 min)
5. ObraSituacaoPage (25 min)
6. QuantitativosPage (25 min)
   TOTAL: 1.25 horas
```

### Sprint 2 - Dia 5+

```
7-10. Páginas restantes
     Total: 2-3 horas
```

---

## 🔍 VALIDAÇÕES IMPORTANTES

### Colunas Dinâmicas

**Se dados vêm de API:**

```tsx
// Sempre validar dados com fallback
render: (item) => item?.campo || "—";

// Formatar datas corretamente
render: (item) =>
  item.data ? new Date(item.data).toLocaleDateString("pt-BR") : "—";

// Formatar valores monetários
render: (item) => (item.valor ? `R$ ${item.valor.toFixed(2)}` : "R$ 0,00");
```

### Ações com Dropdown

**Se tem menu de ações:**

```tsx
// Em mobile, dropdown vira botão com menu
render: (item) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="sm">
        ⋮
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem onClick={() => editar(item.id)}>
        Editar
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => deletar(item.id)}>
        Deletar
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);
```

### Colunas Customizadas

**Para colunas muito largas em mobile:**

```tsx
// Colapsar coluna em mobile
{
  key: "descricaoLonga",
  label: "Descrição",
  render: (item) => (
    <div className="truncate max-w-xs md:max-w-none">
      {item.descricao}
    </div>
  )
}
```

---

## 🐛 TROUBLESHOOTING

### Erro: "ResponsiveTable não encontrado"

**Solução:**

```tsx
// Verificar importação
import { ResponsiveTable } from "@/components/ResponsiveTable";

// Verificar se arquivo existe
ls -la src/components/ResponsiveTable.tsx
```

### Erro: "Tipo não compatível"

**Solução:**

```tsx
// Verificar tipos das colunas
const columns: Column<typeof items[0]>[] = [...]

// Ou ser menos estrito
const columns: any[] = [...]
```

### Tabela vira card, mas dados desaparecem

**Solução:**

```tsx
// Verificar se render function está correta
render: (item) => item?.campo || "—"; // ✅ Correto
render: (item) => item.campo; // ❌ Pode quebrar
```

### Lighthouse score ainda baixo

**Solução:**

1. Verificar imagens pesadas
2. Verificar scripts não comprimidos
3. Verificar CSS não utilizado
4. Usar lazy loading em imagens

---

## 📊 PROGRESSO ESPERADO

```
Início Sprint 2:
├─ 2 páginas (ComprasPage, UsuariosPage)
├─ Lighthouse: 55-60
├─ Code: 0 erros em responsiveTable

Meio Sprint 2:
├─ 5 páginas
├─ Lighthouse: 60-65
├─ Code: 0 erros

Fim Sprint 2:
├─ 8-10 páginas
├─ Lighthouse: 65-70
├─ Code: 0 erros
└─ Pronto para Sprint 3
```

---

## 🎊 CONCLUSÃO

**ResponsiveTable é reutilizável e escalável:**

- ✅ Mesmo padrão em todas as páginas
- ✅ Apenas configurar colunas
- ✅ ~20 minutos por página
- ✅ Zero breaking changes
- ✅ Melhora contínua de Lighthouse

**Meta:** 10+ páginas responsivas em 2 sprints ✨

---

**Próximo passo:** Testes em http://localhost:5173/compras 🚀
