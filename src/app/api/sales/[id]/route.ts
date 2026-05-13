import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

const ORG_ID = 'org_demo_001'

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
    
    // Delete existing items and recreate
    await db.salesOrderItem.deleteMany({ where: { salesOrderId: id } })
    
    const totalAmount = body.items.reduce((sum: number, item: { total: number }) => sum + item.total, 0)
    
    const salesOrder = await db.salesOrder.update({
      where: { id, organizationId: ORG_ID },
      data: {
        customerId: body.customerId,
        status: body.status,
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
    return NextResponse.json({ error: 'Gagal mengupdate pesanan' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.salesOrderItem.deleteMany({ where: { salesOrderId: id } })
    await db.salesOrder.delete({ where: { id, organizationId: ORG_ID } })
    return NextResponse.json({ message: 'Pesanan berhasil dihapus' })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus pesanan' }, { status: 500 })
  }
}
