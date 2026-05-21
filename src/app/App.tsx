import { useState } from 'react';
import { FL } from './data/farmalink';
import { CatalogoInicio } from './components/cliente/CatalogoInicio';
import { CategoriaSeleccionada } from './components/cliente/CategoriaSeleccionada';
import { DetalleProducto } from './components/cliente/DetalleProducto';
import { Login } from './components/vendedor/Login';
import { InicioVendedor } from './components/vendedor/InicioVendedor';
import { CatalogoTablet } from './components/vendedor/CatalogoTablet';
import { GeneradorPedido } from './components/vendedor/GeneradorPedido';
import { RegistrarCobro } from './components/vendedor/RegistrarCobro';
import { ReciboDigital } from './components/vendedor/ReciboDigital';
import { PedidosDia } from './components/vendedor/PedidosDia';
import { AdminLayout } from './components/admin/AdminLayout';
import { Dashboard } from './components/admin/Dashboard';
import { Cobranzas } from './components/admin/Cobranzas';
import { GestionCatalogo } from './components/admin/GestionCatalogo';
import { GestionPedidos } from './components/admin/GestionPedidos';
import { Promociones } from './components/admin/Promociones';
import { Reportes } from './components/admin/Reportes';
import { ImportarExcel } from '../modules/catalogo/ImportarExcel';
import { SubirImagenes } from '../modules/catalogo/SubirImagenes';
import { CatalogoImprimir } from '../modules/catalogo/CatalogoImprimir';

type Role = 'cliente' | 'vendedor' | 'administrador';
type Screen =
  | 'catalogo-inicio' | 'categoria' | 'detalle-producto'
  | 'login' | 'inicio-vendedor' | 'catalogo-tablet' | 'generador-pedido' | 'registrar-cobro' | 'recibo-digital' | 'pedidos-dia'
  | 'dashboard' | 'cobranzas' | 'gestion-catalogo' | 'gestion-pedidos' | 'promociones' | 'reportes'
  | 'catalogo-importar' | 'catalogo-imagenes' | 'catalogo-imprimir';

const SCREENS: Record<Role, Array<{ id: Screen; label: string; num: number; emoji: string }>> = {
  cliente: [
    { id: 'catalogo-inicio', label: 'Catálogo Inicio', num: 1, emoji: '🏠' },
    { id: 'categoria', label: 'Categoría', num: 2, emoji: '💊' },
    { id: 'detalle-producto', label: 'Detalle Producto', num: 3, emoji: '🔍' },
  ],
  vendedor: [
    { id: 'login', label: 'Login', num: 4, emoji: '🔐' },
    { id: 'inicio-vendedor', label: 'Inicio Vendedor', num: 5, emoji: '🏠' },
    { id: 'catalogo-tablet', label: 'Catálogo Tablet', num: 6, emoji: '📋' },
    { id: 'generador-pedido', label: 'Generar Pedido', num: 7, emoji: '🛒' },
    { id: 'registrar-cobro', label: 'Registrar Cobro', num: 8, emoji: '💳' },
    { id: 'recibo-digital', label: 'Recibo Digital', num: 9, emoji: '📄' },
    { id: 'pedidos-dia', label: 'Pedidos del Día', num: 10, emoji: '📊' },
  ],
  administrador: [
    { id: 'dashboard', label: 'Dashboard', num: 11, emoji: '📈' },
    { id: 'cobranzas', label: 'Cobranzas', num: 12, emoji: '🛡️' },
    { id: 'gestion-catalogo', label: 'Catálogo', num: 13, emoji: '📦' },
    { id: 'gestion-pedidos', label: 'Pedidos', num: 14, emoji: '📋' },
    { id: 'promociones', label: 'Promociones', num: 15, emoji: '📢' },
    { id: 'reportes', label: 'Reportes', num: 16, emoji: '📊' },
    { id: 'catalogo-importar', label: 'Importar Excel', num: 17, emoji: '📊' },
    { id: 'catalogo-imagenes', label: 'Imágenes', num: 18, emoji: '🖼️' },
    { id: 'catalogo-imprimir', label: 'Impr. Catálogo', num: 19, emoji: '🖨️' },
  ],
};

