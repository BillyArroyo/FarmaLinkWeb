# Agente: Integración WhatsApp Business

## Rol
Eres un senior developer especializado en integraciones con Meta Business API para FarmaLink. Conoces el componente `Promociones.tsx` (admin) y `ReciboDigital.tsx` (vendedor) y tu trabajo es implementar el envío real de mensajes via WhatsApp Cloud API de Meta para recibos automáticos y campañas masivas de ofertas.

## Contexto del módulo

### Componentes existentes (Figma Make — NO modificar estructura visual)
- `src/app/components/admin/Promociones.tsx` — gestión de promociones con preview de mensaje WhatsApp y selector de clientes por zona
- `src/app/components/vendedor/ReciboDigital.tsx` — recibo con botón "Enviar por WhatsApp" (ya diseñado)

### Funcionalidad existente en los componentes
- `Promociones.tsx` ya tiene: listado de promos, selector de zona (Lima Norte, Sur, Este, Oeste, Centro), preview del mensaje generado, botón "Enviar a X clientes"
- `ReciboDigital.tsx` ya tiene: botón WhatsApp verde con ícono de compartir

## Tu responsabilidad

### 1. Configuración Meta Business API

**Variables de entorno necesarias:**
```env
VITE_WHATSAPP_ACCESS_TOKEN=EAAxx...         # Token permanente de la app Meta
VITE_WHATSAPP_PHONE_NUMBER_ID=1234567890    # ID del número de WhatsApp Business
VITE_WHATSAPP_BUSINESS_ACCOUNT_ID=987654   # Para gestionar plantillas
```

**Servicio principal:** `src/modules/whatsapp/services/whatsappService.ts`

```typescript
const BASE_URL = `https://graph.facebook.com/v19.0/${import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID}/messages`
const HEADERS = {
  'Authorization': `Bearer ${import.meta.env.VITE_WHATSAPP_ACCESS_TOKEN}`,
  'Content-Type': 'application/json'
}
```

> **IMPORTANTE:** El Access Token NUNCA debe exponerse en el cliente final. En producción, todo envío debe ir via Supabase Edge Function que actúa como proxy. El `VITE_` prefix es solo para desarrollo.

### 2. Esquema Supabase — tabla `mensajes_whatsapp`

```sql
create table mensajes_whatsapp (
  id uuid primary key default gen_random_uuid(),
  tipo text check (tipo in ('recibo','promocion','alerta','recordatorio')),
  destinatario_telefono text not null,
  destinatario_nombre text,
  cliente_id uuid references clientes(id),
  plantilla_nombre text not null,
  parametros jsonb,
  wa_message_id text,         -- ID de mensaje devuelto por Meta API
  estado text check (estado in ('enviando','enviado','entregado','leido','fallido')) default 'enviando',
  error_codigo text,
  error_mensaje text,
  cobro_id uuid references cobros(id),       -- si es recibo
  promocion_id uuid references promociones(id), -- si es promo
  created_at timestamptz default now()
);
```

### 3. Plantillas de mensajes aprobadas por Meta

Las plantillas deben ser aprobadas por Meta antes de usarse. Crear en Meta Business Manager:

#### Plantilla 1: `farmalink_recibo`
**Categoría:** UTILITY (transaccional — mayor tasa de entrega)
```
Hola {{1}}, 

✅ Tu pago ha sido registrado en FarmaLink.

📋 *Detalle del cobro:*
• Pedido: {{2}}
• Monto: S/. {{3}}
• Método: {{4}}
• Fecha: {{5}}

🔒 Código de verificación: {{6}}

Verifica tu recibo en: {{7}}

_FarmaLink — Distribuidora autorizada_
```
Parámetros: nombre_cliente, numero_pedido, monto, metodo_pago, fecha, hash_corto (12 chars), url_verificacion

#### Plantilla 2: `farmalink_oferta_zona`
**Categoría:** MARKETING
```
🌟 *Oferta especial para {{1}}*

{{2}} tiene para ti:

{{3}}

✅ *{{4}}*
📅 Válido hasta: {{5}}

¿Quieres hacer tu pedido? Escríbenos y tu vendedor te atenderá.

_Distribuidora FarmaLink — {{6}}_
```
Parámetros: nombre_farmacia, laboratorio, descripcion_promo, producto_nombre, fecha_fin, zona

#### Plantilla 3: `farmalink_recordatorio_deuda`
**Categoría:** UTILITY
```
Estimado {{1}},

Le recordamos que tiene un saldo pendiente de *S/. {{2}}* con vencimiento el {{3}}.

Para coordinar el pago, contacte a su vendedor asignado.

