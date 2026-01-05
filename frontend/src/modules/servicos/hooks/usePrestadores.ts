// Hook para gerenciar prestadores de serviço
import { useState, useCallback, useEffect } from 'react';
import type { Prestador, PrestadorConvidado } from '../types';
import {
  listarPrestadoresPorCategoria,
  listarTodosPrestadores,
  vincularPrestadorCategoria,
  desvincularPrestadorCategoria,
  convidarPrestadores,
} from '../services/servicosApi';

interface UsePrestadoresReturn {
  prestadores: Prestador[];
  prestadoresSelecionados: Prestador[];
  loading: boolean;
  error: string | null;
  carregarPorCategoria: (categoriaId: string) => Promise<void>;
  carregarTodos: () => Promise<void>;
  selecionarPrestador: (prestador: Prestador) => void;
  desselecionarPrestador: (prestadorId: string) => void;
  limparSelecao: () => void;
  vincularCategoria: (prestadorId: string, categoriaId: string, principal?: boolean) => Promise<void>;
  desvincularCategoria: (prestadorId: string, categoriaId: string) => Promise<void>;
  convidar: (solicitacaoId: string) => Promise<PrestadorConvidado[]>;
}

export function usePrestadores(): UsePrestadoresReturn {
  const [prestadores, setPrestadores] = useState<Prestador[]>([]);
  const [prestadoresSelecionados, setPrestadoresSelecionados] = useState<Prestador[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const carregarPorCategoria = useCallback(async (categoriaId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await listarPrestadoresPorCategoria(categoriaId);
      setPrestadores(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar prestadores');
    } finally {
      setLoading(false);
    }
  }, []);

  const carregarTodos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listarTodosPrestadores();
      setPrestadores(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar prestadores');
    } finally {
      setLoading(false);
    }
  }, []);

  const selecionarPrestador = useCallback((prestador: Prestador) => {
    setPrestadoresSelecionados(prev => {
      // Evita duplicatas
      if (prev.some(p => p.id === prestador.id)) {
        return prev;
      }
      return [...prev, prestador];
    });
  }, []);

  const desselecionarPrestador = useCallback((prestadorId: string) => {
    setPrestadoresSelecionados(prev => prev.filter(p => p.id !== prestadorId));
  }, []);

  const limparSelecao = useCallback(() => {
    setPrestadoresSelecionados([]);
  }, []);

  const vincularCategoria = useCallback(async (
    prestadorId: string,
    categoriaId: string,
    principal: boolean = false
  ) => {
    setLoading(true);
    setError(null);
    try {
      await vincularPrestadorCategoria(prestadorId, categoriaId, principal);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao vincular categoria');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const desvincularCategoria = useCallback(async (
    prestadorId: string,
    categoriaId: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      await desvincularPrestadorCategoria(prestadorId, categoriaId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao desvincular categoria');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const convidar = useCallback(async (solicitacaoId: string): Promise<PrestadorConvidado[]> => {
    if (prestadoresSelecionados.length === 0) {
      throw new Error('Selecione ao menos um prestador');
    }

    setLoading(true);
    setError(null);
    try {
      const convites = await convidarPrestadores(
        solicitacaoId,
        prestadoresSelecionados.map(p => ({
          id: p.id,
          tipo: p.prestador_tipo,
        }))
      );
      return convites;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao convidar prestadores');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [prestadoresSelecionados]);

  return {
    prestadores,
    prestadoresSelecionados,
    loading,
    error,
    carregarPorCategoria,
    carregarTodos,
    selecionarPrestador,
    desselecionarPrestador,
    limparSelecao,
    vincularCategoria,
    desvincularCategoria,
    convidar,
  };
}
