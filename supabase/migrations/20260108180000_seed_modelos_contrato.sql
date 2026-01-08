-- ============================================================
-- MIGRATION: Seed dos 3 Modelos de Contrato
-- Sistema WG Easy - Grupo WG Almeida
-- Data: 2026-01-08
-- Descrição: Insere os 3 modelos de contrato padrão do sistema
-- ============================================================

-- ============================================================
-- 0. GARANTIR QUE A CONSTRAINT UNIQUE EXISTE NA COLUNA codigo
-- ============================================================
DO $$
BEGIN
  -- Criar tabela se não existir
  CREATE TABLE IF NOT EXISTS juridico_modelos_contrato (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo TEXT NOT NULL,
    nome TEXT NOT NULL,
    descricao TEXT,
    nucleo TEXT,
    conteudo_html TEXT,
    clausulas JSONB,
    variaveis_obrigatorias JSONB,
    prazo_execucao_padrao INTEGER,
    prorrogacao_padrao INTEGER,
    status TEXT DEFAULT 'rascunho',
    versao INTEGER DEFAULT 1,
    versao_texto TEXT DEFAULT '1.0.0',
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Tentar dropar constraint existente (se houver problema)
  BEGIN
    ALTER TABLE juridico_modelos_contrato DROP CONSTRAINT IF EXISTS juridico_modelos_contrato_codigo_key;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  -- Criar a constraint UNIQUE
  ALTER TABLE juridico_modelos_contrato ADD CONSTRAINT juridico_modelos_contrato_codigo_key UNIQUE (codigo);
EXCEPTION
  WHEN duplicate_object THEN
    -- Constraint já existe, OK
    NULL;
  WHEN OTHERS THEN
    RAISE NOTICE 'Aviso ao criar constraint: %', SQLERRM;
END $$;

-- Habilitar RLS se não estiver
ALTER TABLE juridico_modelos_contrato ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
DROP POLICY IF EXISTS "juridico_modelos_contrato_select" ON juridico_modelos_contrato;
CREATE POLICY "juridico_modelos_contrato_select" ON juridico_modelos_contrato
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "juridico_modelos_contrato_insert" ON juridico_modelos_contrato;
CREATE POLICY "juridico_modelos_contrato_insert" ON juridico_modelos_contrato
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "juridico_modelos_contrato_update" ON juridico_modelos_contrato;
CREATE POLICY "juridico_modelos_contrato_update" ON juridico_modelos_contrato
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "juridico_modelos_contrato_delete" ON juridico_modelos_contrato;
CREATE POLICY "juridico_modelos_contrato_delete" ON juridico_modelos_contrato
  FOR DELETE USING (true);

-- ============================================================
-- 1. MODELO: CONTRATO DE PROJETO ARQUITETÔNICO
-- Empresa: WG ALMEIDA ARQUITETURA E COMERCIO LTDA
-- ============================================================
INSERT INTO juridico_modelos_contrato (
  codigo,
  nome,
  descricao,
  nucleo,
  conteudo_html,
  clausulas,
  variaveis_obrigatorias,
  prazo_execucao_padrao,
  prorrogacao_padrao,
  status,
  versao,
  versao_texto,
  ativo
) VALUES (
  'MOD-ARQ-001',
  'Contrato de Projeto Arquitetônico',
  'Contrato para prestação de serviços de arquitetura e elaboração de projeto arquitetônico',
  'arquitetura',
  E'<div class="contrato">
  <h1 style="text-align: center;">CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE ARQUITETURA</h1>

  <div class="cabecalho">
    <p><strong>CONTRATADA:</strong> WG ALMEIDA ARQUITETURA E COMERCIO LTDA, pessoa jurídica de direito privado, inscrita no CNPJ sob nº 45.150.970/0001-01, Inscrição Estadual nº 134.168.759.116, com sede na Rua Verbo Divino, 2001, Torre A, 10º Andar, Chácara Santo Antônio, CEP 04719-002, São Paulo/SP.</p>

    <p><strong>CONTRATANTE:</strong> {{contratante_nome}}, {{contratante_nacionalidade}}, {{contratante_estado_civil}}, portador(a) do RG nº {{contratante_rg}} e CPF nº {{contratante_cpf}}, residente e domiciliado(a) na {{contratante_endereco}}.</p>
  </div>

  <h2>CLÁUSULA 1ª - DA DESCRIÇÃO DO OBJETO DO CONTRATO</h2>
  <p>1.1. O presente contrato tem por objeto a prestação de serviços na área de arquitetura, especificamente na elaboração de projeto arquitetônico do Imóvel localizado na {{imovel_endereco}}, doravante denominado serviços, devidamente descrito na matrícula {{imovel_matricula}} do Registro de Imóvel da Capital, com inscrição imobiliária nº {{imovel_inscricao}}, por parte dos profissionais integrantes da CONTRATADA, segundo os ditames abaixo clausulados.</p>

  <p>1.2. O Projeto Arquitetônico de que trata o presente contrato é relativo à alteração de layout, reforma estrutural e de interiores, inclusive com demolição, construção e alteração de pontos elétricos e hidráulicos.</p>

  <h3>Projeto de Arquitetura:</h3>
  <ul>
    <li>Planta de situação</li>
    <li>Planta de layout</li>
    <li>Planta de cobertura</li>
    <li>Planta de demolição</li>
    <li>Planta construtiva</li>
    <li>Mapa de instalações elétricas</li>
    <li>Plantas de lógica e sonorização</li>
    <li>Mapa de instalações hidráulicas</li>
    <li>Planta de revestimentos</li>
    <li>Planta de paginação de pisos</li>
    <li>Planta de forro</li>
    <li>Planta de iluminação</li>
    <li>Layout e vistas de marcenaria</li>
    <li>Detalhamento de cada ambiente</li>
    <li>Detalhamento construtivo</li>
    <li>Detalhamento de marmoraria</li>
    <li>Detalhamento de esquadrias</li>
    <li>Detalhamento de vidraçaria</li>
  </ul>

  <h3>Projetos Complementares:</h3>
  <ul>
    <li>Projeto luminotécnico</li>
    <li>Projeto hidrossanitário</li>
    <li>Projeto distribuição de quadro elétrico</li>
    <li>Projeto de fundações</li>
    <li>Projeto estrutural</li>
    <li>Projeto de automação</li>
    <li>Projeto de reuso de águas pluviais</li>
    <li>Planta de condicionamento de ar</li>
    <li>Projeto de exaustão</li>
    <li>Projeto de gás</li>
  </ul>

  <h2>CLÁUSULA 2ª - DAS ETAPAS E PRAZOS DO PROJETO ARQUITETÔNICO</h2>
  <p>2.1. Os serviços a serem prestados pela CONTRATADA consistem na elaboração do projeto avençado entre as partes, e com início após aprovação do CONTRATANTE.</p>
  <p>2.2. Os serviços ora contratados serão executados nos prazos abaixo especificados, condicionados a validação pelo CONTRATANTE.</p>

  <h2>CLÁUSULA 3ª - DO PREÇO E HONORÁRIOS</h2>
  <p>3.1. Em remuneração aos serviços ora avençados, o CONTRATANTE pagará à CONTRATADA a quantia de {{valor_total}} ({{valor_total_extenso}}).</p>

  <h2>CLÁUSULA 4ª - DAS OBRIGAÇÕES DA CONTRATADA</h2>
  <p>4.1. Responder perante o CONTRATANTE, pela execução e entrega em conformidade com os serviços descritos no presente contrato.</p>
  <p>4.2. A CONTRATADA será responsável por elaborar os projetos objetivados no presente contrato, em obediência às normas e especificações técnicas vigentes.</p>
  <p>4.3. Atendimento a CONTRATANTE, referente ao projeto de segunda-feira à sexta-feira, das 09:00hs às 18:00hs (horário de Brasília).</p>

  <h2>CLÁUSULA 5ª - DAS OBRIGAÇÕES DA CONTRATANTE</h2>
  <p>5.1. Reembolsar as despesas havidas pela CONTRATADA, decorrentes de projetos técnicos complementares.</p>
  <p>5.2. Providenciar memorial descritivo do imóvel fornecido pela construtora.</p>
  <p>5.3. Disponibilizar autorização, chaves de acesso e cartão ou controle de estacionamento para início do trabalho.</p>

  <h2>CLÁUSULA 6ª - DA VIGÊNCIA E RESCISÃO CONTRATUAL</h2>
  <p>6.1. A vigência do contrato será o tempo que perdurar a elaboração do projeto arquitetônico a contar da assinatura deste.</p>

  <h2>CLÁUSULA 7ª - DAS CONDIÇÕES GERAIS</h2>
  <p>7.1. Este contrato não criará qualquer vínculo empregatício entre o CONTRATANTE e a CONTRATADA.</p>
  <p>7.2. As partes elegem o Foro da Comarca de São Paulo para solução de toda e qualquer dúvida ou controvérsia resultante do presente contrato.</p>

  <div class="assinaturas">
    <p>São Paulo, {{data_contrato}}</p>
    <br><br>
    <p>_______________________________________</p>
    <p><strong>CONTRATADA:</strong> WG ALMEIDA ARQUITETURA E COMERCIO LTDA</p>
    <br><br>
    <p>_______________________________________</p>
    <p><strong>CONTRATANTE:</strong> {{contratante_nome}}</p>
  </div>
</div>',
  '[
    {"numero": 1, "titulo": "DA DESCRIÇÃO DO OBJETO DO CONTRATO", "tipo": "objeto"},
    {"numero": 2, "titulo": "DAS ETAPAS E PRAZOS DO PROJETO ARQUITETÔNICO", "tipo": "prazo"},
    {"numero": 3, "titulo": "DO PREÇO E HONORÁRIOS", "tipo": "preco"},
    {"numero": 4, "titulo": "DAS OBRIGAÇÕES DA CONTRATADA", "tipo": "obrigacoes_contratada"},
    {"numero": 5, "titulo": "DAS OBRIGAÇÕES DA CONTRATANTE", "tipo": "obrigacoes_contratante"},
    {"numero": 6, "titulo": "DA VIGÊNCIA E RESCISÃO CONTRATUAL", "tipo": "rescisao"},
    {"numero": 7, "titulo": "DAS CONDIÇÕES GERAIS", "tipo": "geral"}
  ]'::jsonb,
  '[
    {"id": "contratante_nome", "label": "Nome do Contratante", "tipo": "texto"},
    {"id": "contratante_nacionalidade", "label": "Nacionalidade", "tipo": "texto"},
    {"id": "contratante_estado_civil", "label": "Estado Civil", "tipo": "select"},
    {"id": "contratante_rg", "label": "RG", "tipo": "texto"},
    {"id": "contratante_cpf", "label": "CPF", "tipo": "cpf"},
    {"id": "contratante_endereco", "label": "Endereço Completo", "tipo": "texto"},
    {"id": "imovel_endereco", "label": "Endereço do Imóvel", "tipo": "texto"},
    {"id": "imovel_matricula", "label": "Matrícula do Imóvel", "tipo": "texto"},
    {"id": "imovel_inscricao", "label": "Inscrição Imobiliária", "tipo": "texto"},
    {"id": "valor_total", "label": "Valor Total do Contrato", "tipo": "moeda"},
    {"id": "responsavel_tecnico_nome", "label": "Nome do Responsável Técnico", "tipo": "texto"},
    {"id": "responsavel_tecnico_cau", "label": "CAU do Responsável Técnico", "tipo": "texto"},
    {"id": "data_contrato", "label": "Data do Contrato", "tipo": "data"}
  ]'::jsonb,
  120, -- prazo_execucao_padrao em dias
  30,  -- prorrogacao_padrao em dias
  'publicado',
  1,
  '1.0.0',
  true
) ON CONFLICT (codigo) DO UPDATE SET
  nome = EXCLUDED.nome,
  descricao = EXCLUDED.descricao,
  conteudo_html = EXCLUDED.conteudo_html,
  clausulas = EXCLUDED.clausulas,
  variaveis_obrigatorias = EXCLUDED.variaveis_obrigatorias,
  updated_at = NOW();

