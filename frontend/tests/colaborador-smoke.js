import { chromium } from "playwright-chromium";

/**
 * Smoke test do portal do colaborador (produção).
 * - Usa credenciais via variáveis de ambiente:
 *   COLAB_EMAIL, COLAB_PASSWORD (obrigatórias)
 * - Verifica rotas principais do colaborador e falha se houver erros de console.
 *
 * Execução:
 *   COLAB_EMAIL=... COLAB_PASSWORD=... npm run test:colaborador
 */

const BASE_URL = process.env.BASE_URL || "https://easy.wgalmeida.com.br";
const USER_EMAIL = process.env.COLAB_EMAIL;
const USER_PASSWORD = process.env.COLAB_PASSWORD;
const SR_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SR_KEY;
const ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  process.env.ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobHF6emt4dXV0d29lcGlycHpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NzEyNDMsImV4cCI6MjA3NjE0NzI0M30.gLz5lpB5YlQpTfxzJjmILZwGp_H_XsT81nM2vXDbs7Y";
const PROJECT_REF = "ahlqzzkxuutwoepirpzr";

if (!USER_EMAIL) {
  console.error("Defina COLAB_EMAIL antes de rodar o teste.");
  process.exit(1);
}

const routes = [
  { path: "/colaborador", expectText: "Portal do Colaborador" },
  { path: "/colaborador/projetos", expectText: "Projetos" },
  { path: "/colaborador/servicos", expectText: "Serviços" },
  { path: "/colaborador/materiais", expectText: "Materiais" },
  { path: "/colaborador/financeiro", expectText: "Financeiro" },
  { path: "/colaborador/diario-obra", expectText: "Diário" },
  { path: "/colaborador/perfil", expectText: "Perfil" },
];

async function loginWithPassword(page) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
  await page.getByRole("textbox", { name: "Email ou CPF" }).fill(USER_EMAIL);
  await page.getByRole("textbox", { name: "Sua senha" }).fill(USER_PASSWORD);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await page.waitForTimeout(1000);
  await page.waitForURL(/(colaborador|dashboard|wgx|fornecedor|\/$)/, {
    timeout: 15000,
  });
}

async function loginWithMagicLink(page) {
  if (!SR_KEY) {
    throw new Error("Sem COLAB_PASSWORD nem SUPABASE_SERVICE_ROLE_KEY para login.");
  }
  // 1) gerar OTP magic link
  const genRes = await fetch(
    "https://ahlqzzkxuutwoepirpzr.supabase.co/auth/v1/admin/generate_link",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SR_KEY}`,
        apikey: SR_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "magiclink",
        email: USER_EMAIL,
      }),
    }
  );
  const genData = await genRes.json();
  const actionLink = genData?.action_link;
  const otp = genData?.email_otp;
  if (!genRes.ok || !otp || !actionLink) {
    throw new Error(
      `Falha ao gerar magiclink: ${genRes.status} ${genRes.statusText} ${JSON.stringify(
        genData
      )}`
    );
  }

  // 2) trocar OTP por sessão (sem depender do app)
  const verifyRes = await fetch(
    "https://ahlqzzkxuutwoepirpzr.supabase.co/auth/v1/verify",
    {
      method: "POST",
      headers: {
        apikey: ANON_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "magiclink",
        email: USER_EMAIL,
        token: otp,
      }),
    }
  );
  const session = await verifyRes.json();
  if (!verifyRes.ok || !session?.access_token || !session?.refresh_token) {
    throw new Error(
      `Falha ao verificar OTP: ${verifyRes.status} ${verifyRes.statusText} ${JSON.stringify(
        session
      )}`
    );
  }

  // 3) Gravar sessão no localStorage da aplicação
  const key = `sb-${PROJECT_REF}-auth-token`;
  const payload = {
    currentSession: {
      ...session,
      expires_at: session.expires_at || session.expires_in
        ? Math.floor(Date.now() / 1000) + session.expires_in
        : undefined,
    },
    expires_at:
      session.expires_at ||
      (session.expires_in
        ? Math.floor(Date.now() / 1000) + session.expires_in
        : undefined),
  };
  page.addInitScript(({ storageKey, value }) => {
    localStorage.setItem(storageKey, value);
  }, { storageKey: key, value: JSON.stringify(payload) });
  // chave de sessão de teste para AuthContext aplicar setSession
  page.addInitScript(({ storageKey, access_token, refresh_token }) => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({ access_token, refresh_token })
    );
  }, { storageKey: "sb-test-auth-token", access_token: session.access_token, refresh_token: session.refresh_token });

  await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(msg.text());
    }
  });

  try {
    if (USER_PASSWORD) {
      await loginWithPassword(page);
    } else {
      await loginWithMagicLink(page);
    }

    for (const route of routes) {
      await page.goto(`${BASE_URL}${route.path}`, { waitUntil: "networkidle" });
      if (page.url().includes("/login")) {
        throw new Error(`Rota ${route.path} redirecionou para login`);
      }
      await page.waitForTimeout(1500); // aguarda render
      if (route.expectText) {
        const found = await page
          .getByText(route.expectText, { exact: false })
          .first()
          .isVisible()
          .catch(() => false);
        if (!found) {
          throw new Error(
            `Rota ${route.path} não exibiu texto esperado: "${route.expectText}"`
          );
        }
      }
    }

    if (errors.length > 0) {
      throw new Error(`Erros de console detectados:\n${errors.join("\n")}`);
    }

    console.log("Smoke colaborador: OK");
  } finally {
    await page.close();
    await browser.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
