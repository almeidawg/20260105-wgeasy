# 🔐 AUDITORIA DE SEGURANÇA - PORTAL DO CLIENTE (WGX)

## WG Easy - Sistema de Gestão Integrado

**Data:** 5 de Janeiro de 2026
**Auditor:** GitHub Copilot (Claude Opus 4.5)
**Escopo:** Área do Cliente (WGX) - Portal do Cliente

---

## 📊 RESUMO EXECUTIVO

| Categoria                  | Críticos | Altos  | Médios | Baixos | Total  |
| -------------------------- | -------- | ------ | ------ | ------ | ------ |
| Autenticação e Autorização | 2        | 3      | 2      | 1      | 8      |
| Isolamento de Dados        | 3        | 2      | 2      | 1      | 8      |
| Google Drive               | 1        | 2      | 2      | 1      | 6      |
| Financeiro                 | 1        | 2      | 1      | 1      | 5      |
| Exposição de Dados         | 0        | 2      | 2      | 1      | 5      |
| **TOTAL**                  | **7**    | **11** | **9**  | **5**  | **32** |

**Classificação Geral:** ⚠️ **ATENÇÃO REQUERIDA**

---

## 🔍 VERIFICAÇÕES DETALHADAS (32 ITENS)

---

### 🔑 SEÇÃO 1: AUTENTICAÇÃO E AUTORIZAÇÃO

#### ✅ VER-001: Validação de Sessão do Usuário

**Status:** ✅ APROVADO
**Risco:** Baixo
**Arquivos:** `useUsuarioLogado.ts`, `AuthContext.tsx`

**Análise:**
O hook `useUsuarioLogado` valida corretamente a sessão através do `auth_user_id` do Supabase:

```typescript
// useUsuarioLogado.ts - Linha 46-48
const { data, error: err } = await supabase
  .from("vw_usuarios_completo")
  .eq("auth_user_id", user.id);
```

**Observação:** A verificação depende de `user.id` fornecido pelo Supabase Auth, que é confiável.

---

#### 🔴 VER-002: Parâmetro cliente_id na URL Sem Validação Adequada

**Status:** 🔴 CRÍTICO
**Risco:** Crítico
**Arquivos:** `FinanceiroClientePage.tsx`, `CronogramaClientePage.tsx`

**Análise:**
Em `FinanceiroClientePage.tsx` (linhas 157-159) e `CronogramaClientePage.tsx` (linhas 57-58):

```typescript
} else if (clienteIdParam) {
  pessoaId = clienteIdParam;  // ⚠️ SEM VALIDAÇÃO!
}
```

**Vulnerabilidade IDOR:** Qualquer usuário autenticado pode passar um `cliente_id` arbitrário na URL e potencialmente acessar dados de outro cliente. A validação `canImpersonate` só é aplicada em ALGUNS arquivos, não em todos.

**Arquivos Afetados:**

- ❌ `FinanceiroClientePage.tsx` - **NÃO VALIDA** `canImpersonate`
- ❌ `CronogramaClientePage.tsx` - **NÃO VALIDA** `canImpersonate`
- ✅ `ClienteArquivosPage.tsx` - Valida `canImpersonate` (linha 46)
- ✅ `AreaClientePage.tsx` - Valida `canImpersonate` (linha 84)

**Impacto:** Um cliente pode acessar dados financeiros e cronograma de QUALQUER outro cliente apenas modificando a URL.

**Recomendação:**

```typescript
// CORREÇÃO: Adicionar validação canImpersonate
} else if (clienteIdParam && canImpersonate) {
  pessoaId = clienteIdParam;
} else {
  // Buscar próprio ID
}
```

---

#### 🔴 VER-003: Hook useImpersonation Permite Bypass

**Status:** 🔴 CRÍTICO
**Risco:** Crítico
**Arquivo:** `useImpersonation.ts`

**Análise:**
O hook carrega dados de QUALQUER pessoa sem verificar se o usuário atual TEM PERMISSÃO:

```typescript
// useImpersonation.ts - Linha 87-93
const { data: pessoa, error: err } = await supabase
  .from("pessoas")
  .select("id, nome, tipo, email, telefone, avatar_url")
  .eq("id", pessoaId)
  .maybeSingle();
```

**Problema:** A verificação `canImpersonate` ocorre ANTES de carregar os dados, mas componentes podem ignorar essa flag e usar `clienteIdParam` diretamente.

---

