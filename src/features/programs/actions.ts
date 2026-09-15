"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/features/auth/types";
import { getProgramErrorMessage } from "@/features/programs/errors";
import {
  applicationSchema,
  briefSchema,
  invitationSchema,
  programIdSchema,
  programSchema,
  relationshipIdSchema,
  statusSchema,
} from "@/features/programs/schemas";
import { createClient } from "@/lib/supabase/server";
import { getBrandOrganization, getProgramBrief } from "@/repositories/program-repository";
import { requireRole } from "@/services/auth-service";

function validationError(fieldErrors: Record<string, string[] | undefined>): ActionState {
  return { status: "error", fieldErrors: Object.fromEntries(Object.entries(fieldErrors).filter((entry): entry is [string, string[]] => Boolean(entry[1]))) };
}

export async function createProgram(_state: ActionState, formData: FormData): Promise<ActionState> {
  const viewer = await requireRole("BRAND");
  const parsed = programSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);
  const membership = await getBrandOrganization();
  if (!membership) return { status: "error", message: getProgramErrorMessage({ code: "42501", message: "not_authorized" }) };
  const supabase = await createClient();
  const programId = crypto.randomUUID();
  const { error } = await supabase.from("programs").insert({
    id: programId,
    organization_id: membership.organization_id,
    created_by: viewer.user.id,
    name: parsed.data.name,
    description: parsed.data.description,
    visibility: parsed.data.visibility,
    applications_enabled: parsed.data.applicationsEnabled,
    start_date: parsed.data.startDate,
    end_date: parsed.data.endDate,
    compensation_type: parsed.data.compensationType,
    fixed_amount: parsed.data.fixedAmount,
    revenue_share_percentage: parsed.data.revenueSharePercentage,
  });
  if (error) return { status: "error", message: getProgramErrorMessage(error) };
  redirect(`/marca/programas/${programId}`);
}

export async function updateProgram(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("BRAND");
  const programId = programIdSchema.safeParse(Object.fromEntries(formData));
  const parsed = programSchema.safeParse(Object.fromEntries(formData));
  if (!programId.success) return { status: "error", message: getProgramErrorMessage({ code: "22023", message: "invalid_program" }) };
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);
  const supabase = await createClient();
  const { error } = await supabase.from("programs").update({
    name: parsed.data.name,
    description: parsed.data.description,
    visibility: parsed.data.visibility,
    applications_enabled: parsed.data.applicationsEnabled,
    start_date: parsed.data.startDate,
    end_date: parsed.data.endDate,
    compensation_type: parsed.data.compensationType,
    fixed_amount: parsed.data.fixedAmount,
    revenue_share_percentage: parsed.data.revenueSharePercentage,
  }).eq("id", programId.data.programId);
  if (error) return { status: "error", message: getProgramErrorMessage(error) };
  redirect(`/marca/programas/${programId.data.programId}`);
}

export async function saveBrief(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("BRAND");
  const parsed = briefSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);
  const supabase = await createClient();
  const existing = await getProgramBrief(parsed.data.programId);
  const values = {
    title: parsed.data.title,
    description: parsed.data.description,
    requirements: parsed.data.requirements,
    dos: parsed.data.dos,
    donts: parsed.data.donts,
  };
  const result = existing
    ? await supabase.from("program_briefs").update(values).eq("id", existing.id)
    : await supabase.from("program_briefs").insert({ program_id: parsed.data.programId, ...values });
  if (result.error) return { status: "error", message: getProgramErrorMessage(result.error) };
  redirect(`/marca/programas/${parsed.data.programId}/brief`);
}

export async function updateProgramStatus(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("BRAND");
  const parsed = statusSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", message: getProgramErrorMessage({ code: "22023", message: "invalid_program_status_transition" }) };
  const supabase = await createClient();
  const { error } = await supabase.from("programs").update({ status: parsed.data.status }).eq("id", parsed.data.programId);
  if (error) return { status: "error", message: getProgramErrorMessage(error) };
  revalidatePath(`/marca/programas/${parsed.data.programId}`);
  redirect(`/marca/programas/${parsed.data.programId}`);
}

export async function applyToProgram(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("CREATOR");
  const parsed = applicationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);
  const supabase = await createClient();
  const { error } = await supabase.rpc("apply_to_program", { p_program_id: parsed.data.programId, p_message: parsed.data.message ?? undefined });
  if (error) return { status: "error", message: getProgramErrorMessage(error) };
  redirect(`/creator/programas/${parsed.data.programId}`);
}

export async function withdrawApplication(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("CREATOR");
  const parsed = relationshipIdSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", message: getProgramErrorMessage({ code: "22023", message: "application_not_withdrawable" }) };
  const supabase = await createClient();
  const { error } = await supabase.rpc("withdraw_program_application", { p_application_id: parsed.data.relationshipId });
  if (error) return { status: "error", message: getProgramErrorMessage(error) };
  redirect(parsed.data.programId ? `/creator/programas/${parsed.data.programId}` : "/creator/programas/postulaciones");
}

export async function inviteCreator(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("BRAND");
  const parsed = invitationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", message: getProgramErrorMessage({ code: "22023", message: "creator_not_found" }) };
  const supabase = await createClient();
  const { error } = await supabase.rpc("invite_creator_to_program", { p_program_id: parsed.data.programId, p_creator_id: parsed.data.creatorId });
  if (error) return { status: "error", message: getProgramErrorMessage(error) };
  redirect(`/marca/programas/${parsed.data.programId}/creadores`);
}

export async function cancelInvitation(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("BRAND");
  const parsed = relationshipIdSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success || !parsed.data.programId) return { status: "error", message: getProgramErrorMessage({ code: "22023", message: "invitation_not_cancellable" }) };
  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_program_invitation", { p_invitation_id: parsed.data.relationshipId });
  if (error) return { status: "error", message: getProgramErrorMessage(error) };
  redirect(`/marca/programas/${parsed.data.programId}/creadores`);
}

export async function reviewApplication(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("BRAND");
  const relationship = relationshipIdSchema.safeParse(Object.fromEntries(formData));
  const decision = formData.get("decision");
  if (!relationship.success || !relationship.data.programId || (decision !== "ACCEPTED" && decision !== "REJECTED")) {
    return { status: "error", message: getProgramErrorMessage({ code: "22023", message: "invalid_application_decision" }) };
  }
  const supabase = await createClient();
  const { error } = await supabase.rpc("review_program_application", { p_application_id: relationship.data.relationshipId, p_decision: decision });
  if (error) return { status: "error", message: getProgramErrorMessage(error) };
  redirect(`/marca/programas/${relationship.data.programId}/creadores`);
}

export async function respondToInvitation(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("CREATOR");
  const relationship = relationshipIdSchema.safeParse(Object.fromEntries(formData));
  const response = formData.get("response");
  if (!relationship.success || (response !== "ACCEPTED" && response !== "DECLINED")) {
    return { status: "error", message: getProgramErrorMessage({ code: "22023", message: "invalid_invitation_response" }) };
  }
  const supabase = await createClient();
  const { error } = await supabase.rpc("respond_to_program_invitation", { p_invitation_id: relationship.data.relationshipId, p_response: response });
  if (error) return { status: "error", message: getProgramErrorMessage(error) };
  redirect(relationship.data.programId ? `/creator/programas/${relationship.data.programId}` : "/creator/programas/invitaciones");
}
