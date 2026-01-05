# 🚀 SPRINT 2 - PLANO DE IMPLEMENTAÇÃO

**Data Início:** 3 de Janeiro de 2026
**Duração:** 12 horas (1.5 dias)
**Status:** Planejado
**Dependência:** Sprint 1 ✅ Completo

---

## 🎯 OBJETIVOS SPRINT 2

### 🔥 Crítico (Deve fazer)

```
1. Integrar ResponsiveTable em 3-4 páginas principais
2. Implementar FormWizard em 1 página de formulário
3. Validar Lighthouse > 65
4. Zero breaking changes
```

### 🟡 Importante (Deve tentar)

```
5. Implementar swipe gestures
6. Integrar em 5-6 páginas adicionais
7. Documentação de Sprint 2
```

### 🟢 Nice-to-have (Se tempo permitir)

```
8. Breadcrumb responsivo
9. Otimizar imagens (WebP)
10. Lighthouse audit completo
```

---

## 📋 TASKS DETALHADAS

### Task 1: Integrar FinanceiroPage (20 min)

**Arquivo:** `src/pages/financeiro/FinanceiroPage.tsx`

**Checklist:**

```
□ Importar ResponsiveTable
□ Importar useMediaQuery
□ Definir columns array (7 campos)
□ Substituir <table> por <ResponsiveTable>
□ Validar onRowClick
□ npm run type-check (0 erros)
□ Testar em 375px (cards)
□ Testar em 1920px (tabela)
□ Git commit
```

**Tempo:** 20 minutos

---

### Task 2: Integrar AssistenciaPage (20 min)

**Arquivo:** `src/pages/assistencia/AssistenciaPage.tsx`

**Checklist:**

```
□ Importar ResponsiveTable + useMediaQuery
□ Definir columns (6 campos: numero, cliente, tipo, data, status, ações)
□ Substituir <table>
□ Status com badge colorido
□ onRowClick = detalhes
□ Type check (0 erros)
□ Teste mobile/desktop
□ Commit
```

**Tempo:** 20 minutos

---

### Task 3: Integrar ContratoPage (20 min)

**Arquivo:** `src/pages/contratos/ContratoPage.tsx`

**Checklist:**

```
□ Importar ResponsiveTable
□ Colunas: numero, cliente, datas, valor, status, ações
□ Status com cores
□ Dropdown se existir
□ Mobile test
□ Commit
```

**Tempo:** 20 minutos

---

### Task 4: FormWizard em PropostasPage (30 min)

**Arquivo:** `src/pages/propostas/PropostaFormPage.tsx`

**Contexto:** Proposta tem múltiplos passos (dados, itens, condiçoes)

**Checklist:**

```
□ Analisar estrutura do form atual
□ Dividir em 3-4 steps
□ Implementar FormWizard
□ Validação por etapa
□ Progress bar
□ Mobile test
□ Desktop test
□ Type check
□ Commit
```

**Tempo:** 30 minutos

---

### Task 5: Integrar PropostasPage (20 min)

**Arquivo:** `src/pages/propostas/PropostasPage.tsx`

**Checklist:**

```
□ ResponsiveTable
□ Colunas: numero, cliente, datas, valor, status
□ Status colorido
□ Link para detalhes
□ Mobile/desktop test
□ Commit
```

**Tempo:** 20 minutos

---

### Task 6: Lighthouse Validation (15 min)

**Processo:**

```
1. Abrir cada página em DevTools
2. Executar Lighthouse Mobile
3. Registrar scores:
   - Performance
   - Accessibility
   - Best Practices
   - SEO

4. Validar:
   □ Performance ≥ 60
   □ Accessibility ≥ 75
   □ Best Practices ≥ 85
   □ SEO ≥ 90
   □ OVERALL ≥ 65
```

**Tempo:** 15 minutos

---

### Task 7: FormWizard em QuantitativosPage (30 min - Opcional)

