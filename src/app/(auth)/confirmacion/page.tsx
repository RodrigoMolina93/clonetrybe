import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { Button } from "@/components/ui/button";
import { getDictionary } from "@/lib/i18n";

export default async function ConfirmationPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const { auth, common } = getDictionary();
  return (
    <AuthCard title={error ? auth.confirmationError : auth.confirmationTitle} description={error ? auth.errors.generic : auth.confirmationDescription}>
      <Button asChild variant="outline" className="w-full"><Link href="/ingresar">{common.backToLogin}</Link></Button>
    </AuthCard>
  );
}
