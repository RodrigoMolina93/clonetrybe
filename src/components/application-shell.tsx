import type { ReactNode } from "react";
import { LogOut } from "lucide-react";
import { logout } from "@/features/auth/actions";
import { getDictionary } from "@/lib/i18n";
import { requireRole } from "@/services/auth-service";
import type { UserType } from "@/types/database";
import { Button } from "@/components/ui/button";

export async function ApplicationShell({ role, children }: { role: UserType; children: ReactNode }) {
  const viewer = await requireRole(role);
  const { common, dashboard } = getDictionary();
  const displayName = [viewer.firstName, viewer.lastName].filter(Boolean).join(" ") || viewer.user.email;
  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div><p className="font-semibold">{common.productName}</p><p className="text-xs text-muted-foreground">{common.tagline}</p></div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block"><p className="text-xs text-muted-foreground">{dashboard.account}</p><p className="text-sm font-medium">{displayName}</p></div>
            <form action={logout}><Button variant="outline" size="sm" type="submit"><LogOut aria-hidden="true" />{common.logout}</Button></form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">{children}</main>
    </div>
  );
}
