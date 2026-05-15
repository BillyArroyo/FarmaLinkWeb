import { useState } from 'react';
import { Search, SlidersHorizontal, Wifi, WifiOff, ShoppingCart, Filter, FlaskConical } from 'lucide-react';
import { FL, PRODUCTOS } from '../../data/farmalink';

interface Props { onProducto: (id: number) => void; }

const CATEGORIAS_FILTRO = ['Todos', 'Antibióticos', 'Vitaminas', 'Cardiología', 'Pediátricos', 'Dermatología', 'Neurología', 'Gastroenterología', 'Diabetes'];

export function CatalogoTablet({ onProducto }: Props) {
  const [catActiva, setCatActiva] = useState('Todos');
  const [labActivo, setLabActivo] = useState('Todos');
  const [soloPromo, setSoloPromo] = useState(false);
  const [online, setOnline] = useState(true);
  const [carrito, setCarrito] = useState<number[]>([]);

  const filtrados = PRODUCTOS.filter(p => {
    if (catActiva !== 'Todos' && p.categoria !== catActiva) return false;
    if (labActivo !== 'Todos' && p.lab !== labActivo) return false;
    if (soloPromo && !p.promo) return false;
    return true;
  });

  const toggleCarrito = (id: number) => {
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
              <p style={{ fontSize: '12px', color: FL.textMuted }}>Mostrando a: Botica San Martín</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setOnline(!online)} style={{ background: online ? '#DCFCE7' : '#FEE2E2', borderRadius: '10px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px', border: 'none', cursor: 'pointer' }}>
              {online ? <Wifi size={16} color="#16A34A" /> : <WifiOff size={16} color="#DC2626" />}
              <span style={{ fontSize: '12px', fontWeight: 700, color: online ? '#16A34A' : '#DC2626' }}>{online ? 'En línea' : 'Sin conexión'}</span>
            </button>
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
          <input placeholder="Buscar por nombre, laboratorio, código..." style={{ background: 'none', border: 'none', outline: 'none', flex: 1, fontSize: '14px', color: FL.text, fontFamily: "'Plus Jakarta Sans', sans-serif" }} />
          <button style={{ background: FL.primary + '15', borderRadius: '8px', padding: '6px 12px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={14} color={FL.primary} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: FL.primary }}>Filtros</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar filtros */}
        <div style={{ width: '200px', background: '#fff', borderRight: `1px solid ${FL.border}`, padding: '16px', overflow: 'y-auto', flexShrink: 0 }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: FL.textMuted, marginBottom: '8px' }}>CATEGORÍAS</p>
          {CATEGORIAS_FILTRO.map(cat => (
            <button key={cat} onClick={() => setCatActiva(cat)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '10px', textAlign: 'left', background: catActiva === cat ? FL.primary + '15' : 'transparent', border: 'none', cursor: 'pointer', marginBottom: '2px', fontFamily: "'Plus Jakarta Sans', sans-serif' " }}>
              <span style={{ fontSize: '13px', fontWeight: catActiva === cat ? 700 : 400, color: catActiva === cat ? FL.primary : FL.text }}>{cat}</span>
            </button>
          ))}
          <div style={{ height: '1px', background: FL.border, margin: '12px 0' }} />
          <p style={{ fontSize: '12px', fontWeight: 700, color: FL.textMuted, marginBottom: '8px' }}>LABORATORIOS</p>
          {['Todos', 'Genfar', 'MK', 'Bayer', 'Roemmers', 'Pfizer'].map(lab => (
            <button key={lab} onClick={() => setLabActivo(lab)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '10px', textAlign: 'left', background: labActivo === lab ? FL.secondary + '15' : 'transparent', border: 'none', cursor: 'pointer', marginBottom: '2px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              <span style={{ fontSize: '13px', fontWeight: labActivo === lab ? 700 : 400, color: labActivo === lab ? FL.secondary : FL.text }}>{lab}</span>
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
          <p style={{ fontSize: '13px', color: FL.textMuted, marginBottom: '12px' }}>{filtrados.length} productos encontrados</p>
          <div className="grid grid-cols-4 gap-3">
            {filtrados.map(prod => (
              <div key={prod.id} style={{ background: '#fff', borderRadius: FL.radius, boxShadow: FL.shadow, overflow: 'hidden', cursor: 'pointer' }}
                onClick={() => onProducto(prod.id)}>
                <div style={{ background: `linear-gradient(135deg, ${prod.color}20, ${prod.color}45)`, height: '120px', position: 'relative' }} className="flex items-center justify-center">
                  <FlaskConical size={44} color={prod.color} strokeWidth={1.5} />
                  {prod.promo && (
                    <div style={{ position: 'absolute', top: '8px', left: '8px', background: FL.secondary, borderRadius: '7px', padding: '3px 7px' }}>
                      <p style={{ color: '#fff', fontSize: '9px', fontWeight: 800 }}>{prod.promo}</p>
                    </div>
                  )}
                  <button onClick={e => { e.stopPropagation(); toggleCarrito(prod.id); }}
                    style={{ position: 'absolute', bottom: '8px', right: '8px', width: '28px', height: '28px', borderRadius: '50%', background: carrito.includes(prod.id) ? FL.primary : 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: FL.shadow }}>
                    <ShoppingCart size={13} color={carrito.includes(prod.id) ? '#fff' : FL.primary} />
                  </button>
                </div>
                <div className="p-3">
                  <p style={{ fontSize: '10px', color: FL.textMuted }}>{prod.lab}</p>
                  <p style={{ fontSize: '12px', fontWeight: 700, color: FL.text, lineHeight: 1.3 }}>{prod.nombre}</p>
                  <p style={{ fontSize: '16px', fontWeight: 800, color: FL.primary, marginTop: '4px' }}>S/. {prod.precio.toFixed(2)}</p>
                  <p style={{ fontSize: '10px', color: prod.stock < 100 ? '#EF4444' : FL.success, fontWeight: 600, marginTop: '2px' }}>
                    {prod.stock < 100 ? `⚠ ${prod.stock} unid.` : `✓ ${prod.stock} unid.`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sync status bar */}
      <div style={{ background: online ? '#ECFDF5' : '#FEF9C3', borderTop: `1px solid ${online ? '#BBF7D0' : '#FDE68A'}`, padding: '8px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        {online ? <Wifi size={14} color="#16A34A" /> : <WifiOff size={14} color="#CA8A04" />}
        <p style={{ fontSize: '12px', fontWeight: 600, color: online ? '#16A34A' : '#92400E' }}>
          {online ? `✓ Sincronizado — Última actualización: hoy 14/05/2026, 11:32 a.m.` : '⚠ Sin conexión — Mostrando catálogo en caché (14/05/2026)'}
        </p>
        {!online && <button style={{ marginLeft: 'auto', background: FL.warning, borderRadius: '8px', padding: '4px 12px', border: 'none', cursor: 'pointer', color: '#fff', fontSize: '11px', fontWeight: 700 }}>Reconectar</button>}
      </div>
    </div>
  );
}
