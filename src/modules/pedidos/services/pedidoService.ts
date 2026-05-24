import { supabase } from '@/lib/supabase'
import { CrearPedidoSchema, ActualizarEstadoSchema } from '@/schemas/pedidoSchema'
import type { EstadoPedido, CrearPedidoParams } from '../types'

export async function crearPedido(params: CrearPedidoParams) {
  const parsed = CrearPedidoSchema.safeParse(params)
  if (!parsed.success) {
    const msg = parsed.error.errors.map(e => e.message).join(' · ')
    throw new Error(`Validación fallida: ${msg}`)
  }
  const subtotal = params.lineas.reduce(
    (s, l) => s + l.cantidad * l.precio_unitario,
    0
  )

  const { data: pedido, error: pedidoErr } = await supabase
    .from('pedidos')
    .insert({
      cliente_id: params.cliente_id,
      vendedor_id: params.vendedor_id ?? null,
      tipo_precio: params.tipo_precio,
      notas: params.notas ?? null,
      subtotal,
      total: subtotal,
      estado: 'confirmado',
    })
    .select('id, numero, total, estado, created_at')
    .single()

  if (pedidoErr) throw pedidoErr

  const { error: lineasErr } = await supabase
    .from('lineas_pedido')
    .insert(
      params.lineas.map(l => ({
        pedido_id: pedido.id,
        producto_id: l.producto_id,
        cantidad: l.cantidad,
        precio_unitario: l.precio_unitario,
        subtotal: l.cantidad * l.precio_unitario,
      }))
    )

  if (lineasErr) throw lineasErr

  return pedido as { id: string; numero: string; total: number; estado: string; created_at: string }
}

export async function obtenerPedidos(filtros?: {
  estado?: EstadoPedido
  fecha_desde?: string
}) {
  let query = supabase
    .from('pedidos')
    .select(`
      id, numero, estado, tipo_precio, subtotal, total, notas, created_at, updated_at,
      cliente:clientes(nombre_farmacia, distrito),
      vendedor:perfiles(nombre),
      lineas:lineas_pedido(
        id, cantidad, precio_unitario, subtotal,
        producto:productos(nombre, laboratorio)
      )
    `)
    .order('created_at', { ascending: false })

  if (filtros?.estado) query = query.eq('estado', filtros.estado)
  if (filtros?.fecha_desde) query = query.gte('created_at', filtros.fecha_desde)

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function actualizarEstado(id: string, estado: EstadoPedido) {
  const parsed = ActualizarEstadoSchema.safeParse({ id, estado })
  if (!parsed.success) {
    const msg = parsed.error.errors.map(e => e.message).join(' · ')
    throw new Error(`Validación fallida: ${msg}`)
  }
  const { error } = await supabase
    .from('pedidos')
    .update({ estado })
    .eq('id', id)
  if (error) throw error
}
