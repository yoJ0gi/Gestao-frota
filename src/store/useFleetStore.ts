import { create } from 'zustand'

export type VehicleStatus = 'available' | 'in_use' | 'maintenance'

export interface Vehicle {
  id: string
  name: string
  plate: string
  status: VehicleStatus
  type: 'uti' | 'basic' | 'transport'
  driver?: string
  lastMaintenance: string
  nextMaintenanceKm: number
  currentKm: number
}

export interface TripRequest {
  id: string
  priority: 'high' | 'medium' | 'low'
  description: string
  destination: string
  timeAgo: string
  type: string
}

interface FleetState {
  vehicles: Vehicle[]
  requests: TripRequest[]
  assignVehicle: (requestId: string, vehicleId: string) => void
  scheduleMaintenance: (vehicleId: string) => void
  completeTrip: (vehicleId: string) => void
}

const mockVehicles: Vehicle[] = [
  { id: 'v1', name: 'AMB-01 (UTI)', plate: 'ABC-1234', status: 'in_use', type: 'uti', driver: 'João Silva', lastMaintenance: '2023-01-15', nextMaintenanceKm: 50000, currentKm: 45000 },
  { id: 'v2', name: 'AMB-02', plate: 'XYZ-9876', status: 'available', type: 'basic', lastMaintenance: '2023-02-10', nextMaintenanceKm: 60000, currentKm: 58000 },
  { id: 'v3', name: 'AMB-12', plate: 'DEF-5555', status: 'maintenance', type: 'basic', lastMaintenance: '2022-10-05', nextMaintenanceKm: 40000, currentKm: 40500 },
  { id: 'v4', name: 'TR-04', plate: 'GHI-1111', status: 'in_use', type: 'transport', driver: 'Maria Souza', lastMaintenance: '2023-03-01', nextMaintenanceKm: 80000, currentKm: 75000 },
  { id: 'v5', name: 'AMB-05', plate: 'JKL-2222', status: 'available', type: 'basic', lastMaintenance: '2023-04-12', nextMaintenanceKm: 45000, currentKm: 42000 },
]

const mockRequests: TripRequest[] = [
  { id: 'r1', priority: 'high', type: 'Transporte UTI', description: 'Paciente Infartado', destination: 'Hospital Central', timeAgo: 'Há 2 min' },
  { id: 'r2', priority: 'medium', type: 'Insumos (Sangue)', description: 'Rotina', destination: 'Posto Avançado Sul', timeAgo: 'Há 15 min' },
]

export const useFleetStore = create<FleetState>((set) => ({
  vehicles: mockVehicles,
  requests: mockRequests,
  
  assignVehicle: (requestId, vehicleId) => set((state) => {
    // Move request out of queue
    const updatedRequests = state.requests.filter(r => r.id !== requestId)
    // Update vehicle to 'in_use'
    const updatedVehicles = state.vehicles.map(v => 
      v.id === vehicleId ? { ...v, status: 'in_use' as VehicleStatus } : v
    )
    return { requests: updatedRequests, vehicles: updatedVehicles }
  }),

  scheduleMaintenance: (vehicleId) => set((state) => ({
    vehicles: state.vehicles.map(v => 
      v.id === vehicleId ? { ...v, status: 'maintenance' as VehicleStatus } : v
    )
  })),

  completeTrip: (vehicleId) => set((state) => ({
    vehicles: state.vehicles.map(v =>
      v.id === vehicleId ? { ...v, status: 'available' as VehicleStatus, driver: undefined } : v
    )
  })),
}))
