'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Client } from '../lib/db/interfaces'
import { getTranslation } from "./Lang"

interface CreateClientFormProps {
  onClientCreated: (cliente: Client) => void
}

export default function CreateClientForm({ onClientCreated }: CreateClientFormProps) {
  const [name, setname] = useState('')
  const { toast } = useToast()
  const { api } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const newClient: Client = {
        id: Date.now().toString(),
        name,
        prices: {}
      }
      await api.createClient(newClient)
      setname('')
      toast({
        title: "Client creado",
        description: "El cliente ha sido creado exitosamente.",
      })
      onClientCreated(newClient)
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al crear el cliente.",
        variant: "destructive",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-4">
      <div>
        <Label htmlFor="name">{getTranslation("InsertClientNameForm")}</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setname(e.target.value)}
          required
          className="mt-1"
        />
      </div>
      <Button type="submit">{getTranslation("CreateClientButton")}</Button>
    </form>
  )
}

