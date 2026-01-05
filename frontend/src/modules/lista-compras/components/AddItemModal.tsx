// ============================================================
// AddItemModal - Modal para adicionar item à lista
// Sistema WG Easy - Grupo WG Almeida
// ============================================================

import { useState, useEffect } from 'react';
import { X, Package, Minus, Plus, Building2, User } from 'lucide-react';
import type { ProdutoPricelist, TipoCompra } from '../types';
import { formatCurrency, formatQuantidade } from '../utils/formatters';

interface AddItemModalProps {
  aberto: boolean;
  onFechar: () => void;
  produto: ProdutoPricelist | null;
  onConfirmar: (dados: {
    quantidade: number;
    ambiente: string;
    tipo_compra: TipoCompra;
    observacoes?: string;
  }) => void;
  ambientes?: string[];
}

export default function AddItemModal({
  aberto,
  onFechar,
  produto,
  onConfirmar,
  ambientes = [],
}: AddItemModalProps) {
  const [quantidade, setQuantidade] = useState(1);
  const [ambiente, setAmbiente] = useState('');
  const [novoAmbiente, setNovoAmbiente] = useState('');
  const [tipoCompra, setTipoCompra] = useState<TipoCompra>('WG_COMPRA');
  const [observacoes, setObservacoes] = useState('');

  // Reset ao abrir com novo produto
  useEffect(() => {
    if (aberto) {
      setQuantidade(1);
      setAmbiente(ambientes[0] || '');
      setNovoAmbiente('');
      setTipoCompra('WG_COMPRA');
      setObservacoes('');
    }
  }, [aberto, ambientes]);

  // Bloquear scroll quando aberto
  useEffect(() => {
    if (aberto) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [aberto]);

  if (!aberto || !produto) return null;

  const valorTotal = produto.preco * quantidade;
  const ambienteFinal = ambiente === '__novo__' ? novoAmbiente.trim() : ambiente;

  const handleConfirmar = () => {
    if (!ambienteFinal) {
      alert('Selecione ou digite um ambiente');
      return;
    }

    onConfirmar({
      quantidade,
      ambiente: ambienteFinal,
      tipo_compra: tipoCompra,
      observacoes: observacoes.trim() || undefined,
    });
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onFechar}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl w-full max-w-md shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Adicionar à Lista</h2>
            <button
              onClick={onFechar}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          {/* Conteúdo */}
          <div className="p-4 space-y-4">
            {/* Produto */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-14 h-14 bg-white rounded-lg overflow-hidden border border-gray-200">
                {produto.imagem_url ? (
                  <img
                    src={produto.imagem_url}
                    alt={produto.nome}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Package size={24} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{produto.nome}</p>
                <p className="text-sm text-gray-500">
                  {produto.fabricante}
                  {produto.modelo && ` • ${produto.modelo}`}
                </p>
                <p className="text-sm font-semibold text-wg-primary">
                  {formatCurrency(produto.preco)} / {produto.unidade}
                </p>
              </div>
            </div>

            {/* Quantidade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantidade
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantidade(Math.max(0.01, quantidade - 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600"
                >
                  <Minus size={18} />
                </button>
                <input
                  type="number"
                  value={quantidade}
                  onChange={(e) => setQuantidade(Math.max(0.01, parseFloat(e.target.value) || 0))}
                  step="0.01"
                  min="0.01"
                  className="w-24 px-3 py-2 text-center border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-wg-primary/20 focus:border-wg-primary"
                />
                <button
                  onClick={() => setQuantidade(quantidade + 1)}
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600"
                >
                  <Plus size={18} />
                </button>
                <span className="text-sm text-gray-500">{produto.unidade}</span>
              </div>
            </div>

            {/* Ambiente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ambiente
              </label>
              <select
                value={ambiente}
                onChange={(e) => setAmbiente(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-wg-primary/20 focus:border-wg-primary"
              >
                <option value="">Selecione...</option>
                {ambientes.map((amb) => (
                  <option key={amb} value={amb}>
                    {amb}
                  </option>
                ))}
                <option value="__novo__">+ Novo ambiente</option>
              </select>

              {ambiente === '__novo__' && (
                <input
                  type="text"
                  placeholder="Nome do novo ambiente"
                  value={novoAmbiente}
                  onChange={(e) => setNovoAmbiente(e.target.value)}
                  className="w-full mt-2 px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-wg-primary/20 focus:border-wg-primary"
                />
              )}
            </div>

            {/* Tipo de Compra */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Compra
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setTipoCompra('WG_COMPRA')}
                  className={`p-3 rounded-lg border flex items-center gap-2 transition-colors ${
                    tipoCompra === 'WG_COMPRA'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Building2 size={18} />
                  <div className="text-left">
                    <p className="font-medium text-sm">WG Compra</p>
                    <p className="text-xs opacity-75">Conta Real</p>
                  </div>
                </button>
                <button
                  onClick={() => setTipoCompra('CLIENTE_DIRETO')}
                  className={`p-3 rounded-lg border flex items-center gap-2 transition-colors ${
                    tipoCompra === 'CLIENTE_DIRETO'
                      ? 'border-amber-500 bg-amber-50 text-amber-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <User size={18} />
                  <div className="text-left">
                    <p className="font-medium text-sm">Cliente Direto</p>
                    <p className="text-xs opacity-75">Conta Virtual + FEE</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Observações */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações (opcional)
              </label>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Observações sobre este item..."
                rows={2}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-wg-primary/20 focus:border-wg-primary resize-none"
              />
            </div>

            {/* Total */}
            <div className="p-3 bg-wg-primary/5 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">
                  {formatQuantidade(quantidade, produto.unidade)} × {formatCurrency(produto.preco)}
                </span>
                <span className="text-lg font-bold text-wg-primary">
                  {formatCurrency(valorTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 flex gap-3">
            <button
              onClick={onFechar}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmar}
              disabled={!ambienteFinal}
              className="flex-1 px-4 py-2.5 bg-wg-primary text-white rounded-lg font-medium hover:bg-wg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
