# CHECKLIST DE AUDITORIA MOBILE - WG Easy
Data: 2026-01-09

## 📱 Como Testar
1. Abra o Chrome DevTools (F12)
2. Clique no ícone de dispositivo móvel (ou Ctrl+Shift+M)
3. Selecione dispositivos: iPhone 12 Pro, Galaxy S20, iPad

---

## 1. TELA DE LOGIN

### Layout
- [ ] Logo WG centralizada e não cortada
- [ ] Campos de email/senha com largura adequada (não ultrapassam tela)
- [ ] Botão "Entrar" visível sem scroll
- [ ] Link "Esqueci minha senha" clicável

### Funcionalidade
- [ ] Teclado não esconde campos ao digitar
- [ ] Mensagens de erro visíveis e legíveis
- [ ] Redirecionamento após login funciona

---

## 2. SIDEBAR / MENU

### Mobile (< 768px)
- [ ] Sidebar oculta por padrão
- [ ] Ícone hambúrguer (☰) visível no header
- [ ] Sidebar abre como drawer/overlay
- [ ] Botão de fechar (X) funcional
- [ ] Clique fora fecha a sidebar
- [ ] Links navegam e fecham sidebar

### Tablet (768px - 1024px)
- [ ] Sidebar colapsada (só ícones) ou expandida
- [ ] Hover mostra tooltips nos ícones

---

## 3. HEADER / TOPBAR

- [ ] Logo proporcional ao tamanho da tela
- [ ] Sino de notificações visível
- [ ] Dropdown de notificações não corta na borda
- [ ] Menu do usuário acessível
- [ ] Busca (se existir) responsiva

---

## 4. DASHBOARD

### Cards de Métricas
- [ ] Cards empilham em 1 coluna no mobile
- [ ] Números legíveis (font-size adequado)
- [ ] Ícones proporcionais

### Widget Calendar
- [ ] Calendário não corta dias
- [ ] Setas de navegação (< >) clicáveis
- [ ] Eventos do dia selecionado visíveis
- [ ] Modal de criar evento centralizado

### Widget Keep
- [ ] Notas com scroll se necessário
- [ ] Checkboxes clicáveis (área de toque adequada)
- [ ] Texto não ultrapassa container

---

## 5. FORMULÁRIOS

### Campos
- [ ] Labels acima dos inputs (não ao lado)
- [ ] Inputs com largura 100%
- [ ] Selects funcionam no touch
- [ ] DatePickers abrem corretamente

### Botões
- [ ] Tamanho mínimo 44x44px (área de toque)
- [ ] Espaçamento adequado entre botões
- [ ] Botão de submit visível sem scroll

---

## 6. TABELAS

- [ ] Scroll horizontal quando necessário
- [ ] Cabeçalhos fixos (sticky)
- [ ] Texto não quebra de forma estranha
- [ ] Ações (editar/deletar) acessíveis

---

## 7. MODAIS

- [ ] Centralizados na tela
- [ ] Não cortam nas bordas
- [ ] Botão de fechar visível
- [ ] Scroll interno se conteúdo grande
- [ ] Overlay escurece fundo

---

## 8. NOTIFICAÇÕES / TOASTS

- [ ] Aparecem na parte superior ou inferior
- [ ] Não bloqueiam interação
- [ ] Texto legível
- [ ] Botão de fechar funcional (se existir)

---

## 9. CORES E CONTRASTE

### Padrão WG
- [ ] Laranja primário: #F25C26
- [ ] Verde sucesso: #22c55e
- [ ] Vermelho erro: #ef4444
- [ ] Amarelo aviso: #f59e0b

### Acessibilidade
- [ ] Contraste texto/fundo adequado (4.5:1 mínimo)
- [ ] Links distinguíveis do texto normal
- [ ] Estados focus visíveis

---

## 10. PERFORMANCE MOBILE

- [ ] Carregamento inicial < 3s em 4G
- [ ] Imagens otimizadas (lazy loading)
- [ ] Scroll suave (sem travamentos)
- [ ] Touch responsivo (sem delay)

---

## 🔍 PROBLEMAS ENCONTRADOS

### Críticos (bloqueia uso)
1. _________________________________
2. _________________________________

### Importantes (dificulta uso)
1. _________________________________
2. _________________________________

### Menores (estéticos)
1. _________________________________
2. _________________________________

---

## ✅ APROVAÇÃO

- [ ] Testado em iPhone
- [ ] Testado em Android
- [ ] Testado em iPad/Tablet
- [ ] Todos os fluxos principais funcionam

**Aprovado por:** ________________
**Data:** ________________
