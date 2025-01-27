"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { jsPDF } from "jspdf"
import { applyPlugin } from "jspdf-autotable"
import { FileDown, RefreshCw, Trash2 } from "lucide-react"
import { useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import type { Bill, Client, Deposit } from "../lib/db/interfaces"
import { CustomJSPDF } from "./CustomJSPDF"
applyPlugin(jsPDF)
interface ClientDetailsProps {
  cliente: Client
  bills: Bill[]
  deposits: Deposit[]
  onDataChange: () => void
}

export default function ClientDetails({ cliente, bills, deposits, onDataChange }: ClientDetailsProps) {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const { user, api } = useAuth()
  const { toast } = useToast()

  const filteredBills = bills.filter((boleta) => {
    const boletaDate = new Date(boleta.date)
    return (!startDate || boletaDate >= new Date(startDate)) && (!endDate || boletaDate <= new Date(endDate))
  })

  const filteredDeposits = deposits.filter((deposito) => {
    const depositoDate = new Date(deposito.date)
    return (!startDate || depositoDate >= new Date(startDate)) && (!endDate || depositoDate <= new Date(endDate))
  })

  const totalBills = filteredBills.reduce((total, boleta) => {
    return (
      total +
      Object.values(boleta.products).reduce((subtotal, producto) => {
        return subtotal + producto.reduce((sum, item) => sum + item.amount * item.price, 0)
      }, 0)
    )
  }, 0)

  const totalDeposits = filteredDeposits.reduce((total, deposito) => {
    return total + deposito.amount
  }, 0)

  const balance = totalBills - totalDeposits

  const handleEliminarBill = async (boletaId: string) => {
    if (user?.tier !== "administrator") {
      toast({
        title: "Acceso denegado",
        description: "Solo los administratores pueden eliminar bills.",
        variant: "destructive",
      })
      return
    }

    try {
      await api.deleteBill(boletaId)
      toast({
        title: "Bill eliminada",
        description: "La boleta ha sido eliminada exitosamente.",
      })
      onDataChange()
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al eliminar la boleta.",
        variant: "destructive",
      })
    }
  }

  const handleEliminarDeposit = async (depositoId: string) => {
    if (user?.tier !== "administrator") {
      toast({
        title: "Acceso denegado",
        description: "Solo los administratores pueden eliminar depósitos.",
        variant: "destructive",
      })
      return
    }

    try {
      await api.deleteDeposit(depositoId)
      toast({
        title: "Depósito eliminado",
        description: "El depósito ha sido eliminado exitosamente.",
      })
      onDataChange()
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al eliminar el depósito.",
        variant: "destructive",
      })
    }
  }
  const exportarPDF = () => {
    const doc  = new jsPDF() as CustomJSPDF
    const pageWidth = doc.internal.pageSize.width

    doc.setFontSize(18)
    doc.text(`Client Report: ${cliente.name}`, 14, 20)

    doc.setFontSize(12)
    doc.text(`Balance: $${balance.toFixed(2)}`, 14, 30)

    // Bills table
    doc.setFontSize(14)
    doc.text("Bills", 14, 45)
    doc.autoTable({
      startY: 45,
      head: [["ID", "Date", "Total"]],
      body: filteredBills.map((boleta) => [
        boleta.id,
        new Date(boleta.date).toLocaleDateString(),
        `$${Object.values(boleta.products)
          .reduce(
            (total, productos) =>
              total + productos.reduce((subtotal, producto) => subtotal + producto.amount * producto.price, 0),
            0,
          )
          .toFixed(2)}`,
      ]),
      headStyles: { fillColor: [0, 32, 96] },
    })

    // Deposits table
    const depositsStartY = doc.autoTableEndPosY() + 15
    doc.setFontSize(14)
    doc.text("Deposits", 14, depositsStartY)
    doc.autoTable({
      startY: depositsStartY + 5,
      head: [["ID", "Date", "Amount"]],
      body: filteredDeposits.map((deposito) => [
        deposito.id,
        new Date(deposito.date).toLocaleDateString(),
        `$${deposito.amount.toFixed(2)}`,
      ]),
      headStyles: { fillColor: [0, 32, 96] },
    })

    // Summary
    const summaryStartY =  doc.autoTableEndPosY() + 15
    doc.setFontSize(12)
    doc.text(`Total Bills: $${totalBills.toFixed(2)}`, 14, summaryStartY)
    doc.text(`Total Deposits: $${totalDeposits.toFixed(2)}`, 14, summaryStartY + 7)
    doc.setFontSize(14)
    doc.text(`Final Balance: $${Math.abs(balance).toFixed(2)}`, 14, summaryStartY + 14)
    doc.setFontSize(12)
    doc.text(balance > 0 ? "(Client owes)" : balance < 0 ? "(Owed to client)" : "", pageWidth - 60, summaryStartY + 14)

    doc.save(`report_${cliente.name}.pdf`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{cliente.name}</span>
          <Button onClick={exportarPDF}>
            <FileDown className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
          <div className="space-y-2 flex-grow">
            <Label htmlFor="startDate">Date inicial</Label>
            <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="space-y-2 flex-grow">
            <Label htmlFor="endDate">Date final</Label>
            <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setStartDate("")
                setEndDate("")
              }}
              title="Limpiar filtros"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Bills</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBills.map((boleta) => (
                <TableRow key={boleta.id}>
                  <TableCell>{boleta.id}</TableCell>
                  <TableCell>{new Date(boleta.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    $
                    {Object.values(boleta.products)
                      .reduce((total, producto) => {
                        return total + producto.reduce((sum, item) => sum + item.amount * item.price, 0)
                      }, 0)
                      .toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Button variant="destructive" size="sm" onClick={() => handleEliminarBill(boleta.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Depósitos</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeposits.map((deposito) => (
                <TableRow key={deposito.id}>
                  <TableCell>{deposito.id}</TableCell>
                  <TableCell>{new Date(deposito.date).toLocaleDateString()}</TableCell>
                  <TableCell>${deposito.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Button variant="destructive" size="sm" onClick={() => handleEliminarDeposit(deposito.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-semibold">Balance</h3>
          <p>Total Bills: ${totalBills.toFixed(2)}</p>
          <p>Total Depósitos: ${totalDeposits.toFixed(2)}</p>
          <p className="font-bold">
            Balance Final: ${Math.abs(balance).toFixed(2)}
            {balance > 0 ? " (El cliente debe)" : balance < 0 ? " (Se debe al cliente)" : ""}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

