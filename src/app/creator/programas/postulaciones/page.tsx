import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { ActionButtonForm } from "@/features/programs/action-button-form";
import { withdrawApplication } from "@/features/programs/actions";
import { StatusBadge } from "@/features/programs/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { getDictionary } from "@/lib/i18n";
import { getCreatorApplications } from "@/repositories/program-repository";
import { requireRole } from "@/services/auth-service";

export default async function CreatorApplicationsPage() {
  const viewer = await requireRole("CREATOR");
  const dictionary = getDictionary();
  const applications = await getCreatorApplications(viewer.user.id);
  const copy = dictionary.programs.creator;
  return <><PageHeader eyebrow={copy.eyebrow} title={copy.applicationsTitle} description={copy.applicationsDescription} />{applications.length === 0 ? <EmptyState title={copy.applicationsEmptyTitle} description={copy.applicationsEmptyDescription} /> : <div className="space-y-4">{applications.map((application) => application.program ? <Card key={application.id}><CardContent className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center"><div><Link href={`/creator/programas/${application.program.id}`} className="text-lg font-semibold hover:underline">{application.program.name}</Link><p className="mt-1 text-sm text-muted-foreground">{application.program.organization?.name}</p></div><div className="flex flex-wrap items-center gap-2"><StatusBadge status={application.status} dictionary={dictionary} />{application.status === "PENDING" ? <ActionButtonForm action={withdrawApplication} fields={{ relationshipId: application.id, programId: application.program.id }} label={copy.withdraw} variant="outline" /> : null}</div></CardContent></Card> : null)}</div>}</>;
}

