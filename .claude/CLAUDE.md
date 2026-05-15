# FarmaLink B2B — Documento Maestro del Proyecto

## Descripción del proyecto

**FarmaLink** es un sistema B2B de preventa y distribución farmacéutica para una distribuidora peruana de medicamentos. Conecta tres tipos de usuario — Cliente (farmacia), Vendedor de campo y Administrador de oficina — a través de una plataforma web progresiva con soporte offline, recibos digitales anti-fraude y panel de control administrativo.

---

## Stack tecnológico

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| Frontend | React 18 + TypeScript + Vite | Ya presente en el código Figma Make |
| Estilos | Tailwind CSS v4 + inline FL tokens | Patrón existente en el proyecto |
| UI Components | shadcn/ui + Radix UI | Ya instalado; usar para nuevos módulos |
| Gráficas | Recharts | Ya en uso en Dashboard/Reportes |
| Íconos | Lucide React | Ya en uso en todos los componentes |
| Backend | Supabase (PostgreSQL + Auth + Storage + Realtime) | BaaS con auth por roles, RLS, storage para fotos, realtime para pedidos |
| ORM/Queries | Supabase JS Client v2 | Integración directa, sin ORM adicional |
| Estado global | Zustand | Reemplaza prop drilling actual |
| Offline | IndexedDB via Dexie.js + Workbox (Service Worker) | Módulo de pedidos offline |
| PDF | @react-pdf/renderer | Generación de catálogos y recibos |
| QR | qrcode.react | Ya definido en ReciboDigital |
| Hash anti-fraude | crypto (Web API nativa) | SHA-256 sin dependencias externas |
| WhatsApp | Meta Business API (Cloud API) | Envío de recibos y promociones |
| Pagos | Niubiz API + Yape/Plin deep links | Integración peruana |
| Geolocalización | Browser Geolocation API + Supabase PostGIS | GPS por transacción |
| Hosting | Vercel (frontend) + Supabase (backend) | Plan gratuito para MVP |

---

## Arquitectura de carpetas recomendada

```
src/
├── app/
│   ├── App.tsx                    # Router maestro (mantener estructura actual)
│   ├── data/
│   │   └── farmalink.ts           # Tokens de diseño FL + datos mock (existente)
│   └── components/
│       ├── cliente/               # Rol Cliente — mobile 390px
│       ├── vendedor/              # Rol Vendedor — mobile 390px + tablet 820px
│       ├── admin/                 # Rol Administrador — desktop 1440px
│       │   └── ui/                # shadcn/Radix primitivos (existente)
│       └── figma/                 # Utilidades Figma Make (existente)
├── modules/                       # [NUEVO] Módulos de negocio
│   ├── catalogo/
│   │   ├── hooks/                 # useCatalogo, useProductoSearch, useExportPDF
│   │   ├── services/              # catalogoService.ts (Supabase queries)
│   │   └── types.ts               # Producto, Categoria, Laboratorio
│   ├── pedidos/
│   │   ├── hooks/                 # usePedido, useOfflineQueue, useSync
│   │   ├── services/              # pedidoService.ts, offlineDB.ts (Dexie)
│   │   └── types.ts               # Pedido, LineaPedido, EstadoPedido
│   ├── cobranzas/
│   │   ├── hooks/                 # useRecibo, useHashVerification, useGPS
│   │   ├── services/              # reciboService.ts, hashService.ts
│   │   └── types.ts               # Recibo, Cobro, MetodoPago
│   ├── auth/
│   │   ├── hooks/                 # useAuth, useRole
│   │   ├── services/              # authService.ts (Supabase Auth)
│   │   └── types.ts               # User, Role, Session
│   └── whatsapp/
│       ├── hooks/                 # useWhatsApp, usePlantilla
│       ├── services/              # whatsappService.ts (Meta API)
│       └── types.ts               # Mensaje, Plantilla, Envio
├── lib/
│   ├── supabase.ts                # Cliente Supabase singleton
│   ├── dexie.ts                   # Instancia IndexedDB offline
│   ├── hash.ts                    # SHA-256 anti-fraude
│   └── utils.ts                   # cn(), fmt(), formatDate()
├── store/
│   ├── authStore.ts               # Zustand — sesión y rol activo
│   ├── cartStore.ts               # Zustand — carrito de pedido
│   └── uiStore.ts                 # Zustand — navegación, modales
├── styles/
│   ├── index.css                  # Importaciones (existente)
│   ├── theme.css                  # Variables CSS FL (existente)
│   ├── fonts.css                  # Fuentes (existente)
│   └── tailwind.css               # Directivas Tailwind (existente)
└── main.tsx                       # Entry point (existente)
```

---

## Tokens de diseño FL (Design Tokens)

Definidos en `src/app/data/farmalink.ts`. **Nunca usar colores hardcodeados** fuera de este objeto.

```typescript
FL.primary    = '#4AABDB'   // Celeste corporativo
FL.secondary  = '#7ECBA1'   // Verde menta
FL.bg         = '#F0F8FF'   // Fondo general
FL.text       = '#1A2E3B'   // Texto principal
FL.textMuted  = '#5B7A8A'   // Texto secundario
FL.gradient   = 'linear-gradient(135deg, #4AABDB, #7ECBA1, #A8E6CF)'
FL.danger     = '#E74C3C'
FL.warning    = '#F39C12'
FL.success    = '#27AE60'
```

