// ============================================================
// AUDITORIA COMPLETA DO SISTEMA WG EASY
// Script para validar backend, frontend e integrações
// ============================================================

const https = require('https');
const http = require('http');

// Configurações
const CONFIG = {
  BACKEND_URL: 'https://20260105-wgeasy-production.up.railway.app',
  FRONTEND_URL: 'https://easy.wgalmeida.com.br',
  INTERNAL_API_KEY: 'b1623116c0841fdb892a34245252397d2113c4eb873d02c679c5399117e9cf32',
  SUPABASE_URL: 'https://ahlqzzkxuutwoepirpzr.supabase.co',
};

// Cores para console
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(message, type = 'info') {
  const timestamp = new Date().toISOString().substring(11, 19);
  const colors = {
    info: COLORS.cyan,
    success: COLORS.green,
    error: COLORS.red,
    warn: COLORS.yellow,
    header: COLORS.bold + COLORS.blue,
  };
  console.log(`${colors[type]}[${timestamp}] ${message}${COLORS.reset}`);
}

function header(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'header');
  console.log('='.repeat(60));
}

// Função para fazer requisições HTTP
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;

    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-key': CONFIG.INTERNAL_API_KEY,
        ...options.headers,
      },
      timeout: 30000,
    };

    const req = protocol.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json, headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

// Resultados da auditoria
const auditResults = {
  backend: [],
  frontend: [],
  integrations: [],
  security: [],
  mobile: [],
  notifications: [],
  calendar: [],
  drive: [],
  keep: [],
};

// ============================================================
// TESTES DO BACKEND
// ============================================================

async function testBackendHealth() {
  header('1. TESTE DE SAÚDE DO BACKEND');

  try {
    const result = await makeRequest(`${CONFIG.BACKEND_URL}/health`);
    if (result.status === 200 && result.data.status === 'ok') {
      log('✓ Backend está online e saudável', 'success');
      auditResults.backend.push({ test: 'Health Check', status: 'PASS' });
    } else {
      log(`✗ Backend respondeu com status ${result.status}`, 'error');
      auditResults.backend.push({ test: 'Health Check', status: 'FAIL', error: result.data });
    }
  } catch (error) {
    log(`✗ Falha ao conectar com backend: ${error.message}`, 'error');
    auditResults.backend.push({ test: 'Health Check', status: 'FAIL', error: error.message });
  }
}

async function testCalendarAPI() {
  header('2. TESTE DO GOOGLE CALENDAR API');

  // Teste de status
  try {
    const statusResult = await makeRequest(`${CONFIG.BACKEND_URL}/api/calendar/status`);
    log(`Status do Calendar: ${JSON.stringify(statusResult.data)}`, 'info');

    if (statusResult.data.configured) {
      log('✓ Calendar Service Account configurada', 'success');
      auditResults.calendar.push({ test: 'SA Config', status: 'PASS' });
    } else {
      log('✗ Calendar Service Account NÃO configurada', 'error');
      auditResults.calendar.push({ test: 'SA Config', status: 'FAIL', error: statusResult.data.message });
    }
  } catch (error) {
    log(`✗ Erro ao verificar status do Calendar: ${error.message}`, 'error');
    auditResults.calendar.push({ test: 'SA Config', status: 'FAIL', error: error.message });
  }

  // Teste de listagem de eventos
  try {
    const now = new Date();
    const timeMin = now.toISOString();
    const timeMax = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const eventsResult = await makeRequest(
      `${CONFIG.BACKEND_URL}/api/calendar/sa/events?timeMin=${timeMin}&timeMax=${timeMax}&maxResults=10`
    );

    if (eventsResult.status === 200) {
      log(`✓ Calendar listou ${eventsResult.data.count || 0} eventos`, 'success');
      auditResults.calendar.push({ test: 'List Events', status: 'PASS' });
    } else {
      log(`✗ Erro ao listar eventos: ${JSON.stringify(eventsResult.data)}`, 'error');
      auditResults.calendar.push({
        test: 'List Events',
        status: 'FAIL',
        error: eventsResult.data.message || eventsResult.data.error,
        solution: 'Configure Domain-wide Delegation no Google Workspace Admin Console'
      });
    }
  } catch (error) {
    log(`✗ Falha na requisição de eventos: ${error.message}`, 'error');
    auditResults.calendar.push({ test: 'List Events', status: 'FAIL', error: error.message });
  }
}

