# 🔐 Configurar Google Drive API

## Passo a Passo para Habilitar Google Drive API

### 1️⃣ Criar/Acessar Projeto no Google Cloud Console

1. Acesse: https://console.cloud.google.com/
2. No topo, clique em **"Select a project"** → **"New Project"**
3. Nome do projeto: `WG Easy - Sistema de Gestão`
4. Clique em **"Create"**

### 2️⃣ Ativar Google Drive API

1. No menu lateral, vá em **"APIs & Services"** → **"Library"**
2. Pesquise por: `Google Drive API`
3. Clique em **"Google Drive API"**
4. Clique em **"Enable"**

### 3️⃣ Criar Credenciais de Service Account

**Por que Service Account?**
- Permite upload automático sem precisar de login do usuário
- Ideal para operações server-side
- Mais seguro e fácil de gerenciar

**Passos:**

1. No menu lateral: **"APIs & Services"** → **"Credentials"**
2. Clique em **"Create Credentials"** → **"Service Account"**
3. Preencha:
   - **Service account name:** `wgeasy-drive-service`
   - **Service account ID:** `wgeasy-drive-service` (gerado automaticamente)
   - **Description:** `Service account para upload de arquivos no Google Drive`
4. Clique em **"Create and Continue"**
5. **Grant this service account access to project:**
   - Selecione role: **"Editor"** (ou **"Owner"**)
   - Clique em **"Continue"**
6. Clique em **"Done"**

### 4️⃣ Criar Chave JSON

1. Na lista de **Service Accounts**, clique no email da service account criada
2. Vá na aba **"Keys"**
3. Clique em **"Add Key"** → **"Create new key"**
4. Selecione **"JSON"**
5. Clique em **"Create"**
6. **Arquivo JSON será baixado automaticamente** - GUARDE ESTE ARQUIVO COM SEGURANÇA!

### 5️⃣ Compartilhar Pasta do Drive com Service Account

**MUITO IMPORTANTE!**

1. Abra a pasta do Google Drive:
   ```
   https://drive.google.com/drive/folders/187SLb40TwrePIfuYwlxLi7htLqrnJoIv
   ```

2. Clique com botão direito na pasta → **"Share"**

3. No campo **"Add people and groups"**, cole o email da service account:
   - O email está no arquivo JSON baixado, no campo `client_email`
   - Formato: `wgeasy-drive-service@nome-do-projeto.iam.gserviceaccount.com`

4. Defina permissão como **"Editor"**

5. Clique em **"Send"**

**Agora a service account tem acesso para criar pastas e fazer upload na pasta compartilhada!**

### 6️⃣ Configurar Variáveis de Ambiente

1. Crie o arquivo `.env.local` na pasta `wgeasy/frontend/`:

```bash
# Google Drive API Configuration
VITE_GOOGLE_DRIVE_FOLDER_ID=187SLb40TwrePIfuYwlxLi7htLqrnJoIv
VITE_GOOGLE_DRIVE_CLIENT_EMAIL=seu-email-service-account@projeto.iam.gserviceaccount.com
VITE_GOOGLE_DRIVE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nSua chave aqui\n-----END PRIVATE KEY-----
```

**IMPORTANTE:** Copie os valores do arquivo JSON:
- `client_email` → `VITE_GOOGLE_DRIVE_CLIENT_EMAIL`
- `private_key` → `VITE_GOOGLE_DRIVE_PRIVATE_KEY`

### 7️⃣ Instalar Dependências

```bash
cd wgeasy/frontend
npm install googleapis
```

### 8️⃣ Estrutura de Pastas no Google Drive

O sistema criará automaticamente esta estrutura:

```
📁 Pasta Raiz (187SLb40TwrePIfuYwlxLi7htLqrnJoIv)
└── 📁 {Nome do Cliente} - {ID da Oportunidade}
    ├── 📁 Plantas
    │   ├── projeto-arquitetonico.pdf
    │   └── planta-baixa.dwg
    ├── 📁 Fotos
    │   ├── terreno-frente.jpg
    │   └── terreno-fundos.jpg
    └── 📁 Documentos
        ├── contrato.pdf
        └── orcamento.xlsx
```

## 🔐 Segurança

**NUNCA COMMITE O ARQUIVO JSON OU O .env.local NO GIT!**

Adicione no `.gitignore`:
```
.env.local
*-service-account.json
google-credentials.json
```

## ✅ Checklist de Configuração

- [ ] Projeto criado no Google Cloud Console
- [ ] Google Drive API ativada
- [ ] Service Account criada
- [ ] Arquivo JSON da chave baixado
- [ ] Pasta compartilhada com o email da service account
- [ ] Variáveis de ambiente configuradas no `.env.local`
- [ ] Dependência `googleapis` instalada
- [ ] Arquivo `.gitignore` atualizado

## 🎯 Próximos Passos

Após completar esta configuração:
1. O sistema poderá criar pastas automaticamente no Drive
2. Uploads serão sincronizados com o Google Drive
3. Clientes poderão acessar seus arquivos pelo link do Drive
4. Backup automático de todos os arquivos

---

**Dúvidas?** Consulte a documentação oficial:
- [Google Drive API Quickstart](https://developers.google.com/drive/api/quickstart/nodejs)
- [Service Accounts](https://cloud.google.com/iam/docs/service-accounts)
