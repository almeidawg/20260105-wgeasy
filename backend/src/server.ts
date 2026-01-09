// backend/src/server.ts
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";

// IMPORTANTE: Carregar dotenv ANTES de qualquer outro import que use process.env
dotenv.config();

import { createClient } from "@supabase/supabase-js";
import emailService from "./shared/emailService";
import calendarService from "./shared/calendarService";
import driveService from "./shared/driveService";
import { buscarImagemProduto } from "./shared/leroyImageScraper";
import multer from "multer";
import { uploadDiarioFoto } from "./shared/diarioFotosService";
import { btgAuth, btgWebhooks, btgService } from "./shared/btg";

const app = express();
const PORT = process.env.PORT || 3001;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: Number(process.env.DIARIO_FOTO_MAX_BYTES || 12 * 1024 * 1024),
  },
});

type MulterRequest = Request & { file?: Express.Multer.File };

// ============================================================
// SUPABASE CLIENT PARA VALIDAÇÃO JWT
// ============================================================
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

// ============================================================
// RATE LIMITER
// ============================================================
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 60000);
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX || 30);
const rateMap = new Map<string, { count: number; reset: number }>();

function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  const key = (req.headers["x-internal-key"] as string) || req.ip || "global";
  const now = Date.now();
  const entry = rateMap.get(key) || {
    count: 0,
    reset: now + RATE_LIMIT_WINDOW_MS,
  };
  if (now > entry.reset) {
    entry.count = 0;
    entry.reset = now + RATE_LIMIT_WINDOW_MS;
  }
  entry.count++;
  rateMap.set(key, entry);
  if (entry.count > RATE_LIMIT_MAX) {
    return res.status(429).json({ error: "Too many requests" });
  }
  next();
}

// ============================================================
// MIDDLEWARE: Internal API Key (para chamadas internas)
// ============================================================
function requireInternalKey(req: Request, res: Response, next: NextFunction) {
  const expected = process.env.INTERNAL_API_KEY;
  if (!expected) {
    console.warn(
      "No INTERNAL_API_KEY set — internal endpoints are not protected"
    );
    return res.status(500).json({ error: "Server misconfiguration" });
  }
  const token =
    (req.headers["x-internal-key"] as string) ||
    (req.headers.authorization
      ? String(req.headers.authorization).split(" ")[1]
      : undefined);
  if (!token || token !== expected)
    return res.status(401).json({ error: "Unauthorized" });
  next();
}

// ============================================================
// MIDDLEWARE: JWT Validation (valida token Supabase)
// ============================================================
interface AuthenticatedRequest extends Request {
  user?: { id: string; email?: string; role?: string };
}

async function requireJWT(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (!supabase) {
    console.warn("Supabase not configured - JWT validation disabled");
    return next(); // Fallback: permite sem validação se Supabase não configurado
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: "Token inválido ou expirado" });
    }

    req.user = { id: user.id, email: user.email, role: user.role };
    next();
  } catch (err) {
    console.error("[JWT Validation Error]:", err);
    return res.status(401).json({ error: "Erro ao validar token" });
  }
}

// ============================================================
// CSP HEADERS MIDDLEWARE
// ============================================================
function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.openai.com https://api.anthropic.com https://*.supabase.co;"
  );
  next();
}

// Middleware
app.use(securityHeaders); // Adiciona headers de segurança
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:5176",
      "http://localhost:5177",
      "http://localhost:5178",
      "http://localhost:5179",
      "http://localhost:5180",
      "http://localhost:3000",
      "https://easy.wgalmeida.com.br",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-internal-key"],
  })
);
app.use(express.json({ limit: "10mb" }));

// Health check
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Busca imagem de produto (Leroy) via Playwright
app.post(
  "/api/scraping/leroy-image",
  requireInternalKey,
  rateLimitMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { termo, url } = req.body || {};
      if (!termo && !url) {
        return res.status(400).json({ error: "Informe termo ou url" });
      }

      if (!process.env.PLAYWRIGHT_BROWSERS_PATH) {
        process.env.PLAYWRIGHT_BROWSERS_PATH = "0";
      }

      const resultado = await buscarImagemProduto({ termo, url });
      return res.json(resultado);
    } catch (error: any) {
      console.error("[Scraper Error]:", error);
      return res
        .status(500)
        .json({ error: "Falha ao buscar imagem", message: error.message });
    }
  }
);

// Proxy para OpenAI Chat Completions
app.post(
  "/api/openai/chat",
  requireInternalKey,
  rateLimitMiddleware,
  async (req: Request, res: Response) => {
    try {
      const apiKey = process.env.OPENAI_API_KEY;

      if (!apiKey) {
        return res.status(500).json({
          error: "OPENAI_API_KEY não configurada no servidor",
        });
      }

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(req.body),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json(data);
      }

      res.json(data);
    } catch (error: any) {
      console.error("[OpenAI Proxy Error]:", error);
      res.status(500).json({
        error: "Erro ao conectar com OpenAI",
        message: error.message,
      });
    }
  }
);

