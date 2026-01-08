import { chromium } from "playwright-chromium";

const BASE_URL = process.env.BASE_URL || "https://easy.wgalmeida.com.br";
const USER_EMAIL = process.env.MASTER_EMAIL;
const USER_PASSWORD = process.env.MASTER_PASSWORD;

if (!USER_EMAIL || !USER_PASSWORD) {
  console.error(
    "MASTER_EMAIL e MASTER_PASSWORD devem ser informados como variáveis de ambiente."
  );
  process.exit(1);
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
    await page.getByRole("textbox", { name: "Email ou CPF" }).fill(USER_EMAIL);
    await page.getByRole("textbox", { name: "Sua senha" }).fill(USER_PASSWORD);
    await page.getByRole("button", { name: "Entrar", exact: true }).click();
    await page.waitForTimeout(1000);
    await page.waitForURL(/dashboard|master|admin|\/$/, { timeout: 15000 });
    if (page.url().includes("/login")) {
      throw new Error(
        "Redirecionado para login. Credenciais inválidas ou sem permissão."
      );
    }
    console.log("Login MASTER bem-sucedido! Página:", page.url());
  } catch (err) {
    console.error("Erro no teste de login MASTER:", err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
