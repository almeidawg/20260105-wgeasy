import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Receipt, Filter, FileText, Download, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabaseRaw as supabase } from '@/lib/supabaseClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DateInputBR } from '@/components/ui/DateInputBR';

const ReembolsosPage = () => {
  const { toast } = useToast();
  const [reembolsos, setReembolsos] = useState<any[]>([]);
  const [obras, setObras] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [contratos, setContratos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filtros
  const [filterDataInicio, setFilterDataInicio] = useState('');
  const [filterDataFim, setFilterDataFim] = useState('');
  const [filterContrato, setFilterContrato] = useState('');
  const [filterObra, setFilterObra] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [newReembolso, setNewReembolso] = useState({
    obra_id: '',
    categoria_id: '',
    valor: '',
    data: new Date().toISOString().split('T')[0],
    status: 'Pendente',
    contrato_id: '',
    descricao: ''
  });

  // Estados para busca nos selects
  const [searchContrato, setSearchContrato] = useState('');
  const [searchObra, setSearchObra] = useState('');
  const [searchCategoria, setSearchCategoria] = useState('');

  // Listas filtradas para os selects
  const contratosFiltrados = useMemo(() => {
    if (!searchContrato) return contratos;
    return contratos.filter(c =>
      c.numero?.toLowerCase().includes(searchContrato.toLowerCase()) ||
      c.titulo?.toLowerCase().includes(searchContrato.toLowerCase())
    );
  }, [contratos, searchContrato]);

  const obrasFiltradas = useMemo(() => {
    if (!searchObra) return obras;
    return obras.filter(o => o.nome?.toLowerCase().includes(searchObra.toLowerCase()));
  }, [obras, searchObra]);

  const categoriasFiltradas = useMemo(() => {
    if (!searchCategoria) return categorias;
    return categorias.filter(c => c.name?.toLowerCase().includes(searchCategoria.toLowerCase()));
  }, [categorias, searchCategoria]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Buscar reembolsos com joins corretos
      const { data: reembolsosData, error: reembolsosError } = await supabase
        .from('reembolsos')
        .select('*, obras(nome), fin_categories(name), contratos(numero, titulo)')
        .range(0, 49999)
        .order('data', { ascending: false });

      // Buscar dados auxiliares em paralelo
      const [obrasRes, categoriasRes, contratosRes] = await Promise.all([
        supabase.from('obras').select('id, nome'),
        supabase.from('fin_categories').select('id, name'),
        supabase.from('contratos').select('id, numero, titulo').order('numero', { ascending: false })
      ]);

      if (reembolsosError) throw reembolsosError;

      setReembolsos(reembolsosData || []);
      setObras(obrasRes.data || []);
      setCategorias(categoriasRes.data || []);
      setContratos(contratosRes.data || []);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erro ao buscar dados', description: error.message });
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Filtrar reembolsos
  const filteredReembolsos = useMemo(() => {
    return reembolsos.filter(r => {
      if (filterDataInicio && r.data < filterDataInicio) return false;
      if (filterDataFim && r.data > filterDataFim) return false;
      if (filterContrato && r.contrato_id !== filterContrato) return false;
      if (filterObra && r.obra_id !== filterObra) return false;
      if (filterCategoria && r.categoria_id !== filterCategoria) return false;
      if (filterStatus && r.status !== filterStatus) return false;
      return true;
    });
  }, [reembolsos, filterDataInicio, filterDataFim, filterContrato, filterObra, filterCategoria, filterStatus]);

  // Totais
  const totais = useMemo(() => {
    const total = filteredReembolsos.reduce((acc, r) => acc + (r.valor || 0), 0);
    const pendente = filteredReembolsos.filter(r => r.status === 'Pendente').reduce((acc, r) => acc + (r.valor || 0), 0);
    const pago = filteredReembolsos.filter(r => r.status === 'Pago').reduce((acc, r) => acc + (r.valor || 0), 0);
    return { total, pendente, pago };
  }, [filteredReembolsos]);

  const limparFiltros = () => {
    setFilterDataInicio('');
    setFilterDataFim('');
    setFilterContrato('');
    setFilterObra('');
    setFilterCategoria('');
    setFilterStatus('');
  };

  const filtrosAtivos = [filterDataInicio, filterDataFim, filterContrato, filterObra, filterCategoria, filterStatus].filter(Boolean).length;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setNewReembolso(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSelectChange = (name: string, value: string) => setNewReembolso(prev => ({ ...prev, [name]: value }));

  const handleAddReembolso = async () => {
    if (!newReembolso.valor) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Preencha o valor do reembolso.' });
      return;
    }

    const payload = {
      obra_id: newReembolso.obra_id || null,
      categoria_id: newReembolso.categoria_id || null,
      valor: parseFloat(newReembolso.valor),
      data: newReembolso.data,
      status: newReembolso.status,
      contrato_id: newReembolso.contrato_id || null,
      descricao: newReembolso.descricao || null
    };

    const { error } = await supabase.from('reembolsos').insert([payload]);
    if (error) {
      toast({ variant: 'destructive', title: 'Erro', description: error.message });
    } else {
      toast({ title: 'Sucesso!', description: 'Reembolso adicionado.' });
      setIsDialogOpen(false);
      setNewReembolso({
        obra_id: '',
        categoria_id: '',
        valor: '',
        data: new Date().toISOString().split('T')[0],
        status: 'Pendente',
        contrato_id: '',
        descricao: ''
      });
      // Limpar buscas
      setSearchContrato('');
      setSearchObra('');
      setSearchCategoria('');
      fetchData();
    }
  };

  // Exportar para CSV
  const exportarCSV = () => {
    const headers = ['Data', 'Obra', 'Contrato', 'Categoria', 'Descrição', 'Valor', 'Status'];
    const rows = filteredReembolsos.map(r => [
      new Date(r.data).toLocaleDateString('pt-BR'),
      r.obras?.nome || '-',
      r.contratos?.numero || '-',
      r.fin_categories?.name || '-',
      r.descricao || '-',
      r.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
      r.status
    ]);

    const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reembolsos_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => status === 'Pago' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700';

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Controle de Reembolsos</h1>
          <p className="text-gray-500 text-xs">Gerencie reembolsos por favorecido, núcleo e centro de custo</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportarCSV}
            className="px-3 py-1.5 border border-gray-300 rounded-lg flex items-center gap-1.5 text-xs text-gray-600 hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
          <button
            type="button"
            onClick={() => setIsDialogOpen(true)}
            className="px-3 py-1.5 bg-[#F25C26] text-white rounded-lg flex items-center gap-1.5 hover:bg-[#d94d1f] text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Novo Reembolso
          </button>
        </div>
      </div>

      {/* Cards de Totais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Geral</p>
          <p className="text-2xl font-bold text-blue-600">R$ {totais.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          <p className="text-xs text-gray-400">{filteredReembolsos.length} reembolsos</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Pendente</p>
          <p className="text-2xl font-bold text-yellow-600">R$ {totais.pendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Pago</p>
          <p className="text-2xl font-bold text-green-600">R$ {totais.pago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white rounded-lg shadow-sm p-3 mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-1.5 border rounded-lg flex items-center gap-1.5 text-xs ${
              showFilters || filtrosAtivos > 0
                ? 'border-[#F25C26] text-[#F25C26] bg-orange-50'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            Filtros
            {filtrosAtivos > 0 && (
              <span className="bg-[#F25C26] text-white text-[10px] px-1.5 py-0.5 rounded-full">{filtrosAtivos}</span>
            )}
          </button>
          {filtrosAtivos > 0 && (
            <button
              type="button"
              onClick={limparFiltros}
              className="px-2 py-1.5 text-xs text-gray-500 hover:text-red-600 flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Limpar
            </button>
          )}
          <span className="text-xs text-gray-400 ml-auto">{filteredReembolsos.length} registro(s)</span>
        </div>

        {/* Painel de Filtros Expandido */}
        {showFilters && (
          <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            <div>
              <label className="block text-[10px] font-medium text-gray-500 mb-1">Data De</label>
              <DateInputBR
                value={filterDataInicio}
                onChange={setFilterDataInicio}
                className="w-full px-2 py-1 text-xs border border-gray-200 rounded"
                title="Data inicial"
                placeholder="dd/mm/aaaa"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-gray-500 mb-1">Data Até</label>
              <DateInputBR
                value={filterDataFim}
                onChange={setFilterDataFim}
                className="w-full px-2 py-1 text-xs border border-gray-200 rounded"
                title="Data final"
                placeholder="dd/mm/aaaa"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-gray-500 mb-1">Contrato</label>
              <select
                value={filterContrato}
                onChange={(e) => setFilterContrato(e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-200 rounded bg-white"
                title="Filtrar por contrato"
              >
                <option value="">Todos</option>
                {contratos.map((c) => (
                  <option key={c.id} value={c.id}>{c.numero} - {c.titulo}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-medium text-gray-500 mb-1">Obra</label>
              <select
                value={filterObra}
                onChange={(e) => setFilterObra(e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-200 rounded bg-white"
                title="Filtrar por obra"
              >
                <option value="">Todas</option>
                {obras.map((o) => (
                  <option key={o.id} value={o.id}>{o.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-medium text-gray-500 mb-1">Categoria</label>
              <select
                value={filterCategoria}
                onChange={(e) => setFilterCategoria(e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-200 rounded bg-white"
                title="Filtrar por categoria"
              >
                <option value="">Todas</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-medium text-gray-500 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-200 rounded bg-white"
                title="Filtrar por status"
              >
                <option value="">Todos</option>
                <option value="Pendente">Pendente</option>
                <option value="Pago">Pago</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Lista de Reembolsos */}
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="h-8 w-8 border-2 border-[#F25C26] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase">Data</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase">Obra</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase">Contrato</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase">Categoria</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase">Descrição</th>
                  <th className="px-3 py-2 text-right text-[10px] font-semibold text-gray-500 uppercase">Valor</th>
                  <th className="px-3 py-2 text-center text-[10px] font-semibold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredReembolsos.length === 0 ? (
                  <tr>
                    <td className="px-3 py-8 text-center text-gray-400" colSpan={7}>
                      Nenhum reembolso encontrado
                    </td>
                  </tr>
                ) : (
                  filteredReembolsos.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50/50">
                      <td className="px-3 py-2 text-gray-600">{new Date(r.data).toLocaleDateString('pt-BR')}</td>
                      <td className="px-3 py-2 font-medium text-gray-800">{r.obras?.nome || '-'}</td>
                      <td className="px-3 py-2 text-gray-600">{r.contratos?.numero || '-'}</td>
                      <td className="px-3 py-2 text-gray-600">{r.fin_categories?.name || '-'}</td>
                      <td className="px-3 py-2 text-gray-600 max-w-[200px] truncate" title={r.descricao}>{r.descricao || '-'}</td>
                      <td className="px-3 py-2 text-right font-semibold text-gray-800">
                        R$ {(r.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(r.status)}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Novo Reembolso */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Reembolso</DialogTitle>
            <DialogDescription>Registre um novo pedido de reembolso.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Obra e Contrato */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Obra</Label>
                <Select value={newReembolso.obra_id} onValueChange={(v) => handleSelectChange('obra_id', v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <div className="p-2 border-b sticky top-0 bg-white">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Buscar obra..."
                          value={searchObra}
                          onChange={(e) => setSearchObra(e.target.value)}
                          className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:border-[#F25C26]"
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                    <div className="max-h-[200px] overflow-y-auto">
                      {obrasFiltradas.length === 0 ? (
                        <div className="py-2 px-3 text-xs text-gray-400 text-center">Nenhum resultado</div>
                      ) : (
                        obrasFiltradas.map(o => <SelectItem key={o.id} value={o.id}>{o.nome}</SelectItem>)
                      )}
                    </div>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Contrato</Label>
                <Select value={newReembolso.contrato_id} onValueChange={(v) => handleSelectChange('contrato_id', v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <div className="p-2 border-b sticky top-0 bg-white">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Buscar contrato..."
                          value={searchContrato}
                          onChange={(e) => setSearchContrato(e.target.value)}
                          className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:border-[#F25C26]"
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                    <div className="max-h-[200px] overflow-y-auto">
                      {contratosFiltrados.length === 0 ? (
                        <div className="py-2 px-3 text-xs text-gray-400 text-center">Nenhum resultado</div>
                      ) : (
                        contratosFiltrados.map(c => <SelectItem key={c.id} value={c.id}>{c.numero} - {c.titulo}</SelectItem>)
                      )}
                    </div>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Categoria */}
            <div>
              <Label className="text-xs">Categoria</Label>
              <Select value={newReembolso.categoria_id} onValueChange={(v) => handleSelectChange('categoria_id', v)}>
                <SelectTrigger><SelectValue placeholder="Selecione a categoria" /></SelectTrigger>
                <SelectContent>
                  <div className="p-2 border-b sticky top-0 bg-white">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Buscar categoria..."
                        value={searchCategoria}
                        onChange={(e) => setSearchCategoria(e.target.value)}
                        className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:border-[#F25C26]"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <div className="max-h-[200px] overflow-y-auto">
                    {categoriasFiltradas.length === 0 ? (
                      <div className="py-2 px-3 text-xs text-gray-400 text-center">Nenhum resultado</div>
                    ) : (
                      categoriasFiltradas.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)
                    )}
                  </div>
                </SelectContent>
              </Select>
            </div>

            {/* Valor e Data */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Valor *</Label>
                <Input name="valor" placeholder="0.00" type="number" step="0.01" value={newReembolso.valor} onChange={handleInputChange} />
              </div>
              <div>
                <Label className="text-xs">Data</Label>
                <DateInputBR
                  value={newReembolso.data}
                  onChange={(val) => setNewReembolso((prev) => ({ ...prev, data: val }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* Descrição */}
            <div>
              <Label className="text-xs">Descrição</Label>
              <Input name="descricao" placeholder="Descrição do reembolso..." value={newReembolso.descricao} onChange={handleInputChange} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <button
              type="button"
              onClick={handleAddReembolso}
              className="px-4 py-2 bg-[#F25C26] text-white rounded-lg text-sm hover:bg-[#d94d1f]"
            >
              Salvar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReembolsosPage;
