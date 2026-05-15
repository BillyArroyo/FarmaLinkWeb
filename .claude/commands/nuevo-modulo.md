# Comando: /nuevo-modulo

## Descripción
Crea la estructura completa de un nuevo módulo siguiendo las convenciones del proyecto FarmaLink. Genera los archivos base en `src/modules/[nombre]/` con hooks, servicios y tipos ya conectados al patrón existente.

## Uso
```
/nuevo-modulo [nombre-del-modulo]
```

**Ejemplo:**
```
/nuevo-modulo inventario
/nuevo-modulo devoluciones
/nuevo-modulo rutas
```

## Lo que hace este comando

Al ejecutar `/nuevo-modulo [nombre]`, Claude debe:

### 1. Verificar prerrequisitos
- Leer `src/app/data/farmalink.ts` para entender los tipos de datos existentes
- Revisar `src/modules/` para evitar duplicar módulos ya existentes
- Preguntar: "¿Este módulo es para el rol cliente, vendedor, admin o compartido?"

### 2. Crear la estructura de carpetas
```
src/modules/[nombre]/
├── hooks/
│   └── use[Nombre].ts        # Hook principal del módulo
├── services/
│   └── [nombre]Service.ts    # Queries Supabase del módulo
└── types.ts                  # Interfaces y types del módulo
```

### 3. Generar el archivo `types.ts`
```typescript
// src/modules/[nombre]/types.ts

export interface [Nombre] {
  id: string
  // Agregar campos según el módulo
  created_at: string
  updated_at?: string
}

export interface [Nombre]Filtros {
  // Filtros típicos del módulo
}

export interface [Nombre]Form {
  // Campos del formulario de creación/edición
}
```

### 4. Generar el archivo `[nombre]Service.ts`
```typescript
// src/modules/[nombre]/services/[nombre]Service.ts
import { supabase } from '@/lib/supabase'
import type { [Nombre], [Nombre]Filtros } from '../types'

export async function getAll(filtros?: [Nombre]Filtros): Promise<[Nombre][]> {
  const query = supabase.from('[nombre]s').select('*')
  // Aplicar filtros dinámicamente
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getById(id: string): Promise<[Nombre]> {
  const { data, error } = await supabase
    .from('[nombre]s')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function create(form: [Nombre]Form): Promise<[Nombre]> {
  const { data, error } = await supabase
    .from('[nombre]s')
    .insert(form)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function update(id: string, form: Partial<[Nombre]Form>): Promise<[Nombre]> {
  const { data, error } = await supabase
    .from('[nombre]s')
    .update(form)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function remove(id: string): Promise<void> {
  const { error } = await supabase.from('[nombre]s').delete().eq('id', id)
  if (error) throw error
}
```

### 5. Generar el hook `use[Nombre].ts`
```typescript
// src/modules/[nombre]/hooks/use[Nombre].ts
import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import * as service from '../services/[nombre]Service'
import type { [Nombre], [Nombre]Filtros } from '../types'

export function use[Nombre](filtrosIniciales?: [Nombre]Filtros) {
  const [[nombre]s, set[Nombre]s] = useState<[Nombre][]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargar = useCallback(async (filtros?: [Nombre]Filtros) => {
    setLoading(true)
    setError(null)
    try {
      const data = await service.getAll(filtros)
      set[Nombre]s(data)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error cargando datos'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { cargar(filtrosIniciales) }, [])

  const crear = async (form: [Nombre]Form) => {
    try {
      const nuevo = await service.create(form)
      set[Nombre]s(prev => [nuevo, ...prev])
      toast.success('[Nombre] creado correctamente')
      return nuevo
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al crear'
      toast.error(msg)
      throw e
    }
  }

  const actualizar = async (id: string, form: Partial<[Nombre]Form>) => {
    try {
      const actualizado = await service.update(id, form)
      set[Nombre]s(prev => prev.map(item => item.id === id ? actualizado : item))
      toast.success('[Nombre] actualizado correctamente')
      return actualizado
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al actualizar'
      toast.error(msg)
      throw e
    }
  }

  const eliminar = async (id: string) => {
    try {
      await service.remove(id)
      set[Nombre]s(prev => prev.filter(item => item.id !== id))
      toast.success('[Nombre] eliminado')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al eliminar'
      toast.error(msg)
      throw e
    }
  }

  return {
    [nombre]s,
    loading,
    error,
    cargar,
    crear,
    actualizar,
    eliminar,
  }
}
```

### 6. Agregar agente al directorio `.claude/agents/`
Crear `.claude/agents/[nombre]-agent.md` con:
- Descripción del módulo
- Componentes relacionados
- Esquema Supabase recomendado
- Reglas específicas del módulo

### 7. Verificar convenciones
Antes de terminar, verificar que:
- [ ] Los nombres están en español (español peruano, sin tildes en nombres de archivo)
- [ ] El servicio usa el patrón `const { data, error } = await supabase...`
- [ ] El hook usa `toast` de `sonner` para errores
- [ ] Los tipos importan desde `../types` (relativo, no absoluto)
- [ ] El hook exporta con nombre `use[NombreEnPascalCase]`

## Notas importantes
- Este comando NO crea componentes UI — solo la capa de datos/lógica
- Para crear el componente UI del módulo, leer los componentes existentes en `src/app/components/` como referencia de patrones
- Siempre usar los tokens FL definidos en `src/app/data/farmalink.ts` para estilos
- Si el módulo necesita offline support, consultar el agente `pedidos-agent.md`
