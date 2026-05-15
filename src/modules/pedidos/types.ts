export type EstadoPedido = 'borrador' | 'confirmado' | 'en_proceso' | 'entregado' | 'cancelado'

export interface LineaPedido {
  id: string
  pedido_id: string
  producto_id: string
  cantidad: number
  precio_unitario: number
  subtotal: number
}

export interface Pedido {
  id: string
  numero: string
  cliente_id: string
  vendedor_id: string
  estado: EstadoPedido
  total: number
  lineas: LineaPedido[]
  notas?: string
  created_at: string
  updated_at: string
  sincronizado: boolean
}

export interface PedidoOffline extends Pedido {
  offline_id: string
  pendiente_sync: boolean
}
