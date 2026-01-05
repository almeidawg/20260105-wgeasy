# 📊 DIAGRAMA DO SISTEMA DE MENÇÕES (@usuario)

---

## 🎯 Fluxo Completo

```
┌─────────────────────────────────────────────────────────────────┐
│                    USUÁRIO A - Criar Menção                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────┐
        │  Digita comentário com @usuario      │
        │  "Revisar projeto @William"          │
        │                                       │
        │  1. Digita: @                        │
        │  2. Autocomplete aparece             │
        │  3. Seleciona usuário                │
        │  4. Clica ENVIAR                     │
        └──────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────┐
        │  MentionAutocomplete.tsx              │
        │  1. Detecta regex: @(\w+)             │
        │  2. Busca em supabase.rpc()           │
        │  3. Mostra dropdown                  │
        │  4. User seleciona                   │
        └──────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────┐
        │  extrairMencoes("@William")           │
        │  Retorna: ["William"]                │
        └──────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────┐
        │  Inserir em banco de dados           │
        │  INSERT INTO ceo_checklist_mencoes   │
        │  {                                    │
        │    usuario_mencionado_id: william_id │
        │    usuario_autor_id: usuarioA_id     │
        │    item_id: comentario_id            │
        │    lido: false                       │
        │  }                                    │
        └──────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  USUÁRIO B - Receber Menção                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────┐
        │  DailyChecklistPanel.tsx              │
        │  1. Real-time subscription (Supabase)│
        │  2. Detecta novo registro            │
        │  3. Mostra badge: "1"                │
        │  4. Lista menção no painel           │
        └──────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────┐
        │  "Menções do Dia" - Painel           │
        │                                       │
        │  ┌─────────────────────────────────┐ │
        │  │ @usuarioA mencionou você        │ │
        │  │ "Revisar projeto..."            │ │
        │  │ 5 minutos atrás                 │ │
        │  │                                  │ │
        │  │ [✓] [🗑]                        │ │
        │  └─────────────────────────────────┘ │
        └──────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────┐
        │  Clica em ✓ (marcar como lido)      │
        │                                       │
        │  UPDATE ceo_checklist_mencoes        │
        │  SET lido = true                    │
        │  WHERE id = menção_id               │
        └──────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────┐
        │  Sumidesaparece de "Pendentes"       │
        │  Continua no histórico               │
        │  Pode deletar se quiser              │
        └──────────────────────────────────────┘
```

---

## 🏗️ Arquitetura do Sistema

```
┌────────────────────────────────────────────────────┐
│           FRONTEND - React Components              │
├────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │    DailyChecklistPanel.tsx (300+ linhas)    │  │
│  │  - Mostra menções pendentes                 │  │
│  │  - Real-time updates                        │  │
│  │  - Mark as read / Delete                    │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │   MentionAutocomplete.tsx (400+ linhas)     │  │
│  │  - Dropdown ao digitar @                    │  │
│  │  - Busca de usuários                        │  │
│  │  - Hook: useMentionAutocomplete()           │  │
│  │  - Helpers: extrairMencoes()                │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │   Componentes Existentes                    │  │
│  │  - ChecklistCard.tsx ✅ JÁ ATIVO           │  │
│  │  - TaskComentarioEditor.tsx ✅ JÁ ATIVO   │  │
│  │  - ComentariosCliente.tsx ⚠️ INTEGRAR     │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
└────────────────────────────────────────────────────┘
              │
              │ Supabase Client
              │
┌─────────────┴─────────────────────────────────────┐
│        BANCO DE DADOS - PostgreSQL                │
├────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │  Tabela: ceo_checklist_mencoes              │  │
│  │  ├─ id: UUID (PK)                          │  │
│  │  ├─ item_id: UUID (FK → ceo_checklist...)  │  │
│  │  ├─ usuario_mencionado_id: UUID (FK)       │  │
│  │  ├─ usuario_autor_id: UUID (FK)            │  │
│  │  ├─ lido: BOOLEAN                          │  │
│  │  ├─ created_at: TIMESTAMP                  │  │
│  │  └─ Índices: mencionado, item, lido        │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │  Função RPC: buscar_usuarios_para_mencao()  │  │
│  │  ├─ Input: termo (texto para buscar)        │  │
│  │  ├─ Output: id, nome, tipo_usuario, avatar  │  │
│  │  └─ Limit: 10 resultados                    │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │  View: vw_checklist_com_mencoes             │  │
│  │  ├─ Itens + Menções relacionadas            │  │
│  │  ├─ Autor + Mencionado info                 │  │
│  │  └─ Para queries complexas                  │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │  RLS Policies (Row Level Security)          │  │
│  │  ├─ SELECT: própria ou como autor           │  │
│  │  ├─ INSERT: autor do item                   │  │
│  │  ├─ UPDATE: mencionado pode marcar lido     │  │
│  │  └─ DELETE: autor pode deletar              │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
└────────────────────────────────────────────────────┘
```

