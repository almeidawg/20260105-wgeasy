# ✅ SISTEMA DE MENÇÕES (@usuario) - GUIA COMPLETO

**Data:** 2 de Janeiro, 2026
**Status:** Sistema PARCIALMENTE IMPLEMENTADO - ATIVAR AGORA

---

## 🎯 O Que Você Vai Ter

```
Quando alguém fizer: @william
├── ✅ William recebe notificação no seu checklist diário
├── ✅ Aparece na seção "Menções Pendentes"
├── ✅ Pode importar para suas tarefas com 1 clique
└── ✅ Marcar como lido automático

Quando cliente fizer: @empresa
├── ✅ Aparece no checklist do cliente referenciado
├── ✅ Time interna vê as solicitações
└── ✅ Integrado com sistema de comentários
```

---

## 🔧 PASSO 1: Verificar Migração no Banco

### A. Verificar se a migração foi aplicada

```bash
# Terminal de navegação Supabase
# Ir em: SQL Editor → Executar query:
```

```sql
-- Verificar se tabelas existem
SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'ceo_checklist_mencoes'
) as tabela_existe;
```

**Se retornar `true`:** ✅ Já está aplicada
**Se retornar `false`:** ⚠️ Precisa aplicar

### B. Se não existe, aplicar agora:

Copiar todo o conteúdo de:
[20241228120000_checklist_mencoes.sql](supabase/migrations/20241228120000_checklist_mencoes.sql)

E executar no Supabase SQL Editor.

---

## 📋 PASSO 2: Ativar nos Componentes de Comentários

### Arquivo 1: ComentariosCliente.tsx

**Local:** `frontend/src/components/cliente/ComentariosCliente.tsx`

**O que adicionar ao textarea:**

```tsx
<textarea
  value={novoComentario}
  onChange={(e) => setNovoComentario(e.target.value)}
  placeholder="Digite sua solicitação... (use @usuario para mencionar)"
  className="w-full px-3 py-2 border rounded-lg"
/>
```

**Detectar menções ao salvar:**

```tsx
async function enviarComentario() {
  const mencoes = extrairMencoes(novoComentario);

  // Salvar comentário normal
  await criarComentario(novoComentario);

  // Processar menções se houver
  if (mencoes.length > 0) {
    await processarMencoes(mencoes, clienteId, "cliente");
  }
}

// Função auxiliar
function extrairMencoes(texto: string): string[] {
  const regex = /@(\w+)/g;
  const matches = texto.match(regex) || [];
  return matches.map((m) => m.substring(1)); // Remove @
}
```

---

### Arquivo 2: TaskComentarioEditor.tsx

**Local:** `frontend/src/components/cronograma/TaskComentarioEditor.tsx`

**JÁ TEM IMPLEMENTADO!** Mas precisa integrar com checklist:

```tsx
// Adicionar após enviar comentário:
async function enviarMencoes(comentarioId: string, mencoes: string[]) {
  if (mencoes.length === 0) return;

  const { data: usuarios } = await supabase
    .from("usuarios")
    .select("id, pessoa_id")
    .in("pessoas.nome", mencoes); // Buscar por nome

  for (const usuario of usuarios || []) {
    // Criar menção no checklist diário
    await supabase.from("ceo_checklist_mencoes").insert({
      usuario_mencionado_id: usuario.id,
      usuario_autor_id: usuarioAtualId,
      item_id: comentarioId,
      lido: false,
    });

    // Notificar via toast
    toast(`@${usuario.nome} foi mencionado!`);
  }
}
```

---

### Arquivo 3: ChecklistCard.tsx

**Local:** `frontend/src/components/checklists/ChecklistCard.tsx`

**JÁ TEM SISTEMA DE @!** Está funcionando:

```tsx
// Verificar que está ativo em:
// - showMentionDropdown (linha ~470)
// - insertMention() (linha ~480)
// - usuariosFiltrados (linha ~490)
```

✅ Este arquivo **já está pronto**, mas melhorar a função:

```tsx
// Melhorar: Salvar menções no banco
async function handleAddItem() {
  const item = await adicionarItem(novoItemText);

  // Detectar e processar menções
  const mencoes = extrairMencoes(novoItemText);
  if (mencoes.length > 0) {
    await criarNotificacoesMencoes(novoItemText, item.id);
  }

  setNovoItemText("");
}
```

---

## 🔔 PASSO 3: Criar/Melhorar o Checklist Diário

### Arquivo: DailyChecklistPanel.tsx (NOVO)

Criar arquivo em: `frontend/src/components/checklist/DailyChecklistPanel.tsx`

