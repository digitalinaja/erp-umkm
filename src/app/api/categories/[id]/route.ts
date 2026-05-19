import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

const ORG_ID = 'org_demo_001'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const category = await db.category.update({
      where: { id, organizationId: ORG_ID },
      data: { name: body.name, description: body.description || null },
    })
    return NextResponse.json(category)
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengupdate kategori' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.category.delete({ where: { id, organizationId: ORG_ID } })
    return NextResponse.json({ message: 'Kategori berhasil dihapus' })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus kategori' }, { status: 500 })
  }
}
