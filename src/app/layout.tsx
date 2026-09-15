import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  title: getDictionary().metadata.title,
  description: getDictionary().metadata.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-AR"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
