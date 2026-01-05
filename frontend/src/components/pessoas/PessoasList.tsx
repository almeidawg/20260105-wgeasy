import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { Pessoa, PessoaTipo } from "@/types/pessoas";
import { listarPessoasComDataVinculo, deletarPessoa } from "@/lib/pessoasApi";
import { gerarFichaClientePDF } from "@/lib/pdfFichaCliente";
import PessoaCard from "./PessoaCard";
import { BotaoGerarLink } from "@/components/cadastro-link/GerarLinkCadastroModal";
import type { TipoCadastro } from "@/lib/cadastroLinkApi";
import { Search, Calendar, Users, ArrowUpDown } from "lucide-react";

type OrdenacaoTipo = "vinculo_asc" | "vinculo_desc" | "nome_asc" | "nome_desc" | "recente";

interface PessoasListProps {
  tipo: PessoaTipo;
  titulo: string;
  descricao?: string;
  novoPath: string;
}

export default function PessoasList({
  tipo,
  titulo,
  descricao,
  novoPath,
}: PessoasListProps) {
  const navigate = useNavigate();
  const [pessoas, setPessoas] = useState<(Pessoa & { data_vinculo?: string | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [ordenacao, setOrdenacao] = useState<OrdenacaoTipo>("vinculo_desc");

  useEffect(() => {
    let cancelado = false;

    async function carregar() {
      try {
        setLoading(true);
        const data = await listarPessoasComDataVinculo({ tipo, ativo: true });
        if (!cancelado) {
          setPessoas(data);
          setErro(null);
        }
      } catch (e: any) {
        if (!cancelado) {
          setErro(e.message ?? "Erro ao carregar cadastro.");
        }
      } finally {
        if (!cancelado) setLoading(false);
      }
    }

    carregar();

    return () => {
      cancelado = true;
    };
  }, [tipo]);

  // Normalizar texto (remover acentos e converter para minúsculas)
  const normalizar = (texto: string | null | undefined): string => {
    if (!texto) return "";
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove acentos
      .replace(/\s+/g, " ") // Normaliza espaços
      .trim();
  };

  // Filtrar e ordenar pessoas
  const pessoasFiltradas = useMemo(() => {
    let resultado = [...pessoas];

    // Filtrar por busca (flexível - ignora acentos e maiúsculas)
    if (busca.trim()) {
      const termoNormalizado = normalizar(busca);
      const termos = termoNormalizado.split(" ").filter(t => t.length > 0);

      resultado = resultado.filter((p) => {
        const nomeNorm = normalizar(p.nome);
        const emailNorm = normalizar(p.email);
        const telefoneNorm = normalizar(p.telefone);
        const cpfNorm = normalizar(p.cpf);
        const cnpjNorm = normalizar(p.cnpj);
        const cargoNorm = normalizar(p.cargo);
        const empresaNorm = normalizar(p.empresa);

        // Todos os termos devem estar presentes em algum campo
        return termos.every(termo =>
          nomeNorm.includes(termo) ||
          emailNorm.includes(termo) ||
          telefoneNorm.includes(termo) ||
          cpfNorm.includes(termo) ||
          cnpjNorm.includes(termo) ||
          cargoNorm.includes(termo) ||
          empresaNorm.includes(termo)
        );
      });
    }

    // Ordenar
    resultado.sort((a, b) => {
      switch (ordenacao) {
        case "vinculo_asc":
          // Data de vínculo mais antiga primeiro
          if (a.data_vinculo && !b.data_vinculo) return -1;
          if (!a.data_vinculo && b.data_vinculo) return 1;
          if (a.data_vinculo && b.data_vinculo) {
            return new Date(a.data_vinculo).getTime() - new Date(b.data_vinculo).getTime();
          }
          return a.nome.localeCompare(b.nome);

        case "vinculo_desc":
          // Data de vínculo mais recente primeiro
          if (a.data_vinculo && !b.data_vinculo) return -1;
          if (!a.data_vinculo && b.data_vinculo) return 1;
          if (a.data_vinculo && b.data_vinculo) {
            return new Date(b.data_vinculo).getTime() - new Date(a.data_vinculo).getTime();
          }
          return a.nome.localeCompare(b.nome);

        case "nome_asc":
          return a.nome.localeCompare(b.nome);

        case "nome_desc":
          return b.nome.localeCompare(a.nome);

        case "recente":
          // Mais recente (criado_em) primeiro
          return new Date(b.criado_em || 0).getTime() - new Date(a.criado_em || 0).getTime();

        default:
          return 0;
      }
    });

    return resultado;
  }, [pessoas, busca, ordenacao]);

  // Estatísticas
  const stats = useMemo(() => {
    const total = pessoas.length;
    const comVinculo = pessoas.filter(p => p.data_vinculo).length;
    return { total, comVinculo };
  }, [pessoas]);

  const handleEdit = (pessoa: Pessoa) => {
    const editPath = novoPath.replace("/novo", `/editar/${pessoa.id}`);
    navigate(editPath);
  };

  const handleDelete = async (pessoa: Pessoa) => {
    if (!confirm(`Deseja realmente excluir ${pessoa.nome}?`)) return;

    try {
      await deletarPessoa(pessoa.id);
      setPessoas((prev) => prev.filter((p) => p.id !== pessoa.id));
    } catch (e: any) {
      alert(e.message ?? "Erro ao excluir");
    }
  };

  const handleView = (pessoa: Pessoa) => {
    const viewPath = novoPath.replace("/novo", `/${pessoa.id}`);
    navigate(viewPath);
  };

  const handlePdf = async (pessoa: Pessoa) => {
    try {
      await gerarFichaClientePDF({ pessoaId: pessoa.id, pessoa });
    } catch (error) {
      console.error("Erro ao gerar PDF do cliente:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível gerar o PDF.";
      alert(message);
    }
  };

  const handleVerPropostas = (pessoa: Pessoa) => {
    navigate(`/propostas/cliente/${pessoa.id}`);
  };

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{titulo}</h1>
          {descricao && (
            <p className="text-sm text-gray-500 mt-1">{descricao}</p>
          )}
        </div>

        <div className="flex gap-2">
          <BotaoGerarLink
            tipo={tipo.toUpperCase() as TipoCadastro}
          />
          <button
            type="button"
            onClick={() => navigate(novoPath)}
            className="px-4 py-2 rounded-lg bg-[#F25C26] hover:bg-[#d94d1a] text-white text-sm font-medium"
          >
            + Novo cadastro
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      {!loading && pessoas.length > 0 && (
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
            <Users size={16} className="text-blue-600" />
            <span className="text-sm text-blue-900 font-medium">{stats.total} cadastros</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-[#F25C26]/10 rounded-lg">
            <Calendar size={16} className="text-[#F25C26]" />
            <span className="text-sm text-[#F25C26] font-medium">{stats.comVinculo} com histórico financeiro</span>
          </div>
        </div>
      )}

      {/* Barra de Busca e Ordenação */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Campo de Busca */}
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome, email, telefone, CPF ou CNPJ..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F25C26]/20 focus:border-[#F25C26]"
          />
        </div>

        {/* Ordenação */}
        <div className="relative">
          <ArrowUpDown size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value as OrdenacaoTipo)}
            className="pl-9 pr-8 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#F25C26]/20 focus:border-[#F25C26] appearance-none cursor-pointer"
          >
            <option value="vinculo_asc">Cliente mais antigo</option>
            <option value="vinculo_desc">Cliente mais recente</option>
            <option value="nome_asc">Nome A-Z</option>
            <option value="nome_desc">Nome Z-A</option>
            <option value="recente">Cadastro recente</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F25C26]" />
        </div>
      )}

      {erro && (
        <div className="text-sm text-red-600 border border-red-200 bg-red-50 p-3 rounded-lg">
          {erro}
        </div>
      )}

      {!loading && !erro && pessoas.length === 0 && (
        <div className="text-sm text-gray-500 border border-dashed rounded-lg p-4">
          Nenhum cadastro encontrado para este grupo.
        </div>
      )}

      {!loading && !erro && pessoas.length > 0 && pessoasFiltradas.length === 0 && (
        <div className="text-sm text-gray-500 border border-dashed rounded-lg p-4 text-center">
          Nenhum resultado encontrado para "{busca}"
        </div>
      )}

      {/* Contador de resultados */}
      {!loading && busca && pessoasFiltradas.length > 0 && (
        <div className="text-sm text-gray-500">
          {pessoasFiltradas.length} resultado{pessoasFiltradas.length !== 1 ? "s" : ""} encontrado{pessoasFiltradas.length !== 1 ? "s" : ""}
        </div>
      )}

      <div className="space-y-3">
        {pessoasFiltradas.map((p) => (
          <PessoaCard
            key={p.id}
            pessoa={p}
            onClick={() => handleView(p)}
            onEdit={() => handleEdit(p)}
            onDelete={() => handleDelete(p)}
            onPdf={() => handlePdf(p)}
            onVerPropostas={() => handleVerPropostas(p)}
          />
        ))}
      </div>
    </div>
  );
}
