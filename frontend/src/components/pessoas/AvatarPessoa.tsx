// src/components/pessoas/AvatarPessoa.tsx
import { useState } from "react";
import { Pessoa } from "@/lib/pessoasApi";
import { supabase } from "@/lib/supabaseClient";

interface Props {
  pessoa: Pessoa;
  tamanho?: number;
}

const AvatarPessoa: React.FC<Props> = ({ pessoa, tamanho = 64 }) => {
  const [uploading, setUploading] = useState(false);

  const iniciais = pessoa.nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);
      const file = e.target.files?.[0];
      if (!file || !pessoa.id) return;

      const ext = file.name.split(".").pop();
      const filePath = `avatars/${pessoa.id}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("pessoas")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("pessoas").getPublicUrl(filePath);

      await supabase
        .from("pessoas")
        .update({ avatar_url: data.publicUrl })
        .eq("id", pessoa.id);

      window.location.reload();
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="relative group" style={{ width: tamanho, height: tamanho }}>
      {pessoa.avatar_url ? (
        <img
          src={pessoa.avatar_url}
          alt={pessoa.nome}
          className="h-full w-full rounded-full object-cover shadow-md"
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center rounded-full bg-[#F3F3F3] text-[#2E2E2E] font-semibold shadow-md"
          style={{ fontSize: tamanho / 2.5 }}
        >
          {iniciais}
        </div>
      )}

      <label className="absolute inset-0 hidden cursor-pointer items-center justify-center rounded-full bg-black/40 text-white text-[11px] group-hover:flex">
        {uploading ? "..." : "Trocar"}
        <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </label>
    </div>
  );
};

export default AvatarPessoa;