async function testDriveAPI() {
  header('3. TESTE DO GOOGLE DRIVE API');

  // Teste de listagem de arquivos na pasta raiz
  const ROOT_FOLDER_ID = '1b5QDQ6Hine8PyD5W3FjGmfXz6IVS_Z-4';

  try {
    const result = await makeRequest(
      `${CONFIG.BACKEND_URL}/api/drive/list-files?folderId=${ROOT_FOLDER_ID}`
    );

    if (result.status === 200 && result.data.success) {
      log(`✓ Drive listou ${result.data.total} arquivos/pastas`, 'success');
      auditResults.drive.push({ test: 'List Files', status: 'PASS', count: result.data.total });
    } else {
      log(`✗ Erro ao listar arquivos do Drive: ${JSON.stringify(result.data)}`, 'error');
      auditResults.drive.push({ test: 'List Files', status: 'FAIL', error: result.data });
    }
  } catch (error) {
    log(`✗ Falha na requisição do Drive: ${error.message}`, 'error');
    auditResults.drive.push({ test: 'List Files', status: 'FAIL', error: error.message });
  }

  // Teste de busca de pasta
  try {
    const result = await makeRequest(
      `${CONFIG.BACKEND_URL}/api/drive/find-folder?name=teste`
    );

    if (result.status === 200) {
      log(`✓ Busca de pasta funcionando`, 'success');
      auditResults.drive.push({ test: 'Find Folder', status: 'PASS' });
    } else {
      log(`✗ Erro na busca de pasta`, 'error');
      auditResults.drive.push({ test: 'Find Folder', status: 'FAIL', error: result.data });
    }
  } catch (error) {
    log(`✗ Falha na busca de pasta: ${error.message}`, 'error');
    auditResults.drive.push({ test: 'Find Folder', status: 'FAIL', error: error.message });
  }
}

async function testKeepAPI() {
  header('4. TESTE DO GOOGLE KEEP API');

  // Teste de status
  try {
    const statusResult = await makeRequest(`${CONFIG.BACKEND_URL}/api/keep/status`);
    log(`Status do Keep: ${JSON.stringify(statusResult.data)}`, 'info');

    if (statusResult.data.configured) {
      log('✓ Keep Service Account configurada', 'success');
      auditResults.keep.push({ test: 'SA Config', status: 'PASS' });
    } else {
      log('✗ Keep Service Account NÃO configurada', 'warn');
      auditResults.keep.push({ test: 'SA Config', status: 'WARN', error: statusResult.data.message });
    }
  } catch (error) {
    log(`✗ Erro ao verificar status do Keep: ${error.message}`, 'error');
    auditResults.keep.push({ test: 'SA Config', status: 'FAIL', error: error.message });
  }

  // Teste de listagem de notas
  try {
    const notesResult = await makeRequest(`${CONFIG.BACKEND_URL}/api/keep/notes`);

    if (notesResult.status === 200) {
      const count = Array.isArray(notesResult.data) ? notesResult.data.length : 0;
      log(`✓ Keep listou ${count} notas`, 'success');
      auditResults.keep.push({ test: 'List Notes', status: 'PASS', count });
    } else {
      log(`✗ Erro ao listar notas: ${JSON.stringify(notesResult.data)}`, 'error');
      auditResults.keep.push({ test: 'List Notes', status: 'FAIL', error: notesResult.data });
    }
  } catch (error) {
    log(`✗ Falha na requisição de notas: ${error.message}`, 'error');
    auditResults.keep.push({ test: 'List Notes', status: 'FAIL', error: error.message });
  }
}

async function testEmailAPI() {
  header('5. TESTE DO EMAIL API');

  try {
    const result = await makeRequest(`${CONFIG.BACKEND_URL}/api/email/verify`);

    if (result.status === 200 && result.data.connected) {
      log('✓ Serviço de email conectado', 'success');
      auditResults.backend.push({ test: 'Email Service', status: 'PASS' });
    } else {
      log('✗ Serviço de email não conectado', 'error');
      auditResults.backend.push({ test: 'Email Service', status: 'FAIL', error: result.data });
    }
  } catch (error) {
    log(`✗ Falha ao verificar email: ${error.message}`, 'error');
    auditResults.backend.push({ test: 'Email Service', status: 'FAIL', error: error.message });
  }
}

async function testOpenAIProxy() {
  header('6. TESTE DO PROXY OPENAI');

  try {
    const result = await makeRequest(`${CONFIG.BACKEND_URL}/api/openai/chat`, {
      method: 'POST',
      body: {
        model: 'gpt-4o',
        messages: [{ role: 'user', content: 'Responda apenas: OK' }],
        max_tokens: 10,
      },
    });

    if (result.status === 200 && result.data.choices) {
      log('✓ Proxy OpenAI funcionando', 'success');
      auditResults.backend.push({ test: 'OpenAI Proxy', status: 'PASS' });
    } else {
      log(`✗ Proxy OpenAI com problema: ${JSON.stringify(result.data)}`, 'error');
      auditResults.backend.push({ test: 'OpenAI Proxy', status: 'FAIL', error: result.data });
    }
  } catch (error) {
    log(`✗ Falha no proxy OpenAI: ${error.message}`, 'error');
    auditResults.backend.push({ test: 'OpenAI Proxy', status: 'FAIL', error: error.message });
  }
}

