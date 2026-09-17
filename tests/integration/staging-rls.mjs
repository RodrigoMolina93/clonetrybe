import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const expectedRef = process.env.PUMM_SUPABASE_PROJECT_REF;
if (!url || !key || !expectedRef) throw new Error("Missing PUMM staging environment variables.");
if (new URL(url).hostname.split(".")[0] !== expectedRef) throw new Error("Refusing to test an unapproved Supabase project.");

const password = "Password123";
const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

async function createOwner(label) {
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await supabase.auth.signUp({ email: `pumm-rls-${label}-${suffix}@example.test`, password });
  assert.ifError(error);
  assert.ok(data.user && data.session, "Staging email confirmation must be disabled for automated integration tests.");
  const { data: organizationId, error: onboardingError } = await supabase.rpc("complete_organization_onboarding", {
    organization_name: `PUMM RLS ${label} ${suffix}`,
    first_name: label,
    last_name: "Prueba",
  });
  assert.ifError(onboardingError);
  return { supabase, organizationId, userId: data.user.id };
}

const [tenantA, tenantB] = await Promise.all([createOwner("Alpha"), createOwner("Beta")]);

assert.equal((await tenantA.supabase.from("organizations").select("id")).data.length, 1, "Tenant A sees its organization");
assert.equal((await tenantB.supabase.from("organizations").select("id").eq("id", tenantA.organizationId)).data.length, 0, "Tenant B cannot read Tenant A");
assert.equal((await tenantB.supabase.from("organization_members").select("user_id").eq("organization_id", tenantA.organizationId)).data.length, 0, "Tenant B cannot read Tenant A memberships");
assert.equal((await tenantB.supabase.from("organizations").update({ name: "Forged" }).eq("id", tenantA.organizationId).select("id")).data.length, 0, "Tenant B cannot update Tenant A");
assert.ok((await tenantB.supabase.from("organization_members").insert({ organization_id: tenantA.organizationId, user_id: tenantB.userId, role: "OWNER" })).error, "Users cannot forge memberships");
assert.ifError((await tenantA.supabase.from("organizations").update({ name: `PUMM Updated ${suffix}` }).eq("id", tenantA.organizationId)).error);
assert.ok((await tenantA.supabase.from("programs").select("id")).error, "Legacy Creator Commerce tables are absent");

console.log("PUMM remote staging RLS integration: passed");
