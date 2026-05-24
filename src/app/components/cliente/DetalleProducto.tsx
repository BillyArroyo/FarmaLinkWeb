import { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingCart, Plus, Minus, Loader2, FlaskConical } from 'lucide-react';
import { FL, fmt } from '../../data/farmalink';
import { supabase } from '../../../lib/supabase';
import { imgUrl, ProductoSupabase } from '../../../modules/catalogo/hooks/useProductos';
import { useCartStore } from '../../../store/cartStore';
import { capitalizar } from '../../../lib/utils';
import { toast } from 'sonner';

type Producto = Pick<ProductoSupabase,
  'id' | 'nombre' | 'concentracion' | 'presentacion' | 'laboratorio' |
  'precio_contado' | 'precio_credito' | 'oferta' | 'imagen_cargada'
>

function ProductImg({ producto }: { producto: Producto }) {
  const [err, setErr] = useState(false);
  if (producto.imagen_cargada && !err) {
    return (
      <img src={imgUrl(producto.id)} alt={producto.nombre}
        onError={() => setErr(true)}
        style={{ maxWidth: '100%', maxHeight: '180px', objectFit: 'contain' }} />
    );
  }
  return <FlaskConical size={56} color={FL.primary} opacity={0.4} />;
}

interface Props { productoId: string; onBack: () => void; onContactar: () => void; onCarrito?: () => void; }

