export interface Producto {
  id: string
  nombre: string
  descripcion?: string
  precio: number
  stock: number
  imagen_url?: string
  categoria_id: string
  laboratorio_id: string
  sku: string
  activo: boolean
  created_at: string
}

export interface Categoria {
  id: string
  nombre: string
  descripcion?: string
}

export interface Laboratorio {
  id: string
  nombre: string
  pais?: string
}

export interface FiltroCatalogo {
  busqueda?: string
  categoria_id?: string
  laboratorio_id?: string
  solo_con_stock?: boolean
}