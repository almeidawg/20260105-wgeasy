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

const app = express();
const PORT = process.env.PORT || 3001;

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

// ============================================================
// GOOGLE CALENDAR API
// ============================================================

// URL de autenticação OAuth2
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

// ============================================================
// INICIALIZAÇÃO DO SERVIDOR
// ============================================================

app.listen(PORT, () => {
  console.log(`[Server] Backend rodando em http://localhost:${PORT}`);
  console.log(`[Server] OpenAI proxy: POST /api/openai/chat`);
  console.log(`[Server] Anthropic proxy: POST /api/anthropic/messages`);
  console.log(`[Server] Email API: POST /api/email/send`);
  console.log(`[Server] Calendar API: GET /api/calendar/events`);
});
