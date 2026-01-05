# 🧪 GUIA DE TESTES - AUTENTICAÇÃO

**Última Atualização:** 2 de Janeiro, 2026
**Status:** Ready for Testing

---

## 🎯 Teste 1: Acesso ao SignupPage

### Objetivo

Verificar se a página de signup carrega corretamente

### Passos

```
1. Abra navegador
2. Navegue para: http://localhost:5173/auth/signup
3. Verifique se a página carrega sem erros
```

### Validação

- [ ] Página carrega rapidamente
- [ ] Layout é responsivo (teste em mobile também)
- [ ] Formulário está visível
- [ ] Cores da marca WG aparecem
- [ ] Partículas animadas aparecem

### Resultado Esperado

✅ Página de signup exibida corretamente com formulário completo

---

## 🎯 Teste 2: Validação de Email em Tempo Real

### Objetivo

Testar validação de email e verificação de duplicatas

### Passos

```
1. Acesse http://localhost:5173/auth/signup
2. Clique no campo "Email"
3. Digite um email inválido: "teste"
4. Verifique mensagem de erro
5. Digite um email válido: "novo@wgalmeida.com.br"
6. Aguarde 1 segundo
7. Verifique se aparece "✓ E-mail disponível"
```

### Validação

- [ ] Email inválido mostra erro
- [ ] Email válido mas existente mostra erro
- [ ] Email novo mostra ✓ verde
- [ ] Validação é instantânea

### Resultado Esperado

✅ Validação em tempo real funcionando corretamente

---

## 🎯 Teste 3: Indicador de Força de Senha

### Objetivo

Testar indicador visual e feedback de força de senha

### Passos

```
1. Clique no campo "Senha"
2. Digite "123" → Deve aparecer: "Muito fraca"
3. Apague e digite "Senha@123" → Deve aparecer: "Boa"
4. Apague e digite "SenhaForte@123456!" → Deve aparecer: "Muito forte"
5. Observe a barra de progresso mudar de cor
```

### Validação

- [ ] Senha muito fraca = vermelho
- [ ] Senha regular = amarelo
- [ ] Senha boa = azul
- [ ] Senha muito forte = verde
- [ ] Feedback aparecem em tempo real
- [ ] Lista de recomendações muda

### Resultado Esperado

✅ Indicador de força mostrando níveis apropriados

---

## 🎯 Teste 4: Validação de Confirmação de Senha

### Objetivo

Verificar se as senhas devem corresponder

### Passos

```
1. Preencha "Senha": SenhaCorreta@123
2. Preencha "Confirmar Senha": SenhaErrada@123
3. Veja mensagem de erro: "As senhas não correspondem"
4. Corrija "Confirmar Senha" para: SenhaCorreta@123
5. Veja erro desaparecer
```

### Validação

- [ ] Erro aparece quando senhas não correspondem
- [ ] Erro desaparece quando correspondem
- [ ] Campo fica com borda vermelha quando errado

### Resultado Esperado

✅ Validação de correspondência de senhas funciona

---

## 🎯 Teste 5: Verificação de Termos Obrigatórios

### Objetivo

Verificar se aceitar termos é obrigatório

### Passos

```
1. Preencha todos os campos corretamente
2. NÃO marque a caixa "Aceito os Termos..."
3. Clique "Criar Conta"
4. Veja erro: "Você deve aceitar os termos"
5. Marque a caixa
6. Erro desaparece
```

### Validação

- [ ] Botão "Criar Conta" não funciona sem aceitar
- [ ] Erro claro aparece
- [ ] Depois de aceitar, botão fica ativo

### Resultado Esperado

✅ Termos são obrigatórios

---

## 🎯 Teste 6: Signup Completo - Novo Usuário

### Objetivo

Testar fluxo completo de criação de conta

### Passos

