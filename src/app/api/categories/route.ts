import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

const ORG_ID = 'org_demo_001'

export async function GET() {
  try {
    const categories = await db.category.findMany({
      where: { organizationId: ORG_ID },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(categories)
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data kategori' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const category = await db.category.create({
      data: {
        name: body.name,
        description: body.description || null,
        organizationId: ORG_ID,
      },
    })
    return NextResponse.json(category)
  } catch (error) {
    return NextResponse.json({ error: 'Gagal membuat kategori' }, { status: 500 })
  }
}
