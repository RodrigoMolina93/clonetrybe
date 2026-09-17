import { describe, expect, it } from "vitest";
import { onboardingSchema, organizationSettingsSchema, profileSettingsSchema, registerSchema } from "@/features/auth/schemas";
import { homeRoute, onboardingRoute } from "@/features/auth/routing";

describe("PUMM authentication and organization validation", () => {
  it("registers a single account type without accepting legacy role fields", () => {
    expect(registerSchema.safeParse({ email: "owner@example.com", password: "Password1" }).success).toBe(true);
    expect(registerSchema.safeParse({ email: "owner@example.com", password: "weak" }).success).toBe(false);
  });

  it("uses the unified protected routes", () => {
    expect(homeRoute).toBe("/app");
    expect(onboardingRoute).toBe("/onboarding");
  });

  it("validates organization onboarding", () => {
    expect(onboardingSchema.safeParse({ organizationName: "PUMM Labs", firstName: "Ana", lastName: "Paz" }).success).toBe(true);
    expect(onboardingSchema.safeParse({ organizationName: "", firstName: "A", lastName: "" }).success).toBe(false);
  });

  it("validates settings updates", () => {
    expect(profileSettingsSchema.safeParse({ firstName: "Ana", lastName: "Paz" }).success).toBe(true);
    expect(organizationSettingsSchema.safeParse({ organizationId: crypto.randomUUID(), organizationName: "PUMM Labs" }).success).toBe(true);
  });
});
