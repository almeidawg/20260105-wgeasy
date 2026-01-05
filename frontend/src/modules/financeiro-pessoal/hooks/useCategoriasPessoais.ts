import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/financeiroPessoalApi';
import type { CategoriaPessoal } from '../types';

interface UseCategoriasPessoaisReturn {
  categorias: CategoriaPessoal[];
  categoriasReceita: CategoriaPessoal[];
  categoriasDespesa: CategoriaPessoal[];
  loading: boolean;
  carregar: () => Promise<void>;
}

export function useCategoriasPessoais(): UseCategoriasPessoaisReturn {
  const [categorias, setCategorias] = useState<CategoriaPessoal[]>([]);
  const [loading, setLoading] = useState(true);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.listarCategorias();
      setCategorias(data);
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const categoriasReceita = categorias.filter(c => c.tipo === 'receita' || c.tipo === 'ambos');
  const categoriasDespesa = categorias.filter(c => c.tipo === 'despesa' || c.tipo === 'ambos');

  return {
    categorias,
    categoriasReceita,
    categoriasDespesa,
    loading,
    carregar,
  };
}
