// ============================================================
// SERVIÇO: Google Drive Integration
// Gerenciamento de pastas e arquivos no Google Drive
// ============================================================

import { google } from 'googleapis';

// Configuração
const FOLDER_ID_BASE = import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID || '187SLb40TwrePIfuYwlxLi7htLqrnJoIv';

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  webContentLink?: string;
  size?: string;
  createdTime: string;
}

interface CreateFolderResult {
  folderId: string;
  folderUrl: string;
}

/**
 * Classe de serviço para integração com Google Drive
 */
class GoogleDriveService {
  private drive: any;
  private initialized: boolean = false;

  /**
   * Inicializa a autenticação com Google Drive
   */
  async initialize() {
    if (this.initialized) return;

    try {
      const clientEmail = import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_EMAIL;
      const privateKey = import.meta.env.VITE_GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, '\n');

      if (!clientEmail || !privateKey) {
        throw new Error('Credenciais do Google Drive não configuradas. Verifique o arquivo .env.local');
      }

      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: clientEmail,
          private_key: privateKey,
        },
        scopes: [
          'https://www.googleapis.com/auth/drive',
          'https://www.googleapis.com/auth/drive.file',
        ],
      });

      this.drive = google.drive({ version: 'v3', auth });
      this.initialized = true;
      console.log('✅ Google Drive Service inicializado');
    } catch (error) {
      console.error('❌ Erro ao inicializar Google Drive:', error);
      throw error;
    }
  }

  /**
   * Cria uma pasta para o cliente/oportunidade
   * @param clienteNome Nome do cliente
   * @param oportunidadeId ID da oportunidade
   * @returns ID e URL da pasta criada
   */
  async criarPastaCliente(clienteNome: string, oportunidadeId: string): Promise<CreateFolderResult> {
    await this.initialize();

    try {
      const folderName = `${clienteNome} - ${oportunidadeId}`;

      // Verificar se pasta já existe
      const existingFolder = await this.buscarPasta(folderName, FOLDER_ID_BASE);
      if (existingFolder) {
        console.log('📁 Pasta já existe:', existingFolder.name);
        return {
          folderId: existingFolder.id,
          folderUrl: existingFolder.webViewLink,
        };
      }

      // Criar pasta principal do cliente
      const folderMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [FOLDER_ID_BASE],
      };

      const folder = await this.drive.files.create({
        requestBody: folderMetadata,
        fields: 'id, name, webViewLink',
      });

      const mainFolderId = folder.data.id;

      // Criar subpastas (Plantas, Fotos, Documentos)
      const subfolders = ['Plantas', 'Fotos', 'Documentos'];
      for (const subfolder of subfolders) {
        await this.drive.files.create({
          requestBody: {
            name: subfolder,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [mainFolderId],
          },
          fields: 'id, name',
        });
      }

      console.log('✅ Pasta criada no Google Drive:', folder.data.name);

      return {
        folderId: mainFolderId,
        folderUrl: folder.data.webViewLink,
      };
    } catch (error) {
      console.error('❌ Erro ao criar pasta no Google Drive:', error);
      throw error;
    }
  }

  /**
   * Busca uma pasta por nome
   */
  private async buscarPasta(nome: string, parentId: string): Promise<DriveFile | null> {
    try {
      const response = await this.drive.files.list({
        q: `name='${nome}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name, webViewLink)',
        spaces: 'drive',
      });

      return response.data.files?.[0] || null;
    } catch (error) {
      console.error('❌ Erro ao buscar pasta:', error);
      return null;
    }
  }

  /**
   * Faz upload de um arquivo para o Google Drive
   * @param file Arquivo a ser enviado
   * @param pastaId ID da pasta de destino
   * @param tipo Tipo de arquivo (plantas, fotos, documentos)
   */
  async uploadArquivo(file: File, pastaId: string, tipo: 'Plantas' | 'Fotos' | 'Documentos'): Promise<DriveFile> {
    await this.initialize();

    try {
      // Buscar ID da subpasta
      const subpasta = await this.buscarPasta(tipo, pastaId);
      const targetFolderId = subpasta?.id || pastaId;

      // Converter File para Buffer (para Node.js) ou usar FormData
      const fileMetadata = {
        name: file.name,
        parents: [targetFolderId],
      };

      const media = {
        mimeType: file.type,
        body: file.stream(),
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name, mimeType, webViewLink, webContentLink, size, createdTime',
      });

      console.log('✅ Arquivo enviado para Google Drive:', response.data.name);

      return response.data;
    } catch (error) {
      console.error('❌ Erro ao fazer upload:', error);
      throw error;
    }
  }

  /**
   * Lista todos os arquivos de uma pasta
   */
  async listarArquivos(pastaId: string): Promise<DriveFile[]> {
    await this.initialize();

    try {
      const response = await this.drive.files.list({
        q: `'${pastaId}' in parents and trashed=false`,
        fields: 'files(id, name, mimeType, webViewLink, webContentLink, size, createdTime)',
        orderBy: 'createdTime desc',
      });

      return response.data.files || [];
    } catch (error) {
      console.error('❌ Erro ao listar arquivos:', error);
      return [];
    }
  }

  /**
   * Exclui um arquivo do Google Drive
   */
  async excluirArquivo(fileId: string): Promise<void> {
    await this.initialize();

    try {
      await this.drive.files.delete({
        fileId: fileId,
      });

      console.log('✅ Arquivo excluído do Google Drive');
    } catch (error) {
      console.error('❌ Erro ao excluir arquivo:', error);
      throw error;
    }
  }

  /**
   * Obtém o link de compartilhamento de uma pasta
   */
  async obterLinkPasta(pastaId: string): Promise<string> {
    await this.initialize();

    try {
      const response = await this.drive.files.get({
        fileId: pastaId,
        fields: 'webViewLink',
      });

      return response.data.webViewLink;
    } catch (error) {
      console.error('❌ Erro ao obter link da pasta:', error);
      throw error;
    }
  }

  /**
   * Torna uma pasta pública (visualização para qualquer pessoa com o link)
   */
  async tornarPastaPublica(pastaId: string): Promise<void> {
    await this.initialize();

    try {
      await this.drive.permissions.create({
        fileId: pastaId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      console.log('✅ Pasta tornou-se pública');
    } catch (error) {
      console.error('❌ Erro ao tornar pasta pública:', error);
      throw error;
    }
  }

  /**
   * Detecta o tipo de arquivo baseado na extensão
   */
  detectarTipo(filename: string): 'Plantas' | 'Fotos' | 'Documentos' {
    const ext = filename.split('.').pop()?.toLowerCase() || '';

    // Plantas e projetos
    if (['pdf', 'dwg', 'dxf', 'skp', 'rvt', 'ifc'].includes(ext)) {
      return 'Plantas';
    }

    // Fotos e imagens
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) {
      return 'Fotos';
    }

    // Documentos gerais
    return 'Documentos';
  }
}

// Exportar instância única (singleton)
export const googleDriveService = new GoogleDriveService();

// Exportar tipos
export type { DriveFile, CreateFolderResult };
