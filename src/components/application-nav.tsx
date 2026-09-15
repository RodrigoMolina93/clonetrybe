"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function ApplicationNav({ label, items }: { label: string; items: { href: string; label: string; exact?: boolean }[] }) {
  const pathname = usePathname();
  return <nav aria-label={label} className="border-b bg-background"><div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 sm:px-6">{items.map((item) => {
    const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
    return <Link key={item.href} href={item.href} className={cn("whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium", active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>{item.label}</Link>;
  })}</div></nav>;
}

