import { Card, CardContent } from "@/components/ui/card";
import { getDictionary } from "@/lib/i18n";

export function DashboardPlaceholder({ kind }: { kind: "brand" | "creator" | "admin" }) {
  const { dashboard } = getDictionary();
  const content = kind === "brand"
    ? [dashboard.brandEyebrow, dashboard.brandTitle, dashboard.brandDescription]
    : kind === "creator"
      ? [dashboard.creatorEyebrow, dashboard.creatorTitle, dashboard.creatorDescription]
      : [dashboard.adminEyebrow, dashboard.adminTitle, dashboard.adminDescription];
  return (
    <div className="space-y-8">
      <div className="max-w-2xl"><p className="mb-2 text-sm font-semibold text-primary">{content[0]}</p><h1 className="text-3xl font-semibold tracking-tight">{content[1]}</h1><p className="mt-3 text-muted-foreground">{content[2]}</p></div>
      <Card className="border-dashed"><CardContent className="flex min-h-56 flex-col items-center justify-center text-center"><h2 className="font-semibold">{dashboard.emptyTitle}</h2><p className="mt-2 max-w-md text-sm text-muted-foreground">{dashboard.emptyDescription}</p></CardContent></Card>
    </div>
  );
}
