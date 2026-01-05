// src/lib/orcamentoCalculo.ts
export function calcularOrcamento(itens: any[]) {
  const totalGeral = itens.reduce(
    (acc, i) => acc + Number(i.subtotal ?? 0),
    0
  );

  const margem = totalGeral * 0.15;
  const imposto = totalGeral * 0.07;

  return {
    totalGeral,
    margem,
    imposto,
    totalFinal: totalGeral + margem + imposto,
  };
}
