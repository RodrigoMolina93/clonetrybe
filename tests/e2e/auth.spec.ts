import { expect, test } from "@playwright/test";

const password = "Password123";

test("protected routes reject unauthenticated users", async ({ page }) => {
  await page.goto("/marca");
  await expect(page).toHaveURL(/\/ingresar/);
  await expect(page.getByRole("heading", { name: "Ingresá a tu cuenta" })).toBeVisible();
});

test("brand registration creates an organization and owner membership", async ({ page }) => {
  const email = `brand-${Date.now()}@example.test`;
  await page.goto("/registro");
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña").fill(password);
  await page.getByLabel("Soy una marca").check();
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page).toHaveURL(/\/onboarding\/marca$/);
  await page.getByLabel("Nombre de la marca").fill("Marca Playwright");
  await page.getByLabel("Nombre", { exact: true }).fill("María");
  await page.getByLabel("Apellido").fill("Prueba");
  await page.getByRole("button", { name: "Crear espacio de marca" }).click();
  await expect(page).toHaveURL(/\/marca$/);
  await expect(page.getByRole("heading", { name: "Tu panel de marca está listo" })).toBeVisible();

  await page.goto("/creator");
  await expect(page).toHaveURL(/\/marca$/);
  await expect(page.getByRole("heading", { name: "Tu panel de marca está listo" })).toBeVisible();
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/marca$/);
  await expect(page.getByRole("heading", { name: "Tu panel de marca está listo" })).toBeVisible();

  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña").fill(password);
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(page).toHaveURL(/\/marca$/);
});

test("creator registration creates a creator profile", async ({ page }) => {
  const email = `creator-${Date.now()}@example.test`;
  await page.goto("/registro");
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña").fill(password);
  await page.getByLabel("Soy creator").check();
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page).toHaveURL(/\/onboarding\/creator$/);
  await page.getByLabel("Nombre", { exact: true }).fill("Camila");
  await page.getByLabel("Apellido").fill("Prueba");
  await page.getByLabel("Nombre público / nombre de creator").fill("Cami Crea");
  await page.getByRole("button", { name: "Crear perfil" }).click();
  await expect(page).toHaveURL(/\/creator$/);
  await expect(page.getByRole("heading", { name: "Tu perfil de creator está listo" })).toBeVisible();

  await page.goto("/marca");
  await expect(page).toHaveURL(/\/creator$/);
  await expect(page.getByRole("heading", { name: "Tu perfil de creator está listo" })).toBeVisible();
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/creator$/);
  await expect(page.getByRole("heading", { name: "Tu perfil de creator está listo" })).toBeVisible();

  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña").fill(password);
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(page).toHaveURL(/\/creator$/);
});
