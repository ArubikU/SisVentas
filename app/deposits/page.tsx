"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import CreateDepositForm from "../components/CreateDepositoForm"
import DepositsList from "../components/DepositosList"
import { getTranslation, Lang } from "../components/Lang"
import { useAuth } from "../contexts/AuthContext"
import type { Client, Deposit } from '../lib/db/interfaces'

export default function DepositsPage() {
  const [deposits, setDeposits] = useState<Deposit[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, api } = useAuth()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [depositsData, clientsData] = await Promise.all([api.getDeposits(), api.getClients()])
        setDeposits(depositsData)
        setClients(clientsData)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(getTranslation("errorFetchingData"))
        setLoading(false)
      }
    }

    fetchData()
  }, [api])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="sr-only">
          <Lang text="loadingData" />
        </span>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Lang text="error" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        <Lang text="deposits" />
      </h1>
      <CreateDepositForm
        clients={clients}
        onDepositCreated={(newDeposit) => setDeposits([...deposits, newDeposit])}
      />
      <DepositsList deposits={deposits} />
    </div>
  )
}

