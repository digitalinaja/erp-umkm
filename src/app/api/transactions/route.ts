import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

const ORG_ID = 'org_demo_001'

export async function GET() {
  try {
    const transactions = await db.transaction.findMany({
      where: { organizationId: ORG_ID },
      orderBy: { date: 'desc' },
    })
    return NextResponse.json(transactions)
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data transaksi' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const transaction = await db.transaction.create({
      data: {
        type: body.type,
        category: body.category,
        amount: body.amount,
        description: body.description || null,
        date: new Date(body.date),
        organizationId: ORG_ID,
      },
    })
    return NextResponse.json(transaction)
  } catch (error) {
    return NextResponse.json({ error: 'Gagal membuat transaksi' }, { status: 500 })
  }
}