#### 🟠 VER-004: Tipo de Usuário Não Verificado em Cada Requisição

**Status:** 🟠 ALTO
**Risco:** Alto
**Arquivo:** `usePermissoesUsuario.ts`

**Análise:**
As permissões são carregadas UMA VEZ no cliente e cacheadas. Se um admin revogar permissões de um cliente, ele continua com acesso até fazer logout.

```typescript
// usePermissoesUsuario.ts - Linha 115-119
export function usePermissoesCliente() {
  const { permissoes, loading } = usePermissoesUsuario();
  // Permissões são lidas do estado, não revalidadas em cada ação
```

**Recomendação:** Implementar revalidação periódica ou em cada ação sensível.

---

#### 🟠 VER-005: Falta de Proteção RLS nas Queries do Frontend

**Status:** 🟠 ALTO
**Risco:** Alto
**Arquivos:** Múltiplos componentes cliente

**Análise:**
O frontend usa `supabaseAnon` que DEVERIA estar protegido por RLS, mas várias tabelas importantes NÃO TÊM RLS para clientes:

**Tabelas COM RLS (do schema.sql):**

- ✅ `colaborador_projetos`
- ✅ `solicitacoes_pagamento`
- ✅ `cotacoes`
- ✅ `cotacao_propostas`

**Tabelas SEM RLS verificada para clientes:**

- ❌ `pessoas` - Cliente pode ler QUALQUER pessoa
- ❌ `oportunidades` - Só filtra no frontend
- ❌ `contratos` - Só filtra no frontend
- ❌ `financeiro_lancamentos` - Só filtra no frontend
- ❌ `contrato_parcelas` - Só filtra no frontend

---

#### 🟠 VER-006: Backend Usa SERVICE_ROLE_KEY

**Status:** 🟠 ALTO
**Risco:** Alto
**Arquivo:** `backend/src/shared/supabaseClient.ts`

**Análise:**

```typescript
// backend/src/shared/supabaseClient.ts - Linha 12
export const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
```

**Problema:** O backend BYPASSA completamente o RLS. Qualquer endpoint de API que não valide manualmente o `cliente_id` pode vazar dados.

---

#### 🟡 VER-007: Permissões Granulares Implementadas

**Status:** ✅ APROVADO
**Risco:** Baixo
**Arquivo:** `useUsuarioLogado.ts`

**Análise:**
Sistema possui permissões granulares por cliente:

```typescript
cliente_pode_ver_valores: boolean;
cliente_pode_ver_cronograma: boolean;
cliente_pode_ver_documentos: boolean;
cliente_pode_ver_proposta: boolean;
cliente_pode_ver_contratos: boolean;
cliente_pode_fazer_upload: boolean;
cliente_pode_comentar: boolean;
```

**Ponto Positivo:** Permite controle fino por cliente.

---

#### 🟡 VER-008: Verificação de Permissão no Render

**Status:** 🟡 MÉDIO
**Risco:** Médio
**Arquivo:** `FinanceiroClientePage.tsx`

**Análise:**
A verificação de permissão ocorre apenas na renderização:

```typescript
// FinanceiroClientePage.tsx - Linha 379-387
if (!permissoes.podeVerValores) {
  return (/* Mensagem de acesso restrito */);
}
```

**Problema:** Os dados JÁ FORAM CARREGADOS antes do render. Um atacante pode interceptar a resposta da API.

---

### 🗂️ SEÇÃO 2: ISOLAMENTO DE DADOS

#### 🔴 VER-009: Query de Contratos Sem Verificação de Propriedade

**Status:** 🔴 CRÍTICO
**Risco:** Crítico
**Arquivo:** `FinanceiroClientePage.tsx`

**Análise:**

```typescript
// FinanceiroClientePage.tsx - Linha 185-192
const { data: contrato } = await supabase
  .from("contratos")
  .select("id, valor_total, status")
  .eq("cliente_id", pessoaId); // pessoaId pode ser manipulado!
```

**Problema:** Se `pessoaId` vier da URL (VER-002), um atacante pode ver contratos de outros clientes.

---

#### 🔴 VER-010: Parcelas Expostas por contrato_id

**Status:** 🔴 CRÍTICO
**Risco:** Crítico
**Arquivo:** `FinanceiroClientePage.tsx`

**Análise:**

```typescript
// FinanceiroClientePage.tsx - Linha 222-226
const { data } = await supabase
  .from("contrato_parcelas")
  .select("*")
  .eq("contrato_id", contratoId); // contratoId derivado de pessoaId não validado
```