**Arquivo:** `src/pages/quantitativos/QuantitativoFormPage.tsx`

**Se tempo permitir:**

```
□ Dividir formulário em steps
□ Implementar FormWizard
□ Validação por etapa
□ Mobile test
□ Commit
```

**Tempo:** 30 minutos (opcional)

---

## ⏰ TIMELINE SPRINT 2

### Dia 1 (6 horas)

```
9:00 - 9:20   Task 1 (FinanceiroPage)        20 min
9:20 - 9:40   Task 2 (AssistenciaPage)       20 min
9:40 - 10:00  Task 3 (ContratoPage)          20 min
10:00 - 10:15 Coffee break                    15 min
10:15 - 10:45 Task 4 (FormWizard setup)      30 min
10:45 - 11:05 Task 5 (PropostasPage)         20 min
11:05 - 11:20 Task 6 (Lighthouse audit)      15 min
11:20 - 11:45 Testing & bugs                  25 min
11:45 - 12:00 Final commit & push            15 min
```

**Subtotal:** 6 horas

---

### Dia 2 (6 horas)

```
9:00 - 9:30   Task 7 (FormWizard in Quantitativo) 30 min
9:30 - 9:50   Integrar em +2 páginas              20 min
9:50 - 10:10  Swipe gestures básico               20 min
10:10 - 10:25 Coffee break                        15 min
10:25 - 10:50 Breadcrumb responsivo               25 min
10:50 - 11:20 Image optimization (WebP)           30 min
11:20 - 11:50 Final Lighthouse audit              30 min
11:50 - 12:00 Commit & push final                 10 min
```

**Subtotal:** 6 horas

---

**TOTAL SPRINT 2:** 12 horas

---

## 📊 FUNCIONALIDADES POR TASK

### Task 1: FinanceiroPage

**Estado Final:**

```
✓ Tabela de lançamentos responsiva
✓ Mobile: Cards verticais
✓ Desktop: Tabela com 7 colunas
✓ Valores formatados em BRL
✓ Status com cores
✓ Clique abre detalhes
```

### Task 2: AssistenciaPage

**Estado Final:**

```
✓ Tabela de OS responsiva
✓ Mobile: Cards
✓ Desktop: Tabela com 6 colunas
✓ Status colorido
✓ Ações: editar, deletar, imprimir
```

### Task 3: ContratoPage

**Estado Final:**

```
✓ Tabela de contratos responsiva
✓ Mobile: Cards
✓ Desktop: Tabela com 8 colunas
✓ Datas formatadas
✓ Dropdown de ações
```

### Task 4: FormWizard

**Estado Final:**

```
✓ Proposta em 4 steps:
  - Dados básicos
  - Itens
  - Condições
  - Revisão
✓ Progress bar
✓ Validação por step
✓ Mobile responsive
```

### Task 5: PropostasPage

**Estado Final:**

```
✓ Tabela de propostas responsiva
✓ Mobile: Cards
✓ Desktop: Tabela 7 colunas
✓ Status com cores
✓ Link para editar
```

### Task 6: Lighthouse

**Estado Final:**

```
✓ Performance: 60-65
✓ Accessibility: 75-85
✓ Best Practices: 85-95
✓ SEO: 90+
✓ OVERALL: 65+
```

### Task 7+: Extras

**Estado Final:**

```
✓ Swipe gestures em navegação
✓ Breadcrumb responsivo
✓ Imagens otimizadas (WebP)
✓ 8-10 páginas responsivas
```

---

## 🔧 TECNOLOGIAS UTILIZADAS

```
React 18:        Componentes
TypeScript:      Type safety
Vite:            Build tool
Tailwind CSS:    Styling
shadcn/ui:       UI components
Supabase:        Backend
React Router:    Navegação
```

---

## 📈 MÉTRICAS DE SUCESSO

### Quantitativas

