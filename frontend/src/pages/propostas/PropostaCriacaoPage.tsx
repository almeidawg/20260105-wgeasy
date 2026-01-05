// ============================================================
// PÁGINA: Criação de Proposta (com FormWizard)
// Sistema WG Easy - Grupo WG Almeida
// ============================================================

import { useNavigate } from "react-router-dom";
import { FormWizard, type WizardStep } from "@/components/FormWizard";

const STEPS: WizardStep[] = [
  {
    id: "cliente",
    title: "Dados do Cliente",
    description: "Informações básicas do cliente",
    fields: [
      {
        name: "cliente_nome",
        label: "Nome do Cliente",
        type: "text",
        required: true,
      },
      {
        name: "cliente_email",
        label: "Email",
        type: "email",
        required: true,
      },
      {
        name: "cliente_telefone",
        label: "Telefone",
        type: "text",
        required: false,
      },
    ],
  },
  {
    id: "proposta",
    title: "Informações Proposta",
    description: "Dados da proposta comercial",
    fields: [
      {
        name: "titulo",
        label: "Título da Proposta",
        type: "text",
        required: true,
      },
      {
        name: "nucleus",
        label: "Núcleo",
        type: "select",
        required: true,
        options: [
          { label: "Arquitetura", value: "arquitetura" },
          { label: "Engenharia", value: "engenharia" },
          { label: "Marcenaria", value: "marcenaria" },
        ],
      },
    ],
  },
  {
    id: "valores",
    title: "Valores",
    description: "Valores e condições de pagamento",
    fields: [
      {
        name: "valor_total",
        label: "Valor Total (R$)",
        type: "number",
        required: true,
      },
      {
        name: "condicoes_pagamento",
        label: "Condições de Pagamento",
        type: "select",
        required: true,
        options: [
          { label: "À Vista", value: "a_vista" },
          { label: "30 dias", value: "30_dias" },
          { label: "60 dias", value: "60_dias" },
          { label: "Parcelado", value: "parcelado" },
        ],
      },
    ],
  },
  {
    id: "revisao",
    title: "Revisão",
    description: "Confirme as informações",
    fields: [
      {
        name: "confirmar",
        label: "Confirmo que as informações estão corretas",
        type: "checkbox",
        required: true,
      },
    ],
  },
];

export default function PropostaCriacaoPage() {
  const navigate = useNavigate();

  async function handleSubmit(data: any) {
    try {
      // Aqui iria a lógica de salvar a proposta
      console.log("Proposta criada:", data);
      alert("Proposta criada com sucesso!");
      navigate("/propostas");
    } catch (error) {
      console.error("Erro ao criar proposta:", error);
      alert("Erro ao criar proposta");
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2E2E2E] mb-2">
            Criar Proposta
          </h1>
          <p className="text-[#4C4C4C]">
            Preencha os dados para gerar uma nova proposta comercial
          </p>
        </div>

        {/* FormWizard Component */}
        <FormWizard steps={STEPS} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
