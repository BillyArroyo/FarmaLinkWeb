import { useState } from 'react';
import { Search, Bell, ShoppingCart, FlaskConical, Loader2, Plus } from 'lucide-react';
import { FL } from '../../data/farmalink';
import { useProductos, imgUrl, ProductoSupabase } from '../../../modules/catalogo/hooks/useProductos';
import { useLaboratorios } from '../../../modules/catalogo/hooks/useLaboratorios';
import { useCartStore } from '../../../store/cartStore';
import { capitalizar } from '../../../lib/utils';
import { toast } from 'sonner';

function ProductImg({ producto }: { producto: ProductoSupabase }) {
  const [err, setErr] = useState(false);
  const url = imgUrl(producto.id, producto.imagenes_urls);
  if (!err) {
    return (
      <img
        src={url} alt={producto.nombre}
        onError={() => setErr(true)}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    );
  }
  return <FlaskConical size={28} color={FL.primary} />;
}

interface Props {
  onCategoria: (cat: string) => void;
  onProducto: (id: string) => void;
  onCarrito?: () => void;
}

export function CatalogoInicio({ onCategoria, onProducto, onCarrito }: Props) {
  const { productos, loading } = useProductos();
  const { laboratorios, loading: labsLoading } = useLaboratorios();
  const { addProducto, count } = useCartStore();
  const cartCount = count();

  const [labActivo, setLabActivo] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');

  const promos = productos.filter(p => p.oferta);

  const filtrados = productos.filter(p => {
    const matchLab = labActivo === 'Todos' || p.laboratorio === labActivo;
    const matchBusq = !busqueda
      || p.nombre.toLowerCase().includes(busqueda.toLowerCase())
      || p.laboratorio.toLowerCase().includes(busqueda.toLowerCase());
    return matchLab && matchBusq;
  });

  const handleAgregar = (e: React.MouseEvent, prod: ProductoSupabase) => {
    e.stopPropagation();
    addProducto(prod);
    toast.success(`${prod.nombre} agregado`, { duration: 1500 });
  };

  return (
    <div style={{ backgroundColor: FL.bg, fontFamily: "'Plus Jakarta Sans', sans-serif", color: FL.text }} className="min-h-full overflow-y-auto pb-6">
      {/* Header */}
      <div style={{ background: FL.gradient, borderRadius: '0 0 24px 24px' }} className="px-5 pt-12 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px' }}>Buenos días</p>
            <p style={{ color: '#fff', fontSize: '16px', fontWeight: 700 }}>Botica San Martín</p>
          </div>
          <div className="flex gap-3">
            <button style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '12px' }} className="p-2.5">
              <Bell size={18} color="#fff" />
            </button>
            <button
              onClick={onCarrito}
              style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '12px', position: 'relative' }}
              className="p-2.5">
              <ShoppingCart size={18} color="#fff" />
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-6px', right: '-6px',
                  background: FL.danger, color: '#fff', borderRadius: '10px',
                  fontSize: '10px', fontWeight: 800, minWidth: '18px', height: '18px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px',
                }}>
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search */}
        <div style={{ background: '#fff', borderRadius: '14px' }} className="flex items-center px-4 py-3 gap-3">
          <Search size={18} color={FL.primary} />
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar productos, laboratorios..."
            style={{ background: 'none', border: 'none', outline: 'none', fontSize: '14px', color: FL.text, flex: 1, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          />
        </div>

        {/* Stats */}
        <div className="flex gap-3 mt-4">
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px' }} className="flex-1 p-3 text-center">
            <p style={{ color: '#fff', fontSize: '18px', fontWeight: 700 }}>
              {loading ? '—' : productos.length}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>Productos</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px' }} className="flex-1 p-3 text-center">
            <p style={{ color: '#fff', fontSize: '18px', fontWeight: 700 }}>
              {labsLoading ? '—' : laboratorios.length}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>Laboratorios</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px' }} className="flex-1 p-3 text-center">
            <p style={{ color: '#fff', fontSize: '18px', fontWeight: 700 }}>
              {loading ? '—' : promos.length}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>Promos activas</p>
          </div>
        </div>
      </div>

      <div className="px-4 mt-5">
        {/* Labs chips desde Supabase */}
        <p style={{ fontSize: '15px', fontWeight: 700, color: FL.text, marginBottom: '10px' }}>Laboratorios</p>
        {labsLoading ? (
          <div className="flex items-center gap-2 mb-5">
            <Loader2 size={16} color={FL.primary} style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: '13px', color: FL.textMuted }}>Cargando...</span>
          </div>
        ) : (
          <div
            className="flex gap-2 pb-2 mb-5"
            style={{ overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
            {['Todos', ...laboratorios.map(l => l.nombre)].map(lab => (
              <button key={lab} onClick={() => setLabActivo(lab)}
                style={{
                  borderRadius: '20px', padding: '7px 16px', whiteSpace: 'nowrap', fontSize: '13px', fontWeight: 600,
                  background: labActivo === lab ? FL.gradient : '#fff',
                  color: labActivo === lab ? '#fff' : FL.textMuted,
                  border: labActivo === lab ? 'none' : `1.5px solid ${FL.border}`,
                  boxShadow: labActivo === lab ? FL.shadow : 'none',
                  flexShrink: 0, cursor: 'pointer',
                }}>
                {lab === 'Todos' ? 'Todos' : capitalizar(lab)}
              </button>
            ))}
          </div>
        )}

        {/* Promociones activas */}
        {promos.length > 0 && (
          <>
            <p style={{ fontSize: '15px', fontWeight: 700, color: FL.text, marginBottom: '12px' }}>Promociones Activas</p>
            <div className="flex flex-col gap-3 mb-5">
              {promos.slice(0, 3).map(prod => (
                <button key={prod.id} onClick={() => onProducto(prod.id)}
                  style={{ background: '#fff', borderRadius: FL.radius, boxShadow: FL.shadow, overflow: 'hidden' }}
                  className="flex items-center text-left active:scale-98 transition-transform">
                  <div style={{ background: `linear-gradient(135deg, ${FL.primary}22, ${FL.primary}44)`, width: '88px', minHeight: '88px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '8px' }}>
                    <ProductImg producto={prod} />
                  </div>
                  <div className="flex-1 p-3">
                    <span style={{ background: FL.secondary + '22', color: FL.secondary, borderRadius: '6px', padding: '2px 7px', fontSize: '10px', fontWeight: 700, display: 'inline-block', marginBottom: '4px' }}>
                      {prod.oferta}
                    </span>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: FL.text }}>{capitalizar(prod.nombre)}</p>
                    {prod.concentracion && <p style={{ fontSize: '11px', color: FL.primary }}>{prod.concentracion}</p>}
                    <p style={{ fontSize: '12px', color: FL.textMuted }}>{capitalizar(prod.laboratorio)}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p style={{ fontSize: '18px', fontWeight: 800, color: FL.primary }}>
                        {prod.precio_contado != null ? `S/. ${prod.precio_contado.toFixed(2)}` : 'Consultar'}
                      </p>
                      <button
                        onClick={(e) => handleAgregar(e, prod)}
                        style={{ background: FL.gradient, borderRadius: '10px', padding: '6px 12px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Plus size={14} color="#fff" />
                        <span style={{ color: '#fff', fontSize: '12px', fontWeight: 700 }}>Agregar</span>
                      </button>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Grid de productos */}
        <div className="flex items-center justify-between mt-2 mb-3">
          <p style={{ fontSize: '15px', fontWeight: 700, color: FL.text }}>
            {busqueda || labActivo !== 'Todos' ? `${filtrados.length} resultados` : 'Productos'}
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 size={32} color={FL.primary} style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ fontSize: '14px', color: FL.textMuted }}>Cargando catálogo...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtrados.slice(0, 30).map(prod => (
              <button key={prod.id} onClick={() => onProducto(prod.id)}
                style={{ background: '#fff', borderRadius: FL.radius, boxShadow: FL.shadow, overflow: 'hidden', position: 'relative' }}
                className="text-left active:scale-95 transition-transform">
                <div style={{ background: `linear-gradient(135deg, ${FL.primary}18, ${FL.primary}30)`, height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '8px' }}>
                  <ProductImg producto={prod} />
                </div>
                <div className="p-3">
                  <p style={{ fontSize: '11px', color: FL.textMuted, marginBottom: '2px' }}>{capitalizar(prod.laboratorio)}</p>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: FL.text, lineHeight: 1.3 }}>{capitalizar(prod.nombre)}</p>
                  {prod.concentracion && <p style={{ fontSize: '11px', color: FL.primary }}>{prod.concentracion}</p>}
                  <div className="flex items-center justify-between mt-2">
                    <p style={{ fontSize: '15px', fontWeight: 800, color: FL.primary }}>
                      {prod.precio_contado != null ? `S/. ${prod.precio_contado.toFixed(2)}` : 'Consultar'}
                    </p>
                    <button
                      onClick={(e) => handleAgregar(e, prod)}
                      style={{ background: FL.primary, borderRadius: '8px', width: '26px', height: '26px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Plus size={14} color="#fff" />
                    </button>
                  </div>
                  {prod.oferta && (
                    <div style={{ marginTop: '4px', background: FL.secondary + '18', borderRadius: '6px', padding: '3px 7px' }}>
                      <p style={{ color: FL.secondary, fontSize: '10px', fontWeight: 700 }}>{prod.oferta}</p>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {!loading && filtrados.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ fontSize: '14px', color: FL.textMuted, fontWeight: 600 }}>Sin resultados para tu búsqueda</p>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div style={{ background: '#fff', borderTop: `1px solid ${FL.border}`, position: 'sticky', bottom: 0 }} className="flex justify-around py-3 mt-5">
        {[
          { icon: '🏠', label: 'Inicio', active: true, onClick: undefined },
          { icon: '📋', label: 'Catálogo', active: false, onClick: undefined },
          { icon: '🛒', label: `Pedidos${cartCount > 0 ? ` (${cartCount})` : ''}`, active: false, onClick: onCarrito },
          { icon: '👤', label: 'Perfil', active: false, onClick: undefined },
        ].map(item => (
          <button key={item.label} onClick={item.onClick} className="flex flex-col items-center gap-1">
            <span style={{ fontSize: '20px' }}>{item.icon}</span>
            <span style={{ fontSize: '10px', fontWeight: 600, color: item.active ? FL.primary : FL.textMuted }}>{item.label}</span>
          </button>
        ))}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
