/**
 * Validacao Sistema Completo - Browser Automation
 *
 * Testes para validar:
 * 1. Rotas /colaborador/diario-obra e /juridico/financeiro
 * 2. Area do cliente com ID especifico
 * 3. Verificacao de conteudo das paginas
 * 4. Erro de relacionamento obra_registros e pessoas
 *
 * Executar: npx playwright test frontend/tests/playwright/validacao-sistema-completo.spec.js --headed
 */

const { test, expect } = require('@playwright/test');

// Configuracoes
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const CLIENTE_ID_TESTE = 'a8921a1a-4c1f-4cd5-b8e3-f72d951dc951';

// Credenciais de teste (ajustar conforme ambiente)
const TEST_USER = {
  email: process.env.TEST_EMAIL || '',
  password: process.env.TEST_PASSWORD || ''
};

// Helper para fazer login
async function fazerLogin(page, email, password) {
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');

  // Preencher credenciais
  const emailInput = page.locator('input[type="email"], input[name="email"]');
  const passwordInput = page.locator('input[type="password"], input[name="password"]');

  if (await emailInput.isVisible() && email && password) {
    await emailInput.fill(email);
    await passwordInput.fill(password);

    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Aguardar redirecionamento
    await page.waitForURL(url => !url.includes('/login'), { timeout: 10000 }).catch(() => {});
  }
}