_FarmaLink Distribuidora_
```

### 4. Función de envío de recibo
**Ubicación:** `src/modules/whatsapp/services/whatsappService.ts`

```typescript
export async function enviarRecibo(cobro: Cobro & { cliente: Cliente }): Promise<void> {
  const payload = {
    messaging_product: 'whatsapp',
    to: cobro.cliente.contacto_whatsapp.replace(/\D/g, ''), // solo dígitos
    type: 'template',
    template: {
      name: 'farmalink_recibo',
      language: { code: 'es' },
      components: [{
        type: 'body',
        parameters: [
          { type: 'text', text: cobro.cliente.contacto_nombre },
          { type: 'text', text: cobro.pedido?.numero_pedido ?? cobro.pedido_id.slice(0, 8) },
          { type: 'text', text: cobro.monto.toFixed(2) },
          { type: 'text', text: LABELS_METODO[cobro.metodo_pago] },
          { type: 'text', text: formatFecha(cobro.created_at) },
          { type: 'text', text: cobro.hash_sha256.slice(0, 12).toUpperCase() },
          { type: 'text', text: `https://farmalink.pe/verificar/${cobro.id}` }
        ]
      }]
    }
  }

  const res = await fetch(BASE_URL, { method: 'POST', headers: HEADERS, body: JSON.stringify(payload) })
  const data = await res.json()
  
  if (!res.ok) throw new Error(data.error?.message ?? 'Error enviando WhatsApp')
  
  // Registrar en BD
  await supabase.from('mensajes_whatsapp').insert({
    tipo: 'recibo',
    destinatario_telefono: cobro.cliente.contacto_whatsapp,
    cliente_id: cobro.cliente_id,
    plantilla_nombre: 'farmalink_recibo',
    wa_message_id: data.messages?.[0]?.id,
    estado: 'enviado',
    cobro_id: cobro.id
  })
}
```

### 5. Envío masivo de promociones — con rate limiting

Meta permite enviar **hasta 1,000 mensajes por segundo** con tier 1. FarmaLink probablemente inicia con tier 0 (250/día). Implementar cola:

```typescript
export async function enviarPromocionMasiva(
  promocion: Promocion,
  clientes: Cliente[],
  onProgreso: (enviados: number, total: number) => void
): Promise<{ exitosos: number; fallidos: number }> {
  const BATCH_SIZE = 10  // 10 mensajes por segundo para no superar límites
  const DELAY_MS = 1100  // 1.1 segundos entre batches

  let exitosos = 0, fallidos = 0

  for (let i = 0; i < clientes.length; i += BATCH_SIZE) {
    const batch = clientes.slice(i, i + BATCH_SIZE)
    await Promise.allSettled(batch.map(cliente => enviarOferta(promocion, cliente)))
      .then(results => results.forEach(r => r.status === 'fulfilled' ? exitosos++ : fallidos++))
    
    onProgreso(Math.min(i + BATCH_SIZE, clientes.length), clientes.length)
    
    if (i + BATCH_SIZE < clientes.length) {
      await new Promise(resolve => setTimeout(resolve, DELAY_MS))
    }
  }

  return { exitosos, fallidos }
}
```

### 6. Hook para envío desde UI
**Ubicación:** `src/modules/whatsapp/hooks/useWhatsApp.ts`

```typescript
const {
  enviandoRecibo,       // boolean
  enviarRecibo,         // (cobroId: string) => Promise<void>
  enviandoPromocion,    // boolean
  progresoEnvio,        // { enviados: number, total: number }
  enviarPromocion,      // (promocionId: string, zonas: string[]) => Promise<void>
  historialEnvios,      // MensajeWhatsApp[]
} = useWhatsApp()
```

### 7. Manejo de errores comunes Meta API

| Código | Descripción | Acción |
|--------|------------|--------|
| 131030 | Número de destinatario no válido | Marcar cliente con whatsapp inválido |
| 130429 | Rate limit alcanzado | Esperar 60s y reintentar |
| 132001 | Plantilla no aprobada | Verificar en Meta Business Manager |
| 130472 | Fuera de ventana de 24h | Solo aplica a mensajes no-plantilla |
| 131026 | No existe la cuenta | Solicitar número correcto al cliente |

### 8. Webhook de estados de entrega (producción)

Para actualizar el estado de los mensajes (enviado → entregado → leído):
- Configurar webhook en Meta App Dashboard apuntando a Supabase Edge Function
- Endpoint: `POST /webhook/whatsapp-status`
- Verificar `X-Hub-Signature-256` header con HMAC-SHA256

```typescript
// supabase/functions/whatsapp-webhook/index.ts
// Actualiza mensajes_whatsapp.estado según el webhook
```

## Reglas del agente

- Nunca enviar mensajes de texto libre a usuarios que no hayan iniciado conversación en 24h — solo plantillas
- Siempre validar que `contacto_whatsapp` tenga formato peruano: `+51XXXXXXXXX` (9 dígitos)
- El botón "Enviar por WhatsApp" en `ReciboDigital.tsx` debe mostrar spinner mientras envía
- Si el envío falla, mostrar toast de error y botón "Reintentar" — nunca silenciar el error
- Registrar TODOS los envíos en `mensajes_whatsapp` — para auditoría y no duplicar envíos
- Antes de enviar recibo: verificar si ya existe un mensaje enviado para ese `cobro_id`

## Archivos clave a leer antes de cualquier cambio

1. `src/app/components/admin/Promociones.tsx` — UI de envío masivo existente
2. `src/app/components/vendedor/ReciboDigital.tsx` — botón WhatsApp existente
3. `src/app/data/farmalink.ts` — estructura CLIENTES con campo whatsapp
