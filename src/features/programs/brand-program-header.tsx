import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Program } from "@/features/programs/types";
import { ProgramTabs } from "@/features/programs/program-tabs";
import { StatusBadge } from "@/features/programs/status-badge";
import type { Dictionary } from "@/lib/i18n";

export function BrandProgramHeader({ program, active, dictionary }: { program: Program; active: "summary" | "brief" | "creators" | "sampling"; dictionary: Dictionary }) {
  return <div className="mb-8 space-y-5"><Link href="/marca/programas" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft aria-hidden="true" className="size-4" />{dictionary.programs.brand.detailBack}</Link><div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-3xl font-semibold tracking-tight">{program.name}</h1><p className="mt-2 text-muted-foreground">{program.description}</p></div><StatusBadge status={program.status} dictionary={dictionary} /></div><ProgramTabs programId={program.id} active={active} dictionary={dictionary} /></div>;
}
