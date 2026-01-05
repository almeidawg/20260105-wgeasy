import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Plus, Edit2, Trash2, Copy, CheckSquare, Download, Share2, Save, X } from 'lucide-react';
import jsPDF from 'jspdf';

interface ChecklistTemplate {
  id: string;
  nome: string;
  nucleo: 'arquitetura' | 'engenharia' | 'marcenaria' | 'geral';
  descricao: string;
  ordem: number;
  ativo: boolean;
  total_itens?: number;
}

interface TemplateItem {
  id: string;
  texto: string;
  ordem: number;
  grupo?: string;
}

interface TemplateFormData {
  nome: string;
  nucleo: 'arquitetura' | 'engenharia' | 'marcenaria' | 'geral';
  descricao: string;
  ordem: number;
}

export default function ChecklistTemplatesPage() {
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<ChecklistTemplate | null>(null);
  const [items, setItems] = useState<TemplateItem[]>([]);

  // Modais
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showItemsModal, setShowItemsModal] = useState(false);

  // Form states
  const [formData, setFormData] = useState<TemplateFormData>({
    nome: '',
    nucleo: 'geral',
    descricao: '',
    ordem: 0
  });

  // Item editing
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemText, setEditingItemText] = useState('');
  const [newItemText, setNewItemText] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('checklist_templates')
        .select(`
          *,
          checklist_template_items(count)
        `)
        .order('ordem');

      if (error) throw error;

      const templatesWithCount = data?.map(t => ({
        ...t,
        total_itens: t.checklist_template_items?.[0]?.count || 0
      })) || [];

      setTemplates(templatesWithCount);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadTemplateItems(template: ChecklistTemplate) {
    try {
      const { data, error } = await supabase
        .from('checklist_template_items')
        .select('*')
        .eq('template_id', template.id)
        .order('ordem');

      if (error) throw error;
      setItems(data || []);
      setSelectedTemplate(template);
      setShowItemsModal(true);
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
    }
  }

  async function createTemplate() {
    try {
      const { error } = await supabase
        .from('checklist_templates')
        .insert({
          nome: formData.nome,
          nucleo: formData.nucleo,
          descricao: formData.descricao,
          ordem: formData.ordem
        });

      if (error) throw error;

      alert('Template criado com sucesso!');
      setShowCreateModal(false);
      resetForm();
      loadTemplates();
    } catch (error) {
      console.error('Erro ao criar template:', error);
      alert('Erro ao criar template');
    }
  }

  async function updateTemplate() {
    if (!selectedTemplate) return;

    try {
      const { error } = await supabase
        .from('checklist_templates')
        .update({
          nome: formData.nome,
          nucleo: formData.nucleo,
          descricao: formData.descricao,
          ordem: formData.ordem
        })
        .eq('id', selectedTemplate.id);

      if (error) throw error;

      alert('Template atualizado com sucesso!');
      setShowEditModal(false);
      resetForm();
      setSelectedTemplate(null);
      loadTemplates();
    } catch (error) {
      console.error('Erro ao atualizar template:', error);
      alert('Erro ao atualizar template');
    }
  }

  async function duplicateTemplate(template: ChecklistTemplate) {
    try {
      // Criar novo template
      const { data: newTemplate, error: templateError } = await supabase
        .from('checklist_templates')
        .insert({
          nome: `${template.nome} (Cópia)`,
          nucleo: template.nucleo,
          descricao: template.descricao,
          ordem: template.ordem + 1
        })
        .select()
        .single();

      if (templateError) throw templateError;

      // Copiar itens
      const { data: itemsData, error: itemsError } = await supabase
        .from('checklist_template_items')
        .select('*')
        .eq('template_id', template.id);

      if (itemsError) throw itemsError;

      if (itemsData && itemsData.length > 0) {
        const newItems = itemsData.map(item => ({
          template_id: newTemplate.id,
          texto: item.texto,
          ordem: item.ordem,
          grupo: item.grupo
        }));

        await supabase
          .from('checklist_template_items')
          .insert(newItems);
      }

      alert('Template duplicado com sucesso!');
      loadTemplates();
    } catch (error) {
      console.error('Erro ao duplicar template:', error);
      alert('Erro ao duplicar template');
    }
  }

  async function deleteTemplate(id: string) {
    if (!confirm('Tem certeza que deseja excluir este template?')) return;

    try {
      const { error } = await supabase
        .from('checklist_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      alert('Template excluído com sucesso!');
      loadTemplates();
    } catch (error) {
      console.error('Erro ao excluir template:', error);
      alert('Erro ao excluir template');
    }
  }

  async function addItem() {
    if (!selectedTemplate || !newItemText.trim()) return;

    try {
      // Separar por linhas e filtrar linhas vazias
      const lines = newItemText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      if (lines.length === 0) return;

      // Calcular ordem inicial
      const baseOrdem = items.length > 0 ? Math.max(...items.map(i => i.ordem)) + 1 : 0;

      // Criar array de itens para inserir
      const newItems = lines.map((line, index) => ({
        template_id: selectedTemplate.id,
        texto: line,
        ordem: baseOrdem + index
      }));

      const { error } = await supabase
        .from('checklist_template_items')
        .insert(newItems);

      if (error) throw error;

      setNewItemText('');
      loadTemplateItems(selectedTemplate);

      // Feedback
      const count = lines.length;
      if (count > 1) {
        alert(`${count} itens adicionados com sucesso!`);
      }
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      alert('Erro ao adicionar item');
    }
  }

  async function updateItem(itemId: string) {
    if (!editingItemText.trim()) return;

    try {
      const { error } = await supabase
        .from('checklist_template_items')
        .update({ texto: editingItemText.trim() })
        .eq('id', itemId);

      if (error) throw error;

      setEditingItemId(null);
      setEditingItemText('');
      if (selectedTemplate) loadTemplateItems(selectedTemplate);
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      alert('Erro ao atualizar item');
    }
  }

  async function deleteItem(itemId: string) {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;

    try {
      const { error } = await supabase
        .from('checklist_template_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      if (selectedTemplate) loadTemplateItems(selectedTemplate);
    } catch (error) {
      console.error('Erro ao excluir item:', error);
      alert('Erro ao excluir item');
    }
  }

  function openEditModal(template: ChecklistTemplate) {
    setSelectedTemplate(template);
    setFormData({
      nome: template.nome,
      nucleo: template.nucleo,
      descricao: template.descricao || '',
      ordem: template.ordem
    });
    setShowEditModal(true);
  }

  function resetForm() {
    setFormData({
      nome: '',
      nucleo: 'geral',
      descricao: '',
      ordem: 0
    });
  }

  function generatePDF(template: ChecklistTemplate, templateItems: TemplateItem[]) {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(17, 153, 142); // #11998e
    doc.text('Template de Checklist', 20, 20);

    // Template info
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(template.nome, 20, 35);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Núcleo: ${template.nucleo.charAt(0).toUpperCase() + template.nucleo.slice(1)}`, 20, 45);

    if (template.descricao) {
      doc.text(template.descricao, 20, 52, { maxWidth: 170 });
    }

    // Items
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Itens do Checklist:', 20, 65);

    let yPosition = 75;
    templateItems.forEach((item, index) => {
      // Checkbox
      doc.rect(20, yPosition - 3, 4, 4);

      // Text
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(`${index + 1}. ${item.texto}`, 160);
      doc.text(lines, 30, yPosition);

      yPosition += lines.length * 5 + 3;

      // New page if needed
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Gerado pelo WG EASY - Sistema Empresarial', 20, 285);

    // Save
    doc.save(`template-${template.nome.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`);
  }

  async function shareWhatsApp(template: ChecklistTemplate, templateItems: TemplateItem[]) {
    const text = `*${template.nome}*\n\n` +
      `Núcleo: ${template.nucleo.charAt(0).toUpperCase() + template.nucleo.slice(1)}\n` +
      (template.descricao ? `${template.descricao}\n` : '') +
      `\n*Itens do Checklist:*\n\n` +
      templateItems.map((item, i) => `${i + 1}. ${item.texto}`).join('\n') +
      `\n\n_Gerado pelo WG EASY_`;

    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  }

  function getNucleoColor(nucleo: string) {
    switch (nucleo) {
      case 'arquitetura': return 'bg-blue-100 text-blue-800';
      case 'engenharia': return 'bg-green-100 text-green-800';
      case 'marcenaria': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Templates de Checklists</h1>
          <p className="text-gray-600 mt-1">Gerencie modelos padronizados para os cards</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#F25C26] text-white rounded-lg hover:bg-[#d94d1f]"
        >
          <Plus size={20} />
          Novo Template
        </button>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Carregando templates...</p>
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <CheckSquare size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 mb-4">Nenhum template cadastrado</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-[#F25C26] text-white rounded-lg hover:bg-[#d94d1f]"
          >
            Criar Primeiro Template
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(template => (
            <div
              key={template.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">
                    {template.nome}
                  </h3>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getNucleoColor(template.nucleo)}`}>
                    {template.nucleo.charAt(0).toUpperCase() + template.nucleo.slice(1)}
                  </span>
                </div>
              </div>

              {/* Descrição */}
              {template.descricao && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {template.descricao}
                </p>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <CheckSquare size={16} />
                  <span>{template.total_itens || 0} itens</span>
                </div>
                <div>
                  Ordem: {template.ordem}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={async () => {
                    const { data } = await supabase
                      .from('checklist_template_items')
                      .select('*')
                      .eq('template_id', template.id)
                      .order('ordem');
                    loadTemplateItems(template);
                  }}
                  className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-medium"
                >
                  Gerenciar Itens
                </button>
                <button
                  onClick={() => openEditModal(template)}
                  className="px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100"
                  title="Editar"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => duplicateTemplate(template)}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  title="Duplicar"
                >
                  <Copy size={16} />
                </button>
                <button
                  onClick={() => deleteTemplate(template.id)}
                  className="px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100"
                  title="Excluir"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Criar/Editar Template */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                {showCreateModal ? 'Novo Template' : 'Editar Template'}
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Programa de Necessidades"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Núcleo *
                  </label>
                  <select
                    value={formData.nucleo}
                    onChange={(e) => setFormData({ ...formData, nucleo: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="geral">Geral</option>
                    <option value="arquitetura">Arquitetura</option>
                    <option value="engenharia">Engenharia</option>
                    <option value="marcenaria">Marcenaria</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Descrição do template..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ordem
                  </label>
                  <input
                    type="number"
                    value={formData.ordem}
                    onChange={(e) => setFormData({ ...formData, ordem: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  resetForm();
                  setSelectedTemplate(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={showCreateModal ? createTemplate : updateTemplate}
                className="px-4 py-2 bg-[#F25C26] text-white rounded-lg hover:bg-[#d94d1f] flex items-center gap-2"
              >
                <Save size={16} />
                {showCreateModal ? 'Criar' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Gerenciar Itens */}
      {showItemsModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800">{selectedTemplate.nome}</h2>
                <p className="text-sm text-gray-600 mt-1">Gerenciar itens do checklist</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    const { data } = await supabase
                      .from('checklist_template_items')
                      .select('*')
                      .eq('template_id', selectedTemplate.id)
                      .order('ordem');
                    generatePDF(selectedTemplate, data || []);
                  }}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                  title="Gerar PDF"
                >
                  <Download size={16} />
                  PDF
                </button>
                <button
                  onClick={async () => {
                    const { data } = await supabase
                      .from('checklist_template_items')
                      .select('*')
                      .eq('template_id', selectedTemplate.id)
                      .order('ordem');
                    shareWhatsApp(selectedTemplate, data || []);
                  }}
                  className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2"
                  title="Compartilhar WhatsApp"
                >
                  <Share2 size={16} />
                  WhatsApp
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Add New Item */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Adicionar Novo Item
                    </label>
                    <p className="text-xs text-gray-600 mt-1">
                      💡 Dica: Cole múltiplas linhas - cada linha será um item separado
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <textarea
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    onKeyDown={(e) => {
                      // Ctrl+Enter ou Cmd+Enter para adicionar
                      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                        e.preventDefault();
                        addItem();
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Digite o texto do item... (cada linha = um item)"
                    rows={4}
                  />
                  <button
                    type="button"
                    onClick={addItem}
                    className="px-4 py-2 bg-[#F25C26] text-white rounded-lg hover:bg-[#d94d1f] flex items-center gap-2 h-fit"
                  >
                    <Plus size={16} />
                    Adicionar
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Pressione <strong>Ctrl+Enter</strong> para adicionar rapidamente
                </p>
              </div>

              {/* Items List */}
              {items.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Nenhum item cadastrado</p>
              ) : (
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                    >
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-medium mt-1">
                        {index + 1}
                      </span>

                      {editingItemId === item.id ? (
                        <>
                          <input
                            type="text"
                            value={editingItemText}
                            onChange={(e) => setEditingItemText(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && updateItem(item.id)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                          <button
                            onClick={() => updateItem(item.id)}
                            className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            <Save size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setEditingItemId(null);
                              setEditingItemText('');
                            }}
                            className="px-3 py-1.5 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="flex-1">
                            <p className="text-gray-800">{item.texto}</p>
                            {item.grupo && (
                              <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                                {item.grupo}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              setEditingItemId(item.id);
                              setEditingItemText(item.texto);
                            }}
                            className="px-2 py-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => deleteItem(item.id)}
                            className="px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => {
                  setShowItemsModal(false);
                  setSelectedTemplate(null);
                  setEditingItemId(null);
                  setEditingItemText('');
                  setNewItemText('');
                  loadTemplates();
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
