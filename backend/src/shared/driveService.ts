// ============================================================
// GOOGLE DRIVE SERVICE - WG Easy
// Grupo WG Almeida
// ============================================================

import { google, drive_v3 } from 'googleapis';
import { createServiceAccountClient } from './googleAuth';

// Configuração do OAuth2 (mesmas credenciais do Calendar)
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/auth/google/callback'
);

// Cliente do Drive
const drive = google.drive({ version: 'v3' });

const DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
];

// ID da pasta raiz de clientes (configurável via env)
const CLIENTES_ROOT_FOLDER_ID = process.env.GOOGLE_DRIVE_CLIENTES_FOLDER_ID || '';

async function resolveDriveAuth(
  accessToken?: string
): Promise<google.auth.OAuth2 | google.auth.JWT> {
  if (accessToken) {
    oauth2Client.setCredentials({ access_token: accessToken });
    return oauth2Client;
  }

  const serviceAccount = createServiceAccountClient(DRIVE_SCOPES);
  if (serviceAccount) {
    await serviceAccount.authorize();
    return serviceAccount;
  }

  return oauth2Client;
}

// ============================================================
// TIPOS
// ============================================================

export interface DriveFolder {
  id: string;
  name: string;
  webViewLink: string;
  createdTime?: string;
}

export interface CreateFolderOptions {
  name: string;
  parentFolderId?: string;
  description?: string;
}

// ============================================================
// FUNÇÕES DE AUTENTICAÇÃO
// ============================================================

/**
 * Gera URL de autenticação OAuth2 para Drive
 */
export function getDriveAuthUrl(): string {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.file',
    ],
  });
}

/**
 * Define tokens no cliente OAuth2
 */
export function setDriveCredentials(tokens: { access_token: string; refresh_token?: string }) {
  oauth2Client.setCredentials(tokens);
}

// ============================================================
// FUNÇÕES DE PASTA
// ============================================================

/**
 * Cria uma nova pasta no Google Drive
 */
export async function createFolder(
  options: CreateFolderOptions,
  accessToken?: string
): Promise<DriveFolder | null> {
  try {
    const auth = await resolveDriveAuth(accessToken);

    const fileMetadata: drive_v3.Schema$File = {
      name: options.name,
      mimeType: 'application/vnd.google-apps.folder',
      description: options.description,
    };

    // Se tiver pasta pai, adiciona
    if (options.parentFolderId) {
      fileMetadata.parents = [options.parentFolderId];
    } else if (CLIENTES_ROOT_FOLDER_ID) {
      // Usa pasta raiz de clientes como padrão
      fileMetadata.parents = [CLIENTES_ROOT_FOLDER_ID];
    }

    const response = await drive.files.create({
      auth,
      requestBody: fileMetadata,
      fields: 'id, name, webViewLink, createdTime',
    });

    if (response.data.id) {
      // Configurar permissões de compartilhamento (qualquer pessoa com o link pode ver)
      await drive.permissions.create({
        auth,
        fileId: response.data.id,
        requestBody: {
          type: 'anyone',
          role: 'reader',
        },
      });

      return {
        id: response.data.id,
        name: response.data.name || options.name,
        webViewLink: response.data.webViewLink || `https://drive.google.com/drive/folders/${response.data.id}`,
        createdTime: response.data.createdTime || undefined,
      };
    }

    return null;
  } catch (error) {
    console.error('Erro ao criar pasta no Drive:', error);
    throw error;
  }
}

/**
 * Cria estrutura de pastas para um cliente
 * Estrutura: NOME_CLIENTE/
 *   ├── 01. Documentos
 *   ├── 02. Projeto
 *   ├── 03. Orçamentos
 *   ├── 04. Contratos
 *   ├── 05. Diário de Obra
 *   ├── 06. Fotos
 *   └── 07. Financeiro
 */
