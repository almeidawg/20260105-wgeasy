// Hook para gerenciar categorias de serviço
import { useState, useCallback, useEffect } from 'react';
import type { ServicoCategoria } from '../types';
import { listarCategorias, obterCategoria } from '../services/servicosApi';

interface UseCategoriasReturn {
  categorias: ServicoCategoria[];
  categoriaSelecionada: ServicoCategoria | null;
  loading: boolean;
  error: string | null;
  carregarCategorias: () => Promise<void>;
  selecionarCategoria: (id: string) => Promise<void>;
  limparSelecionada: () => void;
}

export function useCategorias(): UseCategoriasReturn {
  const [categorias, setCategorias] = useState<ServicoCategoria[]>([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<ServicoCategoria | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const carregarCategorias = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listarCategorias();
      setCategorias(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  }, []);

  const selecionarCategoria = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await obterCategoria(id);
      setCategoriaSelecionada(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar categoria');
    } finally {
      setLoading(false);
    }
  }, []);

  const limparSelecionada = useCallback(() => {
    setCategoriaSelecionada(null);
  }, []);

  // Carregar categorias ao montar
  useEffect(() => {
    carregarCategorias();
  }, [carregarCategorias]);

  return {
    categorias,
    categoriaSelecionada,
    loading,
    error,
    carregarCategorias,
    selecionarCategoria,
    limparSelecionada,
  };
}