---

## 📦 Componentes Criados

### 1. DailyChecklistPanel.tsx

```
Localização: frontend/src/components/checklist/
Tamanho: 450+ linhas
Funções principais:
├─ carregarMencoes()
├─ marcarComoLido(mencaoId)
├─ deletarMencao(mencaoId)
└─ marcarTodosComoLidos()

Features:
✅ Real-time com Supabase
✅ Avatar do autor
✅ Data relativa (5m atrás, 2h atrás)
✅ Badge com contador
✅ Botões de ação
✅ Loading states
✅ Error handling
```

### 2. MentionAutocomplete.tsx

```
Localização: frontend/src/components/checklist/
Tamanho: 450+ linhas
Componente: <MentionAutocomplete />
Hook: useMentionAutocomplete()
Helpers:
├─ extrairMencoes(texto)
├─ formatarTextoComMencoes(texto)
└─ obterTipoLabel(tipo)

Features:
✅ Dropdown autocomplete
✅ Navegação com teclado
✅ Avatar de usuários
✅ Tipo de usuário (Master, Admin, etc)
✅ Email na tooltip
✅ Performance otimizada
```

---

## 🔗 Fluxo de Integração

```
OPÇÃO 1: Dashboard (RECOMENDADO)
┌──────────────────────────────────────┐
│ frontend/src/pages/dashboard/        │
│ DashboardPage.tsx                    │
└──────────────────────────────────────┘
              │
              ▼ Adicionar:
         <DailyChecklistPanel />
              │
              ▼
Usuário vê "Menções do Dia" assim que loga


OPÇÃO 2: ChecklistCard (JÁ FUNCIONA)
┌──────────────────────────────────────┐
│ frontend/src/components/checklists/  │
│ ChecklistCard.tsx                    │
│                                       │
│ "Adicionar um item... (use @usuario) │
│ para mencionar)"                     │
└──────────────────────────────────────┘
   ✅ Digitar @usuario
   ✅ Ver dropdown
   ✅ Selecionar
   ✅ Sistema salva automaticamente


OPÇÃO 3: TaskComentarioEditor (JÁ FUNCIONA)
┌──────────────────────────────────────┐
│ frontend/src/components/cronograma/  │
│ TaskComentarioEditor.tsx             │
│                                       │
│ Detecta @usuario ao enviar comentário│
└──────────────────────────────────────┘
   ✅ Extrair menções com regex
   ✅ Salvar em ceo_checklist_mencoes
   ✅ Enviar notificação


OPÇÃO 4: ComentariosCliente (INTEGRAR)
┌──────────────────────────────────────┐
│ frontend/src/components/cliente/     │
│ ComentariosCliente.tsx               │
└──────────────────────────────────────┘
   Adicionar import:
   import { useMentionAutocomplete }
   from "@/components/checklist/..."

   Usar hook no textarea
   Mostrar <MentionAutocomplete />
   Processar menções ao salvar
```

---

## 📋 Checklist de Implementação

### Etapa 1: Verificação (5 min)

```
┌─ Verificar migração
│  └─ SELECT EXISTS(... ceo_checklist_mencoes)
├─ Verificar RLS policies
│  └─ Ir em Supabase > Table > RLS
└─ Verificar função RPC
   └─ buscar_usuarios_para_mencao()
```

### Etapa 2: Componentes (Já feito ✅)

```
├─ ✅ DailyChecklistPanel.tsx criado
├─ ✅ MentionAutocomplete.tsx criado
├─ ✅ Helpers e hooks implementados
└─ ✅ TypeScript interfaces definidas
```

### Etapa 3: Integração Dashboard (10 min)

```
├─ Abrir DashboardPage.tsx
├─ Adicionar import
├─ Adicionar <DailyChecklistPanel /> no render
├─ npm run build (verificar erros)
└─ Teste local
```

### Etapa 4: Integração Comentários (5 min - Opcional)

```
├─ Abrir ComentariosCliente.tsx
├─ Adicionar import MentionAutocomplete
├─ Usar hook useMentionAutocomplete()
├─ Adicionar dropdown no textarea
└─ Testar @usuario no campo
```

