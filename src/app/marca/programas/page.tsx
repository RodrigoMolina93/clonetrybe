import Link from "next/link";
import { Plus } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ProgramCard } from "@/features/programs/program-card";
import { getDictionary } from "@/lib/i18n";
import { getBrandPrograms } from "@/repositories/program-repository";

export default async function BrandProgramsPage() {
  const dictionary = getDictionary();
  const programs = await getBrandPrograms();
  const copy = dictionary.programs.brand;
  const createButton = <Button asChild size="lg"><Link href="/marca/programas/nuevo"><Plus aria-hidden="true" />{copy.create}</Link></Button>;
  return <><PageHeader eyebrow={copy.eyebrow} title={copy.title} description={copy.description} action={createButton} />{programs.length === 0 ? <EmptyState title={copy.emptyTitle} description={copy.emptyDescription} action={createButton} /> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{programs.map((program) => <ProgramCard key={program.id} program={program} href={`/marca/programas/${program.id}`} dictionary={dictionary} />)}</div>}</>;
}

