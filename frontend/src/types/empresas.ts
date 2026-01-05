// ============================================================
// TYPES: Empresas do Grupo
// Sistema WG Easy - Grupo WG Almeida
// ============================================================

// Enums
export type TipoEmpresa = 'arquitetura' | 'engenharia' | 'marcenaria' | 'outros';

export type TipoConta = 'corrente' | 'poupanca' | 'pagamento';

export type TipoChavePix = 'cpf' | 'cnpj' | 'email' | 'telefone' | 'chave_aleatoria';

// ============================================================
// EMPRESA DO GRUPO
// ============================================================

export interface EmpresaGrupo {
  id: string;
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
  inscricao_estadual?: string;
  inscricao_municipal?: string;
  regime_apuracao?: string;
  regime_tributario?: string;
  cnae_principal?: string;
  cnae_principal_desc?: string;
  cnaes_secundarios?: string;

  // Endereço
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;

  // Contato
  email?: string;
  telefone?: string;

  // Vínculo com núcleo
  nucleo_id?: string;
  nucleo_nome?: string; // Incluído via join
  nucleo_cor?: string;  // Incluído via join

  // Status
  ativo: boolean;

  // Auditoria
  criado_em: string;
  atualizado_em: string;
  criado_por?: string;
  atualizado_por?: string;
}

// ============================================================
// CONTA BANCÁRIA
// ============================================================

export interface ContaBancaria {
  id: string;
  empresa_id: string;

  // Dados bancários
  banco_codigo: string;
  banco_nome: string;
  agencia: string;
  agencia_digito?: string;
  conta: string;
  conta_digito?: string;
  tipo_conta: TipoConta;

  // PIX
  pix_tipo?: TipoChavePix;
  pix_chave?: string;

  // Identificação
  apelido?: string;
  padrao: boolean;

  // Status
  ativo: boolean;

  // Auditoria
  criado_em: string;
  atualizado_em: string;
  criado_por?: string;
  atualizado_por?: string;
}

// ============================================================
// EMPRESA COM CONTAS (Para listagem completa)
// ============================================================

export interface EmpresaComContas extends EmpresaGrupo {
  contas_bancarias?: ContaBancaria[];
  conta_padrao?: ContaBancaria; // Conta marcada como padrão
}

// ============================================================
// FORM DATA (Para criação/edição)
// ============================================================

export interface EmpresaFormData {
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
  inscricao_estadual?: string;
  inscricao_municipal?: string;
  regime_apuracao?: string;
  regime_tributario?: string;
  cnae_principal?: string;
  cnae_principal_desc?: string;
  cnaes_secundarios?: string;

  // Endereço
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;

  // Contato
  email?: string;
  telefone?: string;

  // Vínculo
  nucleo_id?: string;

  // Status
  ativo: boolean;
}

export interface ContaBancariaFormData {
  banco_codigo: string;
  banco_nome: string;
  agencia: string;
  agencia_digito?: string;
  conta: string;
  conta_digito?: string;
  tipo_conta: TipoConta;

  pix_tipo?: TipoChavePix;
  pix_chave?: string;

  apelido?: string;
  padrao: boolean;
  ativo: boolean;
}

// ============================================================
// DADOS BANCÁRIOS FORMATADOS (Para exibição em PDF/compartilhamento)
// ============================================================

export interface DadosBancariosFormatados {
  empresa: {
    razao_social: string;
    nome_fantasia: string;
    cnpj: string;
    endereco_completo?: string;
    email?: string;
    telefone?: string;
  };
  conta: {
    banco: string; // Ex: "001 - Banco do Brasil"
    agencia: string; // Ex: "1234-5"
    conta: string; // Ex: "12345-6"
    tipo: string; // "Conta Corrente"
    pix?: string; // Ex: "CPF: 123.456.789-00"
  };
}

// ============================================================
// HELPERS
// ============================================================

export function getTipoContaLabel(tipo: TipoConta): string {
  const labels: Record<TipoConta, string> = {
    corrente: 'Conta Corrente',
    poupanca: 'Poupança',
    pagamento: 'Conta Pagamento',
  };
  return labels[tipo] || tipo;
}

export function getTipoChavePixLabel(tipo: TipoChavePix): string {
  const labels: Record<TipoChavePix, string> = {
    cpf: 'CPF',
    cnpj: 'CNPJ',
    email: 'E-mail',
    telefone: 'Telefone',
    chave_aleatoria: 'Chave Aleatória',
  };
  return labels[tipo] || tipo;
}

export function formatarCNPJ(cnpj: string): string {
  const cleaned = cnpj.replace(/\D/g, '');
  if (cleaned.length !== 14) return cnpj;
  return cleaned.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

export function formatarChavePix(tipo: TipoChavePix | undefined, chave: string | undefined): string {
  if (!tipo || !chave) return '';

  const cleaned = chave.replace(/\D/g, '');

  switch (tipo) {
    case 'cpf':
      if (cleaned.length === 11) {
        return cleaned.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
      }
      return chave;

    case 'cnpj':
      return formatarCNPJ(chave);

    case 'telefone':
      if (cleaned.length === 11) {
        return cleaned.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
      } else if (cleaned.length === 10) {
        return cleaned.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
      }
      return chave;

    default:
      return chave;
  }
}

export function formatarAgencia(agencia: string, digito?: string): string {
  if (digito) {
    return `${agencia}-${digito}`;
  }
  return agencia;
}

export function formatarConta(conta: string, digito?: string): string {
  if (digito) {
    return `${conta}-${digito}`;
  }
  return conta;
}

export function formatarBanco(codigo: string, nome: string): string {
  return `${codigo} - ${nome}`;
}

export function gerarDadosBancariosFormatados(
  empresa: EmpresaGrupo,
  conta: ContaBancaria
): DadosBancariosFormatados {
  const enderecoCompleto = [
    empresa.logradouro,
    empresa.numero,
    empresa.complemento,
    empresa.bairro,
    empresa.cidade,
    empresa.estado,
    empresa.cep
  ].filter(Boolean).join(', ');

  return {
    empresa: {
      razao_social: empresa.razao_social,
      nome_fantasia: empresa.nome_fantasia,
      cnpj: formatarCNPJ(empresa.cnpj),
      endereco_completo: enderecoCompleto || undefined,
      email: empresa.email,
      telefone: empresa.telefone,
    },
    conta: {
      banco: formatarBanco(conta.banco_codigo, conta.banco_nome),
      agencia: formatarAgencia(conta.agencia, conta.agencia_digito),
      conta: formatarConta(conta.conta, conta.conta_digito),
      tipo: getTipoContaLabel(conta.tipo_conta),
      pix: conta.pix_tipo && conta.pix_chave
        ? `${getTipoChavePixLabel(conta.pix_tipo)}: ${formatarChavePix(conta.pix_tipo, conta.pix_chave)}`
        : undefined,
    },
  };
}
