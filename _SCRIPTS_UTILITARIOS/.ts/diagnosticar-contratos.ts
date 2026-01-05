import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ahlqzzkxuutwoepirpzr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobHF6emt4dXV0d29lcGlycHpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NzEyNDMsImV4cCI6MjA3NjE0NzI0M30.gLz5lpB5YlQpTfxzJjmILZwGp_H_XsT81nM2vXDbs7Y'
)

async function diagnosticar() {
  console.log('=== DIAGNÓSTICO: Erro Foreign Key Contratos ===\n')

  // 1. Verificar estrutura da tabela contratos
  console.log('1. Estrutura da tabela contratos:')
  const { data: estruturaContratos, error: err1 } = await supabase
    .from('contratos')
    .select('*')
    .limit(1)

  if (err1) console.log('Erro:', err1.message)
  else console.log('Colunas:', estruturaContratos ? Object.keys(estruturaContratos[0] || {}) : [])

  // 2. Verificar foreign keys da tabela contratos
  console.log('\n2. Foreign Keys da tabela contratos:')
  const { data: fks, error: err2 } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'contratos'
    `
  })

  if (err2) console.log('Erro:', err2)
  else console.log(JSON.stringify(fks, null, 2))

  // 3. Verificar se a tabela referenciada existe
  console.log('\n3. Verificando tabelas relacionadas:')
  const { data: clientes, error: err3 } = await supabase
    .from('clientes')
    .select('id')
    .limit(5)

  if (err3) console.log('Erro tabela clientes:', err3.message)
  else console.log('Clientes encontrados:', clientes?.length || 0)

  // 4. Verificar se existe a tabela pessoas (caso a FK esteja apontando errado)
  console.log('\n4. Verificando tabela pessoas:')
  const { data: pessoas, error: err4 } = await supabase
    .from('pessoas')
    .select('id, tipo')
    .eq('tipo', 'cliente')
    .limit(5)

  if (err4) console.log('Erro tabela pessoas:', err4.message)
  else console.log('Pessoas tipo cliente encontradas:', pessoas?.length || 0)

  // 5. Tentar criar um contrato de teste para ver o erro exato
  console.log('\n5. Tentando criar contrato de teste:')
  const { data: testePessoa } = await supabase
    .from('pessoas')
    .select('id')
    .eq('tipo', 'cliente')
    .limit(1)
    .single()

  if (testePessoa) {
    console.log('Usando pessoa ID:', testePessoa.id)
    const { data: novoContrato, error: errContrato } = await supabase
      .from('contratos')
      .insert({
        cliente_id: testePessoa.id,
        numero_contrato: 'TESTE-' + Date.now(),
        valor_total: 1000,
        status: 'ativo'
      })
      .select()

    if (errContrato) {
      console.log('❌ ERRO AO CRIAR CONTRATO:', errContrato.message)
      console.log('Detalhes:', errContrato)
    } else {
      console.log('✅ Contrato criado com sucesso!')
      // Deletar contrato de teste
      if (novoContrato && novoContrato[0]) {
        await supabase.from('contratos').delete().eq('id', novoContrato[0].id)
        console.log('Contrato de teste removido')
      }
    }
  }
}

diagnosticar().catch(console.error)
