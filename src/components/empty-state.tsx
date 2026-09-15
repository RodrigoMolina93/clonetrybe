import { Inbox } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="rounded-xl border border-dashed bg-card px-6 py-14 text-center"><Inbox aria-hidden="true" className="mx-auto mb-4 size-9 text-muted-foreground" /><h2 className="text-lg font-semibold">{title}</h2><p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">{description}</p>{action ? <div className="mt-6 flex justify-center">{action}</div> : null}</div>;
}

