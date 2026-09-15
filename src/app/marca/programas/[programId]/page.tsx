import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { BrandProgramHeader } from "@/features/programs/brand-program-header";
import { ActionButtonForm } from "@/features/programs/action-button-form";
import { updateProgramStatus } from "@/features/programs/actions";
import { formatDate, formatProgramCompensation } from "@/features/programs/presentation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { defaultLocale, getDictionary } from "@/lib/i18n";
import { getBrandProgram } from "@/repositories/program-repository";
import type { Program } from "@/features/programs/types";

function nextStatuses(status: Program["status"]) {
  if (status === "DRAFT") return ["ACTIVE", "ARCHIVED"] as const;
  if (status === "ACTIVE") return ["PAUSED", "ENDED", "ARCHIVED"] as const;
  if (status === "PAUSED") return ["ACTIVE", "ENDED", "ARCHIVED"] as const;
  if (status === "ENDED") return ["ARCHIVED"] as const;
  return [] as const;
}

export default async function BrandProgramDetailPage({ params }: { params: Promise<{ programId: string }> }) {
  const { programId } = await params;
  const program = await getBrandProgram(programId);
  if (!program) notFound();
  const dictionary = getDictionary();
  const actionLabel = (status: Program["status"]) => status === "ACTIVE" ? (program.status === "PAUSED" ? dictionary.programs.actions.resume : dictionary.programs.actions.activate) : status === "PAUSED" ? dictionary.programs.actions.pause : status === "ENDED" ? dictionary.programs.actions.end : dictionary.programs.actions.archive;
  return <><BrandProgramHeader program={program} active="summary" dictionary={dictionary} /><div className="grid gap-6 lg:grid-cols-[1fr_20rem]"><Card><CardHeader><CardTitle>{dictionary.programs.tabs.summary}</CardTitle></CardHeader><CardContent className="grid gap-5 sm:grid-cols-2"><div><p className="text-sm text-muted-foreground">{dictionary.programs.fields.visibility}</p><p className="mt-1 font-medium">{dictionary.programs.visibility[program.visibility]}</p></div><div><p className="text-sm text-muted-foreground">{dictionary.programs.fields.compensationType}</p><p className="mt-1 font-medium">{formatProgramCompensation(program, defaultLocale, dictionary.programs.compensation.FIXED, dictionary.programs.compensation.REVENUE_SHARE)}</p></div><div><p className="text-sm text-muted-foreground">{dictionary.programs.fields.startDate}</p><p className="mt-1 font-medium">{formatDate(program.start_date, defaultLocale, dictionary.common.notAvailable)}</p></div><div><p className="text-sm text-muted-foreground">{dictionary.programs.fields.endDate}</p><p className="mt-1 font-medium">{formatDate(program.end_date, defaultLocale, dictionary.common.notAvailable)}</p></div><div><p className="text-sm text-muted-foreground">{dictionary.programs.fields.applicationsEnabled}</p><p className="mt-1 font-medium">{program.applications_enabled ? dictionary.programs.values.enabled : dictionary.programs.values.disabled}</p></div><div><p className="text-sm text-muted-foreground">{dictionary.programs.fields.platformFee}</p><p className="mt-1 font-medium">{dictionary.programs.values.platformFee}</p></div></CardContent></Card><aside className="space-y-3"><Button asChild variant="outline" className="w-full"><Link href={`/marca/programas/${program.id}/editar`}><Pencil aria-hidden="true" />{dictionary.programs.brand.edit}</Link></Button>{nextStatuses(program.status).map((status) => <ActionButtonForm key={status} action={updateProgramStatus} fields={{ programId: program.id, status }} label={actionLabel(status)} variant={status === "ARCHIVED" ? "destructive" : "secondary"} />)}</aside></div></>;
}
