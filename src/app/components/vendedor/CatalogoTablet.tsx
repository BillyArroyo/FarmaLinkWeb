import { useState } from 'react';
import { Search, Wifi, WifiOff, ShoppingCart, Filter, Loader2 } from 'lucide-react';
import { FL } from '../../data/farmalink';
import { useProductos, imgUrl, ProductoSupabase } from '../../../modules/catalogo/hooks/useProductos';

interface Props { onProducto: (id: string) => void; }

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
    <svg viewBox="0 0 80 40" width={52} height={26} fill="none" opacity={0.2}>
      <rect x="1" y="1" width="78" height="38" rx="19" stroke="#9CA3AF" strokeWidth="2" />
      <line x1="40" y1="1" x2="40" y2="39" stroke="#9CA3AF" strokeWidth="1.5" />
      <rect x="1" y="1" width="39" height="38" rx="19" fill="#9CA3AF" />
      <rect x="40" y="1" width="39" height="38" rx="19" fill="#D1D5DB" />
    </svg>
  );
}

export function CatalogoTablet({ onProducto }: Props) {
  const { productos, loading } = useProductos();
  const [labActivo, setLabActivo] = useState('Todos');
  const [soloPromo, setSoloPromo] = useState(false);
  const [online] = useState(true);
  const [carrito, setCarrito] = useState<string[]>([]);
  const [busqueda, setBusqueda] = useState('');

  const labs = ['Todos', ...Array.from(new Set(productos.map(p => p.laboratorio))).sort()];

  const filtrados = productos.filter(p => {
    if (labActivo !== 'Todos' && p.laboratorio !== labActivo) return false;
    if (soloPromo && !p.oferta) return false;
    if (busqueda && !p.nombre.toLowerCase().includes(busqueda.toLowerCase()) && !p.laboratorio.toLowerCase().includes(busqueda.toLowerCase())) return false;
    return true;
  });

  const toggleCarrito = (id: string) => {
    setCarrito(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div style={{ background: FL.bg, fontFamily: "'Plus Jakarta Sans', sans-serif", color: FL.text, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: '#fff', boxShadow: FL.shadow, padding: '16px 24px' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span style={{ fontSize: '24px' }}>💊</span>
            <div>
              <p style={{ fontSize: '18px', fontWeight: 800, color: FL.text }}>Catálogo FarmaLink</p>
              <p style={{ fontSize: '12px', color: FL.textMuted }}>
                {loading ? 'Cargando...' : `${productos.length} productos · ${labs.length - 1} laboratorios`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div style={{ background: online ? '#DCFCE7' : '#FEE2E2', borderRadius: '10px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {online ? <Wifi size={16} color="#16A34A" /> : <WifiOff size={16} color="#DC2626" />}
              <span style={{ fontSize: '12px', fontWeight: 700, color: online ? '#16A34A' : '#DC2626' }}>{online ? 'En línea' : 'Sin conexión'}</span>
            </div>
            <button style={{ background: FL.gradient, borderRadius: '12px', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', cursor: 'pointer', position: 'relative' }}>
              <ShoppingCart size={18} color="#fff" />
              <span style={{ color: '#fff', fontSize: '14px', fontWeight: 700 }}>Pedido</span>
              {carrito.length > 0 && (
                <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#EF4444', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>{carrito.length}</span>
              )}
            </button>
          </div>
        </div>
        {/* Search */}
        <div style={{ background: FL.bg, borderRadius: '12px', border: `1.5px solid ${FL.border}`, display: 'flex', alignItems: 'center', padding: '10px 14px', gap: '10px' }}>
          <Search size={18} color={FL.primary} />
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, laboratorio..."
            style={{ background: 'none', border: 'none', outline: 'none', flex: 1, fontSize: '14px', color: FL.text, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          />
          <button style={{ background: FL.primary + '15', borderRadius: '8px', padding: '6px 12px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={14} color={FL.primary} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: FL.primary }}>Filtros</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar filtros */}
        <div style={{ width: '200px', background: '#fff', borderRight: `1px solid ${FL.border}`, padding: '16px', overflowY: 'auto', flexShrink: 0 }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: FL.textMuted, marginBottom: '8px' }}>LABORATORIOS</p>
          {labs.map(lab => (
            <button key={lab} onClick={() => setLabActivo(lab)}
              style={{ width: '100%', padding: '7px 10px', borderRadius: '10px', textAlign: 'left', background: labActivo === lab ? FL.primary + '15' : 'transparent', border: 'none', cursor: 'pointer', marginBottom: '2px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              <span style={{ fontSize: '12px', fontWeight: labActivo === lab ? 700 : 400, color: labActivo === lab ? FL.primary : FL.text }}>{lab}</span>
            </button>
          ))}
          <div style={{ height: '1px', background: FL.border, margin: '12px 0' }} />
          <button onClick={() => setSoloPromo(!soloPromo)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', borderRadius: '10px', width: '100%', background: soloPromo ? '#FFFBEB' : 'transparent', border: 'none', cursor: 'pointer' }}>
            <div style={{ width: '18px', height: '18px', borderRadius: '5px', background: soloPromo ? FL.warning : 'transparent', border: `2px solid ${soloPromo ? FL.warning : '#D1D5DB'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {soloPromo && <span style={{ color: '#fff', fontSize: '11px' }}>✓</span>}
            </div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: FL.text }}>Solo promociones</span>
          </button>
        </div>

        {/* Product grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <Loader2 size={32} color={FL.primary} style={{ animation: 'spin 1s linear infinite' }} />
              <p style={{ fontSize: '14px', color: FL.textMuted }}>Cargando catálogo desde Supabase...</p>
            </div>
          ) : (
            <>
              <p style={{ fontSize: '13px', color: FL.textMuted, marginBottom: '12px' }}>{filtrados.length} productos encontrados</p>
              <div className="grid grid-cols-4 gap-3">
                {filtrados.map(prod => (
                  <div key={prod.id} style={{ background: '#fff', borderRadius: FL.radius, boxShadow: FL.shadow, overflow: 'hidden', cursor: 'pointer' }}
                    onClick={() => onProducto(prod.id)}>
                    <div style={{ background: `linear-gradient(135deg, ${FL.primary}18, ${FL.primary}30)`, height: '120px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '10px' }}>
                      <ProductImg producto={prod} />
                      {prod.oferta && (
                        <div style={{ position: 'absolute', top: '8px', left: '8px', background: FL.secondary, borderRadius: '7px', padding: '3px 7px' }}>
                          <p style={{ color: '#fff', fontSize: '9px', fontWeight: 800 }}>{prod.oferta}</p>
                        </div>
                      )}
                      <button onClick={e => { e.stopPropagation(); toggleCarrito(prod.id); }}
                        style={{ position: 'absolute', bottom: '8px', right: '8px', width: '28px', height: '28px', borderRadius: '50%', background: carrito.includes(prod.id) ? FL.primary : 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: FL.shadow }}>
                        <ShoppingCart size={13} color={carrito.includes(prod.id) ? '#fff' : FL.primary} />
                      </button>
                    </div>
                    <div className="p-3">
                      <p style={{ fontSize: '10px', color: FL.textMuted }}>{prod.laboratorio}</p>
                      <p style={{ fontSize: '12px', fontWeight: 700, color: FL.text, lineHeight: 1.3 }}>{prod.nombre}</p>
                      {prod.concentracion && <p style={{ fontSize: '10px', color: FL.primary }}>{prod.concentracion}</p>}
                      <p style={{ fontSize: '16px', fontWeight: 800, color: FL.primary, marginTop: '4px' }}>
                        {prod.precio_contado != null ? `S/. ${prod.precio_contado.toFixed(2)}` : 'Consultar'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {filtrados.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <p style={{ fontSize: '14px', color: FL.textMuted, fontWeight: 600 }}>Sin productos para este filtro</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Sync status bar */}
      <div style={{ background: '#ECFDF5', borderTop: `1px solid #BBF7D0`, padding: '8px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Wifi size={14} color="#16A34A" />
        <p style={{ fontSize: '12px', fontWeight: 600, color: '#16A34A' }}>
          ✓ Sincronizado con Supabase — {productos.length} productos cargados
        </p>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
