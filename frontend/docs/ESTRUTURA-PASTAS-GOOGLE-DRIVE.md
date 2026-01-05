# Estrutura de Pastas Google Drive - WG Easy

## Conceito de Segurança

A estrutura de pastas foi projetada para separar **informações confidenciais** (uso interno) de **informações compartilháveis** (visíveis ao cliente).

### Identificador Visual

| Prefixo | Significado | Acesso |
|---------|-------------|--------|
| (sem prefixo) | Pasta PRIVADA | Apenas equipe interna |
| **(C)** | Pasta COMPARTILHÁVEL | Cliente pode visualizar |

---

## Estrutura Completa

```
📁 20251213 - ELIANA KIELLANDER LOPES
│
│  ══════════════════════════════════════════════════════════
│  ÁREA PRIVADA (Uso Interno - NÃO compartilhar)
│  ══════════════════════════════════════════════════════════
│
├── 00 . Levantamentos Iniciais
│   ├── 00 . Medições In Loco
│   ├── 00. Briefing do Cliente
│   ├── 01 . Fotos do Imóvel
│   └── 02 . Documentação do Cliente
│
├── 01 . Projeto Executivo Arquitetônico
│   ├── 00 . Arquitetura
│   ├── 01 . Memorial Descritivo
│   ├── 02 . Pré-Projeto Arquitetônico
│   │   ├── 00 . Estudos Preliminares
│   │   ├── 01 . Layout Planta Humaniza
│   │   └── 02 . Moodboards Inspirações
│   ├── 02 . Ar Condicionado
│   ├── 03 . Elétrica
│   ├── 04 . Automação
│   ├── 04 . Documentos e Exigências Legais
│   ├── 05 . Eletros, Eletronicos, Decoração
│   │   ├── 00 . Estofados
│   │   ├── 01 . Eletrodomésticos
│   │   ├── 02 . Eletrônicos
│   │   ├── 04 . Tapetes Cortinas Tecidos
│   │   └── 05 . Objetos Decorativos
│   ├── 05 . Hidráulica
│   ├── 06 . Gás
│   ├── 07 . Gesso - Forro
│   ├── 07 . Marmoraria
│   ├── 08 . Marcenaria
│   ├── 09 . Pisos e Paredes
│   ├── 09 . Vidraçaria
│   └── 10 . Louças e Metais
│
├── 02 . Engenharia - Obra e Execução
│
├── 03 . Marcenaria
│
├── 04 . Diário de Obra
│
├── 05 . Financeiro - CONFIDENCIAL          ⚠️ NUNCA COMPARTILHAR!
│   ├── Orçamentos Internos
│   ├── Custos Reais
│   └── Margem e Lucro
│
├── 06 . Entrega
│   ├── Fotos Finais
│   ├── Garantias
│   └── Termos de Aceite
│
│  ══════════════════════════════════════════════════════════
│  ÁREA COMPARTILHÁVEL (Visível ao Cliente)
│  ══════════════════════════════════════════════════════════
│
└── 📁 (C)20251213-ELIANA-KIELLANDER-LOPES-Projeto
    │
    ├── 01 . Projeto Arquitetônico
    │   ├── Plantas Aprovadas
    │   ├── Renders e 3D
    │   └── Memorial Descritivo
    │
    ├── 02 . Fotos da Obra
    │   ├── Antes
    │   ├── Durante
    │   └── Depois
    │
    ├── 03 . Documentos
    │   ├── Proposta Comercial
    │   ├── Contratos
    │   └── Aprovações
    │
    └── 04 . Acompanhamento
        ├── Cronograma
        └── Relatórios de Progresso
```

---

## Nomenclatura das Pastas

### Pasta Principal (Privada)
```
AAAAMMDD - NOME COMPLETO DO CLIENTE

Exemplo:
20251213 - ELIANA KIELLANDER LOPES
```

### Pasta Compartilhável
```
(C)AAAAMMDD-NOME-DO-CLIENTE-Identificacao

Exemplo:
(C)20251213-ELIANA-KIELLANDER-LOPES-Projeto
```

---

## Regras de Uso

### O que vai na pasta PRIVADA (sem prefixo):
- Briefings completos com valores
- Orçamentos internos com margens
- Custos reais de materiais e mão de obra
- Documentos de fornecedores
- Negociações internas
- Diário de obra detalhado
- Qualquer informação financeira

### O que vai na pasta (C) COMPARTILHÁVEL:
- Plantas aprovadas (versão final)
- Renders e imagens 3D
- Fotos do antes/durante/depois
- Proposta comercial (versão cliente)
- Contrato assinado
- Cronograma de execução
- Relatórios de progresso

---

## Como Compartilhar com Cliente

1. **Nunca compartilhe a pasta principal**
2. Abra a pasta **(C)** do cliente
3. Clique em "Compartilhar"
4. Adicione o email do cliente
5. Defina permissão como "Leitor" (apenas visualizar)

### Via Sistema:
```typescript
// Compartilhar pasta (C) automaticamente
const link = await googleDriveService.compartilharPastaCliente(pastaClienteId);
// Envia o link por email/WhatsApp para o cliente
```

---

## Segurança

| Pasta | Quem pode ver | Permissão |
|-------|---------------|-----------|
| Principal | Apenas equipe WG | Privada |
| 05 . Financeiro | Apenas gestores | Privada (máximo) |
| (C) Compartilhável | Equipe + Cliente | Leitura |

---

## FAQ

**P: O caractere (C) funciona no Google Drive?**
R: Sim, parênteses são permitidos em nomes de pastas.

**P: Como sei qual pasta compartilhar?**
R: A pasta que começa com **(C)** é a única que deve ser compartilhada.

**P: Cliente consegue ver minhas margens?**
R: Não, a pasta "05 . Financeiro - CONFIDENCIAL" está FORA da pasta (C).

**P: Posso adicionar outras pastas dentro de (C)?**
R: Sim, mas lembre-se que tudo ali será visível ao cliente.

---

*Documento criado em 27/12/2024 - Sistema WG Easy*
