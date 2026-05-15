import { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, Eye, Ban, X } from 'lucide-react';
import { FL, fmt } from '../../data/farmalink';

const COBRANZAS = [
  { id: 'REC-001', vendedor: 'Carlos Quispe', cliente: 'Botica San Martín', monto: 4280.00, metodo: 'Yape', hora: '08:32', hash: 'FL2026-A3F9-B8C2-7D1E', estado: 'Verificado' },
  { id: 'REC-002', vendedor: 'José Bellido', cliente: 'Botica El Progreso', monto: 3290.00, metodo: 'Transferencia', hora: '10:05', hash: 'FL2026-C7A2-E4F1-9B3D', estado: 'Verificado' },
  { id: 'REC-003', vendedor: 'María Huanca', cliente: 'Botica Mariátegui', monto: 1850.00, metodo: 'Efectivo', hora: '10:48', hash: 'FL2026-XXXX-TAMPERED', estado: 'Hash Inválido', alerta: true },
  { id: 'REC-004', vendedor: 'José Bellido', cliente: 'Farmacia Los Andes', monto: 5670.00, metodo: 'Plin', hora: '14:20', hash: 'FL2026-D1E8-F2C3-4A5B', estado: 'Verificado' },
  { id: 'REC-005', vendedor: 'Carlos Quispe', cliente: 'Farmacia Central', monto: 3420.00, metodo: 'Efectivo', hora: '15:10', hash: 'FL2026-B9C4-A7D2-6E1F', estado: 'Verificado' },
  { id: 'REC-006', vendedor: 'María Huanca', cliente: 'Botica San Martín', monto: 980.00, metodo: 'Yape', hora: '16:00', hash: 'FL2026-F3E1-C5B9-8D2A', estado: 'Pendiente' },
];

const METODO_COLORS: Record<string, { bg: string; color: string }> = {
  'Yape': { bg: '#EDE9FE', color: '#7C3AED' },
  'Plin': { bg: '#E0F2FE', color: '#0369A1' },
  'Efectivo': { bg: '#DCFCE7', color: '#16A34A' },
  'Transferencia': { bg: '#DBEAFE', color: '#1D4ED8' },
};

