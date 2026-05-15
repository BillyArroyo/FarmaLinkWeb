export type MetodoPago = 'efectivo' | 'yape' | 'plin' | 'transferencia' | 'niubiz'
export type EstadoCobro = 'pendiente' | 'pagado' | 'anulado'

export interface Cobro {
  id: string
  pedido_id: string
  monto: number
  metodo: MetodoPago
  estado: EstadoCobro
  recibo_id?: string
  created_at: string
}

export interface Recibo {
  id: string
  numero: string
  cobro_id: string
  vendedor_id: string
  cliente_id: string
  monto: number
  hash: string
  qr_code: string
  latitud?: number
  longitud?: number
  created_at: string
}
