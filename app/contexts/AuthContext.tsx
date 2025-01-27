'use client'

import { useToast } from "@/components/ui/use-toast"
import React, { createContext, useContext, useEffect, useState } from 'react'
import { ApiManager, useApi } from '../lib/apiManager'
import { AuthenticatedUserData } from '../lib/db/interfaces'

interface AuthContextType {
  user: AuthenticatedUserData | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  key: string
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>
  api: ApiManager
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUserData  | null>(null)
  const [key, setKey] = useState('')
  const { toast } = useToast()
  const [api, setApi] = useState<ApiManager>(useApi(''))

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const storedKey= localStorage.getItem('client-key')
    if (storedUser && storedKey) {
      setUser(JSON.parse(storedUser))
      setKey(storedKey)
      setApi(useApi(storedKey))
    }
  }, [])

  useEffect(() => {
    setApi(useApi(key))
  }
  ,[key])

  const checkClientsConDeudas = async () => {
    const clients = await api.getClients()
    const bills = await api.getBills()
    const deposits = await api.getDeposits()

    const clientsConDeudas = clients.filter(cliente => {
      const clienteBills = bills.filter(b => b.clientid === cliente.id)
      const clienteDeposits = deposits.filter(d => d.clientid === cliente.id)

      const totalBills = clienteBills.reduce((total, boleta) => 
        total + Object.values(boleta.products).reduce((subtotal, producto) => 
          subtotal + (producto.amount * producto.price), 0
        ), 0
      )

      const totalDeposits = clienteDeposits.reduce((total, deposito) => 
        total + deposito.amount, 0
      )

      const balance = totalBills - totalDeposits
      return balance > 10000 // Consideramos una deuda alta si es mayor a 1000
    })

    if (clientsConDeudas.length > 0) {
      toast({
        title: "Alerta de Deudas",
        description: `Hay ${clientsConDeudas.length} cliente(s) con deudas altas.`,
        variant: "destructive",
      })
    }
  }

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (response.ok) {
      const requestData = await response.json()
      localStorage.setItem('user', JSON.stringify(requestData.data))
      localStorage.setItem('client-key', requestData.key)
      setKey(requestData.key)
      setUser(requestData.data)
      setApi(useApi(requestData.key))
      try{
       
      await checkClientsConDeudas() 
      }catch (error){
        
      }
      return true
    }
    return false
  }
  

  const logout = () => {
    setUser(null)
    setApi(null)
    setKey(null)
    localStorage.removeItem('user')
    localStorage.removeItem('client-key')
  }

  const changePassword = async (oldPassword: string, newPassword: string) => {
    if (!user) return false

    // En una aplicación real, esto se haría mediante una llamada a la API
    const users = await api.getUsers()
    const currentUser = users.find(u => u.id === user.id && u.password === oldPassword)

    if (currentUser) {
      currentUser.password = newPassword
      await api.updateUser(currentUser)
      return true
    }
    return false
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, key, changePassword, api }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

