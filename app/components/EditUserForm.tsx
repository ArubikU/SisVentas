'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { User } from '../lib/db/interfaces'

interface EditUserFormProps {
  user: User
  onUserUpdated: (user: User) => void
  currentUser: User
}

export default function EditUserForm({ user, onUserUpdated, currentUser }: EditUserFormProps) {
  const [email, setEmail] = useState(user.email)
  const [password, setPassword] = useState('')
  const [tier, setTier] = useState<'basic' | 'advanced' | 'administrator'>(user.tier)
  const { toast } = useToast()
  const { api } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const updatedUser: User = {
        ...user,
        email,
        tier,
        ...(password && { password })
      }
      await api.updateUser(updatedUser)
      onUserUpdated(updatedUser)
      setPassword('')
      toast({
        title: "Usuario actualizado",
        description: "El usuario ha sido actualizado exitosamente.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al actualizar el usuario.",
        variant: "destructive",
      })
    }
  }

  const canEditTier = currentUser.id !== user.id && !(currentUser.tier === 'administrator' && user.tier === 'administrator')

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
        <Label htmlFor="password">Nueva Contraseña (dejar en blanco para no cambiar)</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="tier">Nivel</Label>
        <Select 
          onValueChange={(value: 'basic' | 'advanced' | 'administrator') => setTier(value)} 
          value={tier}
          disabled={!canEditTier}
        >
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
      <Button type="submit">Actualizar Usuario</Button>
    </form>
  )
}

