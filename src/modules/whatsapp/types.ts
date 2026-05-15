export type TipoMensaje = 'recibo' | 'promocion' | 'recordatorio'

export interface Plantilla {
  id: string
  nombre: string
  tipo: TipoMensaje
  contenido: string
  activa: boolean
}

export interface Mensaje {
  id: string
  telefono: string
  plantilla_id: string
  variables: Record<string, string>
  estado: 'pendiente' | 'enviado' | 'fallido'
  created_at: string
}
