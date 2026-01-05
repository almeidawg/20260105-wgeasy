import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

/**
 * Página de Nova Solicitação de Pagamento do Colaborador
 */
export default function NovaSolicitacaoPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Nova Solicitação de Pagamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-gray-500 mb-6">
            Preencha os dados para solicitar um pagamento.
          </div>
          {/* TODO: Adicionar formulário de solicitação */}
          <Button variant="outline" onClick={() => navigate(-1)}>
            Voltar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
