import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) throw new Error("Missing public Supabase staging environment variables");
if (!url.includes("bwctmomuthziyjaumjep.supabase.co")) throw new Error("Refusing to run against an unknown Supabase project");

const options = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } };
const client = () => createClient(url, key, options);
const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const password = "Password123";

async function waitForPostgrestJwt() {
  await new Promise((resolve) => setTimeout(resolve, 3_000));
}

async function registerBrand(label) {
  const supabase = client();
  const { data, error } = await supabase.auth.signUp({ email: `rls-brand-${label}-${suffix}@example.test`, password, options: { data: { user_type: "BRAND" } } });
  assert.ifError(error);
  assert.ok(data.user);
  await waitForPostgrestJwt();
  const { data: organizationId, error: onboardingError } = await supabase.rpc("complete_brand_onboarding", { brand_name: `RLS Brand ${label} ${suffix}`, first_name: "Marca", last_name: `Equipo ${label}` });
  assert.ifError(onboardingError);
  return { supabase, userId: data.user.id, organizationId };
}

async function registerCreator(label) {
  const supabase = client();
  const { data, error } = await supabase.auth.signUp({ email: `rls-creator-${label}-${suffix}@example.test`, password, options: { data: { user_type: "CREATOR" } } });
  assert.ifError(error);
  assert.ok(data.user);
  await waitForPostgrestJwt();
  const { error: onboardingError } = await supabase.rpc("complete_creator_onboarding", { first_name: "Creator", last_name: `Prueba ${label}`, public_name: `RLS Creator ${label} ${suffix}` });
  assert.ifError(onboardingError);
  return { supabase, userId: data.user.id };
}

const [brandA, brandB, creatorA, creatorB] = await Promise.all([
  registerBrand("A"),
  registerBrand("B"),
  registerCreator("A"),
  registerCreator("B"),
]);
assert.ok(brandA.organizationId);
assert.ok(brandB.organizationId);
const { data: brandAMemberships, error: brandAMembershipsError } = await brandA.supabase.from("organization_members").select("organization_id");
assert.ifError(brandAMembershipsError);
assert.equal(brandAMemberships.length, 1);
assert.equal(brandAMemberships[0].organization_id, brandA.organizationId);

const programName = `RLS Program ${suffix}`;
const programId = crypto.randomUUID();
const { error: programError } = await brandA.supabase.from("programs").insert({
  id: programId,
  organization_id: brandA.organizationId,
  name: programName,
  description: "Remote staging authorization test",
  visibility: "PUBLIC",
  applications_enabled: true,
  compensation_type: "FIXED",
  fixed_amount: 10000,
  created_by: brandA.userId,
});
assert.ifError(programError);
const { data: program, error: programReadError } = await brandA.supabase.from("programs").select("id").eq("id", programId).single();
assert.ifError(programReadError);

const { data: crossTenantUpdate, error: crossTenantError } = await brandB.supabase.from("programs").update({ description: "forged" }).eq("id", program.id).select("id");
assert.ifError(crossTenantError);
assert.equal(crossTenantUpdate.length, 0, "Brand B must not update Brand A program");

const { error: creatorCreateError } = await creatorA.supabase.from("programs").insert({
  organization_id: brandA.organizationId,
  name: "Forged creator program",
  description: "Must fail",
  visibility: "PUBLIC",
  applications_enabled: true,
  compensation_type: "FIXED",
  fixed_amount: 10000,
  created_by: creatorA.userId,
});
assert.ok(creatorCreateError, "Creator must not create a Program");

const { data: draftDiscovery } = await creatorA.supabase.from("programs").select("id").eq("id", program.id);
assert.equal(draftDiscovery.length, 0, "Draft Program must be private from unrelated creators");
assert.ifError((await brandA.supabase.from("programs").update({ status: "ACTIVE" }).eq("id", program.id)).error);
const { data: activeDiscovery } = await creatorA.supabase.from("programs").select("id").eq("id", program.id);
assert.equal(activeDiscovery.length, 1, "Active public Program must be discoverable");

const { data: applicationId, error: applicationError } = await creatorA.supabase.rpc("apply_to_program", { p_program_id: program.id, p_message: "Remote RLS test" });
assert.ifError(applicationError);
assert.ok((await creatorA.supabase.rpc("apply_to_program", { p_program_id: program.id })).error, "Duplicate pending application must fail");
assert.equal((await creatorB.supabase.from("program_applications").select("id").eq("id", applicationId)).data.length, 0, "Other creator must not see the application");
assert.ok((await brandB.supabase.rpc("review_program_application", { p_application_id: applicationId, p_decision: "ACCEPTED" })).error, "Wrong Brand must not review the application");
assert.ifError((await brandA.supabase.rpc("review_program_application", { p_application_id: applicationId, p_decision: "ACCEPTED" })).error);
assert.ifError((await brandA.supabase.rpc("review_program_application", { p_application_id: applicationId, p_decision: "ACCEPTED" })).error);
assert.equal((await creatorA.supabase.from("program_memberships").select("id").eq("program_id", program.id)).data.length, 1, "Acceptance must create one membership");

const { error: briefError } = await brandA.supabase.from("program_briefs").insert({ program_id: program.id, title: "RLS Brief", description: "Only members", requirements: "Member access" });
assert.ifError(briefError);
assert.equal((await creatorA.supabase.from("program_briefs").select("id").eq("program_id", program.id)).data.length, 1, "Member must see the Brief");
assert.equal((await creatorB.supabase.from("program_briefs").select("id").eq("program_id", program.id)).data.length, 0, "Unrelated creator must not see the Brief");

const { data: invitationId, error: invitationError } = await brandA.supabase.rpc("invite_creator_to_program", { p_program_id: program.id, p_creator_id: creatorB.userId });
assert.ifError(invitationError);
assert.ok((await brandA.supabase.rpc("invite_creator_to_program", { p_program_id: program.id, p_creator_id: creatorB.userId })).error, "Duplicate invitation must fail");
assert.equal((await creatorA.supabase.from("program_invitations").select("id").eq("id", invitationId)).data.length, 0, "Other creator must not see invitation");
assert.equal((await creatorB.supabase.from("program_invitations").select("id").eq("id", invitationId)).data.length, 1, "Addressed creator must see invitation");
assert.ifError((await creatorB.supabase.rpc("respond_to_program_invitation", { p_invitation_id: invitationId, p_response: "ACCEPTED" })).error);
assert.equal((await creatorB.supabase.from("program_memberships").select("id").eq("program_id", program.id)).data.length, 1, "Invitation acceptance must create membership");
assert.ok((await creatorB.supabase.from("program_memberships").insert({ program_id: program.id, creator_id: creatorB.userId, source: "MANUAL" })).error, "Direct membership insert must fail");

assert.ifError((await brandA.supabase.from("programs").update({ status: "ARCHIVED" }).eq("id", program.id)).error);
console.log("Remote staging RLS integration: passed");
