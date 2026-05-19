import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

const ORG_ID = 'org_demo_001'

// Status yang mempengaruhi stok (barang keluar)
const STOCK_AFFECTING_STATUSES = ['confirmed', 'shipped', 'completed']

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const salesOrder = await db.salesOrder.findUnique({
      where: { id, organizationId: ORG_ID },
      include: { customer: true, items: { include: { product: true } } },
    })
    if (!salesOrder) return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 })
    return NextResponse.json(salesOrder)
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data pesanan' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const newStatus = body.status

    // Ambil data lama sebelum update
    const oldOrder = await db.salesOrder.findUnique({
      where: { id, organizationId: ORG_ID },
      include: { items: true },
    })

    if (!oldOrder) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 })
    }

    const oldStatusAffectsStock = STOCK_AFFECTING_STATUSES.includes(oldOrder.status)
    const newStatusAffectsStock = STOCK_AFFECTING_STATUSES.includes(newStatus)

    // === LOGIKA PERUBAHAN STOK ===
    // Kasus 1: Stok belum terpengaruh → sekarang terpengaruh (draft/cancelled → confirmed/shipped/completed)
    if (!oldStatusAffectsStock && newStatusAffectsStock) {
      for (const item of body.items) {
        await db.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      }
    }
    // Kasus 2: Stok sudah terpengaruh → sekarang tidak lagi (confirmed/shipped/completed → cancelled/draft)
    else if (oldStatusAffectsStock && !newStatusAffectsStock) {
      for (const item of body.items) {
        await db.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        })
      }
    }
    // Kasus 3: Keduanya mempengaruhi stok tapi item berubah (recreate items)
    else if (oldStatusAffectsStock && newStatusAffectsStock) {
      // Kembalikan stok lama dulu
      for (const oldItem of oldOrder.items) {
        await db.product.update({
          where: { id: oldItem.productId },
          data: { stock: { increment: oldItem.quantity } },
        })
      }
      // Potong stok baru
      for (const newItem of body.items) {
        await db.product.update({
          where: { id: newItem.productId },
          data: { stock: { decrement: newItem.quantity } },
        })
      }
    }

    // === BUAT TRANSAKSI KEUANGAN OTOMATIS saat selesai ===
    if (newStatus === 'completed' && oldOrder.status !== 'completed') {
      const totalAmount = body.items.reduce((sum: number, item: { total: number }) => sum + item.total, 0)
      await db.transaction.create({
        data: {
          type: 'income',
          category: 'Penjualan',
          amount: totalAmount,
          description: `Penjualan ${body.orderNumber || oldOrder.orderNumber}`,
          date: new Date(),
          organizationId: ORG_ID,
        },
      })
    }
    // Jika dibatalkan dari completed, hapus transaksi keuangan terkait
    else if (newStatus === 'cancelled' && oldOrder.status === 'completed') {
      const orderNumber = oldOrder.orderNumber
      await db.transaction.deleteMany({
        where: {
          organizationId: ORG_ID,
          type: 'income',
          category: 'Penjualan',
          description: { contains: orderNumber },
        },
      })
    }

    // Delete existing items and recreate
    await db.salesOrderItem.deleteMany({ where: { salesOrderId: id } })

    const totalAmount = body.items.reduce((sum: number, item: { total: number }) => sum + item.total, 0)

    const salesOrder = await db.salesOrder.update({
      where: { id, organizationId: ORG_ID },
      data: {
        customerId: body.customerId,
        status: newStatus,
        totalAmount,
        notes: body.notes || null,
        items: {
          create: body.items.map((item: { productId: string; quantity: number; price: number; total: number }) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            total: item.total,
          })),
        },
      },
      include: { customer: true, items: { include: { product: true } } },
    })
    return NextResponse.json(salesOrder)
  } catch (error) {
    console.error('Sales update error:', error)
    return NextResponse.json({ error: 'Gagal mengupdate pesanan' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Cek apakah stok sudah terpengaruh, kembalikan jika ya
    const order = await db.salesOrder.findUnique({
      where: { id, organizationId: ORG_ID },
      include: { items: true },
    })

    if (order && STOCK_AFFECTING_STATUSES.includes(order.status)) {
      for (const item of order.items) {
        await db.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        })
      }
    }

    // Hapus transaksi keuangan terkait jika ada
    if (order && order.status === 'completed') {
      await db.transaction.deleteMany({
        where: {
          organizationId: ORG_ID,
          type: 'income',
          category: 'Penjualan',
          description: { contains: order.orderNumber },
        },
      })
    }

    await db.salesOrderItem.deleteMany({ where: { salesOrderId: id } })
    await db.salesOrder.delete({ where: { id, organizationId: ORG_ID } })
    return NextResponse.json({ message: 'Pesanan berhasil dihapus' })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus pesanan' }, { status: 500 })
  }
}