export function DetalleProducto({ productoId, onBack, onCarrito }: Props) {
  const [producto, setProducto] = useState<Producto | null>(null);
  const [sugeridos, setSugeridos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [cantidad, setCantidad] = useState(1);

  const { addProducto, count } = useCartStore();
  const cartCount = count();

  useEffect(() => {
    if (!productoId) { setLoading(false); return; }
    setLoading(true);
    supabase
      .from('productos')
      .select('id, nombre, concentracion, presentacion, laboratorio, precio_contado, precio_credito, oferta, imagen_cargada')
      .eq('id', productoId)
      .single()
      .then(({ data, error }) => {
        if (error) console.error('DetalleProducto:', error.message);
        if (data) {
          const prod = data as Producto;
          setProducto(prod);
          // Cargar sugeridos del mismo laboratorio
          supabase
            .from('productos')
            .select('id, nombre, concentracion, presentacion, laboratorio, precio_contado, precio_credito, oferta, imagen_cargada')
            .eq('laboratorio', prod.laboratorio)
            .eq('activo', true)
            .neq('id', productoId)
            .limit(4)
            .then(({ data: sug }) => { if (sug) setSugeridos(sug as Producto[]); });
        }
        setLoading(false);
      });
  }, [productoId]);

  const handleAgregarAlCarrito = () => {
    if (!producto) return;
    addProducto(producto as ProductoSupabase, cantidad);
    toast.success(`${capitalizar(producto.nombre)} × ${cantidad} agregado al carrito`);
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: FL.bg, fontFamily: "'Plus Jakarta Sans', sans-serif", height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: '#fff' }} className="px-4 pt-12 pb-3 flex items-center">
          <button onClick={onBack} style={{ background: FL.bg, borderRadius: '12px' }} className="p-2.5">
            <ArrowLeft size={18} color={FL.text} />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center gap-3">
          <Loader2 size={24} color={FL.primary} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: '14px', color: FL.textMuted }}>Cargando...</p>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!producto) {
    return (
      <div style={{ backgroundColor: FL.bg, fontFamily: "'Plus Jakarta Sans', sans-serif", height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: '#fff' }} className="px-4 pt-12 pb-3 flex items-center">
          <button onClick={onBack} style={{ background: FL.bg, borderRadius: '12px' }} className="p-2.5">
            <ArrowLeft size={18} color={FL.text} />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p style={{ fontSize: '14px', color: FL.textMuted }}>Producto no encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: FL.bg, fontFamily: "'Plus Jakarta Sans', sans-serif", color: FL.text }} className="min-h-full flex flex-col">
      {/* Header */}
      <div style={{ background: '#fff' }} className="px-4 pt-12 pb-3 flex items-center justify-between">
        <button onClick={onBack} style={{ background: FL.bg, borderRadius: '12px' }} className="p-2.5">
          <ArrowLeft size={18} color={FL.text} />
        </button>
        <p style={{ fontSize: '16px', fontWeight: 700 }}>Detalle del producto</p>
        <button onClick={onCarrito} style={{ background: FL.bg, borderRadius: '12px', position: 'relative' }} className="p-2.5">
          <ShoppingCart size={18} color={FL.primary} />
          {cartCount > 0 && (
            <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: FL.danger, color: '#fff', borderRadius: '8px', fontSize: '9px', fontWeight: 800, minWidth: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>
              {cartCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-36">
        {/* Imagen */}
        <div style={{ background: `linear-gradient(160deg, ${FL.primary}18 0%, ${FL.primary}35 100%)`, margin: '16px 16px 0', borderRadius: FL.radius, height: '210px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <ProductImg producto={producto} />
          {producto.oferta && (
            <div style={{ position: 'absolute', top: '14px', right: '14px', background: FL.secondary, borderRadius: '10px', padding: '5px 12px' }}>
              <p style={{ color: '#fff', fontSize: '11px', fontWeight: 800 }}>{producto.oferta}</p>
            </div>
          )}
          <div style={{ position: 'absolute', bottom: '10px', left: '12px', background: 'rgba(255,255,255,0.9)', borderRadius: '8px', padding: '4px 10px' }}>
            <p style={{ color: FL.primary, fontSize: '11px', fontWeight: 700, fontFamily: 'monospace' }}>{producto.id}</p>
          </div>
        </div>

        <div className="px-4 mt-4">
          {/* Lab + disponible */}
          <div className="flex gap-2 mb-3 flex-wrap">
            <span style={{ background: FL.primary + '18', color: FL.primary, borderRadius: '8px', padding: '4px 12px', fontSize: '11px', fontWeight: 700 }}>
              {capitalizar(producto.laboratorio)}
            </span>
            <span style={{ background: '#ECFDF5', color: FL.success, borderRadius: '8px', padding: '4px 12px', fontSize: '11px', fontWeight: 600 }}>
              ✓ Disponible
            </span>
          </div>

          {/* Nombre y detalles */}
          <p style={{ fontSize: '22px', fontWeight: 800, color: FL.text, lineHeight: 1.3, marginBottom: '4px' }}>
            {capitalizar(producto.nombre)}
          </p>
          {producto.concentracion && (
            <p style={{ fontSize: '14px', color: FL.primary, fontWeight: 600, marginBottom: '4px' }}>{producto.concentracion}</p>
          )}
          {producto.presentacion && (
            <p style={{ fontSize: '13px', color: FL.textMuted, marginBottom: '16px' }}>{producto.presentacion}</p>
          )}

          {/* Precio */}
          <div style={{ background: '#fff', borderRadius: FL.radius, boxShadow: FL.shadow, padding: '16px', marginBottom: '16px' }}>
            <p style={{ fontSize: '12px', color: FL.textMuted, marginBottom: '4px' }}>Precio contado</p>
            <p style={{ fontSize: '34px', fontWeight: 900, color: FL.primary }}>
              {producto.precio_contado != null ? fmt(producto.precio_contado) : 'Consultar'}
            </p>
            {producto.precio_credito != null && (
              <p style={{ fontSize: '13px', color: FL.textMuted, marginTop: '4px' }}>
                Precio crédito: <span style={{ fontWeight: 700, color: FL.secondary }}>{fmt(producto.precio_credito)}</span>
              </p>
            )}
            <p style={{ fontSize: '12px', color: FL.success, fontWeight: 600, marginTop: '6px' }}>✓ Precio distribución B2B</p>
          </div>

          {/* Oferta */}
          {producto.oferta && (
            <div style={{ background: FL.secondary + '12', border: `2px solid ${FL.secondary}`, borderRadius: FL.radius, padding: '14px 16px', marginBottom: '16px' }}>
              <p style={{ fontSize: '13px', fontWeight: 800, color: FL.secondary, marginBottom: '4px' }}>PROMOCIÓN ACTIVA</p>
              <p style={{ fontSize: '15px', fontWeight: 700, color: FL.text }}>{producto.oferta}</p>
            </div>
          )}

          {/* Selector de cantidad */}
          <div style={{ background: '#fff', borderRadius: FL.radius, boxShadow: FL.shadow, padding: '16px', marginBottom: '16px' }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: FL.textMuted, marginBottom: '12px' }}>Cantidad</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => setCantidad(c => Math.max(1, c - 1))}
                  style={{ width: '36px', height: '36px', background: FL.bg, borderRadius: '12px', border: `1.5px solid ${FL.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Minus size={16} color={FL.text} />
                </button>
                <p style={{ fontSize: '24px', fontWeight: 900, color: FL.text, minWidth: '36px', textAlign: 'center' }}>{cantidad}</p>
                <button onClick={() => setCantidad(c => c + 1)}
                  style={{ width: '36px', height: '36px', background: FL.primary, borderRadius: '12px', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Plus size={16} color="#fff" />
                </button>
              </div>
              {producto.precio_contado != null && (
                <p style={{ fontSize: '20px', fontWeight: 900, color: FL.primary }}>
                  {fmt(producto.precio_contado * cantidad)}
                </p>
              )}
            </div>
          </div>

          {/* Sugeridos del mismo laboratorio */}
          {sugeridos.length > 0 && (
            <>
              <p style={{ fontSize: '15px', fontWeight: 700, color: FL.text, marginBottom: '12px', marginTop: '4px' }}>
                Más de {capitalizar(producto.laboratorio)}
              </p>
              <div className="flex flex-col gap-3 mb-4">
                {sugeridos.map(sug => (
                  <div key={sug.id} style={{ background: '#fff', borderRadius: FL.radius, boxShadow: FL.shadow, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '44px', height: '44px', background: FL.primary + '18', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                      <img src={imgUrl(sug.id)} alt={sug.nombre}
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: '13px', fontWeight: 700, color: FL.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {capitalizar(sug.nombre)}
                      </p>
                      <p style={{ fontSize: '12px', color: FL.primary, fontWeight: 700 }}>
                        {sug.precio_contado != null ? fmt(sug.precio_contado) : 'Consultar'}
                      </p>
                    </div>
                    <button
                      onClick={() => { addProducto(sug as ProductoSupabase); toast.success(`${capitalizar(sug.nombre)} agregado`, { duration: 1200 }); }}
                      style={{ background: FL.primary, borderRadius: '10px', width: '32px', height: '32px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Plus size={14} color="#fff" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer CTA */}
      <div style={{ background: '#fff', borderTop: `1px solid ${FL.border}`, padding: '16px', position: 'sticky', bottom: 0 }} className="flex gap-3">
        <button
          onClick={() => toast.info('Tu vendedor asignado será notificado al confirmar el pedido.')}
          style={{ background: FL.bg, border: `1.5px solid ${FL.border}`, borderRadius: '14px', padding: '14px 16px', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '13px', fontWeight: 600, color: FL.textMuted, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          Contactar vendedor
        </button>
        <button
          onClick={handleAgregarAlCarrito}
          style={{ flex: 1, background: FL.gradient, borderRadius: '14px', padding: '14px', color: '#fff', fontSize: '15px', fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Plus size={18} color="#fff" />
          Agregar al carrito
        </button>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
