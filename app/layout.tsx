import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import { AuthNav } from "@/components/AuthNav"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DevDiario — Artículos de desarrollo web",
  description: "Tutoriales y artículos sobre Next.js, TypeScript, Supabase y desarrollo moderno.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>
          <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
            <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
              <a href="/" className="text-lg font-bold text-foreground">
                DevDiario
              </a>
              <nav className="flex items-center gap-6 text-sm text-muted-foreground">
                <a href="/blog" className="hover:text-foreground transition-colors">Blog</a>
                <a href="/bookmarks" className="hover:text-foreground transition-colors">Guardados</a>
                <AuthNav />
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-5xl px-4 py-10">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
