// ============================================================
// BTG PACTUAL EMPRESAS - AUTENTICAÇÃO OAUTH2
// ============================================================

import { btgConfig } from './btgConfig';
import crypto from 'crypto';

// Interface para tokens
interface BTGTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  expires_at: Date;
  scope: string;
}

// Cache de tokens em memória (em produção usar Redis/DB)
let tokenCache: BTGTokens | null = null;

/**
 * Gera URL de autorização para iniciar fluxo OAuth2
 * O usuário deve ser redirecionado para esta URL para autorizar o acesso
 */
export function getAuthorizationUrl(redirectUri: string, state?: string): string {
  const params = new URLSearchParams({
    client_id: btgConfig.clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: btgConfig.scopes,
    state: state || crypto.randomUUID()
  });

  return `${btgConfig.authUrl}/oauth/authorize?${params.toString()}`;
}

/**
 * Troca o código de autorização por tokens de acesso
 */
export async function exchangeCodeForTokens(
  code: string,
  redirectUri: string
): Promise<BTGTokens> {
  const response = await fetch(`${btgConfig.authUrl}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${btgConfig.clientId}:${btgConfig.clientSecret}`).toString('base64')}`
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri
    }).toString()
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[BTG Auth] Erro ao trocar código:', error);
    throw new Error(`Falha na autenticação BTG: ${response.status}`);
  }

  const data = await response.json();

  const tokens: BTGTokens = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    token_type: data.token_type,
    expires_in: data.expires_in,
    expires_at: new Date(Date.now() + (data.expires_in * 1000)),
    scope: data.scope
  };

  // Cachear tokens
  tokenCache = tokens;

  console.log('[BTG Auth] Tokens obtidos com sucesso');
  return tokens;
}

/**
 * Renova o access_token usando o refresh_token
 */
export async function refreshAccessToken(refreshToken: string): Promise<BTGTokens> {
  const response = await fetch(`${btgConfig.authUrl}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${btgConfig.clientId}:${btgConfig.clientSecret}`).toString('base64')}`
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    }).toString()
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[BTG Auth] Erro ao renovar token:', error);
    throw new Error(`Falha ao renovar token BTG: ${response.status}`);
  }

  const data = await response.json();

  const tokens: BTGTokens = {
    access_token: data.access_token,
    refresh_token: data.refresh_token || refreshToken, // Alguns fluxos não retornam novo refresh_token
    token_type: data.token_type,
    expires_in: data.expires_in,
    expires_at: new Date(Date.now() + (data.expires_in * 1000)),
    scope: data.scope
  };

  // Atualizar cache
  tokenCache = tokens;

  console.log('[BTG Auth] Token renovado com sucesso');
  return tokens;
}

/**
 * Obtém token válido (do cache ou renova se expirado)
 * Para uso com Client Credentials (sem usuário)
 */
export async function getClientCredentialsToken(): Promise<string> {
  // Verificar se tem token válido em cache
  if (tokenCache && tokenCache.expires_at > new Date()) {
    return tokenCache.access_token;
  }

  // Obter novo token via Client Credentials
  const response = await fetch(`${btgConfig.authUrl}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${btgConfig.clientId}:${btgConfig.clientSecret}`).toString('base64')}`
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      scope: btgConfig.scopes
    }).toString()
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[BTG Auth] Erro ao obter token client_credentials:', error);
    throw new Error(`Falha ao obter token BTG: ${response.status}`);
  }

  const data = await response.json();

  tokenCache = {
    access_token: data.access_token,
    refresh_token: '',
    token_type: data.token_type,
    expires_in: data.expires_in,
    expires_at: new Date(Date.now() + (data.expires_in * 1000)),
    scope: data.scope
  };

  return tokenCache.access_token;
}

/**
 * Obtém o token de acesso atual (se disponível)
 */
export function getCurrentToken(): BTGTokens | null {
  return tokenCache;
}

/**
 * Limpa o cache de tokens
 */
export function clearTokenCache(): void {
  tokenCache = null;
  console.log('[BTG Auth] Cache de tokens limpo');
}

/**
 * Verifica se está autenticado com token válido
 */
export function isAuthenticated(): boolean {
  return tokenCache !== null && tokenCache.expires_at > new Date();
}

/**
 * Armazena tokens vindos do banco de dados
 */
export function setTokensFromDB(tokens: BTGTokens): void {
  tokenCache = tokens;
  console.log('[BTG Auth] Tokens carregados do banco de dados');
}

export default {
  getAuthorizationUrl,
  exchangeCodeForTokens,
  refreshAccessToken,
  getClientCredentialsToken,
  getCurrentToken,
  clearTokenCache,
  isAuthenticated,
  setTokensFromDB
};