---

## Convenciones de código

### TypeScript
- Interfaces con prefijo `I` solo si hay conflicto de nombres; de lo contrario, sin prefijo
- Types para uniones: `type Role = 'cliente' | 'vendedor' | 'administrador'`
- Nunca usar `any` — usar `unknown` + type guard si es necesario
- Props siempre tipadas con interface local en el mismo archivo

### Componentes React
- Un archivo = un componente principal
- Componentes de UI pura sin lógica de negocio (la lógica va en hooks)
- Props callbacks con prefijo `on`: `onConfirmar`, `onCancelar`, `onNavegar`
- Hooks personalizados con prefijo `use`: `usePedido`, `useAuth`

### Estilos
- Patrón existente: `style={{ ...FL tokens }}` + `className="...tailwind..."`
- No introducir nuevas librerías CSS — mantener el patrón del proyecto
- Clases Tailwind solo para layout (flex, grid, gap, padding, margin)
- Propiedades visuales (colores, sombras, radios, gradientes) via FL tokens inline

### Supabase
- Queries siempre en `modules/[modulo]/services/`
- Usar RLS (Row Level Security) para cada tabla
- Nunca exponer `service_role` key en el cliente
- Tipos autogenerados con `supabase gen types typescript`

### Manejo de errores
- Nunca `catch` vacío — siempre loguear o mostrar toast
- Patrón: `const { data, error } = await supabase...`; verificar `error` antes de usar `data`
- Toast de error con `sonner` (ya instalado): `toast.error(error.message)`

---

## Módulos del sistema

### 1. Módulo Catálogo (`/modules/catalogo/`)
Catálogo de ~500 productos farmacéuticos con fotos, filtros por categoría/laboratorio, búsqueda, y exportación a PDF. Ver `.claude/agents/catalogo-agent.md`.

### 2. Módulo Pedidos (`/modules/pedidos/`)
Generador de pedidos desde el catálogo con soporte offline completo via IndexedDB + Service Worker. Sincronización automática al reconectar. Ver `.claude/agents/pedidos-agent.md`.

### 3. Módulo Cobranzas (`/modules/cobranzas/`)
Recibos digitales con hash SHA-256 anti-fraude, código QR único por cobro, geolocalización GPS por transacción. Ver `.claude/agents/cobranzas-agent.md`.

### 4. Módulo Admin (`/modules/admin/`)
Panel administrativo con dashboard de KPIs, alertas de fraude, gestión de productos y usuarios, reportes exportables. Ver `.claude/agents/admin-agent.md`.

### 5. Módulo WhatsApp (`/modules/whatsapp/`)
Integración Meta Business API para envío automático de recibos y campañas masivas de ofertas. Ver `.claude/agents/whatsapp-agent.md`.

---

## Cómo correr el proyecto localmente

### Requisitos
- Node.js 20+
- pnpm 9+

### Setup inicial
```bash
# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con las credenciales de Supabase

# Iniciar servidor de desarrollo
pnpm dev
# → http://localhost:5173
```

### Variables de entorno necesarias
```env
VITE_SUPABASE_URL=https://[proyecto].supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_WHATSAPP_ACCESS_TOKEN=EAAxx...
VITE_WHATSAPP_PHONE_NUMBER_ID=12345...
VITE_NIUBIZ_API_URL=https://...
```

### Build para producción
```bash
pnpm build
# Output en /dist — listo para deploy en Vercel
```

---

## Estado actual del código (Figma Make)

| Componente | Estado | Acción |
|-----------|--------|--------|
| Diseño UI / UX | ✅ Completo | Reutilizar tal cual |
| Tokens FL | ✅ Completo | Reutilizar tal cual |
| Datos mock | ✅ Completo | Reemplazar con Supabase |
| Navegación por estado | ✅ Funcional | Reemplazar con React Router |
| Anti-fraude hash (UI) | ✅ Diseño listo | Implementar lógica real |
| WhatsApp (UI preview) | ✅ Diseño listo | Implementar Meta API |
| Offline indicator | ⚠️ Solo UI | Implementar Service Worker real |
| Auth por roles | ❌ Falta | Implementar con Supabase Auth |
| Backend / API | ❌ Falta | Implementar con Supabase |
| Geolocalización real | ❌ Falta | Implementar Browser GPS |
| Pagos reales | ❌ Falta | Integrar Niubiz/Yape/Plin |
| Tests | ❌ Falta | Vitest + React Testing Library |

---

## Notas importantes

- El código Figma Make usa `react-router 7` instalado pero **no activo** — la navegación es por estado local en `App.tsx`. Al migrar a producción, activar el router.
- MUI (`@mui/material`) y Emotion están instalados pero **no se usan**. Eliminar antes de producción.
- Tailwind v4 se carga vía plugin Vite (`@tailwindcss/vite`), NO via `tailwind.config.js` tradicional.
- El hash anti-fraude actual (`FL2026-A3F9-B8C2-7D1E`) es estático/visual. Debe reemplazarse con SHA-256 real que incluya: vendedor ID + cliente ID + monto + timestamp + nonce.
