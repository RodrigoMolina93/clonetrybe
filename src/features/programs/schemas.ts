import { z } from "zod";
import { getDictionary } from "@/lib/i18n";

const messages = getDictionary().programs.errors;
const optionalDate = z.string().trim().refine((value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value), messages.invalidDateRange);
const money = z.string().trim().regex(/^\d+(?:[.,]\d{1,2})?$/, messages.invalidFixedAmount);
const percentage = z.coerce.number().positive(messages.invalidPercentage).max(100, messages.invalidPercentage);

function moneyToMinorUnits(value: string): number {
  const [whole, decimals = ""] = value.replace(",", ".").split(".");
  return Number(whole) * 100 + Number(decimals.padEnd(2, "0"));
}

export const programSchema = z.object({
  name: z.string().trim().min(2, messages.nameLength).max(120, messages.nameLength),
  description: z.string().trim().min(2, messages.descriptionLength).max(5000, messages.descriptionLength),
  visibility: z.enum(["PRIVATE", "PUBLIC"]),
  applicationsEnabled: z.string().optional().transform((value) => value === "on"),
  startDate: optionalDate,
  endDate: optionalDate,
  compensationType: z.enum(["FIXED", "REVENUE_SHARE"]),
  fixedAmount: z.string().trim().optional().default(""),
  revenueSharePercentage: z.string().trim().optional().default(""),
}).superRefine((data, context) => {
  if (data.startDate && data.endDate && data.endDate < data.startDate) {
    context.addIssue({ code: "custom", path: ["endDate"], message: messages.invalidDateRange });
  }
  if (data.compensationType === "FIXED") {
    const parsed = money.safeParse(data.fixedAmount);
    if (!parsed.success || moneyToMinorUnits(data.fixedAmount) <= 0 || !Number.isSafeInteger(moneyToMinorUnits(data.fixedAmount))) {
      context.addIssue({ code: "custom", path: ["fixedAmount"], message: messages.invalidFixedAmount });
    }
  } else if (!percentage.safeParse(data.revenueSharePercentage).success) {
    context.addIssue({ code: "custom", path: ["revenueSharePercentage"], message: messages.invalidPercentage });
  }
}).transform((data) => ({
  ...data,
  startDate: data.startDate || null,
  endDate: data.endDate || null,
  fixedAmount: data.compensationType === "FIXED" ? moneyToMinorUnits(data.fixedAmount) : null,
  revenueSharePercentage: data.compensationType === "REVENUE_SHARE" ? Number(data.revenueSharePercentage) : null,
}));

export const briefSchema = z.object({
  programId: z.uuid(),
  title: z.string().trim().min(2, messages.briefLength).max(160, messages.briefLength),
  description: z.string().trim().min(2, messages.briefLength).max(5000, messages.briefLength),
  requirements: z.string().trim().min(2, messages.briefLength).max(10000, messages.briefLength),
  dos: z.string().trim().max(5000, messages.briefLength).transform((value) => value || null),
  donts: z.string().trim().max(5000, messages.briefLength).transform((value) => value || null),
});

export const programIdSchema = z.object({ programId: z.uuid() });
export const applicationSchema = programIdSchema.extend({
  message: z.string().trim().max(1000, messages.messageLength).transform((value) => value || null),
});
export const relationshipIdSchema = z.object({ relationshipId: z.uuid(), programId: z.uuid().optional() });
export const invitationSchema = z.object({ programId: z.uuid(), creatorId: z.uuid() });
export const statusSchema = z.object({
  programId: z.uuid(),
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "ENDED", "ARCHIVED"]),
});

