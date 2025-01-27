"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { getTranslation, Lang } from "../components/Lang"
import { AuthProvider, useAuth } from "../contexts/AuthContext"
import type { Client, Product } from '../lib/db/interfaces'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [nuevoProduct, setNuevoProduct] = useState({ name: "", genericprice: 0 })
  const { user, api } = useAuth()
  const { toast } = useToast()

  const [pricesClient, setPreciosClient] = useState<{ [key: string]: { [key: string]: number } }>({})
  useEffect(() => {
    const fetchData = async () => {
      const productsData = await api.getProducts()
      const clientsData = await api.getClients()
      setProducts(productsData)
      setClients(clientsData)

      const prices: { [key: string]: { [key: string]: number } } = {}
      clientsData.forEach((cliente: Client) => {
        prices[cliente.id] = cliente.prices
      })
      setPreciosClient(prices)
    }
    fetchData()
  }, []) // Added api.getClients to dependencies

  const handleCrearProduct = async () => {
    if (user?.tier !== "administrator") {
      toast({
        title: getTranslation("accessDenied"),
        description: getTranslation("adminOnlyCreateProduct"),
        variant: "destructive",
      })
      return
    }

    const nuevoProductCompleto: Product = {
      id: Date.now().toString(),
      ...nuevoProduct,
    }

    await api.createProduct(nuevoProductCompleto)
    setProducts((prevProducts) => {
      const updatedProducts = [...prevProducts]
      const existingIndex = updatedProducts.findIndex((p) => p.id === nuevoProductCompleto.id)
      if (existingIndex >= 0) {
        updatedProducts[existingIndex] = nuevoProductCompleto
      } else {
        updatedProducts.push(nuevoProductCompleto)
      }
      return updatedProducts
    })
    const updatedProducts = await api.getProducts()
    setProducts(updatedProducts)
    setNuevoProduct({ name: "", genericprice: 0 })
    toast({
      title: <Lang text="productCreated" />,
      description: <Lang text="productCreatedSuccessfully" />,
    })
  }

  const handleEliminarProduct = async (productId: string) => {
    if (user?.tier !== "administrator") {
      toast({
        title: <Lang text="accessDenied" />,
        description: <Lang text="adminOnlyDeleteProduct" />,
        variant: "destructive",
      })
      return
    }

    await api.deleteProduct(productId)
    setProducts((prevProducts) => prevProducts.filter((p) => p.id !== productId))
    toast({
      title: <Lang text="productDeleted" />,
      description: <Lang text="productDeletedSuccessfully" />,
    })
  }

  const handleCambiarPrecioClient = async (clientid: string, productId: string, nuevoPrecio: number) => {
    if (user?.tier !== "administrator") {
      toast({
        title: <Lang text="accessDenied" />,
        description: <Lang text="adminOnlyChangePrice" />,
        variant: "destructive",
      })
      return
    }

    const nuevosPreciosClient = {
      ...pricesClient,
      [clientid]: {
        ...pricesClient[clientid],
        [productId]: nuevoPrecio,
      },
    }
    setPreciosClient(nuevosPreciosClient)

    const clienteActualizado = clients.find((c) => c.id === clientid)
    if (clienteActualizado) {
      clienteActualizado.prices = nuevosPreciosClient[clientid]
      await api.updateClient(clienteActualizado)
      toast({
        title: <Lang text="priceUpdated" />,
        description: <Lang text="priceUpdatedSuccessfully" />,
      })
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
    <AuthProvider>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">
          <Lang text="productManagement" />
        </h1>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            <Lang text="createNewProduct" />
          </h2>
          <div className="flex space-x-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="name">
                <Lang text="productName" />
              </Label>
              <Input
                id="name"
                value={nuevoProduct.name}
                onChange={(e) => setNuevoProduct({ ...nuevoProduct, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="genericprice">
                <Lang text="standardPrice" />
              </Label>
              <Input
                id="genericprice"
                type="number"
                value={nuevoProduct.genericprice}
                onChange={(e) =>
                  setNuevoProduct({ ...nuevoProduct, genericprice: Number.parseFloat(e.target.value) })
                }
              />
            </div>
            <Button onClick={handleCrearProduct}>
              <Lang text="createProduct" />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            <Lang text="productListAndPrices" />
          </h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Lang text="product" />
                </TableHead>
                <TableHead>
                  <Lang text="standardPrice" />
                </TableHead>
                {clients.map((cliente) => (
                  <TableHead key={cliente.id}>{cliente.name}</TableHead>
                ))}
                <TableHead>
                  <Lang text="actions" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((producto) => (
                <TableRow key={producto.id}>
                  <TableCell>{producto.name}</TableCell>
                  <TableCell>{producto.genericprice}</TableCell>
                  {clients.map((cliente) => (
                    <TableCell key={cliente.id}>
                      <Input
                        type="number"
                        value={pricesClient[cliente.id]?.[producto.id] || producto.genericprice}
                        onChange={(e) =>
                          handleCambiarPrecioClient(cliente.id, producto.id, Number.parseFloat(e.target.value))
                        }
                      />
                    </TableCell>
                  ))
                  }
                  
                  <TableCell>
                    <Button variant="destructive" size="sm" onClick={() => handleEliminarProduct(producto.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AuthProvider>
  )
}

