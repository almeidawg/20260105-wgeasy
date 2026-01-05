# Guia de Contribuição - WGEasy Frontend

Obrigado por contribuir com o WGEasy! Este guia ajudará você a começar.

## Código de Conduta

- Seja respeitoso e profissional
- Ajude outros desenvolvedores
- Documente seu código
- Siga os padrões do projeto

## Como Contribuir

### 1. Setup do Ambiente

```bash
# Clone o repositório (se necessário)
git clone [url-do-repositorio]

# Navegue até a pasta
cd frontend

# Execute o setup
.\setup.ps1

# Ou manualmente
npm install
npm run dev
```

### 2. Criando uma Branch

```bash
git checkout -b feature/nome-da-funcionalidade
# ou
git checkout -b fix/nome-do-bug
```

### 3. Padrões de Código

#### TypeScript
- Use TypeScript em todos os novos arquivos
- Defina tipos/interfaces para props e estados
- Evite `any`, use tipos específicos

```typescript
// ✅ Correto
interface UserProps {
  name: string;
  age: number;
}

// ❌ Evitar
const user: any = { name: "João" };
```

#### Componentes React
- Use componentes funcionais
- Use hooks (useState, useEffect, etc.)
- Mantenha componentes pequenos (< 200 linhas)
- Um componente por arquivo

```typescript
// ✅ Correto
export default function MyComponent({ title }: { title: string }) {
  return <h1>{title}</h1>;
}
```

#### Nomenclatura
- Componentes: `PascalCase`
- Funções: `camelCase`
- Constantes: `UPPER_CASE`
- Arquivos: `PascalCase.tsx` para componentes

```typescript
// Componentes
MyComponent.tsx
UserCard.tsx

// APIs
pessoasApi.ts
obrasApi.ts

// Utilitários
formatDate.ts
```

#### Importações
- Use path alias `@/` para imports
- Organize imports: bibliotecas primeiro, depois locais

```typescript
// ✅ Correto
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MyComponent } from "@/components/MyComponent";
import { fetchData } from "@/lib/api";

// ❌ Evitar
import { MyComponent } from "../../../components/MyComponent";
```

#### Estilização
- Use Tailwind CSS
- Use as cores do tema WGEasy
- Mantenha consistência visual

```typescript
// Cores principais
bg-[#F25C26]  // Laranja WGEasy
text-gray-600
bg-white
border-gray-200
```

### 4. Estrutura de Arquivos

```
src/
├── components/        # Componentes reutilizáveis
│   └── MyComponent.tsx
├── pages/            # Páginas da aplicação
│   └── MyPage.tsx
├── lib/              # APIs e utilitários
│   └── myApi.ts
├── types/            # Tipos TypeScript
│   └── myTypes.ts
└── styles/           # Arquivos CSS
    └── myStyles.css
```

### 5. Commits

Use mensagens claras e descritivas:

```bash
# Formato
tipo: descrição breve

# Exemplos
feat: adiciona página de relatórios
fix: corrige erro no upload de arquivos
docs: atualiza README
style: ajusta espaçamento no header
refactor: refatora componente de tabela
test: adiciona testes para API
chore: atualiza dependências
```

#### Tipos de Commit
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação, espaçamento
- `refactor`: Refatoração de código
- `test`: Testes
- `chore`: Tarefas de manutenção

### 6. Pull Requests

1. Certifique-se que o código compila sem erros
   ```bash
   npm run type-check
   npm run build
   ```

2. Teste suas mudanças
   ```bash
   npm run dev
   ```

3. Crie um PR com:
   - Título claro
   - Descrição do que foi feito
   - Screenshots (se aplicável)
   - Lista de verificação

#### Template de PR

```markdown
## Descrição
[Descreva o que foi feito]

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova funcionalidade
- [ ] Melhoria
- [ ] Documentação

## Checklist
- [ ] Código compila sem erros
- [ ] Código foi testado
- [ ] Documentação atualizada
- [ ] Segue os padrões do projeto

## Screenshots
[Se aplicável]
```

### 7. Testes

Antes de commitar:

```bash
# Verificar tipos
npm run type-check

# Build
npm run build

# Testar no navegador
npm run dev
```

### 8. Boas Práticas

#### Performance
- Use React.memo para componentes que renderizam muitas vezes
- Use useMemo e useCallback quando apropriado
- Evite renderizações desnecessárias

#### Acessibilidade
- Use tags semânticas
- Adicione alt em imagens
- Use aria-labels quando necessário

#### Segurança
- Nunca commite credenciais
- Use variáveis de ambiente
- Valide inputs do usuário

#### Documentação
- Documente funções complexas
- Use comentários quando necessário
- Mantenha README atualizado

### 9. Code Review

Ao revisar código:
- Seja construtivo
- Sugira melhorias
- Teste as mudanças
- Verifique se segue os padrões

### 10. Snippets Úteis

Use os snippets do VSCode:
- `wgcomp` - Componente React
- `wgpage` - Página React
- `wgapi` - Função de API
- `wgstate` - useState
- `wgeffect` - useEffect

### 11. Recursos

- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [Tailwind Docs](https://tailwindcss.com/docs)
- [Supabase Docs](https://supabase.com/docs)

## Dúvidas?

Entre em contato com a equipe de desenvolvimento.

---

Obrigado por contribuir com o WGEasy! 🚀
