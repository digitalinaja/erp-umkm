import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// Hardcoded demo organization ID - will be set during seed
const ORG_ID = 'org_demo_001'

export async function POST() {
  try {
    // Check if already seeded
    const existing = await db.organization.findUnique({ where: { id: ORG_ID } })
    if (existing) {
      return NextResponse.json({ message: 'Data demo sudah ada' })
    }

    // Create organization
    const org = await db.organization.create({
      data: {
        id: ORG_ID,
        name: 'Toko Sejahtera',
        slug: 'toko-sejahtera',
        address: 'Jl. Merdeka No. 45, Jakarta Selatan',
        phone: '021-5551234',
        email: 'info@tokosejahtera.id',
        plan: 'pro',
      },
    })

    // Create admin user
    await db.user.create({
      data: {
        name: 'Admin Toko',
        email: 'admin@tokosejahtera.id',
        passwordHash: 'demo_hash',
        role: 'admin',
        organizationId: org.id,
      },
    })

    // Create categories
    const categories = await Promise.all([
      db.category.create({ data: { name: 'Makanan', description: 'Produk makanan dan camilan', organizationId: org.id } }),
      db.category.create({ data: { name: 'Minuman', description: 'Minuman ringan dan jus', organizationId: org.id } }),
      db.category.create({ data: { name: 'Alat Tulis', description: 'Perlengkapan kantor dan sekolah', organizationId: org.id } }),
      db.category.create({ data: { name: 'Elektronik', description: 'Aksesoris dan perangkat elektronik', organizationId: org.id } }),
    ])

    // Create products
    const products = await Promise.all([
      db.product.create({ data: { name: 'Keripik Singkong', sku: 'MKN-001', price: 15000, cost: 8000, stock: 120, minStock: 20, unit: 'bungkus', categoryId: categories[0].id, organizationId: org.id } }),
      db.product.create({ data: { name: 'Rendang Kemasan', sku: 'MKN-002', price: 45000, cost: 28000, stock: 50, minStock: 10, unit: 'kotak', categoryId: categories[0].id, organizationId: org.id } }),
      db.product.create({ data: { name: 'Kopi Sachet', sku: 'MNM-001', price: 2500, cost: 1500, stock: 500, minStock: 100, unit: 'sachet', categoryId: categories[1].id, organizationId: org.id } }),
      db.product.create({ data: { name: 'Teh Celup', sku: 'MNM-002', price: 8500, cost: 5000, stock: 200, minStock: 50, unit: 'kotak', categoryId: categories[1].id, organizationId: org.id } }),
      db.product.create({ data: { name: 'Jus Mangga', sku: 'MNM-003', price: 12000, cost: 7000, stock: 80, minStock: 20, unit: 'botol', categoryId: categories[1].id, organizationId: org.id } }),
      db.product.create({ data: { name: 'Buku Tulis', sku: 'ATK-001', price: 5000, cost: 2500, stock: 300, minStock: 50, unit: 'buah', categoryId: categories[2].id, organizationId: org.id } }),
      db.product.create({ data: { name: 'Pulpen', sku: 'ATK-002', price: 3000, cost: 1500, stock: 400, minStock: 100, unit: 'buah', categoryId: categories[2].id, organizationId: org.id } }),
      db.product.create({ data: { name: 'Charger HP', sku: 'ELK-001', price: 35000, cost: 20000, stock: 25, minStock: 5, unit: 'buah', categoryId: categories[3].id, organizationId: org.id } }),
      db.product.create({ data: { name: 'Earphone', sku: 'ELK-002', price: 75000, cost: 45000, stock: 15, minStock: 5, unit: 'buah', categoryId: categories[3].id, organizationId: org.id } }),
      db.product.create({ data: { name: 'Kabel USB', sku: 'ELK-003', price: 15000, cost: 8000, stock: 0, minStock: 10, unit: 'buah', categoryId: categories[3].id, organizationId: org.id } }),
    ])

    // Create customers
    const customers = await Promise.all([
      db.customer.create({ data: { name: 'Bu Siti', email: 'busiti@email.com', phone: '081234567890', address: 'Jl. Sudirman No. 12, Jakarta', organizationId: org.id } }),
      db.customer.create({ data: { name: 'Pak Ahmad', email: 'pakahmad@email.com', phone: '082345678901', address: 'Jl. Thamrin No. 34, Jakarta', organizationId: org.id } }),
      db.customer.create({ data: { name: 'Toko Berkah', email: 'tokoberkah@email.com', phone: '083456789012', address: 'Jl. Gatot Subroto No. 56, Jakarta', organizationId: org.id } }),
      db.customer.create({ data: { name: 'Warung Pak Dodo', email: 'pakdodo@email.com', phone: '084567890123', address: 'Jl. Kuningan No. 78, Jakarta', organizationId: org.id } }),
    ])

    // Create suppliers
    const suppliers = await Promise.all([
      db.supplier.create({ data: { name: 'PT Sumber Pangan', email: 'sumberpangan@pt.com', phone: '021-1112222', address: 'Jl. Industri No. 1, Bekasi', organizationId: org.id } }),
      db.supplier.create({ data: { name: 'CV Maju Bersama', email: 'majubersama@cv.com', phone: '021-3334444', address: 'Jl. Perdagangan No. 5, Tangerang', organizationId: org.id } }),
      db.supplier.create({ data: { name: 'UD Sejahtera Abadi', email: 'sejahtera@ud.com', phone: '021-5556666', address: 'Jl. Ekonomi No. 10, Depok', organizationId: org.id } }),
    ])

    // Create sales orders
    const now = new Date()
    const salesOrders = await Promise.all([
      db.salesOrder.create({
        data: {
          orderNumber: 'SO-2026-001',
          customerId: customers[0].id,
          status: 'completed',
          totalAmount: 60000,
          notes: 'Pesanan reguler',
          organizationId: org.id,
          items: {
            create: [
              { productId: products[0].id, quantity: 2, price: 15000, total: 30000 },
              { productId: products[2].id, quantity: 12, price: 2500, total: 30000 },
            ],
          },
        },
      }),
      db.salesOrder.create({
        data: {
          orderNumber: 'SO-2026-002',
          customerId: customers[1].id,
          status: 'confirmed',
          totalAmount: 135000,
          organizationId: org.id,
          items: {
            create: [
              { productId: products[1].id, quantity: 3, price: 45000, total: 135000 },
            ],
          },
        },
      }),
      db.salesOrder.create({
        data: {
          orderNumber: 'SO-2026-003',
          customerId: customers[2].id,
          status: 'shipped',
          totalAmount: 285000,
          organizationId: org.id,
          items: {
            create: [
              { productId: products[7].id, quantity: 3, price: 35000, total: 105000 },
              { productId: products[8].id, quantity: 2, price: 75000, total: 150000 },
              { productId: products[5].id, quantity: 6, price: 5000, total: 30000 },
            ],
          },
        },
      }),
      db.salesOrder.create({
        data: {
          orderNumber: 'SO-2026-004',
          customerId: customers[3].id,
          status: 'draft',
          totalAmount: 42000,
          organizationId: org.id,
          items: {
            create: [
              { productId: products[1].id, quantity: 1, price: 45000, total: 45000 },
            ],
          },
        },
      }),
      db.salesOrder.create({
        data: {
          orderNumber: 'SO-2026-005',
          customerId: customers[0].id,
          status: 'completed',
          totalAmount: 97500,
          organizationId: org.id,
          createdAt: new Date(now.getFullYear(), now.getMonth() - 1, 15),
          items: {
            create: [
              { productId: products[4].id, quantity: 5, price: 12000, total: 60000 },
              { productId: products[3].id, quantity: 3, price: 8500, total: 25500 },
              { productId: products[2].id, quantity: 5, price: 2500, total: 12500 },
            ],
          },
        },
      }),
    ])

    // Create purchase orders
    await Promise.all([
      db.purchaseOrder.create({
        data: {
          orderNumber: 'PO-2026-001',
          supplierId: suppliers[0].id,
          status: 'completed',
          totalAmount: 1600000,
          organizationId: org.id,
          items: {
            create: [
              { productId: products[0].id, quantity: 100, price: 8000, total: 800000 },
              { productId: products[1].id, quantity: 20, price: 28000, total: 560000 },
              { productId: products[2].id, quantity: 200, price: 1500, total: 300000 },
            ],
          },
        },
      }),
      db.purchaseOrder.create({
        data: {
          orderNumber: 'PO-2026-002',
          supplierId: suppliers[1].id,
          status: 'confirmed',
          totalAmount: 750000,
          organizationId: org.id,
          items: {
            create: [
              { productId: products[5].id, quantity: 100, price: 2500, total: 250000 },
              { productId: products[6].id, quantity: 200, price: 1500, total: 300000 },
              { productId: products[3].id, quantity: 50, price: 5000, total: 250000 },
            ],
          },
        },
      }),
      db.purchaseOrder.create({
        data: {
          orderNumber: 'PO-2026-003',
          supplierId: suppliers[2].id,
          status: 'draft',
          totalAmount: 500000,
          organizationId: org.id,
          items: {
            create: [
              { productId: products[7].id, quantity: 15, price: 20000, total: 300000 },
              { productId: products[9].id, quantity: 25, price: 8000, total: 200000 },
            ],
          },
        },
      }),
    ])

    // Create transactions
    await Promise.all([
      // Income transactions
      db.transaction.create({ data: { type: 'income', category: 'Penjualan', amount: 600000, description: 'Penjualan bulan Januari', date: new Date(now.getFullYear(), now.getMonth() - 5, 15), organizationId: org.id } }),
      db.transaction.create({ data: { type: 'income', category: 'Penjualan', amount: 750000, description: 'Penjualan bulan Februari', date: new Date(now.getFullYear(), now.getMonth() - 4, 15), organizationId: org.id } }),
      db.transaction.create({ data: { type: 'income', category: 'Penjualan', amount: 820000, description: 'Penjualan bulan Maret', date: new Date(now.getFullYear(), now.getMonth() - 3, 15), organizationId: org.id } }),
      db.transaction.create({ data: { type: 'income', category: 'Penjualan', amount: 910000, description: 'Penjualan bulan April', date: new Date(now.getFullYear(), now.getMonth() - 2, 15), organizationId: org.id } }),
      db.transaction.create({ data: { type: 'income', category: 'Penjualan', amount: 1050000, description: 'Penjualan bulan Mei', date: new Date(now.getFullYear(), now.getMonth() - 1, 15), organizationId: org.id } }),
      db.transaction.create({ data: { type: 'income', category: 'Penjualan', amount: 1200000, description: 'Penjualan bulan ini', date: new Date(now.getFullYear(), now.getMonth(), 1), organizationId: org.id } }),
      db.transaction.create({ data: { type: 'income', category: 'Lainnya', amount: 200000, description: 'Pendapatan bunga bank', date: new Date(now.getFullYear(), now.getMonth() - 1, 20), organizationId: org.id } }),
      // Expense transactions
      db.transaction.create({ data: { type: 'expense', category: 'Pembelian Stok', amount: 400000, description: 'Pembelian stok bulan Januari', date: new Date(now.getFullYear(), now.getMonth() - 5, 5), organizationId: org.id } }),
      db.transaction.create({ data: { type: 'expense', category: 'Pembelian Stok', amount: 480000, description: 'Pembelian stok bulan Februari', date: new Date(now.getFullYear(), now.getMonth() - 4, 5), organizationId: org.id } }),
      db.transaction.create({ data: { type: 'expense', category: 'Pembelian Stok', amount: 520000, description: 'Pembelian stok bulan Maret', date: new Date(now.getFullYear(), now.getMonth() - 3, 5), organizationId: org.id } }),
      db.transaction.create({ data: { type: 'expense', category: 'Pembelian Stok', amount: 550000, description: 'Pembelian stok bulan April', date: new Date(now.getFullYear(), now.getMonth() - 2, 5), organizationId: org.id } }),
      db.transaction.create({ data: { type: 'expense', category: 'Pembelian Stok', amount: 650000, description: 'Pembelian stok bulan Mei', date: new Date(now.getFullYear(), now.getMonth() - 1, 5), organizationId: org.id } }),
      db.transaction.create({ data: { type: 'expense', category: 'Pembelian Stok', amount: 700000, description: 'Pembelian stok bulan ini', date: new Date(now.getFullYear(), now.getMonth(), 3), organizationId: org.id } }),
      db.transaction.create({ data: { type: 'expense', category: 'Gaji', amount: 3500000, description: 'Gaji karyawan bulan ini', date: new Date(now.getFullYear(), now.getMonth(), 1), organizationId: org.id } }),
      db.transaction.create({ data: { type: 'expense', category: 'Sewa', amount: 1500000, description: 'Sewa toko bulan ini', date: new Date(now.getFullYear(), now.getMonth(), 1), organizationId: org.id } }),
      db.transaction.create({ data: { type: 'expense', category: 'Listrik & Air', amount: 450000, description: 'Tagihan listrik dan air', date: new Date(now.getFullYear(), now.getMonth(), 5), organizationId: org.id } }),
      db.transaction.create({ data: { type: 'expense', category: 'Transportasi', amount: 300000, description: 'Biaya pengiriman barang', date: new Date(now.getFullYear(), now.getMonth(), 8), organizationId: org.id } }),
    ])

    // Create employees
    await Promise.all([
      db.employee.create({ data: { name: 'Rina Wati', email: 'rina@tokosejahtera.id', phone: '081111222333', position: 'Kasir', salary: 3500000, joinDate: new Date(2024, 0, 15), status: 'active', organizationId: org.id } }),
      db.employee.create({ data: { name: 'Budi Santoso', email: 'budi@tokosejahtera.id', phone: '082222333444', position: 'Gudang', salary: 3200000, joinDate: new Date(2024, 2, 1), status: 'active', organizationId: org.id } }),
      db.employee.create({ data: { name: 'Dewi Lestari', email: 'dewi@tokosejahtera.id', phone: '083333444555', position: 'Admin', salary: 4000000, joinDate: new Date(2023, 5, 10), status: 'active', organizationId: org.id } }),
      db.employee.create({ data: { name: 'Agus Prasetyo', email: 'agus@tokosejahtera.id', phone: '084444555666', position: 'Sales', salary: 3800000, joinDate: new Date(2024, 6, 1), status: 'active', organizationId: org.id } }),
      db.employee.create({ data: { name: 'Maya Sari', email: 'maya@tokosejahtera.id', phone: '085555666777', position: 'Manajer Toko', salary: 5500000, joinDate: new Date(2023, 0, 1), status: 'active', organizationId: org.id } }),
      db.employee.create({ data: { name: 'Joko Widodo', email: 'joko@tokosejahtera.id', phone: '086666777888', position: 'Driver', salary: 3000000, joinDate: new Date(2024, 8, 15), status: 'inactive', organizationId: org.id } }),
    ])

    return NextResponse.json({ message: 'Data demo berhasil dibuat!', organizationId: org.id })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Gagal membuat data demo' }, { status: 500 })
  }
}
