# 🔧 GUIA DE INTEGRAÇÃO RÁPIDA - Juridico Module

**Objetivo:** Guia passo-a-passo para integrar o módulo Jurídico ao projeto
**Tempo Estimado:** 15-20 minutos
**Pré-requisitos:** Git, Node.js, Supabase CLI

---

## ✅ Pre-Integration Checklist

- [ ] Código do Juridico revisado
- [ ] Arquivos SQL/TypeScript validados
- [ ] Dependências instaladas
- [ ] Testes básicos executados
- [ ] Database migration pronta

---

## 📋 Passo a Passo

### Passo 1: Database Migration (5 minutos)

A migração SQL já foi executada. Para confirmar:

```bash
# Verificar tabelas criadas
npx supabase db list

# Ou via SQL:
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'assistencia%' OR table_name LIKE 'financeiro_juridico'
```

Esperado:

```
✅ assistencia_juridica
✅ assistencia_juridica_historico
✅ financeiro_juridico
✅ vw_financeiro_juridico_resumo
✅ vw_financeiro_juridico_detalhado
```

### Passo 2: Copiar Arquivos API (2 minutos)

Arquivo já criado:

```
✅ frontend/src/lib/juridicoApi.ts (pronto)
```

Confirmar que existe:

```bash
ls -la frontend/src/lib/juridicoApi.ts
# Esperado: -rw-r--r-- ... juridicoApi.ts
```

### Passo 3: Copiar Componentes Frontend (5 minutos)

Arquivos já criados:

```
✅ frontend/src/pages/juridico/JuridicoPage.tsx
✅ frontend/src/pages/juridico/JuridicoDetalhePage.tsx
✅ frontend/src/pages/juridico/JuridicoFormPage.tsx
```

Confirmar:

```bash
ls -la frontend/src/pages/juridico/
# Esperado: 3 arquivos .tsx
```

### Passo 4: Atualizar Router (5 minutos)

**Arquivo:** `frontend/src/router.tsx` ou `frontend/src/App.tsx`

**Adicionar imports:**

```typescript
import { JuridicoPage } from "./pages/juridico/JuridicoPage";
import { JuridicoDetalhePage } from "./pages/juridico/JuridicoDetalhePage";
import { JuridicoFormPage } from "./pages/juridico/JuridicoFormPage";
```

**Adicionar rotas:**

```typescript
// Dentro do array de rotas:
{
  path: '/juridico',
  element: <JuridicoPage />,
},
{
  path: '/juridico/novo',
  element: <JuridicoFormPage />,
},
{
  path: '/juridico/:id',
  element: <JuridicoDetalhePage />,
},
{
  path: '/juridico/:id/editar',
  element: <JuridicoFormPage />,
},
```

**Exemplo completo:**

```typescript
import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { JuridicoPage } from "./pages/juridico/JuridicoPage";
import { JuridicoDetalhePage } from "./pages/juridico/JuridicoDetalhePage";
import { JuridicoFormPage } from "./pages/juridico/JuridicoFormPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      // ... outras rotas ...

      // Juridico module routes
      {
        path: "/juridico",
        element: <JuridicoPage />,
      },
      {
        path: "/juridico/novo",
        element: <JuridicoFormPage />,
      },
      {
        path: "/juridico/:id",
        element: <JuridicoDetalhePage />,
      },
      {
        path: "/juridico/:id/editar",
        element: <JuridicoFormPage />,
      },
    ],
  },
]);
```

### Passo 5: Adicionar Link no Menu (3 minutos)

**Arquivo:** `frontend/src/components/Navigation.tsx` ou similar

**Adicionar:**

```jsx
<NavLink
  to="/juridico"
  className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
>
  📜 Jurídico
</NavLink>
```

**Exemplo em HTML:**

```jsx
<nav className="sidebar-nav">
  <NavLink to="/dashboard">📊 Dashboard</NavLink>
  <NavLink to="/financeiro">💰 Financeiro</NavLink>
  <NavLink to="/assistencia">🆘 Assistência</NavLink>
  <NavLink to="/contratos">📋 Contratos</NavLink>
  <NavLink to="/juridico">📜 Jurídico</NavLink> {/* ← NOVO */}
  <NavLink to="/configuracoes">⚙️ Configurações</NavLink>
</nav>
```

