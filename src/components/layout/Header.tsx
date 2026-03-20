import { Bell, Search, User } from 'lucide-react'
import { Button } from '../ui/button'

export function Header() {
  return (
    <header className="fixed top-0 z-50 w-full border-b bg-white border-slate-200">
      <div className="flex px-3 py-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center justify-start">
            <button type="button" className="inline-flex items-center p-2 text-sm text-slate-500 rounded-lg sm:hidden hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200">
              <span className="sr-only">Open sidebar</span>
              <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path clipRule="evenodd" fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
              </svg>
            </button>
            <a href="#" className="flex ms-2 md:me-24 items-center gap-2">
              <div className="bg-primary text-white p-1.5 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              </div>
              <span className="self-center text-xl font-bold sm:text-2xl whitespace-nowrap text-slate-900 tracking-tight">Frota<span className="text-primary">Life</span></span>
            </a>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden relative md:block md:w-80">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <Search className="w-4 h-4 text-slate-500" />
              </div>
              <input type="text" className="bg-slate-50 border border-slate-300 text-slate-900 sm:text-sm rounded-lg focus:ring-primary focus:border-primary block w-full ps-10 p-2" placeholder="Buscar veículo, motorista..." />
            </div>

            <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-slate-900 rounded-full h-10 w-10">
              <span className="sr-only">Notifications</span>
              <Bell className="w-5 h-5" />
              <div className="absolute inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-destructive border-2 border-white rounded-full -top-1 -end-1">
                3
              </div>
            </Button>
            
            <div className="flex items-center ms-3">
              <button type="button" className="flex text-sm bg-slate-800 rounded-full focus:ring-4 focus:ring-slate-300 items-center justify-center h-10 w-10 overflow-hidden">
                <span className="sr-only">Open user menu</span>
                <User className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
