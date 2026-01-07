// ============================================================
// COMPONENTE: PastasClienteDrive
// Sistema WG Easy - Grupo WG Almeida
// ============================================================
// Exibe as pastas do Google Drive do cliente na área do cliente
// Usa o drive_link cadastrado na tabela pessoas
// ============================================================

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  FolderOpen,
  ExternalLink,
  Loader2,
  FolderClosed,
  Image,
  FileText,
  Camera,
} from "lucide-react";

interface PastasClienteDriveProps {
  clienteId: string;
}

interface PastaInfo {
  nome: string;
  icone: React.ReactNode;
  descricao: string;
}

// Mapeamento de pastas conhecidas para ícones e descrições
const PASTAS_CONHECIDAS: Record<string, PastaInfo> = {
  "projeto": {
    nome: "Projeto Arquitetônico",
    icone: <FileText className="w-5 h-5" />,
    descricao: "Plantas, renders e documentos do projeto"
  },
  "fotos": {
    nome: "Fotos da Obra",
    icone: <Image className="w-5 h-5" />,
    descricao: "Registro fotográfico da obra"
  },
  "diário": {
    nome: "Diário de Obra",
    icone: <Camera className="w-5 h-5" />,
    descricao: "Fotos diárias do progresso"
  },
  "documentos": {
    nome: "Documentos",
    icone: <FileText className="w-5 h-5" />,
    descricao: "Contratos e documentação"
  }
};

function extrairDriveFolderId(driveLink: string): string | null {
  if (!driveLink) return null;

  // Se já é apenas o ID (sem URL)
  if (!driveLink.includes('/')) {
    return driveLink;
  }

  // Extrair ID do formato URL
  const regex = /folders\/([a-zA-Z0-9_-]+)/;
  const match = driveLink.match(regex);
  return match ? match[1] : null;
}

export default function PastasClienteDrive({ clienteId }: PastasClienteDriveProps) {
  const [driveLink, setDriveLink] = useState<string | null>(null);
  const [clienteNome, setClienteNome] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    carregarDriveLink();
  }, [clienteId]);

  async function carregarDriveLink() {
    if (!clienteId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("pessoas")
        .select("nome, drive_link")
        .eq("id", clienteId)
        .single();

      if (fetchError) {
        console.error("Erro ao buscar drive_link:", fetchError);
        setError("Não foi possível carregar informações do cliente");
        return;
      }

      setClienteNome(data?.nome || "");
      setDriveLink(data?.drive_link || null);
    } catch (err) {
      console.error("Erro:", err);
      setError("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Carregando pastas...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!driveLink) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <FolderClosed className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600">Pasta do Projeto</h3>
          <p className="text-sm text-gray-400 mt-2">
            As pastas do seu projeto serão disponibilizadas aqui
          </p>
        </CardContent>
      </Card>
    );
  }

  const folderId = extrairDriveFolderId(driveLink);
  const driveUrl = folderId
    ? `https://drive.google.com/drive/folders/${folderId}`
    : driveLink;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            <span>PASTA DO PROJETO</span>
          </div>
          <a
            href={driveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Abrir no Drive
          </a>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Card principal da pasta */}
          <a
            href={driveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <FolderOpen className="w-7 h-7 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">
                  {clienteNome || "Meu Projeto"}
                </h4>
                <p className="text-sm text-gray-500 mt-0.5">
                  Acesse todos os arquivos do seu projeto no Google Drive
                </p>
              </div>
              <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
          </a>

          {/* Dicas de navegação */}
          <div className="bg-gray-50 rounded-lg p-4 mt-4">
            <h5 className="text-sm font-medium text-gray-700 mb-3">
              Estrutura de Pastas
            </h5>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 text-gray-600">
                <FileText className="w-4 h-4 text-purple-500" />
                <span>Projeto Arquitetônico</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Camera className="w-4 h-4 text-orange-500" />
                <span>Diário de Obra</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Image className="w-4 h-4 text-green-500" />
                <span>Fotos do Imóvel</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <FileText className="w-4 h-4 text-blue-500" />
                <span>Documentos</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
