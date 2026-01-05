// ============================================================
// PricelistSearch - Busca de produtos no catálogo
// Sistema WG Easy - Grupo WG Almeida
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { Search, X, Package, Loader2, Plus, ExternalLink } from 'lucide-react';
import type { ProdutoPricelist } from '../types';
import { formatCurrency } from '../utils/formatters';

interface PricelistSearchProps {
  produtos: ProdutoPricelist[];
  loading: boolean;
  termo: string;
  onBuscar: (termo: string) => void;
  onLimpar: () => void;
  onSelecionar: (produto: ProdutoPricelist) => void;
  placeholder?: string;
}

export default function PricelistSearch({
  produtos,
  loading,
  termo,
  onBuscar,
  onLimpar,
  onSelecionar,
  placeholder = 'Buscar produto no catálogo...',
}: PricelistSearchProps) {
  const [inputValue, setInputValue] = useState(termo);
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sincronizar input com termo externo
  useEffect(() => {
    setInputValue(termo);
  }, [termo]);

  // Fechar ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setAberto(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setInputValue(valor);
    onBuscar(valor);
    setAberto(true);
  };

  const handleLimpar = () => {
    setInputValue('');
    onLimpar();
    setAberto(false);
  };

  const handleSelecionar = (produto: ProdutoPricelist) => {
    onSelecionar(produto);
    setAberto(false);
    setInputValue('');
    onLimpar();
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Input de Busca */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />
        <input
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setAberto(true)}
          className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-wg-primary/20 focus:border-wg-primary bg-white"
        />
        {loading && (
          <Loader2
            className="absolute right-10 top-1/2 -translate-y-1/2 text-wg-primary animate-spin"
            size={18}
          />
        )}
        {inputValue && (
          <button
            onClick={handleLimpar}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Dropdown de Resultados */}
      {aberto && inputValue.length >= 2 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <Loader2 className="animate-spin mx-auto mb-2" size={24} />
              Buscando produtos...
            </div>
          ) : produtos.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Package className="mx-auto mb-2 text-gray-300" size={32} />
              Nenhum produto encontrado para "{inputValue}"
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {produtos.map((produto) => (
                <li key={produto.id}>
                  <button
                    onClick={() => handleSelecionar(produto)}
                    className="w-full p-3 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    {/* Imagem */}
                    <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                      {produto.imagem_url ? (
                        <img
                          src={produto.imagem_url}
                          alt={produto.nome}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Package size={20} />
                        </div>
                      )}
                    </div>

                    {/* Informações */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-gray-900 truncate">{produto.nome}</p>
                          <p className="text-xs text-gray-500">
                            {produto.fabricante}
                            {produto.modelo && ` • ${produto.modelo}`}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-wg-primary whitespace-nowrap">
                          {formatCurrency(produto.preco)}
                        </span>
                      </div>

                      {produto.codigo && (
                        <p className="text-xs text-gray-400 mt-1">Cód: {produto.codigo}</p>
                      )}
                    </div>

                    {/* Ícone de adicionar */}
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-wg-primary/10 text-wg-primary">
                      <Plus size={16} />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
