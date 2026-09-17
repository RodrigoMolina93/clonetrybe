import type { ReactNode } from "react";
import { LogOut } from "lucide-react";
import { logout } from "@/features/auth/actions";
import { getDictionary } from "@/lib/i18n";
import { requireViewer } from "@/services/auth-service";
import { Button } from "@/components/ui/button";
import { ApplicationNav } from "@/components/application-nav";

export async function ApplicationShell({ children }: { children: ReactNode }) {
  const viewer = await requireViewer();
  const dictionary = getDictionary();
  const { common, dashboard } = dictionary;
  const displayName = [viewer.firstName, viewer.lastName].filter(Boolean).join(" ") || viewer.user.email;
  const navigation = [
    { href: "/app", label: dictionary.navigation.dashboard, exact: true },
    { href: "/app/configuracion", label: dictionary.navigation.settings },
  ];
  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div><p className="font-semibold">{common.productName}</p><p className="text-xs text-muted-foreground">{viewer.organization.name}</p></div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block"><p className="text-xs text-muted-foreground">{dashboard.account}</p><p className="text-sm font-medium">{displayName}</p></div>
            <form action={logout}><Button variant="outline" size="sm" type="submit"><LogOut aria-hidden="true" />{common.logout}</Button></form>
          </div>
        </div>
      </header>
      <ApplicationNav label={dictionary.navigation.dashboard} items={navigation} />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">{children}</main>
    </div>
  );
}
