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

const productId = crypto.randomUUID();
const variantId = crypto.randomUUID();
assert.ifError((await brandA.supabase.from("sample_products").insert({ id: productId, organization_id: brandA.organizationId, program_id: program.id, name: `RLS Sample ${suffix}`, created_by: brandA.userId })).error);
assert.ifError((await brandA.supabase.from("sample_product_variants").insert({ id: variantId, product_id: productId, label: "Negro / M" })).error);
assert.equal((await brandB.supabase.from("sample_products").update({ name: "forged" }).eq("id", productId).select("id")).data.length, 0, "Wrong Brand must not edit sampling product");
assert.ok((await creatorA.supabase.from("sample_products").insert({ organization_id: brandA.organizationId, program_id: program.id, name: "forged", created_by: creatorA.userId })).error, "Creator must not create sampling products");
assert.ifError((await creatorA.supabase.from("creator_shipping_addresses").insert({ creator_id: creatorA.userId, recipient_name: "Creator A", street: "Corrientes", street_number: "1234", city: "CABA", province: "Buenos Aires", postal_code: "C1043AAZ" })).error);
assert.equal((await creatorB.supabase.from("creator_shipping_addresses").select("creator_id").eq("creator_id", creatorA.userId)).data.length, 0, "Other creator must not read current address");
assert.ok((await creatorB.supabase.rpc("request_sample", { p_product_id: productId, p_variant_id: variantId })).error, "Non-member must not request sample");
const { data: sampleRequestId, error: sampleRequestError } = await creatorA.supabase.rpc("request_sample", { p_product_id: productId, p_variant_id: variantId, p_creator_note: "Remote sampling test" });
assert.ifError(sampleRequestError);
assert.ok((await creatorA.supabase.rpc("request_sample", { p_product_id: productId, p_variant_id: variantId })).error, "Duplicate active sample request must fail");
assert.equal((await brandB.supabase.from("sample_requests").select("id").eq("id", sampleRequestId)).data.length, 0, "Wrong Brand must not read sample request");
assert.ok((await brandB.supabase.rpc("get_sample_request_shipping_address", { p_request_id: sampleRequestId })).error, "Wrong Brand must not read fulfillment snapshot");
const { data: fulfillmentAddress, error: fulfillmentError } = await brandA.supabase.rpc("get_sample_request_shipping_address", { p_request_id: sampleRequestId });
assert.ifError(fulfillmentError);
assert.equal(fulfillmentAddress[0].recipient_name, "Creator A");
assert.ok((await brandB.supabase.rpc("transition_sample_request", { p_request_id: sampleRequestId, p_target_status: "APPROVED" })).error, "Wrong Brand must not transition request");
assert.ifError((await brandA.supabase.rpc("transition_sample_request", { p_request_id: sampleRequestId, p_target_status: "APPROVED" })).error);
assert.ok((await brandA.supabase.rpc("transition_sample_request", { p_request_id: sampleRequestId, p_target_status: "SHIPPED" })).error, "Invalid state transition must fail");
assert.ifError((await brandA.supabase.rpc("transition_sample_request", { p_request_id: sampleRequestId, p_target_status: "PREPARING" })).error);
assert.ifError((await brandA.supabase.rpc("transition_sample_request", { p_request_id: sampleRequestId, p_target_status: "SHIPPED", p_carrier_name: "Correo Argentino", p_tracking_number: `AR-${suffix}` })).error);
assert.ok((await creatorB.supabase.rpc("confirm_sample_received", { p_request_id: sampleRequestId })).error, "Other creator must not confirm receipt");
assert.ifError((await creatorA.supabase.rpc("confirm_sample_received", { p_request_id: sampleRequestId })).error);
const { data: issueId, error: issueError } = await creatorA.supabase.rpc("report_sample_issue", { p_request_id: sampleRequestId, p_issue_type: "DAMAGED", p_description: "Paquete dañado" });
assert.ifError(issueError);
assert.ok((await brandB.supabase.rpc("resolve_sample_issue", { p_issue_id: issueId, p_resolution_status: "CANCELLED" })).error, "Wrong Brand must not resolve issue");
assert.ifError((await brandA.supabase.rpc("resolve_sample_issue", { p_issue_id: issueId, p_resolution_status: "CANCELLED", p_brand_note: "Caso cerrado" })).error);
const { data: finalRequest, error: finalRequestError } = await creatorA.supabase.from("sample_requests").select("status").eq("id", sampleRequestId).single();
assert.ifError(finalRequestError);
assert.equal(finalRequest.status, "CANCELLED");
assert.equal((await creatorA.supabase.from("sample_tracking_events").select("id").eq("sample_request_id", sampleRequestId)).data.length, 8, "Sampling history must be complete");

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
