import { useState } from 'react';
import { X, ArrowUpCircle, ArrowDownCircle, ArrowRightLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLancamentosPessoais, useCategoriasPessoais, useContasPessoais } from '../hooks';
import type { TipoLancamento, NovoLancamentoForm } from '../types';

interface NovoLancamentoModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function NovoLancamentoModal({ open, onClose, onSuccess }: NovoLancamentoModalProps) {
  const [tipo, setTipo] = useState<TipoLancamento>('despesa');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [contaId, setContaId] = useState('');
  const [dataLancamento, setDataLancamento] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [salvando, setSalvando] = useState(false);

  const { criar } = useLancamentosPessoais();
  const { categoriasReceita, categoriasDespesa } = useCategoriasPessoais();
  const { contas } = useContasPessoais();

  const categorias = tipo === 'receita' ? categoriasReceita : categoriasDespesa;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao || !valor) return;

    setSalvando(true);
    try {
      const dados: NovoLancamentoForm = {
        tipo,
        descricao,
        valor: parseFloat(valor.replace(',', '.')),
        categoria_id: categoriaId || undefined,
        conta_id: contaId || undefined,
        data_lancamento: dataLancamento,
      };

      await criar(dados);

      // Reset form
      setDescricao('');
      setValor('');
      setCategoriaId('');
      setContaId('');
      setDataLancamento(new Date().toISOString().split('T')[0]);

      onSuccess();
    } finally {
      setSalvando(false);
    }
  };

  const tipoButtons = [
    { value: 'receita', label: 'Receita', icon: ArrowUpCircle, cor: 'green' },
    { value: 'despesa', label: 'Despesa', icon: ArrowDownCircle, cor: 'red' },
    { value: 'transferencia', label: 'Transferência', icon: ArrowRightLeft, cor: 'blue' },
  ] as const;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Lançamento</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo */}
          <div className="grid grid-cols-3 gap-2">
            {tipoButtons.map(btn => (
              <button
                key={btn.value}
                type="button"
                onClick={() => setTipo(btn.value)}
                className={`
                  flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all
                  ${tipo === btn.value
                    ? `border-${btn.cor}-500 bg-${btn.cor}-50`
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <btn.icon
                  className={`w-5 h-5 ${tipo === btn.value ? `text-${btn.cor}-600` : 'text-gray-400'}`}
                />
                <span className={`text-xs ${tipo === btn.value ? `text-${btn.cor}-600 font-medium` : 'text-gray-500'}`}>
                  {btn.label}
                </span>
              </button>
            ))}
          </div>

          {/* Descrição */}
          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Input
              id="descricao"
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              placeholder="Ex: Supermercado, Salário, etc."
              required
            />
          </div>

          {/* Valor */}
          <div>
            <Label htmlFor="valor">Valor (R$)</Label>
            <Input
              id="valor"
              value={valor}
              onChange={e => setValor(e.target.value)}
              placeholder="0,00"
              required
            />
          </div>

          {/* Categoria */}
          {tipo !== 'transferencia' && (
            <div>
              <Label htmlFor="categoria">Categoria</Label>
              <select
                id="categoria"
                value={categoriaId}
                onChange={e => setCategoriaId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Selecione uma categoria</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nome}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Conta */}
          <div>
            <Label htmlFor="conta">Conta</Label>
            <select
              id="conta"
              value={contaId}
              onChange={e => setContaId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">Selecione uma conta</option>
              {contas.filter(c => c.status === 'ativa').map(conta => (
                <option key={conta.id} value={conta.id}>
                  {conta.nome} {conta.banco && `(${conta.banco})`}
                </option>
              ))}
            </select>
          </div>

          {/* Data */}
          <div>
            <Label htmlFor="data">Data</Label>
            <Input
              id="data"
              type="date"
              value={dataLancamento}
              onChange={e => setDataLancamento(e.target.value)}
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={salvando || !descricao || !valor}
              className="flex-1 bg-[#F25C26] hover:bg-[#D94D1A]"
            >
              {salvando ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
