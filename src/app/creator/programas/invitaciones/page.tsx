import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { ActionButtonForm } from "@/features/programs/action-button-form";
import { respondToInvitation } from "@/features/programs/actions";
import { StatusBadge } from "@/features/programs/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { getDictionary } from "@/lib/i18n";
import { getCreatorInvitations } from "@/repositories/program-repository";
import { requireRole } from "@/services/auth-service";

export default async function CreatorInvitationsPage() {
  const viewer = await requireRole("CREATOR");
  const dictionary = getDictionary();
  const invitations = await getCreatorInvitations(viewer.user.id);
  const copy = dictionary.programs.creator;
  return <><PageHeader eyebrow={copy.eyebrow} title={copy.invitationsTitle} description={copy.invitationsDescription} />{invitations.length === 0 ? <EmptyState title={copy.invitationsEmptyTitle} description={copy.invitationsEmptyDescription} /> : <div className="space-y-4">{invitations.map((invitation) => invitation.program ? <Card key={invitation.id}><CardContent className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center"><div><Link href={`/creator/programas/${invitation.program.id}`} className="text-lg font-semibold hover:underline">{invitation.program.name}</Link><p className="mt-1 text-sm text-muted-foreground">{invitation.program.organization?.name}</p></div><div className="flex flex-wrap items-center gap-2"><StatusBadge status={invitation.status} dictionary={dictionary} />{invitation.status === "PENDING" ? <><ActionButtonForm action={respondToInvitation} fields={{ relationshipId: invitation.id, programId: invitation.program.id, response: "ACCEPTED" }} label={copy.acceptInvitation} /><ActionButtonForm action={respondToInvitation} fields={{ relationshipId: invitation.id, programId: invitation.program.id, response: "DECLINED" }} label={copy.declineInvitation} variant="outline" /></> : null}</div></CardContent></Card> : null)}</div>}</>;
}

