// Mejoras implementadas en el código existente:
// 1. Animaciones al cargar elementos y gráficos.
// 2. Mejora en la interfaz del selector de clientes (indicadores visuales).
// 3. Mejoras de diseño para un aspecto más atractivo y ordenado.

"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getTranslation, Lang } from "../components/Lang";
import { useAuth } from "../contexts/AuthContext";
import type { Bill, Client, Deposit } from "../lib/db/interfaces";

export default function StatisticsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { key, api } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [clientsData, billsData, depositsData] = await Promise.all([
          api.getClients(),
          api.getBills(),
          api.getDeposits(),
        ]);
        setClients(clientsData);
        setBills(billsData);
        setDeposits(depositsData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(getTranslation("errorFetchingData"));
        setLoading(false);
      }
    };

    fetchData();
  }, [api, key]);

  const getClientData = () => {
    if (!selectedClient) return [];

    const clientBills = bills.filter((b) => b.clientid === selectedClient);
    const clientDeposits = deposits.filter((d) => d.clientid === selectedClient);

    const dataByMonth: { [key: string]: { ventas: number; deposits: number } } = {};

    clientBills.forEach((bill) => {
      const date = new Date(bill.date);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      const total = Object.values(bill.products).reduce(
        (acc, products) =>
          acc + products.reduce((sum, product) => sum + product.amount * product.price, 0),
        0
      );
      if (!dataByMonth[monthYear]) dataByMonth[monthYear] = { ventas: 0, deposits: 0 };
      dataByMonth[monthYear].ventas += total;
    });

    clientDeposits.forEach((deposit) => {
      const date = new Date(deposit.date);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      if (!dataByMonth[monthYear]) dataByMonth[monthYear] = { ventas: 0, deposits: 0 };
      dataByMonth[monthYear].deposits += deposit.amount;
    });

    return Object.entries(dataByMonth).map(([monthYear, values]) => ({
      mes: monthYear,
      ...values,
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="sr-only">
          <Lang text="loadingData" />
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Lang text="error" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h1 className="text-2xl font-bold">
        <Lang text="statistics" />
      </h1>
      <div className="space-y-2">
        <Label htmlFor="cliente">
          <Lang text="selectClient" />
        </Label>
        <Select
          onValueChange={(value) => setSelectedClient(value)}
          value={selectedClient || undefined}
        >
          <SelectTrigger className="hover:bg-gray-100">
            <SelectValue placeholder={<Lang text="selectClientPlaceholder" />} />
          </SelectTrigger>
          <SelectContent>
            {clients.map((client) => (
              <SelectItem
                key={client.id}
                value={client.id}
                className="hover:bg-gray-200 transition-colors"
              >
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {selectedClient && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="overflow-x-auto">
            <CardHeader>
              <CardTitle>
                <Lang text="salesAndDepositsByMonth" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400} className="mt-4">
                <BarChart data={getClientData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="ventas" fill="#8884d8" name={<Lang text="sales" />} />
                  <Bar dataKey="deposits" fill="#82ca9d" name={<Lang text="deposits" />} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
