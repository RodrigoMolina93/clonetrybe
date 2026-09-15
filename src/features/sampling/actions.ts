"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/features/auth/types";
import { getSamplingErrorMessage } from "@/features/sampling/errors";
import {
  addressSchema,
  issueSchema,
  productSchema,
  receiptSchema,
  resolveIssueSchema,
  sampleRequestSchema,
  transitionSchema,
} from "@/features/sampling/schemas";
import { createClient } from "@/lib/supabase/server";
import { getBrandProgram } from "@/repositories/program-repository";
import { getSampleProduct } from "@/repositories/sampling-repository";
import { requireRole } from "@/services/auth-service";

function validationError(fieldErrors: Record<string, string[] | undefined>): ActionState {
  return { status: "error", fieldErrors: Object.fromEntries(Object.entries(fieldErrors).filter((entry): entry is [string, string[]] => Boolean(entry[1]))) };
}

export async function createSampleProduct(_state: ActionState, formData: FormData): Promise<ActionState> {
  const viewer = await requireRole("BRAND");
  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);
  const program = await getBrandProgram(parsed.data.programId);
  if (!program) return { status: "error", message: getSamplingErrorMessage({ code: "42501", message: "not_authorized" }) };
  const supabase = await createClient();
  const productId = crypto.randomUUID();
  const { error } = await supabase.from("sample_products").insert({
    id: productId,
    organization_id: program.organization_id,
    program_id: program.id,
    name: parsed.data.name,
    description: parsed.data.description,
    image_url: parsed.data.imageUrl,
    active: parsed.data.active,
    created_by: viewer.user.id,
  });
  if (error) return { status: "error", message: getSamplingErrorMessage(error) };
  if (parsed.data.variants.length > 0) {
    const { error: variantsError } = await supabase.from("sample_product_variants").insert(
      parsed.data.variants.map((label) => ({ product_id: productId, label })),
    );
    if (variantsError) return { status: "error", message: getSamplingErrorMessage(variantsError) };
  }
  redirect(`/marca/programas/${program.id}/sampling`);
}

export async function updateSampleProduct(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("BRAND");
  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);
  if (!parsed.data.productId) return { status: "error", message: getSamplingErrorMessage({ code: "22023", message: "invalid_product" }) };
  const product = await getSampleProduct(parsed.data.productId);
  if (!product || product.program_id !== parsed.data.programId) return { status: "error", message: getSamplingErrorMessage({ code: "42501", message: "not_authorized" }) };
  const supabase = await createClient();
  const { error } = await supabase.from("sample_products").update({
    name: parsed.data.name,
    description: parsed.data.description,
    image_url: parsed.data.imageUrl,
    active: parsed.data.active,
  }).eq("id", product.id);
  if (error) return { status: "error", message: getSamplingErrorMessage(error) };

  const submitted = new Set(parsed.data.variants);
  const existing = new Map(product.variants.map((variant) => [variant.label, variant]));
  const variantUpdates = await Promise.all(product.variants.map((variant) => supabase.from("sample_product_variants")
      .update({ active: submitted.has(variant.label) })
      .eq("id", variant.id)));
  const failedUpdate = variantUpdates.find((result) => result.error)?.error;
  if (failedUpdate) return { status: "error", message: getSamplingErrorMessage(failedUpdate) };
  const newLabels = parsed.data.variants.filter((label) => !existing.has(label));
  if (newLabels.length > 0) {
    const { error: variantsError } = await supabase.from("sample_product_variants").insert(
      newLabels.map((label) => ({ product_id: product.id, label })),
    );
    if (variantsError) return { status: "error", message: getSamplingErrorMessage(variantsError) };
  }
  redirect(`/marca/programas/${product.program_id}/sampling`);
}

export async function toggleSampleProduct(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("BRAND");
  const productId = String(formData.get("productId") ?? "");
  const programId = String(formData.get("programId") ?? "");
  const active = formData.get("active") === "true";
  const product = await getSampleProduct(productId);
  if (!product || product.program_id !== programId) return { status: "error", message: getSamplingErrorMessage({ code: "42501", message: "not_authorized" }) };
  const supabase = await createClient();
  const { error } = await supabase.from("sample_products").update({ active }).eq("id", productId);
  if (error) return { status: "error", message: getSamplingErrorMessage(error) };
  revalidatePath(`/marca/programas/${programId}/sampling`);
  return { status: "idle" };
}

