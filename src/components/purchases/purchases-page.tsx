'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Truck, Trash2 } from 'lucide-react'
import { formatRupiah, formatShortDate } from '@/lib/format'
import { PurchaseForm } from './purchase-form'
import { useToast } from '@/hooks/use-toast'

interface PurchaseOrder {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  notes: string | null
  createdAt: string
  supplier: { id: string; name: string }
  items: Array<{
    id: string
    productId: string
    quantity: number
    price: number
    total: number
    product: { id: string; name: string }
  }>
}

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
  draft: { label: 'Draft', variant: 'secondary', className: '' },
  confirmed: { label: 'Dikonfirmasi', variant: 'default', className: 'bg-blue-500 hover:bg-blue-500' },
  received: { label: 'Diterima', variant: 'default', className: 'bg-amber-500 hover:bg-amber-500' },
  completed: { label: 'Selesai', variant: 'default', className: 'bg-emerald-500 hover:bg-emerald-500' },
  cancelled: { label: 'Dibatalkan', variant: 'destructive', className: '' },
}

export function PurchasesPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const { toast } = useToast()

  const loadData = async () => {
    try {
      const res = await fetch('/api/purchases')
      const data = await res.json()
      setOrders(data)
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
    if (!confirm('Apakah Anda yakin ingin menghapus pesanan ini?')) return
    try {
      const res = await fetch(`/api/purchases/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: 'Pesanan berhasil dihapus' })
        loadData()
      }
    } catch {
      toast({ title: 'Gagal menghapus pesanan', variant: 'destructive' })
    }
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const order = orders.find((o) => o.id === orderId)
      if (!order) return
      const res = await fetch(`/api/purchases/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: order.supplier.id,
          status: newStatus,
          notes: order.notes,
          items: order.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            total: item.total,
          })),
        }),
      })
      if (res.ok) {
        toast({ title: 'Status pesanan diperbarui' })
        loadData()
      }
    } catch {
      toast({ title: 'Gagal mengubah status', variant: 'destructive' })
    }
  }

  const filtered = statusFilter === 'all' ? orders : orders.filter((o) => o.status === statusFilter)

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Pembelian</h1>
          <p className="text-muted-foreground">Kelola pesanan pembelian dari supplier</p>
        </div>
        <Button
          onClick={() => setFormOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Buat Pesanan
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-emerald-600" />
              Pesanan Pembelian
            </CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="confirmed">Dikonfirmasi</SelectItem>
                <SelectItem value="received">Diterima</SelectItem>
                <SelectItem value="completed">Selesai</SelectItem>
                <SelectItem value="cancelled">Dibatalkan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Order</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Truck className="h-8 w-8" />
                        <p>Belum ada pesanan pembelian</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((order) => {
                    const statusInfo = STATUS_MAP[order.status] || STATUS_MAP.draft
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                        <TableCell>{order.supplier.name}</TableCell>
                        <TableCell>{formatShortDate(order.createdAt)}</TableCell>
                        <TableCell className="text-right">{formatRupiah(order.totalAmount)}</TableCell>
                        <TableCell>
                          <Select
                            value={order.status}
                            onValueChange={(v) => handleStatusChange(order.id, v)}
                          >
                            <SelectTrigger className="w-32 h-7">
                              <Badge variant={statusInfo.variant} className={statusInfo.className}>
                                {statusInfo.label}
                              </Badge>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="confirmed">Dikonfirmasi</SelectItem>
                              <SelectItem value="received">Diterima</SelectItem>
                              <SelectItem value="completed">Selesai</SelectItem>
                              <SelectItem value="cancelled">Dibatalkan</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(order.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <PurchaseForm open={formOpen} onOpenChange={setFormOpen} onSuccess={loadData} />
    </div>
  )
}
