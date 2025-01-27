'use client'

import React, { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"

interface Column {
  header: string
  accessor: string
}

interface ExcelLikeTableProps {
  columns: Column[]
  data: any[]
  onDataChange: (newData: any[]) => void
}

export default function ExcelLikeTable({ columns, data, onDataChange }: ExcelLikeTableProps) {
  const [editCell, setEditCell] = useState<{ rowIndex: number, columnAccessor: string } | null>(null)

  const handleCellEdit = (rowIndex: number, columnAccessor: string, value: string) => {
    const newData = [...data]
    newData[rowIndex][columnAccessor] = value
    onDataChange(newData)
    setEditCell(null)
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column.accessor}>{column.header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, rowIndex) => (
          <TableRow key={rowIndex}>
            {columns.map((column) => (
              <TableCell key={column.accessor}>
                {editCell?.rowIndex === rowIndex && editCell?.columnAccessor === column.accessor ? (
                  <Input
                    value={row[column.accessor]}
                    onChange={(e) => handleCellEdit(rowIndex, column.accessor, e.target.value)}
                    onBlur={() => setEditCell(null)}
                    autoFocus
                  />
                ) : (
                  <div
                    onClick={() => setEditCell({ rowIndex, columnAccessor: column.accessor })}
                    className="cursor-pointer"
                  >
                    {row[column.accessor]}
                  </div>
                )}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

