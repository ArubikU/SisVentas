'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { jsPDF } from "jspdf"
import { applyPlugin } from "jspdf-autotable"
import { useState } from 'react'
import { Bill, Client, Deposit } from '../lib/db/interfaces'
import { CustomJSPDF } from "./CustomJSPDF"

applyPlugin(jsPDF)
interface GenerarInformeProps {
  clientes: Client[]
  boletas: Bill[]
  deposits: Deposit[]
}

export default function GenerarInforme({ clientes, boletas, deposits }: GenerarInformeProps) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [previewData, setPreviewData] = useState<any[]>([])
  const { toast } = useToast()

  const generarPreview = () => {
    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Por favor, selecciona un rango de dates.",
        variant: "destructive",
      })
      return
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    const data = clientes.map(cliente => {
      const clienteBills = boletas.filter(b => 
        b.clientid === cliente.id && 
        new Date(b.date) >= start && 
        new Date(b.date) <= end
      )
      const clienteDeposits = deposits.filter(d => 
        d.clientid === cliente.id && 
        new Date(d.date) >= start && 
        new Date(d.date) <= end
      )
      const totalBills = clienteBills.reduce((total, boleta) => 
        total + Object.values(boleta.products).reduce((subtotal, sproductos) => 
          subtotal + sproductos.reduce((sum, producto) => 
            sum + (producto.amount * producto.price), 0
          ), 0
        ), 0
      );
      

      const totalDeposits = clienteDeposits.reduce((total, deposito) => 
        total + deposito.amount, 0
      )

      const balance = totalBills - totalDeposits

      return {
        name: cliente.name,
        totalBills: totalBills.toFixed(2),
        totalDeposits: totalDeposits.toFixed(2),
        balance: balance.toFixed(2),
        boletas: clienteBills,
        deposits: clienteDeposits
      }
    })

    setPreviewData(data)
  }

  const generarPDF = () => {
    const doc = new jsPDF() as CustomJSPDF

    doc.setFontSize(18)
    doc.text("Informe Detallado de Clients", 14, 20)
    doc.setFontSize(12)
    doc.text(`Desde: ${startDate} Hasta: ${endDate}`, 14, 30)

    previewData.forEach((cliente, index) => {
      const startY = index === 0 ? 40 : doc.autoTableEndPosY() + 10

      doc.setFontSize(14)
      doc.text(`Client: ${cliente.name}`, 14, startY)
      doc.setFontSize(12)
      // Tabla de Bills
      doc.autoTable({
        startY: startY + 10,
        head: [['ID', 'Date', 'Product', 'Cantidad (docenas)', 'Precio', 'Total']],
        body: (cliente.boletas as Bill[]).flatMap(boleta => 
          Object.entries(boleta.products).flatMap(([productId, subproductos]) =>
            subproductos.map(producto => [
              boleta.id, // ID de la boleta
              new Date(boleta.date).toLocaleDateString(), // Fecha formateada
              productId, // ID del producto
              (producto.amount / 12).toFixed(2), // Cantidad en docenas
              producto.price.toFixed(2), // Precio por unidad
              (producto.amount * producto.price).toFixed(2) // Total
            ])
          )
        ),
      });


      // Tabla de Depósitos
      doc.autoTable({
        startY: doc.autoTableEndPosY()+ 10,
        head: [['ID', 'Date', 'Amount', 'Moneda', 'Tipo de Cambio']],
        body: (cliente.deposits as Deposit[]).map(deposito => [
          deposito.id,
          new Date(deposito.date).toLocaleDateString(),
          deposito.amount.toFixed(2),
          deposito.currency,
          deposito.changueamount.toFixed(4)
        ]),
      })

      // Resumen del cliente
      doc.autoTable({
        startY: doc.autoTableEndPosY() + 10,
        head: [['Total Bills', 'Total Depósitos', 'Balance']],
        body: [[
          cliente.totalBills,
          cliente.totalDeposits,
          cliente.balance
        ]],
      })

      if (index < previewData.length - 1) {
        doc.addPage()
      }
    })

    doc.save("inform.pdf")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generar Informe Detallado de Clients</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label htmlFor="startDate">Date Inicial</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="endDate">Date Final</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={generarPreview}>Generar Previsualización</Button>
          {previewData.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Previsualización</h3>
              <table className="w-full">
                <thead>
                  <tr>
                    <th>name</th>
                    <th>Total Bills</th>
                    <th>Total Depósitos</th>
                    <th>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, index) => (
                    <tr key={index}>
                      <td>{row.name}</td>
                      <td>{row.totalBills}</td>
                      <td>{row.totalDeposits}</td>
                      <td>{row.balance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Button onClick={generarPDF} className="mt-4">Descargar PDF Detallado</Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

