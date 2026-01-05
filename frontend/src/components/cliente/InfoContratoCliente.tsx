// ============================================================
// COMPONENTE: InfoContratoCliente
// Sistema WG Easy - Grupo WG Almeida
// ============================================================
// Exibe informações importantes do contrato na área do cliente
// ============================================================

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Calendar,
  User,
  MapPin,
  Phone,
  Mail,
  Clock,
  AlertCircle,
  CheckCircle,
  Building2,
  FileCheck,
} from "lucide-react";

interface ContratoInfo {
  id: string;
  numero: string;
  titulo: string;
  status: string;
  data_inicio: string | null;
  data_termino: string | null;
  valor_total: number | null;
  responsavel_nome: string | null;
  responsavel_cargo: string | null;
  responsavel_telefone: string | null;
  responsavel_email: string | null;
  endereco_obra: string | null;
  nucleos: string[];
}

interface InfoContratoClienteProps {
  contratoId?: string;
  clienteId?: string;
}

export default function InfoContratoCliente({
  contratoId,
  clienteId,
}: InfoContratoClienteProps) {
  const [contrato, setContrato] = useState<ContratoInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarContrato();
  }, [contratoId, clienteId]);

  async function carregarContrato() {
    try {
      setLoading(true);

      let query = supabase
        .from("contratos")
        .select(`
          id,
          numero,
          titulo,
          status,
          data_inicio,
          data_termino,
          valor_total,
          endereco_obra,
          responsavel:usuarios!contratos_responsavel_id_fkey (
            nome,
            cargo,
            telefone,
            email
          )
        `);

      if (contratoId) {
        query = query.eq("id", contratoId);
      } else if (clienteId) {
        query = query.eq("cliente_id", clienteId);
      }

      const { data, error } = await query
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Erro ao carregar contrato:", error);
      }

      if (data) {
        // Buscar núcleos do contrato
        const { data: nucleosData } = await supabase
          .from("contratos_nucleos")
          .select("nucleo")
          .eq("contrato_id", data.id);

        const responsavel = data.responsavel as any;

        setContrato({
          id: data.id,
          numero: data.numero,
          titulo: data.titulo,
          status: data.status,
          data_inicio: data.data_inicio,
          data_termino: data.data_termino,
          valor_total: data.valor_total,
          responsavel_nome: responsavel?.nome || null,
          responsavel_cargo: responsavel?.cargo || null,
          responsavel_telefone: responsavel?.telefone || null,
          responsavel_email: responsavel?.email || null,
          endereco_obra: data.endereco_obra,
          nucleos: nucleosData?.map((n: any) => n.nucleo) || [],
        });
      }
    } catch (error) {
      console.error("Erro ao carregar contrato:", error);
    } finally {
      setLoading(false);
    }
  }

  function formatarData(data: string | null): string {
    if (!data) return "A definir";
    return new Date(data + "T00:00:00").toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  function getStatusBadge(status: string) {
    const statusConfig: Record<
      string,
      { color: string; icon: React.ReactNode; label: string }
    > = {
      rascunho: {
        color: "bg-gray-100 text-gray-700",
        icon: <FileText className="w-3 h-3" />,
        label: "Rascunho",
      },
      pendente: {
        color: "bg-yellow-100 text-yellow-700",
        icon: <Clock className="w-3 h-3" />,
        label: "Pendente",
      },
      ativo: {
        color: "bg-green-100 text-green-700",
        icon: <CheckCircle className="w-3 h-3" />,
        label: "Em Execução",
      },
      pausado: {
        color: "bg-orange-100 text-orange-700",
        icon: <AlertCircle className="w-3 h-3" />,
        label: "Pausado",
      },
      concluido: {
        color: "bg-blue-100 text-blue-700",
        icon: <FileCheck className="w-3 h-3" />,
        label: "Concluído",
      },
      cancelado: {
        color: "bg-red-100 text-red-700",
        icon: <AlertCircle className="w-3 h-3" />,
        label: "Cancelado",
      },
    };

    const config = statusConfig[status] || statusConfig.pendente;

    return (
      <Badge className={`${config.color} gap-1`}>
        {config.icon}
        {config.label}
      </Badge>
    );
  }

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-gray-100 rounded w-2/3"></div>
            <div className="h-4 bg-gray-100 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!contrato) {
    return null;
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-lg font-oswald">
                Contrato #{contrato.numero}
              </CardTitle>
              <p className="text-orange-100 text-sm">{contrato.titulo}</p>
            </div>
          </div>
          {getStatusBadge(contrato.status)}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
          {/* Datas */}
          <div className="p-4 space-y-3">
            <h4 className="font-semibold text-gray-700 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-500" />
              Cronograma
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Início:</span>
                <span className="font-medium">
                  {formatarData(contrato.data_inicio)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Previsão de Término:</span>
                <span className="font-medium">
                  {formatarData(contrato.data_termino)}
                </span>
              </div>
            </div>
          </div>

          {/* Responsável */}
          <div className="p-4 space-y-3">
            <h4 className="font-semibold text-gray-700 flex items-center gap-2">
              <User className="w-4 h-4 text-orange-500" />
              Seu Consultor
            </h4>
            {contrato.responsavel_nome ? (
              <div className="space-y-2 text-sm">
                <div className="font-medium text-gray-900">
                  {contrato.responsavel_nome}
                </div>
                {contrato.responsavel_cargo && (
                  <div className="text-gray-500">
                    {contrato.responsavel_cargo}
                  </div>
                )}
                {contrato.responsavel_telefone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-3 h-3" />
                    <a
                      href={`tel:${contrato.responsavel_telefone}`}
                      className="hover:text-orange-600"
                    >
                      {contrato.responsavel_telefone}
                    </a>
                  </div>
                )}
                {contrato.responsavel_email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-3 h-3" />
                    <a
                      href={`mailto:${contrato.responsavel_email}`}
                      className="hover:text-orange-600"
                    >
                      {contrato.responsavel_email}
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">A ser definido</p>
            )}
          </div>
        </div>

        {/* Endereço da Obra */}
        {contrato.endereco_obra && (
          <div className="p-4 border-t bg-gray-50">
            <h4 className="font-semibold text-gray-700 flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-orange-500" />
              Local da Obra
            </h4>
            <p className="text-sm text-gray-600">{contrato.endereco_obra}</p>
          </div>
        )}

        {/* Núcleos */}
        {contrato.nucleos.length > 0 && (
          <div className="p-4 border-t">
            <h4 className="font-semibold text-gray-700 flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-orange-500" />
              Serviços Contratados
            </h4>
            <div className="flex flex-wrap gap-2">
              {contrato.nucleos.map((nucleo) => (
                <Badge key={nucleo} variant="outline" className="bg-orange-50">
                  {nucleo}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
