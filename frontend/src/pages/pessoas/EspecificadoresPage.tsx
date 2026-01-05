import PessoasList from "@/components/pessoas/PessoasList";

export default function EspecificadoresPage() {
  return (
    <PessoasList
      tipo="ESPECIFICADOR"
      titulo="Especificadores WG"
      descricao="Arquitetos, engenheiros e profissionais que especificam WG."
      novoPath="/pessoas/especificadores/novo"
    />
  );
}
