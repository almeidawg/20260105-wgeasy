// Hook para gerenciar solicitações de serviço
import { useState, useCallback, useEffect } from 'react';
import type {
  SolicitacaoServico,
  NovoServicoForm,
  FiltrosServico,
  StatusServico,
  DashboardServicos,
} from '../types';
import {
  listarServicos,
  obterServico,
  criarServico,
  atualizarServico,
  atualizarStatusServico,
  marcarServicoEnviado,
  obterDashboard,
} from '../services/servicosApi';

interface UseServicosReturn {
  servicos: SolicitacaoServico[];
  servicoSelecionado: SolicitacaoServico | null;
  dashboard: DashboardServicos | null;
  loading: boolean;
  error: string | null;
  filtros: FiltrosServico;
  setFiltros: (filtros: FiltrosServico) => void;
  carregarServicos: (filtros?: FiltrosServico) => Promise<void>;
  carregarServico: (id: string) => Promise<void>;
  carregarDashboard: () => Promise<void>;
  criar: (dados: NovoServicoForm) => Promise<SolicitacaoServico>;
  atualizar: (id: string, dados: Partial<NovoServicoForm>) => Promise<SolicitacaoServico>;
  alterarStatus: (id: string, status: StatusServico, observacao?: string) => Promise<SolicitacaoServico>;
  marcarEnviado: (id: string) => Promise<SolicitacaoServico>;
  limparSelecionado: () => void;
}

export function useServicos(): UseServicosReturn {
  const [servicos, setServicos] = useState<SolicitacaoServico[]>([]);
  const [servicoSelecionado, setServicoSelecionado] = useState<SolicitacaoServico | null>(null);
  const [dashboard, setDashboard] = useState<DashboardServicos | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<FiltrosServico>({});

  const carregarServicos = useCallback(async (novosFiltros?: FiltrosServico) => {
    setLoading(true);
    setError(null);
    try {
      const data = await listarServicos(novosFiltros || filtros);
      setServicos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar serviços');
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  const carregarServico = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await obterServico(id);
      setServicoSelecionado(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar serviço');
    } finally {
      setLoading(false);
    }
  }, []);

  const carregarDashboard = useCallback(async () => {
    try {
      const data = await obterDashboard();
      setDashboard(data);
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
    }
  }, []);

  const criar = useCallback(async (dados: NovoServicoForm): Promise<SolicitacaoServico> => {
    setLoading(true);
    setError(null);
    try {
      const novo = await criarServico(dados);
      setServicos(prev => [novo, ...prev]);
      return novo;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar serviço';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const atualizar = useCallback(async (
    id: string,
    dados: Partial<NovoServicoForm>
  ): Promise<SolicitacaoServico> => {
    setLoading(true);
    setError(null);
    try {
      const atualizado = await atualizarServico(id, dados);
      setServicos(prev => prev.map(s => s.id === id ? atualizado : s));
      if (servicoSelecionado?.id === id) {
        setServicoSelecionado(atualizado);
      }
      return atualizado;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao atualizar serviço';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [servicoSelecionado]);

  const alterarStatus = useCallback(async (
    id: string,
    status: StatusServico,
    observacao?: string
  ): Promise<SolicitacaoServico> => {
    setLoading(true);
    setError(null);
    try {
      const atualizado = await atualizarStatusServico(id, status, observacao);
      setServicos(prev => prev.map(s => s.id === id ? atualizado : s));
      if (servicoSelecionado?.id === id) {
        setServicoSelecionado(atualizado);
      }
      return atualizado;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao alterar status';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [servicoSelecionado]);

  const marcarEnviado = useCallback(async (id: string): Promise<SolicitacaoServico> => {
    setLoading(true);
    setError(null);
    try {
      const atualizado = await marcarServicoEnviado(id);
      setServicos(prev => prev.map(s => s.id === id ? atualizado : s));
      if (servicoSelecionado?.id === id) {
        setServicoSelecionado(atualizado);
      }
      return atualizado;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao marcar como enviado';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [servicoSelecionado]);

  const limparSelecionado = useCallback(() => {
    setServicoSelecionado(null);
  }, []);

  // Carregar ao mudar filtros
  useEffect(() => {
    carregarServicos();
  }, [carregarServicos]);

  return {
    servicos,
    servicoSelecionado,
    dashboard,
    loading,
    error,
    filtros,
    setFiltros,
    carregarServicos,
    carregarServico,
    carregarDashboard,
    criar,
    atualizar,
    alterarStatus,
    marcarEnviado,
    limparSelecionado,
  };
}
