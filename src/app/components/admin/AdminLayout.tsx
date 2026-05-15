import { ReactNode } from 'react';
import { LayoutDashboard, DollarSign, Package, ShoppingBag, Megaphone, BarChart3, Settings, Bell, LogOut, ChevronRight } from 'lucide-react';
import { FL } from '../../data/farmalink';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'cobranzas', label: 'Cobranzas', icon: DollarSign, badge: '1' },
  { id: 'gestion-catalogo', label: 'Catálogo', icon: Package },
  { id: 'gestion-pedidos', label: 'Pedidos', icon: ShoppingBag, badge: '5' },
  { id: 'promociones', label: 'Promociones', icon: Megaphone },
  { id: 'reportes', label: 'Reportes', icon: BarChart3 },
];

interface Props { children: ReactNode; active: string; onNav: (id: string) => void; }

export function AdminLayout({ children, active, onNav }: Props) {
  return (
    <div style={{ background: FL.bg, fontFamily: "'Plus Jakarta Sans', sans-serif", color: FL.text, height: '100%', display: 'flex' }}>
      {/* Sidebar */}
      <div style={{ width: '240px', background: '#fff', borderRight: `1px solid ${FL.border}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px 20px', borderBottom: `1px solid ${FL.border}` }}>
          <div className="flex items-center gap-3">
            <div style={{ width: '40px', height: '40px', background: FL.gradient, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '20px' }}>💊</span>
            </div>
            <div>
              <p style={{ fontSize: '16px', fontWeight: 800, color: FL.text }}>FarmaLink</p>
              <p style={{ fontSize: '11px', color: FL.textMuted }}>Panel Administrador</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '16px 12px', flex: 1 }}>
          <p style={{ fontSize: '10px', fontWeight: 700, color: FL.textMuted, padding: '0 8px', marginBottom: '8px', letterSpacing: '0.8px' }}>NAVEGACIÓN</p>
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button key={item.id} onClick={() => onNav(item.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '12px', marginBottom: '4px',
                  background: isActive ? FL.primary + '12' : 'transparent',
                  border: isActive ? `1.5px solid ${FL.primary}25` : '1.5px solid transparent',
                  cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
                  transition: 'all 0.15s',
                }}>
                <Icon size={18} color={isActive ? FL.primary : FL.textMuted} />
                <span style={{ fontSize: '14px', fontWeight: isActive ? 700 : 500, color: isActive ? FL.primary : FL.text, flex: 1, textAlign: 'left' }}>
                  {item.label}
                </span>
                {item.badge && (
                  <span style={{ background: '#EF4444', color: '#fff', borderRadius: '10px', padding: '1px 7px', fontSize: '10px', fontWeight: 800 }}>{item.badge}</span>
                )}
                {isActive && <ChevronRight size={14} color={FL.primary} />}
              </button>
            );
          })}
        </nav>

        {/* Bottom user */}
        <div style={{ padding: '16px', borderTop: `1px solid ${FL.border}` }}>
          <div className="flex items-center gap-3 mb-3">
            <div style={{ width: '36px', height: '36px', background: FL.gradient, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <p style={{ color: '#fff', fontSize: '12px', fontWeight: 700 }}>AM</p>
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: '13px', fontWeight: 700, color: FL.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Admin Meza</p>
              <p style={{ fontSize: '11px', color: FL.textMuted }}>Administrador</p>
            </div>
          </div>
          <button style={{ width: '100%', background: '#FEF2F2', borderRadius: '10px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', border: 'none', cursor: 'pointer' }}>
            <LogOut size={14} color="#EF4444" />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#EF4444' }}>Cerrar sesión</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Top bar */}
        <div style={{ background: '#fff', borderBottom: `1px solid ${FL.border}`, padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <p style={{ fontSize: '13px', color: FL.textMuted }}>
            <span style={{ color: FL.primary }}>FarmaLink</span> / {NAV_ITEMS.find(n => n.id === active)?.label || 'Dashboard'}
          </p>
          <div className="flex items-center gap-3">
            <p style={{ fontSize: '13px', color: FL.textMuted }}>Miérc. 14/05/2026 · 11:47 a.m.</p>
            <button style={{ background: FL.bg, borderRadius: '10px', padding: '8px', border: `1px solid ${FL.border}`, position: 'relative' }}>
              <Bell size={18} color={FL.primary} />
              <div style={{ position: 'absolute', top: '4px', right: '4px', width: '8px', height: '8px', background: '#EF4444', borderRadius: '50%' }} />
            </button>
            <button style={{ background: FL.gradient, borderRadius: '10px', padding: '8px 14px', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              + Nueva acción
            </button>
          </div>
        </div>
        {/* Page content */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
