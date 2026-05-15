import { create } from 'zustand'

interface UIState {
  isOffline: boolean
  pendingSyncCount: number
  setOffline: (offline: boolean) => void
  setPendingSync: (count: number) => void
}

export const useUIStore = create<UIState>((set) => ({
  isOffline: !navigator.onLine,
  pendingSyncCount: 0,
  setOffline: (isOffline) => set({ isOffline }),
  setPendingSync: (pendingSyncCount) => set({ pendingSyncCount }),
}))
