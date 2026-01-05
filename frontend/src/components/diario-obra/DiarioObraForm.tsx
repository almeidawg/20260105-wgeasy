/**
 * Formulário para criar/editar registro do Diário de Obra
 * Inclui seleção de cliente, descrição e captura de fotos
 */

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Building2, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DiarioFotoCapture from "./DiarioFotoCapture";
import { supabase } from "@/lib/supabaseClient";
import {
  criarRegistroDiario,
  uploadFotoDiario,
  buscarPastaDiarioObra,
} from "@/lib/diarioObraApi";
import type { FotoCapturaPreview } from "@/types/diarioObra";

interface DiarioObraFormProps {
  colaboradorId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FormData {
  cliente_id: string;
  titulo: string;
  descricao: string;
  clima: string;
  equipe_presente: number;
}

interface Cliente {
  id: string;
  nome: string;
}

function DiarioObraForm({
  colaboradorId,
  onSuccess,
  onCancel,
}: DiarioObraFormProps) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState<string>("");
  const [fotos, setFotos] = useState<FotoCapturaPreview[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      cliente_id: "",
      titulo: "",
      descricao: "",
      clima: "",
      equipe_presente: 0,
    },
  });

  const selectedClienteId = watch("cliente_id");

  // Carregar clientes ao montar
  useEffect(() => {
    async function loadClientes() {
      try {
        const { data, error } = await supabase
          .from("pessoas")
          .select("id, nome")
          .eq("tipo", "CLIENTE")
          .eq("ativo", true)
          .order("nome");
        if (!error) setClientes(data || []);
      } catch (error) {
        console.error("Erro ao carregar clientes:", error);
      }
    }
    loadClientes();
  }, []);

  // Handler de submit
  async function onSubmit(data: FormData) {
    if (!data.cliente_id) {
      return;
    }

    try {
      setSubmitting(true);

      // 1. Criar registro do diário vinculado ao cliente
      const diario = await criarRegistroDiario({
        cliente_id: data.cliente_id,
        colaborador_id: colaboradorId,
        titulo: data.titulo || undefined,
        descricao: data.descricao || undefined,
        clima: data.clima || undefined,
        equipe_presente: data.equipe_presente || undefined,
      });

      // 2. Buscar pasta do Google Drive do cliente para salvar fotos/comprovantes
      let driveFolderId: string | null = null;
      try {
        driveFolderId = await buscarPastaDiarioObra(data.cliente_id);
      } catch (e) {
        console.warn(
          "Não foi possível localizar a pasta do cliente no Drive.",
          e
        );
      }

      // 3. Fazer upload das fotos
      if (fotos.length > 0) {
        setUploadProgress({ current: 0, total: fotos.length });
        for (let i = 0; i < fotos.length; i++) {
          const foto = fotos[i];
          setUploadProgress({ current: i + 1, total: fotos.length });
          try {
            await uploadFotoDiario(
              diario.id,
              foto.file,
              foto.descricao,
              driveFolderId || undefined
            );
          } catch (uploadError) {
            console.error(
              `Erro ao fazer upload da foto ${i + 1}:`,
              uploadError
            );
          }
        }
      }

      // Sucesso
      setUploadProgress(null);
      onSuccess?.();
    } catch (error: any) {
      console.error("Erro ao salvar diário:", error);
      const mensagemErro = error?.message || "Erro desconhecido";
      alert(`Erro ao salvar registro: ${mensagemErro}`);
    } finally {
      setSubmitting(false);
      setUploadProgress(null);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Seleção de Cliente */}
      <div className="space-y-2">
        <Label htmlFor="cliente_id" className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-gray-500" />
          Cliente *
        </Label>
        <Select
          value={selectedClienteId}
          onValueChange={(v) => {
            setClienteSelecionado(v);
            setValue("cliente_id", v);
          }}
          disabled={submitting}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione o cliente" />
          </SelectTrigger>
          <SelectContent>
            {clientes.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.cliente_id && (
          <p className="text-sm text-red-600">{errors.cliente_id.message}</p>
        )}
      </div>

      {/* Descrição */}
      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição do dia (opcional)</Label>
        <Textarea
          id="descricao"
          placeholder="Descreva as atividades realizadas hoje..."
          className="min-h-[100px] resize-none"
          disabled={submitting}
          {...register("descricao")}
        />
      </div>

      {/* Captura de fotos */}
      <div className="space-y-2">
        <Label>Fotos</Label>
        <DiarioFotoCapture
          onFotosCapturadas={setFotos}
          fotosExistentes={fotos}
          disabled={submitting}
        />
      </div>

      {/* Progresso de upload */}
      {uploadProgress && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-800">
                Enviando fotos...
              </p>
              <div className="mt-1 w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${
                      (uploadProgress.current / uploadProgress.total) * 100
                    }%`,
                  }}
                />
              </div>
              <p className="text-xs text-blue-600 mt-1">
                {uploadProgress.current} de {uploadProgress.total}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Botões de ação */}
      <div className="flex gap-3 pt-4 border-t">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={submitting}
            className="flex-1"
          >
            Cancelar
          </Button>
        )}

        <Button
          type="submit"
          disabled={submitting || !selectedClienteId}
          className="flex-1 bg-[#F25C26] hover:bg-[#D94D1A]"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Salvar Registro
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

export default DiarioObraForm;
