import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

const ORG_ID = 'org_demo_001'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const customer = await db.customer.update({
      where: { id, organizationId: ORG_ID },
      data: { name: body.name, email: body.email || null, phone: body.phone || null, address: body.address || null },
    })
    return NextResponse.json(customer)
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengupdate pelanggan' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.customer.delete({ where: { id, organizationId: ORG_ID } })
    return NextResponse.json({ message: 'Pelanggan berhasil dihapus' })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus pelanggan' }, { status: 500 })
  }
}
