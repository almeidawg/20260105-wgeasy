/**
 * TESTE FINANCEIRO (CommonJS) - usa SUPABASE_SERVICE_ROLE ou ANON do .env
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Defina VITE_SUPABASE_URL e a chave (anon ou service) no .env');
  process.exit(1);
}

console.log('➡️ Supabase URL:', supabaseUrl);
console.log('➡️ Chave usada:', supabaseKey === process.env.SUPABASE_SERVICE_ROLE ? 'service' : 'anon');

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  // 1) Cliente fictício
  const { data: cliente, error: cliErr } = await supabase
    .from('pessoas')
    .upsert(
      {
        cpf: '99999999999',
        nome: 'Cliente Teste Financeiro',
        email: 'financeiro+teste@wgeasy.com',
        telefone: '11999990000',
        tipo: 'CLIENTE',
        estado_civil: 'Solteiro(a)',
      },
      { onConflict: 'cpf' }
    )
    .select()
    .single();
  if (cliErr) throw cliErr;

  // 2) Contrato fictício
    const { data: contrato, error: ctrErr } = await supabase
      .from('contratos')
      .insert({
        numero: 'AUTO-FIN-001',
        titulo: 'Contrato Fictício Financeiro',
        cliente_id: cliente.id,
        unidade_negocio: 'engenharia',
        nucleo: 'engenharia',
        status: 'ativo',
        valor_total: 10000,
        data_inicio: new Date().toISOString().split('T')[0],
      })
    .select()
    .single();
  if (ctrErr) throw ctrErr;

  // 3) Lançamentos
  const hoje = new Date().toISOString().split('T')[0];
  const lancamentos = [
    {
      contrato_id: contrato.id,
        pessoa_id: cliente.id,
        tipo: 'entrada',
        descricao: 'Entrada contrato AUTO-FIN-001',
        valor_total: 6000,
        status: 'pago',
        unidade_negocio: 'engenharia',
        nucleo: 'engenharia',
        data_competencia: hoje,
      },
      {
        contrato_id: contrato.id,
        pessoa_id: cliente.id,
        tipo: 'saida',
        descricao: 'Compra materiais AUTO-FIN-001',
        valor_total: 2000,
        status: 'pago',
        unidade_negocio: 'engenharia',
        nucleo: 'engenharia',
        data_competencia: hoje,
      },
    ];

  const { error: lancErr } = await supabase.from('financeiro_lancamentos').insert(lancamentos);
  if (lancErr) throw lancErr;

  console.log('✅ Dados de teste inseridos:');
  console.log('   Cliente:', cliente.id);
  console.log('   Contrato:', contrato.id);
  console.log('   Lançamentos: entrada 6000, saída 2000');
}

main()
  .then(() => console.log('🎯 Teste financeiro concluído.'))
  .catch((err) => {
    console.error('❌ Erro no teste financeiro:', err);
    try {
      console.error('Detalhe:', JSON.stringify(err, null, 2));
    } catch {}
  });
