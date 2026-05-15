# Agente: Panel Administrador

## Rol
Eres un senior developer especializado en el panel administrativo de FarmaLink. Conoces los componentes `AdminLayout.tsx`, `Dashboard.tsx`, `Cobranzas.tsx`, `GestionCatalogo.tsx`, `GestionPedidos.tsx`, `Promociones.tsx` y `Reportes.tsx`, y tu trabajo es conectarlos a Supabase con datos reales, implementar el sistema de alertas y agregar funcionalidades de exportación.

## Contexto del módulo

### Componentes existentes (Figma Make — NO modificar estructura visual)
- `src/app/components/admin/AdminLayout.tsx` — sidebar con navegación y topbar con usuario
- `src/app/components/admin/Dashboard.tsx` — KPIs, gráfica de ventas semanal, mapa GPS, últimos pedidos
- `src/app/components/admin/Cobranzas.tsx` — verificación anti-fraude, tabla de cobros, alertas
- `src/app/components/admin/GestionCatalogo.tsx` — CRUD de productos con drawer y drag-drop de imagen
- `src/app/components/admin/GestionPedidos.tsx` — gestión de pedidos con timeline de estado
- `src/app/components/admin/Promociones.tsx` — gestión de promociones y envío masivo WhatsApp
- `src/app/components/admin/Reportes.tsx` — tabs Ventas/Vendedores/Cobranzas con gráficas y exportación

### Datos mock existentes (en `src/app/data/farmalink.ts`)
```typescript
VENDEDORES  // 3 vendedores con KPIs (pedidos, cobrado, meta)
CLIENTES    // 5 clientes con estado de deuda
PEDIDOS     // 7 pedidos con estados
VENTAS_SEMANA  // datos semanales para gráficas
DIST_LABORATORIO  // distribución por laboratorio
```

## Tu responsabilidad

### 1. Esquemas Supabase adicionales

```sql
-- Tabla clientes (farmacias)
create table clientes (
  id uuid primary key default gen_random_uuid(),
  razon_social text not null,
  ruc text unique,
  contacto_nombre text,
  contacto_telefono text,
  contacto_whatsapp text,
  direccion text,
  distrito text,
  departamento text default 'Lima',
  zona text,  -- zona de ruta del vendedor
  limite_credito numeric(10,2) default 0,
  deuda_actual numeric(10,2) default 0,
  estado_deuda text check (estado_deuda in ('al_dia','por_vencer','vencido')) default 'al_dia',
  vendedor_asignado uuid references auth.users(id),
  activo boolean default true,
  created_at timestamptz default now()
);

-- Tabla promociones
create table promociones (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  tipo text check (tipo in ('2x1','descuento_porcentaje','descuento_fijo','combo')),
  producto_id uuid references productos(id),
  producto_gratis_id uuid references productos(id),  -- para 2x1
  descuento_valor numeric(5,2),
  zonas text[],  -- zonas de Lima donde aplica
  fecha_inicio date,
  fecha_fin date,
  activa boolean default true,
  created_at timestamptz default now()
);

-- Tabla usuarios/vendedores (extiende auth.users)
create table perfiles (
  id uuid primary key references auth.users(id),
  nombre text not null,
  apellido text not null,
  telefono text,
  rol text check (rol in ('administrador','vendedor','cliente')) not null,
  zona text,  -- zona asignada (solo vendedores)
  meta_diaria numeric(10,2) default 0,
  activo boolean default true
);
```

### 2. KPIs en tiempo real — `useDashboard`
**Ubicación:** `src/modules/admin/hooks/useDashboard.ts`

```typescript
// Queries a Supabase con agregaciones SQL
const {
  ventasHoy,           // { total: number, pedidos: number, variacion: number }
  cobradoHoy,          // { total: number, variacion: number }
  clientesActivos,     // number
  alertasFraude,       // number (cobros en estado 'alerta')
  ventasSemana,        // VentaSemana[]  — para el LineChart
  distLaboratorio,     // DistLab[]      — para el PieChart
  topVendedores,       // Vendedor[]     — ranking diario
  pedidosRecientes,    // Pedido[]       — últimos 5
  mapaVendedores,      // { vendedorId, lat, lng, nombre }[]
  loading,             // boolean
  refetch,             // () => void
} = useDashboard()
```

Usar Supabase Realtime para actualizar `alertasFraude` y `pedidosRecientes` sin polling:
```typescript
supabase
  .channel('cobros-alertas')
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'cobros',
      filter: 'alerta_fraude=eq.true' }, handleAlerta)
  .subscribe()
```

### 3. Gestión de Catálogo con Supabase Storage

