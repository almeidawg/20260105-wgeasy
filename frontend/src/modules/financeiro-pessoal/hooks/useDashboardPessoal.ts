import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/financeiroPessoalApi';
import type { DashboardPessoalData } from '../types';

interface UseDashboardPessoalReturn {
  data: DashboardPessoalData | null;
  loading: boolean;
  error: string | null;
  recarregar: () => Promise<void>;
}

export function useDashboardPessoal(): UseDashboardPessoalReturn {
  const [data, setData] = useState<DashboardPessoalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recarregar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dashData = await api.obterDashboardData();
      setData(dashData);
    } catch (err) {
      setError('Erro ao carregar dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  return {
    data,
    loading,
    error,
    recarregar,
  };
}
