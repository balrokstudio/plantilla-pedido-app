import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Rubik } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from "react"

const rubik = Rubik({ subsets: ["latin"], weight: "400" })

export const metadata: Metadata = {
  title: "Sistema de Pedidos - Plantillas Ortopédicas",
  description: "Sistema completo para pedidos de plantillas ortopédicas personalizadas",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`min-h-screen flex flex-col font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <main className="flex-1">
              {children}
            </main>
            <footer className="w-full py-1">
              <div className="container mx-auto  py-3 px-4 text-center text-xs text-muted-foreground leading-none">
                 {" "}
                <a
                  href="https://balrok.studio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${rubik.className} underline hover:text-foreground`}
                >
                  Balrok.Studio
                </a>
              </div>
            </footer>
            <Toaster />
          </ThemeProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
