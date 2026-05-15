import { TrendingUp, ShoppingBag, DollarSign, Users, MapPin, Package } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FL, VENTAS_SEMANA, PEDIDOS, VENDEDORES, fmt } from '../../data/farmalink';

export function Dashboard() {
  const kpis = [
    { label: 'Ventas hoy', value: 'S/. 13,310', sub: '+18% vs ayer', icon: TrendingUp, color: FL.primary, bg: '#EBF7FD' },
    { label: 'Pedidos', value: '24', sub: '8 confirmados', icon: ShoppingBag, color: FL.secondary, bg: '#EDFAF3' },
    { label: 'Cobrado', value: 'S/. 13,310', sub: '3 pendientes', icon: DollarSign, color: '#F87171', bg: '#FEF2F2' },
    { label: 'Clientes activos', value: '36', sub: '5 visitados hoy', icon: Users, color: '#A78BFA', bg: '#F5F3FF' },
  ];

  const GPS_POINTS = [
    { name: 'Carlos Quispe', x: 35, y: 45, status: 'Activo', cliente: 'Botica San Martín' },
    { name: 'María Huanca', x: 65, y: 60, status: 'En camino', cliente: 'Farmacia Los Andes' },
    { name: 'José Bellido', x: 50, y: 30, status: 'Activo', cliente: 'Botica El Progreso' },
  ];

  return (
    <div style={{ padding: '28px' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p style={{ fontSize: '24px', fontWeight: 800, color: FL.text }}>Buenos días, Admin 👋</p>
          <p style={{ fontSize: '14px', color: FL.textMuted }}>Miércoles 14 de Mayo, 2026 · Huancayo, Junín</p>
        </div>
        <div style={{ background: FL.gradient, borderRadius: '14px', padding: '12px 20px' }}>
          <p style={{ color: '#fff', fontSize: '13px', fontWeight: 700 }}>📊 Informe diario listo</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map(kpi => (
          <div key={kpi.label} style={{ background: '#fff', borderRadius: '18px', padding: '20px', boxShadow: FL.shadow }}>
            <div className="flex items-center justify-between mb-3">
              <div style={{ width: '44px', height: '44px', background: kpi.bg, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <kpi.icon size={22} color={kpi.color} />
              </div>
              <span style={{ background: '#ECFDF5', color: '#16A34A', borderRadius: '8px', padding: '3px 8px', fontSize: '11px', fontWeight: 700 }}>▲ {kpi.sub.split('%')[0]}%</span>
            </div>
            <p style={{ fontSize: '24px', fontWeight: 900, color: FL.text }}>{kpi.value}</p>
            <p style={{ fontSize: '12px', color: FL.textMuted }}>{kpi.label}</p>
            <p style={{ fontSize: '11px', color: FL.secondary, marginTop: '2px' }}>{kpi.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Ventas semana */}
        <div style={{ background: '#fff', borderRadius: '18px', padding: '20px', boxShadow: FL.shadow, gridColumn: 'span 2' }}>
          <div className="flex items-center justify-between mb-4">
            <p style={{ fontSize: '16px', fontWeight: 700, color: FL.text }}>Ventas de la semana</p>
            <div style={{ background: FL.bg, borderRadius: '10px', padding: '6px 12px' }}>
              <p style={{ fontSize: '12px', color: FL.primary, fontWeight: 600 }}>S/. 114,710 total</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={VENTAS_SEMANA}>
              <CartesianGrid strokeDasharray="3 3" stroke={FL.border} />
              <XAxis dataKey="dia" tick={{ fontSize: 12, fill: FL.textMuted }} />
              <YAxis tick={{ fontSize: 12, fill: FL.textMuted }} tickFormatter={v => `S/.${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => [`S/. ${v.toLocaleString()}`, 'Ventas']} contentStyle={{ borderRadius: '12px', border: `1px solid ${FL.border}`, fontFamily: "'Plus Jakarta Sans', sans-serif" }} />
              <Line type="monotone" dataKey="monto" stroke={FL.primary} strokeWidth={3} dot={{ fill: FL.primary, r: 5 }} activeDot={{ r: 7, fill: FL.secondary }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* GPS mapa */}
        <div style={{ background: '#fff', borderRadius: '18px', padding: '20px', boxShadow: FL.shadow }}>
          <div className="flex items-center justify-between mb-3">
            <p style={{ fontSize: '16px', fontWeight: 700, color: FL.text }}>Vendedores activos</p>
            <span style={{ background: '#DCFCE7', color: '#16A34A', borderRadius: '8px', padding: '3px 8px', fontSize: '11px', fontWeight: 700 }}>3 activos</span>
          </div>
          {/* Map sim */}
          <div style={{ background: '#E8F5E9', borderRadius: '14px', height: '180px', position: 'relative', overflow: 'hidden', marginBottom: '12px' }}>
            {/* Grid lines */}
            {[20, 40, 60, 80].map(p => (
              <div key={p} style={{ position: 'absolute', left: `${p}%`, top: 0, bottom: 0, borderLeft: '1px solid rgba(74,171,219,0.15)' }} />
            ))}
            {[25, 50, 75].map(p => (
              <div key={p} style={{ position: 'absolute', top: `${p}%`, left: 0, right: 0, borderTop: '1px solid rgba(74,171,219,0.15)' }} />
            ))}
            <div style={{ position: 'absolute', inset: 0, background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'40\' height=\'40\'%3E%3Cpath d=\'M0 20h40M20 0v40\' stroke=\'rgba(74,171,219,0.08)\' fill=\'none\'/%3E%3C/svg%3E")', opacity: 0.5 }} />
            {GPS_POINTS.map((p, i) => (
              <div key={i} style={{ position: 'absolute', left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%,-50%)' }}>
                <div style={{ width: '32px', height: '32px', background: FL.gradient, borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px ${FL.primary}55` }}>
                  <MapPin size={14} color="#fff" style={{ transform: 'rotate(45deg)' }} />
                </div>
                <div style={{ position: 'absolute', top: '-32px', left: '50%', transform: 'translateX(-50%)', background: '#fff', borderRadius: '8px', padding: '3px 8px', whiteSpace: 'nowrap', boxShadow: FL.shadow }}>
                  <p style={{ fontSize: '9px', fontWeight: 700, color: FL.text }}>{p.name.split(' ')[0]}</p>
                </div>
              </div>
            ))}
          </div>
          {GPS_POINTS.map((p, i) => (
            <div key={i} className="flex items-center gap-2 mb-2">
              <div style={{ width: '8px', height: '8px', background: FL.primary, borderRadius: '50%' }} />
              <p style={{ fontSize: '12px', color: FL.text, fontWeight: 600 }}>{p.name}</p>
              <span style={{ marginLeft: 'auto', background: '#DCFCE7', color: '#16A34A', borderRadius: '6px', padding: '1px 7px', fontSize: '10px', fontWeight: 700 }}>{p.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Últimos pedidos */}
      <div style={{ background: '#fff', borderRadius: '18px', padding: '20px', boxShadow: FL.shadow }}>
        <div className="flex items-center justify-between mb-4">
          <p style={{ fontSize: '16px', fontWeight: 700, color: FL.text }}>Últimos pedidos</p>
          <button style={{ color: FL.primary, fontSize: '13px', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>Ver todos →</button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: FL.bg }}>
              {['Pedido', 'Cliente', 'Vendedor', 'Fecha', 'Monto', 'Método', 'Estado'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: FL.textMuted, letterSpacing: '0.5px' }}>{h.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PEDIDOS.slice(0, 5).map((ped, i) => {
              const estadoColors: Record<string, string> = { Cobrado: '#16A34A', Pendiente: '#CA8A04', Observado: '#DC2626', Confirmado: '#1D4ED8' };
              const estadoBg: Record<string, string> = { Cobrado: '#DCFCE7', Pendiente: '#FEF9C3', Observado: '#FEE2E2', Confirmado: '#DBEAFE' };
              return (
                <tr key={ped.id} style={{ borderBottom: `1px solid ${FL.border}`, background: i % 2 === 0 ? '#fff' : FL.bg + '80' }}>
                  <td style={{ padding: '12px 14px', fontSize: '13px', fontWeight: 700, color: FL.primary }}>{ped.id}</td>
                  <td style={{ padding: '12px 14px', fontSize: '13px', color: FL.text }}>{ped.cliente}</td>
                  <td style={{ padding: '12px 14px', fontSize: '13px', color: FL.text }}>{ped.vendedor}</td>
                  <td style={{ padding: '12px 14px', fontSize: '12px', color: FL.textMuted }}>{ped.fecha} {ped.hora}</td>
                  <td style={{ padding: '12px 14px', fontSize: '14px', fontWeight: 800, color: FL.primary }}>{fmt(ped.monto)}</td>
                  <td style={{ padding: '12px 14px' }}>
                    {ped.metodo !== '-' ? <span style={{ background: '#F3F4F6', color: FL.text, borderRadius: '7px', padding: '3px 8px', fontSize: '11px', fontWeight: 600 }}>{ped.metodo}</span> : <span style={{ color: FL.textMuted, fontSize: '13px' }}>—</span>}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ background: estadoBg[ped.estado] || '#F3F4F6', color: estadoColors[ped.estado] || FL.textMuted, borderRadius: '8px', padding: '4px 10px', fontSize: '12px', fontWeight: 700 }}>
                      {ped.estado}
                    </span>
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