// ============================================================
// PROXY OPENAI VISION - Para análise de PDFs (extratos bancários)
// ============================================================
app.post(
  "/api/openai/vision",
  requireInternalKey,
  rateLimitMiddleware,
  async (req: Request, res: Response) => {
    try {
      const apiKey = process.env.OPENAI_API_KEY;

      if (!apiKey) {
        return res.status(500).json({
          error: "OPENAI_API_KEY não configurada no servidor",
        });
      }

      const { images, prompt } = req.body;

      if (!images || !Array.isArray(images) || images.length === 0) {
        return res.status(400).json({ error: "Imagens são obrigatórias" });
      }

      // Montar content com texto + imagens
      const content: any[] = [
        { type: "text", text: prompt || "Analise as imagens fornecidas." },
      ];

      for (const base64 of images) {
        content.push({
          type: "image_url",
          image_url: { url: base64, detail: "high" },
        });
      }

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [{ role: "user", content }],
            max_tokens: 4096,
            temperature: 0.1,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json(data);
      }

      res.json(data);
    } catch (error: any) {
      console.error("[OpenAI Vision Error]:", error);
      res.status(500).json({
        error: "Erro ao processar imagens com OpenAI Vision",
        message: error.message,
      });
    }
  }
);

// Proxy para Anthropic Claude
app.post(
  "/api/anthropic/messages",
  requireInternalKey,
  rateLimitMiddleware,
  async (req: Request, res: Response) => {
    try {
      const apiKey = process.env.ANTHROPIC_API_KEY;

      if (!apiKey) {
        return res.status(500).json({
          error: "ANTHROPIC_API_KEY não configurada no servidor",
        });
      }

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify(req.body),
      });

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json(data);
      }

      res.json(data);
    } catch (error: any) {
      console.error("[Anthropic Proxy Error]:", error);
      res.status(500).json({
        error: "Erro ao conectar com Anthropic",
        message: error.message,
      });
    }
  }
);

// ============================================================
// EMAIL API
// ============================================================

// Enviar email
app.post(
  "/api/email/send",
  requireInternalKey,
  rateLimitMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { to, subject, text, html, cc, bcc, replyTo, attachments } =
        req.body;

      if (!to || !subject) {
        return res
          .status(400)
          .json({ error: "Campos 'to' e 'subject' são obrigatórios" });
      }

      const success = await emailService.sendEmail({
        to,
        subject,
        text,
        html,
        cc,
        bcc,
        replyTo,
        attachments,
      });

      if (success) {
        res.json({ success: true, message: "Email enviado com sucesso" });
      } else {
        res.status(500).json({ error: "Falha ao enviar email" });
      }
    } catch (error: any) {
      console.error("[Email Error]:", error);
      res
        .status(500)
        .json({ error: "Erro ao enviar email", message: error.message });
    }
  }
);

// Email de boas-vindas
app.post(
  "/api/email/welcome",
  requireInternalKey,
  async (req: Request, res: Response) => {
    try {
      const { to, nome, senha } = req.body;

      if (!to || !nome) {
        return res
          .status(400)
          .json({ error: "Campos 'to' e 'nome' são obrigatórios" });
      }

      const template = emailService.welcomeTemplate(nome, senha);
      const success = await emailService.sendEmail({
        to,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      if (success) {
        res.json({ success: true, message: "Email de boas-vindas enviado" });
      } else {
        res.status(500).json({ error: "Falha ao enviar email de boas-vindas" });
      }
    } catch (error: any) {
      console.error("[Welcome Email Error]:", error);
      res
        .status(500)
        .json({ error: "Erro ao enviar email", message: error.message });
    }
  }
);

// Email de notificação
app.post(
  "/api/email/notification",
  requireInternalKey,
  async (req: Request, res: Response) => {
    try {
      const { to, titulo, mensagem, actionUrl, actionText } = req.body;

      if (!to || !titulo || !mensagem) {
        return res.status(400).json({
          error: "Campos 'to', 'titulo' e 'mensagem' são obrigatórios",
        });
      }

      const template = emailService.notificationTemplate(
        titulo,
        mensagem,
        actionUrl,
        actionText
      );
      const success = await emailService.sendEmail({
        to,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      if (success) {
        res.json({ success: true, message: "Notificação enviada" });
      } else {
        res.status(500).json({ error: "Falha ao enviar notificação" });
      }
    } catch (error: any) {
      console.error("[Notification Email Error]:", error);
      res
        .status(500)
        .json({ error: "Erro ao enviar notificação", message: error.message });
    }
  }
);

// Verificar conexão de email
app.get(
  "/api/email/verify",
  requireInternalKey,
  async (_req: Request, res: Response) => {
    try {
      const connected = await emailService.verifyConnection();
      res.json({ connected });
    } catch (error: any) {
      res.status(500).json({ connected: false, error: error.message });
    }
  }
);

app.post(
  "/api/diario-obras/:registroId/fotos",
  requireJWT,
  rateLimitMiddleware,
  upload.single("foto"),
  async (req: MulterRequest, res: Response) => {
    try {
      const { registroId } = req.params;
      const { descricao, driveFolderId } = req.body;

      if (!registroId) {
        return res.status(400).json({ error: "registroId é obrigatório" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "Arquivo da foto não enviado" });
      }

      const foto = await uploadDiarioFoto({
        registroId,
        buffer: req.file.buffer,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        descricao,
        driveFolderId,
      });

      res.json({ success: true, foto });
    } catch (error: any) {
      console.error("[Diário de Obra Photo Error]:", error);
      res.status(500).json({
        error: "Erro ao enviar foto do Diário de Obra",
        message: error.message,
      });
    }
  }
);

// ============================================================
// GOOGLE CALENDAR API
// ============================================================

// Status da configuração do Calendar (Service Account)
app.get("/api/calendar/status", rateLimitMiddleware, (_req: Request, res: Response) => {
  const configured = calendarService.isServiceAccountConfigured();
  res.json({
    configured,
    message: configured
      ? "Calendar configurado com Service Account"
      : "Service Account não configurada para Calendar",
  });
});

// Listar eventos via Service Account (sempre ativo, sem login)
app.get(
  "/api/calendar/sa/events",
  rateLimitMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { timeMin, timeMax, maxResults, userEmail } = req.query;

      console.log("[Calendar SA] Buscando eventos para:", userEmail || "default");

      const events = await calendarService.listEventsWithServiceAccount(
        "primary",
        {
          timeMin: timeMin as string,
          timeMax: timeMax as string,
          maxResults: maxResults ? parseInt(maxResults as string) : 100,
        },
        userEmail as string | undefined
      );

      res.json({ events, count: events.length });
    } catch (error: any) {
      console.error("[Calendar SA Error]:", error);
      res.status(500).json({
        error: "Erro ao listar eventos",
        message: error.message,
      });
    }
  }
);

// Criar evento via Service Account
app.post(
  "/api/calendar/sa/events",
  rateLimitMiddleware,
  async (req: Request, res: Response) => {
    try {
      const event = req.body;

      if (!event.summary) {
        return res.status(400).json({ error: "Título do evento é obrigatório" });
      }

      const created = await calendarService.createEventWithServiceAccount(event);
      res.json({ success: true, event: created });
    } catch (error: any) {
      console.error("[Calendar SA Create Error]:", error);
      res.status(500).json({
        error: "Erro ao criar evento",
        message: error.message,
      });
    }
  }
);

// Atualizar evento via Service Account
app.put(
  "/api/calendar/sa/events/:eventId",
  rateLimitMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { eventId } = req.params;
      const event = req.body;

      const updated = await calendarService.updateEventWithServiceAccount(eventId, event);
      res.json({ success: true, event: updated });
    } catch (error: any) {
      console.error("[Calendar SA Update Error]:", error);
      res.status(500).json({
        error: "Erro ao atualizar evento",
        message: error.message,
      });
    }
  }
);

