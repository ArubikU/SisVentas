import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { User } from '../lib/db/interfaces'

interface UserListProps {
  users: User[]
  onSelectUser: (user: User) => void
  onDeleteUser: (userId: string) => void
  currentUser: User
}

export default function UserList({ users, onSelectUser, onDeleteUser, currentUser }: UserListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Nivel</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.tier}</TableCell>
            <TableCell>
              <div className="space-x-2">
                <Button 
                  onClick={() => onSelectUser(user)} 
                  disabled={currentUser.id === user.id || (currentUser.tier === 'administrator' && user.tier === 'administrator' && currentUser.id !== user.id)}
                >
                  Editar
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => onDeleteUser(user.id)}
                  disabled={currentUser.id === user.id || (currentUser.tier === 'administrator' && user.tier === 'administrator')}
                >
                  Eliminar
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

