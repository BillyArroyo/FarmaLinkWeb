import { supabase } from '@/lib/supabase'
import type { UserProfile } from '../types'

export async function getProfile(userId: string): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('perfiles')
    .select('id, email, nombre, role, activo, created_at')
    .eq('id', userId)
    .single()
  if (error) throw new Error(error.message)
  return data as UserProfile
}

export async function signInWithEmail(email: string, password: string): Promise<UserProfile> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)
  return getProfile(data.user.id)
}

export async function signUpClient(params: {
  email: string
  password: string
  nombre: string
  nombre_farmacia: string
}): Promise<UserProfile> {
  const { data, error } = await supabase.auth.signUp({
    email: params.email,
    password: params.password,
  })
  if (error) throw new Error(error.message)
  if (!data.user) throw new Error('No se pudo crear el usuario')

  const userId = data.user.id

  const { error: profileError } = await supabase
    .from('perfiles')
    .insert({ id: userId, email: params.email, nombre: params.nombre, role: 'cliente', activo: true })
  if (profileError) throw new Error(profileError.message)

  await supabase
    .from('clientes')
    .insert({ user_id: userId, nombre_farmacia: params.nombre_farmacia, ciudad: 'Lima', activo: true })

  localStorage.setItem('fl_nombre_farmacia', params.nombre_farmacia)

  return getProfile(userId)
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
  localStorage.removeItem('fl_cliente_id')
}
