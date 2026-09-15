import type { ReactNode } from "react";
import { ApplicationShell } from "@/components/application-shell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <ApplicationShell role="ADMIN">{children}</ApplicationShell>;
}
