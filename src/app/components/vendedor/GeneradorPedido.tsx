import { useState } from 'react';
import { ArrowLeft, Plus, Minus, WifiOff, Trash2, Loader2 } from 'lucide-react';
import { FL, fmt } from '../../data/farmalink';
import { useProductos, imgUrl, ProductoSupabase } from '../../../modules/catalogo/hooks/useProductos';

interface Props { onBack: () => void; onConfirmar: () => void; }

function ProductImg({ producto }: { producto: ProductoSupabase }) {
  const [err, setErr] = useState(false);
  if (producto.imagen_cargada && !err) {
    return <img src={imgUrl(producto.id)} alt={producto.nombre} onError={() => setErr(true)} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />;
  }
  return <span style={{ fontSize: '18px' }}>💊</span>;
}

export function GeneradorPedido({ onBack, onConfirmar }: Props) {
  const { productos, loading } = useProductos();
  const [offline] = useState(false);
  const [cantidades, setCantidades] = useState<Record<string, number>>({});

  const productosEnPedido = Object.entries(cantidades)
    .filter(([, cant]) => cant > 0)
    .map(([id, cant]) => {
      const prod = productos.find(p => p.id === id)!;
      if (!prod) return null;
      const subtotal = (prod.precio_contado ?? 0) * cant;
      return { ...prod, cant, subtotal };
    })
    .filter(Boolean) as (ProductoSupabase & { cant: number; subtotal: number })[];

  const total = productosEnPedido.reduce((a, p) => a + p.subtotal, 0);
  const ajustar = (id: string, delta: number) => setCantidades(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) + delta) }));
  const eliminar = (id: string) => setCantidades(prev => { const n = { ...prev }; delete n[id]; return n; });
  const sugeridos = productos.filter(p => !cantidades[p.id] || cantidades[p.id] === 0).slice(0, 4);

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

      {offline && (
        <div style={{ background: '#FFFBEB', borderBottom: '1px solid #FDE68A', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <WifiOff size={16} color={FL.warning} />
          <p style={{ fontSize: '12px', fontWeight: 600, color: '#92400E' }}>Modo sin conexión — El pedido se guardará localmente</p>
        </div>
      )}

      {/* Cliente — placeholder */}
      <div className="px-4 pt-4">
        <p style={{ fontSize: '13px', fontWeight: 700, color: FL.textMuted, marginBottom: '8px' }}>CLIENTE</p>
        <div style={{ background: '#fff', borderRadius: FL.radius, boxShadow: FL.shadow, padding: '14px 16px', marginBottom: '16px', border: `2px dashed ${FL.border}` }}>
          <p style={{ fontSize: '13px', color: FL.textMuted, textAlign: 'center' }}>Selección de clientes próximamente</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {/* Productos en pedido */}
        {productosEnPedido.length > 0 && (
          <>
            <p style={{ fontSize: '13px', fontWeight: 700, color: FL.textMuted, marginBottom: '8px' }}>PRODUCTOS EN PEDIDO</p>
            <div className="flex flex-col gap-2 mb-4">
              {productosEnPedido.map(prod => (
                <div key={prod.id} style={{ background: '#fff', borderRadius: FL.radius, boxShadow: FL.shadow, padding: '14px' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div style={{ width: '36px', height: '36px', background: FL.primary + '18', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                      <ProductImg producto={prod} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: '13px', fontWeight: 700, color: FL.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prod.nombre}</p>
                      <p style={{ fontSize: '11px', color: FL.textMuted }}>{prod.laboratorio} · S/. {(prod.precio_contado ?? 0).toFixed(2)} c/u</p>
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
                    <p style={{ fontSize: '15px', fontWeight: 800, color: FL.primary }}>{fmt(prod.subtotal)}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Sugeridos */}
        <p style={{ fontSize: '13px', fontWeight: 700, color: FL.textMuted, marginBottom: '8px' }}>AGREGAR PRODUCTOS</p>
        {loading ? (
          <div className="flex items-center gap-2 py-4">
            <Loader2 size={16} color={FL.primary} style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: '13px', color: FL.textMuted }}>Cargando catálogo...</span>
          </div>
        ) : (
          <div className="flex flex-col gap-2 mb-4">
            {sugeridos.map(prod => (
              <button key={prod.id} onClick={() => ajustar(prod.id, 1)}
                style={{ background: '#fff', borderRadius: '12px', boxShadow: FL.shadow, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px', border: `1px dashed ${FL.border}` }}
                className="text-left">
                <div style={{ width: '32px', height: '32px', background: FL.primary + '18', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                  <ProductImg producto={prod} />
                </div>
                <div className="flex-1">
                  <p style={{ fontSize: '13px', fontWeight: 600, color: FL.text }}>{prod.nombre}</p>
                  <p style={{ fontSize: '11px', color: FL.textMuted }}>
                    {prod.precio_contado != null ? `S/. ${prod.precio_contado.toFixed(2)}` : 'Consultar'}
                  </p>
                </div>
                <Plus size={18} color={FL.primary} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Totals + actions */}
      <div style={{ background: '#fff', borderTop: `1px solid ${FL.border}`, padding: '16px' }}>
        <div className="flex flex-col gap-1 mb-3">
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
            style={{ flex: 2, background: productosEnPedido.length > 0 ? FL.gradient : '#E5E7EB', borderRadius: '14px', padding: '13px', color: productosEnPedido.length > 0 ? '#fff' : FL.textMuted, fontSize: '14px', fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", border: 'none', cursor: 'pointer' }}>
            ✓ Confirmar pedido
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
