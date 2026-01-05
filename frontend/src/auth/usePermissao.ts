import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { obterPermissaoUsuario } from "@/lib/permissoesApi";

export function usePermissao() {
  const { user } = useAuth();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const userId = user?.id;
    if (!userId) return;

    async function carregar(id: string) {
      const r = await obterPermissaoUsuario(id);
      setRole(r);
    }

    carregar(userId);
  }, [user?.id]);

  return { role };
}
