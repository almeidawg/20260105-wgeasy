# ⚡ QUICK REFERENCE CARD - WGEASY AUDIT

**Imprima este documento ou guarde como referência rápida**

---

## 🔴 3 CRÍTICOS (Implemente AGORA)

```
┌─────────────────────────────────────────────────────────┐
│ 1. TYPE SYSTEM FRAGMENTADO                              │
├─────────────────────────────────────────────────────────┤
│ Status:  154 TypeScript errors em 55 arquivos          │
│ Risco:   Bugs silenciosos, refactoring cara            │
│ Fix:     schema.ts + enums.ts                           │
│ Tempo:   4-6 horas                                      │
│ Impacto: Resolve 40-50% dos erros                      │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 2. RACE CONDITIONS EM STATE MANAGEMENT                  │
├─────────────────────────────────────────────────────────┤
│ Problema: useState em 30+ páginas, sem sincronização    │
│ Risco:    Dados desincronizados, UI flickering         │
│ Fix:      React Query                                   │
│ Tempo:    2-3 dias                                      │
│ Impacto:  Elimina race conditions, caching automático  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 3. RLS POLICIES NÃO IMPLEMENTADAS                      │
├─────────────────────────────────────────────────────────┤
│ Risco:    CRÍTICO - User A vê dados de User B         │
│ Fix:      RLS em 5 tabelas principais                  │
│ Tempo:    1-2 dias                                      │
│ Impacto:  Segurança em produção                        │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 ANTES vs DEPOIS

### Type Safety

```
❌ ANTES:          ✅ DEPOIS (pós-refactoring):
154 errors        0 errors
Many any casts    All types checked
Duplicated types  Single source of truth
```

### Performance

```
❌ ANTES:                ✅ DEPOIS:
3-5s latência           200ms
30+ sequential queries  1 optimized query
800KB bundle            400KB bundle
```

### Code Quality

```
❌ ANTES:                  ✅ DEPOIS:
2000-line pages           300-line pages
No tests                  60% coverage
Dispersed validation      Centralized (Zod)
```

---

## 🎯 INÍCIO IMEDIATO (HOJE)

### ✅ Tarefa 1 (1-2 hours)

```bash
# 1. Criar arquivo novo
touch src/types/schema.ts

# 2. Copiar código de PLANO_IMPLEMENTACAO_DETALHADO.md
# Seção "Tarefa 1.1: Criar Schema Canônico"

# 3. Criar arquivo novo
touch src/constants/enums.ts

# 4. Copiar código de PLANO_IMPLEMENTACAO_DETALHADO.md
# Seção "Tarefa 1.2: Criar Enum Maps"

# 5. Testar compilação
npx tsc --noEmit
# Esperado: redução de 154 → 80 erros
```

### ✅ Tarefa 2 (1 hour)

Abrir `src/lib/assistenciaApi.ts` e adicionar exports no final:

```typescript
export type OrdemServicoCompleta = ...
export interface OrdemServicoFormData { ... }
// Copiar de PLANO_IMPLEMENTACAO_DETALHADO.md
```

### ✅ Tarefa 3 (2-3 hours)

```bash
# Instalar React Query
npm install @tanstack/react-query @tanstack/react-query-devtools

# Criar query hooks
mkdir src/hooks/queries
touch src/hooks/queries/useProjeto.ts
# Copiar código de PLANO_IMPLEMENTACAO_DETALHADO.md
```

---

## 🚨 PROBLEMAS CRÍTICOS

### N+1 Queries

```typescript
// ❌ ANTES (30 queries)
const proj = await buscarProjeto(id); // 1
const tarefas = await listarTarefas(id); // 1
for (const t of tarefas) {
  // N queries!
  const comentarios = await listarComentarios(t.id);
}
const equipe = await listarEquipeProjeto(id); // 1
// Total: 3 + N queries, ~3-5 segundos

// ✅ DEPOIS (1 query)
const data = await supabase.from("projetos").select(`
  *,
  tarefas: cronograma_tarefas(*,
    comentarios: comentarios(*)
  ),
  equipe: projeto_equipes(*)
`);
// Total: 1 query, ~200ms
```

### Componentes Gigantes

```
❌ ProjectDetailPage.tsx: 2000 linhas
✅ DEPOIS:
  ├─ ProjectDetailPage.tsx: 300 linhas (orquestra)
  ├─ ProjectHeader.tsx: 100 linhas
  ├─ TasksTable.tsx: 200 linhas
  ├─ CommentsSection.tsx: 100 linhas
  └─ TeamTimeline.tsx: 80 linhas
