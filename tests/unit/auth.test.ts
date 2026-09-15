import { describe, expect, it } from "vitest";
import { brandOnboardingSchema, creatorOnboardingSchema, registerSchema } from "@/features/auth/schemas";
import { getHomeRoute, getOnboardingRoute } from "@/features/auth/routing";

describe("authentication foundation", () => {
  it("does not allow self-registration as admin", () => {
    expect(registerSchema.safeParse({ email: "admin@example.com", password: "Password1", userType: "ADMIN" }).success).toBe(false);
  });

  it("routes each role to its protected application", () => {
    expect(getHomeRoute("BRAND")).toBe("/marca");
    expect(getHomeRoute("CREATOR")).toBe("/creator");
    expect(getHomeRoute("ADMIN")).toBe("/admin");
    expect(getOnboardingRoute("BRAND")).toBe("/onboarding/marca");
    expect(getOnboardingRoute("CREATOR")).toBe("/onboarding/creator");
  });

  it("validates the minimum brand onboarding data", () => {
    expect(brandOnboardingSchema.safeParse({ brandName: "Marca", firstName: "Ana", lastName: "Paz" }).success).toBe(true);
    expect(brandOnboardingSchema.safeParse({ brandName: "", firstName: "A", lastName: "" }).success).toBe(false);
  });

  it("validates the minimum creator onboarding data", () => {
    expect(creatorOnboardingSchema.safeParse({ publicName: "Ana Crea", firstName: "Ana", lastName: "Paz" }).success).toBe(true);
  });
});
