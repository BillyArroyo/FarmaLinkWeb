# FarmaLink B2B

**Plataforma de preventa y distribución farmacéutica para el mercado peruano.**

FarmaLink es un sistema B2B diseñado para distribuidoras de medicamentos que necesitan digitalizar su operación de campo: desde la toma de pedidos hasta el cobro, con visibilidad en tiempo real para el equipo de oficina.

---

## Para qué tipo de empresa está pensado

- **Distribuidoras farmacéuticas** que abastecen farmacias, boticas y clínicas.
- **Laboratorios con fuerza de ventas propia** que realizan preventas en ruta.
- **Mayoristas del sector salud** que manejan cientos de productos y múltiples clientes.
- Cualquier empresa del canal farmacéutico que opere con **vendedores de campo**, clientes B2B fijos y ciclos de pedido-entrega-cobro.

---

## Qué resuelve

| Problema actual | Solución FarmaLink |
|-----------------|-------------------|
| Vendedor toma pedidos en papel o WhatsApp | App móvil de pedidos con catálogo en tiempo real |
| Oficina no sabe el estado de los pedidos del día | Dashboard administrativo con actualización en vivo |
| Recibos manuales fáciles de falsificar | Recibo digital con hash SHA-256 + código QR único |
| Catálogo desactualizado en PDF o Excel | Catálogo digital sincronizado con Supabase |
| Sin visibilidad de cobranza en campo | Registro de cobros con geolocalización GPS |

---

## Módulos del sistema

| Módulo | Rol principal | Estado |
|--------|--------------|--------|
| Catálogo de productos | Cliente / Vendedor | Activo |
| Generador de pedidos | Vendedor | Activo |
| Carrito y checkout | Cliente | Activo |
| Pedidos del día | Vendedor | Activo |
| Gestión de pedidos | Administrador | Activo |
| Importar Excel | Administrador | Activo |
| Subir imágenes | Administrador | Activo |
| Catálogo imprimible | Administrador | Activo |
| Cobranzas y recibos digitales | Vendedor / Admin | En desarrollo |
| Autenticación por roles | Todos | Próximamente |
| Soporte offline (IndexedDB) | Vendedor | Próximamente |
| Integración WhatsApp Business | Admin | Próximamente |
| Pagos Niubiz / Yape / Plin | Cliente | Próximamente |

---

## Tres roles, un solo sistema

```
Cliente (Farmacia)          Vendedor (Campo)         Administrador (Oficina)
       │                          │                           │
 Navega catálogo            Genera pedidos             Dashboard KPIs
 Agrega al carrito          Registra cobros            Gestiona catálogo
 Confirma su pedido         Ve pedidos del día         Controla pedidos
       │                          │                           │
       └──────────── Supabase Realtime ──────────────────────┘
                    (sincronización instantánea)
```

---

## Stack tecnológico

- **Frontend:** React 18 + TypeScript + Vite
- **Estilos:** Tailwind CSS v4 + Design Tokens FL
- **UI Components:** shadcn/ui + Radix UI
- **Backend:** Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Validación:** Zod
- **Estado:** Zustand
- **Hosting:** Vercel (frontend) + Supabase (backend)

---

## Cómo correr el proyecto

```bash
# Instalar dependencias
pnpm install

# Copiar variables de entorno
cp .env.example .env.local
# Completar con credenciales de Supabase

# Servidor de desarrollo
pnpm dev
# → http://localhost:5173

# Build de producción
pnpm build
```

---

## Estado del proyecto

> **En mejora continua.** El sistema está en desarrollo activo. Las funcionalidades core están operativas y se están integrando progresivamente el backend real, autenticación por roles y los módulos de cobranza y comunicación.

### Próximas actualizaciones

- Autenticación completa con Supabase Auth (login por rol)
- Módulo de cobranzas con recibos digitales firmados
- Soporte offline para vendedores sin señal en campo
- Notificaciones por WhatsApp Business al confirmar pedidos
- Integración de pagos Niubiz, Yape y Plin
- Reportes exportables a Excel y PDF
- Historial de pedidos por cliente

---

## Arquitectura del proyecto

Ver [ARCHITECTURE.md](./ARCHITECTURE.md) para el diagrama de capas, inventario de assets y separación frontend / backend.

---

*Desarrollado para el mercado farmacéutico peruano — Distribución B2B.*
