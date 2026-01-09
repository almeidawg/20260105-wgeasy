import fs from "fs";
import { google } from "googleapis";
import path from "path";

export interface ServiceAccountKey {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

// Tipos de serviço suportados
export type ServiceType = 'default' | 'drive' | 'calendar' | 'keep';

// Cache de chaves por tipo de serviço
const cachedKeys: Record<ServiceType, ServiceAccountKey | null | undefined> = {
  default: undefined,
  drive: undefined,
  calendar: undefined,
  keep: undefined,
};

// Mapeamento de variáveis de ambiente por tipo de serviço
const ENV_VAR_MAP: Record<ServiceType, { key: string; path: string }> = {
  default: {
    key: 'GOOGLE_SERVICE_ACCOUNT_KEY',
    path: 'GOOGLE_SERVICE_ACCOUNT_KEY_PATH',
  },
  drive: {
    key: 'GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY',
    path: 'GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY_PATH',
  },
  calendar: {
    key: 'GOOGLE_CALENDAR_SERVICE_ACCOUNT_KEY',
    path: 'GOOGLE_CALENDAR_SERVICE_ACCOUNT_KEY_PATH',
  },
  keep: {
    key: 'GOOGLE_KEEP_SERVICE_ACCOUNT_KEY',
    path: 'GOOGLE_KEEP_SERVICE_ACCOUNT_KEY_PATH',
  },
};

/**
 * Carrega a chave da Service Account para um serviço específico
 * Prioridade: chave específica do serviço > chave padrão
 */
function loadServiceAccountKeyForService(serviceType: ServiceType): ServiceAccountKey | null {
  // Verificar cache
  if (cachedKeys[serviceType] !== undefined) {
    return cachedKeys[serviceType];
  }

  // Tentar carregar chave específica do serviço
  const envVars = ENV_VAR_MAP[serviceType];
  let key = tryLoadKey(envVars.key, envVars.path);

  // Se não encontrou e não é 'default', tentar chave padrão
  if (!key && serviceType !== 'default') {
    const defaultEnvVars = ENV_VAR_MAP.default;
    key = tryLoadKey(defaultEnvVars.key, defaultEnvVars.path);
  }

  cachedKeys[serviceType] = key;
  return key;
}

function tryLoadKey(envKeyName: string, envPathName: string): ServiceAccountKey | null {
  // Tentar carregar da variável de ambiente inline
  const inlineKey = process.env[envKeyName];
  if (inlineKey) {
    try {
      return JSON.parse(inlineKey);
    } catch (error) {
      console.error(`Erro ao parsear ${envKeyName}:`, error);
    }
  }

  // Tentar carregar do arquivo
  const filePath = process.env[envPathName];
  if (filePath) {
    try {
      const resolved = path.isAbsolute(filePath)
        ? filePath
        : path.resolve(filePath);
      const fileContent = fs.readFileSync(resolved, "utf-8");
      return JSON.parse(fileContent);
    } catch (error) {
      console.error(`Erro ao carregar a chave da Service Account de ${envPathName}:`, error);
    }
  }

  return null;
}

// Função legada para compatibilidade
function loadServiceAccountKey(): ServiceAccountKey | null {
  return loadServiceAccountKeyForService('default');
}

export function hasServiceAccount(): boolean {
  return Boolean(loadServiceAccountKey());
}

export function hasServiceAccountForService(serviceType: ServiceType): boolean {
  return Boolean(loadServiceAccountKeyForService(serviceType));
}

type GoogleJWT = InstanceType<typeof google.auth.JWT>;

/**
 * Cria cliente JWT para um serviço específico
 */
export function createServiceAccountClientForService(
  scopes: string[],
  serviceType: ServiceType,
  subject?: string
): GoogleJWT | null {
  const key = loadServiceAccountKeyForService(serviceType);
  if (!key) return null;
  return new google.auth.JWT(
    key.client_email,
    undefined,
    key.private_key,
    scopes,
    subject || process.env.GOOGLE_SERVICE_ACCOUNT_SUBJECT
  );
}

// Função legada para compatibilidade
export function createServiceAccountClient(scopes: string[]): GoogleJWT | null {
  return createServiceAccountClientForService(scopes, 'default');
}

export async function getServiceAccountAccessToken(
  scopes: string[]
): Promise<{ client: GoogleJWT; accessToken: string } | null> {
  const client = createServiceAccountClient(scopes);
  if (!client) return null;
  const { access_token } = await client.authorize();
  if (!access_token) {
    throw new Error("Não foi possível obter access token da Service Account");
  }
  return { client, accessToken: access_token };
}
