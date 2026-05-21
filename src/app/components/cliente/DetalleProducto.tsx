import { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingCart, Share2, MessageCircle, Loader2 } from 'lucide-react';
import { FL } from '../../data/farmalink';
import { supabase } from '../../../lib/supabase';
import { imgUrl } from '../../../modules/catalogo/hooks/useProductos';

interface Producto {
  id: string;
  nombre: string;
  concentracion: string | null;
  presentacion: string | null;
  laboratorio: string;
  precio_contado: number | null;
  precio_credito: number | null;
  oferta: string | null;
  imagen_cargada: boolean;
}

function ProductImg({ producto }: { producto: Producto }) {
  const [err, setErr] = useState(false);
  const url = imgUrl(producto.id);
  if (producto.imagen_cargada && !err) {
    return (
      <img
        src={url} alt={producto.nombre}
        onError={() => setErr(true)}
        style={{ maxWidth: '100%', maxHeight: '160px', objectFit: 'contain' }}
      />
    );
  }
  return (
    <svg viewBox="0 0 80 40" width={90} height={45} fill="none" opacity={0.3}>
      <rect x="1" y="1" width="78" height="38" rx="19" stroke={FL.primary} strokeWidth="2" />
      <line x1="40" y1="1" x2="40" y2="39" stroke={FL.primary} strokeWidth="1.5" />
      <rect x="1" y="1" width="39" height="38" rx="19" fill={FL.primary} />
      <rect x="40" y="1" width="39" height="38" rx="19" fill={FL.secondary} />
    </svg>
  );
}

interface Props { productoId: string; onBack: () => void; onContactar: () => void; }