export function Cobranzas() {
  const [selected, setSelected] = useState<string | null>(null);
  const alertas = COBRANZAS.filter(c => c.alerta);
  const total = COBRANZAS.filter(c => c.estado === 'Verificado').reduce((a, c) => a + c.monto, 0);

  return (
    <div style={{ padding: '28px' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p style={{ fontSize: '24px', fontWeight: 800, color: FL.text }}>Cobranzas Anti-Fraude</p>
          <p style={{ fontSize: '14px', color: FL.textMuted }}>Verificación de autenticidad mediante hash único</p>
        </div>
        <div className="flex items-center gap-3">
          <div style={{ background: '#ECFDF5', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={18} color="#16A34A" />
            <div>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#16A34A' }}>Cobros verificados</p>
              <p style={{ fontSize: '16px', fontWeight: 900, color: '#16A34A' }}>{fmt(total)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alert banner */}
      {alertas.length > 0 && (
        <div style={{ background: '#FEF9C3', border: '2px solid #FDE047', borderRadius: '14px', padding: '14px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AlertTriangle size={22} color="#CA8A04" />
          <div className="flex-1">
            <p style={{ fontSize: '14px', fontWeight: 800, color: '#92400E' }}>⚠ Posible alteración detectada</p>
            <p style={{ fontSize: '13px', color: '#92400E' }}>{alertas.length} recibo(s) con hash inconsistente. Revisar de inmediato. Recibo: {alertas.map(a => a.id).join(', ')}</p>
          </div>
          <div className="flex gap-2">
            <button style={{ background: '#EF4444', borderRadius: '10px', padding: '8px 16px', color: '#fff', fontSize: '12px', fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Investigar</button>
            <button style={{ background: 'transparent', borderRadius: '10px', padding: '8px', border: `1px solid #FDE047`, cursor: 'pointer' }}>
              <X size={16} color="#CA8A04" />
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total cobranzas', value: COBRANZAS.length.toString(), icon: '📋', color: FL.primary, bg: '#EBF7FD' },
          { label: 'Verificadas', value: COBRANZAS.filter(c => c.estado === 'Verificado').length.toString(), icon: '✅', color: '#16A34A', bg: '#DCFCE7' },
          { label: 'Alertas', value: alertas.length.toString(), icon: '⚠', color: '#CA8A04', bg: '#FEF9C3' },
          { label: 'Monto verificado', value: 'S/. 18.6k', icon: '💰', color: FL.secondary, bg: '#EDFAF3' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: '16px', padding: '16px 18px', boxShadow: FL.shadow, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', background: s.bg, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>{s.icon}</div>
            <div>
              <p style={{ fontSize: '22px', fontWeight: 900, color: s.color }}>{s.value}</p>
              <p style={{ fontSize: '11px', color: FL.textMuted }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: '18px', boxShadow: FL.shadow, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: FL.bg }}>
              {['Recibo', 'Vendedor', 'Cliente', 'Monto', 'Método', 'Hora', 'Hash', 'Estado', 'Acciones'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: FL.textMuted, letterSpacing: '0.5px' }}>{h.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COBRANZAS.map(cob => {
              const mc = METODO_COLORS[cob.metodo] || { bg: '#F3F4F6', color: FL.textMuted };
              return (
                <tr key={cob.id}
                  style={{
                    borderBottom: `1px solid ${FL.border}`,
                    background: cob.alerta ? '#FFFBEB' : '#fff',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onClick={() => setSelected(cob.id === selected ? null : cob.id)}>
                  <td style={{ padding: '13px 16px', fontSize: '13px', fontWeight: 700, color: FL.primary }}>{cob.id}</td>
                  <td style={{ padding: '13px 16px', fontSize: '13px', color: FL.text }}>{cob.vendedor}</td>
                  <td style={{ padding: '13px 16px', fontSize: '13px', color: FL.text }}>{cob.cliente}</td>
                  <td style={{ padding: '13px 16px', fontSize: '14px', fontWeight: 800, color: FL.primary }}>{fmt(cob.monto)}</td>
                  <td style={{ padding: '13px 16px' }}>
                    <span style={{ background: mc.bg, color: mc.color, borderRadius: '8px', padding: '4px 10px', fontSize: '12px', fontWeight: 700 }}>{cob.metodo}</span>
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: '12px', color: FL.textMuted }}>{cob.hora}</td>
                  <td style={{ padding: '13px 16px' }}>
                    <div className="flex items-center gap-2">
                      {cob.alerta && <AlertTriangle size={14} color="#CA8A04" />}
                      <code style={{ fontSize: '10px', color: cob.alerta ? '#CA8A04' : FL.textMuted, background: cob.alerta ? '#FEF9C3' : '#F3F4F6', borderRadius: '6px', padding: '2px 7px' }}>
                        {cob.hash.slice(0, 16)}...
                      </code>
                    </div>
                    {cob.alerta && <p style={{ fontSize: '10px', color: '#EF4444', fontWeight: 700, marginTop: '2px' }}>⚠ Hash no coincide</p>}
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    {cob.estado === 'Verificado' && (
                      <span style={{ background: '#DCFCE7', color: '#16A34A', borderRadius: '8px', padding: '4px 10px', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px', width: 'fit-content' }}>
                        <CheckCircle size={12} /> Verificado
                      </span>
                    )}
                    {cob.alerta && (
                      <span style={{ background: '#FEE2E2', color: '#DC2626', borderRadius: '8px', padding: '4px 10px', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px', width: 'fit-content' }}>
                        <AlertTriangle size={12} /> Hash Inválido
                      </span>
                    )}
                    {cob.estado === 'Pendiente' && (
                      <span style={{ background: '#FEF9C3', color: '#CA8A04', borderRadius: '8px', padding: '4px 10px', fontSize: '11px', fontWeight: 700, width: 'fit-content', display: 'block' }}>Pendiente</span>
                    )}
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <div className="flex gap-2">
                      <button style={{ background: FL.bg, borderRadius: '8px', padding: '6px 10px', border: `1px solid ${FL.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Eye size={14} color={FL.primary} />
                        <span style={{ fontSize: '11px', color: FL.primary, fontWeight: 600 }}>Ver</span>
                      </button>
                      {cob.alerta && (
                        <button style={{ background: '#FEE2E2', borderRadius: '8px', padding: '6px 10px', border: '1px solid #FECACA', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Ban size={14} color="#DC2626" />
                          <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: 600 }}>Bloquear</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
