'use client'

import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  Wallet,
  Users,
  UserCog,
  Settings,
  Leaf,
} from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'inventory', label: 'Inventaris', icon: Package },
  { id: 'sales', label: 'Penjualan', icon: ShoppingCart },
  { id: 'purchases', label: 'Pembelian', icon: Truck },
  { id: 'finance', label: 'Keuangan', icon: Wallet },
  { id: 'contacts', label: 'Kontak', icon: Users },
  { id: 'hr', label: 'Karyawan', icon: UserCog },
  { id: 'settings', label: 'Pengaturan', icon: Settings },
]

export function AppSidebar() {
  const { activePage, setActivePage } = useAppStore()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="hover:bg-emerald-50">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <Leaf className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-bold text-emerald-700">UMKMerpa</span>
                <span className="truncate text-xs text-muted-foreground">ERP untuk UMKM</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activePage === item.id}
                    onClick={() => setActivePage(item.id)}
                    tooltip={item.label}
                    className={activePage === item.id ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-700' : ''}
                  >
                    <item.icon className={activePage === item.id ? 'text-emerald-600' : ''} />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="sm" className="text-xs text-muted-foreground">
              <Leaf className="size-3" />
              <span>UMKMerpa v1.0</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
