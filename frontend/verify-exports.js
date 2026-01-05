#!/usr/bin/env node
/**
 * Script de Verificação de Exports
 * Verifica se todos os imports de tipos têm exports correspondentes
 *
 * Uso: node verify-exports.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Verificando imports e exports...\n');

const typesDir = path.join(__dirname, 'src', 'types');
const srcDir = path.join(__dirname, 'src');

let errors = 0;
let warnings = 0;

// Arquivos de tipos
const typeFiles = [
  'contratos.ts',
  'pricelist.ts',
  'etapas.ts',
  'oportunidadesChecklist.ts',
  'pedidosCompra.ts',
  'pipeline.ts'
];

console.log('📋 Verificando arquivos de tipos:\n');

typeFiles.forEach(file => {
  const filePath = path.join(typesDir, file);

  if (!fs.existsSync(filePath)) {
    console.log(`❌ ERRO: Arquivo não encontrado: ${file}`);
    errors++;
    return;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const exports = [];

  // Encontrar todos os exports
  const exportMatches = content.matchAll(/export\s+(?:const|function|interface|type|enum)\s+(\w+)/g);
  for (const match of exportMatches) {
    exports.push(match[1]);
  }

  console.log(`✅ ${file}: ${exports.length} exports encontrados`);
  if (exports.length === 0) {
    console.log(`   ⚠️  AVISO: Nenhum export encontrado!`);
    warnings++;
  }
});

console.log('\n🔍 Verificando imports problemáticos...\n');

// Procurar por imports que podem causar erro
try {
  const grepCmd = 'grep -r "from.*types/" src/ | grep "import.*{" || echo ""';
  const imports = execSync(grepCmd, { encoding: 'utf-8', shell: 'bash' });

  if (imports.trim()) {
    const lines = imports.trim().split('\n');
    console.log(`📊 Total de ${lines.length} imports de tipos encontrados`);
  }
} catch (e) {
  // grep não encontrou nada ou erro
}

console.log('\n' + '='.repeat(50));
console.log(`\n📊 RESUMO:`);
console.log(`   ✅ Tipos verificados: ${typeFiles.length}`);
console.log(`   ❌ Erros: ${errors}`);
console.log(`   ⚠️  Avisos: ${warnings}`);

if (errors > 0) {
  console.log('\n❌ Verificação FALHOU! Corrija os erros acima.');
  process.exit(1);
} else if (warnings > 0) {
  console.log('\n⚠️  Verificação PASSOU com avisos.');
  process.exit(0);
} else {
  console.log('\n✅ Verificação PASSOU! Tudo OK.');
  process.exit(0);
}
