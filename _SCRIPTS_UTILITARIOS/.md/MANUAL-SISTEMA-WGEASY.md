# MANUAL DO SISTEMA WG EASY
## Grupo WG Almeida - Identidade Visual 2026

---

## SUMÁRIO

1. [Visão Geral do Sistema](#1-visão-geral-do-sistema)
2. [Dashboard Principal](#2-dashboard-principal)
3. [Módulo Pessoas](#3-módulo-pessoas)
4. [Módulo Oportunidades](#4-módulo-oportunidades)
5. [Módulo Comercial](#5-módulo-comercial)
6. [Módulo Núcleos](#6-módulo-núcleos)
7. [Módulo Planejamento](#7-módulo-planejamento)
8. [Módulo Cronograma](#8-módulo-cronograma)
9. [Módulo Financeiro](#9-módulo-financeiro)
10. [Módulo Jurídico](#10-módulo-jurídico)
11. [Área WGXperience](#11-área-wgxperience)
12. [Pós-Vendas](#12-pós-vendas)
13. [Onboarding](#13-onboarding)
14. [WG Store](#14-wg-store)
15. [Depósito WG](#15-depósito-wg)
16. [Módulo Sistema](#16-módulo-sistema)
17. [Fluxos de Trabalho](#17-fluxos-de-trabalho)
18. [Integrações](#18-integrações)

---

## 1. VISÃO GERAL DO SISTEMA

### 1.1 Descrição
O **WG Easy** é o sistema de gestão integrada do Grupo WG Almeida, desenvolvido para gerenciar todas as operações da empresa, desde a captação de clientes até a entrega final dos projetos.

### 1.2 Arquitetura
- **Frontend**: React + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Estilização**: Tailwind CSS
- **Gráficos**: Recharts

### 1.3 Cores da Identidade Visual
| Cor | Código | Uso |
|-----|--------|-----|
| Laranja WG | `#F25C26` | Cor principal, botões de ação |
| Verde Mineral | `#5E9B94` | Núcleo Arquitetura |
| Azul Técnico | `#2B4580` | Núcleo Engenharia |
| Marrom Carvalho | `#8B5E3C` | Núcleo Marcenaria |
| Cinza Texto | `#2E2E2E` | Textos principais |
| Cinza Secundário | `#4C4C4C` | Textos secundários |

### 1.4 Tipos de Usuário
| Tipo | Permissões |
|------|-----------|
| MASTER | Acesso total, gerenciamento de comissões de indicados |
| ADMIN | Acesso administrativo completo |
| GESTOR | Gerenciamento de equipes e projetos |
| COLABORADOR | Acesso às funcionalidades operacionais |
| JURIDICO | Acesso ao módulo jurídico e contratos |
| FINANCEIRO | Acesso ao módulo financeiro |

---

## 2. DASHBOARD PRINCIPAL

### 2.1 Acesso
- **Rota**: `/`
- **Ícone**: 📊

### 2.2 Funcionalidades
- Visão geral de métricas da empresa
- KPIs principais (Faturamento, Projetos, Clientes)
- Gráficos de desempenho
- Atalhos rápidos para módulos frequentes

---

## 3. MÓDULO PESSOAS

### 3.1 Acesso
- **Rota Base**: `/pessoas`
- **Ícone**: 👥

### 3.2 Submódulos

#### 3.2.1 Clientes (`/pessoas/clientes`)
**Campos Principais:**
- Nome completo
- CPF/CNPJ
- E-mail e Telefones
- Endereço completo (integração ViaCEP)
- Data de nascimento
- Profissão
- Estado civil
- Foto/Avatar

**Funcionalidades:**
- Cadastro completo de clientes
- Busca e filtros avançados
- Importação em massa via Excel
- Ficha do cliente em PDF
- Histórico de propostas e contratos
- Documentos anexados

#### 3.2.2 Colaboradores (`/pessoas/colaboradores`)
**Campos Principais:**
- Dados pessoais completos
- Cargo e departamento
- Data de admissão
- Dados bancários
- Documentos (RG, CPF, etc.)

**Funcionalidades:**
- Gestão de equipe
- Ficha do colaborador em PDF
- Controle de documentação

#### 3.2.3 Especificadores (`/pessoas/especificadores`)
**Campos Principais:**
- Dados cadastrais
- Área de atuação
- Comissão por indicação
- Vínculo com MASTER (para comissionamento)

**Funcionalidades:**
- Cadastro de arquitetos, designers e especificadores
- Sistema de indicação com comissionamento
- Rastreamento de clientes indicados

#### 3.2.4 Fornecedores (`/pessoas/fornecedores`)
**Campos Principais:**
- Razão social / Nome
- CNPJ
- Contatos
- Categorias de fornecimento

**Funcionalidades:**
- Catálogo de fornecedores
- Áreas de atuação
- Histórico de compras

### 3.3 Painel da Pessoa (`/pessoas/:tipo/:id`)
Cada pessoa possui um painel completo com abas:
- **Info**: Dados cadastrais
- **Documentos**: Arquivos anexados
- **Propostas**: Propostas vinculadas
- **Contratos**: Contratos ativos
- **Obras**: Projetos em andamento
- **Histórico**: Timeline de atividades

---

## 4. MÓDULO OPORTUNIDADES

### 4.1 Acesso
- **Rota**: `/oportunidades`
- **Ícone**: 🎯

### 4.2 Visão Kanban
O módulo utiliza um quadro Kanban com estágios:

| Estágio | Descrição |
|---------|-----------|
| Lead | Primeiro contato |
| Qualificação | Análise de perfil |
| Proposta | Proposta em elaboração |
| Negociação | Negociação ativa |
| Fechamento | Aguardando assinatura |
| Ganho | Oportunidade convertida |
| Perdido | Oportunidade não convertida |

### 4.3 Funcionalidades
- Arrastar e soltar cards entre estágios
- Filtros por núcleo (Arquitetura, Engenharia, Marcenaria)
- Modal de detalhes com edição inline
- Checklist de tarefas por oportunidade
- Valor estimado por núcleo
- Previsão de fechamento
- Vinculação com cliente

### 4.4 Checklist de Oportunidades
Sistema de verificação para garantir qualidade:
- Itens obrigatórios e opcionais
- Percentual de conclusão
- Bloqueio de avanço sem itens obrigatórios

---

## 5. MÓDULO COMERCIAL

### 5.1 Acesso
- **Ícone**: 💼
- **Itens máximos visíveis**: 3

### 5.2 Submódulos

#### 5.2.1 Análise de Projeto (`/analise-projeto`)
**Funcionalidades:**
- Análise técnica com IA
- Upload de plantas e documentos
- Avaliação de viabilidade
- Sugestões de escopo

#### 5.2.2 Propostas (`/propostas`)
**Campos:**
- Número da proposta (automático)
- Cliente vinculado
- Itens da proposta
- Valores por núcleo
- Condições de pagamento
- Validade

**Status da Proposta:**
| Status | Cor |
|--------|-----|
| Rascunho | Cinza |
| Enviada | Azul |
| Aprovada | Verde |
| Recusada | Vermelho |
| Expirada | Amarelo |

**Funcionalidades:**
- Geração de PDF profissional
- Envio por e-mail
- Aprovação online pelo cliente
- Conversão automática em contrato

#### 5.2.3 Contratos (`/contratos`)
**Campos:**
- Número do contrato (automático)
- Cliente
- Unidade de negócio (núcleo)
- Valor total
- Especificador (opcional - para comissão)
- Status

**Status do Contrato:**
| Status | Descrição |
|--------|-----------|
| Rascunho | Em elaboração |
| Aguardando Assinatura | Enviado para cliente |
| Ativo | Assinado e em execução |
| Em Execução | Obra iniciada |
| Concluído | Projeto entregue |
| Cancelado | Contrato cancelado |

**Funcionalidades:**
- Listagem com filtros
- Estatísticas (total, ativos, valor)
- Emissão automática de contrato (integração Jurídico)
- Botão "Emitir Contrato" - identifica núcleo e busca modelo automaticamente

---

## 6. MÓDULO NÚCLEOS

### 6.1 Acesso
- **Ícone**: 🏗️
- **Itens máximos visíveis**: 3

### 6.2 Núcleo Arquitetura (`/oportunidades/kanban/arquitetura`)
**Cor**: Verde Mineral `#5E9B94`

**Escopo:**
- Projetos arquitetônicos
- Design de interiores
- Paisagismo
- Regularização

### 6.3 Núcleo Engenharia (`/oportunidades/kanban/engenharia`)
**Cor**: Azul Técnico `#2B4580`

**Escopo:**
- Construção civil
- Reformas estruturais
- Instalações
- Gerenciamento de obras

### 6.4 Núcleo Marcenaria (`/oportunidades/kanban/marcenaria`)
**Cor**: Marrom Carvalho `#8B5E3C`

**Escopo:**
- Móveis planejados
- Marcenaria sob medida
- Ambientes personalizados

### 6.5 Funcionalidades por Núcleo
- Kanban específico do núcleo
- Filtro de oportunidades por núcleo
- Obras vinculadas
- Cronograma específico

---

## 7. MÓDULO PLANEJAMENTO

### 7.1 Acesso
- **Ícone**: 📋
- **Itens máximos visíveis**: 6

### 7.2 Submódulos

#### 7.2.1 Orçamento de Materiais (`/planejamento/orcamentos/materiais`)
**Funcionalidades:**
- Catálogo de materiais
- Preços atualizados
- Histórico de variação
- Importação de lista

#### 7.2.2 Composições (`/planejamento/orcamentos/composicoes`)
**Funcionalidades:**
- Composições de custo unitário
- Materiais + Mão de obra + Equipamentos
- Cálculo automático
- Templates reutilizáveis

#### 7.2.3 Modelos de Orçamento (`/planejamento/orcamentos/modelos`)
**Funcionalidades:**
- Templates pré-definidos
- Orçamentos por tipo de projeto
- Cópia e personalização

#### 7.2.4 Orçamentos (`/planejamento/orcamentos`)
**Funcionalidades:**
- Criação de orçamentos detalhados
- Vinculação com oportunidades
- Cálculo com BDI
- Exportação em PDF/Excel

#### 7.2.5 Aprovações (`/planejamento/aprovacoes`)
**Funcionalidades:**
- Workflow de aprovação
- Níveis hierárquicos
- Notificações
- Histórico de aprovações

#### 7.2.6 Compras (`/compras`)
**Funcionalidades:**
- Solicitações de compra
- Cotações com fornecedores
- Aprovação de pedidos
- Rastreamento de entregas
- Kanban de compras
- Importação de produtos

---

## 8. MÓDULO CRONOGRAMA

### 8.1 Acesso
- **Rota**: `/cronograma`
- **Ícone**: 📅

### 8.2 Visões Disponíveis

#### 8.2.1 Dashboard (`/cronograma`)
- Visão geral de todos os projetos
- Indicadores de atraso
- Próximas entregas

#### 8.2.2 Projetos (`/cronograma/projects`)
**Funcionalidades:**
- Lista de projetos ativos
- Status e progresso
- Timeline de marcos
- Detalhamento de tarefas

#### 8.2.3 Kanban de Tarefas (`/cronograma/kanban`)
**Colunas:**
- A Fazer
- Em Andamento
- Em Revisão
- Concluído

#### 8.2.4 Timeline (`/cronograma/timeline`)
**Funcionalidades:**
- Gráfico de Gantt
- Dependências entre tarefas
- Caminho crítico
- Alocação de recursos

### 8.3 Funcionalidades Avançadas
- Cálculo de caminho crítico
- Dias úteis (excluindo feriados)
- Integração com financeiro
- Exportação de cronograma

---

## 9. MÓDULO FINANCEIRO

### 9.1 Acesso
- **Rota**: `/financeiro`
- **Ícone**: 💰
- **Itens máximos visíveis**: 7

### 9.2 Submódulos

#### 9.2.1 Dashboard Financeiro (`/financeiro`)
**KPIs:**
- Receita Total
- Despesa Total
- Lucro / Resultado
- Margem (%)

**Gráficos:**
- Curva S (Acumulado receitas x despesas)
- Despesas por Centro de Custo
- Fluxo de caixa mensal

#### 9.2.2 Projetos (`/financeiro/obras`)
**Funcionalidades:**
- Controle financeiro por projeto/obra
- Orçado x Realizado
- Margens por projeto
- Centro de custo

#### 9.2.3 Lançamentos (`/financeiro/lancamentos`)
**Tipos:**
- Entrada (receitas)
- Saída (despesas)

**Campos:**
- Data de vencimento
- Data de pagamento
- Valor
- Categoria
- Centro de custo
- Forma de pagamento
- Status (pendente, pago, atrasado)

#### 9.2.4 SDP - Solicitações (`/financeiro/solicitacoes`)
**Funcionalidades:**
- Solicitação de pagamento
- Aprovação multinível
- Anexo de comprovantes
- Workflow de liberação

#### 9.2.5 Reembolsos (`/financeiro/reembolsos`)
**Funcionalidades:**
- Solicitação de reembolso por colaborador
- Upload de comprovantes
- Aprovação por gestor
- Pagamento via folha ou avulso

#### 9.2.6 Cobranças (`/financeiro/cobrancas`)
**Funcionalidades:**
- Parcelas a receber
- Notificação de vencimento
- Registro de recebimento
- Relatório de inadimplência

#### 9.2.7 Relatórios (`/financeiro/relatorios`)
**Relatórios Disponíveis:**
- DRE (Demonstração de Resultados)
- Fluxo de Caixa
- Contas a Pagar/Receber
- Rentabilidade por Projeto

#### 9.2.8 Comissões (`/financeiro/comissionamento`)
**Funcionalidades:**
- Cálculo de comissões por venda
- Faixas de VGV (Volume Geral de Vendas)
- Categorias de comissão por cargo
- Comissão de indicação (Especificador → Master)

**Sistema de Comissões:**
```
┌─────────────────────────────────────────────────────────────┐
│                    FLUXO DE COMISSÕES                       │
├─────────────────────────────────────────────────────────────┤
│  VENDA FECHADA                                              │
│       │                                                     │
│       ▼                                                     │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐   │
│  │ Vendedor    │────▶│ Especific.  │────▶│   Master    │   │
│  │ (% direto)  │     │ (% indica.) │     │ (% cascade) │   │
│  └─────────────┘     └─────────────┘     └─────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 10. MÓDULO JURÍDICO

### 10.1 Acesso
- **Rota**: `/juridico`
- **Ícone**: ⚖️

### 10.2 Submódulos

#### 10.2.1 Dashboard Jurídico (`/juridico`)
**Funcionalidades:**
- Contratos ativos
- Clientes com contratos
- Filtros por núcleo e status
- Busca por cliente

**Informações Exibidas:**
- Lista de clientes com contratos
- Valor total por cliente
- Status dos contratos
- Ações rápidas (visualizar, editar)

#### 10.2.2 Empresas do Grupo WG (`/juridico/empresas`)
**Funcionalidades:**
- Cadastro de empresas do grupo
- CNPJ, Razão Social, Nome Fantasia
- Dados bancários
- Responsáveis legais
- Documentos societários

#### 10.2.3 Modelos de Contrato (`/juridico/modelos`)
**Funcionalidades:**
- Criação de templates de contrato
- Variáveis dinâmicas
- Versionamento
- Publicação por núcleo

**Variáveis Disponíveis:**
| Variável | Descrição |
|----------|-----------|
| `{{empresa.nome}}` | Nome da empresa contratada |
| `{{empresa.cnpj}}` | CNPJ da empresa |
| `{{pessoa.nome}}` | Nome do cliente |
| `{{pessoa.cpf}}` | CPF do cliente |
| `{{contrato.numero}}` | Número do contrato |
| `{{contrato.valor}}` | Valor total |
| `{{data.atual}}` | Data de geração |

### 10.3 Fluxo de Emissão de Contrato
```
┌─────────────────────────────────────────────────────────────┐
│              FLUXO: EMISSÃO DE CONTRATO                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Contrato Criado (Comercial)                            │
│           │                                                 │
│           ▼                                                 │
│  2. Identificar Núcleo (automático)                        │
│           │                                                 │
│           ▼                                                 │
│  3. Buscar Modelo Publicado do Núcleo                      │
│           │                                                 │
│           ▼                                                 │
│  4. Substituir Variáveis                                   │
│           │                                                 │
│           ▼                                                 │
│  5. Gerar Documento Final                                  │
│           │                                                 │
│           ▼                                                 │
│  6. Abrir para Impressão/Download                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 11. ÁREA WGXPERIENCE

### 11.1 Acesso
- **Ícone**: ⭐

### 11.2 Submódulos

#### 11.2.1 Portal do Cliente (`/portal-cliente`)
**Funcionalidades:**
- Área exclusiva do cliente
- Acompanhamento de obra
- Documentos compartilhados
- Comunicação direta
- Aprovações online

#### 11.2.2 Cadastro de Clientes (`/sistema/area-cliente/clientes`)
**Funcionalidades:**
- Liberação de acesso ao portal
- Credenciais do cliente
- Configurações de visualização

#### 11.2.3 Drive Compartilhado (`/sistema/area-cliente/drive`)
**Funcionalidades:**
- Upload de arquivos para cliente
- Organização por pastas
- Controle de acesso
- Histórico de downloads

---

## 12. PÓS-VENDAS

### 12.1 Acesso
- **Ícone**: 🛠️
- **Itens máximos visíveis**: 3

### 12.2 Submódulos

#### 12.2.1 Assistência (`/assistencia`)
**Funcionalidades:**
- Solicitações de assistência técnica
- Kanban de atendimentos
- Categorização por tipo
- Prazo de resolução
- Histórico por cliente

**Status:**
- Aberta
- Em Atendimento
- Aguardando Peça
- Resolvida
- Encerrada

#### 12.2.2 Termo de Aceite (`/termo-aceite`)
**Funcionalidades:**
- Geração de termo de entrega
- Assinatura digital
- Fotos do estado de entrega
- Ressalvas do cliente

#### 12.2.3 Garantia (`/garantia`)
**Funcionalidades:**
- Controle de garantias
- Prazos por item
- Solicitações de garantia
- Histórico de manutenções

---

## 13. ONBOARDING

### 13.1 Acesso
- **Rota**: `/onboarding`
- **Ícone**: 🚀

### 13.2 Funcionalidades
- Jornada do novo cliente
- Etapas de integração
- Documentos necessários
- Checklist de boas-vindas
- Apresentação da equipe

---

## 14. WG STORE

### 14.1 Acesso
- **Ícone**: 🛒

### 14.2 Submódulos

#### 14.2.1 Loja Virtual (`/wg-store`)
**Funcionalidades:**
- Catálogo de produtos
- Acabamentos e materiais
- Preços atualizados
- Carrinho de compras
- Pedidos

#### 14.2.2 Memorial de Acabamentos (`/memorial-acabamentos`)
**Funcionalidades:**
- Criação de memorial descritivo
- Especificações por ambiente
- Imagens de referência
- Aprovação do cliente

---

## 15. DEPÓSITO WG

### 15.1 Acesso
- **Rota**: `/deposito`
- **Ícone**: 📦

### 15.2 Funcionalidades
- Controle de estoque
- Entrada e saída de materiais
- Inventário
- Localização de itens
- Requisições de material
- Transferências entre obras

---

## 16. MÓDULO SISTEMA

### 16.1 Acesso
- **Ícone**: 🔧
- **Itens máximos visíveis**: 12

### 16.2 Submódulos

#### 16.2.1 Cadastros Pendentes (`/sistema/cadastros-pendentes`)
- Aprovação de novos cadastros
- Revisão de dados incompletos

#### 16.2.2 Central de Links (`/sistema/central-links`)
- Links úteis da empresa
- Atalhos para sistemas externos
- Documentação

#### 16.2.3 Central Import/Export (`/sistema/importar-exportar`)
- Importação de dados em massa
- Exportação de relatórios
- Backup de informações

#### 16.2.4 Empresas do Grupo WG (`/empresas`)
- Cadastro de empresas
- Dados fiscais e bancários

#### 16.2.5 Modelos de Contrato (`/modelos-contrato`)
- Templates de contratos
- Versionamento

#### 16.2.6 Planta do Sistema (`/sistema/planta`)
- Mapa de funcionalidades
- Arquitetura do sistema

#### 16.2.7 Precificação (`/sistema/precificacao`)
- Configuração de preços
- Markup e BDI
- Regras de precificação

#### 16.2.8 Price List (`/pricelist`)
**Funcionalidades:**
- Catálogo de preços
- Categorias e subcategorias
- Importação via Excel
- Atualização em massa

#### 16.2.9 Saúde do Sistema (`/sistema/saude`)
- Monitoramento de performance
- Logs de erro
- Status de integrações
- Métricas de uso

#### 16.2.10 Templates de Checklists (`/sistema/checklists`)
- Modelos de checklist
- Configuração por tipo de projeto
- Itens obrigatórios

#### 16.2.11 Usuários (`/usuarios`)
**Funcionalidades:**
- Cadastro de usuários
- Tipos e permissões
- Reset de senha
- Histórico de acesso

### 16.3 Sessão (`/logout`)
- **Ícone**: 🚪
- Encerramento de sessão
- Logout seguro

---

## 17. FLUXOS DE TRABALHO

### 17.1 Fluxo Comercial Completo
```
┌─────────────────────────────────────────────────────────────────┐
│                    JORNADA DO CLIENTE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  CAPTAÇÃO                                                        │
│  ────────                                                        │
│  1. Lead recebido (site, indicação, presencial)                 │
│  2. Cadastro na tabela PESSOAS (tipo: cliente)                  │
│  3. Criação de OPORTUNIDADE vinculada                           │
│                                                                  │
│  QUALIFICAÇÃO                                                    │
│  ────────────                                                    │
│  4. Análise de projeto (upload de plantas)                      │
│  5. Definição de núcleos envolvidos                             │
│  6. Orçamento preliminar                                        │
│                                                                  │
│  PROPOSTA                                                        │
│  ────────                                                        │
│  7. Criação da PROPOSTA detalhada                               │
│  8. Aprovação interna                                           │
│  9. Envio ao cliente                                            │
│  10. Negociação (ajustes de escopo/valor)                       │
│                                                                  │
│  FECHAMENTO                                                      │
│  ──────────                                                      │
│  11. Aprovação da proposta pelo cliente                         │
│  12. Geração do CONTRATO                                        │
│  13. Vinculação com especificador (se houver)                   │
│  14. Emissão de contrato via Jurídico                           │
│  15. Assinatura digital                                         │
│                                                                  │
│  EXECUÇÃO                                                        │
│  ────────                                                        │
│  16. Criação do projeto no CRONOGRAMA                           │
│  17. Lançamentos no FINANCEIRO                                  │
│  18. Acompanhamento via WGXperience                             │
│                                                                  │
│  ENTREGA                                                         │
│  ───────                                                         │
│  19. Termo de aceite                                            │
│  20. Ativação da garantia                                       │
│  21. Pós-venda                                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 17.2 Fluxo de Compras
```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUXO DE COMPRAS                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Necessidade identificada (obra/projeto)                     │
│           │                                                      │
│           ▼                                                      │
│  2. Solicitação de compra criada                                │
│           │                                                      │
│           ▼                                                      │
│  3. Aprovação do gestor                                         │
│           │                                                      │
│           ▼                                                      │
│  4. Cotação com fornecedores                                    │
│           │                                                      │
│           ▼                                                      │
│  5. Seleção do melhor preço                                     │
│           │                                                      │
│           ▼                                                      │
│  6. Pedido de compra gerado                                     │
│           │                                                      │
│           ▼                                                      │
│  7. Acompanhamento de entrega                                   │
│           │                                                      │
│           ▼                                                      │
│  8. Recebimento e conferência                                   │
│           │                                                      │
│           ▼                                                      │
│  9. Lançamento financeiro                                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 17.3 Fluxo de Reembolso
```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUXO DE REEMBOLSO                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Colaborador realiza despesa                                 │
│           │                                                      │
│           ▼                                                      │
│  2. Cadastra reembolso no sistema                               │
│     - Valor                                                      │
│     - Categoria                                                  │
│     - Comprovante (foto/PDF)                                    │
│     - Justificativa                                             │
│           │                                                      │
│           ▼                                                      │
│  3. Gestor analisa e aprova/rejeita                             │
│           │                                                      │
│           ▼                                                      │
│  4. Se aprovado → Financeiro agenda pagamento                   │
│           │                                                      │
│           ▼                                                      │
│  5. Pagamento realizado                                         │
│           │                                                      │
│           ▼                                                      │
│  6. Colaborador confirma recebimento                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 18. INTEGRAÇÕES

### 18.1 APIs Externas

#### 18.1.1 ViaCEP
- Busca automática de endereço por CEP
- Preenchimento de cidade, estado, bairro, logradouro

#### 18.1.2 ReceitaWS (CNPJ)
- Consulta de dados empresariais
- Validação de CNPJ
- Preenchimento automático de razão social

#### 18.1.3 Supabase Storage
- Armazenamento de arquivos
- Fotos de perfil
- Documentos anexados
- Plantas e projetos

### 18.2 Autenticação
- Supabase Auth
- Login por e-mail/senha
- Controle de sessão
- Níveis de permissão

### 18.3 Geração de Documentos
- PDF de propostas
- PDF de contratos
- Fichas de cliente/colaborador
- Relatórios financeiros

---

## TABELAS DO BANCO DE DADOS (Principais)

| Tabela | Descrição |
|--------|-----------|
| `pessoas` | Clientes, colaboradores, fornecedores, especificadores |
| `oportunidades` | Oportunidades comerciais |
| `oportunidades_nucleos` | Núcleos vinculados às oportunidades |
| `propostas` | Propostas comerciais |
| `contratos` | Contratos ativos |
| `financeiro` | Lançamentos financeiros |
| `financeiro_reembolsos` | Solicitações de reembolso |
| `financeiro_cobrancas` | Cobranças e parcelas |
| `projetos` | Projetos de cronograma |
| `tarefas` | Tarefas dos projetos |
| `compras` | Pedidos de compra |
| `assistencias` | Chamados de assistência |
| `juridico_modelos_contrato` | Templates de contratos |
| `empresas` | Empresas do grupo |
| `usuarios` | Usuários do sistema |
| `categorias_comissao` | Categorias para comissionamento |
| `faixas_vgv` | Faixas de volume de vendas |
| `percentuais_comissao` | Percentuais por faixa/categoria |

---

## CONTATO E SUPORTE

**Sistema WG Easy**
Grupo WG Almeida

Para suporte técnico, entre em contato com a equipe de TI.

---

*Documento gerado em: Dezembro/2024*
*Versão: 2026.1*
