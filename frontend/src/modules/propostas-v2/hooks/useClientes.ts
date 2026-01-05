// ============================================================
// useClientes - Hook para buscar e selecionar clientes
// Sistema WG Easy - Grupo WG Almeida
// ============================================================

import { useState, useCallback } from "react";
import { supabaseRaw as supabase } from "@/lib/supabaseClient";
import type { Cliente } from "../types";

export interface UseClientesReturn {
  clientes: Cliente[];
  loading: boolean;
  buscar: (termo: string) => Promise<void>;
  limpar: () => void;
}

export function useClientes(): UseClientesReturn {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);

  const buscar = useCallback(async (termo: string) => {
    console.log("[useClientes] Buscando:", termo);

    if (!termo || termo.length < 2) {
      setClientes([]);
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("pessoas")
        .select("*")
        .ilike("nome", `%${termo}%`)
        .limit(10);

      console.log("[useClientes] Resultado:", { data, error });

      if (error) {
        console.error("Erro ao buscar clientes:", error.message, error.details, error.hint);
        return;
      }

      setClientes((data || []) as Cliente[]);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const limpar = useCallback(() => {
    setClientes([]);
  }, []);

  return {
    clientes,
    loading,
    buscar,
    limpar,
  };
}

export default useClientes;
