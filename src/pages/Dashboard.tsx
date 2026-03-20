import { useState } from 'react'
import { Activity, AlertTriangle, CheckCircle, Navigation, MapPin } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { useFleetStore, TripRequest } from '../store/useFleetStore'
import { Modal } from '../components/ui/modal'

export function Dashboard() {
  const { vehicles, requests, assignVehicle, scheduleMaintenance } = useFleetStore()
  
  const [selectedRequest, setSelectedRequest] = useState<TripRequest | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Computed metrics
  const totalFleet = vehicles.length
  const availableCount = vehicles.filter(v => v.status === 'available').length
  const inUseCount = vehicles.filter(v => v.status === 'in_use').length
  const maintenanceCount = vehicles.filter(v => v.status === 'maintenance').length

  const handleAssignClick = (req: TripRequest) => {
    setSelectedRequest(req)
    setIsModalOpen(true)
  }

  const confirmAssignment = (vehicleId: string) => {
    if (selectedRequest) {
      assignVehicle(selectedRequest.id, vehicleId)
      setIsModalOpen(false)
      setSelectedRequest(null)
    }
  }

  // Filter vehicles appropriate for dispatch (Available)
  const availableVehicles = vehicles.filter(v => v.status === 'available')

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2 mb-6">
        <h2 className="text-3xl font-bold tracking-tight text-slate-800">Dashboard Interativo</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline">Baixar Relatório</Button>
        </div>
      </div>
      
      {/* Resumo em Cards (Dynamic) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total da Frota</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFleet}</div>
            <p className="text-xs text-muted-foreground pt-1">Veículos Cadastrados</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-secondary hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponíveis</CardTitle>
            <CheckCircle className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary animate-pulse">{availableCount}</div>
            <p className="text-xs text-muted-foreground pt-1">Prontos para operação imediata</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-destructive hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Uso (Rotas)</CardTitle>
            <Navigation className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{inUseCount}</div>
            <p className="text-xs text-muted-foreground pt-1">Ambulâncias e transporte ativo</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-warning hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Manutenção</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{maintenanceCount}</div>
            <p className="text-xs text-muted-foreground pt-1">Revisão preventiva ou corretiva</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-8">
        
        {/* Recentes / Mapa Dinâmico Mockup */}
        <Card className="col-span-4 min-h-[400px] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="text-primary w-5 h-5"/> Rastreamento ao Vivo
            </CardTitle>
            <CardDescription>
              Acompanhamento de veículos que estão "Em Uso"
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-6 pl-6 pr-6">
            <div className="w-full h-full min-h-[300px] bg-slate-200 rounded-lg flex items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=-23.5505,-46.6333&zoom=13&size=800x400&maptype=roadmap&style=feature:poi|visibility:off&client=gme-dummy')] bg-cover bg-center mix-blend-multiply opacity-50"></div>
              
              {/* Renderizar pins de veículos em uso aleatoriamente baseado no index */}
              {vehicles.filter(v => v.status === 'in_use').map((v, idx) => (
                <div 
                  key={v.id} 
                  className="absolute flex flex-col items-center transition-all duration-1000 ease-in-out hover:scale-110"
                  style={{ 
                    top: `${20 + (idx * 25)}%`, 
                    left: `${30 + (idx * 15)}%` 
                  }}
                >
                   <div className="w-4 h-4 rounded-full border-2 border-white bg-destructive shadow-lg animate-pulse" />
                   <Badge variant="destructive" className="mt-1 text-[10px] shadow-sm whitespace-nowrap">
                     {v.name}
                   </Badge>
                </div>
              ))}
              
              {vehicles.filter(v => v.status === 'in_use').length === 0 && (
                 <p className="text-slate-600 font-medium z-10 bg-white/90 p-3 rounded-lg shadow relative">Nenhum veículo em rota no momento.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lista de Chamados Dinâmica */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Filas de Despacho ({requests.length})</CardTitle>
            <CardDescription>
              {requests.length === 0 ? "Tudo tranquilo! Não há chamados na fila." : "Selecione 'Atribuir' para despachar um veículo."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {requests.map(req => (
                <div key={req.id} className={`flex items-start md:items-center justify-between p-3 border rounded-lg transition-colors ${
                  req.priority === 'high' ? 'border-red-200 bg-red-50' : 
                  req.priority === 'medium' ? 'border-orange-200 bg-orange-50' : 'border-slate-200 hover:bg-slate-50'
                }`}>
                  <div className="space-y-1 pr-2">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {req.priority === 'high' && <Badge variant="destructive">URGENTE</Badge>}
                      {req.priority === 'medium' && <Badge variant="warning">Importante</Badge>}
                      {req.priority === 'low' && <Badge variant="secondary">Rotina</Badge>}
                      
                      <span className="font-semibold text-sm line-clamp-1">{req.type}</span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium">{req.description} ➔ {req.destination}</p>
                    <p className="text-[10px] text-slate-500">{req.timeAgo}</p>
                  </div>
                  <Button 
                    variant={req.priority === 'high' ? 'destructive' : 'default'} 
                    size="sm"
                    className="shrink-0"
                    onClick={() => handleAssignClick(req)}
                  >
                    Atribuir
                  </Button>
                </div>
              ))}

              {/* Fake Maintenance Example mapped dynamically */}
              {vehicles.filter(v => v.currentKm >= v.nextMaintenanceKm && v.status !== 'maintenance').map(v => (
                 <div key={`maint-${v.id}`} className="flex items-center justify-between p-3 border border-orange-200 bg-orange-50 rounded-lg">
                   <div className="space-y-1">
                     <div className="flex items-center gap-2">
                       <Badge variant="warning">Manutenção</Badge>
                       <span className="font-semibold text-sm">Agendar {v.name}</span>
                     </div>
                     <p className="text-xs text-slate-600 font-medium">{v.plate} ultrapassou o limite em {(v.currentKm - v.nextMaintenanceKm).toLocaleString()} km</p>
                   </div>
                   <Button 
                     variant="outline" 
                     size="sm" 
                     className="border-orange-200 text-orange-700 hover:bg-orange-100 shrink-0"
                     onClick={() => scheduleMaintenance(v.id)}
                   >
                     Agendar
                   </Button>
                 </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dispatch Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Despachar Veículo"
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
               <h4 className="font-semibold text-sm mb-1 text-slate-800">Detalhes da Chamada:</h4>
               <p className="text-sm text-slate-600"><span className="font-medium text-slate-700">Tipo:</span> {selectedRequest.type}</p>
               <p className="text-sm text-slate-600"><span className="font-medium text-slate-700">Ocorrência:</span> {selectedRequest.description}</p>
               <p className="text-sm text-slate-600"><span className="font-medium text-slate-700">Destino:</span> {selectedRequest.destination}</p>
            </div>
            
            <h4 className="font-semibold text-sm text-slate-800">Veículos Disponíveis na Base:</h4>
            {availableVehicles.length === 0 ? (
              <p className="text-sm text-destructive py-2">Nenhum veículo disponível no momento! Aguarde o retorno ou remaneje a frota.</p>
            ) : (
              <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-2">
                {availableVehicles.map(v => (
                  <div key={v.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:border-primary transition-colors hover:shadow-sm">
                    <div>
                      <p className="font-semibold text-sm text-slate-800">{v.name} ({v.type.toUpperCase()})</p>
                      <p className="text-xs text-slate-500">Placa: {v.plate}</p>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => confirmAssignment(v.id)}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Confirmar Envio
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex justify-end pt-4 mt-2 border-t border-slate-100">
               <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  )
}