### Passo 6: Validar TypeScript (3 minutos)

```bash
# Executar type-check
npx tsc --noEmit

# Esperado output:
# (sem erros - tipo "No errors found")
```

Se houver erros, verificar mensagens e corrigir imports.

### Passo 7: Testar Compilação (2 minutos)

```bash
# Build de desenvolvimento
npm run dev

# Esperado:
# ✨ Vite v5.0.0+ ready in XXXms
# ➜ Local: http://localhost:5173/
```

Abrir navegador e clicar em "Jurídico" no menu.

---

## 🧪 Testes Básicos

### Teste 1: Página de Listagem

```
1. Navegar para http://localhost:5173/juridico
2. Esperado: Página com header "Assistência Jurídica"
3. Botão "Nova Assistência" visível e clicável
4. Filtros: status, prioridade, tipo_processo visíveis
5. Table (vazia ou com dados se já houver)
```

### Teste 2: Criar Nova

```
1. Clicar em "Nova Assistência"
2. Esperado: Form com 6 seções
3. Preencher campos obrigatórios (titulo)
4. Clicar "Criar"
5. Esperado: Redirecionar para /juridico
6. Se houver erro: check console para detalhes
```

### Teste 3: Visualizar Detalhe

```
1. De volta na lista, clicar em um item
2. Esperado: Página de detalhe com informações completas
3. Badges de status, prioridade, tipo visíveis
4. Botões "Editar" e "Deletar" presentes
5. Seção de histórico (vazia se novo)
```

### Teste 4: Editar

```
1. Na página de detalhe, clicar "Editar"
2. Esperado: Form pré-preenchido com dados
3. Alterar um campo (ex: status)
4. Clicar "Atualizar"
5. Esperado: Redirecionar para detalhe com dados atualizados
```

### Teste 5: Mobile Responsivo

```
1. F12 → Toggle device toolbar (responsive mode)
2. Testar em iPhone 12 (390x844)
3. Esperado:
   - Layout apilado verticalmente
   - Filtros em coluna única
   - Table com scroll horizontal
   - Botões full-width
4. Testar swipe gestures (simular com mouse drag)
   - Swipe left: deve navegar para dashboard
   - Swipe right: deve voltar à lista
```

### Teste 6: Filtros

```
1. Na lista, selecionar status = "PENDENTE"
2. Esperado: Table atualiza para mostrar apenas PENDENTE
3. Selecionar prioridade = "ALTA"
4. Esperado: Combina filtros (AND logic)
5. Clicar em campo vazio para "limpar" filtros
6. Esperado: Volta a mostrar todos
```

---

## 🐛 Troubleshooting

### Erro: "Cannot find module 'juridicoApi'"

```
Solução:
1. Confirmar que juridicoApi.ts existe em frontend/src/lib/
2. Verificar import path: ./lib/juridicoApi
3. Limpar node_modules: rm -rf node_modules && npm install
4. Restart dev server: Ctrl+C, npm run dev
```

### Erro: "JuridicoPage is not defined"

```
Solução:
1. Verificar imports em router.tsx
2. Confirmar que arquivos existem em frontend/src/pages/juridico/
3. Check file names (case-sensitive)
4. Re-import se necessário
```

### Erro de Database: "Table assistencia_juridica does not exist"

```
Solução:
1. Verificar se migration foi executada
2. Conectar ao Supabase e confirmar tabelas:
   SELECT * FROM information_schema.tables WHERE table_schema='public'
3. Se não existir, executar migration manualmente:
   npx supabase db push
```

### Erro de TypeScript

```
Solução:
1. Rodar: npx tsc --noEmit
2. Ver erros específicos
3. Verificar tipos em juridicoApi.ts
4. Adicionar type annotations se necessário
```

### Página branca ao navegar para /juridico

