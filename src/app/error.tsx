"use client";

import { Button } from "@/components/ui/button";
import { getDictionary } from "@/lib/i18n";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { errors } = getDictionary();
  return <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center"><h1 className="text-2xl font-semibold">{errors.title}</h1><p className="mt-2 text-muted-foreground">{errors.description}</p><Button className="mt-6" onClick={reset}>{errors.retry}</Button></main>;
}
