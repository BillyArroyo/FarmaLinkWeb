import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface LaboratorioDB {
  id: string
  nombre: string
  pais: string
}

export function useLaboratorios() {
  const [laboratorios, setLaboratorios] = useState<LaboratorioDB[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('laboratorios')
      .select('id, nombre, pais')
      .eq('activo', true)
      .order('nombre')
      .then(({ data, error }) => {
        if (error) { console.error('useLaboratorios:', error.message); return }
        setLaboratorios(data ?? [])
        setLoading(false)
      })
  }, [])

  return { laboratorios, loading }
}