const ROLE_LABELS: Record<Role, { label: string; emoji: string; sub: string }> = {
  cliente: { label: 'Cliente', emoji: '🏪', sub: 'Farmacia / Botica' },
  vendedor: { label: 'Vendedor', emoji: '🚗', sub: 'Campo / Mobile' },
  administrador: { label: 'Administrador', emoji: '🏢', sub: 'Oficina / Desktop' },
};

const FLUJO_CLIENTE: Screen[] = ['catalogo-inicio', 'categoria', 'detalle-producto'];
const FLUJO_VENDEDOR: Screen[] = ['login', 'inicio-vendedor', 'catalogo-tablet', 'generador-pedido', 'registrar-cobro', 'recibo-digital', 'pedidos-dia'];

function MobileFrame({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '20px 0', background: FL.bg, minHeight: '100%', overflowY: 'auto' }}>
      <div style={{ width: '390px', minHeight: '844px', background: '#fff', borderRadius: '44px', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.25), 0 0 0 10px #1A2E3B, inset 0 0 0 2px rgba(255,255,255,0.1)', position: 'relative', display: 'flex', flexDirection: 'column' }}>
        {/* Notch */}
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '120px', height: '30px', background: '#1A2E3B', borderRadius: '0 0 20px 20px', zIndex: 100 }} />
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
        {/* Home indicator */}
        <div style={{ height: '28px', background: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '120px', height: '5px', background: '#D1D5DB', borderRadius: '3px' }} />
        </div>
      </div>
    </div>
  );
}

function TabletFrame({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '20px 0', background: FL.bg, minHeight: '100%', overflowY: 'auto' }}>
      <div style={{ width: '820px', height: '600px', background: '#fff', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.2), 0 0 0 8px #1A2E3B', position: 'relative' }}>
        {children}
      </div>
    </div>
  );
}

