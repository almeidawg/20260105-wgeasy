// src/components/AssinaturasLista.tsx

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Assinatura {
  id: string;
  email: string;
  ip: string;
  criado_em: string;
  assinatura: string; // base64 image
}

export default function AssinaturasLista({ obraId }: { obraId: string }) {
  const [assinaturas, setAssinaturas] = useState<Assinatura[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarAssinaturas() {
      setCarregando(true);
      const { data, error } = await supabase
        .from("assinaturas")
        .select("id, email, ip, criado_em, assinatura")
        .eq("obra_id", obraId)
        .order("criado_em", { ascending: false });

      if (error) {
        console.error("Erro ao carregar assinaturas:", error.message);
      } else {
        setAssinaturas(data || []);
      }
      setCarregando(false);
    }

    carregarAssinaturas();
  }, [obraId]);

  if (carregando) return <p>Carregando assinaturas...</p>;
  if (assinaturas.length === 0) return <p>Nenhuma assinatura registrada ainda.</p>;

  return (
    <div style={{ marginTop: "24px" }}>
      <h3>Histórico de Assinaturas</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {assinaturas.map((a) => (
          <li key={a.id} style={{ marginBottom: "16px", borderBottom: "1px solid #ccc", paddingBottom: "8px" }}>
            <p><strong>Email:</strong> {a.email}</p>
            <p><strong>IP:</strong> {a.ip}</p>
            <p><strong>Data:</strong> {new Date(a.criado_em).toLocaleString("pt-BR")}</p>
            <img src={a.assinatura} alt="Assinatura" width={200} height={60} style={{ border: "1px solid #000" }} />
          </li>
        ))}
      </ul>
    </div>
  );
}