-- ============================================================
-- 2. MODELO: CONTRATO DE MARCENARIA
-- Empresa: WG ALMEIDA Marcenaria de Alto Padrão Ltda
-- ============================================================
INSERT INTO juridico_modelos_contrato (
  codigo,
  nome,
  descricao,
  nucleo,
  conteudo_html,
  clausulas,
  variaveis_obrigatorias,
  prazo_execucao_padrao,
  prorrogacao_padrao,
  status,
  versao,
  versao_texto,
  ativo
) VALUES (
  'MOD-MAR-001',
  'Contrato de Venda de Produtos de Marcenaria e Prestação de Serviços de Montagem',
  'Contrato para venda de móveis planejados sob medida e prestação de serviços de marcenaria e montagem',
  'marcenaria',
  E'<div class="contrato">
  <h1 style="text-align: center;">CONTRATO DE VENDA DE PRODUTOS DE MARCENARIA E PRESTAÇÃO DE SERVIÇOS DE MONTAGEM</h1>

  <div class="cabecalho">
    <p><strong>CONTRATADA:</strong> WG ALMEIDA Marcenaria de Alto Padrão Ltda, pessoa jurídica de direito privado, inscrita no CNPJ sob nº 46.836.926/0001-12, Inscrição Estadual nº 136.302.718.117, CCM nº 7.355.072-8, com sede na Rua Guararapes, 305, Brooklin, CEP 04561-000, São Paulo/SP.</p>

    <p><strong>CONTRATANTE:</strong> {{contratante_nome}}, {{contratante_nacionalidade}}, {{contratante_estado_civil}}, portador(a) do RG nº {{contratante_rg}} e CPF nº {{contratante_cpf}}, residente e domiciliado(a) na {{contratante_endereco}}, e-mail: {{contratante_email}}.</p>
  </div>

  <h2>CLÁUSULA 1ª - DA DESCRIÇÃO DO OBJETO DO CONTRATO</h2>
  <p>1.1. O presente contrato tem por objeto a venda de móveis planejados sob medida e a prestação de serviços de marcenaria e montagem no imóvel localizado na {{imovel_endereco}}, doravante denominado "Imóvel".</p>
  <p>1.2. Os serviços objeto deste contrato referem-se ao desenvolvimento, fabricação e instalação de móveis sob medida, de acordo com o projeto previamente aprovado pelo CONTRATANTE.</p>

  <h2>CLÁUSULA 2ª - DAS ETAPAS E PRAZOS DO PROJETO</h2>
  <p>2.1. Os serviços a serem prestados pela CONTRATADA consistem na elaboração do projeto técnico de marcenaria, conforme previamente acordado entre as partes.</p>

  <h2>CLÁUSULA 3ª - CONDIÇÕES DE FORNECIMENTO E GARANTIA</h2>
  <p>3.1. Após a assinatura deste contrato pelo CONTRATANTE, as partes se obrigam ao cumprimento do presente contrato de forma irrevogável e irretratável.</p>
  <p>3.2. Os produtos comprados serão entregues no prazo de 40 dias úteis da data da assinatura do projeto executivo.</p>

  <h2>CLÁUSULA 4ª - DO PREÇO E HONORÁRIOS</h2>
  <p>4.1. Em remuneração aos serviços ora avençados, o CONTRATANTE pagará à CONTRATADA a quantia de {{valor_total}} ({{valor_total_extenso}}).</p>

  <h3>Forma de Pagamento:</h3>
  {{tabela_parcelas}}

  <h2>CLÁUSULA 5ª - DAS OBRIGAÇÕES DA CONTRATADA</h2>
  <p>5.1. Responder perante o CONTRATANTE, pela execução e entrega em conformidade com os serviços descritos no presente contrato.</p>

  <h2>CLÁUSULA 6ª - DAS OBRIGAÇÕES DA CONTRATANTE</h2>
  <p>6.1. Providenciar memorial descritivo do imóvel fornecido pela construtora.</p>
  <p>6.2. Disponibilizar autorização, chaves de acesso e cartão ou controle de estacionamento para início do trabalho.</p>

  <h2>CLÁUSULA 7ª - DA VIGÊNCIA E RESCISÃO CONTRATUAL</h2>
  <p>7.1. A vigência do contrato será o tempo que perdurar a elaboração do projeto a contar da assinatura deste.</p>

  <h2>CLÁUSULA 8ª - DAS CONDIÇÕES GERAIS</h2>
  <p>8.1. Este contrato não criará qualquer vínculo empregatício entre o CONTRATANTE e a CONTRATADA.</p>
  <p>8.2. As partes elegem o Foro da Comarca de São Paulo para solução de toda e qualquer dúvida ou controvérsia.</p>

  <h2>CLÁUSULA 9ª - DA RESERVA DE DOMÍNIO</h2>
  <p>9.1. Por força de pacto de reserva de domínio, fica reservada a CONTRATADA a propriedade do(s) objeto(s) até que seja liquidada a última das prestações.</p>

  <h2>CLÁUSULA 10ª - DA ENTREGA FUTURA</h2>
  <p>10.1. Entende-se por venda futura, aquela que não pode ser conferida de imediato, seja por motivo da obra não estar concluída ou por solicitação do CONTRATANTE.</p>

  <h3>Garantias:</h3>
  <ul>
    <li>Defeitos de fábrica: 90 dias da emissão da nota fiscal</li>
    <li>Móveis: 6 anos</li>
    <li>Puxadores, dobradiças e aramados: 90 dias</li>
    <li>Montagem: 90 dias da assinatura do termo de conclusão</li>
  </ul>

  <div class="assinaturas">
    <p>São Paulo, {{data_contrato}}</p>
    <br><br>
    <p>_______________________________________</p>
    <p><strong>CONTRATADA:</strong> WG ALMEIDA Marcenaria de Alto Padrão Ltda</p>
    <br><br>
    <p>_______________________________________</p>
    <p><strong>CONTRATANTE:</strong> {{contratante_nome}}</p>
  </div>
</div>',
  '[
    {"numero": 1, "titulo": "DA DESCRIÇÃO DO OBJETO DO CONTRATO", "tipo": "objeto"},
    {"numero": 2, "titulo": "DAS ETAPAS E PRAZOS DO PROJETO", "tipo": "prazo"},
    {"numero": 3, "titulo": "CONDIÇÕES DE FORNECIMENTO E GARANTIA", "tipo": "garantia"},
    {"numero": 4, "titulo": "DO PREÇO E HONORÁRIOS", "tipo": "preco"},
    {"numero": 5, "titulo": "DAS OBRIGAÇÕES DA CONTRATADA", "tipo": "obrigacoes_contratada"},
    {"numero": 6, "titulo": "DAS OBRIGAÇÕES DA CONTRATANTE", "tipo": "obrigacoes_contratante"},
    {"numero": 7, "titulo": "DA VIGÊNCIA E RESCISÃO CONTRATUAL", "tipo": "rescisao"},
    {"numero": 8, "titulo": "DAS CONDIÇÕES GERAIS", "tipo": "geral"},
    {"numero": 9, "titulo": "DA RESERVA DE DOMÍNIO", "tipo": "reserva_dominio"},
    {"numero": 10, "titulo": "DA ENTREGA FUTURA", "tipo": "entrega_futura"}
  ]'::jsonb,
  '[
    {"id": "contratante_nome", "label": "Nome do Contratante", "tipo": "texto"},
    {"id": "contratante_nacionalidade", "label": "Nacionalidade", "tipo": "texto"},
    {"id": "contratante_estado_civil", "label": "Estado Civil", "tipo": "select"},
    {"id": "contratante_rg", "label": "RG", "tipo": "texto"},
    {"id": "contratante_cpf", "label": "CPF", "tipo": "cpf"},
    {"id": "contratante_endereco", "label": "Endereço Completo", "tipo": "texto"},
    {"id": "contratante_email", "label": "E-mail do Contratante", "tipo": "email"},
    {"id": "imovel_endereco", "label": "Endereço do Imóvel", "tipo": "texto"},
    {"id": "valor_total", "label": "Valor Total do Contrato", "tipo": "moeda"},
    {"id": "valor_entrada", "label": "Valor da Entrada", "tipo": "moeda"},
    {"id": "parcelas_quantidade", "label": "Quantidade de Parcelas", "tipo": "numero"},
    {"id": "valor_parcela", "label": "Valor da Parcela", "tipo": "moeda"},
    {"id": "data_contrato", "label": "Data do Contrato", "tipo": "data"}
  ]'::jsonb,
  40,  -- prazo_execucao_padrao em dias úteis
  15,  -- prorrogacao_padrao em dias
  'publicado',
  1,
  '1.0.0',
  true
) ON CONFLICT (codigo) DO UPDATE SET
  nome = EXCLUDED.nome,
  descricao = EXCLUDED.descricao,
  conteudo_html = EXCLUDED.conteudo_html,
  clausulas = EXCLUDED.clausulas,
  variaveis_obrigatorias = EXCLUDED.variaveis_obrigatorias,
  updated_at = NOW();

