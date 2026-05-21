import { useState } from 'react';
import { Download, FileSpreadsheet, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { FL, fmt } from '../../data/farmalink';

const VENTAS_SEMANA = [
  { dia: 'Lun', monto: 12400 }, { dia: 'Mar', monto: 18600 }, { dia: 'Mié', monto: 15200 },
  { dia: 'Jue', monto: 21800 }, { dia: 'Vie', monto: 19300 }, { dia: 'Sáb', monto: 14100 }, { dia: 'Hoy', monto: 13310 },
];
const DIST_LABORATORIO = [
  { name: 'Genfar', value: 35, color: '#4AABDB' }, { name: 'MK', value: 22, color: '#7ECBA1' },
  { name: 'Roemmers', value: 18, color: '#F87171' }, { name: 'Pfizer', value: 12, color: '#A78BFA' }, { name: 'Otros', value: 13, color: '#FBBF24' },
];
const VENDEDORES = [
  { id: 1, nombre: 'Carlos Quispe', zona: 'Zona Norte', pedidos: 8, cobrado: 4280.00, clientes: 12, meta: 6000, avatar: 'CQ' },
  { id: 2, nombre: 'María Huanca', zona: 'Zona Sur', pedidos: 6, cobrado: 3150.00, clientes: 9, meta: 5000, avatar: 'MH' },
  { id: 3, nombre: 'José Bellido', zona: 'Zona Centro', pedidos: 10, cobrado: 5890.00, clientes: 15, meta: 7000, avatar: 'JB' },
];

const TABS_REP = ['Ventas', 'Cobranzas', 'Vendedores'];

const VENTAS_MES = [
  { semana: 'Sem 1', ventas: 62400, meta: 60000 },
  { semana: 'Sem 2', ventas: 74800, meta: 70000 },
  { semana: 'Sem 3', ventas: 88200, meta: 80000 },
  { semana: 'Sem 4', ventas: 114710, meta: 100000 },
];

export function Reportes() {
  const [tabActivo, setTabActivo] = useState('Ventas');

  return (
    <div style={{ padding: '28px' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p style={{ fontSize: '24px', fontWeight: 800, color: FL.text }}>Reportes & Análisis</p>
          <p style={{ fontSize: '14px', color: FL.textMuted }}>Mayo 2026 · Huancayo, Junín</p>
        </div>
        <div className="flex gap-3">
          <button style={{ background: '#fff', border: `1.5px solid ${FL.border}`, borderRadius: '12px', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", color: FL.text, fontSize: '13px', fontWeight: 600 }}>
            <FileSpreadsheet size={16} color="#16A34A" />
            Exportar Excel
          </button>
          <button style={{ background: FL.gradient, borderRadius: '12px', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', cursor: 'pointer', color: '#fff', fontSize: '13px', fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <Download size={16} color="#fff" />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {TABS_REP.map(tab => (
          <button key={tab} onClick={() => setTabActivo(tab)}
            style={{ borderRadius: '10px', padding: '9px 20px', fontSize: '14px', fontWeight: 600, background: tabActivo === tab ? FL.gradient : '#fff', color: tabActivo === tab ? '#fff' : FL.textMuted, border: tabActivo === tab ? 'none' : `1.5px solid ${FL.border}`, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {tab}
          </button>
        ))}
      </div>

      {tabActivo === 'Ventas' && (
        <div>
          {/* KPIs ventas */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Ventas del mes', value: 'S/. 340,110', delta: '+22%', up: true },
              { label: 'Pedidos del mes', value: '284', delta: '+15%', up: true },
              { label: 'Ticket promedio', value: 'S/. 1,197', delta: '+6%', up: true },
              { label: 'Devoluciones', value: '3', delta: '-2%', up: false },
            ].map(kpi => (
              <div key={kpi.label} style={{ background: '#fff', borderRadius: '16px', padding: '18px', boxShadow: FL.shadow }}>
                <p style={{ fontSize: '12px', color: FL.textMuted, marginBottom: '6px' }}>{kpi.label}</p>
                <p style={{ fontSize: '22px', fontWeight: 900, color: FL.text }}>{kpi.value}</p>
                <div className="flex items-center gap-1 mt-1">
                  {kpi.up ? <TrendingUp size={14} color="#16A34A" /> : <TrendingDown size={14} color="#EF4444" />}
                  <p style={{ fontSize: '12px', color: kpi.up ? '#16A34A' : '#EF4444', fontWeight: 700 }}>{kpi.delta} vs mes anterior</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Bar chart */}
            <div style={{ background: '#fff', borderRadius: '18px', padding: '20px', boxShadow: FL.shadow, gridColumn: 'span 2' }}>
              <p style={{ fontSize: '16px', fontWeight: 700, color: FL.text, marginBottom: '16px' }}>Ventas vs Meta — Mayo 2026</p>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={VENTAS_MES}>
                  <CartesianGrid strokeDasharray="3 3" stroke={FL.border} />
                  <XAxis dataKey="semana" tick={{ fontSize: 12, fill: FL.textMuted }} />
                  <YAxis tick={{ fontSize: 11, fill: FL.textMuted }} tickFormatter={v => `S/.${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number, name: string) => [`S/. ${v.toLocaleString()}`, name === 'ventas' ? 'Ventas' : 'Meta']} contentStyle={{ borderRadius: '12px', border: `1px solid ${FL.border}`, fontFamily: "'Plus Jakarta Sans', sans-serif" }} />
                  <Bar dataKey="meta" fill={FL.border} radius={[6, 6, 0, 0]} name="meta" />
                  <Bar dataKey="ventas" fill={FL.primary} radius={[6, 6, 0, 0]} name="ventas" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Donut lab */}
            <div style={{ background: '#fff', borderRadius: '18px', padding: '20px', boxShadow: FL.shadow }}>
              <p style={{ fontSize: '16px', fontWeight: 700, color: FL.text, marginBottom: '16px' }}>Por laboratorio</p>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={DIST_LABORATORIO} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {DIST_LABORATORIO.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v}%`, 'Participación']} contentStyle={{ borderRadius: '10px', fontFamily: "'Plus Jakarta Sans', sans-serif" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-1 mt-2">
                {DIST_LABORATORIO.map(lab => (
                  <div key={lab.name} className="flex items-center gap-2">
                    <div style={{ width: '10px', height: '10px', background: lab.color, borderRadius: '50%', flexShrink: 0 }} />
                    <p style={{ fontSize: '12px', color: FL.text, flex: 1 }}>{lab.name}</p>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: FL.text }}>{lab.value}%</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tabActivo === 'Vendedores' && (
        <div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {VENDEDORES.map((v, i) => (
              <div key={v.id} style={{ background: '#fff', borderRadius: '18px', padding: '20px', boxShadow: FL.shadow }}>
                <div className="flex items-center gap-3 mb-3">
                  <div style={{ width: '48px', height: '48px', background: FL.gradient, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ color: '#fff', fontSize: '16px', fontWeight: 800 }}>{v.avatar}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '15px', fontWeight: 700, color: FL.text }}>{v.nombre}</p>
                    <p style={{ fontSize: '12px', color: FL.textMuted }}>{v.zona}</p>
                  </div>
                  {i === 0 && <span style={{ marginLeft: 'auto', fontSize: '20px' }}>🥇</span>}
                  {i === 1 && <span style={{ marginLeft: 'auto', fontSize: '20px' }}>🥈</span>}
                  {i === 2 && <span style={{ marginLeft: 'auto', fontSize: '20px' }}>🥉</span>}
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div style={{ background: FL.bg, borderRadius: '10px', padding: '10px' }}>
                    <p style={{ fontSize: '18px', fontWeight: 900, color: FL.primary }}>{v.pedidos}</p>
                    <p style={{ fontSize: '10px', color: FL.textMuted }}>Pedidos</p>
                  </div>
                  <div style={{ background: FL.bg, borderRadius: '10px', padding: '10px' }}>
                    <p style={{ fontSize: '18px', fontWeight: 900, color: FL.secondary }}>{v.clientes}</p>
                    <p style={{ fontSize: '10px', color: FL.textMuted }}>Clientes</p>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <p style={{ fontSize: '12px', color: FL.textMuted }}>Meta: {fmt(v.meta)}</p>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: FL.primary }}>{Math.round(v.cobrado / v.meta * 100)}%</p>
                  </div>
                  <div style={{ background: FL.bg, borderRadius: '10px', height: '8px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(v.cobrado / v.meta * 100, 100)}%`, height: '100%', background: FL.gradient, borderRadius: '10px' }} />
                  </div>
                  <p style={{ fontSize: '13px', fontWeight: 800, color: FL.primary, marginTop: '6px' }}>{fmt(v.cobrado)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Ranking tabla */}
          <div style={{ background: '#fff', borderRadius: '18px', padding: '20px', boxShadow: FL.shadow }}>
            <p style={{ fontSize: '16px', fontWeight: 700, color: FL.text, marginBottom: '16px' }}>Ranking de vendedores — Mayo 2026</p>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: FL.bg }}>
                  {['Pos.', 'Vendedor', 'Zona', 'Pedidos', 'Clientes', 'Cobrado', 'Meta', 'Cumplimiento'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: FL.textMuted, letterSpacing: '0.5px' }}>{h.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...VENDEDORES].sort((a, b) => b.cobrado - a.cobrado).map((v, i) => {
                  const pct = Math.round(v.cobrado / v.meta * 100);
                  return (
                    <tr key={v.id} style={{ borderBottom: `1px solid ${FL.border}` }}>
                      <td style={{ padding: '12px 14px', fontSize: '16px' }}>{['🥇', '🥈', '🥉'][i]}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <div className="flex items-center gap-2">
                          <div style={{ width: '32px', height: '32px', background: FL.gradient, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <p style={{ color: '#fff', fontSize: '11px', fontWeight: 700 }}>{v.avatar}</p>
                          </div>
                          <p style={{ fontSize: '13px', fontWeight: 700, color: FL.text }}>{v.nombre}</p>
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '13px', color: FL.textMuted }}>{v.zona}</td>
                      <td style={{ padding: '12px 14px', fontSize: '14px', fontWeight: 700, color: FL.text }}>{v.pedidos}</td>
                      <td style={{ padding: '12px 14px', fontSize: '14px', fontWeight: 700, color: FL.text }}>{v.clientes}</td>
                      <td style={{ padding: '12px 14px', fontSize: '14px', fontWeight: 800, color: FL.primary }}>{fmt(v.cobrado)}</td>
                      <td style={{ padding: '12px 14px', fontSize: '13px', color: FL.textMuted }}>{fmt(v.meta)}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <div className="flex items-center gap-2">
                          <div style={{ flex: 1, background: FL.bg, borderRadius: '6px', height: '8px', overflow: 'hidden', minWidth: '60px' }}>
                            <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: pct >= 100 ? FL.secondary : FL.primary, borderRadius: '6px' }} />
                          </div>
                          <p style={{ fontSize: '12px', fontWeight: 700, color: pct >= 100 ? FL.secondary : FL.primary, minWidth: '36px' }}>{pct}%</p>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tabActivo === 'Cobranzas' && (
        <div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Total cobrado', value: 'S/. 340,110', delta: '+22%', color: FL.primary },
              { label: 'Yape', value: 'S/. 142,320', pct: '42%', color: '#7C3AED' },
              { label: 'Efectivo', value: 'S/. 98,450', pct: '29%', color: '#16A34A' },
              { label: 'Transferencia', value: 'S/. 68,230', pct: '20%', color: '#0369A1' },
              { label: 'Plin', value: 'S/. 31,110', pct: '9%', color: '#0EA5E9' },
              { label: 'Pendiente por cobrar', value: 'S/. 4,720', pct: '', color: '#CA8A04' },
            ].map(item => (
              <div key={item.label} style={{ background: '#fff', borderRadius: '16px', padding: '18px', boxShadow: FL.shadow }}>
                <p style={{ fontSize: '12px', color: FL.textMuted, marginBottom: '6px' }}>{item.label}</p>
                <p style={{ fontSize: '22px', fontWeight: 900, color: item.color }}>{item.value}</p>
                {item.pct && <p style={{ fontSize: '12px', color: FL.textMuted, marginTop: '2px' }}>{item.pct} del total</p>}
              </div>
            ))}
          </div>

          <div style={{ background: '#fff', borderRadius: '18px', padding: '20px', boxShadow: FL.shadow }}>
            <p style={{ fontSize: '16px', fontWeight: 700, color: FL.text, marginBottom: '16px' }}>Cobranzas por día — Semana actual</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={VENTAS_SEMANA}>
                <CartesianGrid strokeDasharray="3 3" stroke={FL.border} />
                <XAxis dataKey="dia" tick={{ fontSize: 12, fill: FL.textMuted }} />
                <YAxis tick={{ fontSize: 11, fill: FL.textMuted }} tickFormatter={v => `S/.${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => [`S/. ${v.toLocaleString()}`, 'Cobrado']} contentStyle={{ borderRadius: '12px', border: `1px solid ${FL.border}`, fontFamily: "'Plus Jakarta Sans', sans-serif" }} />
                <Bar dataKey="monto" fill={FL.secondary} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
