'use client'

import { useAuth } from '../contexts/AuthContext'
import { usePathname } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'

export default function AuthCheck({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const pathname = usePathname()

  if (!user && pathname !== '/login') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acceso Restringido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Por favor, inicia sesión para acceder al sistema.</p>
            <Link href="/login" className="text-primary hover:underline">
              Ir a la página de inicio de sesión
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}