```
Solução:
1. Abrir console (F12 → Console tab)
2. Ver erro exato
3. Verificar Network tab para falhas de API
4. Check se usuario está autenticado
5. Verificar RLS policies no Supabase
```

---

## 📝 Checklist de Integração

- [ ] Database tabelas criadas (assistencia_juridica, historico, financeiro_juridico)
- [ ] Database views criadas (vw_financeiro_juridico_resumo, vw_financeiro_juridico_detalhado)
- [ ] Database functions criadas (3 functions)
- [ ] Database triggers criados (4 triggers)
- [ ] Database RLS policies configuradas (7 policies)
- [ ] juridicoApi.ts copiado para frontend/src/lib/
- [ ] 3 componentes .tsx copiados para frontend/src/pages/juridico/
- [ ] Router atualizado com 4 rotas
- [ ] Menu/Navigation atualizado com link "Jurídico"
- [ ] TypeScript type-check passou (0 errors)
- [ ] npm run dev executa sem problemas
- [ ] /juridico página abre e carrega
- [ ] Form de criar nova assistência funciona
- [ ] Filtros funcionam
- [ ] Swipe gestures funcionam (mobile)
- [ ] Mobile responsivo testado
- [ ] Testes básicos passaram

---

## 🚀 Deploy Checklist

Antes de fazer deploy para produção:

- [ ] Todos os testes básicos passaram
- [ ] TypeScript compilation sem erros
- [ ] Database migration validada
- [ ] RLS policies testadas
- [ ] No console errors
- [ ] Mobile tested em device real
- [ ] Performance aceitável (< 3s load time)
- [ ] Documentação lida e compreendida
- [ ] Team alinhado em roadmap
- [ ] Backup do database feito
- [ ] Staging deployment testado

---

## 📞 Contato & Support

Se encontrar problemas:

1. **Verifique primeiro:**

   - Este guia de integração
   - JURIDICO_CONCLUSAO.md
   - SPRINT5_PLANO.md

2. **Então consulte:**

   - juridicoApi.ts para interfaces
   - JuridicoPage.tsx para exemplos de uso
   - Supabase documentation

3. **Se ainda precisar:**
   - Check browser console (F12)
   - Check network requests (DevTools Network tab)
   - Check database (Supabase dashboard)

---

## ✨ Dicas & Tricks

### Adicionar mais campos no form

```typescript
// 1. Adicionar ao interface em juridicoApi.ts
export interface AssistenciaJuridica {
  // ... existing fields ...
  novo_campo: string // ← adicionar aqui
}

// 2. Adicionar ao database (migration)
ALTER TABLE assistencia_juridica ADD COLUMN novo_campo VARCHAR(100)

// 3. Adicionar ao form em JuridicoFormPage.tsx
<input
  type="text"
  value={formData.novo_campo}
  onChange={(e) => handleChange('novo_campo', e.target.value)}
  placeholder="..."
/>
```

### Personalizar cores de badges

```typescript
// Em JuridicoPage.tsx, função statusColors:
const statusColors = {
  PENDENTE: "bg-gray-100 text-gray-800", // ← mudar cores aqui
  EM_ANALISE: "bg-blue-100 text-blue-800",
  // ...
};
```

### Adicionar coluna ao table

```typescript
// Em JuridicoPage.tsx, array columns:
{
  key: 'novo_campo',
  header: 'Novo Campo',
  width: 'w-[150px]',
  render: (row) => row.novo_campo,
},
```

---

## 🎯 Próximo Passo

Após integração bem-sucedida:

1. ✅ Fazer commit com mensagem descritiva
2. ✅ Push para branch de feature
3. ✅ Criar pull request
4. ✅ Revisar com time
5. ✅ Merge para main
6. ✅ Deploy para produção
7. ✅ Monitor por erros
8. 🔄 Iniciar Sprint 5 (Advanced Filtering, Virtualization, etc)

---

**Versão:** 1.0
**Data:** 2 de janeiro de 2026
**Status:** ✅ Ready to Integrate
**Tempo Total de Integração:** ~15-20 minutos

---

**🎉 Integração concluída com sucesso!**
