// src/components/cliente/ItensContratados.tsx
// Lista de itens contratados pelo cliente
// Mostra serviços/produtos incluídos no contrato

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  CheckCircle2,
  Clock,
  AlertCircle,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Building2,
  Hammer,
  Paintbrush,
  FileCheck,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface ItensContratadosProps {
  contratoId: string;
  mostrarValores?: boolean;
}

interface ItemContrato {
  id: string;
  nome: string;
  descricao: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  nucleo: string;
  status: 'pendente' | 'em_andamento' | 'concluido';
}

interface ContratosAtivos {
  id: string;
  numero: string;
  titulo: string;
  status: string;
  valor_total: number;
  data_assinatura: string;
  nucleos: string[];
}

// Ícone por núcleo
const NUCLEO_ICON: Record<string, any> = {
  arquitetura: Building2,
  engenharia: Hammer,
  marcenaria: Paintbrush,
  interiores: Paintbrush,
  default: Package,
};

export default function ItensContratados({ contratoId, mostrarValores = false }: ItensContratadosProps) {
  const [loading, setLoading] = useState(true);
  const [itens, setItens] = useState<ItemContrato[]>([]);
  const [contrato, setContrato] = useState<ContratosAtivos | null>(null);
  const [expandido, setExpandido] = useState(false);

  useEffect(() => {
    carregarItens();
  }, [contratoId]);

  async function carregarItens() {
    try {
      setLoading(true);

      // Buscar dados do contrato
      const { data: contratoData, error: contratoError } = await supabase
        .from('contratos')
        .select(`
          id,
          numero,
          titulo,
          status,
          valor_total,
          data_assinatura,
          nucleo
        `)
        .eq('id', contratoId)
        .single();

      if (contratoError) throw contratoError;

      // Buscar itens do contrato
      const { data: itensData, error: itensError } = await supabase
        .from('contratos_itens')
        .select(`
          id,
          descricao,
          quantidade,
          valor_unitario,
          valor_total,
          nucleo
        `)
        .eq('contrato_id', contratoId)
        .order('nucleo');

      if (itensError) throw itensError;

      // Transformar dados
      const itensFormatados = (itensData || []).map((item: any) => ({
        id: item.id,
        nome: item.descricao?.split(' - ')[0] || item.descricao || 'Item sem nome',
        descricao: item.descricao || '',
        quantidade: item.quantidade || 1,
        valor_unitario: item.valor_unitario || 0,
        valor_total: item.valor_total || 0,
        nucleo: item.nucleo || 'geral',
        status: 'pendente' as const,
      }));

      // Agrupar núcleos únicos
      const nucleosUnicos = [...new Set(itensFormatados.map((i) => i.nucleo))];

      setContrato({
        id: contratoData.id,
        numero: contratoData.numero || '-',
        titulo: contratoData.titulo || 'Contrato',
        status: contratoData.status || 'ativo',
        valor_total: contratoData.valor_total || 0,
        data_assinatura: contratoData.data_assinatura,
        nucleos: nucleosUnicos,
      });

      setItens(itensFormatados);
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
    } finally {
      setLoading(false);
    }
  }

  function formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  }

  function formatarData(data: string): string {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
  }

  function getIcon(nucleo: string) {
    const Icon = NUCLEO_ICON[nucleo.toLowerCase()] || NUCLEO_ICON.default;
    return Icon;
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'ativo':
        return (
          <Badge className="bg-green-500">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Ativo
          </Badge>
        );
      case 'concluido':
        return (
          <Badge className="bg-blue-500">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Concluído
          </Badge>
        );
      case 'aguardando_assinatura':
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-600">
            <Clock className="w-3 h-3 mr-1" />
            Aguardando Assinatura
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <AlertCircle className="w-3 h-3 mr-1" />
            {status}
          </Badge>
        );
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Carregando itens...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!contrato || itens.length === 0) {
    return (
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="pt-6 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Nenhum item contratado encontrado</p>
        </CardContent>
      </Card>
    );
  }

  // Agrupar itens por núcleo
  const itensPorNucleo = itens.reduce((acc, item) => {
    const nucleo = item.nucleo || 'geral';
    if (!acc[nucleo]) acc[nucleo] = [];
    acc[nucleo].push(item);
    return acc;
  }, {} as Record<string, ItemContrato[]>);

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => setExpandido(!expandido)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                📦 Itens Contratados
                {getStatusBadge(contrato.status)}
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Contrato #{contrato.numero} • {itens.length} item(ns) • {contrato.nucleos.length} núcleo(s)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {mostrarValores && (
              <div className="text-right">
                <p className="text-xs text-gray-500">Valor Total</p>
                <p className="text-lg font-bold text-green-600">{formatarMoeda(contrato.valor_total)}</p>
              </div>
            )}
            <div className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              {expandido ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      {expandido && (
        <CardContent>
          {/* Núcleos Contratados */}
          <div className="flex flex-wrap gap-2 mb-6">
            {contrato.nucleos.map((nucleo) => {
              const Icon = getIcon(nucleo);
              return (
                <Badge
                  key={nucleo}
                  variant="outline"
                  className="px-3 py-1 bg-blue-50 border-blue-200 text-blue-700"
                >
                  <Icon className="w-3 h-3 mr-1" />
                  {nucleo.charAt(0).toUpperCase() + nucleo.slice(1)}
                </Badge>
              );
            })}
          </div>

          {/* Lista de Itens por Núcleo */}
          <div className="space-y-6">
            {Object.entries(itensPorNucleo).map(([nucleo, itensNucleo]) => {
              const Icon = getIcon(nucleo);
              const totalNucleo = itensNucleo.reduce((acc, item) => acc + item.valor_total, 0);

              return (
                <div key={nucleo} className="border rounded-lg overflow-hidden">
                  {/* Header do Núcleo */}
                  <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-900">
                        {nucleo.charAt(0).toUpperCase() + nucleo.slice(1)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {itensNucleo.length} item(ns)
                      </Badge>
                    </div>
                    {mostrarValores && (
                      <span className="font-medium text-green-600">{formatarMoeda(totalNucleo)}</span>
                    )}
                  </div>

                  {/* Lista de Itens */}
                  <div className="divide-y">
                    {itensNucleo.map((item, idx) => (
                      <div
                        key={item.id}
                        className="px-4 py-3 flex items-center justify-between hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{item.nome}</p>
                            {item.quantidade > 1 && (
                              <p className="text-xs text-gray-500">Qtd: {item.quantidade}</p>
                            )}
                          </div>
                        </div>
                        {mostrarValores && (
                          <span className="text-sm text-gray-600">{formatarMoeda(item.valor_total)}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Informações Adicionais */}
          <div className="mt-6 pt-4 border-t bg-gray-50 -mx-6 -mb-6 px-6 py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">
                Data de Assinatura: {formatarData(contrato.data_assinatura)}
              </span>
              {mostrarValores && (
                <div className="flex items-center gap-2 text-green-600 font-medium">
                  <DollarSign className="w-4 h-4" />
                  Total: {formatarMoeda(contrato.valor_total)}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