```
1. Acesse http://localhost:5173/auth/signup
2. Preencha:
   - Email: usuario.teste@wgalmeida.com.br (NOVO)
   - Nome: João Silva
   - Tipo: CLIENTE
   - Senha: TesteSenha@123456
   - Confirmar: TesteSenha@123456
3. Marque "Aceito os Termos"
4. Clique "Criar Conta"
5. Aguarde resposta
6. Veja tela de sucesso
7. Aguarde redirecionamento para /login (3 segundos)
```

### Validação

- [ ] Carregamento aparece ("Criando conta...")
- [ ] Tela de sucesso exibe
- [ ] Mensagem correta aparece
- [ ] Redireciona para login em 3 segundos

### Resultado Esperado

✅ Usuário criado com sucesso e redirecionado para login

**Verificar no Supabase:**

1. Vá para Supabase Dashboard
2. Navegar para "Authentication"
3. Veja se novo usuário aparece em Users
4. Verifique campos de metadata

---

## 🎯 Teste 7: Login com Novo Usuário

### Objetivo

Testar se o novo usuário consegue fazer login

### Passos

```
1. Após sucesso do signup, você é redirecionado para /login
2. Preencha:
   - Email: usuario.teste@wgalmeida.com.br
   - Senha: TesteSenha@123456
3. Clique "Entrar"
4. Aguarde resposta
5. Verifique se é redirecionado para dashboard
```

### Validação

- [ ] Login aceita as credenciais
- [ ] Nenhum erro aparece
- [ ] Redirecionamento para dashboard ocorre
- [ ] Dashboard carrega

### Resultado Esperado

✅ Login funciona com novo usuário

---

## 🎯 Teste 8: Validação de Email Duplicado

### Objetivo

Verificar que email duplicado não pode ser cadastrado

### Passos

```
1. Crie primeiro usuário com email: admin@wgalmeida.com.br
2. Tente criar outro com mesmo email
3. Verifique erro em tempo real
4. Mude email para diferente
5. Verifique que erro desaparece
```

### Validação

- [ ] Email duplicado mostra erro
- [ ] Email novo mostra sucesso
- [ ] Botão "Criar Conta" fica desabilitado se email inválido

### Resultado Esperado

✅ Sistema previne duplicatas de email

---

## 🎯 Teste 9: Responsividade Mobile

### Objetivo

Testar se signup funciona em celular

### Passos

```
1. Abra DevTools (F12)
2. Clique no ícone de celular (Toggle Device Toolbar)
3. Escolha um tamanho de celular (ex: iPhone 12)
4. Navegue para /auth/signup
5. Teste todos os campos
6. Teste o botão "Criar Conta"
```

### Validação

- [ ] Layout se adapta ao celular
- [ ] Inputs são clicáveis e digitáveis
- [ ] Botão é pressionável
- [ ] Teclado não cobre campos importantes
- [ ] Scroll funciona
- [ ] Partículas aparecem (ou graceful fallback)

### Resultado Esperado

✅ Funciona perfeitamente em mobile

---

## 🎯 Teste 10: Comportamento de Erros

### Objetivo

Testar tratamento de erros e mensagens úteis

### Passos

```
1. Tente enviar formulário com Supabase desconectado
2. Verifique se erro aparece
3. Verifique se é mensagem útil
4. Reconecte e tente novamente
5. Verifique se sucesso ocorre
```

### Validação

- [ ] Erro aparece com mensagem clara
- [ ] Error aparece no topo do formulário
- [ ] Pode tentar novamente
- [ ] Depois de corrigir, sucesso ocorre

### Resultado Esperado

✅ Tratamento de erros é robusto

---

## 🎯 Teste 11: Link para Login

### Objetivo

Testar navegação entre signup e login

### Passos

```
1. Acesse /auth/signup
2. Clique no link "Fazer login" no fim
3. Verifique se navegou para /login
4. Clique no link "Criar uma nova conta"
5. Verifique se navegou para /auth/signup
```

### Validação

- [ ] Link "Fazer login" funciona
- [ ] Link "Criar conta" funciona
- [ ] URLs corretas aparecem

