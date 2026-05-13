import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

const ORG_ID = 'org_demo_001'

export async function GET() {
  try {
    const customers = await db.customer.findMany({
      where: { organizationId: ORG_ID },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(customers)
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data pelanggan' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const customer = await db.customer.create({
      data: {
        name: body.name,
        email: body.email || null,
        phone: body.phone || null,
        address: body.address || null,
        organizationId: ORG_ID,
      },
    })
    return NextResponse.json(customer)
  } catch (error) {
    return NextResponse.json({ error: 'Gagal membuat pelanggan' }, { status: 500 })
  }
}