// Deletar evento via Service Account
app.delete(
  "/api/calendar/sa/events/:eventId",
  rateLimitMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { eventId } = req.params;

      await calendarService.deleteEventWithServiceAccount(eventId);
      res.json({ success: true });
    } catch (error: any) {
      console.error("[Calendar SA Delete Error]:", error);
      res.status(500).json({
        error: "Erro ao deletar evento",
        message: error.message,
      });
    }
  }
);

// URL de autenticação OAuth2 (fallback se Service Account não estiver configurada)
app.get("/api/calendar/auth-url", (_req: Request, res: Response) => {
  const url = calendarService.getAuthUrl();
  res.json({ url });
});

// Callback OAuth2
app.get("/api/auth/google/callback", async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res
        .status(400)
        .json({ error: "Código de autorização não fornecido" });
    }

    const tokens = await calendarService.getTokensFromCode(code as string);
    // Em produção, salve os tokens de forma segura (banco de dados)
    res.json({ success: true, tokens });
  } catch (error: any) {
    console.error("[Google Auth Error]:", error);
    res
      .status(500)
      .json({ error: "Erro na autenticação Google", message: error.message });
  }
});

// Listar eventos (protegido)
app.get(
  "/api/calendar/events",
  requireInternalKey,
  async (req: Request, res: Response) => {
    try {
      const { calendarId, timeMin, timeMax, maxResults } = req.query;

      if (!calendarId) {
        return res.status(400).json({ error: "calendarId é obrigatório" });
      }

      const events = await calendarService.listPublicEvents(
        calendarId as string,
        {
          timeMin: timeMin as string,
          timeMax: timeMax as string,
          maxResults: maxResults ? parseInt(maxResults as string) : undefined,
        }
      );

      res.json({ events });
    } catch (error: any) {
      console.error("[Calendar List Error]:", error);
      res
        .status(500)
        .json({ error: "Erro ao listar eventos", message: error.message });
    }
  }
);

// Criar evento (requer OAuth2)
app.post(
  "/api/calendar/events",
  requireInternalKey,
  async (req: Request, res: Response) => {
    try {
      const { calendarId, event } = req.body;
      const accessToken = req.headers.authorization?.replace("Bearer ", "");

      if (!calendarId || !event) {
        return res
          .status(400)
          .json({ error: "calendarId e event são obrigatórios" });
      }

      const newEvent = await calendarService.createEvent(
        calendarId,
        event,
        accessToken
      );

      if (newEvent) {
        res.json({ success: true, event: newEvent });
      } else {
        res.status(500).json({ error: "Falha ao criar evento" });
      }
    } catch (error: any) {
      console.error("[Calendar Create Error]:", error);
      res
        .status(500)
        .json({ error: "Erro ao criar evento", message: error.message });
    }
  }
);

// Atualizar evento (requer OAuth2)
app.put(
  "/api/calendar/events/:eventId",
  requireInternalKey,
  async (req: Request, res: Response) => {
    try {
      const { eventId } = req.params;
      const { calendarId, event } = req.body;
      const accessToken = req.headers.authorization?.replace("Bearer ", "");

      if (!calendarId || !event) {
        return res
          .status(400)
          .json({ error: "calendarId e event são obrigatórios" });
      }

      const updatedEvent = await calendarService.updateEvent(
        calendarId,
        eventId,
        event,
        accessToken
      );

      if (updatedEvent) {
        res.json({ success: true, event: updatedEvent });
      } else {
        res.status(500).json({ error: "Falha ao atualizar evento" });
      }
    } catch (error: any) {
      console.error("[Calendar Update Error]:", error);
      res
        .status(500)
        .json({ error: "Erro ao atualizar evento", message: error.message });
    }
  }
);

