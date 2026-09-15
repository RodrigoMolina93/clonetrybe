import type { SampleRequest } from "@/features/sampling/types";
import type { Dictionary } from "@/lib/i18n";

export function SampleStatusBadge({ status, dictionary }: { status: SampleRequest["status"]; dictionary: Dictionary }) {
  const tone = status === "RECEIVED" ? "bg-emerald-100 text-emerald-800" : status === "ISSUE" ? "bg-destructive/10 text-destructive" : status === "REJECTED" || status === "CANCELLED" ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary";
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}>{dictionary.sampling.status[status]}</span>;
}