| Métrica                    | Meta Sprint 1 | Meta Sprint 2 |
| -------------------------- | ------------- | ------------- |
| Páginas Responsivas        | 2             | 8-10          |
| Componentes Reutilizáveis  | 4             | 6             |
| Lighthouse Score           | 60            | 70+           |
| TypeScript Errors (Sprint) | 0             | 0             |
| Build Time                 | < 3 min       | < 3 min       |

### Qualitativas

```
✓ Code mantém 0 erros TypeScript
✓ Sem breaking changes
✓ Documentação atualizada
✓ Testes funcionam em 4 viewports
✓ Performance melhor que 60
```

---

## 📚 DEPENDÊNCIAS & RISCOS

### Dependências

```
✓ Sprint 1 completo (prerequisites)
✓ ResponsiveTable funcional
✓ useMediaQuery funcional
✓ FormWizard funcional
```

### Riscos Identificados

| Risco                    | Probabilidade | Impacto | Mitigação               |
| ------------------------ | ------------- | ------- | ----------------------- |
| Tabelas muito complexas  | Média         | Alto    | Usar template + adaptar |
| TypeScript errors        | Baixa         | Médio   | Type checking contínuo  |
| Performance não melhora  | Baixa         | Médio   | Otimização CSS/JS       |
| Incompatibilidade mobile | Baixa         | Médio   | Testes contínuos        |

---

## 🎓 APRENDIZADOS ESPERADOS

### Técnicos

```
✓ Padrão de componentes reutilizáveis
✓ Hook patterns em React
✓ Media queries + CSS
✓ TypeScript generics
✓ Responsive design patterns
```

### Processuais

```
✓ Integração rápida de features
✓ Commit structure
✓ Git workflow
✓ Testing methodology
✓ Performance optimization
```

---

## 🚦 CRITÉRIO DE ENTRADA

Sprint 2 pode começar quando:

```
✅ Sprint 1 commits no main
✅ npm run type-check retorna 0 erros (Sprint 1)
✅ npm run build passa
✅ Testes de responsividade no Sprint 1 passam
✅ Documentação Sprint 1 completa
```

---

## 🏁 CRITÉRIO DE SAÍDA

Sprint 2 é sucesso quando:

```
✅ 8-10 páginas com ResponsiveTable
✅ 1-2 páginas com FormWizard
✅ Lighthouse 70+
✅ 0 TypeScript errors (Sprint 2)
✅ 0 breaking changes
✅ Documentação completa
✅ Commits estruturados no main
```

---

## 📞 PRÓXIMAS SPRINTS

### Sprint 3 (8 horas)

```
□ Image optimization (WebP, lazy loading)
□ Lighthouse > 75
□ Breadcrumb refinement
□ Mobile nav improvements
□ Full QA testing
```

### Sprint 4 (8 horas)

```
□ Staging deployment
□ User feedback collection
□ Bug fixes
□ Production deployment
□ Monitoring & metrics
```

### Sprint 5+ (Future)

```
□ Advanced animations
□ Dark mode support
□ Progressive Web App (PWA)
□ Offline support
□ Analytics integration
```

---

## 📋 TEMPLATE PARA DAILY STATUS

```
Date: [Data]
Completed:
□ Task X (20 min)
□ Task Y (20 min)
In Progress:
□ Task Z (15/30 min)
Blockers:
□ None / [Descrição]
Next:
□ Task W (próxima)
```

---

## 🎉 CONCLUSÃO

Sprint 2 vai expandir Sprint 1 de **2 páginas para 8-10 páginas responsivas**, mantendo **zero erros TypeScript** e **melhorando Lighthouse para 70+**.

**Timeline:** 12 horas (1.5 dias)
**Esforço:** Médio
**Risco:** Baixo
**Confiança:** Alta ✅

---

**Data Prevista Início:** 3 de Janeiro de 2026
**Data Prevista Fim:** 4 de Janeiro de 2026
**Status:** 🟢 Pronto para começar

🚀 **Sprint 2 - Let's go!**
