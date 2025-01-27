'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { User } from '../lib/db/interfaces'

interface CreateUserFormProps {
  onUserCreated: (user: User) => void
}

export default function CreateUserForm({ onUserCreated }: CreateUserFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [tier, setTier] = useState<'basic' | 'advanced' | 'administrator'>('basic')
  const { toast } = useToast()
  const { api } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const newUser: User = {
        id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        email,
        password,
        tier
      }
      await api.createUser(newUser)
      onUserCreated(newUser)
      setEmail('')
      setPassword('')
      setTier('basic')
      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado exitosamente.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al crear el usuario.",
        variant: "destructive",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="tier">Nivel</Label>
        <Select onValueChange={(value: 'basic' | 'advanced' | 'administrator') => setTier(value)} value={tier}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un nivel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="basic">Básico</SelectItem>
            <SelectItem value="advanced">advanced</SelectItem>
            <SelectItem value="administrator">administrator</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit">Crear Usuario</Button>
    </form>
  )
}

