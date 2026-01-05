import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import * as api from '../services/financeiroPessoalApi';
import type { ContaPessoal, NovaContaForm } from '../types';

interface UseContasPessoaisReturn {
  contas: ContaPessoal[];
  loading: boolean;
  error: string | null;
  saldoTotal: number;
  carregar: () => Promise<void>;
  criar: (dados: NovaContaForm) => Promise<ContaPessoal | null>;
  atualizar: (id: string, dados: Partial<ContaPessoal>) => Promise<void>;
  arquivar: (id: string) => Promise<void>;
}

export function useContasPessoais(): UseContasPessoaisReturn {
  const [contas, setContas] = useState<ContaPessoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listarContas();
      setContas(data);
    } catch (err) {
      setError('Erro ao carregar contas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const saldoTotal = contas
    .filter(c => c.status === 'ativa')
    .reduce((sum, c) => sum + (c.saldo_atual || 0), 0);

  const criar = useCallback(async (dados: NovaContaForm): Promise<ContaPessoal | null> => {
    try {
      const novaConta = await api.criarConta(dados);
      toast.success('Conta criada com sucesso!');
      await carregar();
      return novaConta;
    } catch (err) {
      toast.error('Erro ao criar conta');
      console.error(err);
      return null;
    }
  }, [carregar]);

  const atualizar = useCallback(async (id: string, dados: Partial<ContaPessoal>) => {
    try {
      await api.atualizarConta(id, dados);
      toast.success('Conta atualizada!');
      await carregar();
    } catch (err) {
      toast.error('Erro ao atualizar conta');
      console.error(err);
    }
  }, [carregar]);

  const arquivar = useCallback(async (id: string) => {
    try {
      await api.arquivarConta(id);
      toast.success('Conta arquivada!');
      await carregar();
    } catch (err) {
      toast.error('Erro ao arquivar conta');
      console.error(err);
    }
  }, [carregar]);

  return {
    contas,
    loading,
    error,
    saldoTotal,
    carregar,
    criar,
    atualizar,
    arquivar,
  };
}