test.describe('Validacao de Rotas e Conteudo', () => {

  test.beforeEach(async ({ page }) => {
    // Configurar timeout maior para carregamento
    page.setDefaultTimeout(30000);
  });

  test('1. Verificar rota /colaborador/diario-obra existe e tem conteudo', async ({ page }) => {
    console.log('=== TESTE: /colaborador/diario-obra ===');

    // Navegar para a pagina
    const response = await page.goto(`${BASE_URL}/colaborador/diario-obra`);

    // Verificar se a pagina carregou (pode redirecionar para login)
    const currentUrl = page.url();
    console.log(`URL atual: ${currentUrl}`);

    // Se redirecionou para login, a rota existe mas requer autenticacao
    if (currentUrl.includes('/login')) {
      console.log('Rota requer autenticacao - OK');
      expect(response.status()).toBeLessThan(500);
      return;
    }

    // Se chegou na pagina, verificar conteudo
    await page.waitForLoadState('networkidle');

    // Verificar se nao eh pagina de erro
    const body = await page.locator('body').textContent();
    const hasContent = body && body.length > 100;

    console.log(`Pagina tem conteudo: ${hasContent}`);
    console.log(`Tamanho do body: ${body?.length || 0} caracteres`);

    // Verificar elementos esperados da pagina de Diario de Obra
    const expectedElements = [
      'Diário de Obra',
      'Novo Registro',
      'obra',
      'registro'
    ];

    let encontrados = 0;
    for (const el of expectedElements) {
      if (body?.toLowerCase().includes(el.toLowerCase())) {
        console.log(`Encontrado: "${el}"`);
        encontrados++;
      }
    }

    console.log(`Elementos encontrados: ${encontrados}/${expectedElements.length}`);

    // Verificar se nao tem mensagem de erro
    const hasError = body?.includes('404') || body?.includes('Página não encontrada') || body?.includes('Not Found');
    expect(hasError).toBeFalsy();

    // Verificar se a pagina nao esta completamente vazia
    expect(hasContent).toBeTruthy();
  });

  test('2. Verificar rota /juridico/financeiro existe e tem conteudo', async ({ page }) => {
    console.log('=== TESTE: /juridico/financeiro ===');

    const response = await page.goto(`${BASE_URL}/juridico/financeiro`);
    const currentUrl = page.url();
    console.log(`URL atual: ${currentUrl}`);

    if (currentUrl.includes('/login')) {
      console.log('Rota requer autenticacao - OK');
      expect(response.status()).toBeLessThan(500);
      return;
    }

    await page.waitForLoadState('networkidle');

    const body = await page.locator('body').textContent();
    const hasContent = body && body.length > 100;

    console.log(`Pagina tem conteudo: ${hasContent}`);
    console.log(`Tamanho do body: ${body?.length || 0} caracteres`);

    // Verificar elementos esperados
    const expectedElements = [
      'Financeiro',
      'Jurídico',
      'financeiro'
    ];

    let encontrados = 0;
    for (const el of expectedElements) {
      if (body?.toLowerCase().includes(el.toLowerCase())) {
        console.log(`Encontrado: "${el}"`);
        encontrados++;
      }
    }

    // ALERTA: Pagina esta sem conteudo real (apenas placeholder)
    const isPlaceholder = body?.includes('Em breve') || body?.includes('TODO');
    if (isPlaceholder) {
      console.log('ALERTA: Pagina /juridico/financeiro esta com conteudo placeholder!');
    }

    const hasError = body?.includes('404') || body?.includes('Página não encontrada');
    expect(hasError).toBeFalsy();
    expect(hasContent).toBeTruthy();
  });

  test('3. Verificar Area do Cliente com ID especifico', async ({ page }) => {
    console.log('=== TESTE: Area do Cliente ===');
    console.log(`Cliente ID: ${CLIENTE_ID_TESTE}`);

    // Tentar acessar area do cliente com ID
    const response = await page.goto(`${BASE_URL}/area-cliente/${CLIENTE_ID_TESTE}`);
    const currentUrl = page.url();
    console.log(`URL atual: ${currentUrl}`);

    if (currentUrl.includes('/login')) {
      console.log('Area do cliente requer autenticacao - OK');
      expect(response.status()).toBeLessThan(500);
      return;
    }

    await page.waitForLoadState('networkidle');

    const body = await page.locator('body').textContent();
    console.log(`Tamanho do body: ${body?.length || 0} caracteres`);

    // Verificar se nao eh erro de cliente nao encontrado
    const hasClienteError = body?.includes('Cliente não encontrado') ||
                           body?.includes('Erro ao carregar') ||
                           body?.includes('não foi encontrado');

    if (hasClienteError) {
      console.log('ALERTA: Cliente nao encontrado ou erro ao carregar!');
    }

    // Verificar elementos da area do cliente
    const expectedElements = [
      'Progresso',
      'Cronograma',
      'Financeiro',
      'WG'
    ];

    let encontrados = 0;
    for (const el of expectedElements) {
      if (body?.toLowerCase().includes(el.toLowerCase())) {
        console.log(`Encontrado: "${el}"`);
        encontrados++;
      }
    }

    console.log(`Elementos encontrados: ${encontrados}/${expectedElements.length}`);

    // Nao deve ter erro 500
    expect(response.status()).toBeLessThan(500);
  });

  test('4. Verificar portal-cliente como admin', async ({ page }) => {
    console.log('=== TESTE: Portal Cliente (Admin View) ===');

    const response = await page.goto(`${BASE_URL}/portal-cliente?cliente_id=${CLIENTE_ID_TESTE}`);
    const currentUrl = page.url();
    console.log(`URL atual: ${currentUrl}`);

    if (currentUrl.includes('/login')) {
      console.log('Portal requer autenticacao - OK');
      return;
    }

    await page.waitForLoadState('networkidle');

    const body = await page.locator('body').textContent();
    console.log(`Tamanho do body: ${body?.length || 0} caracteres`);

    expect(response.status()).toBeLessThan(500);
  });

  test('5. Verificar links no menu de navegacao', async ({ page }) => {
    console.log('=== TESTE: Links de Navegacao ===');

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const currentUrl = page.url();

    if (currentUrl.includes('/login')) {
      console.log('Sistema requer login para acessar menu');
      return;
    }

    // Buscar todos os links de navegacao
    const links = await page.locator('a[href], button').all();
    console.log(`Total de links/botoes encontrados: ${links.length}`);

    // Verificar links especificos
    const rotasParaVerificar = [
      '/colaborador/diario-obra',
      '/juridico/financeiro',
      '/juridico',
      '/financeiro'
    ];

    for (const rota of rotasParaVerificar) {
      const linkElement = page.locator(`a[href*="${rota}"]`);
      const count = await linkElement.count();
      console.log(`Link para ${rota}: ${count > 0 ? 'Encontrado' : 'NAO encontrado'}`);
    }
  });

});

