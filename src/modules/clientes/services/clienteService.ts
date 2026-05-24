import { supabase } from '@/lib/supabase'
import { CrearClienteSchema } from '@/schemas/clienteSchema'

export interface ClienteDB {
  id: string
  nombre_farmacia: string
  ruc: string | null
  direccion: string | null
  distrito: string | null
  ciudad: string
  telefono: string | null
}

export async function obtenerClientes(): Promise<ClienteDB[]> {
  const { data, error } = await supabase
    .from('clientes')
    .select('id, nombre_farmacia, ruc, direccion, distrito, ciudad, telefono')
    .eq('activo', true)
    .order('nombre_farmacia')

  if (error) throw error
  return data ?? []
}

export async function crearCliente(params: {
  nombre_farmacia: string
  ruc?: string
  distrito?: string
  telefono?: string
}): Promise<ClienteDB> {
  const parsed = CrearClienteSchema.safeParse(params)
  if (!parsed.success) {
    const msg = parsed.error.errors.map(e => e.message).join(' · ')
    throw new Error(`Validación fallida: ${msg}`)
  }
  const { data, error } = await supabase
    .from('clientes')
    .insert({ ciudad: 'Lima', ...params })
    .select('id, nombre_farmacia, ruc, direccion, distrito, ciudad, telefono')
    .single()

  if (error) throw error
  return data
}

export async function obtenerOCrearCliente(nombreFarmacia: string, userId?: string): Promise<string> {
  // Authenticated user: find existing cliente by user_id first
  if (userId) {
    const { data: byUser } = await supabase
      .from('clientes')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()
    if (byUser) {
      localStorage.setItem('fl_cliente_id', byUser.id)
      return byUser.id
    }
    // Authenticated but no cliente yet: create linked to user_id
    const { data: nuevo, error } = await supabase
      .from('clientes')
      .insert({ user_id: userId, nombre_farmacia: nombreFarmacia, ciudad: 'Lima', activo: true })
      .select('id')
      .single()
    if (error) throw error
    localStorage.setItem('fl_cliente_id', nuevo.id)
    return nuevo.id
  }

  // Guest flow: check localStorage
  const stored = localStorage.getItem('fl_cliente_id')
  if (stored) return stored

  const { data: existente } = await supabase
    .from('clientes')
    .select('id')
    .eq('nombre_farmacia', nombreFarmacia)
    .maybeSingle()

  if (existente) {
    localStorage.setItem('fl_cliente_id', existente.id)
    return existente.id
  }

  const { data: nuevo, error } = await supabase
    .from('clientes')
    .insert({ nombre_farmacia: nombreFarmacia, ciudad: 'Lima' })
    .select('id')
    .single()

  if (error) throw error
  localStorage.setItem('fl_cliente_id', nuevo.id)
  return nuevo.id
}
