// ============================================================
// STEP CLIENTE - Seleção de cliente/obra
// Sistema WG Easy - Grupo WG Almeida
// ============================================================

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Building2,
  MapPin,
  Users,
  FileText,
  CheckCircle,
  Loader2,
  Calendar,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export interface ClienteObra {
  id: string;
  nome: string;
  endereco?: string;
  tipo?: string;
  area_total?: number;
  total_ambientes?: number;
  status?: string;
  analise_id?: string;
  pedidos_count?: number;
  ultimo_pedido?: string;
  origem: "analise" | "cliente";
}

interface StepClienteProps {
  clienteSelecionado: ClienteObra | null;
  onSelecionar: (cliente: ClienteObra) => void;
  mostrarPedidosAnteriores?: boolean;
}

export function StepCliente({
  clienteSelecionado,
  onSelecionar,
  mostrarPedidosAnteriores = true,
}: StepClienteProps) {
  const [clientes, setClientes] = useState<ClienteObra[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroOrigem, setFiltroOrigem] = useState<"todos" | "analise" | "cliente">("todos");

  useEffect(() => {
    carregarClientes();
  }, []);

  async function carregarClientes() {
    try {
      setLoading(true);
      const clientesFormatados: ClienteObra[] = [];

      // 1. Buscar análises de projeto (com ambientes já calculados)
      const { data: analises, error: analisesError } = await supabase
        .from("analises_projeto")
        .select(`
          id,
          titulo,
          cliente_id,
          endereco_obra,
          status,
          total_ambientes,
          total_area_piso,
          criado_em,
          pessoas!cliente_id(id, nome)
        `)
        .in("status", ["analisado", "aprovado", "em_execucao"])
        .order("criado_em", { ascending: false });

      if (!analisesError && analises) {
        for (const a of analises) {
          const clienteNome = (a.pessoas as any)?.nome || a.titulo;
          clientesFormatados.push({
            id: a.id,
            nome: clienteNome,
            endereco: a.endereco_obra,
            tipo: a.titulo,
            area_total: a.total_area_piso,
            total_ambientes: a.total_ambientes,
            status: a.status,
            analise_id: a.id,
            origem: "analise",
          });
        }
      }

      // 2. Buscar clientes diretos (sem análise)
      const { data: clientesDiretos, error: clientesError } = await supabase
        .from("pessoas")
        .select("id, nome, endereco")
        .eq("tipo", "CLIENTE")
        .eq("ativo", true)
        .order("nome");

      if (!clientesError && clientesDiretos) {
        for (const c of clientesDiretos) {
          // Evitar duplicatas
          const jaExiste = clientesFormatados.some(
            (cf) => cf.nome.toLowerCase() === c.nome.toLowerCase()
          );
          if (!jaExiste) {
            clientesFormatados.push({
              id: c.id,
              nome: c.nome,
              endereco: c.endereco,
              origem: "cliente",
            });
          }
        }
      }

      setClientes(clientesFormatados);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
    } finally {
      setLoading(false);
    }
  }

  const clientesFiltrados = useMemo(() => {
    let resultado = clientes;

    // Filtro por origem
    if (filtroOrigem !== "todos") {
      resultado = resultado.filter((c) => c.origem === filtroOrigem);
    }

    // Filtro por busca
    if (busca.trim()) {
      const termo = busca.toLowerCase();
      resultado = resultado.filter(
        (c) =>
          c.nome.toLowerCase().includes(termo) ||
          c.tipo?.toLowerCase().includes(termo) ||
          c.endereco?.toLowerCase().includes(termo)
      );
    }

    return resultado;
  }, [clientes, busca, filtroOrigem]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#F25C26] animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header com busca e filtros */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Selecionar Cliente/Obra</h2>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Filtros */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setFiltroOrigem("todos")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filtroOrigem === "todos"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setFiltroOrigem("analise")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filtroOrigem === "analise"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Com Análise
            </button>
            <button
              type="button"
              onClick={() => setFiltroOrigem("cliente")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filtroOrigem === "cliente"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Clientes
            </button>
          </div>

          {/* Busca */}
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar cliente..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F25C26]/20 focus:border-[#F25C26] outline-none"
            />
          </div>
        </div>
      </div>

      {/* Lista de clientes */}
      {clientesFiltrados.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Nenhum cliente encontrado</p>
          <p className="text-sm text-gray-400 mt-1">
            {filtroOrigem === "analise"
              ? "Crie uma análise de projeto primeiro"
              : "Cadastre um cliente no sistema"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clientesFiltrados.map((cliente) => {
            const isSelected = clienteSelecionado?.id === cliente.id;

            return (
              <div
                key={cliente.id}
                onClick={() => onSelecionar(cliente)}
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  isSelected
                    ? "border-[#F25C26] bg-[#F25C26]/5 shadow-md"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isSelected
                          ? "bg-[#F25C26] text-white"
                          : cliente.origem === "analise"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{cliente.nome}</h3>
                      {cliente.tipo && cliente.tipo !== cliente.nome && (
                        <p className="text-sm text-gray-500">{cliente.tipo}</p>
                      )}
                    </div>
                  </div>
                  {isSelected && <CheckCircle className="w-5 h-5 text-[#F25C26]" />}
                </div>

                <div className="space-y-1 text-sm">
                  {cliente.endereco && (
                    <div className="flex items-center gap-2 text-gray-500">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{cliente.endereco}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-gray-500">
                    {cliente.area_total && (
                      <span>{cliente.area_total.toFixed(0)}m²</span>
                    )}
                    {cliente.total_ambientes && (
                      <span>{cliente.total_ambientes} amb.</span>
                    )}
                  </div>

                  {/* Badge de origem */}
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded ${
                        cliente.origem === "analise"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {cliente.origem === "analise" ? "Análise de Projeto" : "Cliente"}
                    </span>
                    {cliente.status && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded bg-green-100 text-green-700">
                        {cliente.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info se cliente com análise */}
      {clienteSelecionado?.origem === "analise" && (
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-blue-900">Cliente com Análise de Projeto</p>
              <p className="text-sm text-blue-700 mt-1">
                Você poderá calcular materiais automaticamente com base nos ambientes e medições.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StepCliente;
