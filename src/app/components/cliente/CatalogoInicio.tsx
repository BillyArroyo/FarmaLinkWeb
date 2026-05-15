import { useState } from 'react';
import { Search, Bell, ShoppingCart, Star, Zap, Heart, Brain, Baby, Pill, FlaskConical, ChevronRight } from 'lucide-react';
import { FL, PRODUCTOS } from '../../data/farmalink';

const CATEGORIAS = [
  { nombre: 'Antibióticos', icon: Pill, color: '#4AABDB', bg: '#EBF7FD' },
  { nombre: 'Vitaminas', icon: Star, color: '#7ECBA1', bg: '#EDFAF3' },
  { nombre: 'Cardiología', icon: Heart, color: '#F87171', bg: '#FEF2F2' },
  { nombre: 'Pediátricos', icon: Baby, color: '#60A5FA', bg: '#EFF6FF' },
  { nombre: 'Dermatología', icon: Zap, color: '#FBBF24', bg: '#FFFBEB' },
  { nombre: 'Neurología', icon: Brain, color: '#A78BFA', bg: '#F5F3FF' },
];

const LABS = ['Todos', 'Genfar', 'MK', 'Bayer', 'Roemmers', 'Pfizer', 'Farmindustria'];

const PROMOS = PRODUCTOS.filter(p => p.promo);

interface Props { onCategoria: (cat: string) => void; onProducto: (id: number) => void; }

