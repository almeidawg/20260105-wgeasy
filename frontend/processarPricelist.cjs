const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

try {
    const filePath = path.join('C:', 'Users', 'Atendimento', 'Documents', '1-SistemaWGEASY', '20250709 - Pricelist - FINAL_2025_Google.xlsx');
    console.log('📂 Processando Pricelist Real...\n');

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '', raw: false });

    console.log(`✅ Total de linhas: ${data.length}\n`);

    // Mapa para contar itens por categoria
    const categoryCounts = {};
    const items = [];

    // Processar dados (pular linha 1 = header, linha 2 = vazia)
    for (let i = 2; i < data.length; i++) {
        const row = data[i];

        // Colunas do Excel
        const categoria = row[1]?.toString().trim() || '';
        const itemDescritivo = row[2]?.toString().trim() || '';
        const medida = row[3]?.toString().trim() || '';
        const valorCompraStr = row[4]?.toString().trim() || '';
        const valorVendaStr = row[10]?.toString().trim() || ''; // Coluna K = index 10

        // Pular linhas vazias
        if (!categoria || !itemDescritivo) continue;

        // Extrair valores numéricos (remover "R$", espaços, e converter)
        const valorCompra = parseFloat(valorCompraStr.replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
        const valorVenda = parseFloat(valorVendaStr.replace(/[R$\s.]/g, '').replace(',', '.')) || 0;

        // Gerar código automático: 3 primeiras letras da categoria + número sequencial
        const prefixo = categoria.substring(0, 3).toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        if (!categoryCounts[prefixo]) {
            categoryCounts[prefixo] = 0;
        }
        categoryCounts[prefixo]++;

        const codigo = `${prefixo}-${String(categoryCounts[prefixo]).padStart(3, '0')}`;

        // Mapear unidade de medida
        const unidadeMap = {
            'm²': 'm2',
            'ml': 'ml',
            'unid': 'un',
            'hora': 'hora',
            'diaria': 'diaria',
            'diária': 'diaria',
            'empreita': 'empreita',
            'kg': 'un',
            'saco': 'un',
            'lata': 'un',
            'galão': 'un',
            'rolo': 'un',
            'peça': 'un',
            'caixa': 'un',
            'barra': 'un',
            'metro': 'ml'
        };

        const unidade = unidadeMap[medida.toLowerCase()] || 'un';

        // Determinar tipo: se tem "hora", "diaria", "empreita" na medida ou no nome, é mão de obra
        const ehMaoDeObra =
            unidade === 'hora' ||
            unidade === 'diaria' ||
            unidade === 'empreita' ||
            itemDescritivo.toLowerCase().includes('serviço') ||
            itemDescritivo.toLowerCase().includes('instalação') ||
            itemDescritivo.toLowerCase().includes('montagem') ||
            categoria.toLowerCase().includes('serviço') ||
            categoria.toLowerCase().includes('mão de obra') ||
            categoria.toLowerCase().includes('staff');

        const tipo = ehMaoDeObra ? 'mao_obra' : 'material';

        items.push({
            codigo,
            nome: itemDescritivo,
            categoria,
            tipo,
            unidade,
            preco_custo: valorCompra,
            preco: valorVenda,
            margem_percentual: valorCompra > 0 ? ((valorVenda - valorCompra) / valorCompra * 100).toFixed(2) : 0
        });
    }

    console.log(`\n📊 ESTATÍSTICAS:`);
    console.log(`   Total de itens processados: ${items.length}`);
    console.log(`   Categorias encontradas: ${Object.keys(categoryCounts).length}\n`);

    console.log(`📋 CATEGORIAS E QUANTIDADES:`);
    Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])
        .forEach(([prefix, count]) => {
            const categoria = items.find(item => item.codigo.startsWith(prefix))?.categoria || prefix;
            console.log(`   ${prefix} (${categoria}): ${count} itens`);
        });

    // Gerar SQL
    let sql = `-- =====================================================
-- 🎯 IMPORTAÇÃO PRICELIST REAL COMPLETO
-- =====================================================
-- Total: ${items.length} itens
-- Categorias: ${Object.keys(categoryCounts).length}
-- Gerado automaticamente em: ${new Date().toLocaleString('pt-BR')}
-- =====================================================

-- 1️⃣ Adicionar constraint UNIQUE se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'pricelist_itens_codigo_key'
    ) THEN
        ALTER TABLE pricelist_itens ADD CONSTRAINT pricelist_itens_codigo_key UNIQUE (codigo);
        RAISE NOTICE '✅ Constraint UNIQUE adicionada na coluna codigo';
    ELSE
        RAISE NOTICE '✅ Constraint UNIQUE já existe';
    END IF;
END $$;

-- 2️⃣ Inserir todas as categorias únicas
`;

    // Gerar INSERT para categorias
    const categoriasUnicas = [...new Set(items.map(item => item.categoria))];
    sql += `INSERT INTO pricelist_categorias (nome, descricao, cor, icone, ativo) VALUES\n`;

    categoriasUnicas.forEach((cat, idx) => {
        const prefixo = cat.substring(0, 3).toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const cor = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
        const descricao = `Categoria: ${cat}`;

        sql += `('${cat.replace(/'/g, "''")}', '${descricao}', '${cor}', '📦', true)`;
        sql += idx < categoriasUnicas.length - 1 ? ',\n' : '\n';
    });

    sql += `ON CONFLICT (nome) DO NOTHING;\n\n`;

    // Gerar INSERT para itens em lotes de 50
    sql += `-- 3️⃣ Inserir todos os ${items.length} itens do Pricelist\n`;

    const BATCH_SIZE = 50;
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
        const batch = items.slice(i, i + BATCH_SIZE);
        const batchNum = Math.floor(i / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(items.length / BATCH_SIZE);

        sql += `\n-- Lote ${batchNum}/${totalBatches} (itens ${i + 1}-${Math.min(i + BATCH_SIZE, items.length)})\n`;
        sql += `INSERT INTO pricelist_itens (codigo, nome, categoria, tipo, unidade, preco_custo, preco, margem_percentual, ativo) VALUES\n`;

        batch.forEach((item, idx) => {
            const nome = item.nome.replace(/'/g, "''").substring(0, 200);
            const categoria = item.categoria.replace(/'/g, "''");

            sql += `('${item.codigo}', '${nome}', '${categoria}', '${item.tipo}', '${item.unidade}', ${item.preco_custo}, ${item.preco}, ${item.margem_percentual}, true)`;
            sql += idx < batch.length - 1 ? ',\n' : '\n';
        });

        sql += `ON CONFLICT (codigo) DO NOTHING;\n`;
    }

    // Adicionar estatísticas finais
    sql += `\n-- =====================================================
-- 📊 VERIFICAÇÃO FINAL
-- =====================================================

DO $$
DECLARE
    total_categorias INTEGER;
    total_itens INTEGER;
    total_mao_obra INTEGER;
    total_materiais INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_categorias FROM pricelist_categorias WHERE ativo = true;
    SELECT COUNT(*) INTO total_itens FROM pricelist_itens WHERE ativo = true;
    SELECT COUNT(*) INTO total_mao_obra FROM pricelist_itens WHERE tipo = 'mao_obra' AND ativo = true;
    SELECT COUNT(*) INTO total_materiais FROM pricelist_itens WHERE tipo = 'material' AND ativo = true;

    RAISE NOTICE '';
    RAISE NOTICE '✅ =====================================================';
    RAISE NOTICE '✅ IMPORTAÇÃO CONCLUÍDA COM SUCESSO!';
    RAISE NOTICE '✅ =====================================================';
    RAISE NOTICE '';
    RAISE NOTICE '📊 ESTATÍSTICAS:';
    RAISE NOTICE '   • Categorias: %', total_categorias;
    RAISE NOTICE '   • Total de Itens: %', total_itens;
    RAISE NOTICE '   • Mão de Obra: %', total_mao_obra;
    RAISE NOTICE '   • Materiais: %', total_materiais;
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Próximos passos:';
    RAISE NOTICE '   1. Acesse /pricelist para ver todos os itens';
    RAISE NOTICE '   2. Acesse /propostas/nova para criar propostas';
    RAISE NOTICE '   3. Sistema pronto para integração com Financeiro!';
    RAISE NOTICE '';
END $$;
`;

    // Salvar SQL
    const sqlPath = path.join('c:', 'Users', 'Atendimento', 'Documents', '1-SistemaWGEASY', 'wgeasy', 'frontend', 'database', 'IMPORTAR_PRICELIST_REAL_COMPLETO.sql');
    fs.writeFileSync(sqlPath, sql, 'utf8');

    console.log(`\n✅ SQL gerado com sucesso!`);
    console.log(`📁 Arquivo: ${sqlPath}`);
    console.log(`📏 Tamanho: ${(sql.length / 1024).toFixed(2)} KB\n`);

    // Gerar JSON para análise
    const jsonPath = path.join('c:', 'Users', 'Atendimento', 'Documents', '1-SistemaWGEASY', 'wgeasy', 'frontend', 'pricelist_processado.json');
    fs.writeFileSync(jsonPath, JSON.stringify({
        items,
        categoryCounts,
        stats: {
            total: items.length,
            categorias: Object.keys(categoryCounts).length,
            mao_obra: items.filter(i => i.tipo === 'mao_obra').length,
            materiais: items.filter(i => i.tipo === 'material').length
        }
    }, null, 2), 'utf8');

    console.log(`✅ JSON gerado para análise!`);
    console.log(`📁 Arquivo: ${jsonPath}\n`);

    // Mostrar exemplos
    console.log(`\n📋 EXEMPLOS DE CÓDIGOS GERADOS:\n`);
    const exemplos = items.slice(0, 15);
    exemplos.forEach(item => {
        console.log(`   ${item.codigo} | ${item.categoria.padEnd(25)} | ${item.nome.substring(0, 50)}`);
    });

    if (items.length > 15) {
        console.log(`   ... (mais ${items.length - 15} itens)`);
    }

} catch (error) {
    console.error('❌ Erro:', error.message);
    console.error(error.stack);
    process.exit(1);
}
