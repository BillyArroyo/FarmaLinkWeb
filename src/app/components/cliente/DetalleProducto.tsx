import { useState } from 'react';
import { ArrowLeft, ShoppingCart, Share2, MessageCircle, FlaskConical, CheckCircle } from 'lucide-react';
import { FL, PRODUCTOS } from '../../data/farmalink';

interface Props { productoId: number; onBack: () => void; onContactar: () => void; }

export function DetalleProducto({ productoId, onBack, onContactar }: Props) {
  const prod = PRODUCTOS.find(p => p.id === productoId) || PRODUCTOS[0];
  const [presentacion, setPresentacion] = useState(0);
  const [contactado, setContactado] = useState(false);

  const handleContactar = () => { setContactado(true); setTimeout(() => onContactar(), 800); };

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
      <div style={{ background: `linear-gradient(160deg, ${prod.color}25 0%, ${prod.color}50 100%)`, margin: '0 16px', borderRadius: FL.radius, height: '200px', position: 'relative' }} className="flex items-center justify-center mt-4">
        <FlaskConical size={80} color={prod.color} strokeWidth={1.5} />
        {prod.promo && (
          <div style={{ position: 'absolute', top: '16px', right: '16px', background: FL.secondary, borderRadius: '12px', padding: '6px 12px', boxShadow: `0 4px 12px ${FL.secondary}55` }}>
            <p style={{ color: '#fff', fontSize: '11px', fontWeight: 800 }}>🎁 {prod.promo}</p>
          </div>
        )}
        <div style={{ position: 'absolute', bottom: '16px', left: '16px', background: 'rgba(255,255,255,0.9)', borderRadius: '10px', padding: '5px 10px' }}>
          <p style={{ color: FL.textMuted, fontSize: '10px', fontWeight: 600 }}>Stock disponible</p>
          <p style={{ color: FL.success, fontSize: '14px', fontWeight: 800 }}>{prod.stock} unidades</p>
        </div>
      </div>

      <div className="px-4 mt-5 flex-1 overflow-y-auto pb-32">
        {/* Category & lab chips */}
        <div className="flex gap-2 mb-3">
          <span style={{ background: prod.color + '18', color: prod.color, borderRadius: '8px', padding: '4px 10px', fontSize: '11px', fontWeight: 700 }}>
            {prod.categoria}
          </span>
          <span style={{ background: '#F3F4F6', color: FL.textMuted, borderRadius: '8px', padding: '4px 10px', fontSize: '11px', fontWeight: 600 }}>
            {prod.lab}
          </span>
          <span style={{ background: '#ECFDF5', color: FL.success, borderRadius: '8px', padding: '4px 10px', fontSize: '11px', fontWeight: 600 }}>
            ✓ Disponible
          </span>
        </div>

        {/* Name */}
        <p style={{ fontSize: '22px', fontWeight: 800, color: FL.text, lineHeight: 1.3, marginBottom: '8px' }}>{prod.nombre}</p>
        <p style={{ fontSize: '13px', color: FL.textMuted, lineHeight: 1.6, marginBottom: '16px' }}>{prod.descripcion}</p>

        {/* Price */}
        <div style={{ background: '#fff', borderRadius: FL.radius, boxShadow: FL.shadow, padding: '16px', marginBottom: '16px' }}>
          <p style={{ fontSize: '12px', color: FL.textMuted, marginBottom: '4px' }}>Precio por unidad (caja)</p>
          <div className="flex items-end gap-2">
            <p style={{ fontSize: '34px', fontWeight: 900, color: FL.primary }}>S/. {prod.precio.toFixed(2)}</p>
            <p style={{ fontSize: '13px', color: FL.textMuted, marginBottom: '6px' }}>/ {prod.presentaciones[presentacion]}</p>
          </div>
          <p style={{ fontSize: '12px', color: FL.success, fontWeight: 600 }}>✓ Precio distribución B2B</p>
        </div>

        {/* Promo box */}
        {prod.promo && (
          <div style={{ background: FL.secondary + '12', border: `2px solid ${FL.secondary}`, borderRadius: FL.radius, padding: '14px 16px', marginBottom: '16px' }}>
            <div className="flex items-center gap-2 mb-2">
              <span style={{ fontSize: '20px' }}>🎁</span>
              <p style={{ fontSize: '14px', fontWeight: 800, color: FL.secondary }}>PROMOCIÓN ACTIVA</p>
            </div>
            <p style={{ fontSize: '16px', fontWeight: 700, color: FL.text }}>
              Compra {prod.promoX} cajas, lleva {(prod.promoX || 0) + (prod.promoY || 0)} — <span style={{ color: FL.secondary }}>{prod.promoY} GRATIS</span>
            </p>
            <p style={{ fontSize: '12px', color: FL.textMuted, marginTop: '4px' }}>Válido hasta el 31/05/2026 · Solo para distribuidores registrados</p>
            <div style={{ background: FL.secondary, borderRadius: '10px', padding: '8px 14px', marginTop: '10px', display: 'inline-block' }}>
              <p style={{ color: '#fff', fontSize: '12px', fontWeight: 700 }}>Ahorro estimado: S/. {(prod.precio * (prod.promoY || 0)).toFixed(2)}</p>
            </div>
          </div>
        )}

        {/* Presentaciones */}
        <p style={{ fontSize: '14px', fontWeight: 700, color: FL.text, marginBottom: '10px' }}>Presentaciones disponibles</p>
        <div className="flex flex-col gap-2 mb-5">
          {prod.presentaciones.map((pres, i) => (
            <button key={pres} onClick={() => setPresentacion(i)}
              style={{
                background: presentacion === i ? FL.primary + '10' : '#fff',
                border: `2px solid ${presentacion === i ? FL.primary : FL.border}`,
                borderRadius: '12px', padding: '12px 16px',
              }}
              className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${presentacion === i ? FL.primary : '#D1D5DB'}`, background: presentacion === i ? FL.primary : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {presentacion === i && <CheckCircle size={12} color="#fff" />}
                </div>
                <p style={{ fontSize: '14px', fontWeight: presentacion === i ? 700 : 400, color: presentacion === i ? FL.primary : FL.text }}>{pres}</p>
              </div>
              <p style={{ fontSize: '14px', fontWeight: 700, color: presentacion === i ? FL.primary : FL.textMuted }}>S/. {prod.precio.toFixed(2)}</p>
            </button>
          ))}
        </div>

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
    </div>
  );
}
