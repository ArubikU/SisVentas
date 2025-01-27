'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Bill } from '../lib/db/interfaces'

interface BillsListProps {
  bills: Bill[]
}

export default function BillsList({ bills }: BillsListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Client ID</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bills.map((boleta) => (
          <TableRow key={boleta.id}>
            <TableCell>{boleta.id}</TableCell>
            <TableCell>{boleta.clientid}</TableCell>
            <TableCell>{boleta.date}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

