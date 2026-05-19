import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

const ORG_ID = 'org_demo_001'

export async function GET() {
  try {
    const employees = await db.employee.findMany({
      where: { organizationId: ORG_ID },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(employees)
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data karyawan' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const employee = await db.employee.create({
      data: {
        name: body.name,
        email: body.email || null,
        phone: body.phone || null,
        position: body.position || null,
        salary: body.salary || 0,
        joinDate: body.joinDate ? new Date(body.joinDate) : null,
        status: body.status || 'active',
        organizationId: ORG_ID,
      },
    })
    return NextResponse.json(employee)
  } catch (error) {
    return NextResponse.json({ error: 'Gagal membuat karyawan' }, { status: 500 })
  }
}