export async function createClienteFolderStructure(
  clienteNome: string,
  accessToken?: string
): Promise<DriveFolder | null> {
  try {
    // 1. Criar pasta principal do cliente
    const mainFolder = await createFolder({
      name: clienteNome,
      description: `Pasta do cliente: ${clienteNome}`,
    }, accessToken);

    if (!mainFolder) {
      throw new Error('Falha ao criar pasta principal do cliente');
    }

    // 2. Criar subpastas
    const subfolders = [
      '01. Documentos',
      '02. Projeto',
      '03. Orçamentos',
      '04. Contratos',
      '05. Diário de Obra',
      '06. Fotos',
      '07. Financeiro',
    ];

    for (const subfolderName of subfolders) {
      await createFolder({
        name: subfolderName,
        parentFolderId: mainFolder.id,
      }, accessToken);
    }

    return mainFolder;
  } catch (error) {
    console.error('Erro ao criar estrutura de pastas do cliente:', error);
    throw error;
  }
}

/**
 * Busca pasta por nome dentro de uma pasta pai
 */
export async function findFolderByName(
  folderName: string,
  parentFolderId?: string,
  accessToken?: string
): Promise<DriveFolder | null> {
  try {
    const auth = await resolveDriveAuth(accessToken);

    let query = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;

    if (parentFolderId) {
      query += ` and '${parentFolderId}' in parents`;
    } else if (CLIENTES_ROOT_FOLDER_ID) {
      query += ` and '${CLIENTES_ROOT_FOLDER_ID}' in parents`;
    }

    const response = await drive.files.list({
      auth,
      q: query,
      fields: 'files(id, name, webViewLink, createdTime)',
      pageSize: 1,
    });

    if (response.data.files && response.data.files.length > 0) {
      const file = response.data.files[0];
      return {
        id: file.id || '',
        name: file.name || '',
        webViewLink: file.webViewLink || `https://drive.google.com/drive/folders/${file.id}`,
        createdTime: file.createdTime || undefined,
      };
    }

    return null;
  } catch (error) {
    console.error('Erro ao buscar pasta:', error);
    return null;
  }
}

/**
 * Busca ou cria pasta do cliente
 */
export async function getOrCreateClienteFolder(
  clienteNome: string,
  accessToken?: string
): Promise<DriveFolder> {
  // Primeiro tenta encontrar pasta existente
  const existingFolder = await findFolderByName(clienteNome, undefined, accessToken);

  if (existingFolder) {
    return existingFolder;
  }

  // Se não encontrou, cria nova estrutura
  const newFolder = await createClienteFolderStructure(clienteNome, accessToken);

  if (!newFolder) {
    throw new Error('Não foi possível criar pasta do cliente');
  }

  return newFolder;
}

export async function uploadFileToFolder(
  folderId: string,
  fileName: string,
  buffer: Buffer,
  mimeType: string,
  accessToken?: string
): Promise<DriveFolder | null> {
  try {
    const auth = await resolveDriveAuth(accessToken);

    const response = await drive.files.create({
      auth,
      requestBody: {
        name: fileName,
        parents: [folderId],
      },
      media: {
        mimeType,
        body: buffer,
      },
      fields: 'id, name, webViewLink, createdTime',
    });

    if (response.data.id) {
      await drive.permissions.create({
        auth,
        fileId: response.data.id,
        requestBody: {
          type: 'anyone',
          role: 'reader',
        },
      });

      return {
        id: response.data.id,
        name: response.data.name || fileName,
        webViewLink:
          response.data.webViewLink ||
          `https://drive.google.com/file/d/${response.data.id}`,
        createdTime: response.data.createdTime || undefined,
      };
    }

    return null;
  } catch (error) {
    console.error('Erro ao enviar arquivo para o Drive:', error);
    return null;
  }
}

export default {
  getDriveAuthUrl,
  setDriveCredentials,
  createFolder,
  createClienteFolderStructure,
  findFolderByName,
  getOrCreateClienteFolder,
};
