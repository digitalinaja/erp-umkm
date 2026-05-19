import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

const ORG_ID = 'org_demo_001'

export async function GET() {
  try {
    const suppliers = await db.supplier.findMany({
      where: { organizationId: ORG_ID },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(suppliers)
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data supplier' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supplier = await db.supplier.create({
      data: {
        name: body.name,
        email: body.email || null,
        phone: body.phone || null,
        address: body.address || null,
        organizationId: ORG_ID,
      },
    })
    return NextResponse.json(supplier)
  } catch (error) {
    return NextResponse.json({ error: 'Gagal membuat supplier' }, { status: 500 })
  }
}
