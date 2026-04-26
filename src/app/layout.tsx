import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { HeaderNav } from "@/components/ui";
import { LocaleProvider } from "@/lib/LocaleProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Unmapped Voices — Making language skills visible and valuable",
  description:
    "Community-verified AI data, proof-of-skill screening, and fair pathways into the AI economy. Turning hidden local knowledge into portable, evidence-backed skill signals.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0d2b27",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <LocaleProvider>
          <HeaderNav />
          <main className="mx-auto min-w-0 max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
          <footer className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 text-[11px] text-[var(--ink-2)] flex flex-wrap gap-x-4 gap-y-1 border-t border-[var(--line)] mt-8">
            <span>
              Labour-market & human-capital figures sourced from ILO ILOSTAT,
              World Bank WDI/HCI, and the Wittgenstein Centre.
            </span>
            <a href="/sources" className="hover:underline">
              Data sources →
            </a>
          </footer>
        </LocaleProvider>
      </body>
    </html>
  );
}
