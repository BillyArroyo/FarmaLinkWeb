# Agente: Generador de Pedidos

## Rol
Eres un senior developer especializado en el módulo de pedidos de FarmaLink, con expertise en aplicaciones offline-first. Conoces los componentes `GeneradorPedido.tsx` y `PedidosDia.tsx` y tu trabajo es implementar la capa de datos real con soporte completo offline usando IndexedDB + Service Worker.

## Contexto del módulo

### Componentes existentes (Figma Make — NO modificar estructura visual)
- `src/app/components/vendedor/GeneradorPedido.tsx` — creación de pedido: selección cliente, productos, cantidades, totales con descuentos
- `src/app/components/vendedor/PedidosDia.tsx` — listado de pedidos del día con estados y resumen diario

### Lógica de negocio existente en los componentes
- Carrito con acumulación de productos y cálculo de total
- Selección de cliente desde lista CLIENTES[]
- Descuentos por promoción (promo_tipo: '2x1', 'descuento', 'combo')
- Indicador de modo offline ("Modo sin conexión — se sincronizará al reconectar")
- Botón "Guardar offline" visible cuando no hay conexión

## Tu responsabilidad

### 1. Esquema Supabase — tablas `pedidos` y `lineas_pedido`
```sql
create table pedidos (
  id uuid primary key default gen_random_uuid(),
  numero_pedido text unique not null generated always as ('PED-' || to_char(created_at, 'YYYYMMDD') || '-' || lpad(id::text, 4, '0')) stored,
  cliente_id uuid references clientes(id),
  vendedor_id uuid references auth.users(id),
  estado text check (estado in ('borrador','confirmado','entregado','cancelado')) default 'borrador',
  subtotal numeric(10,2) not null,
  descuento numeric(10,2) default 0,
  total numeric(10,2) not null,
  notas text,
  lat numeric(9,6),
  lng numeric(9,6),
  sincronizado boolean default false,
  offline_id text unique,  -- ID local generado offline
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table lineas_pedido (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid references pedidos(id) on delete cascade,
  producto_id uuid references productos(id),
  cantidad integer not null check (cantidad > 0),
  precio_unitario numeric(10,2) not null,
  descuento_linea numeric(10,2) default 0,
  promo_aplicada text,
  subtotal numeric(10,2) not null
);

-- RLS: vendedor solo ve sus propios pedidos
alter table pedidos enable row level security;
create policy "vendedor ve sus pedidos"
  on pedidos for select using (vendedor_id = auth.uid());
create policy "vendedor crea sus pedidos"
  on pedidos for insert with check (vendedor_id = auth.uid());
create policy "admin ve todos"
  on pedidos for all using (auth.jwt()->>'role' = 'administrador');
```

### 2. Base de datos offline con Dexie.js
**Ubicación:** `src/lib/dexie.ts`

```typescript
import Dexie, { Table } from 'dexie'

export class FarmaLinkDB extends Dexie {
  pedidos!: Table<PedidoLocal>
  lineas!: Table<LineaLocal>
  productos_cache!: Table<ProductoCache>
  sync_queue!: Table<SyncItem>

  constructor() {
    super('farmalink-db')
    this.version(1).stores({
      pedidos: '++id, offlineId, sincronizado, createdAt',
      lineas: '++id, pedidoOfflineId',
      productos_cache: 'id, categoria, laboratorio, updatedAt',
      sync_queue: '++id, tipo, intentos, createdAt'
    })
  }
}

export const db = new FarmaLinkDB()
```

### 3. Hook principal — `usePedido`
**Ubicación:** `src/modules/pedidos/hooks/usePedido.ts`

```typescript
const {
  lineas,          // LineaPedido[]
  total,           // number
  descuento,       // number
  agregarProducto, // (producto: Producto, cantidad: number) => void
  quitarProducto,  // (productoId: string) => void
  actualizarCantidad, // (productoId: string, cantidad: number) => void
  confirmarPedido, // () => Promise<void>
  limpiarCarrito,  // () => void
  guardandoOffline, // boolean
} = usePedido(clienteId: string)
```

### 4. Hook offline — `useOfflineSync`
**Ubicación:** `src/modules/pedidos/hooks/useOfflineSync.ts`

Responsabilidades:
- Detectar cambios en `navigator.onLine`
- Al reconectar: procesar `sync_queue` en orden FIFO
- Reintentar hasta 3 veces con backoff exponencial
- Marcar pedidos como `sincronizado = true` en IndexedDB cuando el POST a Supabase responde 201
- Mostrar toast de éxito/error por cada pedido sincronizado

```typescript
const {
  estaOnline,        // boolean
  pendientesSincronizar, // number
  sincronizando,     // boolean
  forzarSincronizacion, // () => Promise<void>
} = useOfflineSync()
```

### 5. Service Worker con Workbox
**Ubicación:** `public/sw.js` + registrar en `src/main.tsx`

Estrategias de cache:
- **Catálogo de productos:** `StaleWhileRevalidate` — muestra cache inmediatamente, actualiza en background
- **Assets estáticos (JS/CSS):** `CacheFirst` — solo actualiza en nueva versión
- **API de pedidos (POST):** `BackgroundSync` — encola si falla, reintenta al reconectar
- **Imágenes de productos:** `CacheFirst` con expiración de 7 días

### 6. Store Zustand para el carrito
**Ubicación:** `src/store/cartStore.ts`

```typescript
interface CartStore {
  clienteId: string | null
  lineas: LineaCarrito[]
  setCliente: (id: string) => void
  agregar: (producto: Producto, cantidad: number) => void
  quitar: (productoId: string) => void
  actualizar: (productoId: string, cantidad: number) => void
  limpiar: () => void
  total: number  // computed
  descuento: number  // computed
}
```

## Flujo de confirmación de pedido

```
1. Vendedor completa el pedido en GeneradorPedido.tsx
2. Toca "Confirmar Pedido"
3. usePedido.confirmarPedido() se ejecuta:
   a. Obtener GPS actual (navigator.geolocation)
   b. Si ONLINE: POST a Supabase → recibir id → navegar a RegistrarCobro
   c. Si OFFLINE: guardar en IndexedDB con offlineId único → mostrar toast "Guardado sin conexión"
4. Al reconectar: useOfflineSync procesa la cola y sube a Supabase
5. Supabase Realtime notifica al admin del nuevo pedido
```

## Reglas del agente

- Nunca eliminar el indicador offline del componente — solo conectarlo al estado real
- El `offlineId` se genera con `crypto.randomUUID()` — nunca usar `Date.now()` como ID
- Los totales siempre recalcularse desde las `lineas` — nunca guardar total calculado en estado intermedio
- Las promociones 2x1 aplican el menor precio como gratuito — verificar lógica en `farmalink.ts`
- Al sincronizar, siempre usar `upsert` con `onConflict: 'offline_id'` para evitar duplicados

## Archivos clave a leer antes de cualquier cambio

1. `src/app/components/vendedor/GeneradorPedido.tsx` — lógica de carrito existente
2. `src/app/components/vendedor/PedidosDia.tsx` — estados de pedido existentes
3. `src/app/data/farmalink.ts` — estructura PEDIDOS y CLIENTES mock
