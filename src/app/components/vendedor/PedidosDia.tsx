import { ArrowLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { FL, PEDIDOS, fmt } from '../../data/farmalink';

interface Props { onBack: () => void; onPedido: (id: string) => void; }

const ESTADO: Record<string, { bg: string; color: string; label: string }> = {
  'Cobrado': { bg: '#DCFCE7', color: '#16A34A', label: '✓ Cobrado' },
  'Pendiente': { bg: '#FEF9C3', color: '#CA8A04', label: '⏳ Pendiente' },
  'Observado': { bg: '#FEE2E2', color: '#DC2626', label: '⚠ Observado' },
  'Confirmado': { bg: '#DBEAFE', color: '#1D4ED8', label: '📋 Confirmado' },
};

export function PedidosDia({ onBack, onPedido }: Props) {
  const pedidos = PEDIDOS.slice(0, 6);
  const cobrado = pedidos.filter(p => p.estado === 'Cobrado').reduce((a, p) => a + p.monto, 0);
  const pendiente = pedidos.filter(p => p.estado === 'Pendiente').reduce((a, p) => a + p.monto, 0);
  const nCobrado = pedidos.filter(p => p.estado === 'Cobrado').length;
  const nPendiente = pedidos.filter(p => p.estado === 'Pendiente').length;

  return (
    <div style={{ backgroundColor: FL.bg, fontFamily: "'Plus Jakarta Sans', sans-serif", color: FL.text }} className="min-h-full flex flex-col">
      {/* Header */}
      <div style={{ background: '#fff', boxShadow: FL.shadow }} className="px-4 pt-12 pb-4 flex items-center gap-3">
        <button onClick={onBack} style={{ background: FL.bg, borderRadius: '12px' }} className="p-2.5">
          <ArrowLeft size={18} color={FL.text} />
        </button>
        <div>
          <p style={{ fontSize: '17px', fontWeight: 800 }}>Pedidos del Día</p>
          <p style={{ fontSize: '11px', color: FL.textMuted }}>Miércoles 14/05/2026 · Carlos Quispe</p>
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
              { label: 'Total pedidos', value: pedidos.length.toString(), sub: '' },
              { label: 'Cobrado', value: `S/. ${(cobrado / 1000).toFixed(1)}k`, sub: `${nCobrado} pedidos` },
              { label: 'Pendiente', value: `S/. ${(pendiente / 1000).toFixed(1)}k`, sub: `${nPendiente} pedidos` },
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

      {/* Filter tabs */}
      <div className="px-4 mt-4">
        <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {['Todos', 'Cobrados', 'Pendientes', 'Observados'].map(tab => (
            <button key={tab} style={{ borderRadius: '20px', padding: '6px 16px', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap', background: tab === 'Todos' ? FL.gradient : '#fff', color: tab === 'Todos' ? '#fff' : FL.textMuted, border: tab === 'Todos' ? 'none' : `1.5px solid ${FL.border}`, flexShrink: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Pedidos list */}
      <div className="px-4 mt-3 flex-1 overflow-y-auto pb-6">
        <div className="flex flex-col gap-3">
          {pedidos.map(ped => {
            const est = ESTADO[ped.estado] || ESTADO['Pendiente'];
            return (
              <button key={ped.id} onClick={() => onPedido(ped.id)}
                style={{ background: '#fff', borderRadius: FL.radius, boxShadow: FL.shadow, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left' }}
                className="active:scale-98 transition-transform">
                <div style={{ width: '44px', height: '44px', background: est.bg, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <p style={{ fontSize: '18px' }}>{ped.estado === 'Cobrado' ? '✓' : ped.estado === 'Pendiente' ? '⏳' : '⚠'}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p style={{ fontSize: '13px', fontWeight: 800, color: FL.text }}>{ped.id}</p>
                    <span style={{ background: est.bg, color: est.color, borderRadius: '7px', padding: '2px 7px', fontSize: '10px', fontWeight: 700 }}>{est.label}</span>
                  </div>
                  <p style={{ fontSize: '12px', color: FL.text, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ped.cliente}</p>
                  <div className="flex items-center gap-2">
                    <p style={{ fontSize: '11px', color: FL.textMuted }}>{ped.hora}</p>
                    {ped.metodo !== '-' && <span style={{ background: '#F3F4F6', borderRadius: '6px', padding: '1px 6px', fontSize: '10px', color: FL.textMuted }}>{ped.metodo}</span>}
                    <p style={{ fontSize: '11px', color: FL.textMuted }}>{ped.items} productos</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p style={{ fontSize: '16px', fontWeight: 800, color: FL.primary }}>S/. {(ped.monto / 1000).toFixed(1)}k</p>
                  <ChevronRight size={16} color={FL.textMuted} />
                </div>
              </button>
            );
          })}
        </div>
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
