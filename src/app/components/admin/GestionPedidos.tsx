import { ShoppingBag } from 'lucide-react';
import { FL } from '../../data/farmalink';

const TABS = ['Todos', 'Confirmados', 'Pendientes', 'Observados', 'Cancelados'];

export function GestionPedidos() {
  return (
    <div style={{ padding: '28px' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p style={{ fontSize: '24px', fontWeight: 800, color: FL.text }}>Gestión de Pedidos</p>
          <p style={{ fontSize: '14px', color: FL.textMuted }}>0 pedidos · tabla no creada aún</p>
        </div>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '10px 16px', boxShadow: FL.shadow, display: 'flex', gap: '16px' }}>
          {[
            { label: 'Cobrados', count: 0, color: '#16A34A' },
            { label: 'Pendientes', count: 0, color: '#CA8A04' },
            { label: 'Observados', count: 0, color: '#DC2626' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '20px', fontWeight: 900, color: s.color }}>{s.count}</p>
              <p style={{ fontSize: '11px', color: FL.textMuted }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {TABS.map((tab, i) => (
          <button key={tab}
            style={{
              borderRadius: '10px', padding: '8px 18px', fontSize: '13px', fontWeight: 600,
              background: i === 0 ? FL.gradient : '#fff',
              color: i === 0 ? '#fff' : FL.textMuted,
              border: i === 0 ? 'none' : `1.5px solid ${FL.border}`,
              cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Empty state */}
      <div style={{ background: '#fff', borderRadius: '18px', boxShadow: FL.shadow, padding: '72px 40px', textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', background: FL.bg, borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <ShoppingBag size={30} color={FL.textMuted} />
        </div>
        <p style={{ fontSize: '18px', fontWeight: 700, color: FL.text, marginBottom: '8px' }}>Sin pedidos registrados</p>
        <p style={{ fontSize: '14px', color: FL.textMuted, maxWidth: '380px', margin: '0 auto' }}>
          La tabla de pedidos aún no ha sido creada en Supabase. Los pedidos aparecerán aquí cuando se implemente el módulo completo.
        </p>
      </div>
    </div>
  );
}