// Deletar evento (requer OAuth2)
app.delete(
  "/api/calendar/events/:eventId",
  requireInternalKey,
  async (req: Request, res: Response) => {
    try {
      const { eventId } = req.params;
      const { calendarId } = req.body;
      const accessToken = req.headers.authorization?.replace("Bearer ", "");

      if (!calendarId) {
        return res.status(400).json({ error: "calendarId é obrigatório" });
      }

      const success = await calendarService.deleteEvent(
        calendarId,
        eventId,
        accessToken
      );

      if (success) {
        res.json({ success: true, message: "Evento deletado" });
      } else {
        res.status(500).json({ error: "Falha ao deletar evento" });
      }
    } catch (error: any) {
      console.error("[Calendar Delete Error]:", error);
      res
        .status(500)
        .json({ error: "Erro ao deletar evento", message: error.message });
    }
  }
);

// Listar calendários do usuário (requer OAuth2)
app.get(
  "/api/calendar/list",
  requireInternalKey,
  async (req: Request, res: Response) => {
    try {
      const accessToken = req.headers.authorization?.replace("Bearer ", "");
      const calendars = await calendarService.listCalendars(accessToken);
      res.json({ calendars });
    } catch (error: any) {
      console.error("[Calendar List Error]:", error);
      res
        .status(500)
        .json({ error: "Erro ao listar calendários", message: error.message });
    }
  }
);

// Criar evento rápido (texto natural)
app.post(
  "/api/calendar/quick-add",
  requireInternalKey,
  async (req: Request, res: Response) => {
    try {
      const { calendarId, text } = req.body;
      const accessToken = req.headers.authorization?.replace("Bearer ", "");

      if (!calendarId || !text) {
        return res
          .status(400)
          .json({ error: "calendarId e text são obrigatórios" });
      }

      const event = await calendarService.quickAdd(
        calendarId,
        text,
        accessToken
      );

      if (event) {
        res.json({ success: true, event });
      } else {
        res.status(500).json({ error: "Falha ao criar evento rápido" });
      }
    } catch (error: any) {
      console.error("[Calendar Quick Add Error]:", error);
      res
        .status(500)
        .json({ error: "Erro ao criar evento rápido", message: error.message });
    }
  }
);

// ============================================================
// GOOGLE DRIVE API
// ============================================================

// URL de autenticação OAuth2 para Drive
app.get("/api/drive/auth-url", (_req: Request, res: Response) => {
  const url = driveService.getDriveAuthUrl();
  res.json({ url });
});

// Criar pasta do cliente (busca ou cria se não existir)
app.post(
  "/api/drive/cliente-folder",
  requireInternalKey,
  rateLimitMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { clienteNome, accessToken } = req.body;

      if (!clienteNome) {
        return res.status(400).json({ error: "Nome do cliente é obrigatório" });
      }

      const folder = await driveService.getOrCreateClienteFolder(
        clienteNome,
        accessToken
      );

      res.json({
        success: true,
        folder: {
          id: folder.id,
          name: folder.name,
          link: folder.webViewLink,
        },
      });
    } catch (error: any) {
      console.error("[Drive Create Folder Error]:", error);
      res.status(500).json({
        error: "Erro ao criar pasta no Drive",
        message: error.message,
      });
    }
  }
);

// Buscar pasta existente
app.get(
  "/api/drive/find-folder",
  requireInternalKey,
  async (req: Request, res: Response) => {
    try {
      const { name, parentId, accessToken } = req.query;

      if (!name) {
        return res.status(400).json({ error: "Nome da pasta é obrigatório" });
      }

      const folder = await driveService.findFolderByName(
        name as string,
        parentId as string | undefined,
        accessToken as string | undefined
      );

      if (folder) {
        res.json({ found: true, folder });
      } else {
        res.json({ found: false, folder: null });
      }
    } catch (error: any) {
      console.error("[Drive Find Folder Error]:", error);
      res.status(500).json({
        error: "Erro ao buscar pasta",
        message: error.message,
      });
    }
  }
);

// Criar estrutura completa de pastas para cliente
app.post(
  "/api/drive/create-structure",
  requireInternalKey,
  rateLimitMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { clienteNome, accessToken } = req.body;

      if (!clienteNome) {
        return res.status(400).json({ error: "Nome do cliente é obrigatório" });
      }

      const folder = await driveService.createClienteFolderStructure(
        clienteNome,
        accessToken
      );

      if (folder) {
        res.json({
          success: true,
          folder: {
            id: folder.id,
            name: folder.name,
            link: folder.webViewLink,
          },
        });
      } else {
        res.status(500).json({ error: "Falha ao criar estrutura de pastas" });
      }
    } catch (error: any) {
      console.error("[Drive Create Structure Error]:", error);
      res.status(500).json({
        error: "Erro ao criar estrutura de pastas",
        message: error.message,
      });
    }
  }
);

// Listar imagens do Diário de Obra de uma pasta do cliente
app.get(
  "/api/drive/diario-obra-images",
  rateLimitMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { folderId } = req.query;

      if (!folderId) {
        return res.status(400).json({ error: "folderId é obrigatório" });
      }

      // Importar função de listar imagens
      const { listDiarioObraImages } = await import("./shared/driveService");

      const images = await listDiarioObraImages(folderId as string);

      res.json({
        success: true,
        groups: images,
        totalImages: images.reduce((sum, g) => sum + g.files.length, 0),
      });
    } catch (error: any) {
      console.error("[Drive List Diario Images Error]:", error);
      res.status(500).json({
        error: "Erro ao listar imagens do diário de obra",
        message: error.message,
      });
    }
  }
);

