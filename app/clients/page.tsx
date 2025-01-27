"use client"

import { useEffect, useState } from "react"
import ClientDetails from "../components/ClienteDetails"
import ClientsList from "../components/ClientesList"
import CreateClientForm from "../components/CreateClienteForm"
import { Lang } from "../components/Lang"
import { AuthProvider, useAuth } from "../contexts/AuthContext"
import type { Bill, Client, Deposit } from "../lib/db/interfaces"

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [bills, setBills] = useState<Bill[]>([])
  const [deposits, setDeposits] = useState<Deposit[]>([])
  const { user, api } = useAuth()

  useEffect(() => {
    const fetchData = async () => {
      const clientsData = await api.getClients()
      setClients(clientsData)
    }
    fetchData()
  }, [api])

  const handleClientSelect = async (cliente: Client) => {
    setSelectedClient(cliente)
    const billsData = await api.getBills()
    const depositsData = await api.getDeposits()
    setBills(billsData.filter((b: { clientid: string }) => b.clientid === cliente.id))
    setDeposits(depositsData.filter((d: { clientid: string }) => d.clientid === cliente.id))
  }

  if (!user || user.tier !== "administrator") {
    return (
      <div>
        <Lang text="noPermission" />
      </div>
    )
  }

  return (
    <AuthProvider>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">
          <Lang text="clients" />
        </h1>
        <CreateClientForm onClientCreated={(newClient) => setClients([...clients, newClient])} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">
              <Lang text="clientList" />
            </h2>
            <ClientsList clients={clients} onClientSelect={handleClientSelect} />
          </div>
          {selectedClient && (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                <Lang text="clientDetails" />
              </h2>
              <ClientDetails cliente={selectedClient} bills={bills} deposits={deposits} onDataChange={function (): void {
                throw new Error("Function not implemented.")
              } } />
            </div>
          )}
        </div>
      </div>
    </AuthProvider>
  )
}

