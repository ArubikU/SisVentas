'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Deposit } from '../lib/db/interfaces'

interface DepositsListProps {
  deposits: Deposit[]
}

export default function DepositsList({ deposits }: DepositsListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Client ID</TableHead>
          <TableHead>Moneda</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {deposits.map((deposito) => (
          <TableRow key={deposito.id}>
            <TableCell>{deposito.id}</TableCell>
            <TableCell>{deposito.clientid}</TableCell>
            <TableCell>{deposito.currency}</TableCell>
            <TableCell>{deposito.amount.toFixed(2)}</TableCell>
            <TableCell>{new Date(deposito.date).toLocaleDateString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

