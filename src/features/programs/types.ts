import type { Tables } from "@/types/database";

export type Program = Tables<"programs">;
export type ProgramBrief = Tables<"program_briefs">;
export type ProgramApplication = Tables<"program_applications">;
export type ProgramInvitation = Tables<"program_invitations">;
export type ProgramMembership = Tables<"program_memberships">;

export type CreatorSummary = {
  creator_id: string;
  public_name: string;
  first_name: string | null;
  last_name: string | null;
};

export type ProgramWithOrganization = Program & {
  organization: { name: string; slug: string } | null;
};

export type ProgramWithMemberCount = Program & {
  program_memberships: { count: number }[];
};
