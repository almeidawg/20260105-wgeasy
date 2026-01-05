# Changelog - WGEasy Frontend

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [1.0.0] - 2025-11-29

### Adicionado
- Sistema completo de gestão WGEasy
- Autenticação e autorização com Supabase
- Módulo de Pessoas (Clientes, Colaboradores, Fornecedores, Especificadores)
- Módulo Comercial (Oportunidades, Propostas, Contratos)
- Módulo de Projetos (Arquitetura, Engenharia, Marcenaria)
- Módulo de Operações (Compras, Ideias, Planejamento, Aprovações)
- Módulo Financeiro com relatórios e exportação
- Sistema de Cronogramas
- Dashboard com KPIs e métricas
- Sistema de anexos e galeria
- Sistema de etapas e timeline
- Quadros Kanban interativos
- Sistema de tabs navegáveis
- Scripts de automação (setup, backup, diagnóstico, atualização)
- Documentação completa (README, GUIA_RAPIDO)
- Configurações do VSCode
- Snippets customizados
- Estrutura de menus organizada por seções

### Tecnologias
- React 18.2.0
- TypeScript 5.0.0
- Vite 7.2.4
- Tailwind CSS 4.1.17
- Supabase 2.39.0
- React Router DOM 6.21.0
- React Hook Form 7.67.0
- Zod 3.22.4

### Scripts Disponíveis
- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run preview` - Preview do build
- `npm run type-check` - Verificação de tipos
- `npm run clean` - Limpeza de cache
- `npm run fresh` - Reinstalação completa

### Scripts PowerShell
- `setup.ps1` - Setup automático
- `diagnostico.ps1` - Diagnóstico do sistema
- `backup.ps1` - Backup automático
- `atualizar.ps1` - Atualização de dependências

### Scripts Batch
- `dev.bat` - Atalho para desenvolvimento
- `build.bat` - Atalho para build

### Estrutura
- Sistema de rotas completo
- Layout responsivo com sidebar
- Componentes reutilizáveis
- APIs organizadas por módulo
- Tipagem TypeScript completa
- Estilização consistente com Tailwind

---

## Formato das Entradas

### [Versão] - Data

#### Adicionado
- Novas funcionalidades

#### Modificado
- Mudanças em funcionalidades existentes

#### Depreciado
- Funcionalidades que serão removidas

#### Removido
- Funcionalidades removidas

#### Corrigido
- Correção de bugs

#### Segurança
- Correções de vulnerabilidades

---

## Versionamento

- **MAJOR** (X.0.0): Mudanças incompatíveis na API
- **MINOR** (0.X.0): Nova funcionalidade compatível
- **PATCH** (0.0.X): Correções de bugs

---

*Mantenha este arquivo atualizado a cada release*
