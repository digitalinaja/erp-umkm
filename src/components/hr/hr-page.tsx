'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, UserCog, Pencil, Trash2 } from 'lucide-react'
import { formatRupiah, formatShortDate } from '@/lib/format'
import { useToast } from '@/hooks/use-toast'

interface Employee {
  id: string
  name: string
  email: string | null
  phone: string | null
  position: string | null
  salary: number
  joinDate: string | null
  status: string
}

interface EmployeeForm {
  name: string
  email: string
  phone: string
  position: string
  salary: string
  joinDate: string
  status: string
}

const emptyForm: EmployeeForm = {
  name: '',
  email: '',
  phone: '',
  position: '',
  salary: '0',
  joinDate: '',
  status: 'active',
}

export function HrPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<EmployeeForm>(emptyForm)
  const { toast } = useToast()

  const loadData = async () => {
    try {
      const res = await fetch('/api/employees')
      const data = await res.json()
      setEmployees(data)
    } catch {
      toast({ title: 'Gagal memuat data', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const openCreate = () => {
    setEditId(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (emp: Employee) => {
    setEditId(emp.id)
    setForm({
      name: emp.name,
      email: emp.email || '',
      phone: emp.phone || '',
      position: emp.position || '',
      salary: emp.salary.toString(),
      joinDate: emp.joinDate ? emp.joinDate.split('T')[0] : '',
      status: emp.status,
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const body = {
      name: form.name,
      email: form.email || null,
      phone: form.phone || null,
      position: form.position || null,
      salary: parseFloat(form.salary) || 0,
      joinDate: form.joinDate || null,
      status: form.status,
    }

    try {
      const url = editId ? `/api/employees/${editId}` : '/api/employees'
      const method = editId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        toast({ title: editId ? 'Karyawan berhasil diperbarui' : 'Karyawan berhasil ditambahkan' })
        setDialogOpen(false)
        loadData()
      } else {
        toast({ title: 'Gagal menyimpan data karyawan', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Gagal menyimpan data karyawan', variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus karyawan ini?')) return
    try {
      const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: 'Karyawan berhasil dihapus' })
        loadData()
      }
    } catch {
      toast({ title: 'Gagal menghapus karyawan', variant: 'destructive' })
    }
  }

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
          <h1 className="text-2xl font-bold">Karyawan</h1>
          <p className="text-muted-foreground">Kelola data karyawan Anda</p>
        </div>
        <Button onClick={openCreate} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="mr-2 h-4 w-4" />
          Tambah Karyawan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-emerald-600" />
            Daftar Karyawan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telepon</TableHead>
                  <TableHead>Jabatan</TableHead>
                  <TableHead className="text-right">Gaji</TableHead>
                  <TableHead>Tanggal Masuk</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <UserCog className="h-8 w-8" />
                        <p>Belum ada data karyawan</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  employees.map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell className="font-medium">{emp.name}</TableCell>
                      <TableCell>{emp.email || '-'}</TableCell>
                      <TableCell>{emp.phone || '-'}</TableCell>
                      <TableCell>{emp.position || '-'}</TableCell>
                      <TableCell className="text-right">{formatRupiah(emp.salary)}</TableCell>
                      <TableCell>{emp.joinDate ? formatShortDate(emp.joinDate) : '-'}</TableCell>
                      <TableCell>
                        <Badge
                          variant={emp.status === 'active' ? 'default' : 'secondary'}
                          className={emp.status === 'active' ? 'bg-emerald-500 hover:bg-emerald-500' : ''}
                        >
                          {emp.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(emp)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(emp.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit Karyawan' : 'Tambah Karyawan'}</DialogTitle>
            <DialogDescription>
              {editId ? 'Perbarui informasi karyawan' : 'Isi data karyawan baru'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nama *</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Telepon</Label>
                  <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="position">Jabatan</Label>
                <Input id="position" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder="Kasir, Gudang, dll." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="salary">Gaji (Rp)</Label>
                  <Input id="salary" type="number" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="joinDate">Tanggal Masuk</Label>
                  <Input id="joinDate" type="date" value={form.joinDate} onChange={(e) => setForm({ ...form, joinDate: e.target.value })} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Tidak Aktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                {editId ? 'Perbarui' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