export function CatalogoInicio({ onCategoria, onProducto }: Props) {
  const [labActivo, setLabActivo] = useState('Todos');

  return (
    <div style={{ backgroundColor: FL.bg, fontFamily: "'Plus Jakarta Sans', sans-serif", color: FL.text }} className="min-h-full overflow-y-auto pb-6">
      {/* Header */}
      <div style={{ background: FL.gradient, borderRadius: '0 0 24px 24px' }} className="px-5 pt-12 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px' }}>Buenos días 👋</p>
            <p style={{ color: '#fff', fontSize: '16px', fontWeight: 700 }}>Botica San Martín</p>
          </div>
          <div className="flex gap-3">
            <button style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '12px' }} className="p-2.5">
              <Bell size={18} color="#fff" />
            </button>
            <button style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '12px' }} className="p-2.5">
              <ShoppingCart size={18} color="#fff" />
            </button>
          </div>
        </div>
        {/* Search */}
        <div style={{ background: '#fff', borderRadius: '14px' }} className="flex items-center px-4 py-3 gap-3">
          <Search size={18} color={FL.primary} />
          <span style={{ color: '#9CA3AF', fontSize: '14px' }}>Buscar productos, laboratorios...</span>
        </div>
        {/* Stats */}
        <div className="flex gap-3 mt-4">
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px' }} className="flex-1 p-3 text-center">
            <p style={{ color: '#fff', fontSize: '18px', fontWeight: 700 }}>342</p>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>Productos</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px' }} className="flex-1 p-3 text-center">
            <p style={{ color: '#fff', fontSize: '18px', fontWeight: 700 }}>18</p>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>Laboratorios</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px' }} className="flex-1 p-3 text-center">
            <p style={{ color: '#fff', fontSize: '18px', fontWeight: 700 }}>6</p>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>Promos activas</p>
          </div>
        </div>
      </div>

      <div className="px-4 mt-5">
        {/* Categorías */}
        <div className="flex items-center justify-between mb-3">
          <p style={{ fontSize: '15px', fontWeight: 700, color: FL.text }}>Categorías</p>
          <button style={{ color: FL.primary, fontSize: '13px', fontWeight: 600 }}>Ver todas</button>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-5">
          {CATEGORIAS.map(cat => {
            const Icon = cat.icon;
            return (
              <button key={cat.nombre} onClick={() => onCategoria(cat.nombre)}
                style={{ background: cat.bg, borderRadius: FL.radius, border: `1.5px solid ${cat.color}20` }}
                className="flex flex-col items-center py-4 gap-2 active:scale-95 transition-transform">
                <div style={{ background: cat.color, borderRadius: '12px', padding: '10px' }}>
                  <Icon size={20} color="#fff" />
                </div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: FL.text, textAlign: 'center', lineHeight: 1.3 }}>{cat.nombre}</span>
              </button>
            );
          })}
        </div>

        {/* Labs chips */}
        <p style={{ fontSize: '15px', fontWeight: 700, color: FL.text, marginBottom: '10px' }}>Laboratorios</p>
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5" style={{ scrollbarWidth: 'none' }}>
          {LABS.map(lab => (
            <button key={lab} onClick={() => setLabActivo(lab)}
              style={{
                borderRadius: '20px', padding: '7px 14px', whiteSpace: 'nowrap', fontSize: '13px', fontWeight: 600,
                background: labActivo === lab ? FL.gradient : '#fff',
                color: labActivo === lab ? '#fff' : FL.textMuted,
                border: labActivo === lab ? 'none' : `1.5px solid ${FL.border}`,
                boxShadow: labActivo === lab ? FL.shadow : 'none',
              }}>
              {lab}
            </button>
          ))}
        </div>

        {/* Promociones activas */}
        <div className="flex items-center justify-between mb-3">
          <p style={{ fontSize: '15px', fontWeight: 700, color: FL.text }}>🔥 Promociones Activas</p>
          <button style={{ color: FL.primary, fontSize: '13px', fontWeight: 600 }}>Ver todas</button>
        </div>

        <div className="flex flex-col gap-3">
          {PROMOS.map(prod => (
            <button key={prod.id} onClick={() => onProducto(prod.id)}
              style={{ background: '#fff', borderRadius: FL.radius, boxShadow: FL.shadow, overflow: 'hidden' }}
              className="flex items-center text-left active:scale-98 transition-transform">
              <div style={{ background: `linear-gradient(135deg, ${prod.color}33, ${prod.color}55)`, width: '88px', minHeight: '88px' }} className="flex items-center justify-center flex-shrink-0">
                <FlaskConical size={32} color={prod.color} />
              </div>
              <div className="flex-1 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span style={{ background: FL.secondary + '22', color: FL.secondary, borderRadius: '6px', padding: '2px 7px', fontSize: '10px', fontWeight: 700 }}>
                    {prod.promo}
                  </span>
                </div>
                <p style={{ fontSize: '14px', fontWeight: 700, color: FL.text }}>{prod.nombre}</p>
                <p style={{ fontSize: '12px', color: FL.textMuted }}>{prod.lab}</p>
                <div className="flex items-center justify-between mt-2">
                  <p style={{ fontSize: '18px', fontWeight: 800, color: FL.primary }}>S/. {prod.precio.toFixed(2)}</p>
                  <div style={{ background: FL.gradient, borderRadius: '10px', padding: '6px 12px' }}>
                    <p style={{ color: '#fff', fontSize: '12px', fontWeight: 700 }}>Ver más</p>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Más productos */}
        <div className="flex items-center justify-between mt-5 mb-3">
          <p style={{ fontSize: '15px', fontWeight: 700, color: FL.text }}>Más productos</p>
          <button style={{ color: FL.primary, fontSize: '13px', fontWeight: 600 }}>Ver catálogo</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {PRODUCTOS.slice(2, 8).map(prod => (
            <button key={prod.id} onClick={() => onProducto(prod.id)}
              style={{ background: '#fff', borderRadius: FL.radius, boxShadow: FL.shadow, overflow: 'hidden' }}
              className="text-left active:scale-95 transition-transform">
              <div style={{ background: `linear-gradient(135deg, ${prod.color}22, ${prod.color}44)`, height: '80px' }} className="flex items-center justify-center">
                <Pill size={28} color={prod.color} />
              </div>
              <div className="p-3">
                <p style={{ fontSize: '12px', color: FL.textMuted, marginBottom: '2px' }}>{prod.lab}</p>
                <p style={{ fontSize: '13px', fontWeight: 700, color: FL.text, lineHeight: 1.3 }}>{prod.nombre}</p>
                <p style={{ fontSize: '16px', fontWeight: 800, color: FL.primary, marginTop: '4px' }}>S/. {prod.precio.toFixed(2)}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{ background: '#fff', borderTop: `1px solid ${FL.border}`, position: 'sticky', bottom: 0 }} className="flex justify-around py-3 mt-5">
        {[{ icon: '🏠', label: 'Inicio', active: true }, { icon: '📋', label: 'Catálogo' }, { icon: '🛒', label: 'Pedidos' }, { icon: '👤', label: 'Perfil' }].map(item => (
          <button key={item.label} className="flex flex-col items-center gap-1">
            <span style={{ fontSize: '20px' }}>{item.icon}</span>
            <span style={{ fontSize: '10px', fontWeight: 600, color: item.active ? FL.primary : FL.textMuted }}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
