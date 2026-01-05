import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { CheckSquare, Plus, Trash2, Check, ClipboardPaste, X } from 'lucide-react';

interface ChecklistItem {
  id: string;
  texto: string;
  concluido: boolean;
  ordem: number;
}

interface Checklist {
  id: string;
  nome: string;
  progresso: number;
  concluido: boolean;
  items?: ChecklistItem[];
}

interface CardChecklistProps {
  oportunidadeId: string;
}

export default function CardChecklist({ oportunidadeId }: CardChecklistProps) {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddText, setQuickAddText] = useState('');
  const [quickAddName, setQuickAddName] = useState('');
  const [creatingChecklist, setCreatingChecklist] = useState(false);
  const [expandedChecklist, setExpandedChecklist] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadChecklists();
    loadTemplates();
  }, [oportunidadeId]);

  async function loadChecklists() {
    try {
      const { data, error } = await supabase
        .from('cliente_checklists')
        .select(`
          *,
          cliente_checklist_items(*)
        `)
        .eq('oportunidade_id', oportunidadeId)
        .order('criado_em', { ascending: false });

      if (error) throw error;

      const checklistsWithItems = data?.map(c => ({
        ...c,
        items: c.cliente_checklist_items?.sort((a: any, b: any) => a.ordem - b.ordem) || []
      })) || [];

      setChecklists(checklistsWithItems);
    } catch (error) {
      console.error('Erro ao carregar checklists:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadTemplates() {
    try {
      const { data, error } = await supabase
        .from('checklist_templates')
        .select('id, nome, nucleo')
        .eq('ativo', true)
        .order('ordem');

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
    }
  }

  async function applyTemplate(templateId: string) {
    try {
      const { data, error } = await supabase
        .rpc('aplicar_template_checklist', {
          p_oportunidade_id: oportunidadeId,
          p_template_id: templateId
        });

      if (error) throw error;

      setShowTemplateSelector(false);
      loadChecklists();
    } catch (error) {
      console.error('Erro ao aplicar template:', error);
      alert('Erro ao aplicar template');
    }
  }

  async function toggleItem(checklistId: string, itemId: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from('cliente_checklist_items')
        .update({
          concluido: !currentStatus,
          concluido_em: !currentStatus ? new Date().toISOString() : null,
          concluido_por: !currentStatus ? (await supabase.auth.getUser()).data.user?.id : null
        })
        .eq('id', itemId);

      if (error) throw error;

      // Atualizar estado local
      setChecklists(prev => prev.map(c => {
        if (c.id === checklistId) {
          const updatedItems = c.items?.map(item =>
            item.id === itemId ? { ...item, concluido: !currentStatus } : item
          );
          const totalItems = updatedItems?.length || 0;
          const concluidos = updatedItems?.filter(i => i.concluido).length || 0;
          const progresso = totalItems > 0 ? Math.round((concluidos / totalItems) * 100) : 0;

          return {
            ...c,
            items: updatedItems,
            progresso,
            concluido: progresso === 100
          };
        }
        return c;
      }));
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
    }
  }

  async function deleteChecklist(checklistId: string) {
    if (!confirm('Tem certeza que deseja excluir este checklist?')) return;

    try {
      const { error } = await supabase
        .from('cliente_checklists')
        .delete()
        .eq('id', checklistId);

      if (error) throw error;

      setChecklists(prev => prev.filter(c => c.id !== checklistId));
    } catch (error) {
      console.error('Erro ao excluir checklist:', error);
    }
  }

  // Criar checklist rápido a partir de texto colado (cada linha = 1 item)
  async function criarChecklistRapido() {
    if (!quickAddText.trim()) {
      alert('Cole ou digite os itens do checklist');
      return;
    }

    // Separar texto por linhas e filtrar linhas vazias
    const linhas = quickAddText
      .split('\n')
      .map(linha => linha.trim())
      .filter(linha => linha.length > 0);

    if (linhas.length === 0) {
      alert('Nenhum item válido encontrado');
      return;
    }

    const nomeChecklist = quickAddName.trim() || `Checklist ${new Date().toLocaleDateString('pt-BR')}`;

    try {
      setCreatingChecklist(true);

      // 1. Criar o checklist
      const { data: novoChecklist, error: checklistError } = await supabase
        .from('cliente_checklists')
        .insert({
          oportunidade_id: oportunidadeId,
          nome: nomeChecklist,
          progresso: 0,
          concluido: false
        })
        .select()
        .single();

      if (checklistError) throw checklistError;

      // 2. Criar os itens do checklist
      const itensParaInserir = linhas.map((texto, index) => ({
        checklist_id: novoChecklist.id,
        texto: texto,
        concluido: false,
        ordem: index + 1
      }));

      const { error: itensError } = await supabase
        .from('cliente_checklist_items')
        .insert(itensParaInserir);

      if (itensError) throw itensError;

      // Fechar modal e recarregar
      setShowQuickAdd(false);
      setQuickAddText('');
      setQuickAddName('');
      loadChecklists();

    } catch (error) {
      console.error('Erro ao criar checklist:', error);
      alert('Erro ao criar checklist. Verifique o console.');
    } finally {
      setCreatingChecklist(false);
    }
  }

  // Handler para detectar paste no textarea
  function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    // O texto colado já será inserido automaticamente pelo browser
    // Apenas focamos no campo após um pequeno delay para UX
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 100);
  }

  // Contar quantos itens serão criados
  function contarItens(): number {
    return quickAddText
      .split('\n')
      .map(linha => linha.trim())
      .filter(linha => linha.length > 0).length;
  }

  function getNucleoColor(nucleo: string) {
    switch (nucleo) {
      case 'arquitetura': return 'bg-blue-500';
      case 'engenharia': return 'bg-green-500';
      case 'marcenaria': return 'bg-amber-500';
      default: return 'bg-gray-500';
    }
  }

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">
        Carregando checklists...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <CheckSquare size={20} />
          Checklists
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQuickAdd(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
            title="Colar lista de itens"
          >
            <ClipboardPaste size={16} />
            Colar
          </button>
          <button
            onClick={() => setShowTemplateSelector(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#F25C26] text-white rounded-lg hover:bg-[#d94d1f] text-sm"
          >
            <Plus size={16} />
            Template
          </button>
        </div>
      </div>

      {/* Checklists */}
      {checklists.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <CheckSquare size={32} className="mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500 text-sm mb-3">Nenhum checklist adicionado</p>
          <button
            onClick={() => setShowTemplateSelector(true)}
            className="px-4 py-2 bg-[#F25C26] text-white rounded-lg hover:bg-[#d94d1f] text-sm"
          >
            Adicionar Primeiro Checklist
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {checklists.map(checklist => (
            <div key={checklist.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Checklist Header */}
              <div
                className="p-3 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100"
                onClick={() => setExpandedChecklist(
                  expandedChecklist === checklist.id ? null : checklist.id
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{checklist.nome}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${checklist.progresso}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 font-medium">
                        {checklist.progresso}%
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChecklist(checklist.id);
                    }}
                    className="ml-3 p-1.5 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Checklist Items */}
              {expandedChecklist === checklist.id && (
                <div className="p-3 space-y-2">
                  {checklist.items && checklist.items.length > 0 ? (
                    checklist.items.map((item, index) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                        onClick={() => toggleItem(checklist.id, item.id, item.concluido)}
                      >
                        <div className={`
                          flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5
                          ${item.concluido
                            ? 'bg-blue-600 border-blue-600'
                            : 'border-gray-300 bg-white'
                          }
                        `}>
                          {item.concluido && <Check size={14} className="text-white" />}
                        </div>
                        <span className={`
                          flex-1 text-sm
                          ${item.concluido
                            ? 'text-gray-500 line-through'
                            : 'text-gray-800'
                          }
                        `}>
                          {item.texto}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 text-sm py-4">
                      Nenhum item neste checklist
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Template Selector Modal */}
      {showTemplateSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Selecionar Template</h3>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              {templates.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Nenhum template disponível
                </p>
              ) : (
                <div className="space-y-2">
                  {templates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => applyTemplate(template.id)}
                      className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getNucleoColor(template.nucleo)}`} />
                        <div>
                          <p className="font-medium text-gray-800">{template.nome}</p>
                          <p className="text-xs text-gray-500 capitalize">{template.nucleo}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowTemplateSelector(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Modal - Colar texto para criar checklist */}
      {showQuickAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <ClipboardPaste size={20} className="text-green-600" />
                  Criar Checklist Rápido
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Cole ou digite os itens - cada linha será um item do checklist
                </p>
              </div>
              <button
                type="button"
                title="Fechar"
                onClick={() => {
                  setShowQuickAdd(false);
                  setQuickAddText('');
                  setQuickAddName('');
                }}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Nome do checklist */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Checklist (opcional)
                </label>
                <input
                  type="text"
                  value={quickAddName}
                  onChange={(e) => setQuickAddName(e.target.value)}
                  placeholder={`Checklist ${new Date().toLocaleDateString('pt-BR')}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              {/* Área de texto para colar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Itens do Checklist
                </label>
                <textarea
                  ref={textareaRef}
                  value={quickAddText}
                  onChange={(e) => setQuickAddText(e.target.value)}
                  onPaste={handlePaste}
                  placeholder="Cole aqui sua lista de tarefas...&#10;&#10;Exemplo:&#10;Verificar medidas do ambiente&#10;Confirmar cores com cliente&#10;Solicitar aprovação do projeto"
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-sm"
                />
                {quickAddText && (
                  <p className="text-sm text-gray-500 mt-1">
                    {contarItens()} item(s) será(ão) criado(s)
                  </p>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowQuickAdd(false);
                  setQuickAddText('');
                  setQuickAddName('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                disabled={creatingChecklist}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={criarChecklistRapido}
                disabled={creatingChecklist || !quickAddText.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {creatingChecklist ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Criando...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    Criar Checklist
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
