'use client'

import { useEffect } from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { AppHeader } from '@/components/layout/app-header'
import { DashboardPage } from '@/components/dashboard/dashboard-page'
import { InventoryPage } from '@/components/inventory/inventory-page'
import { SalesPage } from '@/components/sales/sales-page'
import { PurchasesPage } from '@/components/purchases/purchases-page'
import { FinancePage } from '@/components/finance/finance-page'
import { ContactsPage } from '@/components/contacts/contacts-page'
import { HrPage } from '@/components/hr/hr-page'
import { useAppStore } from '@/store/app-store'
import { Settings, Leaf } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pengaturan</h1>
        <p className="text-muted-foreground">Kelola pengaturan aplikasi Anda</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-emerald-600" />
            Informasi Organisasi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-600 text-white">
              <Leaf className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-emerald-700">Toko Sejahtera</p>
              <p className="text-sm text-muted-foreground">Paket Pro • Jl. Merdeka No. 45, Jakarta Selatan</p>
            </div>
          </div>
          <div className="grid gap-3 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Email</span>
              <span>info@tokosejahtera.id</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Telepon</span>
              <span>021-5551234</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Paket</span>
              <span className="text-emerald-600 font-medium">Pro</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const pageComponents: Record<string, React.ComponentType> = {
  dashboard: DashboardPage,
  inventory: InventoryPage,
  sales: SalesPage,
  purchases: PurchasesPage,
  finance: FinancePage,
  contacts: ContactsPage,
  hr: HrPage,
  settings: SettingsPage,
}

export default function Home() {
  const { activePage, setOrganizationId } = useAppStore()

  useEffect(() => {
    // Set the demo organization ID
    setOrganizationId('org_demo_001')
    
    // Auto-seed on first load
    fetch('/api/seed', { method: 'POST' })
      .then((res) => res.json())
      .then((data) => {
        if (data.message) console.log('Seed:', data.message)
      })
      .catch(() => {})
  }, [setOrganizationId])

  const ActivePageComponent = pageComponents[activePage] || DashboardPage

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <div className="flex-1 overflow-auto p-4 md:p-6">
          <ActivePageComponent />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
