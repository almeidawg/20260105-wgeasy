// ============================================================
// COMPONENTE: ChecklistManager
// Sistema WG Easy - Grupo WG Almeida
// ============================================================
// Gerencia todos os checklists de um registro específico
// ============================================================

import { useState, useEffect } from "react";
import { supabaseRaw as supabase } from "@/lib/supabaseClient";
import { Checklist, ChecklistTemplate, VinculoTipo } from "@/types/checklist";
import { ChecklistCard } from "./ChecklistCard";
import { Plus, FileCheck } from "lucide-react";
import { toast } from "sonner";

interface ChecklistManagerProps {
  vinculoTipo: VinculoTipo;
  vinculoId: string;
  nucleoId: string;
  readOnly?: boolean;
}

export function ChecklistManager({
  vinculoTipo,
  vinculoId,
  nucleoId,
  readOnly = false,
}: ChecklistManagerProps) {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [newChecklistTitle, setNewChecklistTitle] = useState("");

  useEffect(() => {
    loadChecklists();
    if (!readOnly) {
      loadTemplates();
    }
  }, [vinculoTipo, vinculoId]);

  async function loadChecklists() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("checklists")
        .select("*")
        .eq("vinculo_tipo", vinculoTipo)
        .eq("vinculo_id", vinculoId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setChecklists(data || []);
    } catch (error) {
      console.error("Erro ao carregar checklists:", error);
      toast.error("Erro ao carregar checklists");
    } finally {
      setLoading(false);
    }
  }

  async function loadTemplates() {
    try {
      const { data, error } = await supabase
        .from("checklist_templates")
        .select("*")
        .eq("nucleo_id", nucleoId)
        .eq("ativo", true)
        .order("nome");

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error("Erro ao carregar templates:", error);
    }
  }

  async function createEmptyChecklist() {
    if (!newChecklistTitle.trim()) {
      toast.error("Digite um título para o checklist");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("checklists")
        .insert({
          titulo: newChecklistTitle.trim(),
          vinculo_tipo: vinculoTipo,
          vinculo_id: vinculoId,
          nucleo_id: nucleoId,
        })
        .select()
        .single();

      if (error) throw error;

      setChecklists((prev) => [...prev, data]);
      setNewChecklistTitle("");
      setShowNewDialog(false);
      toast.success("Checklist criado com sucesso!");
    } catch (error) {
      console.error("Erro ao criar checklist:", error);
      toast.error("Erro ao criar checklist");
    }
  }

  async function createFromTemplate(template: ChecklistTemplate) {
    try {
      const { data, error } = await supabase.rpc("criar_checklist_de_template", {
        p_template_id: template.id,
        p_titulo: template.nome,
        p_vinculo_tipo: vinculoTipo,
        p_vinculo_id: vinculoId,
        p_nucleo_id: nucleoId,
      });

      if (error) throw error;

      await loadChecklists();
      setShowTemplateDialog(false);
      toast.success(`Checklist "${template.nome}" criado com sucesso!`);
    } catch (error) {
      console.error("Erro ao criar checklist do template:", error);
      toast.error("Erro ao criar checklist do template");
    }
  }

  async function deleteChecklist(checklistId: string) {
    if (!confirm("Deseja realmente excluir este checklist?")) return;

    try {
      const { error } = await supabase
        .from("checklists")
        .delete()
        .eq("id", checklistId);

      if (error) throw error;

      setChecklists((prev) => prev.filter((c) => c.id !== checklistId));
      toast.success("Checklist excluído com sucesso");
    } catch (error) {
      console.error("Erro ao deletar checklist:", error);
      toast.error("Erro ao deletar checklist");
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-40 bg-gray-100 rounded-lg animate-pulse"></div>
        <div className="h-40 bg-gray-100 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      {!readOnly && (
        <div className="flex gap-2">
          <button
            onClick={() => setShowNewDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#F25C26] text-white rounded-lg hover:bg-[#d94d1f] transition-colors text-sm font-medium"
          >
            <Plus size={16} />
            Novo Checklist
          </button>

          {templates.length > 0 && (
            <button
              onClick={() => setShowTemplateDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
            >
              <FileCheck size={16} />
              Usar Template
            </button>
          )}
        </div>
      )}

      {/* Checklists */}
      {checklists.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
          <FileCheck size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">Nenhum checklist criado</p>
          {!readOnly && (
            <p className="text-sm text-gray-400 mt-2">
              Crie um checklist novo ou use um template
            </p>
          )}
        </div>
      )}

      {checklists.map((checklist) => (
        <ChecklistCard
          key={checklist.id}
          checklist={checklist}
          onUpdate={loadChecklists}
          onDelete={() => deleteChecklist(checklist.id)}
          readOnly={readOnly}
        />
      ))}

      {/* Dialog: Novo Checklist */}
      {showNewDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Novo Checklist</h3>
            <input
              type="text"
              value={newChecklistTitle}
              onChange={(e) => setNewChecklistTitle(e.target.value)}
              placeholder="Título do checklist..."
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") createEmptyChecklist();
                if (e.key === "Escape") setShowNewDialog(false);
              }}
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={createEmptyChecklist}
                className="flex-1 px-4 py-2 bg-[#F25C26] text-white rounded-lg hover:bg-[#d94d1f]"
              >
                Criar
              </button>
              <button
                onClick={() => {
                  setShowNewDialog(false);
                  setNewChecklistTitle("");
                }}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog: Templates */}
      {showTemplateDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Escolher Template</h3>
            <div className="space-y-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => createFromTemplate(template)}
                  className="w-full text-left p-3 border rounded-lg hover:bg-blue-50 hover:border-blue-500 transition-colors"
                >
                  <div className="font-medium text-gray-900">{template.nome}</div>
                  {template.descricao && (
                    <div className="text-sm text-gray-500 mt-1">
                      {template.descricao}
                    </div>
                  )}
                  {template.categoria && (
                    <div className="text-xs text-blue-600 mt-1 capitalize">
                      {template.categoria}
                    </div>
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowTemplateDialog(false)}
              className="w-full mt-4 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