```tsx
// ============================================================
// COMPONENTE: Painel de Checklist Diário
// Mostra menções do dia para o usuário logado
// ============================================================

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { Bell, Check, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";

interface DailyMencao {
  id: string;
  item_id: string;
  usuario_autor_id: string;
  usuario_mencionado_id: string;
  lido: boolean;
  created_at: string;
  // Dados expandidos
  item?: {
    id: string;
    texto: string;
    checklist_id: string;
  };
  autor?: {
    nome: string;
    avatar_url?: string;
  };
}

export default function DailyChecklistPanel() {
  const { user } = useAuth();
  const [mencoes, setMencoes] = useState<DailyMencao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarMencoes();

    // Subscribe a mudanças em tempo real
    const channel = supabase
      .channel("mencoes_diarias")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ceo_checklist_mencoes",
          filter: `usuario_mencionado_id=eq.${user?.id}`,
        },
        (payload) => {
          carregarMencoes();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user?.id]);

  async function carregarMencoes() {
    try {
      const { data, error } = await supabase
        .from("ceo_checklist_mencoes")
        .select(
          `
          id,
          item_id,
          usuario_autor_id,
          usuario_mencionado_id,
          lido,
          created_at,
          ceo_checklist_itens!inner (
            id,
            texto,
            checklist_id
          ),
          usuario!usuario_autor_id (
            id,
            pessoas!inner (
              nome,
              avatar_url
            )
          )
        `
        )
        .eq("usuario_mencionado_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setMencoes(data as any);
    } catch (error) {
      console.error("Erro ao carregar menções:", error);
      toast.error("Erro ao carregar menções");
    } finally {
      setLoading(false);
    }
  }

  async function marcarComoLido(mencaoId: string) {
    try {
      await supabase
        .from("ceo_checklist_mencoes")
        .update({ lido: true })
        .eq("id", mencaoId);

      setMencoes((prev) =>
        prev.map((m) => (m.id === mencaoId ? { ...m, lido: true } : m))
      );

      toast.success("Marcado como lido");
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao marcar como lido");
    }
  }

  async function deletarMencao(mencaoId: string) {
    try {
      await supabase.from("ceo_checklist_mencoes").delete().eq("id", mencaoId);

      setMencoes((prev) => prev.filter((m) => m.id !== mencaoId));
      toast.success("Menção deletada");
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao deletar menção");
    }
  }

  const mencoesPendentes = mencoes.filter((m) => !m.lido);
  const mencoesPendentesCount = mencoesPendentes.length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Menções do Dia
            </h2>
          </div>
          {mencoesPendentesCount > 0 && (
            <span className="bg-red-500 text-white px-2.5 py-0.5 rounded-full text-sm font-medium">
              {mencoesPendentesCount}
            </span>
          )}
        </div>
      </div>

      {/* Conteúdo */}
      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin mx-auto w-6 h-6 border-2 border-blue-600 border-transparent rounded-full"></div>
          <p className="text-gray-600 mt-2">Carregando menções...</p>
        </div>
      ) : mencoes.length === 0 ? (
        <div className="p-8 text-center text-gray-400">
          <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">Nenhuma menção</p>
          <p className="text-sm mt-1">Você ainda não foi mencionado</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {mencoes.map((mencao) => (
            <div
              key={mencao.id}
              className={`p-4 hover:bg-gray-50 transition-colors ${
                !mencao.lido ? "bg-blue-50" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Avatar do autor */}
                {mencao.autor?.avatar_url ? (
                  <img
                    src={mencao.autor.avatar_url}
                    alt={mencao.autor?.nome}
                    className="w-8 h-8 rounded-full flex-shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
                )}

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    <span className="text-blue-600">@{mencao.autor?.nome}</span>{" "}
                    mencionou você
                  </p>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {mencao.item?.texto}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(mencao.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>

                {/* Status e ações */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!mencao.lido && (
                    <button
                      onClick={() => marcarComoLido(mencao.id)}
                      className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"
                      title="Marcar como lido"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deletarMencao(mencao.id)}
                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Deletar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      {mencoes.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            Mostrando {mencoes.length} de {mencoes.length} menções
          </p>
        </div>
      )}
    </div>
  );
}
```

---

## 📲 PASSO 4: Integrar no Dashboard

### Arquivo: DashboardPage.tsx

**Local:** `frontend/src/pages/dashboard/DashboardPage.tsx`

**Adicionar o componente:**

```tsx
import DailyChecklistPanel from "@/components/checklist/DailyChecklistPanel";

// Dentro do render, onde você quer que apareça:
<DailyChecklistPanel />;
```

---

## 🎨 PASSO 5: Melhorar Autocomplete de @

### Criar: MentionAutocomplete.tsx

```tsx
import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { AtSign, Loader2 } from "lucide-react";

interface Usuario {
  id: string;
  nome: string;
  tipo_usuario: string;
  avatar_url?: string;
  email?: string;
}

interface MentionAutocompleteProps {
  onSelect: (usuario: Usuario) => void;
  searchTerm: string;
}

