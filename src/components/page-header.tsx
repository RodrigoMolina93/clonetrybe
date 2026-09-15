import type { ReactNode } from "react";

export function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div>{eyebrow ? <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">{eyebrow}</p> : null}<h1 className="text-3xl font-semibold tracking-tight">{title}</h1>{description ? <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p> : null}</div>{action}</div>;
}