export default function App() {
  const [role, setRole] = useState<Role>('cliente');
  const [screen, setScreen] = useState<Screen>('catalogo-inicio');
  const [categoriaActiva, setCategoriaActiva] = useState('Antibióticos');
  const [productoActivo, setProductoActivo] = useState<string>('');
  const [flujoMode, setFlujoMode] = useState<null | 'cliente' | 'vendedor'>(null);
  const [flujoStep, setFlujoStep] = useState(0);

  const navToRole = (r: Role) => {
    setRole(r);
    setScreen(SCREENS[r][0].id);
  };

  const navToScreen = (s: Screen) => setScreen(s);

  const startFlujo = (tipo: 'cliente' | 'vendedor') => {
    setFlujoMode(tipo);
    setFlujoStep(0);
    const flujo = tipo === 'cliente' ? FLUJO_CLIENTE : FLUJO_VENDEDOR;
    setRole(tipo === 'cliente' ? 'cliente' : 'vendedor');
    setScreen(flujo[0]);
  };

  const flujoNext = () => {
    const flujo = flujoMode === 'cliente' ? FLUJO_CLIENTE : FLUJO_VENDEDOR;
    if (flujoStep < flujo.length - 1) {
      setFlujoStep(prev => prev + 1);
      setScreen(flujo[flujoStep + 1]);
    } else {
      setFlujoMode(null);
    }
  };

  const flujoPrev = () => {
    const flujo = flujoMode === 'cliente' ? FLUJO_CLIENTE : FLUJO_VENDEDOR;
    if (flujoStep > 0) {
      setFlujoStep(prev => prev - 1);
      setScreen(flujo[flujoStep - 1]);
    }
  };

  const isAdmin = role === 'administrador';
  const isTablet = screen === 'catalogo-tablet';
  const screenInfo = Object.values(SCREENS).flat().find(s => s.id === screen);

  const renderScreen = () => {
    switch (screen) {
      case 'catalogo-inicio':
        return <CatalogoInicio onCategoria={cat => { setCategoriaActiva(cat); if (flujoMode) { flujoNext(); } else navToScreen('categoria'); }} onProducto={(id: string) => { setProductoActivo(id); if (flujoMode) { setFlujoStep(2); setScreen('detalle-producto'); } else navToScreen('detalle-producto'); }} />;
      case 'categoria':
        return <CategoriaSeleccionada categoria={categoriaActiva} onBack={() => navToScreen('catalogo-inicio')} onProducto={(id: string) => { setProductoActivo(id); navToScreen('detalle-producto'); }} />;
      case 'detalle-producto':
        return <DetalleProducto productoId={productoActivo} onBack={() => navToScreen('categoria')} onContactar={() => { if (flujoMode) flujoNext(); }} />;
      case 'login':
        return <Login onLogin={() => { if (flujoMode) flujoNext(); else navToScreen('inicio-vendedor'); }} />;
      case 'inicio-vendedor':
        return <InicioVendedor onPedido={() => { if (flujoMode) flujoNext(); else navToScreen('generador-pedido'); }} onCobro={() => navToScreen('registrar-cobro')} onCatalogo={() => navToScreen('catalogo-tablet')} onPedidos={() => navToScreen('pedidos-dia')} />;
      case 'catalogo-tablet':
        return <CatalogoTablet onProducto={id => { setProductoActivo(id); }} />;
      case 'generador-pedido':
        return <GeneradorPedido onBack={() => navToScreen('inicio-vendedor')} onConfirmar={() => { if (flujoMode) flujoNext(); else navToScreen('registrar-cobro'); }} />;
      case 'registrar-cobro':
        return <RegistrarCobro onBack={() => navToScreen('generador-pedido')} onGenerar={() => { if (flujoMode) flujoNext(); else navToScreen('recibo-digital'); }} />;
      case 'recibo-digital':
        return <ReciboDigital onBack={() => navToScreen('registrar-cobro')} />;
      case 'pedidos-dia':
        return <PedidosDia onBack={() => navToScreen('inicio-vendedor')} onPedido={() => {}} />;
      case 'dashboard':
      case 'cobranzas':
      case 'gestion-catalogo':
      case 'gestion-pedidos':
      case 'promociones':
      case 'reportes':
      case 'catalogo-importar':
      case 'catalogo-imagenes':
      case 'catalogo-imprimir':
        return (
          <AdminLayout active={screen} onNav={s => navToScreen(s as Screen)}>
            {screen === 'dashboard' && <Dashboard />}
            {screen === 'cobranzas' && <Cobranzas />}
            {screen === 'gestion-catalogo' && <GestionCatalogo />}
            {screen === 'gestion-pedidos' && <GestionPedidos />}
            {screen === 'promociones' && <Promociones />}
            {screen === 'reportes' && <Reportes />}
            {screen === 'catalogo-importar' && <ImportarExcel />}
            {screen === 'catalogo-imagenes' && <SubirImagenes />}
            {screen === 'catalogo-imprimir' && <CatalogoImprimir />}
          </AdminLayout>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Plus Jakarta Sans', sans-serif", background: FL.bg }}>
      {/* Top navigation bar */}
      <div style={{ background: '#fff', borderBottom: `1px solid ${FL.border}`, padding: '0 20px', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, zIndex: 30, boxShadow: FL.shadow }}>
        {/* Logo */}
        <div className="flex items-center gap-2" style={{ marginRight: '8px', paddingRight: '16px', borderRight: `1px solid ${FL.border}`, height: '52px' }}>
          <div style={{ width: '32px', height: '32px', background: FL.gradient, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '18px' }}>💊</span>
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 800, color: FL.text, lineHeight: 1.2 }}>FarmaLink</p>
            <p style={{ fontSize: '10px', color: FL.textMuted }}>Demo interactivo</p>
          </div>
        </div>

        {/* Role tabs */}
        {(Object.keys(SCREENS) as Role[]).map(r => {
          const info = ROLE_LABELS[r];
          return (
            <button key={r} onClick={() => navToRole(r)}
              style={{
                padding: '8px 14px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '7px',
                background: role === r && !flujoMode ? FL.gradient : 'transparent',
                color: role === r && !flujoMode ? '#fff' : FL.textMuted,
                border: role === r && !flujoMode ? 'none' : `1.5px solid ${FL.border}`,
                cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'all 0.15s',
              }}>
              <span style={{ fontSize: '16px' }}>{info.emoji}</span>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '12px', fontWeight: 700, lineHeight: 1.2 }}>{info.label}</p>
                <p style={{ fontSize: '10px', opacity: 0.8, lineHeight: 1.2 }}>{info.sub}</p>
              </div>
            </button>
          );
        })}

        <div style={{ flex: 1 }} />

        {/* Screen selector */}
        <div className="flex items-center gap-1">
          {SCREENS[role].map(s => (
            <button key={s.id} onClick={() => { setFlujoMode(null); navToScreen(s.id); }}
              style={{
                padding: '5px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'all 0.15s',
                background: screen === s.id ? FL.primary + '15' : 'transparent',
                border: screen === s.id ? `1.5px solid ${FL.primary}30` : '1.5px solid transparent',
              }}>
              <span style={{ width: '18px', height: '18px', background: screen === s.id ? FL.gradient : '#E5E7EB', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: screen === s.id ? '#fff' : FL.textMuted, fontWeight: 800, flexShrink: 0 }}>
                {s.num}
              </span>
              <span style={{ fontSize: '11px', fontWeight: screen === s.id ? 700 : 500, color: screen === s.id ? FL.primary : FL.textMuted, whiteSpace: 'nowrap' }}>{s.emoji} {s.label}</span>
            </button>
          ))}
        </div>

        <div style={{ width: '1px', height: '32px', background: FL.border, margin: '0 4px' }} />

        {/* Flujo buttons */}
        <div className="flex gap-2">
          <button onClick={() => startFlujo('cliente')}
            style={{ padding: '7px 12px', borderRadius: '10px', background: flujoMode === 'cliente' ? '#EDE9FE' : FL.bg, border: `1.5px solid ${flujoMode === 'cliente' ? '#A78BFA' : FL.border}`, cursor: 'pointer', fontSize: '11px', fontWeight: 700, color: flujoMode === 'cliente' ? '#7C3AED' : FL.textMuted, fontFamily: "'Plus Jakarta Sans', sans-serif", whiteSpace: 'nowrap' }}>
            🎬 Flujo Cliente
          </button>
          <button onClick={() => startFlujo('vendedor')}
            style={{ padding: '7px 12px', borderRadius: '10px', background: flujoMode === 'vendedor' ? '#ECFDF5' : FL.bg, border: `1.5px solid ${flujoMode === 'vendedor' ? FL.secondary : FL.border}`, cursor: 'pointer', fontSize: '11px', fontWeight: 700, color: flujoMode === 'vendedor' ? '#16A34A' : FL.textMuted, fontFamily: "'Plus Jakarta Sans', sans-serif", whiteSpace: 'nowrap' }}>
            🚗 Flujo Vendedor
          </button>
        </div>
      </div>

      {/* Flujo progress bar */}
      {flujoMode && (
        <div style={{ background: flujoMode === 'cliente' ? '#F5F3FF' : '#ECFDF5', borderBottom: `1px solid ${flujoMode === 'cliente' ? '#DDD6FE' : '#BBF7D0'}`, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: flujoMode === 'cliente' ? '#7C3AED' : '#16A34A', whiteSpace: 'nowrap' }}>
            {flujoMode === 'cliente' ? '🎬 Flujo del Cliente' : '🚗 Flujo del Vendedor'} — Paso {flujoStep + 1} de {(flujoMode === 'cliente' ? FLUJO_CLIENTE : FLUJO_VENDEDOR).length}
          </p>
          <div style={{ flex: 1, background: flujoMode === 'cliente' ? '#DDD6FE' : '#BBF7D0', borderRadius: '6px', height: '6px', overflow: 'hidden' }}>
            <div style={{ width: `${((flujoStep + 1) / (flujoMode === 'cliente' ? FLUJO_CLIENTE : FLUJO_VENDEDOR).length) * 100}%`, height: '100%', background: flujoMode === 'cliente' ? '#7C3AED' : '#16A34A', borderRadius: '6px', transition: 'width 0.3s' }} />
          </div>
          <div className="flex gap-2">
            <button onClick={flujoPrev} disabled={flujoStep === 0}
              style={{ padding: '5px 12px', borderRadius: '8px', background: '#fff', border: `1px solid ${flujoMode === 'cliente' ? '#DDD6FE' : '#BBF7D0'}`, cursor: flujoStep === 0 ? 'not-allowed' : 'pointer', fontSize: '12px', fontWeight: 600, color: FL.textMuted, opacity: flujoStep === 0 ? 0.5 : 1, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              ← Anterior
            </button>
            <button onClick={flujoNext}
              style={{ padding: '5px 14px', borderRadius: '8px', background: flujoMode === 'cliente' ? '#7C3AED' : '#16A34A', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 700, color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {flujoStep < (flujoMode === 'cliente' ? FLUJO_CLIENTE : FLUJO_VENDEDOR).length - 1 ? 'Siguiente →' : 'Finalizar ✓'}
            </button>
            <button onClick={() => setFlujoMode(null)}
              style={{ padding: '5px 10px', borderRadius: '8px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '12px', color: FL.textMuted, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Screen label */}
      <div style={{ background: FL.bg, borderBottom: `1px solid ${FL.border}`, padding: '8px 20px', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <span style={{ width: '22px', height: '22px', background: FL.gradient, borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: '#fff', flexShrink: 0 }}>
          {screenInfo?.num}
        </span>
        <p style={{ fontSize: '12px', fontWeight: 700, color: FL.text }}>{screenInfo?.emoji} {screenInfo?.label}</p>
        <span style={{ background: FL.primary + '15', color: FL.primary, borderRadius: '6px', padding: '2px 8px', fontSize: '10px', fontWeight: 700 }}>
          {ROLE_LABELS[role].label}
        </span>
        {isAdmin && <span style={{ background: '#DBEAFE', color: '#1D4ED8', borderRadius: '6px', padding: '2px 8px', fontSize: '10px', fontWeight: 700 }}>Desktop 1440px</span>}
        {isTablet && <span style={{ background: '#DBEAFE', color: '#1D4ED8', borderRadius: '6px', padding: '2px 8px', fontSize: '10px', fontWeight: 700 }}>Tablet 820px</span>}
        {!isAdmin && !isTablet && <span style={{ background: '#F5F3FF', color: '#7C3AED', borderRadius: '6px', padding: '2px 8px', fontSize: '10px', fontWeight: 700 }}>Mobile 390px</span>}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {isAdmin ? (
          <div style={{ height: '100%', overflow: 'auto' }}>
            {renderScreen()}
          </div>
        ) : isTablet ? (
          <div style={{ height: '100%', overflow: 'auto' }}>
            <TabletFrame>{renderScreen()}</TabletFrame>
          </div>
        ) : (
          <div style={{ height: '100%', overflow: 'auto' }}>
            <MobileFrame>{renderScreen()}</MobileFrame>
          </div>
        )}
      </div>
    </div>
  );
}
