import { useState } from 'react';
import { ArrowLeft, Plus, Minus, WifiOff, ChevronDown, Trash2 } from 'lucide-react';
import { FL, PRODUCTOS, CLIENTES, fmt } from '../../data/farmalink';

interface Props { onBack: () => void; onConfirmar: () => void; }

export function GeneradorPedido({ onBack, onConfirmar }: Props) {
  const [clienteId, setClienteId] = useState(1);
  const [offline] = useState(true);
  const [cantidades, setCantidades] = useState<Record<number, number>>({ 1: 12, 2: 50, 7: 20 });
  const [showClientePicker, setShowClientePicker] = useState(false);

  const cliente = CLIENTES.find(c => c.id === clienteId)!;
  const productosEnPedido = Object.entries(cantidades)
    .filter(([, cant]) => cant > 0)
    .map(([id, cant]) => {
      const prod = PRODUCTOS.find(p => p.id === Number(id))!;
      const subtotal = prod.precio * cant;
      let gratis = 0;
      if (prod.promoX && cant >= prod.promoX) gratis = Math.floor(cant / prod.promoX) * (prod.promoY || 0);
      return { ...prod, cant, gratis, subtotal };
    });

  const subtotal = productosEnPedido.reduce((a, p) => a + p.subtotal, 0);
  const descuentoPromo = productosEnPedido.reduce((a, p) => a + (p.gratis * p.precio), 0);
  const total = subtotal - descuentoPromo;

  const ajustar = (id: number, delta: number) => setCantidades(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) + delta) }));
  const eliminar = (id: number) => setCantidades(prev => { const n = { ...prev }; delete n[id]; return n; });

  const productosSugeridos = PRODUCTOS.filter(p => !cantidades[p.id] || cantidades[p.id] === 0).slice(0, 4);

  return (
    <div style={{ backgroundColor: FL.bg, fontFamily: "'Plus Jakarta Sans', sans-serif", color: FL.text }} className="min-h-full flex flex-col">
      {/* Header */}
      <div style={{ background: '#fff', boxShadow: FL.shadow }} className="px-4 pt-12 pb-4 flex items-center gap-3">
        <button onClick={onBack} style={{ background: FL.bg, borderRadius: '12px' }} className="p-2.5">
          <ArrowLeft size={18} color={FL.text} />
        </button>
        <div className="flex-1">
          <p style={{ fontSize: '17px', fontWeight: 800 }}>Generar Pedido</p>
          <p style={{ fontSize: '11px', color: FL.textMuted }}>PED-{String(Date.now()).slice(-6)}</p>
        </div>
      </div>

      {/* Offline banner */}
      {offline && (
        <div style={{ background: '#FFFBEB', borderBottom: '1px solid #FDE68A', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <WifiOff size={16} color={FL.warning} />
          <p style={{ fontSize: '12px', fontWeight: 600, color: '#92400E' }}>Modo sin conexión — El pedido se enviará cuando recuperes la señal</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Selector de cliente */}
        <p style={{ fontSize: '13px', fontWeight: 700, color: FL.textMuted, marginBottom: '8px' }}>CLIENTE</p>
        <button onClick={() => setShowClientePicker(!showClientePicker)}
          style={{ width: '100%', background: '#fff', borderRadius: FL.radius, boxShadow: FL.shadow, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', border: `2px solid ${FL.primary}30` }}>
          <div style={{ width: '40px', height: '40px', background: FL.gradient, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <p style={{ color: '#fff', fontSize: '13px', fontWeight: 700 }}>{cliente.nombre.split(' ').map(w => w[0]).join('').slice(0, 2)}</p>
          </div>
          <div className="flex-1 text-left">
            <p style={{ fontSize: '14px', fontWeight: 700, color: FL.text }}>{cliente.nombre}</p>
            <p style={{ fontSize: '11px', color: FL.textMuted }}>{cliente.dir}</p>
          </div>
          <ChevronDown size={18} color={FL.textMuted} style={{ transform: showClientePicker ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
        </button>

        {showClientePicker && (
          <div style={{ background: '#fff', borderRadius: FL.radius, boxShadow: FL.shadowMd, marginTop: '-12px', marginBottom: '16px', overflow: 'hidden' }}>
            {CLIENTES.map(c => (
              <button key={c.id} onClick={() => { setClienteId(c.id); setShowClientePicker(false); }}
                style={{ width: '100%', padding: '12px 16px', textAlign: 'left', background: c.id === clienteId ? FL.primary + '10' : '#fff', border: 'none', cursor: 'pointer', borderBottom: `1px solid ${FL.border}`, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: c.id === clienteId ? FL.primary : FL.text }}>{c.nombre}</p>
                <p style={{ fontSize: '11px', color: FL.textMuted }}>{c.dir}</p>
              </button>
            ))}
          </div>
        )}

        {/* Productos en pedido */}
        <p style={{ fontSize: '13px', fontWeight: 700, color: FL.textMuted, marginBottom: '8px' }}>PRODUCTOS EN PEDIDO</p>
        <div className="flex flex-col gap-2 mb-4">
          {productosEnPedido.map(prod => (
            <div key={prod.id} style={{ background: '#fff', borderRadius: FL.radius, boxShadow: FL.shadow, padding: '14px' }}>
              <div className="flex items-center gap-3 mb-2">
                <div style={{ width: '36px', height: '36px', background: prod.color + '20', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '18px' }}>💊</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: '13px', fontWeight: 700, color: FL.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prod.nombre}</p>
                  <p style={{ fontSize: '11px', color: FL.textMuted }}>{prod.lab} · S/. {prod.precio.toFixed(2)} c/u</p>
                </div>
                <button onClick={() => eliminar(prod.id)} style={{ background: '#FEE2E2', borderRadius: '8px', padding: '6px', border: 'none', cursor: 'pointer' }}>
                  <Trash2 size={14} color="#DC2626" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button onClick={() => ajustar(prod.id, -1)} style={{ width: '32px', height: '32px', background: FL.bg, borderRadius: '10px', border: `1.5px solid ${FL.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Minus size={14} color={FL.text} />
                  </button>
                  <p style={{ fontSize: '18px', fontWeight: 800, color: FL.text, minWidth: '32px', textAlign: 'center' }}>{prod.cant}</p>
                  <button onClick={() => ajustar(prod.id, 1)} style={{ width: '32px', height: '32px', background: FL.primary, borderRadius: '10px', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Plus size={14} color="#fff" />
                  </button>
                </div>
                <div className="text-right">
                  <p style={{ fontSize: '15px', fontWeight: 800, color: FL.primary }}>S/. {prod.subtotal.toFixed(2)}</p>
                  {prod.gratis > 0 && (
                    <p style={{ fontSize: '11px', color: FL.secondary, fontWeight: 700 }}>+{prod.gratis} gratis 🎁</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sugeridos */}
        <p style={{ fontSize: '13px', fontWeight: 700, color: FL.textMuted, marginBottom: '8px' }}>AGREGAR PRODUCTOS</p>
        <div className="flex flex-col gap-2 mb-4">
          {productosSugeridos.map(prod => (
            <button key={prod.id} onClick={() => ajustar(prod.id, 1)}
              style={{ background: '#fff', borderRadius: '12px', boxShadow: FL.shadow, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px', border: `1px dashed ${FL.border}` }}
              className="text-left">
              <div style={{ width: '32px', height: '32px', background: prod.color + '20', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '16px' }}>💊</span>
              </div>
              <div className="flex-1">
                <p style={{ fontSize: '13px', fontWeight: 600, color: FL.text }}>{prod.nombre}</p>
                <p style={{ fontSize: '11px', color: FL.textMuted }}>S/. {prod.precio.toFixed(2)}</p>
              </div>
              <Plus size={18} color={FL.primary} />
            </button>
          ))}
        </div>
      </div>

      {/* Totals + actions */}
      <div style={{ background: '#fff', borderTop: `1px solid ${FL.border}`, padding: '16px' }}>
        <div className="flex flex-col gap-1 mb-3">
          <div className="flex justify-between">
            <p style={{ fontSize: '13px', color: FL.textMuted }}>Subtotal</p>
            <p style={{ fontSize: '13px', color: FL.text }}>{fmt(subtotal)}</p>
          </div>
          {descuentoPromo > 0 && (
            <div className="flex justify-between">
              <p style={{ fontSize: '13px', color: FL.secondary }}>Descuento promo 🎁</p>
              <p style={{ fontSize: '13px', color: FL.secondary, fontWeight: 700 }}>-{fmt(descuentoPromo)}</p>
            </div>
          )}
          <div style={{ height: '1px', background: FL.border, margin: '4px 0' }} />
          <div className="flex justify-between">
            <p style={{ fontSize: '15px', fontWeight: 800, color: FL.text }}>TOTAL</p>
            <p style={{ fontSize: '20px', fontWeight: 900, color: FL.primary }}>{fmt(total)}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button style={{ flex: 1, background: FL.bg, border: `1.5px solid ${FL.border}`, borderRadius: '14px', padding: '13px', color: FL.text, fontSize: '13px', fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Guardar borrador
          </button>
          <button onClick={onConfirmar}
            style={{ flex: 2, background: FL.gradient, borderRadius: '14px', padding: '13px', color: '#fff', fontSize: '14px', fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", border: 'none', cursor: 'pointer' }}>
            ✓ Confirmar pedido
          </button>
        </div>
      </div>
    </div>
  );
}
