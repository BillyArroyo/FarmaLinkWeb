import { z } from 'zod'

export const LineaPedidoInputSchema = z.object({
  producto_id: z.string().min(1, 'producto_id requerido'),
  cantidad: z.number().int().positive('La cantidad debe ser mayor a 0'),
  precio_unitario: z.number().nonnegative('El precio no puede ser negativo'),
})

export const CrearPedidoSchema = z.object({
  cliente_id: z.string().uuid('cliente_id debe ser un UUID válido'),
  vendedor_id: z.string().uuid().optional(),
  tipo_precio: z.enum(['contado', 'credito']),
  notas: z.string().max(500, 'Máximo 500 caracteres').optional(),
  lineas: z
    .array(LineaPedidoInputSchema)
    .min(1, 'El pedido debe tener al menos un producto'),
})

export const ActualizarEstadoSchema = z.object({
  id: z.string().uuid('id debe ser un UUID válido'),
  estado: z.enum(['borrador', 'confirmado', 'en_proceso', 'entregado', 'cancelado']),
})

export type CrearPedidoInput = z.infer<typeof CrearPedidoSchema>
export type ActualizarEstadoInput = z.infer<typeof ActualizarEstadoSchema>
