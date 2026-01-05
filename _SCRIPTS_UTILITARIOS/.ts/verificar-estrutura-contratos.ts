import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ahlqzzkxuutwoepirpzr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobHF6emt4dXV0d29lcGlycHpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NzEyNDMsImV4cCI6MjA3NjE0NzI0M30.gLz5lpB5YlQpTfxzJjmILZwGp_H_XsT81nM2vXDbs7Y'
)

async function verificarEstrutura() {
  console.log('=== ESTRUTURA DA TABELA CONTRATOS ===\n')

  // Tentar inserir um objeto vazio para ver quais colunas são necessárias
  const { data, error } = await supabase
    .from('contratos')
    .insert({})
    .select()

  console.log('Erro ao inserir vazio (mostra colunas obrigatórias):')
  console.log(error)

  // Tentar buscar um registro para ver as colunas
  const { data: sample, error: err2 } = await supabase
    .from('contratos')
    .select('*')
    .limit(1)

  console.log('\nColunas disponíveis:')
  if (sample && sample[0]) {
    console.log(Object.keys(sample[0]))
  } else {
    console.log('Tabela vazia, não foi possível determinar colunas pelo select')
  }
}

verificarEstrutura().catch(console.error)