// Listar arquivos de uma pasta específica
app.get(
  "/api/drive/list-files",
  rateLimitMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { folderId, mimeType } = req.query;

      if (!folderId) {
        return res.status(400).json({ error: "folderId é obrigatório" });
      }

      const { listFilesInFolder } = await import("./shared/driveService");

      const files = await listFilesInFolder(
        folderId as string,
        mimeType as string | undefined
      );

      res.json({
        success: true,
        files,
        total: files.length,
      });
    } catch (error: any) {
      console.error("[Drive List Files Error]:", error);
      res.status(500).json({
        error: "Erro ao listar arquivos",
        message: error.message,
      });
    }
  }
);

// ============================================================
// INICIALIZAÇÃO DO SERVIDOR
// ============================================================


// ============================================================
// GOOGLE KEEP API
// ============================================================
import * as googleKeepApi from "./shared/googleKeepApi";

// Status da configuração do Google Keep
app.get(
  "/api/keep/status",
  rateLimitMiddleware,
  async (_req: Request, res: Response) => {
    const hasUserEmail = Boolean(process.env.GOOGLE_KEEP_USER_EMAIL || process.env.GOOGLE_SERVICE_ACCOUNT_SUBJECT);
    const hasServiceAccount = Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH);

    const configured = hasUserEmail && hasServiceAccount;

    res.json({
      configured,
      hasUserEmail,
      hasServiceAccount,
      message: configured
        ? "Google Keep configurado"
        : "Configure GOOGLE_KEEP_USER_EMAIL e GOOGLE_SERVICE_ACCOUNT_KEY no .env"
    });
  }
);

// Testar conexão com Google Keep
app.get(
  "/api/keep/test",
  rateLimitMiddleware,
  async (_req: Request, res: Response) => {
    try {
      const result = await googleKeepApi.checkConnection();
      res.json(result);
    } catch (error: any) {
      res.json({
        success: false,
        message: error.message || "Erro ao conectar com Google Keep"
      });
    }
  }
);

app.get(
  "/api/keep/notes",
  rateLimitMiddleware,
  async (req: Request, res: Response) => {
    try {
      // Parâmetro ?all=true retorna todas as notas (não apenas WG-Easy)
      const includeAll = req.query.all === "true";
      // Parâmetro ?userEmail=email@domain.com para buscar notas de outro usuário
      const userEmail = req.query.userEmail as string | undefined;

      console.log("[Google Keep] Buscando notas para:", userEmail || "default");
      const notes = await googleKeepApi.listNotes(includeAll, userEmail);
      res.json(notes);
    } catch (error: any) {
      console.error("[Google Keep Error]:", error);
      res.status(500).json({ error: "Erro ao buscar notas do Google Keep", message: error.message });
    }
  }
);

// Criar nova nota no Google Keep
app.post(
  "/api/keep/notes",
  rateLimitMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { title, text, items, clienteId, clienteNome, userEmail } = req.body;

      if (!title) {
        return res.status(400).json({ error: "Título é obrigatório" });
      }

      // Se tiver cliente, adiciona tag no título
      const tituloFinal = clienteNome
        ? `[${clienteNome}] ${title}`
        : title;

      console.log("[Keep Create] Criando nota para:", userEmail || "default");

      const result = await googleKeepApi.createNote({
        title: tituloFinal,
        text,
        items,
      }, userEmail);

      res.json({
        success: true,
        ...result,
        clienteId,
        clienteNome,
      });
    } catch (error: any) {
      console.error("[Google Keep Error - Create]:", error);
      res.status(500).json({ error: "Erro ao criar nota", message: error.message });
    }
  }
);

// ============================================================
// GOOGLE KEEP - COMPARTILHAMENTO
// ============================================================

// Compartilhar nota com clientes ou usuarios internos
app.post(
  "/api/keep/notes/:noteId/share",
  rateLimitMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { noteId } = req.params;
      const { compartilhar_com, titulo, criado_por_usuario_id } = req.body;

      if (!supabase) {
        return res.status(500).json({ error: "Supabase não configurado" });
      }

      if (!noteId || !compartilhar_com || !Array.isArray(compartilhar_com)) {
        return res.status(400).json({ error: "noteId e compartilhar_com são obrigatórios" });
      }

      const results = [];

      for (const target of compartilhar_com) {
        const { tipo, id, permissoes } = target;

        const insertData: any = {
          keep_note_id: noteId,
          titulo: titulo || null,
          criado_por_usuario_id: criado_por_usuario_id || null,
          pode_editar: permissoes?.pode_editar || false,
          pode_marcar_itens: permissoes?.pode_marcar_itens ?? true,
          pode_adicionar_itens: permissoes?.pode_adicionar_itens || false,
        };

        if (tipo === "pessoa") {
          insertData.compartilhado_com_pessoa_id = id;
        } else if (tipo === "usuario") {
          insertData.compartilhado_com_usuario_id = id;
        } else {
          continue;
        }

        const { data, error } = await supabase
          .from("keep_notes_compartilhamentos")
          .upsert(insertData, {
            onConflict: tipo === "pessoa"
              ? "keep_note_id,compartilhado_com_pessoa_id"
              : "keep_note_id,compartilhado_com_usuario_id"
          })
          .select()
          .single();

        if (error) {
          console.error("[Keep Share] Erro ao compartilhar:", error);
        } else {
          results.push(data);
        }
      }

      res.json({ success: true, compartilhamentos: results });
    } catch (error: any) {
      console.error("[Keep Share Error]:", error);
      res.status(500).json({ error: "Erro ao compartilhar nota", message: error.message });
    }
  }
);

