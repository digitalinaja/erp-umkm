'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Wallet, TrendingUp, TrendingDown, Trash2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatRupiah, formatShortDate } from '@/lib/format'
import { TransactionForm } from './transaction-form'
import { useToast } from '@/hooks/use-toast'

interface Transaction {
  id: string
  type: string
  category: string
  amount: number
  description: string | null
  date: string
}

export function FinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const { toast } = useToast()

  const loadData = async () => {
    try {
      const res = await fetch('/api/transactions')
      const data = await res.json()
      setTransactions(data)
    } catch {
      toast({ title: 'Gagal memuat data', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) return
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: 'Transaksi berhasil dihapus' })
        loadData()
      }
    } catch {
      toast({ title: 'Gagal menghapus transaksi', variant: 'destructive' })
    }
  }

  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
  const balance = totalIncome - totalExpense

  const filtered = activeTab === 'all'
    ? transactions
    : activeTab === 'income'
      ? transactions.filter((t) => t.type === 'income')
      : transactions.filter((t) => t.type === 'expense')

  // Monthly chart data
  const monthlyData: Record<string, { month: string; income: number; expense: number }> = {}
  transactions.forEach((t) => {
    const d = new Date(t.date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    if (!monthlyData[key]) {
      monthlyData[key] = { month: monthNames[d.getMonth()], income: 0, expense: 0 }
    }
    if (t.type === 'income') monthlyData[key].income += t.amount
    else monthlyData[key].expense += t.amount
  })
  const chartData = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month))

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Keuangan</h1>
          <p className="text-muted-foreground">Lacak pemasukan dan pengeluaran</p>
        </div>
        <Button onClick={() => setFormOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="mr-2 h-4 w-4" />
          Tambah Transaksi
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pemasukan</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{formatRupiah(totalIncome)}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatRupiah(totalExpense)}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <Wallet className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatRupiah(balance)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Grafik Keuangan</CardTitle>
            <CardDescription>Pemasukan vs pengeluaran per bulan</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => formatRupiah(value)} />
                <Bar dataKey="income" name="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Transaction Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-emerald-600" />
            Daftar Transaksi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">Semua</TabsTrigger>
              <TabsTrigger value="income">Pemasukan</TabsTrigger>
              <TabsTrigger value="expense">Pengeluaran</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab} className="mt-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead className="text-right">Jumlah</TableHead>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Wallet className="h-8 w-8" />
                            <p>Belum ada transaksi</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell>{formatShortDate(t.date)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={t.type === 'income' ? 'default' : 'destructive'}
                              className={t.type === 'income' ? 'bg-emerald-500 hover:bg-emerald-500' : ''}
                            >
                              {t.type === 'income' ? 'Masuk' : 'Keluar'}
                            </Badge>
                          </TableCell>
                          <TableCell>{t.category}</TableCell>
                          <TableCell className={`text-right font-medium ${t.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                            {t.type === 'income' ? '+' : '-'}{formatRupiah(t.amount)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{t.description || '-'}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <TransactionForm open={formOpen} onOpenChange={setFormOpen} onSuccess={loadData} />
    </div>
  )
}
