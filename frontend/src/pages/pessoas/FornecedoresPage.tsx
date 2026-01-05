import PessoasList from "@/components/pessoas/PessoasList";

export default function FornecedoresPage() {
  return (
    <PessoasList
      tipo="FORNECEDOR"
      titulo="Fornecedores WG"
      descricao="Parceiros de materiais, serviços e soluções."
      novoPath="/pessoas/fornecedores/novo"
    />
  );
}