// Listar compartilhamentos de uma nota
app.get(
  "/api/keep/notes/:noteId/shares",
  rateLimitMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { noteId } = req.params;

      if (!supabase) {
        return res.status(500).json({ error: "Supabase não configurado" });
      }

      // Buscar compartilhamentos (usuarios não tem nome/email, usa pessoa_id)
      const { data, error } = await supabase
        .from("keep_notes_compartilhamentos")
        .select(`
          *,
          pessoa:pessoas!compartilhado_com_pessoa_id(id, nome, email),
          usuario:usuarios!compartilhado_com_usuario_id(id, pessoa_id, tipo_usuario)
        `)
        .eq("keep_note_id", noteId);

      // Se tiver usuarios, buscar dados da pessoa vinculada
      if (data && data.length > 0) {
        for (const share of data) {
          if (share.usuario?.pessoa_id) {
            const { data: pessoaData } = await supabase
              .from("pessoas")
              .select("nome, email")
              .eq("id", share.usuario.pessoa_id)
              .single();
            if (pessoaData) {
              share.usuario.nome = pessoaData.nome;
              share.usuario.email = pessoaData.email;
            }
          }
        }
      }

      if (error) {
        console.error("[Keep Shares] Erro:", error);
        return res.status(500).json({ error: "Erro ao buscar compartilhamentos" });
      }

      // Formatar resposta
      const shares = (data || []).map((s: any) => ({
        id: s.id,
        tipo: s.compartilhado_com_pessoa_id ? "pessoa" : "usuario",
        target_id: s.compartilhado_com_pessoa_id || s.compartilhado_com_usuario_id,
        nome: s.pessoa?.nome || s.usuario?.nome || "Desconhecido",
        email: s.pessoa?.email || s.usuario?.email || null,
        permissoes: {
          pode_editar: s.pode_editar,
          pode_marcar_itens: s.pode_marcar_itens,
          pode_adicionar_itens: s.pode_adicionar_itens,
        },
        created_at: s.created_at,
      }));

      res.json({ note_id: noteId, shares });
    } catch (error: any) {
      console.error("[Keep Shares Error]:", error);
      res.status(500).json({ error: "Erro ao buscar compartilhamentos", message: error.message });
    }
  }
);

// Remover compartilhamento
app.delete(
  "/api/keep/notes/:noteId/share/:shareId",
  rateLimitMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { noteId, shareId } = req.params;

      if (!supabase) {
        return res.status(500).json({ error: "Supabase não configurado" });
      }

      const { error } = await supabase
        .from("keep_notes_compartilhamentos")
        .delete()
        .eq("id", shareId)
        .eq("keep_note_id", noteId);

      if (error) {
        console.error("[Keep Unshare] Erro:", error);
        return res.status(500).json({ error: "Erro ao remover compartilhamento" });
      }

      res.json({ success: true, message: "Compartilhamento removido" });
    } catch (error: any) {
      console.error("[Keep Unshare Error]:", error);
      res.status(500).json({ error: "Erro ao remover compartilhamento", message: error.message });
    }
  }
);

// Buscar notas compartilhadas comigo (para area do cliente)
app.get(
  "/api/keep/notes/shared-with-me",
  rateLimitMiddleware,
  async (req: Request, res: Response) => {
    try {
      const pessoaId = req.query.pessoa_id as string;
      const usuarioId = req.query.usuario_id as string;

      if (!supabase) {
        return res.status(500).json({ error: "Supabase não configurado" });
      }

      if (!pessoaId && !usuarioId) {
        return res.status(400).json({ error: "pessoa_id ou usuario_id é obrigatório" });
      }

      // Buscar compartilhamentos
      let query = supabase
        .from("keep_notes_compartilhamentos")
        .select("*");

      if (pessoaId) {
        query = query.eq("compartilhado_com_pessoa_id", pessoaId);
      } else {
        query = query.eq("compartilhado_com_usuario_id", usuarioId);
      }

      const { data: shares, error: sharesError } = await query;

      if (sharesError) {
        console.error("[Keep Shared With Me] Erro:", sharesError);
        return res.status(500).json({ error: "Erro ao buscar compartilhamentos" });
      }

      if (!shares || shares.length === 0) {
        return res.json([]);
      }

      // Buscar notas do Google Keep
      const allNotes = await googleKeepApi.listNotes(false);

      // Filtrar apenas as notas compartilhadas
      const noteIds = shares.map((s: any) => s.keep_note_id);
      const sharedNotes = allNotes.filter((n: any) => noteIds.includes(n.id));

      // Adicionar informações de permissão a cada nota
      const notesWithPermissions = sharedNotes.map((note: any) => {
        const share = shares.find((s: any) => s.keep_note_id === note.id);
        return {
          ...note,
          permissoes: {
            pode_editar: share?.pode_editar || false,
            pode_marcar_itens: share?.pode_marcar_itens || true,
            pode_adicionar_itens: share?.pode_adicionar_itens || false,
          },
          share_id: share?.id,
        };
      });

      res.json(notesWithPermissions);
    } catch (error: any) {
      console.error("[Keep Shared With Me Error]:", error);
      res.status(500).json({ error: "Erro ao buscar notas compartilhadas", message: error.message });
    }
  }
);

