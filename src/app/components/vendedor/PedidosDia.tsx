import { useState } from 'react';
import { ArrowLeft, TrendingUp, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { FL, fmt } from '../../data/farmalink';
import { usePedidos } from '../../../modules/pedidos/hooks/usePedidos';

interface Props { onBack: () => void; onPedido: (id: string) => void; }

const ESTADO_CONFIG: Record<string, { bg: string; color: string; label: string }> = {
  confirmado:  { bg: '#DBEAFE', color: '#1D4ED8', label: 'Confirmado' },
  borrador:    { bg: '#F3F4F6', color: '#6B7280', label: 'Borrador' },
  en_proceso:  { bg: '#FEF9C3', color: '#CA8A04', label: 'En proceso' },
  entregado:   { bg: '#DCFCE7', color: '#16A34A', label: 'Entregado' },
  cancelado:   { bg: '#FEE2E2', color: '#DC2626', label: 'Cancelado' },
};

export function PedidosDia({ onBack }: Props) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const { pedidos, loading } = usePedidos(undefined, hoy.toISOString());
  const [expandido, setExpandido] = useState<string | null>(null);

  const totalCobrado = pedidos
    .filter(p => p.estado === 'entregado')
    .reduce((s: number, p: any) => s + (p.total ?? 0), 0);

  const totalPendiente = pedidos
    .filter(p => ['confirmado', 'en_proceso'].includes(p.estado))
    .reduce((s: number, p: any) => s + (p.total ?? 0), 0);

  return (
    <div style={{ backgroundColor: FL.bg, fontFamily: "'Plus Jakarta Sans', sans-serif", color: FL.text }} className="min-h-full flex flex-col">
      {/* Header */}
      <div style={{ background: '#fff', boxShadow: FL.shadow }} className="px-4 pt-12 pb-4 flex items-center gap-3">
        <button onClick={onBack} style={{ background: FL.bg, borderRadius: '12px' }} className="p-2.5">
          <ArrowLeft size={18} color={FL.text} />
        </button>
        <div>
          <p style={{ fontSize: '17px', fontWeight: 800 }}>Pedidos del Día</p>
          <p style={{ fontSize: '11px', color: FL.textMuted }}>
            {loading ? 'Cargando...' : `${pedidos.length} pedido${pedidos.length !== 1 ? 's' : ''} hoy`}
          </p>
        </div>
        {/* Indicador realtime */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16A34A', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: '10px', color: '#16A34A', fontWeight: 600 }}>En vivo</span>
        </div>
      </div>

      {/* Resumen */}
      <div className="mx-4 mt-4">
        <div style={{ background: FL.gradient, borderRadius: '20px', padding: '20px', boxShadow: FL.shadowMd }}>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={18} color="rgba(255,255,255,0.9)" />
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', fontWeight: 600 }}>Resumen del día</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total pedidos', value: loading ? '—' : String(pedidos.length) },
              { label: 'Entregado', value: loading ? '—' : fmt(totalCobrado) },
              { label: 'Pendiente', value: loading ? '—' : fmt(totalPendiente) },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
                <p style={{ color: '#fff', fontSize: '15px', fontWeight: 800 }}>{s.value}</p>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '10px', lineHeight: 1.3 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de pedidos */}
      <div className="flex-1 overflow-y-auto px-4 mt-4 pb-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 size={28} color={FL.primary} style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ fontSize: '13px', color: FL.textMuted }}>Cargando pedidos...</p>
          </div>
        ) : pedidos.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <div style={{ width: '64px', height: '64px', background: '#fff', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: FL.shadow }}>
              <span style={{ fontSize: '28px' }}>📋</span>
            </div>
            <p style={{ fontSize: '16px', fontWeight: 700, color: FL.text }}>Sin pedidos hoy</p>
            <p style={{ fontSize: '13px', color: FL.textMuted, textAlign: 'center', lineHeight: 1.5 }}>
              Los pedidos nuevos aparecerán aquí en tiempo real.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {pedidos.map((pedido: any) => {
              const conf = ESTADO_CONFIG[pedido.estado] ?? ESTADO_CONFIG.borrador;
              const isOpen = expandido === pedido.id;
              const lineas: any[] = pedido.lineas ?? [];

              return (
                <div key={pedido.id} style={{ background: '#fff', borderRadius: FL.radius, boxShadow: FL.shadow, overflow: 'hidden' }}>
                  <button
                    onClick={() => setExpandido(isOpen ? null : pedido.id)}
                    style={{ width: '100%', padding: '14px', display: 'flex', alignItems: 'center', gap: '10px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <div style={{ flex: 1 }}>
                      <div className="flex items-center gap-2 mb-1">
                        <p style={{ fontSize: '13px', fontWeight: 800, color: FL.text, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          {pedido.numero ?? 'PED—'}
                        </p>
                        <span style={{ background: conf.bg, color: conf.color, borderRadius: '6px', padding: '2px 8px', fontSize: '10px', fontWeight: 700 }}>
                          {conf.label}
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', color: FL.textMuted, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {pedido.cliente?.nombre_farmacia ?? 'Cliente desconocido'}
                        {pedido.cliente?.distrito ? ` · ${pedido.cliente.distrito}` : ''}
                      </p>
                      <p style={{ fontSize: '11px', color: FL.textMuted, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {new Date(pedido.created_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                        {' · '}{lineas.length} producto{lineas.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '16px', fontWeight: 900, color: FL.primary, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {fmt(pedido.total ?? 0)}
                      </p>
                      {isOpen
                        ? <ChevronUp size={16} color={FL.textMuted} />
                        : <ChevronDown size={16} color={FL.textMuted} />
                      }
                    </div>
                  </button>

                  {/* Detalle expandido */}
                  {isOpen && lineas.length > 0 && (
                    <div style={{ borderTop: `1px solid ${FL.border}`, padding: '12px 14px' }}>
                      {lineas.map((l: any) => (
                        <div key={l.id} className="flex justify-between items-center py-1.5">
                          <div>
                            <p style={{ fontSize: '12px', fontWeight: 600, color: FL.text, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                              {l.producto?.nombre ?? l.producto_id}
                            </p>
                            <p style={{ fontSize: '11px', color: FL.textMuted, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                              {l.producto?.laboratorio} · {l.cantidad} und.
                            </p>
                          </div>
                          <p style={{ fontSize: '13px', fontWeight: 700, color: FL.primary, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                            {fmt(l.subtotal)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div style={{ background: '#fff', borderTop: `1px solid ${FL.border}` }} className="flex justify-around py-3">
        {[{ icon: '🏠', label: 'Inicio' }, { icon: '📋', label: 'Pedidos', active: true }, { icon: '👥', label: 'Clientes' }, { icon: '👤', label: 'Perfil' }].map(item => (
          <button key={item.label} className="flex flex-col items-center gap-1">
            <span style={{ fontSize: '20px' }}>{item.icon}</span>
            <span style={{ fontSize: '10px', fontWeight: 600, color: (item as any).active ? FL.primary : FL.textMuted }}>{item.label}</span>
          </button>
        ))}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}
