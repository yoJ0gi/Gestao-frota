import { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <Sidebar />
      <div className="p-4 sm:ml-64 pt-20">
        <main className="mx-auto max-w-7xl">
          {children}
        </main>
      </div>
    </div>
  )
}
