import { z } from "zod";
import { getDictionary } from "@/lib/i18n";

const messages = getDictionary().sampling.errors;
const optionalText = (max: number) => z.string().trim().max(max).transform((value) => value || null);
const optionalHttpsUrl = z.string().trim().refine((value) => value === "" || (value.startsWith("https://") && value.length <= 2048), messages.invalidProduct).transform((value) => value || null);

export const productSchema = z.object({
  programId: z.uuid(),
  productId: z.uuid().optional(),
  name: z.string().trim().min(2, messages.invalidProduct).max(160, messages.invalidProduct),
  description: z.string().trim().refine((value) => value === "" || value.length >= 2, messages.invalidProduct).max(3000, messages.invalidProduct).transform((value) => value || null),
  imageUrl: optionalHttpsUrl,
  active: z.string().optional().transform((value) => value === "on"),
  variants: z.string().max(4000, messages.invalidVariant).transform((value, context) => {
    const labels = [...new Set(value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean))];
    if (labels.some((label) => label.length > 120)) context.addIssue({ code: "custom", message: messages.invalidVariant });
    return labels;
  }),
});

export const addressSchema = z.object({
  programId: z.uuid(),
  recipientName: z.string().trim().min(2, messages.invalidAddress).max(160, messages.invalidAddress),
  street: z.string().trim().min(2, messages.invalidAddress).max(160, messages.invalidAddress),
  streetNumber: z.string().trim().min(1, messages.invalidAddress).max(30, messages.invalidAddress),
  apartment: optionalText(40),
  city: z.string().trim().min(2, messages.invalidAddress).max(120, messages.invalidAddress),
  province: z.string().trim().min(2, messages.invalidAddress).max(120, messages.invalidAddress),
  postalCode: z.string().trim().min(3, messages.invalidAddress).max(12, messages.invalidAddress),
  country: z.literal("Argentina"),
  phone: optionalText(40),
  additionalInfo: optionalText(500),
});

export const sampleRequestSchema = z.object({
  programId: z.uuid(),
  productId: z.uuid(),
  variantId: z.string().transform((value) => value || null).pipe(z.uuid().nullable()),
  creatorNote: optionalText(1000),
});

export const transitionSchema = z.object({
  programId: z.uuid(),
  requestId: z.uuid(),
  targetStatus: z.enum(["APPROVED", "REJECTED", "PREPARING", "SHIPPED", "CANCELLED"]),
  brandNote: optionalText(1000),
  carrierName: optionalText(120),
  trackingNumber: optionalText(160),
  trackingUrl: optionalHttpsUrl,
});

export const receiptSchema = z.object({ programId: z.uuid(), requestId: z.uuid() });
export const issueSchema = receiptSchema.extend({
  issueType: z.enum(["NOT_RECEIVED", "WRONG_PRODUCT", "WRONG_VARIANT", "DAMAGED", "OTHER"]),
  description: z.string().trim().min(2, messages.invalidIssue).max(2000, messages.invalidIssue),
});
export const resolveIssueSchema = z.object({
  programId: z.uuid(),
  issueId: z.uuid(),
  resolutionStatus: z.enum(["SHIPPED", "CANCELLED"]),
  brandNote: optionalText(1000),
  carrierName: optionalText(120),
  trackingNumber: optionalText(160),
  trackingUrl: optionalHttpsUrl,
});
