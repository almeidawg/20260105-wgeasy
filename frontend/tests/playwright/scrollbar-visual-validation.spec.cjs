const { test, expect } = require("@playwright/test");

test("Validação visual das barras de rolagem no dashboard", async ({
  page,
}) => {
  await page.goto("http://localhost:5173/dashboard");

  // Aguarda o carregamento do checklist
  await page.waitForSelector("text=Checklist Diário (Google Keep)", {
    timeout: 8000,
  });

  // Valida se existe apenas uma barra de rolagem principal (body/html)
  const bodyOverflowY = await page.evaluate(
    () => getComputedStyle(document.body).overflowY
  );
  const htmlOverflowY = await page.evaluate(
    () => getComputedStyle(document.documentElement).overflowY
  );

  expect([bodyOverflowY, htmlOverflowY]).toContain("auto");

  // Valida se o card do checklist não tem barra de rolagem "flutuante" visível
  const checklistCard = await page
    .locator("text=Checklist Diário (Google Keep)")
    .first()
    .elementHandle();
  const checklistOverflowY = await checklistCard.evaluate(
    (el) => getComputedStyle(el.parentElement).overflowY
  );

  expect(checklistOverflowY).toBe("visible");

  // Screenshot para validação manual
  await page.screenshot({
    path: "scrollbar-dashboard-validation.png",
    fullPage: true,
  });
});
