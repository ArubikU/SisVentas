"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { getTranslation, Lang } from "./components/Lang"
import { useAuth } from "./contexts/AuthContext"

export default function Home() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div>
        <Lang text="unauthorized" />
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>{getTranslation("receipts")}
          </CardTitle>
          <CardDescription>{getTranslation("manageReceipts")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/bills" className="text-blue-500 hover:underline">{getTranslation("viewReceipts")}
          </Link>
        </CardContent>
      </Card>
      {(user.tier === "advanced" || user.tier === "administrator") && (
        <Card>
          <CardHeader>
            <CardTitle>{getTranslation("deposits")}
            </CardTitle>
            <CardDescription>{getTranslation("manageDeposits")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/deposits" className="text-blue-500 hover:underline">{getTranslation("viewDeposits")}
            </Link>
          </CardContent>
        </Card>
      )}
      {user.tier === "administrator" && (
        <Card>
          <CardHeader>
            <CardTitle>{getTranslation("clients")}
            </CardTitle>
            <CardDescription>{getTranslation("manageClients")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/clients" className="text-blue-500 hover:underline">{getTranslation("viewClients")}
            </Link>
          </CardContent>
        </Card>
      )}
      {user.tier === "administrator" && (
        <Card>
          <CardHeader>
            <CardTitle>{getTranslation("products")}
            </CardTitle>
            <CardDescription> {getTranslation("manageProducts")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/products" className="text-blue-500 hover:underline">{getTranslation("manageProducts")}
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

