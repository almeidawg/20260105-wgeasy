// src/hooks/usePipelineWG.ts
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { PipelineItem } from "@/types/pipeline";

interface UsePipelineWGResult {
  data: PipelineItem[] | null;
  loading: boolean;
  error: string | null;
}

export function usePipelineWG(): UsePipelineWGResult {
  const [data, setData] = useState<PipelineItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("pipeline_wg_view")
        .select("*")
        .order("created_at", { ascending: false });

      if (!isMounted) return;

      if (error) {
        console.error("Erro ao carregar pipeline_wg_view:", error);
        setError(error.message);
        setData(null);
      } else {
        setData(data as PipelineItem[]);
        setError(null);
      }

      setLoading(false);
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  return { data, loading, error };
}