// Atualizar item de nota (para cliente marcar/desmarcar)
app.patch(
  "/api/keep/notes/:noteId/items/:itemIndex",
  rateLimitMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { noteId, itemIndex } = req.params;
      const { checked, pessoaId } = req.body;

      if (!supabase) {
        return res.status(500).json({ error: "Supabase não configurado" });
      }

      // Verificar permissão
      if (pessoaId) {
        const { data: share } = await supabase
          .from("keep_notes_compartilhamentos")
          .select("pode_marcar_itens")
          .eq("keep_note_id", noteId)
          .eq("compartilhado_com_pessoa_id", pessoaId)
          .single();

        if (!share?.pode_marcar_itens) {
          return res.status(403).json({ error: "Sem permissão para marcar itens" });
        }
      }

      // Buscar nota atual do Keep
      const note = await googleKeepApi.getNote(noteId);

      if (!note.items || !Array.isArray(note.items)) {
        return res.status(400).json({ error: "Nota não possui itens de checklist" });
      }

      const idx = parseInt(itemIndex, 10);
      if (isNaN(idx) || idx < 0 || idx >= note.items.length) {
        return res.status(400).json({ error: "Índice de item inválido" });
      }

      // Atualizar item
      note.items[idx].checked = checked;

      // Google Keep API não suporta update, então deletamos e recriamos
      await googleKeepApi.deleteNote(noteId);
      const newNote = await googleKeepApi.createNote({
        title: note.title,
        items: note.items,
      });

      // Atualizar referências de compartilhamento para o novo ID
      if (newNote.id !== noteId) {
        await supabase
          .from("keep_notes_compartilhamentos")
          .update({ keep_note_id: newNote.id })
          .eq("keep_note_id", noteId);
      }

      res.json({
        success: true,
        note: newNote,
        message: "Item atualizado com sucesso"
      });
    } catch (error: any) {
      console.error("[Keep Update Item Error]:", error);
      res.status(500).json({ error: "Erro ao atualizar item", message: error.message });
    }
  }
);

// Deletar nota do Google Keep
app.delete(
  "/api/keep/notes/:noteId",
  rateLimitMiddleware,
  async (req: Request, res: Response) => {
    try {
      // Express já decodifica params automaticamente
      const { noteId } = req.params;
      // userEmail pode vir como query param para deleção
      const userEmail = req.query.userEmail as string | undefined;

      console.log("[Google Keep Delete] Tentando deletar nota ID:", noteId);
      console.log("[Google Keep Delete] URL completa:", req.originalUrl);
      console.log("[Google Keep Delete] userEmail:", userEmail || "default");

      if (!noteId) {
        return res.status(400).json({ error: "ID da nota é obrigatório" });
      }

      await googleKeepApi.deleteNote(noteId, userEmail);
      console.log("[Google Keep Delete] Nota deletada com sucesso:", noteId);
      res.json({ success: true, message: "Nota excluída com sucesso" });
    } catch (error: any) {
      console.error("[Google Keep Error - Delete]:", error.message);

      // Log detalhado para erros da API do Google
      if (error.code) {
        console.error("[Google Keep Error - Delete] Código:", error.code);
      }
      if (error.errors) {
        console.error("[Google Keep Error - Delete] Errors:", JSON.stringify(error.errors, null, 2));
      }
      if (error.response?.data) {
        console.error("[Google Keep Error - Delete] Response Data:", JSON.stringify(error.response.data, null, 2));
      }

      // Determinar status code apropriado
      let statusCode = 500;
      if (error.code === 404) statusCode = 404;
      if (error.code === 403) statusCode = 403;

      res.status(statusCode).json({
        error: "Erro ao excluir nota",
        message: error.message,
        code: error.code || null,
        details: error.response?.data || error.errors || null
      });
    }
  }
);

// ============================================================
// BTG PACTUAL EMPRESAS - ROTAS DE INTEGRAÇÃO BANCÁRIA
// ============================================================

