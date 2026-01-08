// ============================================================
// GOOGLE KEEP - API DE COMPARTILHAMENTO
// ============================================================

export interface ShareTarget {
  tipo: "pessoa" | "usuario";
  id: string;
  permissoes?: {
    pode_editar?: boolean;
    pode_marcar_itens?: boolean;
    pode_adicionar_itens?: boolean;
  };
}

export interface ShareInfo {
  id: string;
  tipo: "pessoa" | "usuario";
  target_id: string;
  nome: string;
  email: string | null;
  permissoes: {
    pode_editar: boolean;
    pode_marcar_itens: boolean;
    pode_adicionar_itens: boolean;
  };
  created_at: string;
}

export interface KeepNoteWithPermissions {
  id: string;
  title: string;
  text: string;
  items: Array<{ text: string; checked: boolean }> | null;
  createTime: string;
  updateTime: string;
  permissoes: {
    pode_editar: boolean;
    pode_marcar_itens: boolean;
    pode_adicionar_itens: boolean;
  };
  share_id: string;
}

/**
 * Compartilha uma nota com clientes ou usuarios internos
 */
export async function compartilharNota(
  noteId: string,
  targets: ShareTarget[],
  titulo?: string,
  criadoPorUsuarioId?: string
): Promise<{ success: boolean; compartilhamentos: any[] }> {
  const res = await fetch(`/api/keep/notes/${encodeURIComponent(noteId)}/share`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      compartilhar_com: targets,
      titulo,
      criado_por_usuario_id: criadoPorUsuarioId,
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Erro ao compartilhar nota");
  }

  return res.json();
}

/**
 * Obtém os compartilhamentos de uma nota
 */
export async function obterCompartilhamentos(
  noteId: string
): Promise<{ note_id: string; shares: ShareInfo[] }> {
  const res = await fetch(`/api/keep/notes/${encodeURIComponent(noteId)}/shares`);

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Erro ao buscar compartilhamentos");
  }

  return res.json();
}

/**
 * Remove um compartilhamento
 */
export async function removerCompartilhamento(
  noteId: string,
  shareId: string
): Promise<{ success: boolean }> {
  const res = await fetch(
    `/api/keep/notes/${encodeURIComponent(noteId)}/share/${encodeURIComponent(shareId)}`,
    { method: "DELETE" }
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Erro ao remover compartilhamento");
  }

  return res.json();
}

/**
 * Obtém notas compartilhadas com uma pessoa (cliente) ou usuario
 */
export async function obterNotasCompartilhadasComigo(
  pessoaId?: string,
  usuarioId?: string
): Promise<KeepNoteWithPermissions[]> {
  const params = new URLSearchParams();
  if (pessoaId) params.set("pessoa_id", pessoaId);
  if (usuarioId) params.set("usuario_id", usuarioId);

  const res = await fetch(`/api/keep/notes/shared-with-me?${params.toString()}`);

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Erro ao buscar notas compartilhadas");
  }

  return res.json();
}

/**
 * Atualiza um item de uma nota (marcar/desmarcar)
 */
export async function atualizarItemNota(
  noteId: string,
  itemIndex: number,
  checked: boolean,
  pessoaId?: string
): Promise<{ success: boolean; note: any }> {
  const res = await fetch(
    `/api/keep/notes/${encodeURIComponent(noteId)}/items/${itemIndex}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checked, pessoaId }),
    }
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Erro ao atualizar item");
  }

  return res.json();
}
