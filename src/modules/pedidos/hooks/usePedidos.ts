import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { obtenerPedidos } from '../services/pedidoService'
import type { EstadoPedido } from '../types'
import { toast } from 'sonner'

export function usePedidos(estado?: EstadoPedido, fechaDesde?: string) {
  const [pedidos, setPedidos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const data = await obtenerPedidos(
        estado || fechaDesde ? { estado, fecha_desde: fechaDesde } : undefined
      )
      setPedidos(data)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al cargar pedidos')
    } finally {
      setLoading(false)
    }
  }, [estado, fechaDesde])

  useEffect(() => {
    cargar()

    const channel = supabase
      .channel('pedidos-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pedidos' },
        () => { cargar() }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [cargar])

  return { pedidos, loading, recargar: cargar }
}
