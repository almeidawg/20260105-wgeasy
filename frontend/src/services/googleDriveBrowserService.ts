// ============================================================
// SERVIÇO: Google Drive Browser Integration
// Versão para rodar no navegador (frontend)
// Usa Google Drive REST API diretamente
// ============================================================

const FOLDER_ID_BASE = '187SLb40TwrePIfuYwlxLi7htLqrnJoIv';
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Chaves para persistência no localStorage
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'wgeasy_google_drive_token',
  TOKEN_EXPIRY: 'wgeasy_google_drive_expiry',
};

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

interface SubPasta {
  id: string;
  name: string;
  webViewLink: string;
}

interface MapeamentoPastas {
  plantas: SubPasta | null;
  fotos: SubPasta | null;
  documentos: SubPasta | null;
  outrasPasstas: SubPasta[];
}

/**
 * Serviço Google Drive para Browser (Frontend)
 */
class GoogleDriveBrowserService {
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;
  private gapiLoaded: boolean = false;
  private tokenClient: any = null;

  constructor() {
    // Recuperar token do localStorage ao inicializar
    this.loadTokenFromStorage();
  }

  /**
   * Carrega token do localStorage se ainda válido
   */
  private loadTokenFromStorage(): void {
    try {
      const storedToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const storedExpiry = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);

      if (storedToken && storedExpiry) {
        const expiryTime = parseInt(storedExpiry, 10);
        const now = Date.now();

        // Verificar se token ainda é válido (com margem de 5 minutos)
        if (expiryTime > now + 5 * 60 * 1000) {
          this.accessToken = storedToken;
          this.tokenExpiry = expiryTime;
          console.log('✅ Token Google Drive recuperado do localStorage (válido até:', new Date(expiryTime).toLocaleTimeString(), ')');
        } else {
          // Token expirado - limpar
          this.clearTokenFromStorage();
          console.log('⚠️ Token Google Drive expirado, será necessário fazer login novamente');
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar token do localStorage:', error);
    }
  }

  /**
   * Salva token no localStorage
   */
  private saveTokenToStorage(token: string, expiresIn: number = 3600): void {
    try {
      // expiresIn é em segundos, converter para timestamp
      const expiryTime = Date.now() + (expiresIn * 1000);
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString());
      this.tokenExpiry = expiryTime;
      console.log('💾 Token Google Drive salvo no localStorage (válido por', expiresIn / 60, 'minutos)');
    } catch (error) {
      console.error('❌ Erro ao salvar token no localStorage:', error);
    }
  }

