import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Nexus | Academia–Industry Collaboration", description: "Skill mapping, opportunities and verified portfolios for academic communities." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
