import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Client } from '../lib/db/interfaces'

interface ClientsListProps {
  clients: Client[]
  onClientSelect: (cliente: Client) => void
}

export default function ClientsList({ clients, onClientSelect }: ClientsListProps) {

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>name</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((cliente) => (
          <TableRow key={cliente.id}>
            <TableCell>{cliente.id}</TableCell>
            <TableCell>{cliente.name}</TableCell>
            <TableCell>
              <Button onClick={() => onClientSelect(cliente)}>Ver detalles</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