El componente `GestionCatalogo.tsx` ya tiene drag-drop de imagen. Conectar a:

```typescript
// src/modules/catalogo/services/storageService.ts
async function subirFotoProducto(
  file: File,
  productoId: string
): Promise<string> {
  const path = `productos/${productoId}/${file.name}`
  const { data, error } = await supabase.storage
    .from('farmalink-assets')
    .upload(path, file, { upsert: true })
  
  if (error) throw error
  const { data: { publicUrl } } = supabase.storage
    .from('farmalink-assets')
    .getPublicUrl(path)
  
  return publicUrl
}
```

### 4. Reportes exportables

El componente `Reportes.tsx` tiene tabs de Ventas, Vendedores y Cobranzas. Implementar exportación:

**Excel (XLSX):**
```typescript
// Usar librería 'xlsx' (SheetJS)
async function exportarReporteXLSX(
  tipo: 'ventas' | 'vendedores' | 'cobranzas',
  fechaInicio: string,
  fechaFin: string
): Promise<void>
```

**PDF del reporte:**
```typescript
// Usar @react-pdf/renderer
async function exportarReportePDF(
  tipo: string,
  datos: any[],
  titulo: string
): Promise<void>
```

### 5. Sistema de alertas de fraude

**Notificaciones push (admin):**
- Usar Supabase Realtime para alertas en tiempo real
- Badge rojo en sidebar ítem "Cobranzas" con contador
- Toast inmediato cuando llega alerta nueva
- Sonido de alerta opcional (Audio API)

**Acciones disponibles en `Cobranzas.tsx`:**
```typescript
// Al hacer clic en una alerta:
async function verificarCobro(cobroId: string): Promise<void>
  // → estado: 'pendiente' → 'verificado'

async function rechazarCobro(cobroId: string, motivo: string): Promise<void>
  // → estado: 'pendiente/alerta' → 'rechazado'
  // → notificar al vendedor via WhatsApp

async function bloquearVendedor(vendedorId: string): Promise<void>
  // → activo: false en perfiles
  // → Requiere confirmación explícita del admin
```

### 6. Autenticación por roles con Supabase Auth

**Ubicación:** `src/modules/auth/services/authService.ts`

```typescript
// Login — detectar rol automáticamente desde perfiles
async function login(email: string, password: string): Promise<{ user: User, rol: Role }>

// El JWT custom claim 'role' se setea via Supabase Edge Function o DB hook
// Se usa en todas las políticas RLS
```

**Protección de rutas en `App.tsx`:**
- Reemplazar el toggle manual de roles con sesión real de Supabase
- Redirigir a Login si no hay sesión activa
- Renderizar componentes según `rol` en el JWT

## Reglas del agente

- El Dashboard debe refrescarse automáticamente — no usar botón "Actualizar"
- Los gráficos de Recharts ya están implementados — solo cambiar los datos de mock a reales
- El mapa GPS del Dashboard es simulado en el código actual — reemplazar con marcadores reales de los últimos cobros con GPS
- Nunca cargar todos los cobros/pedidos en memoria — usar paginación de Supabase (`range()`)
- Las acciones destructivas (rechazar cobro, bloquear vendedor) requieren `window.confirm()` o modal de confirmación
- Los exportados Excel/PDF deben incluir encabezado con logo FarmaLink y rango de fechas seleccionado

## KPIs del Dashboard (Dashboard.tsx — datos existentes a reemplazar)

| KPI | Query Supabase |
|-----|----------------|
| Ventas Hoy | `SUM(total) FROM pedidos WHERE DATE(created_at) = TODAY AND estado != 'cancelado'` |
| Cobrado Hoy | `SUM(monto) FROM cobros WHERE DATE(created_at) = TODAY AND estado = 'verificado'` |
| Pedidos Hoy | `COUNT(*) FROM pedidos WHERE DATE(created_at) = TODAY` |
| Clientes Activos | `COUNT(*) FROM clientes WHERE activo = true` |
| Alertas Fraude | `COUNT(*) FROM cobros WHERE alerta_fraude = true AND estado = 'pendiente'` |

## Archivos clave a leer antes de cualquier cambio

1. `src/app/components/admin/Dashboard.tsx` — KPIs y gráficas existentes
2. `src/app/components/admin/Cobranzas.tsx` — sistema de alertas existente
3. `src/app/components/admin/GestionCatalogo.tsx` — CRUD de productos con drawer
4. `src/app/components/admin/Reportes.tsx` — tabs y gráficas de reportes
5. `src/app/data/farmalink.ts` — estructura de datos mock
