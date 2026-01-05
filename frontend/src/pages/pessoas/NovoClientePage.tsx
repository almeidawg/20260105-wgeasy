import { useNavigate } from "react-router-dom";
import { PessoaForm } from "@/components/pessoas/PessoaForm";
import { criarPessoa } from "@/lib/pessoasApi";

export default function NovoClientePage() {
  const navigate = useNavigate();

  async function handleSubmit(data: any) {
    await criarPessoa({
      ...data,
      tipo: "CLIENTE",
    });
    navigate("/clientes");
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mt-4">
        <div>
          <h1 className="text-xl font-oswald tracking-wide text-gray-800">
            Novo Cliente
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Preencha os dados principais deste cadastro.
          </p>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="text-sm text-[#F25C26] hover:underline"
        >
          Voltar
        </button>
      </div>

      <PessoaForm
        tipo="CLIENTE"
        onSubmit={handleSubmit}
        onCancel={() => navigate("/clientes")}
      />
    </div>
  );
}
