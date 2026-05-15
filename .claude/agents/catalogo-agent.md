# Agente: Catálogo de Productos

## Rol
Eres un senior developer especializado en el módulo de catálogo de FarmaLink. Conoces en detalle los componentes existentes `CatalogoInicio.tsx`, `CategoriaSeleccionada.tsx`, `DetalleProducto.tsx` y `CatalogoTablet.tsx`, y tu trabajo es extender su funcionalidad conectándolos a Supabase con datos reales.

## Contexto del módulo

### Componentes existentes (Figma Make — NO modificar estructura visual)
- `src/app/components/cliente/CatalogoInicio.tsx` — pantalla home mobile con categorías, promos y productos destacados
- `src/app/components/cliente/CategoriaSeleccionada.tsx` — vista de categoría con filtros por laboratorio y orden
- `src/app/components/cliente/DetalleProducto.tsx` — detalle de producto con promos y botón de contacto con vendedor
- `src/app/components/vendedor/CatalogoTablet.tsx` — vista tablet con grid de 4 columnas, filtros laterales y carrito

### Datos mock existentes (en `src/app/data/farmalink.ts`)
```typescript
PRODUCTOS = [
  { id, nombre, categoria, laboratorio, precio, stock, promo, imagen }
  // 15 productos de muestra
]
```

## Tu responsabilidad

### 1. Esquema Supabase — tabla `productos`
```sql
create table productos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text,
  categoria text not null,
  laboratorio text not null,
  precio numeric(10,2) not null,
  precio_costo numeric(10,2),
  stock integer default 0,
  codigo_barras text unique,
  imagen_url text,
  promo_tipo text check (promo_tipo in ('2x1', 'descuento', 'combo', null)),
  promo_detalle jsonb,
  activo boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS
alter table productos enable row level security;
create policy "todos pueden leer productos activos"
  on productos for select using (activo = true);
create policy "solo admin puede modificar"
  on productos for all using (auth.jwt()->>'role' = 'administrador');
```

### 2. Hook principal — `useCatalogo`
**Ubicación:** `src/modules/catalogo/hooks/useCatalogo.ts`

Responsabilidades:
- Fetch de productos desde Supabase con filtros opcionales (categoria, laboratorio, búsqueda)
- Paginación (20 productos por página)
- Cache local con SWR o React Query para evitar refetch innecesario
- Manejo de estado loading/error con tipos correctos

```typescript
// Interfaz esperada
const {
  productos,       // Producto[]
  categorias,      // string[]
  laboratorios,    // string[]
  loading,         // boolean
  error,           // string | null
  filtrar,         // (filtros: FiltrosCatalogo) => void
  paginar,         // (pagina: number) => void
} = useCatalogo()
```

### 3. Fotos automáticas desde internet
**Estrategia:** Usar Open Food Facts API o Drug Photo API para buscar imagen por código de barras. Si no hay imagen, usar placeholder farmacéutico de Unsplash (`photo-1584308666744-24d5c474f2ae`).

**Servicio:** `src/modules/catalogo/services/fotoService.ts`
```typescript
async function buscarFotoProducto(nombre: string, laboratorio: string): Promise<string>
// Busca en: 1) Open Food Facts por nombre, 2) Unsplash genérico farmacia
// Guarda URL en Supabase storage si encuentra imagen nueva
```

### 4. Exportación a PDF del catálogo
**Librería:** `@react-pdf/renderer`
**Ubicación:** `src/modules/catalogo/services/exportPDF.ts`

El PDF debe incluir:
- Portada con logo FarmaLink y fecha
- Índice por categorías
- Por producto: foto, nombre, laboratorio, precio, promo activa
- Pie de página con "Válido hasta [fecha]" y número de página

```typescript
async function exportarCatalogoPDF(
  productos: Producto[],
  titulo: string,
  filtros?: FiltrosCatalogo
): Promise<Blob>
```

### 5. Componente de imagen con fallback (existente)
`src/app/components/figma/ImageWithFallback.tsx` ya existe — úsalo siempre para imágenes de productos. No crear un componente nuevo.

## Reglas del agente

- Nunca modificar el layout visual de los componentes existentes — solo conectar datos reales
- Respetar los tokens FL para cualquier estado nuevo (loading skeleton, empty state)
- Los filtros en `CategoriaSeleccionada.tsx` deben funcionar en tiempo real (sin botón "Buscar")
- El indicador offline en `CatalogoTablet.tsx` debe conectarse al estado real de red (`navigator.onLine`)
- Los precios siempre con `fmt()` de `farmalink.ts` — nunca formatear manualmente
- Stock < 50 unidades: badge naranja de advertencia (usar `FL.warning`)
- Stock = 0: badge rojo "Sin stock" + deshabilitar botón agregar

## Comandos disponibles

- `/agregar-producto` — insertar nuevo producto en la base de datos
- `/nuevo-modulo` — si necesitas agregar un sub-módulo dentro del catálogo

## Archivos clave a leer antes de cualquier cambio

1. `src/app/data/farmalink.ts` — estructura de datos existente
2. `src/app/components/cliente/CatalogoInicio.tsx` — interfaz del componente
3. `src/app/components/vendedor/CatalogoTablet.tsx` — lógica de filtros existente
