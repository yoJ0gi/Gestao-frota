import { CarFront, CheckCircle, Navigation, Wrench } from 'lucide-react'
import { Card, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { useFleetStore } from '../store/useFleetStore'

export function Vehicles() {
  const { vehicles, completeTrip, scheduleMaintenance } = useFleetStore()

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2 mb-6">
        <h2 className="text-3xl font-bold tracking-tight text-slate-800">Gestão de Veículos</h2>
        <Button>Adicionar Veículo</Button>
      </div>

      <div className="grid gap-4">
        {vehicles.map(vehicle => (
          <Card key={vehicle.id} className="hover:shadow-md transition-shadow">
            <CardContent className="flex flex-col md:flex-row items-start md:items-center justify-between p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-slate-100 rounded-full">
                  <CarFront className="w-6 h-6 text-slate-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    {vehicle.name}
                    {vehicle.status === 'available' && <Badge variant="secondary"><CheckCircle className="w-3 h-3 mr-1" /> Disponível</Badge>}
                    {vehicle.status === 'in_use' && <Badge variant="destructive"><Navigation className="w-3 h-3 mr-1" /> Em Rota</Badge>}
                    {vehicle.status === 'maintenance' && <Badge variant="warning"><Wrench className="w-3 h-3 mr-1" /> Manutenção</Badge>}
                  </h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                    <p><strong>Placa:</strong> {vehicle.plate}</p>
                    <p><strong>Tipo:</strong> {vehicle.type.toUpperCase()}</p>
                    {vehicle.driver && <p><strong>Motorista:</strong> {vehicle.driver}</p>}
                    <p><strong>KM Atual:</strong> {vehicle.currentKm.toLocaleString()} / {vehicle.nextMaintenanceKm.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                {vehicle.status === 'in_use' && (
                  <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50" onClick={() => completeTrip(vehicle.id)}>
                    <CheckCircle className="w-4 h-4 mr-2" /> Finalizar Rota
                  </Button>
                )}
                
                {vehicle.status === 'available' && (
                  <Button variant="outline" className="border-orange-200 text-orange-700 hover:bg-orange-50" onClick={() => scheduleMaintenance(vehicle.id)}>
                    <Wrench className="w-4 h-4 mr-2" /> Agendar Revisão
                  </Button>
                )}
                
                <Button variant="ghost" className="text-slate-600">
                  Ver Histórico
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
