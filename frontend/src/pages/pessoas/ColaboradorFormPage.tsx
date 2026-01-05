import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PessoaFormCompleto } from "@/components/pessoas/PessoaFormCompleto";
import { criarPessoa, obterPessoa, atualizarPessoa } from "@/lib/pessoasApi";
import type { PessoaInput, Pessoa } from "@/types/pessoas";

export default function ColaboradorFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState<Pessoa | null>(null);
  const isEditMode = Boolean(id);

  useEffect(() => {
    if (id) {
      setLoading(true);
      obterPessoa(id)
        .then((pessoa) => {
          if (pessoa) {
            setInitialData(pessoa);
          } else {
            alert("Colaborador não encontrado");
            navigate("/pessoas/colaboradores");
          }
        })
        .catch((error) => {
          console.error("Erro ao carregar colaborador:", error);
          alert("Erro ao carregar dados do colaborador");
          navigate("/pessoas/colaboradores");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id, navigate]);

  async function handleSubmit(data: PessoaInput) {
    try {
      if (isEditMode && id) {
        await atualizarPessoa(id, data);
        alert("Colaborador atualizado com sucesso!");
      } else {
        await criarPessoa(data);
        alert("Colaborador cadastrado com sucesso!");
      }
      navigate("/pessoas/colaboradores");
    } catch (error: any) {
      console.error("Erro ao salvar colaborador:", error);
      alert(error?.message || "Erro ao salvar colaborador. Verifique os dados e tente novamente.");
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl">
        <div className="flex items-center justify-center p-8">
          <div className="text-gray-500">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mt-4">
        <div>
          <h1 className="text-xl font-oswald tracking-wide text-gray-800">
            {isEditMode ? "Editar Colaborador" : "Novo Colaborador"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isEditMode ? "Atualize os dados deste cadastro." : "Preencha os dados principais deste cadastro."}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/pessoas/colaboradores")}
          className="text-sm text-[#F25C26] hover:underline"
        >
          Voltar
        </button>
      </div>

      <PessoaFormCompleto
        tipo="COLABORADOR"
        onSubmit={handleSubmit}
        onCancel={() => navigate("/pessoas/colaboradores")}
        initialData={initialData || undefined}
      />
    </div>
  );
}
