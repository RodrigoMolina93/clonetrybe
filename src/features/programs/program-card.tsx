import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import type { Program, ProgramWithMemberCount, ProgramWithOrganization } from "@/features/programs/types";
import { formatDate, formatProgramCompensation } from "@/features/programs/presentation";
import { StatusBadge } from "@/features/programs/status-badge";
import type { Dictionary } from "@/lib/i18n";
import { defaultLocale } from "@/lib/i18n";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function ProgramCard({ program, href, dictionary, showOrganization = false }: { program: Program | ProgramWithOrganization | ProgramWithMemberCount; href: string; dictionary: Dictionary; showOrganization?: boolean }) {
  const organization = "organization" in program ? program.organization : null;
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="mb-2 flex items-center justify-between gap-3"><StatusBadge status={program.status} dictionary={dictionary} /><span className="text-xs text-muted-foreground">{dictionary.programs.visibility[program.visibility]}</span></div>
        <CardTitle className="text-lg">{program.name}</CardTitle>
        {showOrganization && organization ? <p className="text-sm font-medium text-primary">{organization.name}</p> : null}
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <p className="line-clamp-3 text-muted-foreground">{program.description}</p>
        <p className="font-medium">{formatProgramCompensation(program, defaultLocale, dictionary.programs.compensation.FIXED, dictionary.programs.compensation.REVENUE_SHARE)}</p>
        {"program_memberships" in program ? <p className="text-sm text-muted-foreground">{dictionary.programs.brand.creatorCount.replace("{count}", String(program.program_memberships[0]?.count ?? 0))}</p> : null}
        <p className="flex items-center gap-2 text-sm text-muted-foreground"><CalendarDays aria-hidden="true" className="size-4" />{formatDate(program.start_date, defaultLocale, dictionary.common.notAvailable)} — {formatDate(program.end_date, defaultLocale, dictionary.common.notAvailable)}</p>
      </CardContent>
      <CardFooter><Link className="inline-flex items-center gap-2 font-medium text-primary hover:underline" href={href}>{dictionary.common.view}<ArrowRight aria-hidden="true" className="size-4" /></Link></CardFooter>
    </Card>
  );
}
