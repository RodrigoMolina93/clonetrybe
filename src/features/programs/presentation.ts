import type { Program } from "@/features/programs/types";

export function formatProgramCompensation(program: Program, locale: string, fixedLabel: string, shareLabel: string): string {
  if (program.compensation_type === "FIXED" && program.fixed_amount !== null) {
    return `${fixedLabel}: ${new Intl.NumberFormat(locale, { style: "currency", currency: "ARS" }).format(program.fixed_amount / 100)}`;
  }
  return `${shareLabel}: ${new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(program.revenue_share_percentage ?? 0)}%`;
}

export function formatDate(value: string | null, locale: string, fallback: string): string {
  if (!value) return fallback;
  return new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

