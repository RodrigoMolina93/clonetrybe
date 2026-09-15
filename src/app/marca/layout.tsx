import type { ReactNode } from "react";
import { ApplicationShell } from "@/components/application-shell";

export default function BrandLayout({ children }: { children: ReactNode }) {
  return <ApplicationShell role="BRAND">{children}</ApplicationShell>;
}