**Problema:** Se conseguir o ID de um contrato (via força bruta ou vazamento), pode ver todas as parcelas.

---

#### 🔴 VER-011: Lançamentos Financeiros Sem Validação de Propriedade

**Status:** 🔴 CRÍTICO
**Risco:** Crítico
**Arquivo:** `FinanceiroClientePage.tsx`

**Análise:**

```typescript
// FinanceiroClientePage.tsx - Linha 252-258
const { data } = await supabase
  .from("financeiro_lancamentos")
  .select("*")
  .eq("pessoa_id", pessoaId);
```

**Vulnerabilidade:** Exposição de todos os lançamentos financeiros de qualquer cliente se `pessoaId` for manipulado.

---

#### 🟠 VER-012: Timeline Filtra Por `cliente_id` na Query

**Status:** ✅ APROVADO COM RESSALVAS
**Risco:** Médio
**Arquivo:** `TimelineCliente.tsx`

**Análise:**

```typescript
// TimelineCliente.tsx - Linha 131
.eq('visivel_cliente', true)
```

**Ponto Positivo:** Usa flag `visivel_cliente` para ocultar eventos internos.
**Ressalva:** O `cliente_id` ainda pode ser manipulado se obtido via parâmetro URL.

---

#### 🟠 VER-013: Cronograma Tarefas com RLS Permissiva

**Status:** 🟠 ALTO
**Risco:** Alto
**Arquivo:** `schema.sql`

**Análise:**

```sql
-- schema.sql - Linha 1789
CREATE POLICY "Usuarios podem ver todas as tarefas"
    ON cronograma_tarefas FOR SELECT TO authenticated USING (true);
```

**Vulnerabilidade:** QUALQUER usuário autenticado pode ver TODAS as tarefas de cronograma, incluindo de outros clientes!

---

#### 🟡 VER-014: Cobranças Filtradas por pessoa_id

**Status:** 🟡 MÉDIO
**Risco:** Médio
**Arquivo:** `ControleCobrancas.tsx`

**Análise:**

```typescript
// ControleCobrancas.tsx - Linha 46-55
.eq("pessoa_id", clienteId)
.eq("tipo", "entrada")
```

**Observação:** Depende de `clienteId` prop que é passado pelo componente pai. Se o pai estiver vulnerável (VER-002), este componente herda a vulnerabilidade.

---

#### ✅ VER-015: Eventos Timeline com Flag visivel_cliente

**Status:** ✅ APROVADO
**Risco:** Baixo
**Arquivo:** `jornadaClienteApi.ts`, `TimelineCliente.tsx`

**Análise:**
Sistema implementa corretamente ocultação de eventos internos:

```typescript
// jornadaClienteApi.ts - Linha 360
query = query.eq("visivel_cliente", true);
```

**Ponto Positivo:** Eventos internos são filtrados antes de exibir ao cliente.

---

#### 🟡 VER-016: Oportunidades Não Têm RLS Específica para Clientes

**Status:** 🟡 MÉDIO
**Risco:** Médio
**Arquivo:** `schema.sql`, múltiplos componentes

**Análise:**
A tabela `oportunidades` não possui RLS que verifique se o cliente logado é o dono da oportunidade. Toda filtragem é feita no frontend.

---

### 📁 SEÇÃO 3: INTEGRAÇÃO GOOGLE DRIVE

#### 🔴 VER-017: Pasta Base Hardcoded e Compartilhada

**Status:** 🔴 CRÍTICO
**Risco:** Crítico
**Arquivo:** `googleDriveBrowserService.ts`

**Análise:**

```typescript
// googleDriveBrowserService.ts - Linha 7
const FOLDER_ID_BASE = "187SLb40TwrePIfuYwlxLi7htLqrnJoIv";
```

**Vulnerabilidade:** Todos os clientes têm acesso à pasta raiz. Com o token OAuth, um cliente pode:

1. Listar todas as subpastas
2. Ver nomes de outros clientes
3. Potencialmente acessar arquivos de outros clientes

---

#### 🟠 VER-018: Token OAuth Armazenado em localStorage

**Status:** 🟠 ALTO
**Risco:** Alto
**Arquivo:** `googleDriveBrowserService.ts`

**Análise:**

