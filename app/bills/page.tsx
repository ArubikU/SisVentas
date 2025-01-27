"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getTranslation, Lang } from "../components/Lang"
import { useAuth } from "../contexts/AuthContext"
import type { Bill, Client, Deposit, Product } from '../lib/db/interfaces'

type DataState = {
  clients: Client[]
  products: Product[]
  bills: Bill[]
}

type LoadingState = "idle" | "loading" | "success" | "error"

interface ProductSeleccionado {
  id: string
  amount: number
  extraDetails: string
}

export default function BillsPage() {
  
  const [pricesClient, setPreciosClient] = useState<{ [key: string]: { [key: string]: number } }>({})
  useEffect(() => {
    const fetchData = async () => {
      const productsData = await api.getProducts()
      const clientsData = await api.getClients()

      const prices: { [key: string]: { [key: string]: number } } = {}
      clientsData.forEach((cliente: Client) => {
        prices[cliente.id] = cliente.prices
      })
      setPreciosClient(prices)
    }
    fetchData()
  }, []) // Added api.getClients to dependencies
  const { user, api } = useAuth()
  const [data, setData] = useState<DataState>({
    clients: [],
    products: [],
    bills: [],
  })
  const [loadingState, setLoadingState] = useState<LoadingState>("idle")
  const [error, setError] = useState<string | null>(null)

  // Estados para el formulario de creación de boleta
  const [clientid, setClientId] = useState("")
  const [productsSeleccionados, setProductsSeleccionados] = useState<ProductSeleccionado[]>([])
  const [productoActual, setProductActual] = useState<ProductSeleccionado>({
    id: "",
    amount: 0,
    extraDetails: "",
  })
  const [subtotal, setSubtotal] = useState(0)
  const [balanceActual, setBalanceActual] = useState(0)

  const router = useRouter()
  const { toast } = useToast()

  const fetchData = async () => {
    setLoadingState("loading")
    try {
      const [clientsData, productsData, billsData] = await Promise.all([
        api.getClients(),
        api.getProducts(),
        api.getBills(),
      ])
      setData({
        clients: clientsData,
        products: productsData,
        bills: billsData,
      })
      setLoadingState("success")
    } catch (error) {
      console.error("Error fetching data:", error)
      setError(error instanceof Error ? error.message : String(error))
      setLoadingState("error")
    }
  }

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, []) // Added fetchData to dependencies

  useEffect(() => {
    if (productsSeleccionados.length > 0 && data.products.length > 0) {
      calcularSubtotal()
    }
  }, [productsSeleccionados, data.products])

  useEffect(() => {
    if (clientid) {
      calcularBalanceActual()
    }
  }, [clientid])

  const calcularSubtotal = () => {
    const total = productsSeleccionados.reduce((acc, producto) => {
      const priceProduct = pricesClient[clientid]?.[producto.id] || data.products.find((p) => p.id === producto.id)?.genericprice || 0
      return acc + priceProduct * producto.amount
    }, 0)
    setSubtotal(total)
  }

  const calcularBalanceActual = async () => {
    const bills = await api.getBills() as Bill[]
    const deposits = await api.getDeposits() as Deposit[]

    const billsClient = bills.filter((b) => b.clientid === clientid)
    const depositsClient = deposits.filter((d) => d.clientid === clientid)

    const totalBills = billsClient.reduce((total: number, boleta: Bill) => {
      return (
        total +
      Object.entries(boleta.products).reduce((subtotal, [productId, productos]) => {
        const priceProduct = pricesClient[boleta.clientid]?.[productId] || data.products.find((p) => p.id === productId)?.genericprice || 0
        return subtotal + productos.reduce((acc, p) => acc + p.amount * priceProduct, 0)
        }, 0)
      )
    }, 0)

    const totalDeposits = depositsClient.reduce((total, deposito) => {
      return total + deposito.amount
    }, 0)

    const balance = totalBills - totalDeposits
    setBalanceActual(balance)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (data.clients.length === 0 || data.products.length === 0) {
      toast({
        title: getTranslation("error"),
        description: getTranslation("noDataToCreateReceipt"),
        variant: "destructive",
      })
      return
    }

    try {
      const cliente = data.clients.find((c) => c.id === clientid)
      //if (!cliente) {
      //  throw new Error(<Lang text="clientNotFound" />)
      //}
      console.log(clientid)
      const productsConPrecios = productsSeleccionados.reduce(
        (acc, { id, amount, extraDetails }) => {
          const priceClient = pricesClient[clientid]?.[id]
          const producto = data.products.find((p) => p.id === id)
          const price = priceClient || producto?.genericprice || 0
          if (!acc[id]) {
            acc[id] = []
          }
          acc[id].push({
            amount: amount * 12,
            price,
            extraDetails,
          })
          return acc
        },
        {} as { [key: string]: { amount: number; price: number; extraDetails: string }[] },
      )

      const boletaId = Date.now().toString()
      const nuevaBill: Bill = {
        id: boletaId,
        clientid,
        products: productsConPrecios,
        date: new Date().toISOString(),
        identifier: `BOL-${boletaId}`,
      }
      await api.createBill(nuevaBill)
      setData((prevData) => ({
        ...prevData,
        bills: [...prevData.bills, nuevaBill],
      }))
      resetForm()
      toast({
        title: <Lang text="receiptCreated" />,
        description: <Lang text="receiptCreatedSuccessfully" args={{ id: boletaId }} />,
      })
    } catch (error) {
      console.error("Error al crear la boleta:", error)
      toast({
        title: <Lang text="error" />,
        description: <Lang text="errorCreatingReceipt" />,
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setClientId("")
    setProductsSeleccionados([])
    setProductActual({ id: "", amount: 0, extraDetails: "" })
    setSubtotal(0)
    setBalanceActual(0)
  }

  const handleAgregarProduct = () => {
    if (productoActual.id && productoActual.amount > 0) {

      setProductsSeleccionados((prev) => [...prev, productoActual])
      setProductActual({ id: "", amount: 0, extraDetails: "" })
    }
  }

  const handleRemoverProduct = (index: number) => {
    setProductsSeleccionados((prev) => prev.filter((_, i) => i !== index))
  }

  if (!user) {
    return (
      <div>
        <Lang text="pleaseLoginToAccess" />
      </div>
    )
  }

  if (loadingState === "loading" || loadingState === "idle") {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="sr-only">
          <Lang text="loadingData" />
        </span>
      </div>
    )
  }

  if (loadingState === "error") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Lang text="error" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            <Lang text="errorFetchingData" />: {error}
          </p>
          <Button onClick={() => fetchData()} className="mt-4">
            <Lang text="retry" />
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          <Lang text="receipts" />
        </h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> <Lang text="createReceipt" />
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[400px] sm:w-[540px] sm:max-w-[calc(100vw-2rem)]">
            <SheetHeader>
              <SheetTitle>
                <Lang text="createNewReceipt" />
              </SheetTitle>
              <SheetDescription>
                <Lang text="fillDetailsToCreateReceipt" />
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-8rem)] pr-4">
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="cliente">
                    <Lang text="client" />
                  </Label>
                  <Select onValueChange={setClientId} value={clientid}>
                    <SelectTrigger>
                      <SelectValue placeholder={<Lang text="selectClient" />} />
                    </SelectTrigger>
                    <SelectContent>
                      {data.clients.map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                          {cliente.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>
                    <Lang text="addProduct" />
                  </Label>
                  <Select onValueChange={(value) => setProductActual((prev) => ({ ...prev, id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder={<Lang text="selectProduct" />} />
                    </SelectTrigger>
                    <SelectContent>
                      {data.products.map((producto) => (
                        <SelectItem key={producto.id} value={producto.id}>
                          {producto.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      placeholder={<Lang text="quantityDozens" />}
                      value={productoActual.amount}
                      onChange={(e) =>
                        setProductActual((prev) => ({ ...prev, amount: Number.parseInt(e.target.value) }))
                      }
                      className="w-1/2"
                    />
                    <Button type="button" onClick={handleAgregarProduct}>
                      <Lang text="add" />
                    </Button>
                  </div>
                  <Textarea
                    placeholder={getTranslation("extraDetails")}
                    value={productoActual.extraDetails}
                    onChange={(e) => setProductActual((prev) => ({ ...prev, extraDetails: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>
                    <Lang text="selectedProducts" />
                  </Label>
                  {productsSeleccionados.map((producto, index) => (
                    <div key={index} className="flex items-center justify-between mt-2 bg-muted p-2 rounded-md">
                      <div>
                        <p className="font-medium">{data.products.find((p) => p.id === producto.id)?.name}</p>
                        <p className="text-sm">
                          <Lang text="quantity" />: {producto.amount} <Lang text="dozens" />
                        </p>
                        <p className="text-sm">
                          <Lang text="details" />: {producto.extraDetails}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoverProduct(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>
                      <Lang text="receiptSummary" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>
                      <Lang text="receiptSubtotal" />: ${subtotal.toFixed(2)}
                    </p>
                    <p>
                      <Lang text="clientCurrentBalance" />: ${balanceActual.toFixed(2)}
                    </p>
                    <p>
                      <Lang text="projectedBalanceAfterReceipt" />: ${(balanceActual + subtotal).toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
                <Button type="submit" className="w-full">
                  <Lang text="createReceipt" />
                </Button>
              </form>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <Lang text="receiptList" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>
                  <Lang text="client" />
                </TableHead>
                <TableHead>
                  <Lang text="date" />
                </TableHead>
                <TableHead>
                  <Lang text="total" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.bills.map((boleta) => (
                <TableRow key={boleta.id}>
                  <TableCell>{boleta.id}</TableCell>
                  <TableCell>
                    {data.clients.find((c) => c.id === boleta.clientid)?.name || <Lang text="clientNotFound" />}
                  </TableCell>
                  <TableCell>{new Date(boleta.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    $
                    {Object.entries(boleta.products)
                      .reduce(
                      (total, [productId, productoArray]) =>
                          total +
                          productoArray.reduce(
                        (subtotal, producto) =>
                          subtotal +
                          producto.amount *
                          (pricesClient[boleta.clientid]?.[productId] || producto.price),
                            0,
                          ),
                        0,
                      )
                      .toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

