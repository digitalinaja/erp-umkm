import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

const ORG_ID = 'org_demo_001'

// Status yang mempengaruhi stok (barang masuk)
const STOCK_AFFECTING_STATUSES = ['confirmed', 'completed']

export async function GET() {
  try {
    const sales = await db.salesOrder.findMany({
      where: { organizationId: ORG_ID },
      include: { customer: true, items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(sales)
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data penjualan' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const totalAmount = body.items.reduce((sum: number, item: { total: number }) => sum + item.total, 0)
    const status = body.status || 'draft'

    // Jika langsung confirmed/completed, kurangi stok
    if (STOCK_AFFECTING_STATUSES.includes(status)) {
      for (const item of body.items) {
        await db.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      }
    }

    const salesOrder = await db.salesOrder.create({
      data: {
        orderNumber: body.orderNumber,
        customerId: body.customerId,
        status,
        totalAmount,
        notes: body.notes || null,
        organizationId: ORG_ID,
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

    // Buat transaksi keuangan otomatis jika completed
    if (status === 'completed') {
      await db.transaction.create({
        data: {
          type: 'income',
          category: 'Penjualan',
          amount: totalAmount,
          description: `Penjualan ${body.orderNumber}`,
          date: new Date(),
          organizationId: ORG_ID,
        },
      })
    }

    return NextResponse.json(salesOrder)
  } catch (error) {
    console.error('Sales create error:', error)
    return NextResponse.json({ error: 'Gagal membuat pesanan penjualan' }, { status: 500 })
  }
}
