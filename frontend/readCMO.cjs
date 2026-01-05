const XLSX = require('xlsx');
const path = require('path');

try {
    const filePath = path.join('C:', 'Users', 'Atendimento', 'Documents', '1-SistemaWGEASY', 'CMO ELIANE.xlsx');
    console.log('📂 Lendo CMO ELIANE.xlsx:\n', filePath, '\n');

    const workbook = XLSX.readFile(filePath);

    console.log('📊 SHEETS DISPONÍVEIS:');
    workbook.SheetNames.forEach((name, index) => {
        console.log(`  ${index + 1}. ${name}`);
    });
    console.log('');

    // Ler todas as sheets
    workbook.SheetNames.forEach((sheetName, index) => {
        console.log(`${'='.repeat(80)}`);
        console.log(`📋 SHEET ${index + 1}: "${sheetName}"`);
        console.log(`${'='.repeat(80)}\n`);

        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '', raw: false });

        console.log(`Total de linhas: ${data.length}\n`);

        if (data.length > 0) {
            // Mostrar header
            console.log('HEADER (Linha 1):');
            const header = data[0];
            header.forEach((col, idx) => {
                if (col && col.toString().trim()) {
                    console.log(`  Coluna ${String.fromCharCode(65 + idx)} (${idx}): ${col}`);
                }
            });
            console.log('');

            // Mostrar primeiras 100 linhas com dados
            console.log('PREVIEW DOS DADOS:\n');
            const maxRows = Math.min(100, data.length);
            for (let i = 0; i < maxRows; i++) {
                const row = data[i];
                const cells = row.map((cell, idx) => {
                    const cellStr = cell.toString().trim();
                    return cellStr.length > 0 ? `[${String.fromCharCode(65 + idx)}]${cellStr}` : '';
                }).filter(cell => cell.length > 0);

                if (cells.length > 0) {
                    console.log(`Linha ${i + 1}:`, cells.join(' | '));
                }
            }

            if (data.length > 100) {
                console.log(`\n... (mais ${data.length - 100} linhas omitidas)`);
            }
        }

        console.log('\n');
    });

} catch (error) {
    console.error('❌ Erro:', error.message);
    if (error.code === 'ENOENT') {
        console.error('Arquivo não encontrado. Verifique o caminho e o nome do arquivo.');
    }
    process.exit(1);
}