export function DetalleProducto({ productoId, onBack, onContactar }: Props) {
  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [contactado, setContactado] = useState(false);

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
        if (data) setProducto(data as Producto);
        setLoading(false);
      });
  }, [productoId]);

  const handleContactar = () => { setContactado(true); setTimeout(() => onContactar(), 800); };

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
          <p style={{ fontSize: '14px', color: FL.textMuted }}>Cargando producto...</p>
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
        <p style={{ fontSize: '16px', fontWeight: 700 }}>Detalle Producto</p>
        <div className="flex gap-2">
          <button style={{ background: FL.bg, borderRadius: '12px' }} className="p-2.5">
            <Share2 size={18} color={FL.textMuted} />
          </button>
          <button style={{ background: FL.bg, borderRadius: '12px' }} className="p-2.5">
            <ShoppingCart size={18} color={FL.primary} />
          </button>
        </div>
      </div>

      {/* Product image */}
      <div style={{ background: `linear-gradient(160deg, ${FL.primary}20 0%, ${FL.primary}40 100%)`, margin: '0 16px', borderRadius: FL.radius, height: '200px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="mt-4">
        <ProductImg producto={producto} />
        {producto.oferta && (
          <div style={{ position: 'absolute', top: '16px', right: '16px', background: FL.secondary, borderRadius: '12px', padding: '6px 12px' }}>
            <p style={{ color: '#fff', fontSize: '11px', fontWeight: 800 }}>{producto.oferta}</p>
          </div>
        )}
        <div style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(255,255,255,0.9)', borderRadius: '8px', padding: '4px 10px' }}>
          <p style={{ color: FL.textMuted, fontSize: '10px', fontWeight: 600 }}>ID</p>
          <p style={{ color: FL.primary, fontSize: '12px', fontWeight: 700, fontFamily: 'monospace' }}>{producto.id}</p>
        </div>
      </div>

      <div className="px-4 mt-5 flex-1 overflow-y-auto pb-32">
        {/* Chips */}
        <div className="flex gap-2 mb-3 flex-wrap">
          <span style={{ background: FL.primary + '18', color: FL.primary, borderRadius: '8px', padding: '4px 10px', fontSize: '11px', fontWeight: 700 }}>
            {producto.laboratorio}
          </span>
          <span style={{ background: '#ECFDF5', color: FL.success, borderRadius: '8px', padding: '4px 10px', fontSize: '11px', fontWeight: 600 }}>
            ✓ Disponible
          </span>
        </div>

        {/* Name */}
        <p style={{ fontSize: '22px', fontWeight: 800, color: FL.text, lineHeight: 1.3, marginBottom: '4px' }}>{producto.nombre}</p>
        {producto.concentracion && (
          <p style={{ fontSize: '14px', color: FL.primary, fontWeight: 600, marginBottom: '8px' }}>{producto.concentracion}</p>
        )}
        {producto.presentacion && (
          <p style={{ fontSize: '13px', color: FL.textMuted, marginBottom: '16px' }}>{producto.presentacion}</p>
        )}

        {/* Precio */}
        <div style={{ background: '#fff', borderRadius: FL.radius, boxShadow: FL.shadow, padding: '16px', marginBottom: '16px' }}>
          <p style={{ fontSize: '12px', color: FL.textMuted, marginBottom: '4px' }}>Precio contado</p>
          <p style={{ fontSize: '34px', fontWeight: 900, color: FL.primary }}>
            {producto.precio_contado != null ? `S/. ${producto.precio_contado.toFixed(2)}` : 'Consultar'}
          </p>
          {producto.precio_credito != null && (
            <p style={{ fontSize: '13px', color: FL.textMuted, marginTop: '4px' }}>
              Precio crédito: <span style={{ fontWeight: 700, color: FL.secondary }}>S/. {producto.precio_credito.toFixed(2)}</span>
            </p>
          )}
          <p style={{ fontSize: '12px', color: FL.success, fontWeight: 600, marginTop: '6px' }}>✓ Precio distribución B2B</p>
        </div>

        {/* Oferta */}
        {producto.oferta && (
          <div style={{ background: FL.secondary + '12', border: `2px solid ${FL.secondary}`, borderRadius: FL.radius, padding: '14px 16px', marginBottom: '16px' }}>
            <p style={{ fontSize: '14px', fontWeight: 800, color: FL.secondary, marginBottom: '4px' }}>PROMOCIÓN ACTIVA</p>
            <p style={{ fontSize: '16px', fontWeight: 700, color: FL.text }}>{producto.oferta}</p>
            <p style={{ fontSize: '12px', color: FL.textMuted, marginTop: '4px' }}>Solo para distribuidores registrados</p>
          </div>
        )}

        {/* Vendor info */}
        <div style={{ background: '#fff', borderRadius: FL.radius, boxShadow: FL.shadow, padding: '14px 16px' }}>
          <div className="flex items-center gap-3">
            <div style={{ width: '44px', height: '44px', background: FL.gradient, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: '#fff', fontSize: '14px', fontWeight: 700 }}>CQ</p>
            </div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 700, color: FL.text }}>Carlos Quispe</p>
              <p style={{ fontSize: '12px', color: FL.textMuted }}>Tu vendedor asignado · Zona Norte</p>
            </div>
            <div style={{ marginLeft: 'auto', background: '#DCFCE7', borderRadius: '8px', padding: '4px 10px' }}>
              <p style={{ color: '#16A34A', fontSize: '11px', fontWeight: 700 }}>● Activo</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div style={{ background: '#fff', borderTop: `1px solid ${FL.border}`, padding: '16px' }} className="flex gap-3">
        <button style={{ background: FL.bg, border: `1.5px solid ${FL.border}`, borderRadius: '14px', padding: '14px 20px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          <MessageCircle size={20} color={FL.primary} />
        </button>
        <button onClick={handleContactar}
          style={{ flex: 1, background: contactado ? FL.secondary : FL.gradient, borderRadius: '14px', padding: '14px', color: '#fff', fontSize: '15px', fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'all 0.3s' }}>
          {contactado ? '✓ ¡Solicitud enviada!' : '📞 Contactar a mi vendedor'}
        </button>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
