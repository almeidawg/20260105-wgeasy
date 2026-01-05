// src/components/UploadTecnicoMarcenaria.tsx

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface UploadTecnicoProps {
  itemId: string;
}

interface ArquivoItem {
  id: string;
  nome_arquivo: string;
  url: string;
  criado_em: string;
}

export default function UploadTecnicoMarcenaria({ itemId }: UploadTecnicoProps) {
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [arquivos, setArquivos] = useState<ArquivoItem[]>([]);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    listarArquivos();
  }, [itemId]);

  async function listarArquivos() {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    if (!userId) return;

    const { data, error } = await supabase
      .from("marcenaria_arquivos")
      .select("*")
      .eq("item_id", itemId)
      .eq("user_id", userId)
      .order("criado_em", { ascending: false });

    if (!error) setArquivos(data || []);
  }

  async function handleUpload() {
    if (!arquivo) return alert("Selecione um arquivo.");
    setCarregando(true);

    const caminho = `marcenaria/${itemId}/${Date.now()}_${arquivo.name}`;
    const { error: uploadError } = await supabase.storage.from("documentos").upload(caminho, arquivo);

    if (uploadError) {
      setCarregando(false);
      return alert("Erro no upload: " + uploadError.message);
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    const { data, error: insertError } = await supabase
      .from("marcenaria_arquivos")
      .insert({
        item_id: itemId,
        nome_arquivo: arquivo.name,
        url: caminho,
        user_id: userId,
      });

    setArquivo(null);
    setCarregando(false);
    if (insertError) alert("Erro ao salvar no banco: " + insertError.message);
    else listarArquivos();
  }

  async function handleExcluir(id: string, caminho: string) {
    const confirmar = confirm("Excluir este arquivo?");
    if (!confirmar) return;

    await supabase.storage.from("documentos").remove([caminho]);
    await supabase.from("marcenaria_arquivos").delete().eq("id", id);
    listarArquivos();
  }

  return (
    <div className="border p-4 rounded bg-gray-50 mb-6">
      <h3 className="font-semibold mb-2">Arquivos Técnicos</h3>

      <input type="file" onChange={(e) => setArquivo(e.target.files?.[0] || null)} />
      <button
        onClick={handleUpload}
        className="bg-[#F25C26] text-white px-3 py-1 rounded ml-2 hover:bg-[#d94d1f]"
        disabled={carregando}
      >
        {carregando ? "Enviando..." : "Enviar"}
      </button>

      <ul className="mt-4 space-y-2">
        {arquivos.map((arq) => (
          <li key={arq.id} className="flex items-center justify-between bg-white p-2 shadow rounded">
            <a
              href={supabase.storage.from("documentos").getPublicUrl(arq.url).data.publicUrl}
              target="_blank"
              rel="noreferrer"
              className="text-blue-700 hover:underline"
            >
              {arq.nome_arquivo}
            </a>
            <button
              onClick={() => handleExcluir(arq.id, arq.url)}
              className="text-red-600 hover:underline"
            >
              Excluir
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
