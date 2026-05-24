# FarmaLink B2B — Arquitectura del proyecto

## Stack
| Capa | Tecnología |
|------|-----------|
| UI | React 18 + TypeScript + Vite |
| Estilos | Tailwind CSS v4 + FL tokens inline |
| UI Components | shadcn/ui + Radix UI |
| Estado global | Zustand |
| Backend / DB | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| Validación | Zod 4 |
| PDF / impresión | CSS print + @page nativo |
| Excel import | SheetJS (xlsx) |

---

## Separación de capas

```
┌─────────────────────────────────────────────────────────┐
│  FRONTEND  (UI, UX, navegación, estado visual)          │
│                                                         │
│  src/app/                                               │
│  ├── App.tsx                Router / navegación          │
│  ├── components/admin/      Pantallas rol Administrador  │
│  ├── components/cliente/    Pantallas rol Cliente        │
│  ├── components/vendedor/   Pantallas rol Vendedor       │
│  ├── components/ui/         shadcn/ui — primitivos       │
│  └── data/farmalink.ts      Design tokens FL             │
│                                                         │
│  src/store/                                             │
│  ├── cartStore.ts           Carrito (Zustand)            │
│  ├── authStore.ts           Sesión y rol (Zustand)       │
│  └── uiStore.ts             UI state — offline, modales  │
│                                                         │
│  src/styles/                                            │
│  ├── theme.css              Variables CSS FL             │
│  ├── fonts.css              Plus Jakarta Sans            │
│  └── index.css              Entry point estilos          │
├─────────────────────────────────────────────────────────┤
│  SCHEMAS  (validación compartida frontend ↔ backend)    │
│                                                         │
│  src/schemas/                                           │
│  ├── pedidoSchema.ts        CrearPedido, ActualizarEstado│
│  ├── clienteSchema.ts       CrearCliente                 │
│  ├── productoSchema.ts      Import Excel, Update         │
│  └── index.ts               Re-exports                   │
├─────────────────────────────────────────────────────────┤
│  BACKEND / DATA LAYER  (lógica de negocio, DB access)   │
│                                                         │
│  src/modules/                                           │
│  ├── pedidos/                                           │
│  │   ├── services/pedidoService.ts  CRUD pedidos        │
│  │   ├── hooks/usePedidos.ts        Realtime + queries  │
│  │   └── types.ts                  Interfaces           │
│  ├── catalogo/                                          │
│  │   ├── services/           (pendiente)                │
│  │   ├── hooks/useProductos.ts  Fetch productos         │
│  │   ├── hooks/useLaboratorios.ts  Fetch laboratorios   │
│  │   └── types.ts                                       │
│  ├── clientes/                                          │
│  │   └── services/clienteService.ts  CRUD clientes      │
│  ├── auth/                   (pendiente — Supabase Auth) │
│  ├── cobranzas/              (pendiente — Recibos/Hash)  │
│  └── whatsapp/               (pendiente — Meta API)     │
│                                                         │
│  src/lib/                                               │
│  ├── supabase.ts             Cliente Supabase singleton  │
│  ├── hash.ts                 SHA-256 anti-fraude         │
│  ├── dexie.ts                IndexedDB offline (futuro)  │
│  └── utils.ts                cn(), fmt(), helpers        │
└─────────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────────┐
│  SUPABASE (Backend as a Service)                        │
│  PostgreSQL · Auth · Storage · Realtime                 │
│  URL: https://xbjniegnmwqzrrmwfimz.supabase.co         │
└─────────────────────────────────────────────────────────┘
```

---

## Regla de oro por capa

| Capa | Puede importar de | NO puede importar de |
|------|------------------|----------------------|
| `app/components/` | `store/`, `modules/*/hooks/`, `lib/utils`, `schemas/` | `modules/*/services/` directamente |
| `store/` | `modules/*/types`, `lib/` | `app/components/`, `modules/*/services/` |
| `modules/*/hooks/` | `modules/*/services/`, `lib/`, `schemas/`, `store/` | `app/components/` |
| `modules/*/services/` | `lib/supabase`, `schemas/`, `modules/*/types` | React, `app/`, `store/` |
| `schemas/` | `zod` solamente | Nada de la app |

