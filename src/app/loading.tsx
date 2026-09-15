import { getDictionary } from "@/lib/i18n";

export default function Loading() {
  return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground" role="status">{getDictionary().common.loading}</div>;
}
