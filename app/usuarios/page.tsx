"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import CreateUserForm from "../components/CreateUserForm"
import EditUserForm from "../components/EditUserForm"
import { Lang } from "../components/Lang"
import UserList from "../components/UserList"
import { useAuth } from "../contexts/AuthContext"
import type { User } from "../lib/db/interfaces"

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const { user, api } = useAuth()

  useEffect(() => {
    const fetchUsers = async () => {
      const usersData = await api.getUsers()
      setUsers(usersData)
    }
    fetchUsers()
  }, [api])

  const handleUserCreated = (newUser: User) => {
    setUsers((prevUsers) => [...prevUsers, newUser])
  }

  const handleUserUpdated = (updatedUser: User) => {
    setUsers((prevUsers) => prevUsers.map((u) => (u.id === updatedUser.id ? updatedUser : u)))
    setSelectedUser(null)
  }

  const handleUserDeleted = async (userId: string) => {
    try {
      await api.deleteUser(userId)
      setUsers((prevUsers) => prevUsers.filter((u) => u.id !== userId))
      setSelectedUser(null)
    } catch (error) {
      console.error("Error deleting user:", error)
    }
  }

  if (!user || user.tier !== "administrator") {
    return (
      <div>
        <Lang text="noPermission" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        <Lang text="userManagement" />
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>
            <Lang text="createNewUser" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CreateUserForm onUserCreated={handleUserCreated} />
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              <Lang text="userList" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UserList
              users={users}
              onSelectUser={setSelectedUser}
              onDeleteUser={handleUserDeleted}
              currentUser={user}
            />
          </CardContent>
        </Card>
        {selectedUser && (
          <Card>
            <CardHeader>
              <CardTitle>
                <Lang text="editUser" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EditUserForm user={selectedUser} onUserUpdated={handleUserUpdated} currentUser={user} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