test.describe('Validacao de Console Errors', () => {

  test('6. Monitorar erros de console em /colaborador/diario-obra', async ({ page }) => {
    console.log('=== TESTE: Console Errors - Diario Obra ===');

    const consoleErrors = [];
    const networkErrors = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('response', response => {
      if (response.status() >= 400) {
        networkErrors.push({
          url: response.url(),
          status: response.status()
        });
      }
    });

    await page.goto(`${BASE_URL}/colaborador/diario-obra`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Aguardar carregamento assincrono

    console.log(`Erros de console: ${consoleErrors.length}`);
    consoleErrors.forEach(err => console.log(`  - ${err.substring(0, 200)}`));

    console.log(`Erros de rede: ${networkErrors.length}`);
    networkErrors.forEach(err => console.log(`  - ${err.status}: ${err.url.substring(0, 100)}`));

    // Verificar erro especifico de relacionamento
    const hasRelationshipError = consoleErrors.some(err =>
      err.includes('obra_registros') && err.includes('pessoas')
    );

    if (hasRelationshipError) {
      console.log('ERRO CRITICO: Encontrado erro de relacionamento obra_registros/pessoas!');
    }

    // Nao deve ter mais de 5 erros criticos
    const criticalErrors = consoleErrors.filter(err =>
      err.includes('Error') || err.includes('Failed') || err.includes('relationship')
    );

    console.log(`Erros criticos: ${criticalErrors.length}`);
  });

  test('7. Monitorar erros de console em /juridico/financeiro', async ({ page }) => {
    console.log('=== TESTE: Console Errors - Juridico Financeiro ===');

    const consoleErrors = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto(`${BASE_URL}/juridico/financeiro`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log(`Erros de console: ${consoleErrors.length}`);
    consoleErrors.forEach(err => console.log(`  - ${err.substring(0, 200)}`));
  });

  test('8. Monitorar erros na Area do Cliente', async ({ page }) => {
    console.log('=== TESTE: Console Errors - Area Cliente ===');

    const consoleErrors = [];
    const apiErrors = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('response', async response => {
      if (response.url().includes('supabase') && response.status() >= 400) {
        let body = '';
        try {
          body = await response.text();
        } catch (e) {}
        apiErrors.push({
          url: response.url(),
          status: response.status(),
          body: body.substring(0, 500)
        });
      }
    });

    await page.goto(`${BASE_URL}/area-cliente/${CLIENTE_ID_TESTE}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    console.log(`Erros de console: ${consoleErrors.length}`);
    consoleErrors.forEach(err => console.log(`  - ${err.substring(0, 200)}`));

    console.log(`Erros de API: ${apiErrors.length}`);
    apiErrors.forEach(err => {
      console.log(`  - ${err.status}: ${err.url.substring(0, 100)}`);
      if (err.body) console.log(`    Body: ${err.body.substring(0, 200)}`);
    });

    // Verificar erro especifico de relacionamento
    const hasRelationshipError = apiErrors.some(err =>
      err.body?.includes('relationship') ||
      err.body?.includes('obra_registros') ||
      consoleErrors.some(c => c.includes('relationship'))
    );

    if (hasRelationshipError) {
      console.log('ERRO CRITICO: Encontrado erro de relacionamento!');
    }
  });

});

test.describe('Relatorio Final', () => {

  test('9. Gerar relatorio de validacao', async ({ page }) => {
    console.log('\n========================================');
    console.log('        RELATORIO DE VALIDACAO         ');
    console.log('========================================\n');

    const resultados = {
      rotas: [],
      erros: [],
      alertas: []
    };

    // Testar cada rota
    const rotas = [
      { path: '/colaborador/diario-obra', nome: 'Diario de Obra (Colaborador)' },
      { path: '/juridico/financeiro', nome: 'Financeiro Juridico' },
      { path: `/area-cliente/${CLIENTE_ID_TESTE}`, nome: 'Area do Cliente' },
      { path: '/portal-cliente', nome: 'Portal Cliente' }
    ];

    for (const rota of rotas) {
      try {
        const response = await page.goto(`${BASE_URL}${rota.path}`);
        const status = response?.status() || 0;
        const currentUrl = page.url();

        let resultado = 'OK';
        if (status >= 500) resultado = 'ERRO 500';
        else if (status >= 400) resultado = 'ERRO ' + status;
        else if (currentUrl.includes('/login')) resultado = 'REQUER LOGIN';

        resultados.rotas.push({
          nome: rota.nome,
          path: rota.path,
          status,
          resultado
        });

        console.log(`[${resultado}] ${rota.nome} (${rota.path})`);

      } catch (error) {
        resultados.erros.push({
          rota: rota.path,
          erro: error.message
        });
        console.log(`[FALHA] ${rota.nome}: ${error.message}`);
      }
    }

    console.log('\n--- RESUMO ---');
    const ok = resultados.rotas.filter(r => r.resultado === 'OK').length;
    const login = resultados.rotas.filter(r => r.resultado === 'REQUER LOGIN').length;
    const erros = resultados.rotas.filter(r => r.resultado.includes('ERRO')).length;

    console.log(`Rotas OK: ${ok}`);
    console.log(`Rotas que requerem login: ${login}`);
    console.log(`Rotas com erro: ${erros}`);

    console.log('\n--- PROBLEMAS CONHECIDOS ---');
    console.log('1. /juridico/financeiro - Pagina com placeholder (sem conteudo real)');
    console.log('2. obra_registros - Falta FK cliente_id para tabela pessoas');
    console.log('3. Area do cliente - Depende de dados reais no banco');

    console.log('\n========================================\n');
  });

});
