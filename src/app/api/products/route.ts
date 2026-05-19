import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

const ORG_ID = 'org_demo_001'

export async function GET() {
  try {
    const products = await db.product.findMany({
      where: { organizationId: ORG_ID },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(products)
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data produk' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const product = await db.product.create({
      data: {
        name: body.name,
        sku: body.sku || null,
        description: body.description || null,
        price: body.price,
        cost: body.cost || 0,
        stock: body.stock || 0,
        minStock: body.minStock || 0,
        unit: body.unit || 'pcs',
        categoryId: body.categoryId || null,
        organizationId: ORG_ID,
      },
      include: { category: true },
    })
    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json({ error: 'Gagal membuat produk' }, { status: 500 })
  }
}