export function MentionAutocomplete({
  onSelect,
  searchTerm,
}: MentionAutocompleteProps) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchTerm.length < 2) {
      setUsuarios([]);
      return;
    }

    buscarUsuarios();
  }, [searchTerm]);

  async function buscarUsuarios() {
    setLoading(true);
    try {
      const { data } = await supabase.rpc("buscar_usuarios_para_mencao", {
        termo: searchTerm,
      });

      setUsuarios(data || []);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    } finally {
      setLoading(false);
    }
  }

  if (usuarios.length === 0) return null;

  return (
    <div className="absolute bottom-full left-0 mb-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
      {loading && (
        <div className="p-3 text-center text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin inline" />
          Buscando...
        </div>
      )}

      {usuarios.map((usuario) => (
        <button
          key={usuario.id}
          type="button"
          onClick={() => onSelect(usuario)}
          className="w-full px-4 py-2.5 text-left hover:bg-blue-50 flex items-center gap-3 border-b last:border-b-0 transition-colors"
        >
          {usuario.avatar_url ? (
            <img
              src={usuario.avatar_url}
              alt={usuario.nome}
              className="w-8 h-8 rounded-full flex-shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center">
              <AtSign className="w-4 h-4 text-gray-500" />
            </div>
          )}
          <div className="flex-1">
            <p className="font-medium text-gray-900">{usuario.nome}</p>
            <p className="text-xs text-gray-500">
              {usuario.tipo_usuario} {usuario.email ? `- ${usuario.email}` : ""}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
```

---

## 🚀 PASSO 6: Checklist de Ativação

### Antes de usar:

- [ ] Verificar migração aplicada no Supabase
- [ ] Criar arquivo `DailyChecklistPanel.tsx`
- [ ] Adicionar import em `DashboardPage.tsx`
- [ ] Testar autocomplete com @
- [ ] Verificar se menções aparecem no checklist diário
- [ ] Testar envio de notificações
- [ ] Verificar marca como lido

### Teste prático:

1. **Login como usuário A**
2. **Criar comentário com @usuáriob**
3. **Switchar para usuário B**
4. **Verificar se apareceu em "Menções do Dia"**
5. **Clicar em ✓ para marcar como lido**
6. **Confirmar que desapareceu da seção de pendentes**

---

## 💡 Funcionalidades Extra (Futuro)

### Para Clientes:

```tsx
// Em ComentariosCliente.tsx, adicionar:
@cliente → aparece no checklist do cliente
@empresa → aparece na empresa/núcleo
@projeto → aparece no projeto específico
```

### Para Tarefas:

```tsx
// Em TaskComentarioEditor.tsx:
@task #numero → vincular task específica
@projeto #nome → vincular a projeto
```

### Notificações:

```tsx
// Email quando mencionado
// Push notification
// Bell icon com contador no header
```

---

## 🔗 Arquivos Principais

| Arquivo                                | Status     | O que faz             |
| -------------------------------------- | ---------- | --------------------- |
| `ChecklistCard.tsx`                    | ✅ Ativo   | Já tem @ autocomplete |
| `TaskComentarioEditor.tsx`             | ✅ Ativo   | Extrai menções        |
| `ComentariosCliente.tsx`               | ⚠️ Parcial | Precisa integração    |
| `DailyChecklistPanel.tsx`              | 🆕 Criar   | Mostra menções do dia |
| `20241228120000_checklist_mencoes.sql` | ✅ Existe  | Tabelas/views/funcões |

---

## 🎓 Como Funciona Tecnicamente

### Fluxo de Menção:

```
1. Usuário A digita: "Revisar projeto @William"
        ↓
2. Sistema detecta regex: @(\w+)
        ↓
3. Busca usuário com esse nome em usuarios
        ↓
4. Insere em ceo_checklist_mencoes:
   {
     usuario_mencionado_id: william_id,
     usuario_autor_id: usuario_a_id,
     item_id: comentario_id,
     lido: false
   }
        ↓
5. William vê em "Menções do Dia"
        ↓
6. Clica em ✓ para marcar como lido
        ↓
7. Sai da lista de "pendentes"
```

### Banco de Dados:

```sql
-- Tabela de menções
ceo_checklist_mencoes {
  id: UUID
  item_id: referência para ceo_checklist_itens
  usuario_mencionado_id: quem foi mencionado
  usuario_autor_id: quem mencionou
  lido: boolean (marcado como lido?)
  created_at: timestamp
}

-- View para facilitar busca
vw_checklist_com_mencoes {
  item info + mention info
}
```

---

## 📞 Erros Comuns

### Erro: "Usuário não encontrado"

```
Causa: Nome exato não existe
Solução: Usar autocomplete em vez de digitar
```

### Erro: "Menção não apareceu"

```
Causa: RLS policy bloqueando
Solução: Verificar se usuario_mencionado_id está correto
```

### Erro: "Autocomplete vazio"

```
Causa: Função buscar_usuarios_para_mencao não existe
Solução: Executar migration novamente
```

---

**Sistema pronto para ativar! Comece pelo PASSO 1 e siga em ordem.** ✅
