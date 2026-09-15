import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDictionary } from "@/lib/i18n";

export function AuthCard({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  const { common } = getDictionary();
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-7 text-center">
          <p className="text-xl font-semibold tracking-tight">{common.productName}</p>
          <p className="text-sm text-muted-foreground">{common.tagline}</p>
        </div>
        <Card className="shadow-xl shadow-primary/5">
          <CardHeader><CardTitle className="text-2xl">{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </div>
    </main>
  );
}
