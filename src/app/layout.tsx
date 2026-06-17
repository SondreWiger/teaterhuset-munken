import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Teaterhuset Munken — Barne- og ungdomsteater i Larvik",
  description:
    "Teaterhuset Munken er et barne- og ungdomsteater i Larvik, Norge. Se forestillinger når det passer deg.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="nb"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#d4a843" />
      </head>
      <body className="min-h-full flex flex-col grain">
        <a href="#main-content" className="skip-link">
          Hopp til hovedinnhold
        </a>
        <Navbar />
        <main id="main-content" className="flex-1 pt-20" role="main">{children}</main>
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "rgba(15, 15, 21, 0.9)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              backdropFilter: "blur(12px)",
              color: "#f0ebe3",
            },
          }}
        />
        <footer className="border-t border-border/50 py-8 mt-auto" role="contentinfo">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-gradient-gold">TP</span>
                <span className="text-sm text-muted">
                  &copy; {new Date().getFullYear()} Teaterhuset Munken
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted">
                <Link href="/forestillinger" className="hover:text-foreground transition-colors">
                  Forestillinger
                </Link>
                <Link href="/login" className="hover:text-foreground transition-colors">
                  Logg inn
                </Link>
                <Link href="/about" className="hover:text-foreground transition-colors">
                  Om oss
                </Link>
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  Personvern
                </Link>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  Vilkår
                </Link>
                <Link href="/cookies" className="hover:text-foreground transition-colors">
                  Informasjonskapsler
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
