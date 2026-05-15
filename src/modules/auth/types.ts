export type Role = 'cliente' | 'vendedor' | 'administrador'

export interface UserProfile {
  id: string
  email: string
  nombre: string
  role: Role
  activo: boolean
  created_at: string
}

export interface Session {
  user: UserProfile
  access_token: string
  expires_at: number
}
