import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Receipt, Clock, CheckCircle, AlertCircle, Search, Edit2, Trash2, Building2, Users, ChevronDown, ChevronRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabaseRaw as supabase } from "@/lib/supabaseClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateInputBR } from '@/components/ui/DateInputBR';

const CobrancasPage = () => {
  const { toast } = useToast();
  const [cobrancas, setCobrancas] = useState<any[]>([]);
  const [obras, setObras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBankDialogOpen, setIsBankDialogOpen] = useState(false);
  const [selectedCobranca, setSelectedCobranca] = useState<any>(null);
  const [agruparPorCliente, setAgruparPorCliente] = useState(false);
  const [clientesExpandidos, setClientesExpandidos] = useState<Set<string>>(new Set());
  const [newCobranca, setNewCobranca] = useState({
    obra_id: '',
    cliente: '',
    valor: '',
    vencimento: '',
    status: 'Pendente',
  });
  const [dadosBancarios, setDadosBancarios] = useState({
    banco: '',
    agencia: '',
    conta: '',
    tipo_conta: 'corrente',
    pix: '',
  });

  // Agrupar cobranças por cliente
  const cobrancasAgrupadas = useMemo(() => {
    if (!agruparPorCliente) return null;

    const grupos: Record<string, { cliente: string; cobrancas: any[]; totalValor: number; totalPendente: number }> = {};

    cobrancas.forEach(cob => {
      const clienteKey = cob.cliente || 'Sem Cliente';
      if (!grupos[clienteKey]) {
        grupos[clienteKey] = {
          cliente: clienteKey,
          cobrancas: [],
          totalValor: 0,
          totalPendente: 0,
        };
      }
      grupos[clienteKey].cobrancas.push(cob);
      grupos[clienteKey].totalValor += cob.valor || 0;
      if (cob.status !== 'Pago') {
        grupos[clienteKey].totalPendente += cob.valor || 0;
      }
    });

    return Object.values(grupos).sort((a, b) => b.totalPendente - a.totalPendente);
  }, [cobrancas, agruparPorCliente]);

  const toggleClienteExpandido = (cliente: string) => {
    setClientesExpandidos(prev => {
      const novo = new Set(prev);
      if (novo.has(cliente)) {
        novo.delete(cliente);
      } else {
        novo.add(cliente);
      }
      return novo;
    });
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('cobrancas')
        .select(`*, obra:obras!obra_id(nome), contrato:contratos!contrato_id(numero, titulo)`);

      if (searchTerm) {
        // Buscar por cliente ou observações
        query = query.or(`cliente.ilike.%${searchTerm}%,observacoes.ilike.%${searchTerm}%`);
      }
      if (filtroStatus !== 'Todos') {
        if (filtroStatus === 'Vencido') {
          // Vencido = não pago e data < hoje
          query = query.neq('status', 'Pago').lt('vencimento', new Date().toISOString().split('T')[0]);
        } else {
          query = query.eq('status', filtroStatus);
        }
      }

      query = query.order('vencimento', { ascending: true });

      const [cobrancasRes, obrasRes, contratosRes] = await Promise.all([
        query,
        supabase.from('obras').select('id, nome'),
        supabase.from('contratos').select('id, numero, titulo').order('numero', { ascending: false }),
      ]);

      if (cobrancasRes.error) throw cobrancasRes.error;
      if (obrasRes.error) throw obrasRes.error;

      setCobrancas(cobrancasRes.data || []);
      setObras(obrasRes.data || []);

    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erro ao buscar dados', description: error.message });
    } finally {
      setLoading(false);
    }
  }, [toast, searchTerm, filtroStatus]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCobranca(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewCobranca(prev => ({ ...prev, [name]: value }));
  };

  const handleAddCobranca = async () => {
    if (!newCobranca.obra_id || !newCobranca.cliente || !newCobranca.valor || !newCobranca.vencimento) {
      toast({
        variant: 'destructive',
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos para continuar.',
      });
      return;
    }

    const dataToSubmit = { ...newCobranca, valor: parseFloat(newCobranca.valor) };

    const { error } = await supabase.from('cobrancas').insert([dataToSubmit]);

    if (error) {
      toast({ variant: 'destructive', title: 'Erro', description: error.message });
    } else {
      toast({ title: 'Sucesso!', description: 'Cobrança adicionada.' });
      setIsDialogOpen(false);
      setNewCobranca({ obra_id: '', cliente: '', valor: '', vencimento: '', status: 'Pendente' });
      fetchData();
    }
  };

  const handleEditCobranca = (cobranca: any) => {
    setSelectedCobranca(cobranca);
    setNewCobranca({
      obra_id: cobranca.obra_id,
      cliente: cobranca.cliente,
      valor: cobranca.valor.toString(),
      vencimento: cobranca.vencimento,
      status: cobranca.status,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteCobranca = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta cobrança?')) return;

    const { error } = await supabase.from('cobrancas').delete().eq('id', id);

    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao excluir', description: error.message });
    } else {
      toast({ title: 'Sucesso!', description: 'Cobrança excluída.' });
      fetchData();
    }
  };

  const handleOpenBankDialog = (cobranca: any) => {
    setSelectedCobranca(cobranca);
    // Carregar dados bancários se existirem
    if (cobranca.dados_bancarios) {
      setDadosBancarios(cobranca.dados_bancarios);
    } else {
      setDadosBancarios({
        banco: '',
        agencia: '',
        conta: '',
        tipo_conta: 'corrente',
        pix: '',
      });
    }
    setIsBankDialogOpen(true);
  };

  const handleSaveBankData = async () => {
    if (!selectedCobranca) return;

    const { error } = await supabase
      .from('cobrancas')
      .update({ dados_bancarios: dadosBancarios })
      .eq('id', selectedCobranca.id);

    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao salvar', description: error.message });
    } else {
      toast({ title: 'Sucesso!', description: 'Dados bancários salvos.' });
      setIsBankDialogOpen(false);
      fetchData();
    }
  };

  const getStatusIcon = (status: string, vencimento: string) => {
    if (status === 'Pago') return <CheckCircle className="w-3 h-3" />;
    const hoje = new Date();
    const dataVenc = new Date(vencimento);
    if (dataVenc < hoje && status !== 'Pago') return <AlertCircle className="w-3 h-3" />;
    return <Clock className="w-3 h-3" />;
  };

  const getStatusColor = (status: string, vencimento: string) => {
    if (status === 'Pago') return 'bg-green-100 text-green-700';
    const hoje = new Date();
    const dataVenc = new Date(vencimento);
    if (dataVenc < hoje && status !== 'Pago') return 'bg-red-100 text-red-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  const getStatusLabel = (status: string, vencimento: string) => {
    if (status === 'Pago') return 'Pago';
    const hoje = new Date();
    const dataVenc = new Date(vencimento);
    if (dataVenc < hoje) return 'Vencido';
    return 'Pendente';
  };

  return (
    <>
      <div className="space-y-4 p-4">
        {/* Header Compacto */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Controle de Cobranças</h1>
            <p className="text-gray-500 text-xs">Gerencie cobranças e recebimentos</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative w-full md:w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <Input
                placeholder="Buscar cliente..."
                className="pl-8 h-8 text-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={fetchData}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              title="Atualizar lista"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-[#F25C26] hover:bg-[#d94d1f] h-8 px-3 text-xs whitespace-nowrap shrink-0">
              <Plus size={14} className="mr-1" />
              <span>Nova Cobrança</span>
            </Button>
          </div>
        </div>

        {/* Filtros e Toggle */}
        <div className="bg-white rounded-lg shadow-sm p-3">
          <div className="flex flex-wrap items-center gap-2 justify-between">
            <div className="flex flex-wrap gap-1.5">
              {['Todos', 'Pendente', 'Vencido', 'Pago'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setFiltroStatus(status)}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors text-xs ${
                    filtroStatus === status
                      ? 'bg-[#F25C26] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setAgruparPorCliente(!agruparPorCliente)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                agruparPorCliente
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="Agrupar cobranças por cliente"
            >
              <Users className="w-3.5 h-3.5" />
              Agrupar por Cliente
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F25C26]"></div>
          </div>
        ) : agruparPorCliente && cobrancasAgrupadas ? (
          /* Visualização Agrupada por Cliente */
          <div className="space-y-2">
            {cobrancasAgrupadas.map((grupo) => (
              <div key={grupo.cliente} className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Header do Grupo */}
                <button
                  type="button"
                  onClick={() => toggleClienteExpandido(grupo.cliente)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {clientesExpandidos.has(grupo.cliente) ? (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="font-semibold text-sm text-gray-800">{grupo.cliente}</span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      {grupo.cobrancas.length} cobrança{grupo.cobrancas.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div>
                      <span className="text-gray-500">Total: </span>
                      <span className="font-semibold text-gray-700">
                        R$ {grupo.totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    {grupo.totalPendente > 0 && (
                      <div className="text-red-600">
                        <span>Pendente: </span>
                        <span className="font-semibold">
                          R$ {grupo.totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}
                  </div>
                </button>

                {/* Cobranças do Cliente */}
                {clientesExpandidos.has(grupo.cliente) && (
                  <div className="border-t border-gray-100 divide-y divide-gray-50">
                    {grupo.cobrancas.map((cobranca) => (
                      <div key={cobranca.id} className="px-4 py-2 pl-12 flex items-center justify-between hover:bg-gray-50/50">
                        <div className="flex items-center gap-3 flex-1">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(cobranca.status, cobranca.vencimento)}`}>
                            {getStatusLabel(cobranca.status, cobranca.vencimento)}
                          </span>
                          <span className="text-xs text-gray-600">{cobranca.obra?.nome}</span>
                          <span className="text-[10px] text-gray-400">
                            Venc: {new Date(cobranca.vencimento).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-[#2B4580]">
                            R$ {cobranca.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                          <button type="button" onClick={() => handleOpenBankDialog(cobranca)} className="p-1 text-gray-400 hover:text-blue-600" title="Dados Bancários">
                            <Building2 size={14} />
                          </button>
                          <button type="button" onClick={() => handleEditCobranca(cobranca)} className="p-1 text-gray-400 hover:text-amber-600" title="Editar">
                            <Edit2 size={14} />
                          </button>
                          <button type="button" onClick={() => handleDeleteCobranca(cobranca.id)} className="p-1 text-gray-400 hover:text-red-600" title="Excluir">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {cobrancasAgrupadas.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-sm">
                Nenhuma cobrança encontrada
              </div>
            )}
          </div>
        ) : (
          /* Visualização Lista Normal - Compacta */
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-2 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase">Cliente</th>
                  <th className="px-2 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase">Contrato</th>
                  <th className="px-2 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase">Obra</th>
                  <th className="px-2 py-2 text-center text-[10px] font-semibold text-gray-500 uppercase">Vencimento</th>
                  <th className="px-2 py-2 text-right text-[10px] font-semibold text-gray-500 uppercase">Valor</th>
                  <th className="px-2 py-2 text-center text-[10px] font-semibold text-gray-500 uppercase w-24">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {cobrancas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-gray-400 text-xs">
                      Nenhuma cobrança encontrada
                    </td>
                  </tr>
                ) : (
                  cobrancas.map((cobranca) => (
                    <tr key={cobranca.id} className="hover:bg-gray-50/50">
                      <td className="px-3 py-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(cobranca.status, cobranca.vencimento)}`}>
                          {getStatusIcon(cobranca.status, cobranca.vencimento)}
                          {getStatusLabel(cobranca.status, cobranca.vencimento)}
                        </span>
                      </td>
                      <td className="px-2 py-2 font-medium text-gray-800 text-[11px]">{cobranca.cliente}</td>
                      <td className="px-2 py-2 text-gray-600 text-[11px]">{cobranca.contrato?.numero || '-'}</td>
                      <td className="px-2 py-2 text-gray-600 text-[11px]">{cobranca.obra?.nome || '-'}</td>
                      <td className="px-2 py-2 text-center text-gray-500 text-[11px]">
                        {new Date(cobranca.vencimento).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-2 py-2 text-right font-semibold text-[#2B4580] text-[11px]">
                        R$ {cobranca.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-2 py-2">
                        <div className="flex items-center justify-center gap-0.5">
                          <button type="button" onClick={() => handleOpenBankDialog(cobranca)} className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="Dados Bancários">
                            <Building2 size={14} />
                          </button>
                          <button type="button" onClick={() => handleEditCobranca(cobranca)} className="p-1 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded" title="Editar">
                            <Edit2 size={14} />
                          </button>
                          <button type="button" onClick={() => handleDeleteCobranca(cobranca.id)} className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded" title="Excluir">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCobranca ? 'Editar Cobrança' : 'Nova Cobrança'}</DialogTitle>
            <DialogDescription>
              {selectedCobranca ? 'Atualize os dados da cobrança.' : 'Registre uma nova cobrança a receber.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Select value={newCobranca.obra_id} onValueChange={(value) => handleSelectChange('obra_id', value)}>
              <SelectTrigger><SelectValue placeholder="Selecione a obra" /></SelectTrigger>
              <SelectContent>{obras.map((o: any) => <SelectItem key={o.id} value={o.id}>{o.nome}</SelectItem>)}</SelectContent>
            </Select>
            <Input name="cliente" placeholder="Cliente" value={newCobranca.cliente} onChange={handleInputChange} />
            <Input name="valor" type="number" placeholder="Valor" value={newCobranca.valor} onChange={handleInputChange} />
            <DateInputBR
              value={newCobranca.vencimento}
              onChange={(val) => setNewCobranca((prev) => ({ ...prev, vencimento: val }))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="dd/mm/aaaa"
            />
          </div>
          <DialogFooter>
            <Button onClick={handleAddCobranca} className="bg-[#F25C26] hover:bg-[#d94d1f]">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isBankDialogOpen} onOpenChange={setIsBankDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Dados Bancários para Recebimento</DialogTitle>
            <DialogDescription>
              Configure as informações bancárias para receber o pagamento desta cobrança.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Banco</label>
                <Input
                  placeholder="Nome do banco"
                  value={dadosBancarios.banco}
                  onChange={(e) => setDadosBancarios({ ...dadosBancarios, banco: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Agência</label>
                <Input
                  placeholder="0000"
                  value={dadosBancarios.agencia}
                  onChange={(e) => setDadosBancarios({ ...dadosBancarios, agencia: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Conta</label>
                <Input
                  placeholder="00000-0"
                  value={dadosBancarios.conta}
                  onChange={(e) => setDadosBancarios({ ...dadosBancarios, conta: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Tipo de Conta</label>
                <Select
                  value={dadosBancarios.tipo_conta}
                  onValueChange={(value) => setDadosBancarios({ ...dadosBancarios, tipo_conta: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="corrente">Conta Corrente</SelectItem>
                    <SelectItem value="poupanca">Conta Poupança</SelectItem>
                    <SelectItem value="pagamento">Conta Pagamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Chave PIX (opcional)</label>
                <Input
                  placeholder="CPF, CNPJ, e-mail, telefone ou chave aleatória"
                  value={dadosBancarios.pix}
                  onChange={(e) => setDadosBancarios({ ...dadosBancarios, pix: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsBankDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveBankData}
              className="bg-[#F25C26] hover:bg-[#d94d1f]"
            >
              Salvar Dados Bancários
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CobrancasPage;