  /**
   * Limpa token do localStorage
   */
  private clearTokenFromStorage(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
      this.accessToken = null;
      this.tokenExpiry = null;
    } catch (error) {
      console.error('❌ Erro ao limpar token do localStorage:', error);
    }
  }

  /**
   * Verifica se o token atual ainda é válido
   */
  private isTokenValid(): boolean {
    if (!this.accessToken || !this.tokenExpiry) return false;
    // Verificar com margem de 5 minutos
    return this.tokenExpiry > Date.now() + 5 * 60 * 1000;
  }

  /**
   * Força desconexão (logout)
   */
  disconnect(): void {
    this.clearTokenFromStorage();
    console.log('🔒 Desconectado do Google Drive');
  }

  /**
   * Carrega Google API Client Library
   */
  async loadGapi(): Promise<void> {
    if (this.gapiLoaded) return;

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        (window as any).gapi.load('client', async () => {
          await (window as any).gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
          });
          this.gapiLoaded = true;
          console.log('✅ Google API Client carregado');
          resolve();
        });
      };
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  /**
   * Carrega Google Identity Services para OAuth
   */
  async loadGIS(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Verificar se já foi carregado
      if ((window as any).google?.accounts?.oauth2) {
        if (!this.tokenClient) {
          this.tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive',
            callback: (response: any) => {
              if (response.access_token) {
                this.accessToken = response.access_token;
                // Salvar token no localStorage (expires_in geralmente é 3600 segundos = 1 hora)
                this.saveTokenToStorage(response.access_token, response.expires_in || 3600);
                console.log('✅ Token de acesso obtido e salvo');
              }
            },
          });
        }
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = () => {
        this.tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive',
          callback: (response: any) => {
            if (response.access_token) {
              this.accessToken = response.access_token;
              // Salvar token no localStorage (expires_in geralmente é 3600 segundos = 1 hora)
              this.saveTokenToStorage(response.access_token, response.expires_in || 3600);
              console.log('✅ Token de acesso obtido e salvo');
            }
          },
        });
        console.log('✅ Google Identity Services carregado');
        resolve();
      };
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  /**
   * Solicita autenticação do usuário
   * Se token válido existe no localStorage, não pede login novamente
   */
  async authenticate(): Promise<void> {
    // Se já temos um token válido, não precisa fazer nada
    if (this.isTokenValid()) {
      console.log('✅ Usando token Google Drive existente (ainda válido)');
      return;
    }

    await this.loadGapi();
    await this.loadGIS();

    // Se ainda não tem token ou expirou, solicitar novo
    if (!this.accessToken || !this.isTokenValid()) {
      return new Promise((resolve, reject) => {
        this.tokenClient.callback = (response: any) => {
          if (response.error) {
            console.error('❌ Erro na autenticação:', response.error);
            reject(new Error(response.error));
            return;
          }
          if (response.access_token) {
            this.accessToken = response.access_token;
            this.saveTokenToStorage(response.access_token, response.expires_in || 3600);
            resolve();
          }
        };
        this.tokenClient.requestAccessToken();
      });
    }
  }

  /**
   * Cria uma pasta no Google Drive
   */
  async criarPasta(nome: string, parentId: string = FOLDER_ID_BASE): Promise<CreateFolderResult> {
    if (!this.accessToken) {
      await this.authenticate();
    }

    try {
      const metadata = {
        name: nome,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentId],
      };

      const response = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadata),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Erro ao criar pasta');
      }

      console.log('✅ Pasta criada:', data.name);

      return {
        folderId: data.id,
        folderUrl: data.webViewLink,
      };
    } catch (error) {
      console.error('❌ Erro ao criar pasta:', error);
      throw error;
    }
  }

  /**
   * Cria estrutura recursiva de pastas
   */
  private async criarEstruturaRecursiva(
    estrutura: { [key: string]: any },
    parentId: string
  ): Promise<void> {
    for (const [nomePasta, subpastas] of Object.entries(estrutura)) {
      const folder = await this.criarPasta(nomePasta, parentId);

      // Se tem subpastas, criar recursivamente
      if (subpastas && typeof subpastas === 'object' && Object.keys(subpastas).length > 0) {
        await this.criarEstruturaRecursiva(subpastas, folder.folderId);
      }
    }
  }

  /**
   * Cria estrutura completa de pastas para cliente
   *
   * ESTRUTURA DE SEGURANÇA:
   * 📁 20251213 - NOME DO CLIENTE              ← Pasta PRIVADA (confidencial)
   *    ├── 00 . Levantamentos Iniciais         ← Interno
   *    ├── 01 . Projeto Executivo              ← Interno
   *    ├── 02 . Engenharia                     ← Interno
   *    ├── 03 . Marcenaria                     ← Interno
   *    ├── 04 . Diário de Obra                 ← Interno
   *    ├── 05 . Financeiro                     ← Interno (NÃO compartilhar!)
   *    └── 📁 (C)20251213-NOME-Projeto         ← Pasta COMPARTILHÁVEL
   *         ├── Projeto Arquitetônico          ← Cliente pode ver
   *         ├── Fotos do Imóvel                ← Cliente pode ver
   *         └── Documentos Aprovados           ← Cliente pode ver
   *
   * A pasta (C) indica que é COMPARTILHÁVEL com o cliente.
   * Todas as outras pastas são CONFIDENCIAIS (uso interno).
   */
  async criarEstruturaPastas(
    clienteNome: string,
    oportunidadeId: string,
    identificacao: string = 'Projeto'
  ): Promise<CreateFolderResult> {
    // Gerar data no formato AAAAMMDD
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    const dataFormatada = `${ano}${mes}${dia}`;

    // Nome da pasta principal: AAAAMMDD - NOME COMPLETO DO CLIENTE
    // Exemplo: 20251213 - ELIANA KIELLANDER LOPES
    const nomeClienteFormatado = clienteNome.toUpperCase().trim();
    const folderName = `${dataFormatada} - ${nomeClienteFormatado}`;

    // Criar pasta principal (PRIVADA)
    const mainFolder = await this.criarPasta(folderName, FOLDER_ID_BASE);

    console.log('📁 Criando estrutura completa de pastas...');
    console.log('🔒 Pasta PRIVADA:', folderName);

    // ============================================================
    // ESTRUTURA PRIVADA (Confidencial - Uso Interno)
    // ============================================================
    const estruturaPrivada = {
      '00 . Levantamentos Iniciais': {
        '00 . Medições In Loco': {},
        '00. Briefing do Cliente': {},
        '01 . Fotos do Imóvel': {},
        '02 . Documentação do Cliente': {}
      },
      '01 . Projeto Executivo Arquitetônico': {
        '02 . Pré-Projeto Arquitetônico': {
          '00 . Estudos Preliminares': {},
          '01 . Layout Planta Humaniza': {},
          '02 . Moodboards Inspirações': {}
        },
        '00 . Arquitetura': {},
        '01 . Memorial Descritivo': {},
        '02 . Ar Condicionado': {},
        '03 . Elétrica': {},
        '04 . Automação': {},
        '04 . Documentos e Exigências Legais': {},
        '05 . Eletros, Eletronicos, Decoração': {
          '00 . Estofados': {},
          '01 . Eletrodomésticos': {},
          '02 . Eletrônicos': {},
          '04 . Tapetes Cortinas Tecidos': {},
          '05 . Objetos Decorativos': {}
        },
        '05 . Hidráulica': {},
        '06 . Gás': {},
        '07 . Gesso - Forro': {},
        '07 . Marmoraria': {},
        '08 . Marcenaria': {},
        '09 . Pisos e Paredes': {},
        '09 . Vidraçaria': {},
        '10 . Louças e Metais': {}
      },
      '02 . Engenharia - Obra e Execução': {},
      '03 . Marcenaria': {},
      '04 . Diário de Obra': {},
      '05 . Financeiro - CONFIDENCIAL': {
        'Orçamentos Internos': {},
        'Custos Reais': {},
        'Margem e Lucro': {}
      },
      '06 . Entrega': {
        'Fotos Finais': {},
        'Garantias': {},
        'Termos de Aceite': {}
      }
    };

    // Criar estrutura privada
    await this.criarEstruturaRecursiva(estruturaPrivada, mainFolder.folderId);

    // ============================================================
    // ESTRUTURA COMPARTILHÁVEL (C) - Visível para o Cliente
    // ============================================================
    // Nome: (C)AAAAMMDD-NOME-Projeto
    const nomeClienteSemEspacos = clienteNome.replace(/\s+/g, '-').toUpperCase();
    const pastaCompartilhavelNome = `(C)${dataFormatada}-${nomeClienteSemEspacos}-${identificacao}`;

    console.log('🌐 Pasta COMPARTILHÁVEL:', pastaCompartilhavelNome);

    const pastaCompartilhavel = await this.criarPasta(pastaCompartilhavelNome, mainFolder.folderId);

    // Estrutura da pasta compartilhável (o que o cliente pode ver)
    const estruturaCompartilhavel = {
      '01 . Projeto Arquitetônico': {
        'Plantas Aprovadas': {},
        'Renders e 3D': {},
        'Memorial Descritivo': {}
      },
      '02 . Fotos da Obra': {
        'Antes': {},
        'Durante': {},
        'Depois': {}
      },
      '03 . Documentos': {
        'Proposta Comercial': {},
        'Contratos': {},
        'Aprovações': {}
      },
      '04 . Acompanhamento': {
        'Cronograma': {},
        'Relatórios de Progresso': {}
      }
    };

    await this.criarEstruturaRecursiva(estruturaCompartilhavel, pastaCompartilhavel.folderId);

    console.log('✅ Estrutura completa criada!');
    console.log('📋 Resumo:');
    console.log('   🔒 Pasta privada (interna):', folderName);
    console.log('   🌐 Pasta compartilhável (cliente):', pastaCompartilhavelNome);

    return mainFolder;
  }

  /**
   * Retorna a pasta compartilhável (C) de um cliente
   * Útil para gerar link de compartilhamento com cliente
   */
  async buscarPastaCompartilhavel(pastaClienteId: string): Promise<SubPasta | null> {
    const subpastas = await this.listarSubpastas(pastaClienteId);

    // Buscar pasta que começa com (C)
    const pastaC = subpastas.find(p => p.name.startsWith('(C)'));

    if (pastaC) {
      console.log('🌐 Pasta compartilhável encontrada:', pastaC.name);
      return pastaC;
    }

    console.log('⚠️ Pasta compartilhável não encontrada');
    return null;
  }

  /**
   * Torna a pasta compartilhável (C) pública para o cliente
   * Mantém a pasta principal privada
   */
  async compartilharPastaCliente(pastaClienteId: string): Promise<string | null> {
    const pastaC = await this.buscarPastaCompartilhavel(pastaClienteId);

    if (!pastaC) {
      console.error('❌ Não foi possível encontrar pasta (C) para compartilhar');
      return null;
    }

    // Tornar apenas a pasta (C) pública
    await this.tornarPastaPublica(pastaC.id);

    console.log('✅ Pasta compartilhável agora é pública:', pastaC.name);
    return pastaC.webViewLink;
  }

  /**
   * Faz upload de arquivo para Google Drive
   */
  async uploadArquivo(file: File, folderId: string): Promise<DriveFile> {
    if (!this.accessToken) {
      await this.authenticate();
    }

    try {
      // Metadata do arquivo
      const metadata = {
        name: file.name,
        parents: [folderId],
      };

      // Criar FormData para multipart upload
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', file);

      const response = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,webContentLink,size,createdTime',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
          body: form,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Erro ao fazer upload');
      }

      console.log('✅ Arquivo enviado:', data.name);

      return data;
    } catch (error) {
      console.error('❌ Erro ao fazer upload:', error);
      throw error;
    }
  }

  /**
   * Lista arquivos de uma pasta
   */
  async listarArquivos(folderId: string): Promise<DriveFile[]> {
    if (!this.accessToken) {
      await this.authenticate();
    }

    try {
      const query = `'${folderId}' in parents and trashed=false`;
      const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,webViewLink,webContentLink,size,createdTime)&orderBy=createdTime desc`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Erro ao listar arquivos');
      }

      return data.files || [];
    } catch (error) {
      console.error('❌ Erro ao listar arquivos:', error);
      return [];
    }
  }

  /**
   * Lista arquivos de uma pasta com thumbnails (para visualizador)
   */
  async listarArquivosDaPasta(folderId: string): Promise<DriveFile[]> {
    if (!this.accessToken) {
      await this.authenticate();
    }

    try {
      // Excluir pastas da listagem (apenas arquivos)
      const query = `'${folderId}' in parents and trashed=false and mimeType!='application/vnd.google-apps.folder'`;
      const fields = 'files(id,name,mimeType,webViewLink,webContentLink,size,createdTime,modifiedTime,thumbnailLink)';
      const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}&orderBy=name&pageSize=100`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Erro ao listar arquivos da pasta');
      }

      // Processar thumbnails - substituir tamanho para melhor qualidade
      const arquivos = (data.files || []).map((file: any) => ({
        ...file,
        thumbnailLink: file.thumbnailLink ? file.thumbnailLink.replace('=s220', '=s400') : null,
      }));

      console.log(`✅ ${arquivos.length} arquivo(s) encontrado(s) na pasta`);
      return arquivos;
    } catch (error) {
      console.error('❌ Erro ao listar arquivos da pasta:', error);
      return [];
    }
  }

  /**
   * Exclui arquivo
   */
  async excluirArquivo(fileId: string): Promise<void> {
    if (!this.accessToken) {
      await this.authenticate();
    }

    try {
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir arquivo');
      }

      console.log('✅ Arquivo excluído');
    } catch (error) {
      console.error('❌ Erro ao excluir arquivo:', error);
      throw error;
    }
  }

  /**
   * Torna pasta pública (leitura para qualquer um com o link)
   */
  async tornarPastaPublica(folderId: string): Promise<void> {
    if (!this.accessToken) {
      await this.authenticate();
    }

    try {
      const permission = {
        role: 'reader',
        type: 'anyone',
      };

      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${folderId}/permissions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(permission),
      });

      if (!response.ok) {
        throw new Error('Erro ao tornar pasta pública');
      }

      console.log('✅ Pasta é pública');
    } catch (error) {
      console.error('❌ Erro ao tornar pasta pública:', error);
      throw error;
    }
  }

  /**
   * Detecta tipo de arquivo
   */
  detectarTipo(filename: string): 'Plantas' | 'Fotos' | 'Documentos' {
    const ext = filename.split('.').pop()?.toLowerCase() || '';

    if (['pdf', 'dwg', 'dxf', 'skp', 'rvt', 'ifc'].includes(ext)) {
      return 'Plantas';
    }

    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) {
      return 'Fotos';
    }

    return 'Documentos';
  }

  /**
   * Lista todas as subpastas de uma pasta
   */
  async listarSubpastas(folderId: string): Promise<SubPasta[]> {
    if (!this.accessToken) {
      await this.authenticate();
    }

    try {
      const query = `'${folderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
      const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,webViewLink)&orderBy=name`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Erro ao listar subpastas');
      }

      return data.files || [];
    } catch (error) {
      console.error('❌ Erro ao listar subpastas:', error);
      return [];
    }
  }

  /**
   * Detecta o tipo de uma pasta baseado no nome
   * Usa padrões comuns para identificar automaticamente
   * Otimizado para estrutura WG Easy
   */
  detectarTipoPasta(nomePasta: string): 'plantas' | 'fotos' | 'documentos' | 'outros' {
    const nome = nomePasta.toLowerCase();

    // Padrões específicos WG Easy para PLANTAS/PROJETOS
    const padroesPlantas = [
      '01 . projeto executivo arquitetônico',
      '01 . projeto executivo arquitetonico',
      'projeto executivo',
      'pré-projeto',
      'pre-projeto',
      'arquitetura',
      'planta',
      'dwg',
      'cad',
      'desenho',
      'layout planta',
      'estudos preliminares'
    ];

    // Padrões específicos WG Easy para FOTOS
    const padroesFotos = [
      '01 . fotos do imóvel',
      '01 . fotos do imovel',
      'fotos do imóvel',
      'fotos do imovel',
      'fotos finais',
      'foto',
      'imagem',
      'galeria',
      'moodboards',
      'inspirações',
      'inspiracao'
    ];

    // Padrões específicos WG Easy para DOCUMENTOS
    const padroesDocumentos = [
      '02 . documentação do cliente',
      '02 . documentacao do cliente',
      'documentação',
      'documentacao',
      'briefing',
      '00. briefing do cliente',
      'contrato',
      'proposta',
      'orçamento',
      'orcamento',
      'medição',
      'medicao',
      'memorial descritivo',
      'documentos e exigências legais',
      'garantias',
      'termos de aceite',
      '00 . levantamentos iniciais'
    ];

    // Verificar padrões (ordem importa - mais específicos primeiro)
    for (const padrao of padroesPlantas) {
      if (nome.includes(padrao)) return 'plantas';
    }

    for (const padrao of padroesFotos) {
      if (nome.includes(padrao)) return 'fotos';
    }

    for (const padrao of padroesDocumentos) {
      if (nome.includes(padrao)) return 'documentos';
    }

    return 'outros';
  }

  /**
   * Mapeia a estrutura de pastas existente (recursivamente)
   * Identifica automaticamente quais pastas usar para cada tipo
   * Otimizado para estrutura WG Easy
   */
  async mapearEstruturaPastas(folderId: string): Promise<MapeamentoPastas> {
    // Buscar todas as subpastas (primeiro nível)
    const subpastas = await this.listarSubpastas(folderId);

    const mapeamento: MapeamentoPastas = {
      plantas: null,
      fotos: null,
      documentos: null,
      outrasPasstas: [],
    };

    // Função recursiva para buscar em subpastas
    const buscarRecursivamente = async (pastas: SubPasta[], profundidade: number = 0): Promise<void> => {
      if (profundidade > 3) return; // Limitar profundidade para evitar loops

      for (const pasta of pastas) {
        const tipo = this.detectarTipoPasta(pasta.name);
        const nomeNormalizado = pasta.name.toLowerCase();

        switch (tipo) {
          case 'plantas':
            // Prioridade 1: Projeto Executivo Arquitetônico (pasta principal)
            if (nomeNormalizado.includes('01 . projeto executivo')) {
              if (!mapeamento.plantas) {
                mapeamento.plantas = pasta;
              }
            }
            // Prioridade 2: Subpasta de Arquitetura
            else if (nomeNormalizado.includes('arquitetura') && !mapeamento.plantas) {
              mapeamento.plantas = pasta;
            }
            // Prioridade 3: Qualquer pasta de projeto
            else if (!mapeamento.plantas) {
              mapeamento.plantas = pasta;
            }
            break;

          case 'fotos':
            // Prioridade 1: Fotos do Imóvel (dentro de Levantamentos)
            if (nomeNormalizado.includes('01 . fotos do imóvel') || nomeNormalizado.includes('01 . fotos do imovel')) {
              if (!mapeamento.fotos) {
                mapeamento.fotos = pasta;
              }
            }
            // Prioridade 2: Fotos Finais (dentro de Entrega)
            else if (nomeNormalizado.includes('fotos finais') && !mapeamento.fotos) {
              mapeamento.fotos = pasta;
            }
            // Prioridade 3: Qualquer pasta de fotos
            else if (!mapeamento.fotos) {
              mapeamento.fotos = pasta;
            }
            break;

          case 'documentos':
            // Prioridade 1: Documentação do Cliente
            if (nomeNormalizado.includes('02 . documentação do cliente') || nomeNormalizado.includes('02 . documentacao do cliente')) {
              if (!mapeamento.documentos) {
                mapeamento.documentos = pasta;
              }
            }
            // Prioridade 2: Briefing do Cliente
            else if (nomeNormalizado.includes('briefing') && !mapeamento.documentos) {
              mapeamento.documentos = pasta;
            }
            // Prioridade 3: Levantamentos Iniciais
            else if (nomeNormalizado.includes('00 . levantamentos iniciais') && !mapeamento.documentos) {
              mapeamento.documentos = pasta;
            }
            // Prioridade 4: Qualquer pasta de documentos
            else if (!mapeamento.documentos) {
              mapeamento.documentos = pasta;
            }
            break;

          default:
            mapeamento.outrasPasstas.push(pasta);
        }

        // Se ainda não encontrou todas as pastas, buscar recursivamente
        if (!mapeamento.plantas || !mapeamento.fotos || !mapeamento.documentos) {
          const subSubPastas = await this.listarSubpastas(pasta.id);
          if (subSubPastas.length > 0) {
            await buscarRecursivamente(subSubPastas, profundidade + 1);
          }
        }
      }
    };

    // Iniciar busca recursiva
    await buscarRecursivamente(subpastas);

    console.log('📁 Mapeamento detectado:', {
      plantas: mapeamento.plantas?.name || 'Não encontrada',
      fotos: mapeamento.fotos?.name || 'Não encontrada',
      documentos: mapeamento.documentos?.name || 'Não encontrada',
      outras: mapeamento.outrasPasstas.length + ' pasta(s)',
    });

    return mapeamento;
  }

  /**
   * Busca pasta existente do cliente na pasta base
   *
   * FORMATOS SUPORTADOS:
   * - Novo: "20251213 - ELIANA KIELLANDER LOPES"
   * - Antigo: "20251213-ElianaKiellanderLopes-a1b2c3d4"
   *
   * PRIORIDADES DE BUSCA:
   * 1. Por nome completo exato do cliente (novo formato)
   * 2. Por ID único (oportunidadeId) no final do nome (formato antigo)
   * 3. Por primeiro e último nome (fallback)
   */
  async buscarPastaCliente(clienteNome: string, oportunidadeId?: string): Promise<SubPasta | null> {
    try {
      const subpastas = await this.listarSubpastas(FOLDER_ID_BASE);
      const clienteUpper = clienteNome.toUpperCase().trim();
      const clienteNormalizado = clienteNome.toLowerCase().replace(/\s+/g, '');

      // PRIORIDADE 1: Buscar pelo NOVO formato (AAAAMMDD - NOME COMPLETO)
      // Exemplo: "20251213 - ELIANA KIELLANDER LOPES"
      const pastaNovoFormato = subpastas.find(p => {
        // Verifica se contém " - NOME" no formato novo
        return p.name.toUpperCase().includes(` - ${clienteUpper}`);
      });

      if (pastaNovoFormato) {
        console.log('✅ Pasta encontrada (formato novo):', pastaNovoFormato.name);
        return pastaNovoFormato;
      }

      // PRIORIDADE 2: Buscar por ID único no formato antigo
      if (oportunidadeId) {
        const idCurto = oportunidadeId.slice(-8).toLowerCase();

        const pastaComId = subpastas.find(p => {
          const nomeNormalizado = p.name.toLowerCase();
          return nomeNormalizado.includes(idCurto);
        });

        if (pastaComId) {
          console.log('✅ Pasta encontrada por ID único (formato antigo):', pastaComId.name);
          return pastaComId;
        }
      }

      // PRIORIDADE 3: Buscar por nome completo exato sem espaços (formato antigo)
      const pastaFormatoAntigo = subpastas.find(p => {
        const nomeNormalizado = p.name.toLowerCase().replace(/\s+/g, '');
        return nomeNormalizado.includes(`-${clienteNormalizado}-`) ||
               nomeNormalizado.includes(`-${clienteNormalizado}`);
      });

      if (pastaFormatoAntigo) {
        console.log('✅ Pasta encontrada (formato antigo):', pastaFormatoAntigo.name);
        return pastaFormatoAntigo;
      }

      // PRIORIDADE 4: Buscar por primeiro e último nome (fallback)
      const partes = clienteNome.trim().split(/\s+/);
      if (partes.length >= 2) {
        const primeiroNome = partes[0].toLowerCase();
        const ultimoNome = partes[partes.length - 1].toLowerCase();

        const pastaComNomes = subpastas.find(p => {
          const nomeNormalizado = p.name.toLowerCase();
          return nomeNormalizado.includes(primeiroNome) &&
                 nomeNormalizado.includes(ultimoNome);
        });

        if (pastaComNomes) {
          console.log('✅ Pasta encontrada por primeiro/último nome:', pastaComNomes.name);
          return pastaComNomes;
        }
      }

      console.log('ℹ️ Pasta do cliente não encontrada para:', clienteNome);
      return null;
    } catch (error) {
      console.error('❌ Erro ao buscar pasta do cliente:', error);
      return null;
    }
  }

  /**
   * Encontra ou cria estrutura de pastas para cliente
   * Se já existir, mapeia a estrutura. Se não, cria nova.
   */
  async encontrarOuCriarEstrutura(
    clienteNome: string,
    oportunidadeId: string
  ): Promise<{ pastaId: string; pastaUrl: string; mapeamento: MapeamentoPastas }> {
    // Buscar pasta existente
    const pastaExistente = await this.buscarPastaCliente(clienteNome, oportunidadeId);

    if (pastaExistente) {
      // Pasta já existe - mapear estrutura
      console.log('📂 Usando pasta existente e mapeando estrutura...');
      const mapeamento = await this.mapearEstruturaPastas(pastaExistente.id);

      return {
        pastaId: pastaExistente.id,
        pastaUrl: pastaExistente.webViewLink,
        mapeamento,
      };
    } else {
      // Pasta não existe - criar nova estrutura
      console.log('📁 Criando nova estrutura de pastas...');
      const result = await this.criarEstruturaPastas(clienteNome, oportunidadeId);

      // Mapear a estrutura recém-criada
      const mapeamento = await this.mapearEstruturaPastas(result.folderId);

      return {
        pastaId: result.folderId,
        pastaUrl: result.folderUrl,
        mapeamento,
      };
    }
  }

  /**
   * Verifica se está autenticado (com token válido)
   */
  isAuthenticated(): boolean {
    return this.isTokenValid();
  }

  /**
   * Retorna tempo restante do token em minutos
   */
  getTokenRemainingMinutes(): number {
    if (!this.tokenExpiry) return 0;
    const remaining = this.tokenExpiry - Date.now();
    return Math.max(0, Math.floor(remaining / 60000));
  }
}

// Exportar instância singleton
export const googleDriveService = new GoogleDriveBrowserService();

// Exportar tipos
export type { DriveFile, CreateFolderResult, SubPasta, MapeamentoPastas };
