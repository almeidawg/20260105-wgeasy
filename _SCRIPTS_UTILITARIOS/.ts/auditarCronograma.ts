/**
 * ================================================================
 * AUTOMATED CRONOGRAMA AUDIT
 * ================================================================
 * Purpose: Run a quick verification that recent contracts emit
 * projects and cronograma etapas that match the contract items in
 * Supabase, similarly to how the financeiro workflow works.
 *
 * Usage:
 *   npx tsx auditarCronograma.ts
 * ================================================================
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ahlqzzkxuutwoepirpzr.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobHF6emt4dXV0d29lcGlycHpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NzEyNDMsImV4cCI6MjA3NjE0NzI0M30.gLz5lpB5YlQpTfxzJjmILZwGp_H_XsT81nM2vXDbs7Y';

const supabase = createClient(supabaseUrl, supabaseKey);

type Status = 'OK' | 'WARN' | 'ERROR';

interface AuditoriaResultado {
  secao: string;
  status: Status;
  mensagem: string;
  detalhes?: any;
}

const resultados: AuditoriaResultado[] = [];

function registrar(secao: string, status: Status, mensagem: string, detalhes?: any) {
  const prefix = status === 'OK' ? '✅' : status === 'WARN' ? '⚠️' : '❌';
  console.log(`${prefix} [${secao}] ${mensagem}`);
  if (detalhes) {
    console.log('   Details:', typeof detalhes === 'string' ? detalhes : JSON.stringify(detalhes, null, 2));
  }
  resultados.push({ secao, status, mensagem, detalhes });
}

const legacyTables = ['projects', 'project_tasks'];

async function checkLegacyTables() {
  console.log('\n-- Checking legacy cronograma tables');
  for (const table of legacyTables) {
    try {
      const { error } = await supabase.from(table).select('id').limit(1);
      if (error) {
        if (error.code?.startsWith('PGRST117') || error.code?.startsWith('PGRST116')) {
          registrar('Legacy', 'OK', `Table ${table} no longer exists (expected).`);
        } else {
          registrar('Legacy', 'WARN', `Error querying ${table}.`, {
            table,
            code: error.code,
            message: error.message,
          });
        }
      } else {
        registrar('Legacy', 'WARN', `Table ${table} still exists. Consider dropping it if not used anymore.`);
      }
    } catch (error) {
      registrar('Legacy', 'WARN', `Unexpected error checking ${table}.`, error);
    }
  }
}

async function fetchRecentContracts() {
  const { data, error } = await supabase
    .from('contratos')
    .select('id, numero, status, unidade_negocio, cliente_id, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    registrar('Contracts', 'ERROR', 'Unable to load recent contracts', error);
    return [];
  }

  if (!data || data.length === 0) {
    registrar('Contracts', 'WARN', 'No recent contracts found for auditing');
    return [];
  }

  registrar('Contracts', 'OK', `Loaded ${data.length} recent contracts for cronograma checks`);
  return data;
}

function normalize(text?: string) {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function stageMatchesItem(stage: any, item: any) {
  const candidates = [
    stage.nome,
    stage.name,
    stage.titulo,
    stage.descricao,
    stage.description,
    stage.summary,
    stage.text,
  ]
    .filter(Boolean)
    .map((value) => normalize(value));

  const itemText = normalize(item.descricao);
  if (!itemText || candidates.length === 0) {
    return false;
  }

  return candidates.some((candidate) => candidate.includes(itemText) || itemText.includes(candidate));
}

async function auditContract(contract: any) {
  registrar('Cronograma', 'OK', `Starting audit for contract ${contract.numero} (${contract.unidade_negocio})`);

  const { data: projects, error: projectError } = await supabase
    .from('projetos')
    .select('id, nome, status, data_inicio, etapas:cronograma_etapas(*)')
    .eq('contrato_id', contract.id);

  if (projectError) {
    registrar('Cronograma', 'ERROR', `Error loading project for ${contract.numero}`, projectError);
    return;
  }

  if (!projects || projects.length === 0) {
    registrar('Cronograma', 'ERROR', `No project found for contract ${contract.numero}`);
    return;
  }

  if (projects.length > 1) {
    registrar('Cronograma', 'WARN', `Multiple projects found for ${contract.numero}`, {
      count: projects.length,
    });
  }

  const project = projects[0];
  const stages = project.etapas || [];

  const { data: items, error: itemsError } = await supabase
    .from('contratos_itens')
    .select('id, descricao, nucleo, valor_total, ordem')
    .eq('contrato_id', contract.id)
    .order('ordem', { ascending: true });

  if (itemsError) {
    registrar('Cronograma', 'ERROR', `Unable to load contract items for ${contract.numero}`, itemsError);
    return;
  }

  const itemCount = items?.length ?? 0;
  const stageCount = stages.length;

  if (itemCount === 0) {
    registrar('Cronograma', 'WARN', `Contract ${contract.numero} has no configured items.`);
  }

  if (stageCount === 0 && itemCount > 0) {
    registrar(
      'Cronograma',
      'ERROR',
      `Contract ${contract.numero} has ${itemCount} items but 0 cronograma stages`,
      { projectId: project.id }
    );
    return;
  }

  const unmatchedItems =
    items
      ?.filter((item) => !stages.some((stage) => stageMatchesItem(stage, item)))
      .map((item) => ({ id: item.id, descricao: item.descricao, nucleo: item.nucleo })) ?? [];

  const matched = itemCount === 0 ? 0 : itemCount - unmatchedItems.length;
  const ratio = itemCount === 0 ? 1 : matched / itemCount;

  if (stageCount < itemCount) {
    registrar(
      'Cronograma',
      'WARN',
      `Contract ${contract.numero} created ${stageCount} stages for ${itemCount} items (ratio ${(ratio * 100).toFixed(1)}%).`,
      { projectId: project.id, situation: 'fewer stages' }
    );
  } else if (stageCount > itemCount) {
    registrar(
      'Cronograma',
      'WARN',
      `Contract ${contract.numero} created ${stageCount} stages which is more than ${itemCount} items.`,
      { projectId: project.id, situation: 'extra stages' }
    );
  }

  if (unmatchedItems.length > 0) {
    registrar(
      'Cronograma',
      'WARN',
      `Could not relate ${unmatchedItems.length} contract items to cronograma stages.`,
      {
        projectId: project.id,
        projectName: project.nome,
        items: unmatchedItems,
      }
    );
  } else if (itemCount > 0) {
    registrar(
      'Cronograma',
      'OK',
      `All ${itemCount} items from contract ${contract.numero} already appear in project ${project.nome}.`
    );
  }
}

function printSummary() {
  console.log('\n=== Cronograma Audit Summary ===');
  const errors = resultados.filter((entry) => entry.status === 'ERROR');
  const warns = resultados.filter((entry) => entry.status === 'WARN');
  const oks = resultados.filter((entry) => entry.status === 'OK');

  console.log(`✅ OK entries: ${oks.length}`);
  console.log(`⚠️ WARN entries: ${warns.length}`);
  console.log(`❌ ERROR entries: ${errors.length}`);

  if (errors.length > 0) {
    console.log('\nErrors detected:');
    errors.forEach((entry) => console.log(` - [${entry.secao}] ${entry.mensagem}`));
  }

  if (warns.length > 0) {
    console.log('\nWarnings emitted:');
    warns.forEach((entry) => console.log(` - [${entry.secao}] ${entry.mensagem}`));
  }
}

async function main() {
  console.log('Starting automated Cronograma audit...');
  await checkLegacyTables();
  const contracts = await fetchRecentContracts();
  for (const contract of contracts) {
    await auditContract(contract);
  }
  printSummary();
  const hasErrors = resultados.some((entry) => entry.status === 'ERROR');
  if (hasErrors) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error while auditing Cronograma:', error);
  process.exit(1);
});
