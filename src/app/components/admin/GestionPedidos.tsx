import { useState } from 'react';
import { X, MapPin, Clock, CheckCircle, Package, Truck, Home } from 'lucide-react';
import { FL, PEDIDOS, fmt } from '../../data/farmalink';

const TABS = ['Todos', 'Confirmados', 'Pendientes', 'Observados', 'Cancelados'];

const ESTADO_STYLE: Record<string, { bg: string; color: string }> = {
  'Cobrado': { bg: '#DCFCE7', color: '#16A34A' },
  'Pendiente': { bg: '#FEF9C3', color: '#CA8A04' },
  'Observado': { bg: '#FEE2E2', color: '#DC2626' },
  'Confirmado': { bg: '#DBEAFE', color: '#1D4ED8' },
  'Cancelado': { bg: '#F3F4F6', color: '#6B7280' },
};

const TIMELINE = [
  { label: 'Pedido creado', time: '08:25', icon: Package, done: true },
  { label: 'Confirmado por vendedor', time: '08:32', icon: CheckCircle, done: true },
  { label: 'En preparación', time: '09:00', icon: Package, done: true },
  { label: 'En camino', time: '10:15', icon: Truck, done: true },
  { label: 'Entregado', time: '11:30', icon: Home, done: false },
];

export function GestionPedidos() {
  const [tabActivo, setTabActivo] = useState('Todos');
  const [modalPed, setModalPed] = useState<string | null>(null);

  const pedidoModal = PEDIDOS.find(p => p.id === modalPed);
  const filtrados = tabActivo === 'Todos' ? PEDIDOS : PEDIDOS.filter(p => {
    if (tabActivo === 'Confirmados') return p.estado === 'Cobrado' || p.estado === 'Confirmado';
    if (tabActivo === 'Pendientes') return p.estado === 'Pendiente';
    if (tabActivo === 'Observados') return p.estado === 'Observado';
    if (tabActivo === 'Cancelados') return p.estado === 'Cancelado';
    return true;
  });

  return (
    <div style={{ padding: '28px' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p style={{ fontSize: '24px', fontWeight: 800, color: FL.text }}>Gestión de Pedidos</p>
          <p style={{ fontSize: '14px', color: FL.textMuted }}>{PEDIDOS.length} pedidos · 14/05/2026</p>
        </div>
        <div className="flex gap-3">
          <div style={{ background: '#fff', borderRadius: '12px', padding: '10px 16px', boxShadow: FL.shadow, display: 'flex', gap: '16px' }}>
            {[
              { label: 'Cobrados', count: PEDIDOS.filter(p => p.estado === 'Cobrado').length, color: '#16A34A' },
              { label: 'Pendientes', count: PEDIDOS.filter(p => p.estado === 'Pendiente').length, color: '#CA8A04' },
              { label: 'Observados', count: PEDIDOS.filter(p => p.estado === 'Observado').length, color: '#DC2626' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '20px', fontWeight: 900, color: s.color }}>{s.count}</p>
                <p style={{ fontSize: '11px', color: FL.textMuted }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setTabActivo(tab)}
            style={{
              borderRadius: '10px', padding: '8px 18px', fontSize: '13px', fontWeight: 600,
              background: tabActivo === tab ? FL.gradient : '#fff',
              color: tabActivo === tab ? '#fff' : FL.textMuted,
              border: tabActivo === tab ? 'none' : `1.5px solid ${FL.border}`,
              cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: '18px', boxShadow: FL.shadow, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: FL.bg }}>
              {['Pedido', 'Cliente', 'Vendedor', 'Fecha/Hora', 'Productos', 'Monto', 'Método', 'Estado', 'Acciones'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: FL.textMuted, letterSpacing: '0.5px' }}>{h.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.map((ped, i) => {
              const est = ESTADO_STYLE[ped.estado] || ESTADO_STYLE['Pendiente'];
              return (
                <tr key={ped.id} style={{ borderBottom: `1px solid ${FL.border}`, background: i % 2 === 0 ? '#fff' : FL.bg + '60' }}>
                  <td style={{ padding: '13px 16px', fontSize: '13px', fontWeight: 700, color: FL.primary }}>{ped.id}</td>
                  <td style={{ padding: '13px 16px', fontSize: '13px', color: FL.text }}>{ped.cliente}</td>
                  <td style={{ padding: '13px 16px', fontSize: '13px', color: FL.text }}>{ped.vendedor}</td>
                  <td style={{ padding: '13px 16px', fontSize: '12px', color: FL.textMuted }}>{ped.fecha} {ped.hora}</td>
                  <td style={{ padding: '13px 16px', fontSize: '13px', color: FL.text, textAlign: 'center' }}>{ped.items}</td>
                  <td style={{ padding: '13px 16px', fontSize: '15px', fontWeight: 800, color: FL.primary }}>{fmt(ped.monto)}</td>
                  <td style={{ padding: '13px 16px' }}>
                    {ped.metodo !== '-'
                      ? <span style={{ background: '#F3F4F6', color: FL.text, borderRadius: '7px', padding: '4px 9px', fontSize: '11px', fontWeight: 600 }}>{ped.metodo}</span>
                      : <span style={{ color: FL.textMuted }}>—</span>}
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <span style={{ background: est.bg, color: est.color, borderRadius: '8px', padding: '4px 10px', fontSize: '12px', fontWeight: 700 }}>{ped.estado}</span>
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <button onClick={() => setModalPed(ped.id)}
                      style={{ background: FL.gradient, borderRadius: '8px', padding: '7px 14px', color: '#fff', fontSize: '11px', fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      Ver detalle
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalPed && pedidoModal && (
        <>
          <div onClick={() => setModalPed(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '700px', background: '#fff', borderRadius: '24px', zIndex: 60, overflow: 'hidden', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            {/* Modal header */}
            <div style={{ background: FL.gradient, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>Detalle del pedido</p>
                <p style={{ color: '#fff', fontSize: '20px', fontWeight: 800 }}>{pedidoModal.id}</p>
              </div>
              <button onClick={() => setModalPed(null)} style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '10px', padding: '8px', border: 'none', cursor: 'pointer' }}>
                <X size={18} color="#fff" />
              </button>
            </div>

            <div style={{ overflow: 'auto', padding: '24px', flex: 1 }}>
              {/* Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div style={{ background: FL.bg, borderRadius: '14px', padding: '16px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: FL.textMuted, marginBottom: '8px' }}>INFORMACIÓN DEL PEDIDO</p>
                  {[['Cliente', pedidoModal.cliente], ['Vendedor', pedidoModal.vendedor], ['Fecha', `${pedidoModal.fecha} ${pedidoModal.hora}`], ['Método', pedidoModal.metodo !== '-' ? pedidoModal.metodo : 'Pendiente'], ['Total', fmt(pedidoModal.monto)]].map(([k, v]) => (
                    <div key={k} className="flex justify-between py-1">
                      <p style={{ fontSize: '12px', color: FL.textMuted }}>{k}</p>
                      <p style={{ fontSize: '12px', fontWeight: 700, color: FL.text }}>{v}</p>
                    </div>
                  ))}
                </div>
                {/* Map preview */}
                <div style={{ background: '#E8F5E9', borderRadius: '14px', overflow: 'hidden', position: 'relative', minHeight: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {[20, 40, 60, 80].map(p => (
                    <div key={p} style={{ position: 'absolute', left: `${p}%`, top: 0, bottom: 0, borderLeft: '1px solid rgba(74,171,219,0.12)' }} />
                  ))}
                  {[33, 66].map(p => (
                    <div key={p} style={{ position: 'absolute', top: `${p}%`, left: 0, right: 0, borderTop: '1px solid rgba(74,171,219,0.12)' }} />
                  ))}
                  <div style={{ position: 'absolute', left: '40%', top: '45%', transform: 'translate(-50%,-50%)' }}>
                    <div style={{ width: '36px', height: '36px', background: FL.primary, borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px ${FL.primary}55` }}>
                      <MapPin size={16} color="#fff" style={{ transform: 'rotate(45deg)' }} />
                    </div>
                  </div>
                  <div style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', background: '#fff', borderRadius: '8px', padding: '4px 10px', whiteSpace: 'nowrap', boxShadow: FL.shadow }}>
                    <p style={{ fontSize: '11px', fontWeight: 700, color: FL.text }}>Jr. Real 420, Huancayo</p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <p style={{ fontSize: '14px', fontWeight: 700, color: FL.text, marginBottom: '16px' }}>Estado del pedido</p>
              <div className="flex flex-col gap-0">
                {TIMELINE.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: step.done ? FL.gradient : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon size={16} color={step.done ? '#fff' : '#9CA3AF'} />
                        </div>
                        {i < TIMELINE.length - 1 && (
                          <div style={{ width: '2px', flex: 1, background: step.done ? FL.primary : '#E5E7EB', minHeight: '24px' }} />
                        )}
                      </div>
                      <div style={{ paddingBottom: '16px', paddingTop: '4px' }}>
                        <p style={{ fontSize: '13px', fontWeight: step.done ? 700 : 400, color: step.done ? FL.text : FL.textMuted }}>{step.label}</p>
                        <p style={{ fontSize: '11px', color: FL.textMuted }}>{step.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ padding: '16px 24px', borderTop: `1px solid ${FL.border}`, display: 'flex', gap: '12px' }}>
              <button onClick={() => setModalPed(null)} style={{ flex: 1, background: FL.bg, border: `1.5px solid ${FL.border}`, borderRadius: '12px', padding: '12px', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '14px', fontWeight: 600, color: FL.text }}>
                Cerrar
              </button>
              <button style={{ flex: 2, background: FL.gradient, borderRadius: '12px', padding: '12px', color: '#fff', fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Actualizar estado
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
