import { expect, test } from "@playwright/test";

const password = "Password123";

test("protected routes reject unauthenticated users", async ({ page }) => {
  await page.goto("/app");
  await expect(page).toHaveURL(/\/ingresar/);
  await expect(page.getByRole("heading", { name: "Ingresá a PUMM" })).toBeVisible();
});

test("registration creates an organization owner and supports settings", async ({ page }) => {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const email = `pumm-owner-${suffix}@example.test`;
  const organizationName = `PUMM E2E ${suffix}`;

  await page.goto("/registro");
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña").fill(password);
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page).toHaveURL(/\/onboarding$/);
  await page.getByLabel("Nombre de la organización").fill(organizationName);
  await page.getByLabel("Nombre", { exact: true }).fill("Paula");
  await page.getByLabel("Apellido").fill("Prueba");
  await page.getByRole("button", { name: "Crear organización" }).click();

  await expect(page).toHaveURL(/\/app$/);
  await expect(page.getByRole("heading", { name: "Tu espacio de PUMM está listo" })).toBeVisible();
  await expect(page.getByText(organizationName, { exact: true }).last()).toBeVisible();
  await expect(page.getByText("Propietario", { exact: true })).toBeVisible();

  await page.getByRole("link", { name: "Configuración" }).click();
  await page.getByLabel("Nombre", { exact: true }).fill("Patricia");
  await page.getByRole("button", { name: "Guardar cambios" }).first().click();
  await expect(page.getByText("Tus datos se guardaron correctamente.")).toBeVisible();

  await page.goto("/marca");
  await expect(page.getByRole("heading", { name: "Página no encontrada" })).toBeVisible();

  await page.goto("/");
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña").fill(password);
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(page).toHaveURL(/\/app$/);
});
