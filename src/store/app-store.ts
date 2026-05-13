import { create } from 'zustand'

interface AppState {
  activePage: string
  setActivePage: (page: string) => void
  organizationId: string
  setOrganizationId: (id: string) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  activePage: 'dashboard',
  setActivePage: (page) => set({ activePage: page }),
  organizationId: '',
  setOrganizationId: (id) => set({ organizationId: id }),
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))
