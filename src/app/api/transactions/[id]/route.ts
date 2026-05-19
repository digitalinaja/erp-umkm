import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

const ORG_ID = 'org_demo_001'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const transaction = await db.transaction.update({
      where: { id, organizationId: ORG_ID },
      data: {
        type: body.type,
        category: body.category,
        amount: body.amount,
        description: body.description || null,
        date: new Date(body.date),
      },
    })
    return NextResponse.json(transaction)
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengupdate transaksi' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.transaction.delete({ where: { id, organizationId: ORG_ID } })
    return NextResponse.json({ message: 'Transaksi berhasil dihapus' })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus transaksi' }, { status: 500 })
  }
}
