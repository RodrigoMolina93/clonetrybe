import { createClient } from "@/lib/supabase/server";
import type {
  CreatorSummary,
  Program,
  ProgramApplication,
  ProgramBrief,
  ProgramInvitation,
  ProgramMembership,
  ProgramWithMemberCount,
  ProgramWithOrganization,
} from "@/features/programs/types";

class ProgramDataError extends Error {
  constructor() {
    super("Unable to load program data");
  }
}

function assertNoError(error: unknown): asserts error is null {
  if (error) throw new ProgramDataError();
}

export async function getBrandOrganization() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organization_members")
    .select("organization_id, role, organizations(id, name, slug)")
    .limit(1)
    .maybeSingle();
  assertNoError(error);
  return data;
}

export async function getBrandPrograms(): Promise<ProgramWithMemberCount[]> {
  const membership = await getBrandOrganization();
  if (!membership) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("programs")
    .select("*, program_memberships(count)")
    .eq("organization_id", membership.organization_id)
    .order("created_at", { ascending: false });
  assertNoError(error);
  return data;
}

export async function getBrandProgram(programId: string): Promise<Program | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("programs").select("*").eq("id", programId).maybeSingle();
  assertNoError(error);
  return data;
}

export async function getProgramBrief(programId: string): Promise<ProgramBrief | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("program_briefs").select("*").eq("program_id", programId).maybeSingle();
  assertNoError(error);
  return data;
}

export async function getDiscoverablePrograms(userId: string): Promise<ProgramWithOrganization[]> {
  const supabase = await createClient();
  const [programsResult, applicationsResult, invitationsResult, membershipsResult] = await Promise.all([
    supabase.from("programs").select("*, organization:organizations(name, slug)").eq("status", "ACTIVE").eq("visibility", "PUBLIC").eq("applications_enabled", true).order("created_at", { ascending: false }),
    supabase.from("program_applications").select("program_id").eq("creator_id", userId).eq("status", "PENDING"),
    supabase.from("program_invitations").select("program_id").eq("creator_id", userId).eq("status", "PENDING"),
    supabase.from("program_memberships").select("program_id").eq("creator_id", userId).eq("status", "ACTIVE"),
  ]);
  assertNoError(programsResult.error);
  assertNoError(applicationsResult.error);
  assertNoError(invitationsResult.error);
  assertNoError(membershipsResult.error);
  const unavailable = new Set([
    ...applicationsResult.data.map((row) => row.program_id),
    ...invitationsResult.data.map((row) => row.program_id),
    ...membershipsResult.data.map((row) => row.program_id),
  ]);
  return programsResult.data.filter((program) => !unavailable.has(program.id));
}

export async function getCreatorPrograms(userId: string): Promise<ProgramWithOrganization[]> {
  const supabase = await createClient();
  const { data: memberships, error: membershipsError } = await supabase
    .from("program_memberships")
    .select("program_id")
    .eq("creator_id", userId)
    .eq("status", "ACTIVE");
  assertNoError(membershipsError);
  if (memberships.length === 0) return [];
  const { data, error } = await supabase
    .from("programs")
    .select("*, organization:organizations(name, slug)")
    .in("id", memberships.map((membership) => membership.program_id))
    .order("created_at", { ascending: false });
  assertNoError(error);
  return data;
}

export async function getCreatorInvitations(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("program_invitations")
    .select("*, program:programs(*, organization:organizations(name, slug))")
    .eq("creator_id", userId)
    .order("created_at", { ascending: false });
  assertNoError(error);
  return data;
}

export async function getCreatorApplications(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("program_applications")
    .select("*, program:programs(*, organization:organizations(name, slug))")
    .eq("creator_id", userId)
    .order("created_at", { ascending: false });
  assertNoError(error);
  return data;
}

export async function getCreatorProgram(programId: string, userId: string) {
  const supabase = await createClient();
  const [programResult, applicationResult, invitationResult, membershipResult] = await Promise.all([
    supabase.from("programs").select("*, organization:organizations(name, slug)").eq("id", programId).maybeSingle(),
    supabase.from("program_applications").select("*").eq("program_id", programId).eq("creator_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("program_invitations").select("*").eq("program_id", programId).eq("creator_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("program_memberships").select("*").eq("program_id", programId).eq("creator_id", userId).maybeSingle(),
  ]);
  assertNoError(programResult.error);
  assertNoError(applicationResult.error);
  assertNoError(invitationResult.error);
  assertNoError(membershipResult.error);
  if (!programResult.data) return null;
  const brief = membershipResult.data?.status === "ACTIVE" ? await getProgramBrief(programId) : null;
  return {
    program: programResult.data,
    application: applicationResult.data,
    invitation: invitationResult.data,
    membership: membershipResult.data,
    brief,
  };
}

export async function getProgramCreatorManagement(programId: string): Promise<{
  applications: ProgramApplication[];
  invitations: ProgramInvitation[];
  memberships: ProgramMembership[];
  creators: Map<string, CreatorSummary>;
}> {
  const supabase = await createClient();
  const [applicationsResult, invitationsResult, membershipsResult] = await Promise.all([
    supabase.from("program_applications").select("*").eq("program_id", programId).order("created_at", { ascending: false }),
    supabase.from("program_invitations").select("*").eq("program_id", programId).order("created_at", { ascending: false }),
    supabase.from("program_memberships").select("*").eq("program_id", programId).order("joined_at", { ascending: false }),
  ]);
  assertNoError(applicationsResult.error);
  assertNoError(invitationsResult.error);
  assertNoError(membershipsResult.error);
  const creatorIds = [...new Set([
    ...applicationsResult.data.map((row) => row.creator_id),
    ...invitationsResult.data.map((row) => row.creator_id),
    ...membershipsResult.data.map((row) => row.creator_id),
  ])];
  const summariesResult = creatorIds.length > 0
    ? await supabase.rpc("get_creator_summaries", { p_creator_ids: creatorIds })
    : { data: [] as CreatorSummary[], error: null };
  assertNoError(summariesResult.error);
  return {
    applications: applicationsResult.data,
    invitations: invitationsResult.data,
    memberships: membershipsResult.data,
    creators: new Map(summariesResult.data.map((creator) => [creator.creator_id, creator])),
  };
}

export async function searchCreators(query: string): Promise<CreatorSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("search_creators", { p_query: query, p_limit: 20, p_offset: 0 });
  assertNoError(error);
  return data;
}
