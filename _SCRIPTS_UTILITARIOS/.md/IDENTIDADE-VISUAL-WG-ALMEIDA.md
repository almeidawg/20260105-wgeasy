# Identidade Visual - Grupo WG Almeida

## Paleta Cromatica Oficial

### Cor Institucional Principal

**Laranja WG (Ponto da Criacao)**
- **Hex:** `#F25C26`
- **CMYK:** C 0 | M 74 | Y 90 | K 0
- **RGB:** rgb(242, 92, 38)
- **Significado:** Energia criativa, inovacao, acao e inicio do processo
- **Uso:** E o ponto WG, assinatura da marca. Nao e detalhe, e conceito.

---

### Cores por Unidade de Negocio

#### WG Arquitetura - Verde Mineral
- **Hex:** `#5E9B94`
- **CMYK:** C 35 | M 60 | Y 75 | K 20
- **RGB:** rgb(94, 155, 148)
- **Significado:** Equilibrio, racionalidade, design consciente

#### WG Engenharia - Azul Tecnico
- **Hex:** `#2B4580`
- **CMYK:** C 60 | M 10 | Y 35 | K 10
- **RGB:** rgb(43, 69, 128)
- **Significado:** Estrutura, metodo, precisao e confianca tecnica

#### WG Marcenaria - Marrom Carvalho
- **Hex:** `#8B5E3C`
- **CMYK:** C 100 | M 85 | Y 25 | K 10
- **RGB:** rgb(139, 94, 60)
- **Significado:** Materialidade, calor, luxo artesanal e tradicao

---

### Cores Neutras de Apoio (Base Visual)

#### Preto WG
- **Hex:** `#2E2E2E`
- **K:** 82
- **Uso:** Fundos escuros, sofisticacao, contraste premium

#### Cinza WG
- **Hex:** `#4C4C4C`
- **K:** 70
- **Uso:** Textos institucionais, subtitulos, equilibrio visual

#### Cinza Claro
- **Hex:** `#F3F3F3`
- **K:** 5
- **Uso:** Fundos leves, digital, apresentacoes

#### Branco
- **Hex:** `#FFFFFF`
- **Uso:** Respiro visual, clareza, elegancia

---

## Variaveis CSS para Desenvolvimento

```css
:root {
  /* Cor Principal */
  --wg-laranja: #F25C26;
  --wg-laranja-light: #FF7A4D;
  --wg-laranja-dark: #D94D1A;

  /* Unidades de Negocio */
  --wg-arquitetura: #5E9B94;
  --wg-arquitetura-light: #7AB5AE;
  --wg-arquitetura-dark: #4A7D77;

  --wg-engenharia: #2B4580;
  --wg-engenharia-light: #3D5C9E;
  --wg-engenharia-dark: #1E3460;

  --wg-marcenaria: #8B5E3C;
  --wg-marcenaria-light: #A67B56;
  --wg-marcenaria-dark: #6E4A2F;

  /* Neutras */
  --wg-preto: #2E2E2E;
  --wg-cinza: #4C4C4C;
  --wg-cinza-claro: #F3F3F3;
  --wg-branco: #FFFFFF;

  /* Status */
  --wg-sucesso: #22C55E;
  --wg-alerta: #F59E0B;
  --wg-erro: #EF4444;
  --wg-info: #3B82F6;
}
```

---

## Variaveis Tailwind CSS

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'wg': {
          'laranja': '#F25C26',
          'laranja-light': '#FF7A4D',
          'laranja-dark': '#D94D1A',
        },
        'wg-arquitetura': {
          DEFAULT: '#5E9B94',
          light: '#7AB5AE',
          dark: '#4A7D77',
        },
        'wg-engenharia': {
          DEFAULT: '#2B4580',
          light: '#3D5C9E',
          dark: '#1E3460',
        },
        'wg-marcenaria': {
          DEFAULT: '#8B5E3C',
          light: '#A67B56',
          dark: '#6E4A2F',
        },
        'wg-neutro': {
          'preto': '#2E2E2E',
          'cinza': '#4C4C4C',
          'cinza-claro': '#F3F3F3',
        }
      }
    }
  }
}
```

---

## Constantes TypeScript

```typescript
// src/constants/cores.ts
export const CORES_WG = {
  // Cor Principal
  LARANJA: '#F25C26',
  LARANJA_LIGHT: '#FF7A4D',
  LARANJA_DARK: '#D94D1A',

  // Unidades de Negocio
  ARQUITETURA: '#5E9B94',
  ARQUITETURA_LIGHT: '#7AB5AE',
  ARQUITETURA_DARK: '#4A7D77',

  ENGENHARIA: '#2B4580',
  ENGENHARIA_LIGHT: '#3D5C9E',
  ENGENHARIA_DARK: '#1E3460',

  MARCENARIA: '#8B5E3C',
  MARCENARIA_LIGHT: '#A67B56',
  MARCENARIA_DARK: '#6E4A2F',

  // Neutras
  PRETO: '#2E2E2E',
  CINZA: '#4C4C4C',
  CINZA_CLARO: '#F3F3F3',
  BRANCO: '#FFFFFF',

  // Status
  SUCESSO: '#22C55E',
  ALERTA: '#F59E0B',
  ERRO: '#EF4444',
  INFO: '#3B82F6',
} as const;

// Cores por nucleo (para uso no sistema)
export const CORES_NUCLEO: Record<string, string> = {
  'arquitetura': '#5E9B94',
  'engenharia': '#2B4580',
  'marcenaria': '#8B5E3C',
  'geral': '#F25C26',
};
```

---

## Leitura Estrategica

> O laranja nunca e decorativo - ele marca o inicio da historia.

> As cores das unidades nao competem entre si, elas explicam o processo.

> O preto e os cinzas sustentam o conceito de luxo silencioso.

**Resumo:**
A WG nao usa cor. A WG comunica metodo, processo e intencao.

---

## Aplicacao no Sistema WG Easy

### Cronograma/Gantt Chart
- **Cabecalho meses:** `#2B4580` (Azul Engenharia)
- **Barra de progresso:** Cor do nucleo do projeto
- **Destaque hoje:** `#F25C26` com fundo `#FFF3EE`
- **Fim de semana:** `#F3F3F3`

### Status de Tarefas
- **Pendente:** `#4C4C4C` (Cinza WG)
- **Em Andamento:** `#3B82F6` (Azul Info)
- **Concluida:** `#22C55E` (Sucesso)
- **Atrasada:** `#EF4444` (Erro)

### Cards e Botoes
- **Botao primario:** `#F25C26` (Laranja WG)
- **Botao secundario:** `#2E2E2E` (Preto WG)
- **Borda de foco:** `#F25C26`
- **Links:** `#F25C26`

---

*Documento criado em: 23/12/2024*
*Sistema WG Easy - Grupo WG Almeida*
