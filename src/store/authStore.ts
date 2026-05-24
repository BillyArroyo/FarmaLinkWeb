import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { UserProfile, Role } from '@/modules/auth/types'
import { getProfile, signOut as authSignOut } from '@/modules/auth/services/authService'

interface AuthState {
  user: UserProfile | null
  role: Role | null
  isLoading: boolean
  setUser: (user: UserProfile | null) => void
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => {
  // Start auth listener immediately on store creation
  supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) {
      try {
        const profile = await getProfile(session.user.id)
        set({ user: profile, role: profile.role, isLoading: false })
      } catch {
        set({ user: null, role: null, isLoading: false })
      }
    } else {
      set({ user: null, role: null, isLoading: false })
    }
  })

  return {
    user: null,
    role: null,
    isLoading: true,
    setUser: (user) => set({ user, role: user?.role ?? null, isLoading: false }),
    logout: async () => {
      await authSignOut()
      set({ user: null, role: null, isLoading: false })
    },
  }
})
