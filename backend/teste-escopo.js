// Teste de análise de escopo com OpenAI
// Executa: node teste-escopo.js

require('dotenv').config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const ESCOPO_TESTE = `PLANO DE REFORMA: MEMORIAL DESCRITIVO DOS SERVIÇOS A SEREM EXECUTADOS
GERAIS
PROTEÇÃO DE PISOS, PORTAS E ESQUADRIAS NAS ÁREAS INTERNAS DO APARTAMENTO, BEM
COMO NO HALL SOCIAL E ELEVADORES, COM UTILIZAÇÃO DE MATERIAIS ADEQUADOS PARA
PREVENÇÃO DE DANOS DURANTE A EXECUÇÃO DA OBRA.
LIMPEZA PERIÓDICA, RETIRADA, TRANSPORTE E DESCARTE AMBIENTALMENTE ADEQUADO
DOS ENTULHOS GERADOS PELAS ATIVIDADES DA OBRA, EM CONFORMIDADE COM AS
NORMAS VIGENTES.
DEMOLIÇÃO E REMOÇÕES
DEMOLIÇÃO DE REVESTIMENTO DE PISO EXISTENTE EM PORCELANATO, FORMATO 61X61 CM,
NAS ÁREAS DA COZINHA, LAVANDERIA, TERRAÇO E BANHEIROS DO LORENZO E DA SUÍTE
MASTER, INCLUINDO REMOÇÃO DA ARGAMASSA DE ASSENTAMENTO.
REMOÇÃO DE ESQUADRIA DE ALUMÍNIO EXISTENTE NA DIVISÃO ENTRE A SALA DE ESTAR E O
TERRAÇO, COM RETIRADA DE PERFIS, FIXAÇÕES E ACABAMENTOS.
REMOÇÃO DE PORTA DE ACESSO AO LAVABO, INCLUINDO FOLHA, BATENTE, GUARNIÇÕES E
FERRAGENS.
DEMOLIÇÃO DE REVESTIMENTO DE PAREDE EXISTENTE EM PORCELANATO, FORMATO 33X60
CM, NAS ÁREAS DA COZINHA, LAVANDERIA E NO INTERIOR DAS ÁREAS DE BANHO DOS
BANHEIROS.
DEMOLIÇÃO DE PAREDE DE ALVENARIA NÃO ESTRUTURAL ENTRE A COZINHA E A SALA DE
JANTAR, CONFORME PROJETO EXECUTIVO, COM PRESERVAÇÃO DOS ELEMENTOS
ESTRUTURAIS.
RECUO DO PONTO DE GÁS EXISTENTE PARA ATENDIMENTO AO COOKTOP, SERÁ INSTALADO
ELÉTRICO.
REMANEJAMENTO DO PONTO DE ALIMENTAÇÃO DE ÁGUA DA GELADEIRA, CONFORME
LAYOUT DEFINIDO EM PROJETO.
RECORTE EM PAREDE DE ALVENARIA NÃO ESTRUTURAL PARA INSTALAÇÃO DE NICHOS
EMBUTIDOS NO INTERIOR DAS ÁREAS DE BANHO DOS BANHEIROS DO LORENZO E DA SUÍTE
MASTER.
REMOÇÃO DE LOUÇAS SANITÁRIAS, METAIS, BANCADAS E DEMAIS COMPONENTES
EXISTENTES, COM DESCONEXÃO DAS INSTALAÇÕES.
DEMOLIÇÃO E/OU RECORTES EM FORRO DE GESSO ACARTONADO EXISTENTE PARA PASSAGEM
E ADEQUAÇÃO DE INSTALAÇÕES ELÉTRICAS, REDE, DADOS E ILUMINAÇÃO.
CONSTRUÇÃO, ADEQUAÇÕES E INSTALAÇÕES
EXECUÇÃO, REGULARIZAÇÃO E NIVELAMENTO DE CONTRAPISO PARA RECEBIMENTO DE
REVESTIMENTO VINÍLICO NAS SUÍTES DO LORENZO E DA SUÍTE MASTER.
REGULARIZAÇÃO E NIVELAMENTO DE CONTRAPISOS PARA INSTALAÇÃO DE REVESTIMENTO EM
PORCELANATO NAS ÁREAS DA COZINHA, LAVANDERIA, SALA DE JANTAR, SALA DE ESTAR,
TERRAÇO, CIRCULAÇÃO ÍNTIMA, LAVABO E BANHEIROS DO LORENZO E DA SUÍTE MASTER,
COM DEFINIÇÃO DE CAIMENTOS QUANDO APLICÁVEL.
IMPERMEABILIZAÇÃO DA ÁREA INTERNA DOS BANHOS DO PISO AO TETO E, NAS ÁREAS
EXTERNAS AO BOX, IMPERMEABILIZAÇÃO COM BARRAMENTO PERIMETRAL DE 30 CM,
INCLUINDO O TERRAÇO, PARA POSTERIOR INSTALAÇÃO DE REVESTIMENTO EM PORCELANATO.
EXECUÇÃO DE PAREDE EM ALVENARIA, COM ESPESSURA FINAL DE 10 CM, PARA ADEQUAÇÃO
DOS PONTOS HIDRÁULICOS E DE GÁS DESTINADOS AO AQUECEDOR DE PASSAGEM, BEM
COMO DOS PONTOS HIDRÁULICOS DO TANQUE E DA MÁQUINA DE LAVAR ROUPAS.
ADEQUAÇÃO E/OU EXECUÇÃO DE PONTOS DE HIDRÁULICA, CONFORME NECESSIDADE E
PROJETO EXECUTIVO.
ADEQUAÇÃO E/OU EXECUÇÃO DE PONTOS DE ELÉTRICA, REDE, DADOS E CIRCUITOS,
CONFORME NECESSIDADE E PROJETO EXECUTIVO.
ADEQUAÇÃO E/OU EXECUÇÃO DE PONTOS DE ILUMINAÇÃO E CIRCUITOS, CONFORME
NECESSIDADE E PROJETO EXECUTIVO.
EXECUÇÃO DE TUBULAÇÃO SECA COM DIÂMETRO DE 40 MM PARA PASSAGEM DE CABOS
HDMI NOS PONTOS DESTINADOS À INSTALAÇÃO DE TELEVISÕES.
REGULARIZAÇÃO, NIVELAMENTO E PINTURA DE PAREDES INTERNAS COM TINTA ACRÍLICA,
CONFORME ESPECIFICAÇÕES DE PROJETO.
INSTALAÇÃO DE REVESTIMENTO DE PISO E PAREDE EM PORCELANATO NAS ÁREAS DA
COZINHA, LAVANDERIA, LAVABO, CIRCULAÇÃO E BANHEIROS DO LORENZO E DA SUÍTE
MASTER.
INSTALAÇÃO DE REVESTIMENTO DE PISO VINÍLICO NAS SUÍTES DO LORENZO E DA SUÍTE
MASTER.
INSTALAÇÃO DE RALO LINEAR INVISÍVEL DE 70 CM NAS ÁREAS DE BANHO DOS BANHEIROS DO
LORENZO E DA SUÍTE MASTER.
INSTALAÇÃO DE RALO QUADRO INVISÍVEL DE 10X10 CM NA LAVANDERIA, LAVABO, TERRAÇO
SOCIAL E BANHEIROS DO LORENZO E DA SUÍTE MASTER.
ASSENTAMENTO DE BAGUETE DE PEDRA EM PISO PORCELANATO PARA INSTALAÇÃO DE BOX
NOS BANHEIROS DO LORENZO E DA SUÍTE MASTER.
INSTALAÇÃO DE BOX DE VIDRO DE PISO AO TETO, COM PORTA DE CORRER, NOS BANHEIROS
DO LORENZO E DA SUÍTE MASTER.
INSTALAÇÃO DE BANCADAS, LOUÇAS SANITÁRIAS E METAIS, CONFORME DEFINIÇÕES DO
PROJETO DE INTERIORES.
INSTALAÇÃO DE NOVOS ACABAMENTOS PARA OS PONTOS DE ELÉTRICA, REDE, DADOS E
ILUMINAÇÃO.
EXECUÇÃO E/OU RECOMPOSIÇÃO DE FORRO DE GESSO ACARTONADO COM TABICA METÁLICA
DE 2 CM.
EXECUÇÃO E INSTALAÇÃO DE ENVIDRAÇAMENTO DA FACHADA DO TERRAÇO SOCIAL, EM
CONFORMIDADE COM PROJETO E NORMAS TÉCNICAS.
EXECUÇÃO DE PONTO DE ÁGUA E PONTO ELÉTRICO NO TERRAÇO PARA ATENDIMENTO À
CERVEJEIRA.`;

