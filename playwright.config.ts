import { defineConfig } from "@playwright/test";

const remoteBaseUrl = process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: { baseURL: remoteBaseUrl ?? "http://127.0.0.1:3000", trace: "on-first-retry" },
  webServer: remoteBaseUrl
    ? undefined
    : {
        command: "npm run dev",
        url: "http://127.0.0.1:3000/ingresar",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
