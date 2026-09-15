import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { createProgram } from "@/features/programs/actions";
import { ProgramForm } from "@/features/programs/program-form";
import { getDictionary } from "@/lib/i18n";

export default function NewProgramPage() {
  const dictionary = getDictionary();
  const copy = dictionary.programs.form;
  return <div className="mx-auto max-w-3xl space-y-6"><Link href="/marca/programas" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft aria-hidden="true" className="size-4" />{dictionary.programs.brand.detailBack}</Link><div><h1 className="text-3xl font-semibold tracking-tight">{copy.createTitle}</h1><p className="mt-2 text-muted-foreground">{copy.createDescription}</p></div><Card><CardContent><ProgramForm action={createProgram} dictionary={dictionary} /></CardContent></Card></div>;
}

