import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import * as api from '../services/financeiroPessoalApi';
import type { LancamentoPessoal, NovoLancamentoForm, FiltrosLancamentos } from '../types';

interface UseLancamentosPessoaisReturn {
  lancamentos: LancamentoPessoal[];
  loading: boolean;
  error: string | null;
  totalReceitas: number;
  totalDespesas: number;
  carregar: (filtros?: FiltrosLancamentos) => Promise<void>;
  criar: (dados: NovoLancamentoForm) => Promise<LancamentoPessoal | null>;
  atualizar: (id: string, dados: Partial<LancamentoPessoal>) => Promise<void>;
  deletar: (id: string) => Promise<void>;
  efetivar: (id: string) => Promise<void>;
}

export function useLancamentosPessoais(filtrosIniciais?: FiltrosLancamentos): UseLancamentosPessoaisReturn {
  const [lancamentos, setLancamentos] = useState<LancamentoPessoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregar = useCallback(async (filtros?: FiltrosLancamentos) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listarLancamentos(filtros || filtrosIniciais);
      setLancamentos(data);
    } catch (err) {
      setError('Erro ao carregar lançamentos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filtrosIniciais]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const totalReceitas = lancamentos
    .filter(l => l.tipo === 'receita' && l.status !== 'cancelado')
    .reduce((sum, l) => sum + l.valor, 0);

  const totalDespesas = lancamentos
    .filter(l => l.tipo === 'despesa' && l.status !== 'cancelado')
    .reduce((sum, l) => sum + l.valor, 0);

  const criar = useCallback(async (dados: NovoLancamentoForm): Promise<LancamentoPessoal | null> => {
    try {
      const novo = await api.criarLancamento(dados);
      toast.success('Lançamento criado com sucesso!');
      await carregar();
      return novo;
    } catch (err) {
      toast.error('Erro ao criar lançamento');
      console.error(err);
      return null;
    }
  }, [carregar]);

  const atualizar = useCallback(async (id: string, dados: Partial<LancamentoPessoal>) => {
    try {
      await api.atualizarLancamento(id, dados);
      toast.success('Lançamento atualizado!');
      await carregar();
    } catch (err) {
      toast.error('Erro ao atualizar lançamento');
      console.error(err);
    }
  }, [carregar]);

  const deletar = useCallback(async (id: string) => {
    try {
      await api.deletarLancamento(id);
      toast.success('Lançamento excluído!');
      await carregar();
    } catch (err) {
      toast.error('Erro ao excluir lançamento');
      console.error(err);
    }
  }, [carregar]);

  const efetivar = useCallback(async (id: string) => {
    try {
      await api.efetivarLancamento(id);
      toast.success('Lançamento efetivado!');
      await carregar();
    } catch (err) {
      toast.error('Erro ao efetivar lançamento');
      console.error(err);
    }
  }, [carregar]);

  return {
    lancamentos,
    loading,
    error,
    totalReceitas,
    totalDespesas,
    carregar,
    criar,
    atualizar,
    deletar,
    efetivar,
  };
}
