import { useMemo } from 'react';
import { ShoppingCart, DollarSign, Users, FileText, Package } from 'lucide-react';
import { FL, fmt } from '../../data/farmalink';
import { useAuthStore } from '../../../store/authStore';
import { usePedidos } from '../../../modules/pedidos/hooks/usePedidos';

interface Props {
  onPedido: () => void; onCobro: () => void; onCatalogo: () => void; onPedidos: () => void;
}

export function InicioVendedor({ onPedido, onCobro, onCatalogo, onPedidos }: Props) {
  const { user } = useAuthStore();

  const hoyISO = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  }, []);

  const { pedidos, loading: pedidosLoading } = usePedidos(undefined, hoyISO);

  const stats = useMemo(() => {
    const activos = pedidos.filter(p => p.estado !== 'cancelado');
    const cobrado = activos.reduce((sum: number, p: { total: number }) => sum + (p.total ?? 0), 0);
    const clientesUnicos = new Set(activos.map((p: { cliente_id: string }) => p.cliente_id)).size;
    return { pedidos: activos.length, cobrado, clientes: clientesUnicos };
  }, [pedidos]);

  const fechaHoy = new Date().toLocaleDateString('es-PE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const initiales = user?.nombre
    ? user.nombre.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  const acciones = [
    { label: 'Nuevo Pedido', icon: ShoppingCart, color: '#4AABDB', bg: '#EBF7FD', action: onPedido },
    { label: 'Registrar Cobro', icon: DollarSign, color: '#7ECBA1', bg: '#EDFAF3', action: onCobro },
    { label: 'Ver Catálogo', icon: Package, color: '#A78BFA', bg: '#F5F3FF', action: onCatalogo },
    { label: 'Mis Pedidos', icon: FileText, color: '#F87171', bg: '#FEF2F2', action: onPedidos },
  ];

  return (
    <div style={{ backgroundColor: FL.bg, fontFamily: "'Plus Jakarta Sans', sans-serif", color: FL.text }} className="min-h-full overflow-y-auto pb-6">
      {/* Header */}
      <div style={{ background: FL.gradient, borderRadius: '0 0 28px 28px' }} className="px-5 pt-12 pb-6">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', textTransform: 'capitalize' }}>{fechaHoy}</p>
            <p style={{ color: '#fff', fontSize: '20px', fontWeight: 800 }}>
              {user ? `Buenos días, ${user.nombre.split(' ')[0]}` : 'Buenos días'}
            </p>
          </div>
          <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.4)' }}>
            <p style={{ color: '#fff', fontSize: '16px', fontWeight: 700 }}>{initiales}</p>
          </div>
        </div>
      </div>

      {/* Resumen del día */}
      <div className="mx-4 -mt-5">
        <div style={{ background: '#fff', borderRadius: '20px', boxShadow: FL.shadowMd, padding: '20px' }}>
          <div className="flex items-center justify-between mb-3">
            <p style={{ fontSize: '14px', fontWeight: 700, color: FL.text }}>Resumen del día</p>
            <span style={{ background: '#DCFCE7', color: '#16A34A', borderRadius: '8px', padding: '3px 8px', fontSize: '11px', fontWeight: 700 }}>● En ruta</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Pedidos', value: pedidosLoading ? '—' : String(stats.pedidos), icon: ShoppingCart, color: FL.primary },
              { label: 'Cobrado', value: pedidosLoading ? '—' : fmt(stats.cobrado), icon: DollarSign, color: FL.secondary },
              { label: 'Clientes', value: pedidosLoading ? '—' : String(stats.clientes), icon: Users, color: '#A78BFA' },
            ].map(stat => (
              <div key={stat.label} style={{ background: FL.bg, borderRadius: '14px', padding: '12px 8px', textAlign: 'center' }}>
                <div style={{ width: '32px', height: '32px', background: stat.color + '20', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px' }}>
                  <stat.icon size={16} color={stat.color} />
                </div>
                <p style={{ fontSize: stat.label === 'Cobrado' ? '13px' : '16px', fontWeight: 800, color: FL.text }}>{stat.value}</p>
                <p style={{ fontSize: '10px', color: FL.textMuted }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="px-4 mt-5">
        <p style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>Acciones rápidas</p>
        <div className="grid grid-cols-2 gap-3">
          {acciones.map(acc => (
            <button key={acc.label} onClick={acc.action}
              style={{ background: '#fff', borderRadius: FL.radius, boxShadow: FL.shadow, padding: '16px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '10px' }}
              className="active:scale-95 transition-transform">
              <div style={{ width: '42px', height: '42px', background: acc.bg, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <acc.icon size={22} color={acc.color} />
              </div>
              <p style={{ fontSize: '13px', fontWeight: 700, color: FL.text }}>{acc.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Clientes del día */}
      <div className="px-4 mt-5">
        <div className="flex justify-between items-center mb-3">
          <p style={{ fontSize: '15px', fontWeight: 700 }}>Mis clientes hoy</p>
        </div>
        <div style={{ background: '#fff', borderRadius: FL.radius, boxShadow: FL.shadow, padding: '24px 16px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: FL.textMuted }}>
            {pedidosLoading ? 'Cargando...' : stats.clientes === 0
              ? 'Sin visitas registradas hoy'
              : `${stats.clientes} cliente${stats.clientes !== 1 ? 's' : ''} con pedidos hoy`}
          </p>
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{ background: '#fff', borderTop: `1px solid ${FL.border}`, position: 'sticky', bottom: 0 }} className="flex justify-around py-3 mt-5">
        {[{ icon: '🏠', label: 'Inicio', active: true }, { icon: '📋', label: 'Pedidos', active: false }, { icon: '👥', label: 'Clientes', active: false }, { icon: '👤', label: 'Perfil', active: false }].map(item => (
          <button key={item.label} className="flex flex-col items-center gap-1">
            <span style={{ fontSize: '20px' }}>{item.icon}</span>
            <span style={{ fontSize: '10px', fontWeight: 600, color: item.active ? FL.primary : FL.textMuted }}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
