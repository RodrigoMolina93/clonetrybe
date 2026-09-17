import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.url(),
  PUMM_SUPABASE_PROJECT_REF: z.union([z.literal("local"), z.string().regex(/^[a-z]{20}$/)]),
});

export function getPublicEnv() {
  const env = publicEnvSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    PUMM_SUPABASE_PROJECT_REF: process.env.PUMM_SUPABASE_PROJECT_REF,
  });
  const hostname = new URL(env.NEXT_PUBLIC_SUPABASE_URL).hostname;
  const linkedRef = hostname.split(".")[0];
  if (hostname.endsWith(".supabase.co") && linkedRef !== env.PUMM_SUPABASE_PROJECT_REF) {
    throw new Error("Supabase project does not match the approved PUMM environment.");
  }
  return env;
}
