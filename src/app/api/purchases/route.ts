import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

const ORG_ID = 'org_demo_001'

export async function GET() {
  try {
    const purchases = await db.purchaseOrder.findMany({
      where: { organizationId: ORG_ID },
      include: { supplier: true, items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(purchases)
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data pembelian' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const totalAmount = body.items.reduce((sum: number, item: { total: number }) => sum + item.total, 0)
    
    const purchaseOrder = await db.purchaseOrder.create({
      data: {
        orderNumber: body.orderNumber,
        supplierId: body.supplierId,
        status: body.status || 'draft',
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
      include: { supplier: true, items: { include: { product: true } } },
    })
    return NextResponse.json(purchaseOrder)
  } catch (error) {
    console.error('Purchase create error:', error)
    return NextResponse.json({ error: 'Gagal membuat pesanan pembelian' }, { status: 500 })
  }
}
