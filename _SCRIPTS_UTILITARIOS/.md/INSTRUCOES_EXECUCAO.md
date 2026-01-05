# 🚀 INSTRUÇÕES: EXECUTAR CORREÇÃO DE RLS

## ✅ Status

```
Script SQL: PRONTO PARA EXECUÇÃO
Arquivo: EXECUTAR_CORRECAO_LOGIN_COLABORADOR.sql
Tamanho: 241 linhas
```

---

## 📌 COMO EXECUTAR (PASSO A PASSO)

### 1. ABRIR SUPABASE DASHBOARD

```
👉 Acesse: https://app.supabase.com/project/ahlqzzkxuutwoepirpzr/sql/new

Ou:
1. Vá para: https://app.supabase.com
2. Selecione projeto: WG Easy
3. Clique em: SQL Editor
4. Clique em: New Query
```

### 2. COPIAR O SCRIPT

```
Arquivo local: c:\Users\Atendimento\Documents\01VISUALSTUDIO_OFICIAL\
Arquivo: EXECUTAR_CORRECAO_LOGIN_COLABORADOR.sql

Copie TODO O CONTEÚDO do arquivo
```

### 3. COLAR NO EDITOR SUPABASE

```
1. Clique na área de texto do SQL Editor
2. Cole o conteúdo (Ctrl+V)
```

### 4. EXECUTAR

```
Opção A: Clique no botão "RUN" (canto superior direito)
Opção B: Pressione Ctrl+Enter
```

### 5. AGUARDAR

```
A execução pode levar 5-15 segundos
Aguarde até ver a mensagem de conclusão
```

---

## ✨ RESULTADO ESPERADO

### Se der sucesso ✅

```
A seguinte mensagem aparecerá no console:

✅ PASSO 1 COMPLETO: RLS Policies atualizadas
✅ PASSO 2 COMPLETO: Tipos de usuário sincronizados
✅ PASSO 3 COMPLETO: Campos críticos validados

╔════════════════════════════════════════════════════════════╗
║         ✅ SCRIPT EXECUTADO COM SUCESSO                   ║
╚════════════════════════════════════════════════════════════╝

📊 RESUMO:
  ✅ RLS Policies criadas/atualizadas
  ✅ Tipos de usuário sincronizados
  ✅ Campos críticos validados

🧪 PRÓXIMO PASSO: Faça login com usuário COLABORADOR
   Resultado esperado: Redirecionar para /colaborador
```

### Se houver erro ❌

```
Procure pela mensagem de erro
Não é necessário rollback - apenas reexecute o script
Ou execute o diagnóstico:
  → DIAGNOSTICO_LOGIN_COLABORADOR.sql
```

---

## 🧪 VALIDAR DEPOIS

Após executar, rode os testes em:

```
📄 TESTES_RLS_LOGIN_COLABORADOR.md

Ou execute no Supabase SQL Editor:
→ DIAGNOSTICO_LOGIN_COLABORADOR.sql
```

---

## 📋 CHECKLIST

- [ ] Abrir https://app.supabase.com
- [ ] Ir em SQL Editor
- [ ] Copiar EXECUTAR_CORRECAO_LOGIN_COLABORADOR.sql
- [ ] Colar no editor
- [ ] Clicar RUN (ou Ctrl+Enter)
- [ ] Ver mensagem de sucesso ✅
- [ ] Fazer login com usuário COLABORADOR
- [ ] Verificar redirecionamento para /colaborador
- [ ] Executar testes de validação

---

## 🎯 RESUMO

**Antes:** Login de colaborador ia para `/wgx` ❌
**Depois:** Login de colaborador vai para `/colaborador` ✅

**O que foi corrigido:**

- ✅ RLS policies para permitir leitura própria
- ✅ Sincronização de tipo_usuario
- ✅ Validação de campos críticos

---

## ⏱️ TEMPO ESTIMADO

- Copiar/Colar: **1 minuto**
- Execução: **2-5 minutos**
- Testes: **5-10 minutos**
- **Total: ~10-15 minutos**

---

**Pronto? 👉 Abra o Supabase e execute agora!**
