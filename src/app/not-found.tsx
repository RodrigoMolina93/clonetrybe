import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getDictionary } from "@/lib/i18n";

export default function NotFound() {
  const { errors } = getDictionary();
  return <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center"><h1 className="text-2xl font-semibold">{errors.notFoundTitle}</h1><p className="mt-2 text-muted-foreground">{errors.notFoundDescription}</p><Button asChild className="mt-6"><Link href="/">{errors.goHome}</Link></Button></main>;
}