-- ============================================================
-- 3. MODELO: CONTRATO DE ENGENHARIA/EMPREITADA
-- Empresa: WG ALMEIDA REFORMAS ESPECIALIZADAS LTDA
-- ============================================================
INSERT INTO juridico_modelos_contrato (
  codigo,
  nome,
  descricao,
  nucleo,
  conteudo_html,
  clausulas,
  variaveis_obrigatorias,
  prazo_execucao_padrao,
  prorrogacao_padrao,
  status,
  versao,
  versao_texto,
  ativo
) VALUES (
  'MOD-ENG-001',
  'Contrato para Fornecimento de Mão de Obra',
  'Contrato para prestação de serviços de fornecimento de mão de obra para execução de projeto executivo arquitetônico',
  'empreitada',
  E'<div class="contrato">
  <h1 style="text-align: center;">CONTRATO PARA FORNECIMENTO DE MÃO DE OBRA</h1>

  <div class="cabecalho">
    <p><strong>CONTRATADA:</strong> WG ALMEIDA REFORMAS ESPECIALIZADAS LTDA, pessoa jurídica de direito privado, inscrita no CNPJ sob nº 43.716.324/0001-33, Inscrição Estadual nº 133.069.108.116, com sede na Rua Guararapes, 305, Brooklin, CEP 04561-000, São Paulo/SP.</p>

    <p><strong>CONTRATANTE:</strong> {{contratante_nome}}, portador(a) do RG nº {{contratante_rg}} e CPF nº {{contratante_cpf}}, residente e domiciliado(a) na {{contratante_endereco}}, telefone: {{contratante_telefone}}, e-mail: {{contratante_email}}.</p>
  </div>

  <h2>CLÁUSULA 1ª - DO OBJETO E DESCRIÇÃO</h2>
  <p>1.1. O presente contrato tem por objeto prestação de serviço para fornecimento de mão de obra para execução de projeto executivo arquitetônico com fornecimento de mão de obra para serviços especificados em memorial executivo de acordo com o projeto de arquitetura elaborado com compatibilização do projeto de marcenaria.</p>
  <p>§1º A mão de obra e os materiais a serem empregados na execução do projeto, deverão ser de primeira qualidade conforme os disponíveis em mercado e em obediência às especificações e padrões em vigor, como método de ensaios e padrões aprovados e recomendados pela ABNT.</p>
  <p>§2º Os serviços a serem executados pela CONTRATADA consistem em: Fornecimento de mão de obra qualificada para execução de cada item relacionado ao projeto em conformidade com as etapas do trabalho.</p>
  <p>§3º Em caso de divergência ou contradição entre uma disposição contida no projeto executivo e na proposta orçamentária, prevalecerão as disposições previstas no projeto executivo.</p>
  <p>§4º A CONTRATADA não se responsabiliza pela qualidade do material adquirido pela CONTRATANTE, tampouco por eventual atraso na entrega do mesmo que poderá impactar no atraso do cronograma de execução da obra.</p>

  <p><strong>Local da Obra:</strong> {{obra_endereco}}</p>
  <p><strong>Descrição dos Serviços:</strong> {{obra_descricao}}</p>

  <h2>CLÁUSULA 2ª - DO PRAZO PARA EXECUÇÃO DO CONTRATO</h2>
  <p>2.1. Execução da obra: Em até {{prazo_execucao_dias}} dias úteis após assinatura do projeto executivo, podendo ser prorrogado por mais {{prazo_prorrogacao_dias}} dias em caso fortuito ou força maior, desde que devidamente notificado.</p>
  <p>§1º A CONTRATADA avisará para o CONTRATANTE o dia e o horário que a obra se iniciará, com prazo de planejamento de até 72 horas para início após assinatura deste contrato.</p>
  <p>§2º O CONTRATANTE se compromete a fornecer duas cópias de chaves que dão acesso à obra.</p>

  <h2>CLÁUSULA 3ª - DO PREÇO E HONORÁRIOS</h2>
  <p>3.1. A CONTRATANTE pagará à CONTRATADA pela execução do presente contrato o valor de {{valor_total}} ({{valor_total_extenso}}).</p>
  <p>§1º Constatada a ausência do pagamento, os valores serão corrigidos monetariamente de acordo com a variação do IGP-M/FGV, contados a partir da data do vencimento até a data do efetivo pagamento, aplicação de juros de mora de 1% ao mês pró-rata, bem como multa de 10% sobre o montante atualizado.</p>

  <h3>Forma de Pagamento:</h3>
  {{tabela_parcelas}}

  <h2>CLÁUSULA 4ª - DA VIGÊNCIA E RESCISÃO CONTRATUAL</h2>
  <p>4.1. A vigência do contrato será o tempo que perdurar a execução da obra descrita na cláusula segunda deste contrato.</p>
  <p>§1º Se a CONTRATANTE desistir da execução do projeto e da obra por qualquer motivo, ou também, se tratar de um imóvel financiado e este não for aprovado pelo banco financiador após a assinatura deste contrato, será aplicada multa de 30% do valor total.</p>
  <p>§2º Caso a CONTRATADA tenha iniciado os trabalhos, a CONTRATANTE deverá reembolsá-la pelos custos com mão de obra e o material já utilizado.</p>

  <h2>CLÁUSULA 5ª - DAS OBRIGAÇÕES DA CONTRATADA</h2>
  <p>5.1. Execução e implementação da obra de acordo com o projeto executivo e itens descritos e aprovados na proposta orçamentária.</p>
  <p>5.2. Responder na forma da legislação vigente por qualquer dano ou prejuízo que ocasionar à CONTRATANTE ou a terceiros em decorrência da execução da obra contratada.</p>
  <p>5.3. Não paralisar a obra, salvo por força maior, caso fortuito ou culpa da CONTRATANTE.</p>
  <p>5.4. Reforçar a equipe de trabalho a fim de que seja entregue dentro do prazo mencionado neste contrato, sem qualquer ônus ao CONTRATANTE.</p>
  <p>5.5. Acompanhamento da execução da obra em todas as suas fases e etapas.</p>
  <p>5.6. Cumprir e fazer cumprir toda legislação pertinente à prevenção de acidentes com a mão de obra.</p>
  <p>5.7. Manter sob sua inteira responsabilidade a guarda do material, ferramentas, equipamentos.</p>
  <p>5.8. Atendimento ao CONTRATANTE de segunda-feira à sexta-feira, das 09h00min às 18h00min, com prazo de retorno até 24 horas úteis, exceto emergência que serão atendidos em até 8 horas úteis.</p>

  <h2>CLÁUSULA 6ª - DAS OBRIGAÇÕES DO CONTRATANTE</h2>
  <p>6.1. Reembolsar as despesas havidas pela CONTRATADA, decorrentes de projetos técnicos complementares, desde que previamente autorizadas.</p>
  <p>6.2. Providenciar memorial descritivo do imóvel fornecido pela construtora, planta, itens que facilitam interagir com estrutura física, elétrica, hidráulica.</p>
  <p>6.3. Disponibilizar autorização, chaves de acesso e cartão ou controle de estacionamento para início.</p>
  <p>6.4. Local adequado para utilização dos colaboradores da CONTRATADA (sanitários e vestiário), local para a guarda dos materiais, máquinas e ferramentas, fornecimento de água e energia elétrica.</p>
  <p>6.5. Contatar e informar imediatamente à CONTRATADA caso receba do parceiro técnico quaisquer propostas para realização de serviços adicionais.</p>
  <p>6.6. Contratar ou realizar a locação de qualquer maquinário de médio ou grande porte (andaimes, caçambas, caminhões ou betoneiras).</p>
  <p>6.7. Assegurar que os materiais de construção necessários para a execução da obra estarão no local da obra.</p>
  <p>6.8. Não solicitar qualquer serviço adicional ao parceiro técnico, tampouco solicitar a realização de serviços de forma diversa da que foi contratada.</p>
  <p>6.9. Não realizar qualquer espécie de gestão direta dos parceiros técnicos.</p>
  <p>6.10. Garantir à CONTRATADA e a seus parceiros técnicos, o acesso à obra para a realização dos serviços ora contratados.</p>
  <p>6.11. Assegurar o tratamento digno, respeitoso e não discriminatório dos parceiros técnicos e funcionários da CONTRATADA.</p>

  <h2>CLÁUSULA 7ª - DA ENTREGA DOS SERVIÇOS</h2>
  <p>7.1. Vistoria Final: Após execução dos serviços, a CONTRATADA solicitará ao CONTRATANTE a vistoria final dos serviços, sendo nesta ocasião efetuadas eventuais observações que se fizerem necessárias.</p>
  <p>7.2. Inspeção Final: Após a execução dos ajustes necessários observados na vistoria final.</p>
  <p>§1º A CONTRATADA responderá por todo e qualquer dano, aparente ou oculto, nos serviços ora contratados.</p>

  <h2>CLÁUSULA 8ª - DA SOLICITAÇÃO DE SERVIÇOS ADICIONAIS</h2>
  <p>8.1. Quaisquer solicitações e/ou inclusões requeridas pela CONTRATANTE no projeto executivo e/ou na proposta orçamentária, concernentes a itens, atividades ou serviços ali não previstos, serão automaticamente consideradas como serviços adicionais.</p>
  <p>§1º A solicitação de serviços adicionais deverá ser realizada por escrito ou meio eletrônico, através de formalização enviado a CONTRATADA, a qual somente terá validade após aprovação do respectivo orçamento e assinatura do correspondente aditivo contratual.</p>
  <p>§2º Cada serviço e/ou item adicionado terá novos valores acrescidos e haverá alteração do prazo de entrega e cronograma da obra.</p>
  <p>§5º A gestão dos serviços realizados pelos parceiros técnicos é de competência EXCLUSIVA DA CONTRATADA.</p>

  <h2>CLÁUSULA 9ª - DA GARANTIA DOS SERVIÇOS</h2>
  <p>9.1. Todos os serviços contarão com garantia de 12 (doze) meses, contra defeitos decorrentes de execução da mão de obra e materiais empregados na obra pela CONTRATADA, contados a partir da assinatura do termo de aceite de obra.</p>
  <p>§1º Serviços adicionais realizados por empresas terceiras, diversas da CONTRATADA, não serão cobertos pela garantia aqui estabelecida.</p>
  <p>§2º Durante o período de garantia a CONTRATADA deverá atender aos chamados da CONTRATANTE para reexecução dos serviços no prazo máximo de até 10 dias úteis.</p>

  <h2>CLÁUSULA 10ª - DA RESCISÃO</h2>
  <p>10.1. O presente instrumento poderá ser rescindido de pleno direito, independentemente de qualquer aviso, notificação ou interpelação judicial ou extrajudicial.</p>
  <p>§3º As partes poderão rescindir o presente instrumento imotivadamente, mediante prévio aviso de 7 dias e pagamento de multa equivalente a 30% do valor devido.</p>

  <h2>CLÁUSULA 11ª - DAS PENALIDADES E MULTAS</h2>
  <p>11.1. O descumprimento de quaisquer das obrigações previstas no presente instrumento ensejará a parte infratora o pagamento de multa não compensatória de 30% do valor total dos serviços ora contratados.</p>

  <h2>CLÁUSULA 12ª - DAS CONDIÇÕES GERAIS</h2>
  <p>12.1. Este contrato não criará qualquer vínculo empregatício entre o CONTRATANTE e a CONTRATADA, e é firmado em caráter irrevogável e irretratável.</p>
  <p>§6º No prazo máximo de 2 dias contados da conclusão dos serviços deverão as partes assinar o competente e respectivo termo de aceite de obra.</p>
  <p>§7º Caso não haja assinatura do termo de aceite no prazo de até 5 dias contados da entrega da obra, presumir-se-á a concordância tácita do CONTRATANTE.</p>
  <p>§14º Para todos os fins de direito, o presente instrumento será considerado título executivo extrajudicial.</p>
  <p>As partes elegem o Foro da Comarca de São Paulo para solução de toda e qualquer dúvida ou controvérsia.</p>

  <div class="assinaturas">
    <p>São Paulo, {{data_contrato}}</p>
    <br><br>
    <p>_______________________________________</p>
    <p><strong>CONTRATADA:</strong> WG ALMEIDA REFORMAS ESPECIALIZADAS LTDA</p>
    <br><br>
    <p>_______________________________________</p>
    <p><strong>CONTRATANTE:</strong> {{contratante_nome}}</p>
  </div>
</div>',
  '[
    {"numero": 1, "titulo": "DO OBJETO E DESCRIÇÃO", "tipo": "objeto"},
    {"numero": 2, "titulo": "DO PRAZO PARA EXECUÇÃO DO CONTRATO", "tipo": "prazo"},
    {"numero": 3, "titulo": "DO PREÇO E HONORÁRIOS", "tipo": "preco"},
    {"numero": 4, "titulo": "DA VIGÊNCIA E RESCISÃO CONTRATUAL", "tipo": "rescisao"},
    {"numero": 5, "titulo": "DAS OBRIGAÇÕES DA CONTRATADA", "tipo": "obrigacoes_contratada"},
    {"numero": 6, "titulo": "DAS OBRIGAÇÕES DO CONTRATANTE", "tipo": "obrigacoes_contratante"},
    {"numero": 7, "titulo": "DA ENTREGA DOS SERVIÇOS", "tipo": "entrega"},
    {"numero": 8, "titulo": "DA SOLICITAÇÃO DE SERVIÇOS ADICIONAIS", "tipo": "adicionais"},
    {"numero": 9, "titulo": "DA GARANTIA DOS SERVIÇOS", "tipo": "garantia"},
    {"numero": 10, "titulo": "DA RESCISÃO", "tipo": "rescisao"},
    {"numero": 11, "titulo": "DAS PENALIDADES E MULTAS", "tipo": "penalidades"},
    {"numero": 12, "titulo": "DAS CONDIÇÕES GERAIS", "tipo": "geral"}
  ]'::jsonb,
  '[
    {"id": "contratante_nome", "label": "Nome do Contratante", "tipo": "texto"},
    {"id": "contratante_cpf", "label": "CPF", "tipo": "cpf"},
    {"id": "contratante_rg", "label": "RG", "tipo": "texto"},
    {"id": "contratante_endereco", "label": "Endereço Completo", "tipo": "texto"},
    {"id": "contratante_telefone", "label": "Telefone", "tipo": "telefone"},
    {"id": "contratante_email", "label": "E-mail", "tipo": "email"},
    {"id": "obra_endereco", "label": "Endereço da Obra", "tipo": "texto"},
    {"id": "obra_descricao", "label": "Descrição dos Serviços", "tipo": "texto"},
    {"id": "valor_total", "label": "Valor Total do Contrato", "tipo": "moeda"},
    {"id": "prazo_execucao_dias", "label": "Prazo de Execução (dias úteis)", "tipo": "numero"},
    {"id": "prazo_prorrogacao_dias", "label": "Prazo de Prorrogação (dias)", "tipo": "numero"},
    {"id": "data_contrato", "label": "Data do Contrato", "tipo": "data"}
  ]'::jsonb,
  90,  -- prazo_execucao_padrao em dias úteis
  15,  -- prorrogacao_padrao em dias
  'publicado',
  1,
  '1.0.0',
  true
) ON CONFLICT (codigo) DO UPDATE SET
  nome = EXCLUDED.nome,
  descricao = EXCLUDED.descricao,
  conteudo_html = EXCLUDED.conteudo_html,
  clausulas = EXCLUDED.clausulas,
  variaveis_obrigatorias = EXCLUDED.variaveis_obrigatorias,
  updated_at = NOW();

-- ============================================================
-- Criar índice único para código (se não existir)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE indexname = 'idx_juridico_modelos_contrato_codigo_unique'
  ) THEN
    CREATE UNIQUE INDEX idx_juridico_modelos_contrato_codigo_unique
      ON juridico_modelos_contrato(codigo);
  END IF;
END $$;

-- ============================================================
-- LOG da migration
-- ============================================================
DO $$
BEGIN
  RAISE NOTICE 'Migration 20260108180000_seed_modelos_contrato executada com sucesso!';
  RAISE NOTICE '3 modelos de contrato inseridos/atualizados:';
  RAISE NOTICE '  - MOD-ARQ-001: Contrato de Projeto Arquitetônico';
  RAISE NOTICE '  - MOD-MAR-001: Contrato de Marcenaria';
  RAISE NOTICE '  - MOD-ENG-001: Contrato de Engenharia/Empreitada';
END $$;
