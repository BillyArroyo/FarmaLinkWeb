import { create } from 'zustand'
import type { UserProfile, Role } from '@/modules/auth/types'

interface AuthState {
  user: UserProfile | null
  role: Role | null
  isLoading: boolean
  setUser: (user: UserProfile | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  isLoading: true,
  setUser: (user) => set({ user, role: user?.role ?? null, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, role: null, isLoading: false }),
}))
