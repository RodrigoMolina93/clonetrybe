import { z } from "zod";
import { getDictionary } from "@/lib/i18n";

const messages = getDictionary().auth.errors;
const email = z.email(messages.invalidEmail).trim();
const password = z.string().min(8, messages.password).regex(/[A-Za-z]/, messages.password).regex(/[0-9]/, messages.password);
const name = z.string().trim().min(2, messages.nameLength).max(80, messages.nameLength);

export const loginSchema = z.object({ email, password: z.string().min(1, messages.required) });
export const registerSchema = z.object({ email, password });
export const onboardingSchema = z.object({
  organizationName: z.string().trim().min(2, messages.organizationNameLength).max(120, messages.organizationNameLength),
  firstName: name,
  lastName: name,
});
export const profileSettingsSchema = z.object({ firstName: name, lastName: name });
export const organizationSettingsSchema = z.object({
  organizationId: z.uuid(),
  organizationName: z.string().trim().min(2, messages.organizationNameLength).max(120, messages.organizationNameLength),
});