> Los componentes llaman **siempre hooks**, nunca services directamente.
> Los hooks llaman services. Los services validan con schemas antes de tocar la DB.

---

## Flujo de un pedido (ejemplo completo)

```
[CatalogoInicio] → addProducto() → [cartStore]
       ↓
[CarritoCheckout] → handleConfirmar()
       ↓
[clienteService.obtenerOCrearCliente()]  ← valida con CrearClienteSchema
       ↓
[pedidoService.crearPedido()]            ← valida con CrearPedidoSchema
       ↓
[Supabase: INSERT pedidos + lineas_pedido]
       ↓  (Realtime trigger)
[usePedidos] → setPedidos() → [PedidosDia] / [GestionPedidos]
```

---

## Assets del proyecto

### `public/` — Assets estáticos servidos por Vite

| Archivo | Uso | Componente |
|---------|-----|-----------|
| `logocannanfarma.png` | Logo en encabezado del catálogo impreso | `CatalogoImprimir.tsx:316` |
| `fondoverticalcatalogos.png` | Fondo modo vertical (9 productos/página) | `CatalogoImprimir.tsx:443` |
| `fondohorizontalcatalogos.png` | Fondo modo horizontal (4 productos/página) | `CatalogoImprimir.tsx:443` |

### `Supabase Storage` — Imágenes de productos

| Bucket | Patrón de nombre | Uso |
|--------|-----------------|-----|
| `imagenes-productos` | `{productoId}_1.png`, `_2.png`, `_3.png` | Fotos del catálogo |

URL base: `https://xbjniegnmwqzrrmwfimz.supabase.co/storage/v1/object/public/imagenes-productos/`

### Fuentes

| Fuente | Cómo se carga | Archivo |
|--------|--------------|---------|
| Plus Jakarta Sans | Google Fonts (`@import` en CSS) | `src/styles/fonts.css` |

---

## Dependencias a eliminar antes de producción

Estas están instaladas pero **no se usan** en ningún componente activo:

| Paquete | Motivo de instalación original | Acción |
|---------|-------------------------------|--------|
| `@mui/material` + `@mui/icons-material` | Remanente de prototipo Figma Make | `pnpm remove @mui/material @mui/icons-material @emotion/react @emotion/styled` |
| `react-slick` | No se usa en ningún componente | `pnpm remove react-slick` |
| `react-dnd` + `react-dnd-html5-backend` | No implementado | `pnpm remove react-dnd react-dnd-html5-backend` |
| `react-popper` + `@popperjs/core` | Cubierto por Radix UI | `pnpm remove react-popper @popperjs/core` |
| `next-themes` | Proyecto no usa Next.js | `pnpm remove next-themes` |
| `react-responsive-masonry` | No se usa | `pnpm remove react-responsive-masonry` |

---

## Variables de entorno

| Variable | Dónde se usa | Exposición |
|----------|-------------|-----------|
| `VITE_SUPABASE_URL` | `src/lib/supabase.ts` | Pública (dominio de Supabase) |
| `VITE_SUPABASE_ANON_KEY` | `src/lib/supabase.ts` | Pública (solo permisos anon — proteger con RLS en prod) |
| `VITE_WHATSAPP_ACCESS_TOKEN` | `modules/whatsapp/` (futuro) | **Sensible — nunca al cliente en prod** |
| `VITE_NIUBIZ_API_URL` | `modules/cobranzas/` (futuro) | Pública (URL base) |

> **Alerta de seguridad:** `VITE_WHATSAPP_ACCESS_TOKEN` no debe exponerse en el frontend. Implementar como Edge Function de Supabase antes de producción.

---

## Módulos pendientes de implementar

| Módulo | Estado | Carpeta |
|--------|--------|---------|
| Auth por roles | Pendiente | `src/modules/auth/` |
| Cobranzas / Recibos | Pendiente | `src/modules/cobranzas/` |
| WhatsApp | Pendiente | `src/modules/whatsapp/` |
| Offline (IndexedDB) | Pendiente | `src/lib/dexie.ts` |
| Pagos (Niubiz/Yape) | Pendiente | `src/modules/cobranzas/` |
