import type { PostgrestError } from "@supabase/supabase-js";
import { getDictionary } from "@/lib/i18n";

export function getProgramErrorMessage(error: Pick<PostgrestError, "code" | "message">): string {
  const messages = getDictionary().programs.errors;
  if (error.message.includes("pending_application_exists")) return messages.duplicateApplication;
  if (error.message.includes("pending_invitation_exists")) return messages.duplicateInvitation;
  if (error.message.includes("already_program_member")) return messages.alreadyMember;
  if (error.message.includes("invalid_program_status_transition")) return messages.invalidStatus;
  if (error.message.includes("program_not_") || error.message.includes("application_not_") || error.message.includes("invitation_not_")) return messages.programClosed;
  if (error.code === "42501") return messages.forbidden;
  return messages.generic;
}

