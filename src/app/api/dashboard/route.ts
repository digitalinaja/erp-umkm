import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

const ORG_ID = 'org_demo_001'

export async function GET() {
  try {
    const now = new Date()
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

    // All queries in parallel — 10 queries in 1 round-trip instead of 26 sequential
    const [
      salesAgg,
      expenseAgg,
      incomeAgg,
      productCount,
      customerCount,
      lowStockProducts,
      recentSales,
      salesByMonth,
      incomeByMonth,
      expenseByMonth,
      expenseByCategory,
    ] = await Promise.all([
      db.salesOrder.aggregate({
        where: { organizationId: ORG_ID, status: { in: ['completed', 'confirmed', 'shipped'] } },
        _sum: { totalAmount: true },
      }),
      db.transaction.aggregate({
        where: { organizationId: ORG_ID, type: 'expense' },
        _sum: { amount: true },
      }),
      db.transaction.aggregate({
        where: { organizationId: ORG_ID, type: 'income' },
        _sum: { amount: true },
      }),
      db.product.count({ where: { organizationId: ORG_ID } }),
      db.customer.count({ where: { organizationId: ORG_ID } }),
      db.product.findMany({
        where: { organizationId: ORG_ID, stock: { lte: 10 } },
        include: { category: true },
      }),
      db.salesOrder.findMany({
        where: { organizationId: ORG_ID },
        include: { customer: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      db.salesOrder.findMany({
        where: {
          organizationId: ORG_ID,
          status: { in: ['completed', 'confirmed', 'shipped'] },
          createdAt: { gte: sixMonthsAgo },
        },
        select: { totalAmount: true, createdAt: true },
      }),
      db.transaction.findMany({
        where: { organizationId: ORG_ID, type: 'income', date: { gte: sixMonthsAgo } },
        select: { amount: true, date: true },
      }),
      db.transaction.findMany({
        where: { organizationId: ORG_ID, type: 'expense', date: { gte: sixMonthsAgo } },
        select: { amount: true, date: true },
      }),
      db.transaction.groupBy({
        by: ['category'],
        where: { organizationId: ORG_ID, type: 'expense' },
        _sum: { amount: true },
      }),
    ])

    const totalSales = salesAgg._sum.totalAmount || 0
    const totalExpenses = expenseAgg._sum.amount || 0
    const totalIncome = incomeAgg._sum.amount || 0

    // Build monthly data in-memory (no extra DB queries)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    const monthlySales = []

    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999)

      monthlySales.push({
        month: monthNames[monthStart.getMonth()],
        sales: salesByMonth
          .filter((o) => o.createdAt >= monthStart && o.createdAt <= monthEnd)
          .reduce((sum, o) => sum + o.totalAmount, 0),
        income: incomeByMonth
          .filter((t) => t.date >= monthStart && t.date <= monthEnd)
          .reduce((sum, t) => sum + t.amount, 0),
        expense: expenseByMonth
          .filter((t) => t.date >= monthStart && t.date <= monthEnd)
          .reduce((sum, t) => sum + t.amount, 0),
      })
    }

    const expenseCategoryData = expenseByCategory.map((item) => ({
      category: item.category,
      amount: item._sum.amount || 0,
    }))

    return NextResponse.json({
      totalSales,
      totalExpenses,
      totalIncome,
      balance: totalIncome - totalExpenses,
      productCount,
      customerCount,
      lowStockProducts,
      recentSales,
      monthlySales,
      expenseCategoryData,
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json({ error: 'Gagal mengambil data dashboard' }, { status: 500 })
  }
}
