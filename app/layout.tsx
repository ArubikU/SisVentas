import { Toaster } from "@/components/ui/toaster"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import AuthCheck from "./components/AuthCheck"
import Navbar from "./components/Navbar"
import { AuthProvider } from "./contexts/AuthContext"
import { ThemeProvider } from "./contexts/ThemeContext"
import "./generated.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sistema de Gestión de Ventas",
  description: "Sistema para registrar bills y depósitos de clients",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <html lang="es" className="h-full">
          <body className={`${inter.className} flex flex-col h-full bg-background text-foreground`}>
            <Navbar />
            <main className="flex-grow container mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <AuthCheck>{children}</AuthCheck>
            </main>
            <Toaster />
          </body>
        </html>
      </ThemeProvider>
    </AuthProvider>
  )
}

