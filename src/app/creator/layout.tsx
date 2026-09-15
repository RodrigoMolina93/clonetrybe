import type { ReactNode } from "react";
import { ApplicationShell } from "@/components/application-shell";

export default function CreatorLayout({ children }: { children: ReactNode }) {
  return <ApplicationShell role="CREATOR">{children}</ApplicationShell>;
}