// ============================================================
// CHECKLIST DE AUDITORIA FRONTEND
// ============================================================

function generateFrontendChecklist() {
  header('7. CHECKLIST DE AUDITORIA FRONTEND');

  const checklist = [
    {
      category: 'LOGIN & AUTENTICAÇÃO',
      items: [
        '[ ] Tela de login responsiva no mobile',
        '[ ] Campos de email/senha alinhados corretamente',
        '[ ] Botão de login visível e clicável',
        '[ ] Mensagens de erro visíveis (não atrás de elementos)',
        '[ ] Logo centralizada e proporcional',
        '[ ] Link "Esqueci minha senha" funcional',
      ]
    },
    {
      category: 'DASHBOARD',
      items: [
        '[ ] Cards de métricas com tamanhos consistentes',
        '[ ] Gráficos responsivos',
        '[ ] Widget de Calendar carregando corretamente',
        '[ ] Widget de Keep carregando corretamente',
        '[ ] Sidebar não sobrepõe conteúdo no mobile',
        '[ ] Menu hamburguer funcional no mobile',
      ]
    },
    {
      category: 'NOTIFICAÇÕES',
      items: [
        '[ ] Sino de notificação visível no header',
        '[ ] Badge de contagem atualiza corretamente',
        '[ ] Dropdown de notificações abre corretamente',
        '[ ] TÍTULO das notificações visível (não em branco)',
        '[ ] MENSAGEM das notificações visível (não em branco)',
        '[ ] Clique na notificação navega para a ação',
        '[ ] "Marcar todas como lidas" funciona',
      ]
    },
    {
      category: 'CALENDÁRIO',
      items: [
        '[ ] Calendário carrega sem erro 500',
        '[ ] Eventos aparecem nos dias corretos',
        '[ ] Cores dos eventos corretas',
        '[ ] Modal de criar evento abre',
        '[ ] Modal de criar evento fecha corretamente',
        '[ ] Evento criado aparece no calendário',
        '[ ] Navegação entre meses funciona',
      ]
    },
    {
      category: 'GOOGLE KEEP',
      items: [
        '[ ] Notas carregam corretamente',
        '[ ] Checklist renderiza com checkboxes',
        '[ ] Checkbox clicável para marcar/desmarcar',
        '[ ] Criar nova nota funciona',
        '[ ] Deletar nota funciona',
        '[ ] Compartilhar nota funciona',
      ]
    },
    {
      category: 'LAYOUT & RESPONSIVIDADE',
      items: [
        '[ ] Textos não ultrapassam containers',
        '[ ] Ícones não sobrepõem textos',
        '[ ] Botões clicáveis com tamanho adequado',
        '[ ] Scroll funciona em todas as áreas',
        '[ ] Modais centralizados e não cortados',
        '[ ] Tabelas com scroll horizontal no mobile',
        '[ ] Fontes legíveis em todas as telas',
      ]
    },
    {
      category: 'CORES & CONSISTÊNCIA',
      items: [
        '[ ] Laranja WG (#F25C26) como cor primária',
        '[ ] Botões primários com cor laranja',
        '[ ] Links com cor consistente',
        '[ ] Estados hover visíveis',
        '[ ] Estados disabled distintos',
        '[ ] Contraste adequado para leitura',
      ]
    },
    {
      category: 'FORMULÁRIOS',
      items: [
        '[ ] Labels alinhados com inputs',
        '[ ] Campos obrigatórios marcados',
        '[ ] Validação exibe mensagens claras',
        '[ ] Botões de submit desabilitados durante loading',
        '[ ] Feedback de sucesso/erro após submit',
      ]
    },
  ];

  checklist.forEach(section => {
    log(`\n${section.category}:`, 'header');
    section.items.forEach(item => console.log(`  ${item}`));
  });

  auditResults.frontend = checklist;
}

// ============================================================
// RELATÓRIO FINAL
// ============================================================