### Etapa 5: Testes (20 min)

```
Test 1: Criar Menção
├─ Login como Usuário A
├─ Ir para comentário/tarefa
├─ Digitar @Usuário B
├─ Ver dropdown
├─ Selecionar com click ou Enter
└─ Enviar comentário

Test 2: Receber Menção
├─ Trocar para Usuário B
├─ Ir para Dashboard
├─ Ver "Menções do Dia"
├─ Contar badge
└─ Ver detalhes da menção

Test 3: Marcar como Lido
├─ Clicar em ✓ na menção
├─ Ver status mudar
├─ Badge decrementar
└─ Voltar para histórico

Test 4: Deletar Menção
├─ Clicar em 🗑 na menção
├─ Confirmar deleção
├─ Desaparecer da lista
└─ Não contar no badge
```

---

## 🎨 Interface Visual

### Painel de Menções

```
╔═══════════════════════════════════════════════════════╗
║  🔔 Menções do Dia  [3]         Marcar tudo ×        ║
╠═══════════════════════════════════════════════════════╣
║                                                        ║
║  👤  @usuário_a mencionou você                    ✓ 🗑 ║
║     "Revisar projeto de engenharia..."            │  │
║     🕒 5 minutos atrás                             ● │
║                                                        ║
║  👤  @usuário_b mencionou você                    ✓ 🗑 ║
║     "Confirmar medidas do ambiente"               │  │
║     🕒 1 hora atrás                                ● │
║                                                        ║
║  👤  @usuário_c mencionou você                       🗑 ║
║     "Enviar proposta para cliente"                    │
║     🕒 Ontem às 15:30                                │
║                                                        ║
╠═══════════════════════════════════════════════════════╣
║  2 pendentes          [Atualizar]                    ║
╚═══════════════════════════════════════════════════════╝
```

### Dropdown de Autocomplete

```
Digitar no textarea:
"@wil"
        │
        ▼
╔═══════════════════════════════════════════╗
║ Mencionar usuário                         ║
╟───────────────────────────────────────────╢
║                                           ║
║  👤 @William Costa            [Gerente]   ║
║     william.costa@wg.com.br              ║
║                                           ║
║  👤 @Wiliam Silva             [Admin]     ║
║     wiliam@wg.com.br                    ║
║                                           ║
╟───────────────────────────────────────────╢
║ ↓↑ Navegar • Enter para selecionar       ║
╚═══════════════════════════════════════════╝
```

---

## 🚀 Deployment

### Local Testing

```bash
# Terminal 1: Frontend
cd frontend
npm install
npm run dev

# Terminal 2: Supabase (opcional local)
supabase start

# Abrir browser:
http://localhost:5173
```

### Production Checklist

```
├─ Migration aplicada em prod ✓
├─ RLS policies corretas ✓
├─ Função RPC funcional ✓
├─ DailyChecklistPanel no Dashboard ✓
├─ Testes de menção concluídos ✓
├─ Performance (real-time) OK ✓
└─ Documentação atualizada ✓
```

---

## 📊 Métricas de Sucesso

```
✅ Metrica 1: Menções por dia
   └─ Esperado: 5-10 menções por usuário/dia

✅ Metrica 2: Taxa de leitura
   └─ Esperado: 80%+ de menções lidas em 24h

✅ Metrica 3: Tempo de resposta
   └─ Esperado: <200ms para exibir dropdown

✅ Metrica 4: Real-time
   └─ Esperado: <1s para sincronizar novo painel

✅ Metrica 5: Erros
   └─ Esperado: <0.1% de falhas nas menções
```

---

## 📞 Suporte e Troubleshooting

### Problema: Autocomplete não aparece

```
1. Verificar se @função está sendo acionada
2. Console: console.log(searchTerm)
3. Verificar RPC buscar_usuarios_para_mencao
4. Testar query direto no SQL Editor
```

### Problema: Menção não salva

```
1. Verificar se INSERT foi executado
2. Supabase > Table Editor > ceo_checklist_mencoes
3. Verificar RLS policy
4. Verificar se usuario_autor_id está preenchido
```

### Problema: DailyChecklistPanel vazio

```
1. Verificar se subscription está ativo
2. Console: supabase.channel logs
3. Verificar usuario_mencionado_id
4. Testar query: SELECT * FROM ceo_checklist_mencoes
```

---

**Sistema de Menções - Documentação Completa ✅**