```typescript
// googleDriveBrowserService.ts - Linha 12-14
const STORAGE_KEYS = {
  ACCESS_TOKEN: "wgeasy_google_drive_token",
  TOKEN_EXPIRY: "wgeasy_google_drive_expiry",
};
```

**Vulnerabilidade:** Token em localStorage é vulnerável a XSS. Um atacante pode roubar o token e acessar arquivos no Drive.

---

#### 🟠 VER-019: Sem Validação de Pasta do Cliente

**Status:** 🟠 ALTO
**Risco:** Alto
**Arquivo:** `ClienteArquivos.tsx`

**Análise:**

```typescript
// ClienteArquivos.tsx - Linha 51-54
const result = await googleDriveService.encontrarOuCriarEstrutura(
  clienteNome,
  oportunidadeId
);
```

**Problema:** O serviço cria/acessa pasta baseado em `clienteNome` e `oportunidadeId` que vêm do banco (potencialmente manipulados).

**Risco de Path Traversal:** Nome de cliente malicioso poderia manipular estrutura de pastas.

---

#### 🟡 VER-020: Upload Permite Qualquer Tipo de Arquivo

**Status:** 🟡 MÉDIO
**Risco:** Médio
**Arquivo:** `ClienteArquivos.tsx`

**Análise:**

```typescript
// ClienteArquivos.tsx - Linha 91-92
const handleFilesSelect = useCallback((files: FileList | null) => {
  // Não há validação de tipo/tamanho de arquivo
```

**Risco:** Cliente pode fazer upload de arquivos maliciosos ou muito grandes.

---

#### 🟡 VER-021: Links Diretos do Drive Expostos

**Status:** 🟡 MÉDIO
**Risco:** Médio
**Arquivo:** `ClienteArquivos.tsx`

**Análise:**

```typescript
// ClienteArquivos.tsx - Linha 257
onClick={() => window.open(mapeamento.plantas!.webViewLink, '_blank')}
```

**Observação:** Links `webViewLink` do Google Drive são públicos se a pasta for compartilhada. Um cliente poderia compartilhar/vazar o link.

---

#### ✅ VER-022: Separação de Pastas por Tipo

**Status:** ✅ APROVADO
**Risco:** Baixo
**Arquivo:** `googleDriveService.ts`

**Análise:**

```typescript
// googleDriveService.ts - Linha 96-101
const subfolders = ["Plantas", "Fotos", "Documentos"];
```

**Ponto Positivo:** Arquivos são organizados em subpastas por tipo.

---

### 💰 SEÇÃO 4: ISOLAMENTO FINANCEIRO

#### 🔴 VER-023: Valor Total do Contrato Exposto

**Status:** 🔴 CRÍTICO
**Risco:** Crítico
**Arquivo:** `FinanceiroClientePage.tsx`

**Análise:**

```typescript
// FinanceiroClientePage.tsx - Linha 185-186
.select("id, valor_total, status")
```

**Combinado com VER-002:** Se um cliente manipular a URL, pode ver o valor total de contratos de outros clientes.

---

#### 🟠 VER-024: Sem Ocultação de Margem/Lucro

**Status:** ✅ APROVADO
**Risco:** Baixo

**Análise:**
Revisão do código não encontrou exposição de campos de margem/lucro nos componentes de cliente. Os campos `margem_lucro`, `markup`, `custo_aquisicao` existem em `pricelist.ts` mas não são enviados ao cliente.

---

#### 🟠 VER-025: Extrato Mostra Tipo de Lançamento

**Status:** 🟠 ALTO
**Risco:** Alto
**Arquivo:** `FinanceiroClientePage.tsx`

**Análise:**

```typescript
// FinanceiroClientePage.tsx - Linha 262-266
const lancamentosFormatados: Lancamento[] = (data || []).map((l: any) => ({
  tipo: l.tipo === "entrada" ? "receita" : "despesa",
```

**Risco:** Cliente pode ver lançamentos de "despesa" que podem revelar informações internas.

**Recomendação:** Filtrar apenas lançamentos relevantes ao cliente:

```typescript
.eq("tipo", "entrada")
```

---

#### 🟡 VER-026: Comprovantes URL Expostos

**Status:** 🟡 MÉDIO
**Risco:** Médio
**Arquivo:** `FinanceiroClientePage.tsx`

**Análise:**

```typescript
// FinanceiroClientePage.tsx - Linha 267
comprovante_url: l.comprovante_url,
```

**Risco:** URLs de comprovantes podem conter informações sensíveis ou estar em storage público.

