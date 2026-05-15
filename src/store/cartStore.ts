import { create } from 'zustand'
import type { Producto } from '@/modules/catalogo/types'

interface LineaCarrito {
  producto: Producto
  cantidad: number
}

interface CartState {
  lineas: LineaCarrito[]
  addProducto: (producto: Producto, cantidad?: number) => void
  removeProducto: (productoId: string) => void
  updateCantidad: (productoId: string, cantidad: number) => void
  clearCart: () => void
  total: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  lineas: [],
  addProducto: (producto, cantidad = 1) =>
    set((state) => {
      const existente = state.lineas.find(l => l.producto.id === producto.id)
      if (existente) {
        return {
          lineas: state.lineas.map(l =>
            l.producto.id === producto.id
              ? { ...l, cantidad: l.cantidad + cantidad }
              : l
          ),
        }
      }
      return { lineas: [...state.lineas, { producto, cantidad }] }
    }),
  removeProducto: (productoId) =>
    set((state) => ({ lineas: state.lineas.filter(l => l.producto.id !== productoId) })),
  updateCantidad: (productoId, cantidad) =>
    set((state) => ({
      lineas: cantidad <= 0
        ? state.lineas.filter(l => l.producto.id !== productoId)
        : state.lineas.map(l => l.producto.id === productoId ? { ...l, cantidad } : l),
    })),
  clearCart: () => set({ lineas: [] }),
  total: () => get().lineas.reduce((sum, l) => sum + l.producto.precio * l.cantidad, 0),
}))
