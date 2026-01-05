// backend/src/index.ts

import { groupItemsByNucleo } from "./contracts/groupItemsByNucleo";
import { createContractsByNucleo } from "./contracts/createContractsByNucleo";
import { criarFinanceiroParaContratos } from "./financeiro/createFinanceiroFromContratos";

async function main() {
  // 1) Itens de teste (mock da proposta)
  const itens = [
    {
      id: "1",
      nome: "Alvenaria",
      quantidade: 10,
      preco_total: 1500,
      tipo: "mao_obra",
      nucleo_id: "engenharia",
    },
    {
      id: "2",
      nome: "Projeto Arquitetônico",
      quantidade: 1,
      preco_total: 8000,
      tipo: "servico",
      nucleo_id: "arquitetura",
    },
  ];

  // 2) Agrupar por núcleo
  const grupos = groupItemsByNucleo(itens);
  console.log("=== Grupos por núcleo ===");
  console.log(grupos);

  // 3) Gerar contratos por núcleo
  const contratosPorNucleo = await createContractsByNucleo({
    clienteId: "5f1b03a0-ccbe-43cc-b430-c2675fa0f733",
    itens,
    nucleosSelecionados: [...new Set(itens.map((i) => i.nucleo_id))],
  });

  console.log("\n=== Contratos gerados por núcleo ===");
  console.log(JSON.stringify(contratosPorNucleo, null, 2));

  // 4) Criar lançamentos financeiros
  console.log("\n=== Criando lançamentos financeiros ===");
  const financeiros = await criarFinanceiroParaContratos(
    contratosPorNucleo as any // tipos são compatíveis estruturalmente
  );
  console.log("✔ Financeiros criados:", financeiros);
}

main().catch((err) => {
  console.error("Erro geral no script:", err);
});
