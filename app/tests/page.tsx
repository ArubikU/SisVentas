'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

type TestResult = {
  name: string
  status: 'success' | 'error'
  message: string
}

export default function TestPage() {
  const [results, setResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(false)
  const { api } = useAuth()

  const runTests = async () => {
    setLoading(true)
    setResults([])

    const tests = [
      { name: 'Get Users', fn: api.getUsers },
      { name: 'Get Bills', fn: api.getBills },
      { name: 'Get Deposits', fn: api.getDeposits },
      { name: 'Get Clients', fn: api.getClients },
      { name: 'Get Products', fn: api.getProducts },
      { name: 'Search Bills', fn: () => api.searchBills('test') },
      { name: 'Search Deposits', fn: () => api.searchDeposits('test') },
      { name: 'Get Bills by Date Range', fn: () => api.getBillsByDateRange(new Date('2023-01-01'), new Date()) },
      { name: 'Get Deposits by Date Range', fn: () => api.getDepositsByDateRange(new Date('2023-01-01'), new Date()) },
    ]

    for (const test of tests) {
      try {
        await test.fn()
        setResults(prev => [...prev, { name: test.name, status: 'success', message: 'Test passed successfully' }])
      } catch (error) {
        setResults(prev => [...prev, { name: test.name, status: 'error', message: error instanceof Error ? error.message : String(error) }])
      }
    }

    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">API Tests</h1>
      <Button onClick={runTests} disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Running Tests...
          </>
        ) : (
          'Run Tests'
        )}
      </Button>
      <div className="grid gap-4 md:grid-cols-2">
        {results.map((result, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className={result.status === 'success' ? 'text-green-500' : 'text-red-500'}>
                {result.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{result.message}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

