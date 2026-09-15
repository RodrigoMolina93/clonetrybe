import { describe, expect, it } from "vitest";
import { formatProgramCompensation } from "@/features/programs/presentation";
import { applicationSchema, briefSchema, programSchema } from "@/features/programs/schemas";
import type { Program } from "@/features/programs/types";

const baseProgram = {
  name: "Lanzamiento de invierno",
  description: "Contenido para la nueva colección",
  visibility: "PUBLIC",
  applicationsEnabled: "on",
  startDate: "2026-06-01",
  endDate: "2026-06-30",
};

describe("program validation", () => {
  it("converts a fixed ARS amount to exact minor units", () => {
    const parsed = programSchema.parse({ ...baseProgram, compensationType: "FIXED", fixedAmount: "150000,50", revenueSharePercentage: "" });
    expect(parsed.fixedAmount).toBe(15_000_050);
    expect(parsed.revenueSharePercentage).toBeNull();
  });

  it("keeps revenue share separate from fixed compensation", () => {
    const parsed = programSchema.parse({ ...baseProgram, compensationType: "REVENUE_SHARE", fixedAmount: "", revenueSharePercentage: "15.25" });
    expect(parsed.fixedAmount).toBeNull();
    expect(parsed.revenueSharePercentage).toBe(15.25);
  });

  it("rejects invalid compensation and date ranges", () => {
    expect(programSchema.safeParse({ ...baseProgram, compensationType: "FIXED", fixedAmount: "0", revenueSharePercentage: "", endDate: "2026-05-01" }).success).toBe(false);
    expect(programSchema.safeParse({ ...baseProgram, compensationType: "REVENUE_SHARE", fixedAmount: "", revenueSharePercentage: "100.01" }).success).toBe(false);
  });

  it("validates brief and application limits", () => {
    expect(briefSchema.safeParse({ programId: crypto.randomUUID(), title: "Brief", description: "Objetivo", requirements: "Requisitos", dos: "", donts: "" }).success).toBe(true);
    expect(applicationSchema.safeParse({ programId: crypto.randomUUID(), message: "x".repeat(1001) }).success).toBe(false);
  });
});

describe("program presentation", () => {
  it("formats fixed compensation with Argentine locale", () => {
    const program = { compensation_type: "FIXED", fixed_amount: 15_000_000, revenue_share_percentage: null } as Program;
    expect(formatProgramCompensation(program, "es-AR", "Pago fijo", "Comisión por ventas")).toContain("150.000");
  });
});

