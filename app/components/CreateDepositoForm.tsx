'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useApi } from '../lib/apiManager'
import { Client, Deposit } from '../lib/db/interfaces'

interface CreateDepositFormProps {
  clients: Client[]
  onDepositCreated: (deposit: Deposit) => void
}

export default function CreateDepositForm({ clients, onDepositCreated }: CreateDepositFormProps) {
  const [clientid, setClientId] = useState('')
  const [currency, setMoneda] = useState<'PEN' | 'USD'>('PEN')
  const [amount, setAmount] = useState('')
  const [changueamount, setTipoCambio] = useState('1')
  const [operationcode, setOperationCode] = useState('NONE-000')
  const { key } = useAuth()
  const api = useApi(key)
  const { toast } = useToast()

  const handleMonedaChange = (value: 'PEN' | 'USD') => {
    setMoneda(value)
    if (value === 'PEN') {
      setTipoCambio('1')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const newDeposit: Deposit = {
        id: Date.now().toString(),
        clientid,
        currency,
        amount: parseFloat(amount) * parseFloat(changueamount),
        changueamount: parseFloat(changueamount),
        date: new Date().toISOString(),
        operationcode: operationcode || undefined, // Optional field
      }
      await api.createDeposit(newDeposit)
      setClientId('')
      setMoneda('PEN')
      setAmount('')
      setTipoCambio('1')
      setOperationCode('')
      toast({
        title: "Depósito creado",
        description: "El depósito ha sido creado exitosamente.",
      })
      onDepositCreated(newDeposit)
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al crear el depósito.",
        variant: "destructive",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-4">
      <div>
        <Label htmlFor="cliente">Client</Label>
        <Select onValueChange={setClientId} value={clientid}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un cliente" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((cliente) => (
              <SelectItem key={cliente.id} value={cliente.id}>{cliente.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="currency">Moneda</Label>
        <Select onValueChange={handleMonedaChange} value={currency}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona la currency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PEN">PEN</SelectItem>
            <SelectItem value="USD">USD</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="changueamount">Tipo de Cambio</Label>
        <Input
          id="changueamount"
          type="number"
          step="0.0001"
          value={changueamount}
          onChange={(e) => setTipoCambio(e.target.value)}
          required
          disabled={currency === 'PEN'}
        />
      </div>
      <div>
        <Label htmlFor="operationcode">Código de Operación (opcional)</Label>
        <Input
          id="operationcode"
          type="text"
          value={operationcode}
          onChange={(e) => setOperationCode(e.target.value)}
        />
      </div>
      <Button type="submit">Crear Depósito</Button>
    </form>
  )
}
