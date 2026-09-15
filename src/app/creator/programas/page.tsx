import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { ProgramCard } from "@/features/programs/program-card";
import { getDictionary } from "@/lib/i18n";
import { getDiscoverablePrograms } from "@/repositories/program-repository";
import { requireRole } from "@/services/auth-service";

export default async function DiscoverProgramsPage() {
  const viewer = await requireRole("CREATOR");
  const dictionary = getDictionary();
  const programs = await getDiscoverablePrograms(viewer.user.id);
  const copy = dictionary.programs.creator;
  return <><PageHeader eyebrow={copy.eyebrow} title={copy.discoverTitle} description={copy.discoverDescription} />{programs.length === 0 ? <EmptyState title={copy.discoverEmptyTitle} description={copy.discoverEmptyDescription} /> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{programs.map((program) => <ProgramCard key={program.id} program={program} href={`/creator/programas/${program.id}`} dictionary={dictionary} showOrganization />)}</div>}</>;
}

