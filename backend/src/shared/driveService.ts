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

type OAuth2ClientInstance = InstanceType<typeof google.auth.OAuth2>;
type JWTClientInstance = InstanceType<typeof google.auth.JWT>;

const DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
];

// ID da pasta raiz de clientes (configurável via env)
const CLIENTES_ROOT_FOLDER_ID = process.env.GOOGLE_DRIVE_CLIENTES_FOLDER_ID || '';

async function resolveDriveAuth(
  accessToken?: string
): Promise<OAuth2ClientInstance | JWTClientInstance> {
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

// ============================================================
// FUNÇÕES DE LISTAGEM DE ARQUIVOS
// ============================================================

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  webContentLink?: string;
  thumbnailLink?: string;
  /** URL pública direta da imagem (funciona sem autenticação) */
  directImageUrl?: string;
  size?: string;
  createdTime?: string;
  modifiedTime?: string;
}

/**
 * Lista arquivos de uma pasta do Google Drive
 * @param folderId ID da pasta
 * @param mimeTypeFilter Filtro opcional de mimeType (ex: 'image/' para imagens)
 */
export async function listFilesInFolder(
  folderId: string,
  mimeTypeFilter?: string,
  accessToken?: string
): Promise<DriveFile[]> {
  try {
    const auth = await resolveDriveAuth(accessToken);

    let query = `'${folderId}' in parents and trashed = false`;

    // Adicionar filtro de mimeType se especificado
    if (mimeTypeFilter) {
      query += ` and mimeType contains '${mimeTypeFilter}'`;
    }

    const response = await drive.files.list({
      auth,
      q: query,
      fields: 'files(id, name, mimeType, webViewLink, webContentLink, thumbnailLink, size, createdTime, modifiedTime)',
      orderBy: 'createdTime desc',
      pageSize: 100,
    });

    if (response.data.files) {
      return response.data.files.map((file: any) => {
        const fileId = file.id || '';
        // Gerar URLs públicas que funcionam sem autenticação OAuth
        // Formato: https://drive.google.com/thumbnail?id=FILE_ID&sz=w400 (thumbnail)
        // Formato: https://lh3.googleusercontent.com/d/FILE_ID (imagem direta)
        const publicThumbnailUrl = fileId ? `https://drive.google.com/thumbnail?id=${fileId}&sz=w400` : undefined;
        const publicImageUrl = fileId ? `https://lh3.googleusercontent.com/d/${fileId}` : undefined;

        return {
          id: fileId,
          name: file.name || '',
          mimeType: file.mimeType || '',
          webViewLink: file.webViewLink || '',
          webContentLink: file.webContentLink,
          // Priorizar URL pública que funciona sem auth
          thumbnailLink: publicThumbnailUrl,
          // URL direta da imagem (funciona para arquivos compartilhados)
          directImageUrl: publicImageUrl,
          size: file.size,
          createdTime: file.createdTime,
          modifiedTime: file.modifiedTime,
        };
      });
    }

    return [];
  } catch (error) {
    console.error('Erro ao listar arquivos da pasta:', error);
    return [];
  }
}

/**
 * Lista subpastas de uma pasta do Google Drive
 */
export async function listSubfolders(
  folderId: string,
  accessToken?: string
): Promise<DriveFolder[]> {
  try {
    const auth = await resolveDriveAuth(accessToken);

    const query = `'${folderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;

    const response = await drive.files.list({
      auth,
      q: query,
      fields: 'files(id, name, webViewLink, createdTime)',
      orderBy: 'name',
      pageSize: 50,
    });

    if (response.data.files) {
      return response.data.files.map((file: any) => ({
        id: file.id || '',
        name: file.name || '',
        webViewLink: file.webViewLink || `https://drive.google.com/drive/folders/${file.id}`,
        createdTime: file.createdTime,
      }));
    }

    return [];
  } catch (error) {
    console.error('Erro ao listar subpastas:', error);
    return [];
  }
}

/**
 * Busca recursivamente por uma subpasta específica (ex: "Diário de Obra", "Fotos")
 */
export async function findSubfolderByPattern(
  folderId: string,
  patterns: string[],
  maxDepth: number = 3,
  accessToken?: string
): Promise<DriveFolder | null> {
  try {
    const subfolders = await listSubfolders(folderId, accessToken);

    // Verificar no nível atual
    for (const folder of subfolders) {
      const folderNameLower = folder.name.toLowerCase();
      for (const pattern of patterns) {
        if (folderNameLower.includes(pattern.toLowerCase())) {
          return folder;
        }
      }
    }

    // Se não encontrou e ainda pode ir mais fundo, buscar recursivamente
    if (maxDepth > 0) {
      for (const folder of subfolders) {
        const found = await findSubfolderByPattern(folder.id, patterns, maxDepth - 1, accessToken);
        if (found) return found;
      }
    }

    return null;
  } catch (error) {
    console.error('Erro ao buscar subpasta:', error);
    return null;
  }
}

/**
 * Lista todas as imagens de uma pasta e suas subpastas "Diário de Obra" ou "Fotos"
 */
export async function listDiarioObraImages(
  clienteFolderId: string,
  accessToken?: string
): Promise<{ folder: string; files: DriveFile[] }[]> {
  const results: { folder: string; files: DriveFile[] }[] = [];

  try {
    // Padrões de nomes de pastas de fotos
    const fotoPastaPatterns = [
      'diário de obra',
      'diario de obra',
      'fotos da obra',
      'fotos do imóvel',
      'fotos do imovel',
      '04 . diário',
      '05 . diário',
      '06 . fotos',
      'fotos',
      'durante',
      'antes',
      'depois',
    ];

    // Buscar pasta de fotos/diário
    const fotoPasta = await findSubfolderByPattern(clienteFolderId, fotoPastaPatterns, 3, accessToken);

    if (fotoPasta) {
      // Listar imagens da pasta encontrada
      const images = await listFilesInFolder(fotoPasta.id, 'image/', accessToken);
      if (images.length > 0) {
        results.push({ folder: fotoPasta.name, files: images });
      }

      // Verificar subpastas (ex: Antes, Durante, Depois)
      const subfolders = await listSubfolders(fotoPasta.id, accessToken);
      for (const sub of subfolders) {
        const subImages = await listFilesInFolder(sub.id, 'image/', accessToken);
        if (subImages.length > 0) {
          results.push({ folder: `${fotoPasta.name}/${sub.name}`, files: subImages });
        }
      }
    }

    // Se não encontrou nada específico, listar imagens diretamente da pasta principal
    if (results.length === 0) {
      const rootImages = await listFilesInFolder(clienteFolderId, 'image/', accessToken);
      if (rootImages.length > 0) {
        results.push({ folder: 'Fotos', files: rootImages });
      }
    }

    return results;
  } catch (error) {
    console.error('Erro ao listar imagens do diário de obra:', error);
    return results;
  }
}

export default {
  getDriveAuthUrl,
  setDriveCredentials,
  createFolder,
  createClienteFolderStructure,
  findFolderByName,
  getOrCreateClienteFolder,
  listFilesInFolder,
  listSubfolders,
  findSubfolderByPattern,
  listDiarioObraImages,
};
