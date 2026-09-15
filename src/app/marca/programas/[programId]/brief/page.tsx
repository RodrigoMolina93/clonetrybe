import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { BrandProgramHeader } from "@/features/programs/brand-program-header";
import { BriefForm } from "@/features/programs/brief-form";
import { getDictionary } from "@/lib/i18n";
import { getBrandProgram, getProgramBrief } from "@/repositories/program-repository";

export default async function BrandProgramBriefPage({ params }: { params: Promise<{ programId: string }> }) {
  const { programId } = await params;
  const [program, brief] = await Promise.all([getBrandProgram(programId), getProgramBrief(programId)]);
  if (!program) notFound();
  const dictionary = getDictionary();
  return <><BrandProgramHeader program={program} active="brief" dictionary={dictionary} /><Card className="mx-auto max-w-3xl"><CardContent><BriefForm programId={program.id} brief={brief} dictionary={dictionary} /></CardContent></Card></>;
}

