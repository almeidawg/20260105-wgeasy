// ============================================================
// EMAIL SERVICE - WG Easy
// Grupo WG Almeida
// ============================================================

import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

// Provider de email (supabase, resend, smtp)
const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'supabase';

// Supabase client para envio de emails
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Configuração do transporter SMTP (quando EMAIL_PROVIDER=smtp)
const smtpTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// ============================================================
// TIPOS
// ============================================================

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content?: Buffer | string;
    path?: string;
    contentType?: string;
  }>;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

// ============================================================
// FUNÇÕES PRINCIPAIS
// ============================================================

/**
 * Envia um email usando o provedor configurado
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  switch (EMAIL_PROVIDER) {
    case 'supabase':
      return sendViaSupabase(options);
    case 'resend':
      return sendViaResend(options);
    case 'smtp':
    default:
      return sendViaSMTP(options);
  }
}

/**
 * Envia email via Supabase Auth (para emails transacionais)
 * Nota: Supabase Auth é limitado a emails de autenticação.
 * Para emails gerais, use SMTP ou Resend.
 */
async function sendViaSupabase(options: EmailOptions): Promise<boolean> {
  try {
    // Supabase não tem API direta para envio de email personalizado
    // Usa a função de invite que envia email
    console.log('[Email] Supabase: Tentando enviar email...');

    // Para emails de convite/recuperação, usa Auth Admin
    // Para outros emails, fallback para SMTP se configurado
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      console.log('[Email] Fallback para SMTP...');
      return sendViaSMTP(options);
    }

    console.log('[Email] Supabase não suporta email genérico. Configure SMTP ou Resend.');
    return false;
  } catch (error) {
    console.error('[Email Supabase] Erro:', error);
    return false;
  }
}

/**
 * Envia email via Resend API
 */
async function sendViaResend(options: EmailOptions): Promise<boolean> {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('[Email Resend] API Key não configurada');
      return false;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'WG Almeida <noreply@wgalmeida.com.br>',
        to: Array.isArray(options.to) ? options.to : [options.to],
        cc: options.cc,
        bcc: options.bcc,
        reply_to: options.replyTo,
        subject: options.subject,
        text: options.text,
        html: options.html,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[Email Resend] Erro:', error);
      return false;
    }

    const data = await response.json();
    console.log('[Email Resend] Enviado:', data.id);
    return true;
  } catch (error) {
    console.error('[Email Resend] Erro:', error);
    return false;
  }
}

/**
 * Envia email via SMTP (Gmail, Outlook, etc)
 */
async function sendViaSMTP(options: EmailOptions): Promise<boolean> {
  try {
    const info = await smtpTransporter.sendMail({
      from: process.env.EMAIL_FROM || `"WG Almeida" <${process.env.EMAIL_USER}>`,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      cc: options.cc,
      bcc: options.bcc,
      replyTo: options.replyTo,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments,
    });

    console.log('[Email SMTP] Enviado:', info.messageId);
    return true;
  } catch (error) {
    console.error('[Email SMTP] Erro:', error);
    return false;
  }
}

/**
 * Verifica conexão com servidor de email
 */
export async function verifyConnection(): Promise<boolean> {
  if (EMAIL_PROVIDER === 'smtp') {
    try {
      await smtpTransporter.verify();
      console.log('Conexão SMTP verificada');
      return true;
    } catch (error) {
      console.error('Erro na conexão SMTP:', error);
      return false;
    }
  }

  // Para outros providers, retorna true (verificação online)
  return true;
}

// ============================================================
// TEMPLATES DE EMAIL
// ============================================================

const LOGO_URL = process.env.EMAIL_LOGO_URL || 'https://wgalmeida.com.br/logo-wg-grupo.svg';
const COMPANY_NAME = process.env.EMAIL_COMPANY_NAME || 'Grupo WG Almeida';
const PRIMARY_COLOR = '#F25C26';

/**
 * Template base para emails
 */
