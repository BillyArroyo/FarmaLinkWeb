import { useState } from 'react';
import { ArrowLeft, SlidersHorizontal, Search, Loader2 } from 'lucide-react';
import { FL } from '../../data/farmalink';
import { useProductos, imgUrl, ProductoSupabase } from '../../../modules/catalogo/hooks/useProductos';

function ProductImg({ producto }: { producto: ProductoSupabase }) {
  const [err, setErr] = useState(false);
  if (!err) {
    return (
      <img
        src={imgUrl(producto.id)} alt={producto.nombre}
        onError={() => setErr(true)}
        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
      />
    );
  }
  return (
    <svg viewBox="0 0 80 40" width={52} height={26} fill="none" opacity={0.25}>
      <rect x="1" y="1" width="78" height="38" rx="19" stroke="#9CA3AF" strokeWidth="2" />
      <line x1="40" y1="1" x2="40" y2="39" stroke="#9CA3AF" strokeWidth="1.5" />
      <rect x="1" y="1" width="39" height="38" rx="19" fill="#9CA3AF" />
      <rect x="40" y="1" width="39" height="38" rx="19" fill="#D1D5DB" />
    </svg>
  );
}

interface Props { categoria: string; onBack: () => void; onProducto: (id: string) => void; }

export function CategoriaSeleccionada({ categoria, onBack, onProducto }: Props) {
  const { productos, loading } = useProductos();
  const [labActivo, setLabActivo] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [orden, setOrden] = useState('nombre');

  const labs = ['Todos', ...Array.from(new Set(productos.map(p => p.laboratorio))).sort()];

  let filtrados = productos.filter(p => {
    const matchLab = labActivo === 'Todos' || p.laboratorio === labActivo;
    const matchBusq = !busqueda || p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || p.laboratorio.toLowerCase().includes(busqueda.toLowerCase());
    return matchLab && matchBusq;
  });

  if (orden === 'precio ↑') filtrados = [...filtrados].sort((a, b) => (a.precio_contado ?? 0) - (b.precio_contado ?? 0));
  else if (orden === 'precio ↓') filtrados = [...filtrados].sort((a, b) => (b.precio_contado ?? 0) - (a.precio_contado ?? 0));
  else filtrados = [...filtrados].sort((a, b) => a.nombre.localeCompare(b.nombre));

  return (
    <div style={{ backgroundColor: FL.bg, fontFamily: "'Plus Jakarta Sans', sans-serif", color: FL.text }} className="min-h-full flex flex-col">
      {/* Header */}
      <div style={{ background: '#fff', boxShadow: FL.shadow }} className="px-4 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} style={{ background: FL.bg, borderRadius: '12px' }} className="p-2.5">
            <ArrowLeft size={18} color={FL.text} />
          </button>
          <div className="flex-1">
            <p style={{ fontSize: '18px', fontWeight: 700, color: FL.text }}>{categoria}</p>
            <p style={{ fontSize: '12px', color: FL.textMuted }}>
              {loading ? 'Cargando...' : `${filtrados.length} productos disponibles`}
            </p>
          </div>
          <button style={{ background: FL.bg, borderRadius: '12px' }} className="p-2.5">
            <SlidersHorizontal size={18} color={FL.primary} />
          </button>
        </div>
        {/* Search */}
        <div style={{ background: FL.bg, borderRadius: '12px', border: `1.5px solid ${FL.border}` }} className="flex items-center px-3 py-2.5 gap-2">
          <Search size={16} color={FL.primary} />
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder={`Buscar por nombre o laboratorio...`}
            style={{ background: 'none', border: 'none', outline: 'none', fontSize: '13px', color: FL.text, flex: 1, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          />
        </div>
      </div>

      {/* Lab filters */}
      <div className="px-4 py-3">
        <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {labs.map(lab => (
            <button key={lab} onClick={() => setLabActivo(lab)}
              style={{
                borderRadius: '20px', padding: '6px 14px', whiteSpace: 'nowrap', fontSize: '12px', fontWeight: 600,
                background: labActivo === lab ? FL.gradient : '#fff',
                color: labActivo === lab ? '#fff' : FL.textMuted,
                border: labActivo === lab ? 'none' : `1.5px solid ${FL.border}`,
                flexShrink: 0,
              }}>
              {lab}
            </button>
          ))}
        </div>
      </div>

      {/* Order selector */}
      <div className="px-4 mb-3 flex items-center gap-2">
        <p style={{ fontSize: '12px', color: FL.textMuted }}>Ordenar:</p>
        {['nombre', 'precio ↑', 'precio ↓'].map(op => (
          <button key={op} onClick={() => setOrden(op)}
            style={{
              borderRadius: '8px', padding: '4px 10px', fontSize: '11px', fontWeight: 600,
              background: orden === op ? FL.primary + '15' : 'transparent',
              color: orden === op ? FL.primary : FL.textMuted,
            }}>
            {op}
          </button>
        ))}
      </div>

      {/* Product grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 size={32} color={FL.primary} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: '14px', color: FL.textMuted }}>Cargando productos...</p>
        </div>
      ) : (
        <div className="px-4 grid grid-cols-2 gap-3 pb-6 overflow-y-auto flex-1">
          {filtrados.map(prod => (
            <button key={prod.id} onClick={() => onProducto(prod.id)}
              style={{ background: '#fff', borderRadius: FL.radius, boxShadow: FL.shadow, overflow: 'hidden' }}
              className="text-left active:scale-95 transition-transform">
              <div style={{ background: `linear-gradient(135deg, ${FL.primary}18, ${FL.primary}30)`, height: '110px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '10px' }}>
                <ProductImg producto={prod} />
                {prod.oferta && (
                  <div style={{ position: 'absolute', top: '8px', left: '8px', background: FL.secondary, borderRadius: '8px', padding: '3px 8px' }}>
                    <p style={{ color: '#fff', fontSize: '9px', fontWeight: 800 }}>{prod.oferta}</p>
                  </div>
                )}
              </div>
              <div className="p-3">
                <p style={{ fontSize: '10px', color: FL.textMuted, marginBottom: '2px' }}>{prod.laboratorio}</p>
                <p style={{ fontSize: '12px', fontWeight: 700, color: FL.text, lineHeight: 1.3, marginBottom: '6px' }}>{prod.nombre}</p>
                {prod.concentracion && <p style={{ fontSize: '10px', color: FL.primary, marginBottom: '4px' }}>{prod.concentracion}</p>}
                <p style={{ fontSize: '18px', fontWeight: 800, color: FL.primary }}>
                  {prod.precio_contado != null ? `S/. ${prod.precio_contado.toFixed(2)}` : 'Consultar'}
                </p>
                {prod.oferta && (
                  <div style={{ marginTop: '8px', background: FL.secondary + '18', borderRadius: '8px', padding: '5px 8px', border: `1px solid ${FL.secondary}44` }}>
                    <p style={{ color: FL.secondary, fontSize: '10px', fontWeight: 700 }}>{prod.oferta}</p>
                  </div>
                )}
              </div>
            </button>
          ))}
          {filtrados.length === 0 && (
            <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '40px 20px' }}>
              <p style={{ fontSize: '14px', color: FL.textMuted, fontWeight: 600 }}>Sin productos para este filtro</p>
            </div>
          )}
        </div>
      )}

      {/* Bottom bar */}
      <div style={{ background: '#fff', borderTop: `1px solid ${FL.border}`, padding: '12px 16px' }} className="flex gap-3">
        <button style={{ flex: 1, background: FL.bg, border: `1.5px solid ${FL.border}`, borderRadius: '12px', padding: '12px', color: FL.text, fontSize: '13px', fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {loading ? 'Cargando...' : `Ver todos (${filtrados.length})`}
        </button>
        <button style={{ flex: 1, background: FL.gradient, borderRadius: '12px', padding: '12px', color: '#fff', fontSize: '13px', fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Solicitar cotización
        </button>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