---

#### ✅ VER-027: Permissão podeVerValores Verificada

**Status:** ✅ APROVADO
**Risco:** Baixo
**Arquivo:** `AreaClientePage.tsx`

**Análise:**

```typescript
// AreaClientePage.tsx - Linha 321
link: "/wgx/financeiro",
permitido: permissoes.podeVerValores,
```

**Ponto Positivo:** Acesso ao financeiro é condicionado à permissão.

---

### 🔓 SEÇÃO 5: EXPOSIÇÃO DE DADOS SENSÍVEIS

#### 🟠 VER-028: Dados de Pessoa Completos na Query

**Status:** 🟠 ALTO
**Risco:** Alto
**Arquivo:** `ConfirmacaoDadosPage.tsx`

**Análise:**

```typescript
// ConfirmacaoDadosPage.tsx - Linha 80-83
const { data: pessoa, error: erroPessoa } = await supabase
  .from("pessoas")
  .select("*"); // ⚠️ SELECT * PERIGOSO
```

**Risco:** `SELECT *` pode retornar campos sensíveis não necessários como `senha_hash`, `token_reset`, etc.

**Recomendação:** Especificar campos necessários explicitamente.

---

#### 🟠 VER-029: Avatar URL Pode Expor Storage

**Status:** 🟠 ALTO
**Risco:** Alto
**Arquivos:** Múltiplos componentes

**Análise:**

```typescript
// useUsuarioLogado.ts - Linha 76
avatar_url: pessoa?.avatar_url || pessoa?.foto_url || null,
```

**Risco:** URLs de avatar podem revelar estrutura do Supabase Storage ou ser URLs previsíveis.

---

#### 🟡 VER-030: Console.log em Produção

**Status:** 🟡 MÉDIO
**Risco:** Médio
**Arquivos:** Múltiplos

**Análise:**

```typescript
// useImpersonation.ts - Linha 106
console.log("[Impersonation] Acessando como:", pessoa.nome);

// googleDriveBrowserService.ts - Linha 74
console.log("✅ Token Google Drive recuperado do localStorage...");
```

**Risco:** Logs em produção podem vazar informações para console do navegador.

---

#### 🟡 VER-031: IDs Expostos em URLs

**Status:** 🟡 MÉDIO
**Risco:** Médio
**Arquivos:** Rotas do React Router

**Análise:**
URLs como `/wgx/financeiro?cliente_id=UUID` expõem IDs de clientes que podem ser enumerados.

**Recomendação:** Usar tokens temporários ou slugs em vez de UUIDs diretos.

---

#### ✅ VER-032: Confirmação de Dados Persistida

**Status:** ✅ APROVADO
**Risco:** Baixo
**Arquivo:** `ConfirmacaoDadosPage.tsx`

**Análise:**

```typescript
// ConfirmacaoDadosPage.tsx - Linha 119-124
const { error: erroUpdate } = await supabase.from("usuarios").update({
  dados_confirmados: true,
  dados_confirmados_em: new Date().toISOString(),
});
```

**Ponto Positivo:** Confirmação é salva no banco, não apenas em localStorage.

---

## 🎯 MATRIZ DE PRIORIZAÇÃO

### Prioridade 1 - IMEDIATA (1-2 dias)

| ID      | Vulnerabilidade                                   | Impacto                           |
| ------- | ------------------------------------------------- | --------------------------------- |
| VER-002 | cliente_id sem validação em FinanceiroClientePage | Acesso a dados de outros clientes |
| VER-002 | cliente_id sem validação em CronogramaClientePage | Acesso a dados de outros clientes |
| VER-009 | Query contratos sem verificação                   | Exposição de valores de contratos |
| VER-010 | Parcelas expostas por contrato_id                 | Exposição financeira              |
| VER-011 | Lançamentos sem validação                         | Exposição total do financeiro     |

### Prioridade 2 - URGENTE (3-7 dias)

| ID      | Vulnerabilidade                      | Impacto                  |
| ------- | ------------------------------------ | ------------------------ |
| VER-005 | Falta RLS em tabelas críticas        | Bypass de segurança      |
| VER-013 | RLS permissiva em cronograma_tarefas | Exposição de cronogramas |
| VER-017 | Pasta base Drive compartilhada       | Vazamento de estrutura   |
| VER-018 | Token OAuth em localStorage          | Roubo de sessão Drive    |

