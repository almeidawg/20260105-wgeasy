// src/components/FormularioItemMarcenaria.tsx

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Props {
  obraId: string;
  onSalvar: () => void;
}

export default function FormularioItemMarcenaria({ obraId, onSalvar }: Props) {
  const [descricao, setDescricao] = useState("");
  const [ambiente, setAmbiente] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [largura, setLargura] = useState(0);
  const [altura, setAltura] = useState(0);
  const [profundidade, setProfundidade] = useState(0);
  const [acabamento, setAcabamento] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [status, setStatus] = useState("pendente");
  const [valorUnitario, setValorUnitario] = useState(0);
  const [imagem, setImagem] = useState<File | null>(null);

  async function handleSalvar() {
    const valor_total = quantidade * valorUnitario;

    let imagem_url = "";
    if (imagem) {
      const nomeArquivo = `${obraId}/marcenaria/${Date.now()}_${imagem.name}`;
      const { error: uploadError } = await supabase.storage
        .from("documentos")
        .upload(nomeArquivo, imagem);

      if (uploadError) {
        alert("Erro ao enviar imagem");
        return;
      }

      imagem_url = supabase.storage.from("documentos").getPublicUrl(nomeArquivo).data.publicUrl;
    }

    const { error } = await supabase.from("marcenaria_itens").insert({
      obra_id: obraId,
      ambiente,
      descricao,
      quantidade,
      largura,
      altura,
      profundidade,
      acabamento,
      observacoes,
      valor_unitario: valorUnitario,
      valor_total,
      status,
      imagem_url,
    });

    if (error) {
      alert("Erro ao salvar item: " + error.message);
    } else {
      alert("Item salvo com sucesso!");
      onSalvar();
    }
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <h3>Adicionar Item de Marcenaria</h3>
      <input value={ambiente} onChange={(e) => setAmbiente(e.target.value)} placeholder="Ambiente" />
      <input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descrição" />
      <input type="number" value={quantidade} onChange={(e) => setQuantidade(+e.target.value)} placeholder="Qtd" />
      <input type="number" value={largura} onChange={(e) => setLargura(+e.target.value)} placeholder="Largura" />
      <input type="number" value={altura} onChange={(e) => setAltura(+e.target.value)} placeholder="Altura" />
      <input type="number" value={profundidade} onChange={(e) => setProfundidade(+e.target.value)} placeholder="Profundidade" />
      <input value={acabamento} onChange={(e) => setAcabamento(e.target.value)} placeholder="Acabamento" />
      <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="Observações" />
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="pendente">Pendente</option>
        <option value="em_producao">Em Produção</option>
        <option value="entregue">Entregue</option>
      </select>
      <input type="number" value={valorUnitario} onChange={(e) => setValorUnitario(+e.target.value)} placeholder="Valor Unitário" />
      <input type="file" onChange={(e) => setImagem(e.target.files?.[0] || null)} />
      <button onClick={handleSalvar}>Salvar Item</button>
    </div>
  );
}
