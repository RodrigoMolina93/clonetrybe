import { expect, test, type Page } from "@playwright/test";

const password = "Password123";

async function registerBrand(page: Page, suffix: string) {
  const email = `phase1-brand-${suffix}@example.test`;
  await page.goto("/registro");
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña").fill(password);
  await page.getByLabel("Soy una marca").check();
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page).toHaveURL(/\/onboarding\/marca$/);
  await page.getByLabel("Nombre de la marca").fill(`Marca ${suffix}`);
  await page.getByLabel("Nombre", { exact: true }).fill("Marina");
  await page.getByLabel("Apellido").fill("Prueba");
  await page.getByRole("button", { name: "Crear espacio de marca" }).click();
  await expect(page).toHaveURL(/\/marca$/);
  await expect(page.getByRole("heading", { name: "Tu panel de marca está listo" })).toBeVisible();
  return email;
}

async function registerCreator(page: Page, suffix: string) {
  const email = `phase1-creator-${suffix}@example.test`;
  const publicName = `Creator ${suffix}`;
  await page.goto("/registro");
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña").fill(password);
  await page.getByLabel("Soy creator").check();
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page).toHaveURL(/\/onboarding\/creator$/);
  await page.getByLabel("Nombre", { exact: true }).fill("Clara");
  await page.getByLabel("Apellido").fill("Prueba");
  await page.getByLabel("Nombre público / nombre de creator").fill(publicName);
  await page.getByRole("button", { name: "Crear perfil" }).click();
  await expect(page).toHaveURL(/\/creator$/);
  await expect(page.getByRole("heading", { name: "Tu perfil de creator está listo" })).toBeVisible();
  return { email, publicName };
}

async function login(page: Page, email: string) {
  await page.goto("/ingresar");
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña").fill(password);
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(page.getByRole("heading", { name: /Tu panel de marca está listo|Tu perfil de creator está listo/ })).toBeVisible();
}

async function logout(page: Page) {
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await expect(page).toHaveURL(/\/ingresar$/);
}

async function createProgram(page: Page, programName: string) {
  await page.goto("/marca/programas/nuevo");
  await page.getByLabel("Nombre del programa").fill(programName);
  await page.getByLabel("Descripción corta").fill("Una propuesta de colaboración para creators de Argentina.");
  await page.getByLabel("Visibilidad").selectOption("PUBLIC");
  await page.getByLabel("Aceptar postulaciones").check();
  await page.getByLabel("Tipo de compensación").selectOption("FIXED");
  await page.getByLabel("Monto fijo (ARS)").fill("150000");
  await page.getByRole("button", { name: "Crear programa" }).click();
  await expect(page).toHaveURL(/\/marca\/programas\/[0-9a-f-]+$/);
  return page.url().split("/").at(-1)!;
}

test("brand to creator application and membership journey", async ({ page }) => {
  test.setTimeout(120_000);
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const programName = `Programa E2E ${suffix}`;
  const brandEmail = await registerBrand(page, suffix);
  const programId = await createProgram(page, programName);

  await page.getByRole("link", { name: "Brief" }).click();
  await page.getByLabel("Título del brief").fill("Brief de lanzamiento");
  await page.getByLabel("Objetivo y descripción").fill("Presentar la colección con una mirada auténtica.");
  await page.getByLabel("Requisitos").fill("Crear contenido original y respetar las fechas acordadas.");
  await page.getByLabel("Qué hacer (opcional)").fill("Usar luz natural.");
  await page.getByLabel("Qué evitar (opcional)").fill("Mostrar marcas competidoras.");
  await page.getByRole("button", { name: "Guardar brief" }).click();
  await expect(page).toHaveURL(new RegExp(`/marca/programas/${programId}/brief$`));
  await page.getByRole("link", { name: "Resumen" }).click();
  await page.getByRole("button", { name: "Activar" }).click();
  await expect(page.getByText("Activo", { exact: true }).first()).toBeVisible();
  await logout(page);

  const creator = await registerCreator(page, suffix);
  await page.goto("/creator/programas");
  await page.locator('[data-slot="card"]').filter({ hasText: programName }).getByRole("link", { name: "Ver detalle" }).click();
  await expect(page.getByRole("heading", { name: programName })).toBeVisible();
  await page.getByLabel("Mensaje para la marca (opcional)").fill("Me interesa participar de esta propuesta.");
  await page.getByRole("button", { name: "Postularme" }).click();
  await expect(page.getByText("Tu postulación está pendiente de revisión.")).toBeVisible();
  await logout(page);

  await login(page, brandEmail);
  await expect(page).toHaveURL(/\/marca$/);
  await page.goto(`/marca/programas/${programId}/creadores`);
  await page.getByRole("button", { name: "Aceptar", exact: true }).click();
  await expect(page.getByText(creator.publicName, { exact: true }).last()).toBeVisible();
  await logout(page);

  await login(page, creator.email);
  await expect(page).toHaveURL(/\/creator$/);
  await page.goto("/creator/programas/mis-programas");
  await expect(page.getByText(programName, { exact: true })).toBeVisible();
  await page.goto(`/creator/programas/${programId}`);
  await expect(page.getByText("Brief de lanzamiento", { exact: true })).toBeVisible();
  await expect(page.getByText("Crear contenido original y respetar las fechas acordadas.", { exact: true })).toBeVisible();
});

test("brand invitation can be accepted by the addressed creator", async ({ page }) => {
  test.setTimeout(120_000);
  const suffix = `invite-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const creator = await registerCreator(page, suffix);
  await logout(page);
  const brandEmail = await registerBrand(page, suffix);
  const programId = await createProgram(page, `Programa invitación ${suffix}`);
  await page.goto(`/marca/programas/${programId}/creadores`);
  await page.getByPlaceholder("Nombre público, nombre o apellido").fill(creator.publicName);
  await page.getByRole("button", { name: "Buscar" }).click();
  await page.getByRole("button", { name: "Invitar" }).click();
  await expect(page.getByText(creator.publicName, { exact: true }).last()).toBeVisible();
  await logout(page);

  await login(page, creator.email);
  await page.goto("/creator/programas/invitaciones");
  await page.getByRole("button", { name: "Aceptar invitación" }).click();
  await expect(page).toHaveURL(new RegExp(`/creator/programas/${programId}$`));
  await expect(page.getByText("Ya sos parte de este programa.")).toBeVisible();
  await page.goto("/creator/programas/mis-programas");
  await expect(page.getByText(`Programa invitación ${suffix}`, { exact: true })).toBeVisible();
  await logout(page);
  await login(page, brandEmail);
  await page.goto(`/marca/programas/${programId}/creadores`);
  await expect(page.getByText(creator.publicName, { exact: true }).last()).toBeVisible();
});