const PROMPT = `Você é um orçamentista ESPECIALISTA de obras de alto padrão. Extraia TODOS os serviços do escopo.

## REGRAS:
1. Cada serviço = 1 linha separada POR AMBIENTE
2. Categorias: gerais, demolicao, construcao, instalacoes_eletricas, instalacoes_hidraulicas, revestimentos, pintura, forros, esquadrias, impermeabilizacao, loucas_metais, pedras, vidracaria, marcenaria
3. Núcleos: engenharia, produtos, marcenaria, arquitetura

## FORMATO JSON:
{
  "servicos": [
    {
      "categoria": "string",
      "nucleo": "engenharia|produtos|marcenaria|arquitetura",
      "tipo": "mao_obra|material",
      "descricao": "string",
      "ambiente": "string",
      "unidade": "m2|ml|un|pt|vb",
      "ordem": number
    }
  ]
}

## ESCOPO:
${ESCOPO_TESTE}

Retorne APENAS JSON válido.`;

async function testarAnalise() {
  console.log('='.repeat(60));
  console.log('TESTE DE ANÁLISE DE ESCOPO COM OPENAI');
  console.log('='.repeat(60));
  console.log(`\nChave API: ${OPENAI_API_KEY ? OPENAI_API_KEY.substring(0, 20) + '...' : 'NÃO CONFIGURADA'}`);
  console.log(`Tamanho do escopo: ${ESCOPO_TESTE.length} caracteres`);
  console.log(`Tamanho do prompt: ${PROMPT.length} caracteres`);
  console.log('\nEnviando para OpenAI...\n');

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: PROMPT,
          },
        ],
        max_tokens: 16000,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ ERRO NA API:', response.status);
      console.error(JSON.stringify(errorData, null, 2));
      return;
    }

    const data = await response.json();

    console.log('✅ RESPOSTA RECEBIDA!');
    console.log(`\nFinish Reason: ${data.choices[0].finish_reason}`);
    console.log(`Tokens - Prompt: ${data.usage?.prompt_tokens}, Completion: ${data.usage?.completion_tokens}, Total: ${data.usage?.total_tokens}`);

    const texto = data.choices[0].message.content;
    console.log(`\nTamanho da resposta: ${texto.length} caracteres`);

    // Verificar se foi truncada
    const foiTruncada = data.choices[0].finish_reason === 'length';
    if (foiTruncada) {
      console.log('\n⚠️ AVISO: Resposta foi TRUNCADA!');
    }

    // Tentar parsear JSON
    console.log('\n' + '-'.repeat(60));
    console.log('TENTANDO PARSEAR JSON...');
    console.log('-'.repeat(60));

    // Limpar resposta
    let jsonStr = texto.trim();
    jsonStr = jsonStr.replace(/^```json\s*/i, '');
    jsonStr = jsonStr.replace(/```$/g, '');
    jsonStr = jsonStr.replace(/```/g, '');
    jsonStr = jsonStr.trim();

    // Encontrar JSON
    const firstBrace = jsonStr.indexOf('{');
    const lastBrace = jsonStr.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
    }

    try {
      const resultado = JSON.parse(jsonStr);
      console.log('\n✅ JSON PARSEADO COM SUCESSO!');
      console.log(`\nServiços extraídos: ${resultado.servicos?.length || 0}`);

      if (resultado.servicos && resultado.servicos.length > 0) {
        console.log('\n📋 PRIMEIROS 5 SERVIÇOS:');
        resultado.servicos.slice(0, 5).forEach((s, i) => {
          console.log(`  ${i + 1}. [${s.categoria}] ${s.descricao} - ${s.ambiente}`);
        });

        console.log('\n📋 ÚLTIMOS 5 SERVIÇOS:');
        resultado.servicos.slice(-5).forEach((s, i) => {
          console.log(`  ${resultado.servicos.length - 4 + i}. [${s.categoria}] ${s.descricao} - ${s.ambiente}`);
        });

        // Contar por categoria
        const porCategoria = {};
        resultado.servicos.forEach(s => {
          porCategoria[s.categoria] = (porCategoria[s.categoria] || 0) + 1;
        });

        console.log('\n📊 SERVIÇOS POR CATEGORIA:');
        Object.entries(porCategoria).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
          console.log(`  ${cat}: ${count}`);
        });
      }

      console.log('\n' + '='.repeat(60));
      console.log('✅ TESTE CONCLUÍDO COM SUCESSO!');
      console.log('='.repeat(60));

    } catch (parseError) {
      console.log('\n❌ ERRO AO PARSEAR JSON:', parseError.message);
      console.log('\nInício do JSON:', jsonStr.substring(0, 500));
      console.log('\nFinal do JSON:', jsonStr.substring(jsonStr.length - 500));

      // Verificar balanceamento de chaves
      const numAbre = (jsonStr.match(/{/g) || []).length;
      const numFecha = (jsonStr.match(/}/g) || []).length;
      console.log(`\nChaves: { = ${numAbre}, } = ${numFecha} (diferença: ${numAbre - numFecha})`);
    }

  } catch (error) {
    console.error('❌ ERRO:', error.message);
  }
}

testarAnalise();
