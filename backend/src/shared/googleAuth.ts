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

let cachedKey: ServiceAccountKey | null = null;

function loadServiceAccountKey(): ServiceAccountKey | null {
  if (cachedKey) {
    return cachedKey;
  }

  const inlineKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (inlineKey) {
    try {
      cachedKey = JSON.parse(inlineKey);
      return cachedKey;
    } catch (error) {
      console.error("Erro ao parsear GOOGLE_SERVICE_ACCOUNT_KEY:", error);
    }
  }

  const filePath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH;
  if (filePath) {
    try {
      const resolved = path.isAbsolute(filePath)
        ? filePath
        : path.resolve(filePath);
      const fileContent = fs.readFileSync(resolved, "utf-8");
      cachedKey = JSON.parse(fileContent);
      return cachedKey;
    } catch (error) {
      console.error("Erro ao carregar a chave da Service Account:", error);
    }
  }

  return null;
}

export function hasServiceAccount(): boolean {
  return Boolean(loadServiceAccountKey());
}

export function createServiceAccountClient(scopes: string[]): google.auth.JWT | null {
  const key = loadServiceAccountKey();
  if (!key) return null;
  return new google.auth.JWT(
    key.client_email,
    undefined,
    key.private_key,
    scopes,
    process.env.GOOGLE_SERVICE_ACCOUNT_SUBJECT
  );
}

export async function getServiceAccountAccessToken(
  scopes: string[]
): Promise<{ client: google.auth.JWT; accessToken: string } | null> {
  const client = createServiceAccountClient(scopes);
  if (!client) return null;
  const { access_token } = await client.authorize();
  if (!access_token) {
    throw new Error("Não foi possível obter access token da Service Account");
  }
  return { client, accessToken: access_token };
}
