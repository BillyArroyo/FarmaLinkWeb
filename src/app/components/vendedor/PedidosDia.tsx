import { ArrowLeft, TrendingUp } from 'lucide-react';
import { FL } from '../../data/farmalink';

interface Props { onBack: () => void; onPedido: (id: string) => void; }

const ESTADO: Record<string, { bg: string; color: string; label: string }> = {
  'Cobrado': { bg: '#DCFCE7', color: '#16A34A', label: '✓ Cobrado' },
  'Pendiente': { bg: '#FEF9C3', color: '#CA8A04', label: '⏳ Pendiente' },
  'Observado': { bg: '#FEE2E2', color: '#DC2626', label: '⚠ Observado' },
  'Confirmado': { bg: '#DBEAFE', color: '#1D4ED8', label: '📋 Confirmado' },
};

export function PedidosDia({ onBack }: Props) {
  return (
    <div style={{ backgroundColor: FL.bg, fontFamily: "'Plus Jakarta Sans', sans-serif", color: FL.text }} className="min-h-full flex flex-col">
      {/* Header */}
      <div style={{ background: '#fff', boxShadow: FL.shadow }} className="px-4 pt-12 pb-4 flex items-center gap-3">
        <button onClick={onBack} style={{ background: FL.bg, borderRadius: '12px' }} className="p-2.5">
          <ArrowLeft size={18} color={FL.text} />
        </button>
        <div>
          <p style={{ fontSize: '17px', fontWeight: 800 }}>Pedidos del Día</p>
          <p style={{ fontSize: '11px', color: FL.textMuted }}>Sin pedidos registrados aún</p>
        </div>
      </div>

      {/* Resumen card */}
      <div className="mx-4 mt-4">
        <div style={{ background: FL.gradient, borderRadius: '20px', padding: '20px', boxShadow: FL.shadowMd }}>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={18} color="rgba(255,255,255,0.9)" />
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', fontWeight: 600 }}>Resumen del día</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total pedidos', value: '0', sub: '' },
              { label: 'Cobrado', value: 'S/. 0.00', sub: '0 pedidos' },
              { label: 'Pendiente', value: 'S/. 0.00', sub: '0 pedidos' },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
                <p style={{ color: '#fff', fontSize: '18px', fontWeight: 800 }}>{s.value}</p>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '10px', lineHeight: 1.3 }}>{s.label}</p>
                {s.sub && <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '10px' }}>{s.sub}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Empty state */}
      <div className="flex-1 flex flex-col items-center justify-center gap-3 px-8">
        <div style={{ width: '64px', height: '64px', background: '#fff', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: FL.shadow }}>
          <span style={{ fontSize: '28px' }}>📋</span>
        </div>
        <p style={{ fontSize: '16px', fontWeight: 700, color: FL.text, textAlign: 'center' }}>Sin pedidos hoy</p>
        <p style={{ fontSize: '13px', color: FL.textMuted, textAlign: 'center', lineHeight: 1.5 }}>
          La tabla de pedidos aún no ha sido implementada. Genera tu primer pedido desde el catálogo.
        </p>
      </div>

      {/* Bottom nav */}
      <div style={{ background: '#fff', borderTop: `1px solid ${FL.border}` }} className="flex justify-around py-3">
        {[{ icon: '🏠', label: 'Inicio' }, { icon: '📋', label: 'Pedidos', active: true }, { icon: '👥', label: 'Clientes' }, { icon: '👤', label: 'Perfil' }].map(item => (
          <button key={item.label} className="flex flex-col items-center gap-1">
            <span style={{ fontSize: '20px' }}>{item.icon}</span>
            <span style={{ fontSize: '10px', fontWeight: 600, color: item.active ? FL.primary : FL.textMuted }}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