export async function saveShippingAddress(_state: ActionState, formData: FormData): Promise<ActionState> {
  const viewer = await requireRole("CREATOR");
  const parsed = addressSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ...validationError(parsed.error.flatten().fieldErrors), message: getSamplingErrorMessage({ code: "22023", message: "invalid_address" }) };
  const supabase = await createClient();
  const { error } = await supabase.from("creator_shipping_addresses").upsert({
    creator_id: viewer.user.id,
    recipient_name: parsed.data.recipientName,
    street: parsed.data.street,
    street_number: parsed.data.streetNumber,
    apartment: parsed.data.apartment,
    city: parsed.data.city,
    province: parsed.data.province,
    postal_code: parsed.data.postalCode,
    country: parsed.data.country,
    phone: parsed.data.phone,
    additional_info: parsed.data.additionalInfo,
  });
  if (error) return { status: "error", message: getSamplingErrorMessage(error) };
  redirect(`/creator/programas/${parsed.data.programId}/sampling`);
}

export async function requestSample(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("CREATOR");
  const parsed = sampleRequestSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", message: getSamplingErrorMessage({ code: "22023", message: "sample_variant_not_available" }) };
  const supabase = await createClient();
  const { error } = await supabase.rpc("request_sample", {
    p_product_id: parsed.data.productId,
    p_variant_id: parsed.data.variantId ?? undefined,
    p_creator_note: parsed.data.creatorNote ?? undefined,
  });
  if (error) return { status: "error", message: getSamplingErrorMessage(error) };
  redirect(`/creator/programas/${parsed.data.programId}/sampling`);
}

export async function transitionSampleRequest(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("BRAND");
  const parsed = transitionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", message: getSamplingErrorMessage({ code: "22023", message: "invalid_sample_status_transition" }) };
  const supabase = await createClient();
  const { error } = await supabase.rpc("transition_sample_request", {
    p_request_id: parsed.data.requestId,
    p_target_status: parsed.data.targetStatus,
    p_brand_note: parsed.data.brandNote ?? undefined,
    p_carrier_name: parsed.data.carrierName ?? undefined,
    p_tracking_number: parsed.data.trackingNumber ?? undefined,
    p_tracking_url: parsed.data.trackingUrl ?? undefined,
  });
  if (error) return { status: "error", message: getSamplingErrorMessage(error) };
  revalidatePath(`/marca/programas/${parsed.data.programId}/sampling`);
  return { status: "idle" };
}

export async function confirmSampleReceived(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("CREATOR");
  const parsed = receiptSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", message: getSamplingErrorMessage({ code: "22023", message: "invalid_sample_status_transition" }) };
  const supabase = await createClient();
  const { error } = await supabase.rpc("confirm_sample_received", { p_request_id: parsed.data.requestId });
  if (error) return { status: "error", message: getSamplingErrorMessage(error) };
  revalidatePath(`/creator/programas/${parsed.data.programId}/sampling`);
  return { status: "idle" };
}

export async function reportSampleIssue(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("CREATOR");
  const parsed = issueSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", message: getSamplingErrorMessage({ code: "22023", message: "invalid_issue_description" }) };
  const supabase = await createClient();
  const { error } = await supabase.rpc("report_sample_issue", {
    p_request_id: parsed.data.requestId,
    p_issue_type: parsed.data.issueType,
    p_description: parsed.data.description,
  });
  if (error) return { status: "error", message: getSamplingErrorMessage(error) };
  redirect(`/creator/programas/${parsed.data.programId}/sampling`);
}

export async function resolveSampleIssue(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("BRAND");
  const parsed = resolveIssueSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", message: getSamplingErrorMessage({ code: "22023", message: "sample_issue_not_resolvable" }) };
  const supabase = await createClient();
  const { error } = await supabase.rpc("resolve_sample_issue", {
    p_issue_id: parsed.data.issueId,
    p_resolution_status: parsed.data.resolutionStatus,
    p_brand_note: parsed.data.brandNote ?? undefined,
    p_carrier_name: parsed.data.carrierName ?? undefined,
    p_tracking_number: parsed.data.trackingNumber ?? undefined,
    p_tracking_url: parsed.data.trackingUrl ?? undefined,
  });
  if (error) return { status: "error", message: getSamplingErrorMessage(error) };
  revalidatePath(`/marca/programas/${parsed.data.programId}/sampling`);
  return { status: "idle" };
}
