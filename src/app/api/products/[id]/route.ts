import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

const ORG_ID = 'org_demo_001'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const product = await db.product.findUnique({
      where: { id, organizationId: ORG_ID },
      include: { category: true },
    })
    if (!product) return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 })
    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data produk' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const product = await db.product.update({
      where: { id, organizationId: ORG_ID },
      data: {
        name: body.name,
        sku: body.sku || null,
        description: body.description || null,
        price: body.price,
        cost: body.cost,
        stock: body.stock,
        minStock: body.minStock,
        unit: body.unit,
        categoryId: body.categoryId || null,
      },
      include: { category: true },
    })
    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengupdate produk' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.product.delete({ where: { id, organizationId: ORG_ID } })
    return NextResponse.json({ message: 'Produk berhasil dihapus' })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus produk' }, { status: 500 })
  }
}
