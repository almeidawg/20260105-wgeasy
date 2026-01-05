const XLSX = require('xlsx');
const path = require('path');

try {
    const filePath = path.join('C:', 'Users', 'Atendimento', 'Documents', '1-SistemaWGEASY', 'Pasta1.xlsx');
    console.log('📂 Lendo arquivo:', filePath, '\n');

    const workbook = XLSX.readFile(filePath);

    workbook.SheetNames.forEach((sheetName, index) => {
        console.log(`${'='.repeat(70)}`);
        console.log(`📋 SHEET ${index + 1}: "${sheetName}"`);
        console.log(`${'='.repeat(70)}\n`);

        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

        console.log(`Total de linhas: ${data.length}\n`);

        const maxRows = Math.min(150, data.length);
        for (let i = 0; i < maxRows; i++) {
            const row = data[i];
            const cells = row.map(cell => cell.toString().trim()).filter(cell => cell.length > 0);
            if (cells.length > 0) {
                console.log(`[${i + 1}]`, cells.join(' | '));
            }
        }

        if (data.length > 150) {
            console.log(`\n... (mais ${data.length - 150} linhas omitidas)`);
        }
    });

} catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
}
