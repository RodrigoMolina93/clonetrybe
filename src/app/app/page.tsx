import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDictionary } from "@/lib/i18n";
import { requireViewer } from "@/services/auth-service";

export default async function DashboardPage() {
  const viewer = await requireViewer();
  const { dashboard } = getDictionary();
  return (
    <div className="space-y-8">
      <div className="max-w-2xl"><p className="mb-2 text-sm font-semibold text-primary">{dashboard.eyebrow}</p><h1 className="text-3xl font-semibold tracking-tight">{dashboard.title}</h1><p className="mt-3 text-muted-foreground">{dashboard.description}</p></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">{dashboard.organization}</CardTitle></CardHeader><CardContent className="text-lg font-semibold">{viewer.organization.name}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">{dashboard.role}</CardTitle></CardHeader><CardContent className="text-lg font-semibold">{dashboard.roles[viewer.organization.role]}</CardContent></Card>
      </div>
      <Card className="border-dashed"><CardContent className="flex min-h-56 flex-col items-center justify-center text-center"><h2 className="font-semibold">{dashboard.emptyTitle}</h2><p className="mt-2 max-w-md text-sm text-muted-foreground">{dashboard.emptyDescription}</p></CardContent></Card>
    </div>
  );
}
