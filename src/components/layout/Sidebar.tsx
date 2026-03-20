import { Activity, CarFront, FileText, Settings, ShieldAlert, Users } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

export function Sidebar() {
  const location = useLocation()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-white pt-16 transition-transform sm:translate-x-0">
      <div className="h-full overflow-y-auto px-3 pb-4">
        <ul className="space-y-3 font-medium">
          <li>
            <Link to="/" className={`flex items-center rounded-lg p-2 transition-colors group ${
              location.pathname === '/' ? 'bg-primary/10 text-primary' : 'text-slate-700 hover:bg-slate-100'
            }`}>
              <Activity className={`h-5 w-5 transition duration-75 ${
                location.pathname === '/' ? 'text-primary' : 'text-slate-500 group-hover:text-slate-900'
              }`} />
              <span className="ms-3">Dashboard Geral</span>
            </Link>
          </li>
          <li>
            <Link to="/vehicles" className={`flex items-center rounded-lg p-2 transition-colors group ${
              location.pathname === '/vehicles' ? 'bg-primary/10 text-primary' : 'text-slate-700 hover:bg-slate-100'
            }`}>
              <CarFront className={`h-5 w-5 transition duration-75 ${
                location.pathname === '/vehicles' ? 'text-primary' : 'text-slate-500 group-hover:text-slate-900'
              }`} />
              <span className="ms-3 flex-1 whitespace-nowrap">Frota Cuidar</span>
              <span className="ms-3 inline-flex items-center justify-center rounded-full bg-slate-100 px-2 text-sm font-medium text-slate-800">42</span>
            </Link>
          </li>
          <li>
            <a href="#" className="flex items-center rounded-lg p-2 text-slate-700 hover:bg-slate-100 group">
              <Users className="h-5 w-5 text-slate-500 transition duration-75 group-hover:text-slate-900" />
              <span className="ms-3 flex-1 whitespace-nowrap">Motoristas</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center rounded-lg p-2 text-warning hover:bg-warning/10 group">
              <ShieldAlert className="h-5 w-5 transition duration-75 group-hover:text-warning" />
              <span className="ms-3 flex-1 whitespace-nowrap">Manutenção</span>
              <span className="ms-3 inline-flex items-center justify-center rounded-full bg-warning/20 px-2 text-sm font-medium text-warning">2</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center rounded-lg p-2 text-slate-700 hover:bg-slate-100 group">
              <FileText className="h-5 w-5 text-slate-500 transition duration-75 group-hover:text-slate-900" />
              <span className="ms-3 flex-1 whitespace-nowrap">Relatórios</span>
            </a>
          </li>
        </ul>
      </div>
      <div className="absolute bottom-0 left-0 w-full p-4 border-t border-slate-200 bg-white">
         <a href="#" className="flex items-center rounded-lg p-2 text-slate-700 hover:bg-slate-100 group">
            <Settings className="h-5 w-5 text-slate-500 transition duration-75 group-hover:text-slate-900" />
            <span className="ms-3 flex-1 whitespace-nowrap">Configurações</span>
          </a>
      </div>
    </aside>
  )
}
