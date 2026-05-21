import { useState, useEffect } from 'react';
import { TrendingUp, ShoppingBag, DollarSign, Users, MapPin, Package } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FL, fmt } from '../../data/farmalink';
import { supabase } from '../../../lib/supabase';

const VENTAS_SEMANA = [
  { dia: 'Lun', monto: 12400 },
  { dia: 'Mar', monto: 18600 },
  { dia: 'Mié', monto: 15200 },
  { dia: 'Jue', monto: 21800 },
  { dia: 'Vie', monto: 19300 },
  { dia: 'Sáb', monto: 14100 },
  { dia: 'Hoy', monto: 13310 },
];

const GPS_POINTS = [
  { name: 'Carlos Quispe', x: 35, y: 45, status: 'Activo', cliente: 'Botica San Martín' },
  { name: 'María Huanca', x: 65, y: 60, status: 'En camino', cliente: 'Farmacia Los Andes' },
  { name: 'José Bellido', x: 50, y: 30, status: 'Activo', cliente: 'Botica El Progreso' },
];

export function Dashboard() {
  const [totalProductos, setTotalProductos] = useState<number | null>(null);
  const [totalLabs, setTotalLabs] = useState<number | null>(null);
  const [totalPromos, setTotalPromos] = useState<number | null>(null);

  useEffect(() => {
    supabase
      .from('productos')
      .select('laboratorio, oferta')
      .eq('activo', true)
      .then(({ data, error }) => {
        if (error) { console.error('Dashboard:', error.message); return; }
        if (!data) return;
        setTotalProductos(data.length);
        setTotalLabs(new Set(data.map(p => p.laboratorio)).size);
        setTotalPromos(data.filter(p => p.oferta).length);
      });
  }, []);

  const kpis = [
    { label: 'Productos activos', value: totalProductos != null ? String(totalProductos) : '—', sub: 'En catálogo', icon: Package, color: FL.primary, bg: '#EBF7FD' },
    { label: 'Laboratorios', value: totalLabs != null ? String(totalLabs) : '—', sub: 'Proveedores activos', icon: ShoppingBag, color: FL.secondary, bg: '#EDFAF3' },
    { label: 'Con oferta', value: totalPromos != null ? String(totalPromos) : '—', sub: 'Productos con promo', icon: TrendingUp, color: '#F87171', bg: '#FEF2F2' },
    { label: 'Pedidos hoy', value: '0', sub: 'Tabla no conectada aún', icon: Users, color: '#A78BFA', bg: '#F5F3FF' },
  ];

  return (
    <div style={{ padding: '28px' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p style={{ fontSize: '24px', fontWeight: 800, color: FL.text }}>Buenos días, Admin</p>
          <p style={{ fontSize: '14px', color: FL.textMuted }}>Martes 19 de Mayo, 2026 · Huancayo, Junín</p>
        </div>
        <div style={{ background: FL.gradient, borderRadius: '14px', padding: '12px 20px' }}>
          <p style={{ color: '#fff', fontSize: '13px', fontWeight: 700 }}>Datos reales — Supabase</p>
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
            </div>
            <p style={{ fontSize: '28px', fontWeight: 900, color: FL.text }}>{kpi.value}</p>
            <p style={{ fontSize: '13px', fontWeight: 700, color: FL.text, marginTop: '2px' }}>{kpi.label}</p>
            <p style={{ fontSize: '11px', color: FL.textMuted }}>{kpi.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Ventas semana */}
        <div style={{ background: '#fff', borderRadius: '18px', padding: '20px', boxShadow: FL.shadow, gridColumn: 'span 2' }}>
          <div className="flex items-center justify-between mb-4">
            <p style={{ fontSize: '16px', fontWeight: 700, color: FL.text }}>Ventas de la semana</p>
            <div style={{ background: '#FEF9C3', borderRadius: '10px', padding: '6px 12px' }}>
              <p style={{ fontSize: '11px', color: '#CA8A04', fontWeight: 600 }}>Demo — sin tabla de ventas aún</p>
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
            <span style={{ background: '#FEF9C3', color: '#CA8A04', borderRadius: '8px', padding: '3px 8px', fontSize: '11px', fontWeight: 700 }}>Demo</span>
          </div>
          <div style={{ background: '#E8F5E9', borderRadius: '14px', height: '180px', position: 'relative', overflow: 'hidden', marginBottom: '12px' }}>
            {[20, 40, 60, 80].map(p => (
              <div key={p} style={{ position: 'absolute', left: `${p}%`, top: 0, bottom: 0, borderLeft: '1px solid rgba(74,171,219,0.15)' }} />
            ))}
            {[25, 50, 75].map(p => (
              <div key={p} style={{ position: 'absolute', top: `${p}%`, left: 0, right: 0, borderTop: '1px solid rgba(74,171,219,0.15)' }} />
            ))}
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

      {/* Pedidos — tabla no existe aún */}
      <div style={{ background: '#fff', borderRadius: '18px', padding: '36px', boxShadow: FL.shadow, textAlign: 'center' }}>
        <div style={{ width: '56px', height: '56px', background: FL.bg, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
          <ShoppingBag size={26} color={FL.textMuted} />
        </div>
        <p style={{ fontSize: '16px', fontWeight: 700, color: FL.text, marginBottom: '6px' }}>Sin pedidos registrados</p>
        <p style={{ fontSize: '13px', color: FL.textMuted }}>La tabla de pedidos aún no ha sido creada en Supabase.</p>
        <p style={{ fontSize: '12px', color: FL.textMuted, marginTop: '4px' }}>Los pedidos aparecerán aquí una vez que se implemente el módulo.</p>
      </div>
    </div>
  );
}
