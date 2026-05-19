import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

const ORG_ID = 'org_demo_001'

export async function GET() {
  try {
    // Get total sales amount
    const salesOrders = await db.salesOrder.findMany({
      where: { organizationId: ORG_ID, status: { in: ['completed', 'confirmed', 'shipped'] } },
    })
    const totalSales = salesOrders.reduce((sum, order) => sum + order.totalAmount, 0)

    // Get total expenses
    const expenseTransactions = await db.transaction.findMany({
      where: { organizationId: ORG_ID, type: 'expense' },
    })
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0)

    // Get total income
    const incomeTransactions = await db.transaction.findMany({
      where: { organizationId: ORG_ID, type: 'income' },
    })
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0)

    // Get product count
    const productCount = await db.product.count({
      where: { organizationId: ORG_ID },
    })

    // Get customer count
    const customerCount = await db.customer.count({
      where: { organizationId: ORG_ID },
    })

    // Low stock products
    const lowStockProducts = await db.product.findMany({
      where: { organizationId: ORG_ID, stock: { lte: 10 } },
      include: { category: true },
    })

    // Recent sales orders
    const recentSales = await db.salesOrder.findMany({
      where: { organizationId: ORG_ID },
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    // Monthly sales data (last 6 months)
    const now = new Date()
    const monthlySales = []
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      const monthSales = await db.salesOrder.findMany({
        where: {
          organizationId: ORG_ID,
          status: { in: ['completed', 'confirmed', 'shipped'] },
          createdAt: { gte: month, lte: monthEnd },
        },
      })
      const monthIncome = await db.transaction.findMany({
        where: {
          organizationId: ORG_ID,
          type: 'income',
          date: { gte: month, lte: monthEnd },
        },
      })
      const monthExpense = await db.transaction.findMany({
        where: {
          organizationId: ORG_ID,
          type: 'expense',
          date: { gte: month, lte: monthEnd },
        },
      })
      
      monthlySales.push({
        month: monthNames[month.getMonth()],
        sales: monthSales.reduce((sum, o) => sum + o.totalAmount, 0),
        income: monthIncome.reduce((sum, t) => sum + t.amount, 0),
        expense: monthExpense.reduce((sum, t) => sum + t.amount, 0),
      })
    }

    // Expense by category
    const expenseByCategory = await db.transaction.groupBy({
      by: ['category'],
      where: { organizationId: ORG_ID, type: 'expense' },
      _sum: { amount: true },
    })

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
