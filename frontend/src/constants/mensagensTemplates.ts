/**
 * Templates de mensagens padronizadas do sistema WG Easy
 * Use estas constantes para manter consistência nas comunicações
 */

/**
 * Gera mensagem de credenciais de acesso para colaboradores
 * @param nome - Nome do colaborador
 * @param email - Email de login
 * @param senha - Senha inicial
 * @returns Mensagem formatada
 */
export function gerarMensagemCredenciaisColaborador(
  nome: string,
  email: string,
  senha: string
): string {
  const dataAtual = new Date().toLocaleDateString("pt-BR");

  return `CREDENCIAIS DE ACESSO — WG Easy

"Foi um desafio construir. O seu Mundo muda quando VOCÊ muda, e nós dissemos que haveria mudanças.
Hoje, elas começam aqui. ${dataAtual}"

Olá, ${nome},
Seja bem-vindo(a) ao time WG! 💪🚀

A partir de agora, este é o seu acesso ao WG Easy → gestão e informação no mesmo lugar, com mais clareza, agilidade e controle.

No WG Easy, você encontrará:
→ Projetos em andamento (endereços, documentos e informações da obra)
→ Cronogramas e acompanhamento
→ Envio fotográfico direto pelo sistema
→ Área financeira exclusiva, com pagamentos realizados, solicitados e programados
→ Solicitação de reembolsos
→ Menu Serviços, para solicitar materiais, fretes, retirada de entulho e muito mais

✅ Acesse o sistema: https://easy.wgalmeida.com.br

📩 E-mail (login): ${email}
🔒 Senha: ${senha}

IMPORTANTE: Salve esta senha ou altere no primeiro acesso.

Bem-vindo(a), começamos a mudar para construir juntos a nossa História.
Bem-vindo(a) ao WG Easy & Grupo WG Almeida`;
}

/**
 * Gera mensagem de credenciais de acesso para clientes
 * @param nome - Nome do cliente
 * @param email - Email de login
 * @param senha - Senha inicial
 * @returns Mensagem formatada
 */
export function gerarMensagemCredenciaisCliente(
  nome: string,
  email: string,
  senha: string
): string {
  return `CREDENCIAIS DE ACESSO — WG Easy

Olá, ${nome},
Seja bem-vindo(a) ao WG Easy! 🏠✨

Este é o seu portal exclusivo para acompanhar cada detalhe do seu projeto com o Grupo WG Almeida.

No WG Easy, você terá acesso a:
→ Acompanhamento completo do seu projeto
→ Cronograma atualizado em tempo real
→ Documentos e contratos
→ Fotos do andamento da obra
→ Área financeira com histórico de pagamentos
→ Canal direto de comunicação com nossa equipe

✅ Acesse o sistema: https://easy.wgalmeida.com.br

📩 E-mail (login): ${email}
🔒 Senha: ${senha}

IMPORTANTE: Salve esta senha ou altere no primeiro acesso.

Estamos juntos nessa jornada!
Grupo WG Almeida`;
}

/**
 * Gera mensagem de credenciais de acesso para fornecedores
 * @param nome - Nome do fornecedor/empresa
 * @param email - Email de login
 * @param senha - Senha inicial
 * @returns Mensagem formatada
 */
export function gerarMensagemCredenciaisFornecedor(
  nome: string,
  email: string,
  senha: string
): string {
  return `CREDENCIAIS DE ACESSO — WG Easy

Olá, ${nome},
Seja bem-vindo(a) ao portal de parceiros WG Easy! 🤝

Este é o seu acesso para acompanhar pedidos, entregas e relacionamento com o Grupo WG Almeida.

No WG Easy, você terá acesso a:
→ Pedidos em andamento
→ Histórico de fornecimentos
→ Área financeira
→ Comunicação direta com nossa equipe

✅ Acesse o sistema: https://easy.wgalmeida.com.br

📩 E-mail (login): ${email}
🔒 Senha: ${senha}

IMPORTANTE: Salve esta senha ou altere no primeiro acesso.

Parceria que constrói!
Grupo WG Almeida`;
}

/**
 * Gera mensagem de credenciais de acesso para especificadores
 * @param nome - Nome do especificador
 * @param email - Email de login
 * @param senha - Senha inicial
 * @returns Mensagem formatada
 */
export function gerarMensagemCredenciaisEspecificador(
  nome: string,
  email: string,
  senha: string
): string {
  return `CREDENCIAIS DE ACESSO — WG Easy

Olá, ${nome},
Seja bem-vindo(a) ao WG Easy! 🎨✨

Este é o seu portal exclusivo para especificação de produtos e acompanhamento de projetos.

No WG Easy, você terá acesso a:
→ Catálogo completo de produtos
→ Ferramenta de especificação
→ Memorial de acabamentos
→ Projetos vinculados
→ Histórico de especificações
→ Área financeira com comissões

✅ Acesse o sistema: https://easy.wgalmeida.com.br

📩 E-mail (login): ${email}
🔒 Senha: ${senha}

IMPORTANTE: Salve esta senha ou altere no primeiro acesso.

Juntos criamos ambientes incríveis!
Grupo WG Almeida`;
}

// Template em formato HTML para emails (opcional)
export const TEMPLATE_EMAIL_CREDENCIAIS_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .header { background: linear-gradient(135deg, #F25C26, #D94E1F); color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .credentials { background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0; }
    .highlight { color: #F25C26; font-weight: bold; }
    .footer { text-align: center; color: #666; font-size: 12px; padding: 20px; }
    .btn { display: inline-block; background: #F25C26; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>WG Easy</h1>
    <p>Gestão e informação no mesmo lugar</p>
  </div>
  <div class="content">
    <p>Olá, <strong>{{NOME}}</strong>,</p>
    <p>Seja bem-vindo(a)! 💪🚀</p>
    <p>A partir de agora, este é o seu acesso ao WG Easy.</p>

    <div class="credentials">
      <p><strong>📩 E-mail (login):</strong> {{EMAIL}}</p>
      <p><strong>🔒 Senha:</strong> {{SENHA}}</p>
    </div>

    <p style="text-align: center;">
      <a href="https://easy.wgalmeida.com.br" class="btn">Acessar WG Easy</a>
    </p>

    <p><strong>IMPORTANTE:</strong> Salve esta senha ou altere no primeiro acesso.</p>
  </div>
  <div class="footer">
    <p>Grupo WG Almeida</p>
  </div>
</body>
</html>
`;
