import type { Dictionary } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Status = keyof Dictionary["programs"]["status"];

export function StatusBadge({ status, dictionary }: { status: Status; dictionary: Dictionary }) {
  const positive = status === "ACTIVE" || status === "ACCEPTED";
  const pending = status === "DRAFT" || status === "PENDING" || status === "PAUSED";
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", positive ? "bg-emerald-100 text-emerald-800" : pending ? "bg-amber-100 text-amber-800" : "bg-muted text-muted-foreground")}>{dictionary.programs.status[status]}</span>;
}

