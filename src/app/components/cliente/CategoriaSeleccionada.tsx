import { useState } from 'react';
import { ArrowLeft, SlidersHorizontal, Search, FlaskConical } from 'lucide-react';
import { FL, PRODUCTOS } from '../../data/farmalink';

interface Props { categoria: string; onBack: () => void; onProducto: (id: number) => void; }

export function CategoriaSeleccionada({ categoria, onBack, onProducto }: Props) {
  const [labActivo, setLabActivo] = useState('Todos');
  const [orden, setOrden] = useState('relevancia');

  const prods = PRODUCTOS.filter(p => labActivo === 'Todos' ? true : p.lab === labActivo);
  const labs = ['Todos', ...Array.from(new Set(PRODUCTOS.map(p => p.lab)))];

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
            <p style={{ fontSize: '12px', color: FL.textMuted }}>{PRODUCTOS.length} productos disponibles</p>
          </div>
          <button style={{ background: FL.bg, borderRadius: '12px' }} className="p-2.5">
            <SlidersHorizontal size={18} color={FL.primary} />
          </button>
        </div>
        {/* Search */}
        <div style={{ background: FL.bg, borderRadius: '12px', border: `1.5px solid ${FL.border}` }} className="flex items-center px-3 py-2.5 gap-2">
          <Search size={16} color={FL.primary} />
          <input placeholder={`Buscar en ${categoria}...`} style={{ background: 'none', border: 'none', outline: 'none', fontSize: '13px', color: FL.text, flex: 1, fontFamily: "'Plus Jakarta Sans', sans-serif" }} />
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
        {['relevancia', 'precio ↑', 'precio ↓', 'nombre'].map(op => (
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
      <div className="px-4 grid grid-cols-2 gap-3 pb-6 overflow-y-auto flex-1">
        {prods.map(prod => (
          <button key={prod.id} onClick={() => onProducto(prod.id)}
            style={{ background: '#fff', borderRadius: FL.radius, boxShadow: FL.shadow, overflow: 'hidden' }}
            className="text-left active:scale-95 transition-transform">
            {/* Product image area */}
            <div style={{ background: `linear-gradient(135deg, ${prod.color}20, ${prod.color}40)`, height: '110px', position: 'relative' }} className="flex items-center justify-center">
              <FlaskConical size={40} color={prod.color} />
              {prod.promo && (
                <div style={{ position: 'absolute', top: '8px', left: '8px', background: FL.secondary, borderRadius: '8px', padding: '3px 8px' }}>
                  <p style={{ color: '#fff', fontSize: '9px', fontWeight: 800 }}>{prod.promo}</p>
                </div>
              )}
              {prod.stock < 100 && (
                <div style={{ position: 'absolute', top: '8px', right: '8px', background: '#FEF2F2', borderRadius: '8px', padding: '3px 7px' }}>
                  <p style={{ color: '#EF4444', fontSize: '9px', fontWeight: 700 }}>Poco stock</p>
                </div>
              )}
            </div>
            <div className="p-3">
              <p style={{ fontSize: '10px', color: FL.textMuted, marginBottom: '2px' }}>{prod.lab}</p>
              <p style={{ fontSize: '12px', fontWeight: 700, color: FL.text, lineHeight: 1.3, marginBottom: '6px' }}>{prod.nombre}</p>
              <p style={{ fontSize: '18px', fontWeight: 800, color: FL.primary }}>S/. {prod.precio.toFixed(2)}</p>
              <p style={{ fontSize: '10px', color: FL.textMuted }}>caja/{prod.presentaciones[0].split(' ').slice(-2).join(' ')}</p>
              {prod.promo && (
                <div style={{ marginTop: '8px', background: FL.secondary + '18', borderRadius: '8px', padding: '5px 8px', border: `1px solid ${FL.secondary}44` }}>
                  <p style={{ color: FL.secondary, fontSize: '10px', fontWeight: 700 }}>🎁 {prod.promo}</p>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Bottom bar */}
      <div style={{ background: '#fff', borderTop: `1px solid ${FL.border}`, padding: '12px 16px' }} className="flex gap-3">
        <button style={{ flex: 1, background: FL.bg, border: `1.5px solid ${FL.border}`, borderRadius: '12px', padding: '12px', color: FL.text, fontSize: '13px', fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Ver todos ({PRODUCTOS.length})
        </button>
        <button style={{ flex: 1, background: FL.gradient, borderRadius: '12px', padding: '12px', color: '#fff', fontSize: '13px', fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Solicitar cotización
        </button>
      </div>
    </div>
  );
}
