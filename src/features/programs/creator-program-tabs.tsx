import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";

export function CreatorProgramTabs({ programId, active, dictionary }: { programId: string; active: "summary" | "brief" | "sampling"; dictionary: Dictionary }) {
  const tabs = [
    { id: "summary" as const, href: `/creator/programas/${programId}`, label: dictionary.programs.tabs.summary },
    { id: "brief" as const, href: `/creator/programas/${programId}#brief`, label: dictionary.programs.tabs.brief },
    { id: "sampling" as const, href: `/creator/programas/${programId}/sampling`, label: dictionary.programs.tabs.sampling },
  ];
  return <nav aria-label={dictionary.navigation.programs} className="flex gap-1 overflow-x-auto border-b">{tabs.map((tab) => <Link key={tab.id} href={tab.href} className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium ${active === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{tab.label}</Link>)}</nav>;
}
