import { notFound } from "next/navigation";
import { createSampleProduct } from "@/features/sampling/actions";
import { SampleProductForm } from "@/features/sampling/product-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDictionary } from "@/lib/i18n";
import { getBrandProgram } from "@/repositories/program-repository";

export default async function NewSampleProductPage({ params }: { params: Promise<{ programId: string }> }) {
  const { programId } = await params;
  const program = await getBrandProgram(programId);
  if (!program) notFound();
  const dictionary = getDictionary();
  return <Card className="mx-auto max-w-2xl"><CardHeader><CardTitle>{dictionary.sampling.brand.newProduct}</CardTitle></CardHeader><CardContent><SampleProductForm action={createSampleProduct} dictionary={dictionary} programId={programId} /></CardContent></Card>;
}
