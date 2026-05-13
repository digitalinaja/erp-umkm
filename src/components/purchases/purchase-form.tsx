'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2 } from 'lucide-react'
import { formatRupiah } from '@/lib/format'
import { useToast } from '@/hooks/use-toast'

interface Supplier {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
  cost: number
}

interface LineItem {
  productId: string
  quantity: number
  price: number
  total: number
}

interface PurchaseFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function PurchaseForm({ open, onOpenChange, onSuccess }: PurchaseFormProps) {
  const [loading, setLoading] = useState(false)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [supplierId, setSupplierId] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<LineItem[]>([{ productId: '', quantity: 1, price: 0, total: 0 }])
  const { toast } = useToast()

  useEffect(() => {
    Promise.all([fetch('/api/suppliers').then((r) => r.json()), fetch('/api/products').then((r) => r.json())]).then(
      ([suppliersData, productsData]) => {
        setSuppliers(suppliersData)
        setProducts(productsData)
      }
    )
  }, [])

  useEffect(() => {
    if (open) {
      setSupplierId('')
      setNotes('')
      setItems([{ productId: '', quantity: 1, price: 0, total: 0 }])
    }
  }, [open])

  const addItem = () => {
    setItems([...items, { productId: '', quantity: 1, price: 0, total: 0 }])
  }

  const removeItem = (index: number) => {
    if (items.length === 1) return
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
    const newItems = [...items]
    if (field === 'productId') {
      const product = products.find((p) => p.id === value)
      newItems[index] = {
        ...newItems[index],
        productId: value as string,
        price: product?.cost || 0,
        total: (product?.cost || 0) * newItems[index].quantity,
      }
    } else if (field === 'quantity') {
      newItems[index] = {
        ...newItems[index],
        quantity: value as number,
        total: newItems[index].price * (value as number),
      }
    } else if (field === 'price') {
      newItems[index] = {
        ...newItems[index],
        price: value as number,
        total: (value as number) * newItems[index].quantity,
      }
    }
    setItems(newItems)
  }

  const totalAmount = items.reduce((sum, item) => sum + item.total, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supplierId) {
      toast({ title: 'Pilih supplier terlebih dahulu', variant: 'destructive' })
      return
    }
    if (items.some((item) => !item.productId)) {
      toast({ title: 'Pilih produk untuk semua item', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      const orderNumber = `PO-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`
      const body = {
        orderNumber,
        supplierId,
        status: 'draft',
        notes: notes || null,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
        })),
      }

      const res = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        toast({ title: 'Pesanan pembelian berhasil dibuat' })
        onOpenChange(false)
        onSuccess()
      } else {
        toast({ title: 'Gagal membuat pesanan', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Gagal membuat pesanan', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Buat Pesanan Pembelian</DialogTitle>
          <DialogDescription>Buat pesanan pembelian baru dari supplier</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Supplier *</Label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Item Pesanan</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="mr-1 h-3 w-3" /> Tambah Item
                </Button>
              </div>
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    {index === 0 && <Label className="text-xs text-muted-foreground">Produk</Label>}
                    <Select
                      value={item.productId}
                      onValueChange={(v) => updateItem(index, 'productId', v)}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Pilih produk" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    {index === 0 && <Label className="text-xs text-muted-foreground">Qty</Label>}
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                      className="h-9"
                    />
                  </div>
                  <div className="col-span-2">
                    {index === 0 && <Label className="text-xs text-muted-foreground">Harga</Label>}
                    <Input
                      type="number"
                      value={item.price}
                      onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                      className="h-9"
                    />
                  </div>
                  <div className="col-span-2">
                    {index === 0 && <Label className="text-xs text-muted-foreground">Total</Label>}
                    <div className="h-9 flex items-center text-sm font-medium">{formatRupiah(item.total)}</div>
                  </div>
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                      className="h-9 w-9"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
              <div className="flex justify-end pt-2 border-t">
                <div className="text-right">
                  <span className="text-sm text-muted-foreground">Total: </span>
                  <span className="text-lg font-bold">{formatRupiah(totalAmount)}</span>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Catatan</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catatan pesanan (opsional)"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
              {loading ? 'Menyimpan...' : 'Buat Pesanan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
