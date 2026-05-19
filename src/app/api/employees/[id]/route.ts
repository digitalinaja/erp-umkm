import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

const ORG_ID = 'org_demo_001'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const employee = await db.employee.update({
      where: { id, organizationId: ORG_ID },
      data: {
        name: body.name,
        email: body.email || null,
        phone: body.phone || null,
        position: body.position || null,
        salary: body.salary,
        joinDate: body.joinDate ? new Date(body.joinDate) : null,
        status: body.status,
      },
    })
    return NextResponse.json(employee)
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengupdate karyawan' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.employee.delete({ where: { id, organizationId: ORG_ID } })
    return NextResponse.json({ message: 'Karyawan berhasil dihapus' })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus karyawan' }, { status: 500 })
  }
}
