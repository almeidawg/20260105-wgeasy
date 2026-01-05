import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ahlqzzkxuutwoepirpzr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobHF6emt4dXV0d29lcGlycHpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NzEyNDMsImV4cCI6MjA3NjE0NzI0M30.gLz5lpB5YlQpTfxzJjmILZwGp_H_XsT81nM2vXDbs7Y'
)

async function verificarClientes() {
  console.log('=== VERIFICANDO CLIENTES JÁ CADASTRADOS ===\n')

  // Buscar todos os clientes (pessoas tipo cliente)
  const { data: pessoas, error } = await supabase
    .from('pessoas')
    .select('id, nome, email, telefone, tipo, created_at')
    .eq('tipo', 'cliente')
    .order('nome')

  if (error) {
    console.error('Erro ao buscar pessoas:', error.message)
    return
  }

  const total = pessoas ? pessoas.length : 0
  console.log('Total de clientes cadastrados: ' + total + '\n')

  console.log('--- CLIENTES ENCONTRADOS ---')
  if (pessoas) {
    pessoas.forEach(p => {
      const email = p.email || 'sem email'
      const tel = p.telefone || 'sem tel'
      const data = p.created_at ? p.created_at.split('T')[0] : 'N/A'
      console.log('- ' + p.nome + ' | ' + email + ' | ' + tel + ' | Criado: ' + data)
    })
  }

  // Buscar contratos existentes
  console.log('\n--- CONTRATOS EXISTENTES ---')
  const { data: contratos, error: errContratos } = await supabase
    .from('contratos')
    .select('id, numero, cliente_id, valor_total, status, unidade_negocio, created_at')
    .order('created_at', { ascending: false })
    .limit(30)

  if (errContratos) {
    console.error('Erro ao buscar contratos:', errContratos.message)
  } else if (contratos) {
    console.log('Total contratos: ' + contratos.length)
    contratos.forEach(c => {
      const valor = c.valor_total ? c.valor_total.toLocaleString('pt-BR') : '0'
      console.log('- ' + c.numero + ' | R$ ' + valor + ' | ' + c.status + ' | ' + c.unidade_negocio)
    })
  }

  // Buscar oportunidades
  console.log('\n--- OPORTUNIDADES EXISTENTES ---')
  const { data: oportunidades, error: errOps } = await supabase
    .from('oportunidades')
    .select('id, titulo, cliente_id, valor_estimado, status, created_at')
    .order('created_at', { ascending: false })
    .limit(20)

  if (errOps) {
    console.error('Erro ao buscar oportunidades:', errOps.message)
  } else if (oportunidades) {
    console.log('Total oportunidades: ' + oportunidades.length)
    oportunidades.forEach(o => {
      const valor = o.valor_estimado ? o.valor_estimado.toLocaleString('pt-BR') : '0'
      console.log('- ' + o.titulo + ' | R$ ' + valor + ' | ' + o.status)
    })
  }
}

verificarClientes().catch(console.error)