function baseTemplate(content: string, title: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="padding: 30px 40px; text-align: center; border-bottom: 1px solid #eee;">
              <img src="${LOGO_URL}" alt="${COMPANY_NAME}" style="height: 60px; max-width: 200px;">
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #fafafa; border-top: 1px solid #eee; border-radius: 0 0 16px 16px;">
              <p style="margin: 0; font-size: 12px; color: #666; text-align: center;">
                ${COMPANY_NAME}<br>
                Este é um email automático, por favor não responda.
              </p>
              <p style="margin: 15px 0 0; font-size: 11px; color: #999; text-align: center;">
                © ${new Date().getFullYear()} ${COMPANY_NAME}. Todos os direitos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Template de boas-vindas
 */
export function welcomeTemplate(nome: string, senha?: string): EmailTemplate {
  const content = `
    <h1 style="margin: 0 0 20px; color: #333; font-size: 24px;">Bem-vindo ao WGEasy!</h1>
    <p style="margin: 0 0 15px; color: #555; font-size: 16px; line-height: 1.6;">
      Olá <strong>${nome}</strong>,
    </p>
    <p style="margin: 0 0 15px; color: #555; font-size: 16px; line-height: 1.6;">
      Sua conta foi criada com sucesso no sistema WGEasy do ${COMPANY_NAME}.
    </p>
    ${senha ? `
    <div style="margin: 25px 0; padding: 20px; background-color: #fff8f5; border-left: 4px solid ${PRIMARY_COLOR}; border-radius: 8px;">
      <p style="margin: 0 0 10px; color: #333; font-size: 14px;"><strong>Sua senha temporária:</strong></p>
      <p style="margin: 0; font-family: monospace; font-size: 20px; color: ${PRIMARY_COLOR}; letter-spacing: 2px;">${senha}</p>
    </div>
    <p style="margin: 0 0 15px; color: #555; font-size: 14px;">
      Recomendamos alterar sua senha após o primeiro acesso.
    </p>
    ` : ''}
    <a href="https://wgx.wgalmeida.com.br/login" style="display: inline-block; margin-top: 20px; padding: 14px 32px; background-color: ${PRIMARY_COLOR}; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600;">
      Acessar Sistema
    </a>
  `;

  return {
    subject: `Bem-vindo ao WGEasy - ${COMPANY_NAME}`,
    html: baseTemplate(content, 'Bem-vindo ao WGEasy'),
    text: `Bem-vindo ao WGEasy!\n\nOlá ${nome},\n\nSua conta foi criada com sucesso.${senha ? `\n\nSua senha temporária: ${senha}` : ''}\n\nAcesse: https://wgx.wgalmeida.com.br/login`,
  };
}

/**
 * Template de recuperação de senha
 */
export function passwordResetTemplate(nome: string, resetLink: string): EmailTemplate {
  const content = `
    <h1 style="margin: 0 0 20px; color: #333; font-size: 24px;">Recuperação de Senha</h1>
    <p style="margin: 0 0 15px; color: #555; font-size: 16px; line-height: 1.6;">
      Olá <strong>${nome}</strong>,
    </p>
    <p style="margin: 0 0 15px; color: #555; font-size: 16px; line-height: 1.6;">
      Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo para criar uma nova senha:
    </p>
    <a href="${resetLink}" style="display: inline-block; margin: 25px 0; padding: 14px 32px; background-color: ${PRIMARY_COLOR}; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600;">
      Redefinir Senha
    </a>
    <p style="margin: 0; color: #888; font-size: 13px;">
      Este link expira em 1 hora. Se você não solicitou esta recuperação, ignore este email.
    </p>
  `;

  return {
    subject: `Recuperação de Senha - ${COMPANY_NAME}`,
    html: baseTemplate(content, 'Recuperação de Senha'),
    text: `Recuperação de Senha\n\nOlá ${nome},\n\nClique no link para redefinir sua senha:\n${resetLink}\n\nEste link expira em 1 hora.`,
  };
}

/**
 * Template de notificação genérica
 */
export function notificationTemplate(
  titulo: string,
  mensagem: string,
  actionUrl?: string,
  actionText?: string
): EmailTemplate {
  const content = `
    <h1 style="margin: 0 0 20px; color: #333; font-size: 24px;">${titulo}</h1>
    <div style="margin: 0 0 20px; color: #555; font-size: 16px; line-height: 1.6;">
      ${mensagem}
    </div>
    ${actionUrl ? `
    <a href="${actionUrl}" style="display: inline-block; margin-top: 15px; padding: 14px 32px; background-color: ${PRIMARY_COLOR}; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600;">
      ${actionText || 'Ver Detalhes'}
    </a>
    ` : ''}
  `;

  return {
    subject: `${titulo} - ${COMPANY_NAME}`,
    html: baseTemplate(content, titulo),
    text: `${titulo}\n\n${mensagem.replace(/<[^>]*>/g, '')}${actionUrl ? `\n\n${actionUrl}` : ''}`,
  };
}

/**
 * Template de lembrete de compromisso/tarefa
 */
export function reminderTemplate(
  nome: string,
  titulo: string,
  dataHora: string,
  descricao?: string
): EmailTemplate {
  const content = `
    <h1 style="margin: 0 0 20px; color: #333; font-size: 24px;">Lembrete</h1>
    <p style="margin: 0 0 15px; color: #555; font-size: 16px;">
      Olá <strong>${nome}</strong>,
    </p>
    <div style="margin: 20px 0; padding: 20px; background-color: #fff8f5; border-radius: 12px; border: 1px solid #ffe0d0;">
      <h2 style="margin: 0 0 10px; color: ${PRIMARY_COLOR}; font-size: 20px;">${titulo}</h2>
      <p style="margin: 0 0 10px; color: #666; font-size: 14px;">
        <strong>Data/Hora:</strong> ${dataHora}
      </p>
      ${descricao ? `<p style="margin: 0; color: #555; font-size: 14px;">${descricao}</p>` : ''}
    </div>
  `;

  return {
    subject: `Lembrete: ${titulo} - ${COMPANY_NAME}`,
    html: baseTemplate(content, 'Lembrete'),
    text: `Lembrete\n\nOlá ${nome},\n\n${titulo}\nData/Hora: ${dataHora}${descricao ? `\n\n${descricao}` : ''}`,
  };
}

/**
 * Template de proposta/contrato
 */
export function proposalTemplate(
  clienteNome: string,
  propostaNumero: string,
  valor: string,
  actionUrl: string
): EmailTemplate {
  const content = `
    <h1 style="margin: 0 0 20px; color: #333; font-size: 24px;">Nova Proposta Disponível</h1>
    <p style="margin: 0 0 15px; color: #555; font-size: 16px; line-height: 1.6;">
      Olá <strong>${clienteNome}</strong>,
    </p>
    <p style="margin: 0 0 20px; color: #555; font-size: 16px; line-height: 1.6;">
      Uma nova proposta foi gerada para você. Confira os detalhes abaixo:
    </p>
    <div style="margin: 25px 0; padding: 25px; background-color: #f9f9f9; border-radius: 12px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="8">
        <tr>
          <td style="color: #666; font-size: 14px;">Proposta:</td>
          <td style="color: #333; font-size: 16px; font-weight: 600;">#${propostaNumero}</td>
        </tr>
        <tr>
          <td style="color: #666; font-size: 14px;">Valor:</td>
          <td style="color: ${PRIMARY_COLOR}; font-size: 20px; font-weight: 700;">${valor}</td>
        </tr>
      </table>
    </div>
    <a href="${actionUrl}" style="display: inline-block; margin-top: 15px; padding: 14px 32px; background-color: ${PRIMARY_COLOR}; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600;">
      Ver Proposta Completa
    </a>
  `;

  return {
    subject: `Proposta #${propostaNumero} - ${COMPANY_NAME}`,
    html: baseTemplate(content, 'Nova Proposta'),
    text: `Nova Proposta Disponível\n\nOlá ${clienteNome},\n\nProposta: #${propostaNumero}\nValor: ${valor}\n\nAcesse: ${actionUrl}`,
  };
}

export default {
  sendEmail,
  verifyConnection,
  welcomeTemplate,
  passwordResetTemplate,
  notificationTemplate,
  reminderTemplate,
  proposalTemplate,
};