function generateReport() {
  header('RELATÓRIO FINAL DA AUDITORIA');

  const summary = {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
  };

  // Contar resultados
  Object.entries(auditResults).forEach(([category, results]) => {
    if (Array.isArray(results)) {
      results.forEach(r => {
        if (r.status) {
          summary.total++;
          if (r.status === 'PASS') summary.passed++;
          else if (r.status === 'FAIL') summary.failed++;
          else if (r.status === 'WARN') summary.warnings++;
        }
      });
    }
  });

  console.log('\n📊 RESUMO:');
  console.log(`   Total de testes: ${summary.total}`);
  console.log(`   ${COLORS.green}✓ Passou: ${summary.passed}${COLORS.reset}`);
  console.log(`   ${COLORS.red}✗ Falhou: ${summary.failed}${COLORS.reset}`);
  console.log(`   ${COLORS.yellow}⚠ Avisos: ${summary.warnings}${COLORS.reset}`);

  // Problemas críticos
  if (summary.failed > 0) {
    console.log('\n🚨 PROBLEMAS CRÍTICOS ENCONTRADOS:');

    // Calendar
    const calendarFails = auditResults.calendar.filter(r => r.status === 'FAIL');
    if (calendarFails.length > 0) {
      console.log('\n  📅 GOOGLE CALENDAR:');
      calendarFails.forEach(f => {
        console.log(`     - ${f.test}: ${f.error}`);
        if (f.solution) console.log(`       💡 Solução: ${f.solution}`);
      });
    }

    // Drive
    const driveFails = auditResults.drive.filter(r => r.status === 'FAIL');
    if (driveFails.length > 0) {
      console.log('\n  📁 GOOGLE DRIVE:');
      driveFails.forEach(f => {
        console.log(`     - ${f.test}: ${f.error}`);
      });
    }

    // Keep
    const keepFails = auditResults.keep.filter(r => r.status === 'FAIL');
    if (keepFails.length > 0) {
      console.log('\n  📝 GOOGLE KEEP:');
      keepFails.forEach(f => {
        console.log(`     - ${f.test}: ${f.error}`);
      });
    }

    // Backend
    const backendFails = auditResults.backend.filter(r => r.status === 'FAIL');
    if (backendFails.length > 0) {
      console.log('\n  🖥️ BACKEND:');
      backendFails.forEach(f => {
        console.log(`     - ${f.test}: ${f.error}`);
      });
    }
  }

  // Soluções
  console.log('\n💡 SOLUÇÕES RECOMENDADAS:');

  if (auditResults.calendar.some(r => r.status === 'FAIL' && r.error?.includes('unauthorized_client'))) {
    console.log(`
  📅 ERRO 500 DO CALENDAR - DOMAIN-WIDE DELEGATION:

  O erro "unauthorized_client" indica que a Service Account precisa de
  Domain-wide Delegation configurada no Google Workspace Admin.

  Passos para configurar:
  1. Acesse: https://admin.google.com
  2. Vá em: Segurança → Acesso e controle de dados → Controles de API
  3. Clique em "Gerenciar delegação em todo o domínio"
  4. Clique em "Adicionar novo"
  5. Cole o Client ID da Service Account: 101008980418613178162
  6. Adicione os escopos:
     - https://www.googleapis.com/auth/calendar
     - https://www.googleapis.com/auth/calendar.events
  7. Salve e aguarde alguns minutos para propagar
`);
  }

  console.log('\n📋 PRÓXIMOS PASSOS:');
  console.log('  1. Execute o checklist frontend manualmente no navegador');
  console.log('  2. Teste em dispositivo móvel real');
  console.log('  3. Verifique as notificações no Supabase (tabela notificacoes_sistema)');
  console.log('  4. Configure Domain-wide Delegation se o Calendar estiver falhando');

  // Salvar resultados em arquivo
  const reportPath = './auditoria-resultado.json';
  require('fs').writeFileSync(reportPath, JSON.stringify(auditResults, null, 2));
  console.log(`\n📄 Resultados salvos em: ${reportPath}`);
}

// ============================================================
// EXECUÇÃO PRINCIPAL
// ============================================================

async function runAudit() {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║           AUDITORIA COMPLETA - WG EASY SISTEMA             ║
║                    ${new Date().toISOString().substring(0, 10)}                         ║
╚════════════════════════════════════════════════════════════╝
`);

  try {
    // Testes do backend
    await testBackendHealth();
    await testCalendarAPI();
    await testDriveAPI();
    await testKeepAPI();
    await testEmailAPI();
    await testOpenAIProxy();

    // Checklist frontend
    generateFrontendChecklist();

    // Relatório final
    generateReport();

  } catch (error) {
    log(`Erro fatal na auditoria: ${error.message}`, 'error');
    console.error(error);
  }
}

// Executar
runAudit();
