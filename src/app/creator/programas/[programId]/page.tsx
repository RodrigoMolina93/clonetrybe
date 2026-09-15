import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { ApplyForm } from "@/features/programs/apply-form";
import { ActionButtonForm } from "@/features/programs/action-button-form";
import { respondToInvitation, withdrawApplication } from "@/features/programs/actions";
import { formatDate, formatProgramCompensation } from "@/features/programs/presentation";
import { StatusBadge } from "@/features/programs/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { defaultLocale, getDictionary } from "@/lib/i18n";
import { getCreatorProgram } from "@/repositories/program-repository";
import { requireRole } from "@/services/auth-service";

export default async function CreatorProgramDetailPage({ params }: { params: Promise<{ programId: string }> }) {
  const [{ programId }, viewer] = await Promise.all([params, requireRole("CREATOR")]);
  const detail = await getCreatorProgram(programId, viewer.user.id);
  if (!detail) notFound();
  const dictionary = getDictionary();
  const { program, application, invitation, membership, brief } = detail;
  const copy = dictionary.programs.creator;
  const canApply = program.status === "ACTIVE" && program.visibility === "PUBLIC" && program.applications_enabled && !application && !invitation && !membership;
  return <div className="space-y-7"><Link href="/creator/programas" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft aria-hidden="true" className="size-4" />{dictionary.navigation.discover}</Link><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><p className="mb-2 font-medium text-primary">{program.organization?.name}</p><h1 className="text-3xl font-semibold tracking-tight">{program.name}</h1><p className="mt-3 max-w-3xl text-muted-foreground">{program.description}</p></div><StatusBadge status={program.status} dictionary={dictionary} /></div><div className="grid gap-6 lg:grid-cols-[1fr_22rem]"><div className="space-y-6"><Card><CardHeader><CardTitle>{dictionary.programs.tabs.summary}</CardTitle></CardHeader><CardContent className="space-y-4"><p className="font-medium">{formatProgramCompensation(program, defaultLocale, dictionary.programs.compensation.FIXED, dictionary.programs.compensation.REVENUE_SHARE)}</p><p className="flex items-center gap-2 text-sm text-muted-foreground"><CalendarDays aria-hidden="true" className="size-4" />{formatDate(program.start_date, defaultLocale, dictionary.common.notAvailable)} — {formatDate(program.end_date, defaultLocale, dictionary.common.notAvailable)}</p></CardContent></Card>{membership?.status === "ACTIVE" ? <Card><CardHeader><CardTitle>{dictionary.programs.tabs.brief}</CardTitle></CardHeader><CardContent>{brief ? <div className="space-y-5"><div><h3 className="font-semibold">{brief.title}</h3><p className="mt-2 whitespace-pre-wrap text-muted-foreground">{brief.description}</p></div><div><h3 className="font-semibold">{dictionary.programs.brief.requirements}</h3><p className="mt-2 whitespace-pre-wrap text-muted-foreground">{brief.requirements}</p></div>{brief.dos ? <div><h3 className="font-semibold">{dictionary.programs.brief.dos}</h3><p className="mt-2 whitespace-pre-wrap text-muted-foreground">{brief.dos}</p></div> : null}{brief.donts ? <div><h3 className="font-semibold">{dictionary.programs.brief.donts}</h3><p className="mt-2 whitespace-pre-wrap text-muted-foreground">{brief.donts}</p></div> : null}</div> : <p className="text-muted-foreground">{dictionary.programs.brief.emptyDescription}</p>}</CardContent></Card> : null}</div><aside className="space-y-4">{membership?.status === "ACTIVE" ? <Alert><AlertTitle>{copy.memberNotice}</AlertTitle></Alert> : invitation?.status === "PENDING" ? <Alert><AlertTitle>{copy.invitationNotice}</AlertTitle><AlertDescription className="mt-3 flex flex-col gap-2"><ActionButtonForm action={respondToInvitation} fields={{ relationshipId: invitation.id, programId: program.id, response: "ACCEPTED" }} label={copy.acceptInvitation} /><ActionButtonForm action={respondToInvitation} fields={{ relationshipId: invitation.id, programId: program.id, response: "DECLINED" }} label={copy.declineInvitation} variant="outline" /></AlertDescription></Alert> : application?.status === "PENDING" ? <Alert><AlertTitle>{copy.applicationNotice}</AlertTitle><AlertDescription className="mt-3"><ActionButtonForm action={withdrawApplication} fields={{ relationshipId: application.id, programId: program.id }} label={copy.withdraw} variant="outline" /></AlertDescription></Alert> : canApply ? <Card><CardContent><ApplyForm programId={program.id} dictionary={dictionary} /></CardContent></Card> : <Alert><AlertTitle>{copy.closedNotice}</AlertTitle></Alert>}</aside></div></div>;
}