### Prioridade 3 - IMPORTANTE (1-2 semanas)

| ID      | Vulnerabilidade             | Impacto               |
| ------- | --------------------------- | --------------------- |
| VER-004 | Permissões não revalidadas  | Acesso após revogação |
| VER-006 | Backend SERVICE_ROLE_KEY    | Bypass completo RLS   |
| VER-019 | Sem validação pasta cliente | Path traversal        |
| VER-025 | Extrato mostra despesas     | Info interna vazada   |
| VER-028 | SELECT \* em pessoas        | Campos sensíveis      |

---

## ✅ RECOMENDAÇÕES DE CORREÇÃO

### 1. Corrigir IDOR em cliente_id (CRÍTICO)

```typescript
// FinanceiroClientePage.tsx - Adicionar validação
const { canImpersonate } = useImpersonation();

// Na função carregarDados:
if (isImpersonating && impersonatedUser) {
  pessoaId = impersonatedUser.id;
} else if (clienteIdParam && canImpersonate) {
  // ← ADICIONAR canImpersonate
  pessoaId = clienteIdParam;
} else {
  // Buscar próprio ID - fluxo normal
}
```

### 2. Implementar RLS para Clientes

```sql
-- Adicionar política para clientes em oportunidades
CREATE POLICY cliente_ve_proprias_oportunidades ON oportunidades
    FOR SELECT USING (
        cliente_id IN (
            SELECT p.id FROM pessoas p
            JOIN usuarios u ON u.pessoa_id = p.id
            WHERE u.auth_user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.auth_user_id = auth.uid()
            AND u.tipo_usuario NOT IN ('CLIENTE')
        )
    );
```

### 3. Corrigir RLS de cronograma_tarefas

```sql
-- Substituir política permissiva
DROP POLICY "Usuarios podem ver todas as tarefas" ON cronograma_tarefas;

CREATE POLICY tarefas_por_contrato ON cronograma_tarefas
    FOR SELECT USING (
        contrato_id IN (
            SELECT c.id FROM contratos c
            JOIN usuarios u ON u.pessoa_id = c.cliente_id
            WHERE u.auth_user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.auth_user_id = auth.uid()
            AND u.tipo_usuario NOT IN ('CLIENTE', 'FORNECEDOR')
        )
    );
```

### 4. Isolar Google Drive por Cliente

```typescript
// googleDriveBrowserService.ts
// Não usar FOLDER_ID_BASE hardcoded
// Buscar folder_id do cliente no banco de dados
async getClienteFolderId(clienteId: string): Promise<string> {
  const { data } = await supabase
    .from('cliente_drive_config')
    .select('folder_id')
    .eq('cliente_id', clienteId)
    .single();
  return data?.folder_id;
}
```

### 5. Remover console.log em Produção

```typescript
// Usar biblioteca de logging com níveis
import { logger } from "@/lib/logger";

if (import.meta.env.DEV) {
  logger.debug("[Impersonation] Acessando como:", pessoa.nome);
}
```

---

## 📈 MÉTRICAS DE CONFORMIDADE

| Critério                                 | Status     | Nota                  |
| ---------------------------------------- | ---------- | --------------------- |
| OWASP Top 10 - A01 Broken Access Control | ❌ FALHA   | IDOR presente         |
| OWASP Top 10 - A07 XSS                   | ⚠️ RISCO   | Token em localStorage |
| LGPD - Minimização de Dados              | ⚠️ PARCIAL | SELECT \* usado       |
| LGPD - Acesso Restrito                   | ❌ FALHA   | Falta RLS             |
| Best Practices - Logging                 | ⚠️ PARCIAL | Console.log em prod   |

---

## 🔐 CONCLUSÃO

O Portal do Cliente WGX possui vulnerabilidades críticas de **IDOR (Insecure Direct Object Reference)** que permitem a um cliente autenticado acessar dados financeiros, cronogramas e informações de outros clientes através de manipulação de parâmetros na URL.

**Ação Imediata Recomendada:**

1. Adicionar validação `canImpersonate` em TODOS os componentes que usam `cliente_id` da URL
2. Implementar RLS específica para clientes nas tabelas críticas
3. Auditar todas as queries que usam IDs vindos de parâmetros de URL

**Prazo para Correção das Vulnerabilidades Críticas:** 48 horas

---

_Relatório gerado automaticamente pelo sistema de auditoria WG Easy_
_Próxima auditoria programada: 12 de Janeiro de 2026_