### Resultado Esperado

✅ Navegação entre páginas funciona

---

## 🎯 Teste 12: Tipos de Usuário

### Objetivo

Verificar seleção de tipo de usuário

### Passos

```
1. Clique no dropdown "Tipo de Usuário"
2. Veja opções: CLIENTE, COLABORADOR, FORNECEDOR, JURIDICO, FINANCEIRO
3. Selecione cada uma
4. Complete signup com cada tipo
5. Verifique em Supabase que tipo correto foi gravado
```

### Validação

- [ ] Dropdown abre
- [ ] Todas as opções aparecem
- [ ] Pode selecionar cada uma
- [ ] Tipo correto é gravado no database
- [ ] Tipo é retornado no login

### Resultado Esperado

✅ Sistema de tipos funciona corretamente

---

## 📋 Checklist de Testes Completo

### Funcionalidade

- [ ] Teste 1: Acesso ao SignupPage
- [ ] Teste 2: Validação de Email
- [ ] Teste 3: Indicador de Força
- [ ] Teste 4: Confirmação de Senha
- [ ] Teste 5: Termos Obrigatórios
- [ ] Teste 6: Signup Completo
- [ ] Teste 7: Login com Novo Usuário
- [ ] Teste 8: Email Duplicado
- [ ] Teste 9: Responsividade Mobile
- [ ] Teste 10: Tratamento de Erros
- [ ] Teste 11: Links de Navegação
- [ ] Teste 12: Tipos de Usuário

### Performance

- [ ] Página carrega < 2 segundos
- [ ] Validação é instantânea
- [ ] Signup é < 5 segundos
- [ ] Sem lag em animações

### Segurança

- [ ] Senha não aparece na URL
- [ ] Senha não aparece no console
- [ ] Email é validado
- [ ] Hash de senha ocorre no servidor

### UX/Design

- [ ] Layout é atraente
- [ ] Cores estão corretas
- [ ] Tipografia é legível
- [ ] Mensagens são claras
- [ ] Botões são claros

### Acessibilidade

- [ ] Pode navegar com Tab
- [ ] Labels estão associados aos inputs
- [ ] Cores têm contraste suficiente
- [ ] Sem erros no console

---

## 🚨 Possíveis Problemas e Soluções

### Problema: "Email validation hangs"

**Causa:** Timeout na verificação de email
**Solução:** Aumentar timeout em authApi.ts ou verificar conexão com DB

### Problema: "Password strength not updating"

**Causa:** Função checkPasswordStrength não sendo chamada
**Solução:** Verifique onChange handler em SignupPage

### Problema: "Redirect não funciona"

**Causa:** React Router não configurado
**Solução:** Verifique App.tsx e rotas

### Problema: "Supabase connection error"

**Causa:** URL ou chaves do Supabase incorretas
**Solução:** Verifique supabaseClient.ts

### Problema: "Email confirmation não enviado"

**Causa:** Email SMTP não configurado
**Solução:** Configurar Email Provider no Supabase

---

## 📊 Resultado dos Testes

Após completar todos os testes:

```
✅ Funcionalidade: PRONTO
✅ Performance: ACEITÁVEL
✅ Segurança: IMPLEMENTADO
✅ UX/Design: BELO
✅ Acessibilidade: TESTADO

Status Geral: 🟢 PRONTO PARA PRODUÇÃO
```

---

## 📝 Notas

- Salve as credenciais de teste criadas para referência futura
- Teste múltiplas vezes antes de ir para produção
- Verifique logs do Supabase para erros
- Teste com e sem JavaScript desabilitado (se aplicável)

---

## 🎯 Próximos Passos Após Testes

1. ✅ Todos os testes passam → Deploy em produção
2. ✅ Monitor performance e erros
3. ✅ Coletar feedback dos usuários
4. ✅ Começar Sprint 5

---

_Guia de testes completo. Boa sorte! 🍀_