```

---

## 📈 ROADMAP (3 MONTHS)

```
SEMANA 1 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ schema.ts + enums.ts
✅ Exportar tipos faltantes
✅ TypeScript errors: 154 → 80 (-47%)
Deliverable: PR com types unificados

SEMANA 2-3 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ React Query instalado
✅ AuthContext migrado
✅ 3 páginas críticas migradas
✅ RLS policies ativas em staging
Deliverable: Performance +30%, latência -50%

SEMANA 4-6 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ N+1 queries otimizadas
✅ ProjectDetailPage refatorada
✅ Validação centralizada (Zod)
Deliverable: 60% do codebase com React Query

SEMANA 7-12 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Strict TypeScript ativado
✅ Testes unitários
✅ Code splitting & bundle otimizado
✅ Documentação atualizada
Final: Production-ready refactoring
```

---

## 📞 CHEATSHEET: COMANDOS

```bash
# Verificar erros
npx tsc --noEmit

# Compilar e servir
npm run dev

# Testar tipos apenas
npx tsc --noEmit --pretty false | head -20

# Encontrar todos os "any"
grep -r ": any" src/ --include="*.ts" --include="*.tsx"

# Contar arquivo de linhas
wc -l src/pages/cronograma/ProjectDetailPage.tsx

# Executar migration SQL
npx supabase migration new add_rls_policies
# Copiar conteúdo de PLANO_IMPLEMENTACAO_DETALHADO.md
```

---

## 🎓 LEIA TAMBÉM

| Documento                         | Tempo     | Para quem                |
| --------------------------------- | --------- | ------------------------ |
| RESUMO_EXECUTIVO.md               | 5-10 min  | Todos                    |
| AUDITORIA_ARQUITETURA_COMPLETA.md | 45-60 min | Devs/Arquitetos          |
| PLANO_IMPLEMENTACAO_DETALHADO.md  | 60-90 min | Devs que vão implementar |
| GUIA_NAVEGACAO.md                 | 10 min    | Achar o caminho certo    |

---

## 🔒 SEGURANÇA: RISCOS PRINCIPAIS

| #   | Risco                       | Probabilidade | Impacto | Fix                |
| --- | --------------------------- | ------------- | ------- | ------------------ |
| 1   | User vê contratos de outro  | 🔴 Alta       | Crítico | RLS                |
| 2   | Modificar contrato assinado | 🟠 Média      | Alto    | Soft delete        |
| 3   | Sem audit log               | 🔴 Alta       | Médio   | Trigger SQL        |
| 4   | DOS via N+1 queries         | 🟠 Média      | Alto    | Query optimization |

---

## ✅ CHECKLIST: PRIMEIRA SEMANA

**Seg:**

- [ ] Ler RESUMO_EXECUTIVO.md
- [ ] Ler PLANO_IMPLEMENTACAO_DETALHADO.md
- [ ] Criar branch `feat/type-unification`

**Ter:**

- [ ] Implementar schema.ts
- [ ] Implementar enums.ts
- [ ] Testar compilação

**Qua:**

- [ ] PR review com tech lead
- [ ] Merge para main
- [ ] Exportar tipos faltantes

**Qui:**

- [ ] npm install React Query
- [ ] Criar src/hooks/queries/useProjeto.ts
- [ ] Testar compilação

**Sex:**

- [ ] Code review
- [ ] Preparar RLS migration
- [ ] Plan para próxima semana

---

## 🎯 MÉTRICA DE SUCESSO: SEMANA 1

```
TypeScript Errors:
  Antes: 154
  Meta:  80 (redução 47%)
  Check: npx tsc --noEmit

Bundle Size:
  Antes: ~800KB
  Meta:  ~700KB (antes lazy load)

Compilation:
  Antes: ⚠️ 154 errors, 55 files
  Meta:  ✅ 80 errors max
```

---

## 🚀 PRÓXIMO PASSO AGORA

1. **Abra:** RESUMO_EXECUTIVO.md
2. **Leia:** Seção "Início Imediato" (3 min)
3. **Faça:** Tarefa 1 hoje
4. **Reporte:** Resultado amanhã

Tempo total investimento:

- Entender: 15 minutos
- Implementar: 4-6 horas
- ROI: -60% bugs, +40% performance

**Comece agora! 🚀**

---

Version: 1.0
Last updated: 2025-01-08
For support: Ver GUIA_NAVEGACAO.md
