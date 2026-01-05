Este diretório (`wgeasy/backend`) contém o backend de testes do sistema WGEasy.

Orientações para o agente:

- Use TypeScript moderno (ES2020+) e mantenha os scripts de teste simples.
- É aceitável adicionar scripts utilitários de debug/teste, desde que:
  - sejam idempotentes (podem rodar mais de uma vez sem quebrar o banco), e
  - registrem claramente no console o que estão criando/alterando.
- Não altere o comportamento de produção do backend sem orientação explícita;
  scripts em `src/financeiro` e `src/contracts` podem ser usados como playgrounds
  isolados.
- Não modifique chaves ou URLs do Supabase neste diretório.

