import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabaseRaw as supabase } from "@/lib/supabaseClient";
import PessoaAvatarUploader from "@/components/pessoas/PessoaAvatarUploader";
import { gerarFichaClientePDF } from "@/lib/pdfFichaCliente";

import {
  Phone,
  Mail,
  Edit,
  Trash,
  FileText,
  MessageCircle,
} from "lucide-react";

import ObrasList from "@/components/pessoas/ObrasList";
import DocumentosList from "@/components/pessoas/DocumentosList";
import OportunidadeTimeline from "@/components/oportunidades/OportunidadeTimeline";

export default function PessoaDetalhePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pessoa, setPessoa] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // Busca pessoa no Supabase
  async function fetchPessoa() {
    if (!id) {
      setErro("ID não informado");
      setLoading(false);
      return;
    }

    setLoading(true);
    setErro(null);

    try {
      const { data, error } = await supabase
        .from("pessoas")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Erro ao buscar pessoa:", error);
        setErro("Pessoa não encontrada ou erro ao carregar dados.");
        setPessoa(null);
      } else {
        setPessoa(data);
      }
    } catch (err) {
      console.error("Erro inesperado:", err);
      setErro("Erro inesperado ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPessoa();
  }, [id]);

  async function deletarPessoa() {
    if (!confirm("Deseja realmente excluir este cadastro?")) return;

    await supabase.from("pessoas").delete().eq("id", id);
    navigate("/pessoas/clientes");
  }

  async function gerarPdfCliente() {
    try {
      await gerarFichaClientePDF({ pessoaId: pessoa.id, pessoa });
    } catch (error) {
      console.error("Erro ao gerar PDF do cliente:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Não foi possível gerar o PDF."
      );
    }
  }

  if (loading) {
    return <div className="p-6 text-gray-500">Carregando...</div>;
  }

  if (erro) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <div className="text-red-500 text-4xl mb-4">!</div>
          <h2 className="text-lg font-semibold text-red-700 mb-2">Erro ao carregar</h2>
          <p className="text-red-600 mb-4">{erro}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  if (!pessoa) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <h2 className="text-lg font-semibold text-yellow-700 mb-2">Pessoa não encontrada</h2>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  const whatsapp = pessoa.telefone
    ? "https://wa.me/55" + pessoa.telefone.replace(/\D/g, "")
    : null;

  const emailLink = pessoa.email ? `mailto:${pessoa.email}` : null;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10 font-poppins">

      {/* TOPO */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <div className="flex items-center gap-6">

          {/* Avatar */}
          <PessoaAvatarUploader
            pessoaId={pessoa.id}
            nome={pessoa.nome}
            avatar_url={pessoa.avatar_url}
            foto_url={pessoa.foto_url}
            avatar={pessoa.avatar}
            onChange={async (data) => {
              await supabase.from("pessoas").update(data).eq("id", pessoa.id);
              fetchPessoa();
            }}
          />

          {/* Nome + tipo */}
          <div className="flex-1">
            <h1 className="text-2xl font-semibold">{pessoa.nome}</h1>
            <p className="text-gray-500 mt-1">{pessoa.tipo}</p>

            <div className="flex gap-4 text-sm text-gray-600 mt-3">
              {pessoa.email && (
                <div className="flex items-center gap-2">
                  <Mail size={14} /> {pessoa.email}
                </div>
              )}

              {pessoa.telefone && (
                <div className="flex items-center gap-2">
                  <Phone size={14} /> {pessoa.telefone}
                </div>
              )}
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-2">

            {/* EDITAR */}
            <button
              onClick={() => {
                // Pluralizar tipo para rota correta (português)
                const pluralizarTipo = (tipo: string): string => {
                  const t = tipo.toLowerCase();
                  // Tipos terminados em 'or' -> 'ores' (colaborador, fornecedor, especificador)
                  if (t.endsWith('or')) return t + 'es';
                  // Tipos terminados em 'e' -> 'es' (cliente)
                  if (t.endsWith('e')) return t + 's';
                  // Outros casos
                  return t + 's';
                };
                const tipoPlural = pluralizarTipo(pessoa.tipo);
                navigate(`/pessoas/${tipoPlural}/editar/${pessoa.id}`);
              }}
              className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200"
            >
              <Edit size={18} />
            </button>

            {/* PDF */}
            <button
              onClick={gerarPdfCliente}
              className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200"
            >
              <FileText size={18} />
            </button>

            {/* WHATSAPP */}
            {whatsapp && (
              <a
                href={whatsapp}
                target="_blank"
                className="px-3 py-2 rounded-md bg-green-500 text-white hover:bg-green-600"
              >
                <MessageCircle size={18} />
              </a>
            )}

            {/* EMAIL */}
            {emailLink && (
              <a
                href={emailLink}
                className="px-3 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
              >
                <Mail size={18} />
              </a>
            )}

            {/* EXCLUIR */}
            <button
              onClick={deletarPessoa}
              className="px-3 py-2 rounded-md bg-red-500 text-white hover:bg-red-600"
            >
              <Trash size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* INFO GERAL */}
      <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
        <h2 className="text-lg font-semibold">Informações Gerais</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">

          <Info label="Cargo / Função" value={pessoa.cargo} />
          <Info label="Unidade" value={pessoa.unidade} />
          <Info label="CPF" value={pessoa.cpf} />
          <Info label="RG" value={pessoa.rg} />
          <Info label="Empresa" value={pessoa.empresa} />
          <Info label="Contato Responsável" value={pessoa.contato_responsavel} />
          <Info label="PIX" value={pessoa.pix} />
        </div>
      </div>

      {/* ENDEREÇO */}
      <Section title="Endereço">
        <Endereco pessoa={pessoa} />
      </Section>

      {/* ENDEREÇO DA OBRA */}
      {pessoa.tipo === "CLIENTE" && (
        <Section title="Endereço da Obra">
          <Endereco pessoa={pessoa} prefixo="obra_" />
        </Section>
      )}

      {/* DOCUMENTOS */}
      <Section title="Documentos">
        <DocumentosList pessoaId={pessoa.id} />
      </Section>

      {/* OBRAS */}
      <Section title="Obras">
        <ObrasList pessoaId={pessoa.id} />
      </Section>

      {/* OPORTUNIDADES */}
      <Section title="Oportunidades / Comercial">
        <OportunidadeTimeline pessoaId={pessoa.id} />
      </Section>

      {/* HISTÓRICO */}
      <Section title="Histórico">
        <div className="text-gray-500 text-sm">Em desenvolvimento...</div>
      </Section>

    </div>
  );
}

/* ---- COMPONENTES AUXILIARES ---- */

function Section({ title, children }: any) {
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </div>
  );
}

function Info({ label, value }: any) {
  if (!value) return null;
  return (
    <div className="flex flex-col">
      <span className="text-gray-400">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function Endereco({ pessoa, prefixo = "" }: any) {
  const c = (campo: string) => pessoa?.[prefixo + campo];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
      <Info label="CEP" value={c("cep")} />
      <Info label="Logradouro" value={c("logradouro")} />
      <Info label="Número" value={c("numero")} />
      <Info label="Complemento" value={c("complemento")} />
      <Info label="Bairro" value={c("bairro")} />
      <Info label="Cidade" value={c("cidade")} />
      <Info label="Estado" value={c("estado")} />
    </div>
  );
}
