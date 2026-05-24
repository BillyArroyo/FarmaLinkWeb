export type EstadoPedido = 'borrador' | 'confirmado' | 'en_proceso' | 'entregado' | 'cancelado'
export type TipoPrecio = 'contado' | 'credito'

export interface LineaPedido {
  id: string
  pedido_id: string
  producto_id: string
  cantidad: number
  precio_unitario: number
  descuento: number
  subtotal: number
  created_at: string
  producto?: { nombre: string; laboratorio: string }
}

export interface Pedido {
  id: string
  numero: string
  cliente_id: string
  vendedor_id: string | null
  estado: EstadoPedido
  tipo_precio: TipoPrecio
  subtotal: number
  descuento: number
  total: number
  notas: string | null
  latitud: number | null
  longitud: number | null
  created_at: string
  updated_at: string
  sincronizado: boolean
  lineas?: LineaPedido[]
  cliente?: { nombre_farmacia: string; distrito?: string | null }
  vendedor?: { nombre: string }
}

export interface PedidoOffline extends Pedido {
  offline_id: string
  pendiente_sync: boolean
}

export interface CrearPedidoParams {
  cliente_id: string
  vendedor_id?: string
  tipo_precio: TipoPrecio
  notas?: string
  lineas: Array<{
    producto_id: string
    cantidad: number
    precio_unitario: number
  }>
}