// Webhook para receber notificações do BTG (não requer autenticação)
app.post(
  "/api/btg/webhooks",
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response) => {
    try {
      const signature = req.headers['x-btg-signature'] as string;
      const payload = req.body.toString();

      // Validar assinatura (se configurada)
      if (signature && !btgWebhooks.validateWebhookSignature(payload, signature)) {
        console.warn('[BTG Webhook] Assinatura inválida');
        return res.status(401).json({ error: 'Assinatura inválida' });
      }

      const data = JSON.parse(payload);
      console.log('[BTG Webhook] Evento recebido:', data.event);

      // Processar webhook assincronamente
      btgWebhooks.processWebhook(data).catch(err => {
        console.error('[BTG Webhook] Erro ao processar:', err);
      });

      // Responder rapidamente para o BTG
      res.status(200).json({ received: true });
    } catch (error: any) {
      console.error('[BTG Webhook] Erro:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Callback OAuth2 - recebe código de autorização
app.get(
  "/api/btg/callback",
  async (req: Request, res: Response) => {
    try {
      const { code, state, error } = req.query;

      if (error) {
        console.error('[BTG Auth] Erro na autorização:', error);
        return res.redirect(`/btg/auth/error?message=${error}`);
      }

      if (!code) {
        return res.status(400).json({ error: 'Código de autorização não fornecido' });
      }

      const redirectUri = `${req.protocol}://${req.get('host')}/api/btg/callback`;
      const tokens = await btgAuth.exchangeCodeForTokens(code as string, redirectUri);

      // TODO: Salvar tokens no banco de dados vinculado ao usuário/empresa
      console.log('[BTG Auth] Tokens obtidos com sucesso');

      // Redirecionar para página de sucesso
      res.redirect('/btg/auth/success');
    } catch (error: any) {
      console.error('[BTG Auth] Erro no callback:', error);
      res.redirect(`/btg/auth/error?message=${encodeURIComponent(error.message)}`);
    }
  }
);

// Iniciar fluxo de autorização
app.get(
  "/api/btg/auth/authorize",
  requireInternalKey,
  async (req: Request, res: Response) => {
    try {
      const redirectUri = `${req.protocol}://${req.get('host')}/api/btg/callback`;
      const authUrl = btgAuth.getAuthorizationUrl(redirectUri);
      res.json({ authUrl });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Verificar status da autenticação
app.get(
  "/api/btg/auth/status",
  requireInternalKey,
  async (req: Request, res: Response) => {
    res.json({
      authenticated: btgAuth.isAuthenticated(),
      token: btgAuth.getCurrentToken() ? {
        expires_at: btgAuth.getCurrentToken()?.expires_at,
        scope: btgAuth.getCurrentToken()?.scope
      } : null
    });
  }
);

// Listar empresas vinculadas
app.get(
  "/api/btg/empresas",
  requireInternalKey,
  async (req: Request, res: Response) => {
    try {
      const empresas = await btgService.listarEmpresas();
      res.json(empresas);
    } catch (error: any) {
      console.error('[BTG API] Erro ao listar empresas:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Consultar saldo
app.get(
  "/api/btg/saldo/:accountId",
  requireInternalKey,
  async (req: Request, res: Response) => {
    try {
      const { accountId } = req.params;
      const companyId = req.query.companyId as string;
      const saldo = await btgService.consultarSaldo(accountId, companyId);
      res.json(saldo);
    } catch (error: any) {
      console.error('[BTG API] Erro ao consultar saldo:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Consultar extrato
app.get(
  "/api/btg/extrato/:accountId",
  requireInternalKey,
  async (req: Request, res: Response) => {
    try {
      const { accountId } = req.params;
      const { startDate, endDate, companyId } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'startDate e endDate são obrigatórios' });
      }

      const extrato = await btgService.consultarExtrato(
        accountId,
        startDate as string,
        endDate as string,
        companyId as string
      );
      res.json(extrato);
    } catch (error: any) {
      console.error('[BTG API] Erro ao consultar extrato:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Criar boleto
app.post(
  "/api/btg/boletos",
  requireInternalKey,
  async (req: Request, res: Response) => {
    try {
      const boleto = await btgService.criarBoleto(req.body);
      res.json(boleto);
    } catch (error: any) {
      console.error('[BTG API] Erro ao criar boleto:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Cancelar boleto
app.delete(
  "/api/btg/boletos/:boletoId",
  requireInternalKey,
  async (req: Request, res: Response) => {
    try {
      await btgService.cancelarBoleto(req.params.boletoId);
      res.json({ success: true });
    } catch (error: any) {
      console.error('[BTG API] Erro ao cancelar boleto:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Criar PIX cobrança (QR Code)
app.post(
  "/api/btg/pix/cobranca",
  requireInternalKey,
  async (req: Request, res: Response) => {
    try {
      const pix = await btgService.criarPixCobranca(req.body);
      res.json(pix);
    } catch (error: any) {
      console.error('[BTG API] Erro ao criar PIX cobrança:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Criar pagamento PIX
app.post(
  "/api/btg/pagamentos/pix",
  requireInternalKey,
  async (req: Request, res: Response) => {
    try {
      const pagamento = await btgService.criarPagamentoPix(req.body);
      res.json(pagamento);
    } catch (error: any) {
      console.error('[BTG API] Erro ao criar pagamento PIX:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Criar pagamento TED
app.post(
  "/api/btg/pagamentos/ted",
  requireInternalKey,
  async (req: Request, res: Response) => {
    try {
      const pagamento = await btgService.criarPagamentoTed(req.body);
      res.json(pagamento);
    } catch (error: any) {
      console.error('[BTG API] Erro ao criar pagamento TED:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Criar pagamento de boleto
app.post(
  "/api/btg/pagamentos/boleto",
  requireInternalKey,
  async (req: Request, res: Response) => {
    try {
      const pagamento = await btgService.criarPagamentoBoleto(req.body);
      res.json(pagamento);
    } catch (error: any) {
      console.error('[BTG API] Erro ao criar pagamento boleto:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Consultar pagamento
app.get(
  "/api/btg/pagamentos/:pagamentoId",
  requireInternalKey,
  async (req: Request, res: Response) => {
    try {
      const pagamento = await btgService.consultarPagamento(req.params.pagamentoId);
      res.json(pagamento);
    } catch (error: any) {
      console.error('[BTG API] Erro ao consultar pagamento:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Cancelar pagamento
app.delete(
  "/api/btg/pagamentos/:pagamentoId",
  requireInternalKey,
  async (req: Request, res: Response) => {
    try {
      await btgService.cancelarPagamento(req.params.pagamentoId);
      res.json({ success: true });
    } catch (error: any) {
      console.error('[BTG API] Erro ao cancelar pagamento:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

app.listen(PORT, () => {
  console.log(`[Server] Backend rodando em http://localhost:${PORT}`);
  console.log(`[Server] OpenAI proxy: POST /api/openai/chat`);
  console.log(`[Server] Anthropic proxy: POST /api/anthropic/messages`);
  console.log(`[Server] Email API: POST /api/email/send`);
  console.log(`[Server] Calendar API: GET /api/calendar/events`);
  console.log(`[Server] Google Keep API: GET/POST/DELETE /api/keep/notes`);
  console.log(`[Server] BTG Pactual API: /api/btg/*`);
});
