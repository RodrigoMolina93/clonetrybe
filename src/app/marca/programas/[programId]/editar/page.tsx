import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { updateProgram } from "@/features/programs/actions";
import { BrandProgramHeader } from "@/features/programs/brand-program-header";
import { ProgramForm } from "@/features/programs/program-form";
import { getDictionary } from "@/lib/i18n";
import { getBrandProgram } from "@/repositories/program-repository";

export default async function EditProgramPage({ params }: { params: Promise<{ programId: string }> }) {
  const { programId } = await params;
  const program = await getBrandProgram(programId);
  if (!program) notFound();
  const dictionary = getDictionary();
  return <><BrandProgramHeader program={program} active="summary" dictionary={dictionary} /><div className="mx-auto max-w-3xl"><div className="mb-5"><h2 className="text-2xl font-semibold">{dictionary.programs.form.editTitle}</h2><p className="mt-1 text-muted-foreground">{dictionary.programs.form.editDescription}</p></div><Card><CardContent><ProgramForm action={updateProgram} dictionary={dictionary} program={program} /></CardContent></Card></div></>;
}

