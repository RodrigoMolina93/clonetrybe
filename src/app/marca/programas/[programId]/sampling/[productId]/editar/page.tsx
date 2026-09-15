import { notFound } from "next/navigation";
import { updateSampleProduct } from "@/features/sampling/actions";
import { SampleProductForm } from "@/features/sampling/product-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDictionary } from "@/lib/i18n";
import { getBrandProgram } from "@/repositories/program-repository";
import { getSampleProduct } from "@/repositories/sampling-repository";

export default async function EditSampleProductPage({ params }: { params: Promise<{ programId: string; productId: string }> }) {
  const { programId, productId } = await params;
  const [program, product] = await Promise.all([getBrandProgram(programId), getSampleProduct(productId)]);
  if (!program || !product || product.program_id !== programId) notFound();
  const dictionary = getDictionary();
  return <Card className="mx-auto max-w-2xl"><CardHeader><CardTitle>{dictionary.sampling.brand.editProduct}</CardTitle></CardHeader><CardContent><SampleProductForm action={updateSampleProduct} dictionary={dictionary} programId={programId} product={product} /></CardContent></Card>;
}
