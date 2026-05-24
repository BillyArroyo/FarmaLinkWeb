import { useState } from 'react';
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag, CheckCircle, Loader2, LogIn } from 'lucide-react';
import { FL, fmt } from '../../data/farmalink';
import { useCartStore } from '../../../store/cartStore';
import { useAuthStore } from '../../../store/authStore';
import { crearPedido } from '../../../modules/pedidos/services/pedidoService';
import { obtenerOCrearCliente } from '../../../modules/clientes/services/clienteService';
import { imgUrl } from '../../../modules/catalogo/hooks/useProductos';
import { AuthModal } from '../auth/AuthModal';
import type { UserProfile } from '../../../modules/auth/types';
import { toast } from 'sonner';

interface Props {
  onBack: () => void;
  onPedidoCreado?: (numero: string) => void;
}

interface PedidoConfirmado {
  numero: string;
  total: number;
}

export function CarritoCheckout({ onBack, onPedidoCreado }: Props) {
  const { lineas, updateCantidad, removeProducto, clearCart, total } = useCartStore();
  const { user } = useAuthStore();
  const [notas, setNotas] = useState('');
  const [nombreFarmacia, setNombreFarmacia] = useState(
    () => localStorage.getItem('fl_nombre_farmacia') ?? ''
  );
  const [enviando, setEnviando] = useState(false);
  const [confirmado, setConfirmado] = useState<PedidoConfirmado | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const subtotal = total();

  const handleConfirmar = async (authenticatedUser?: UserProfile) => {
    if (lineas.length === 0) { toast.error('El carrito está vacío'); return; }

    const currentUser = authenticatedUser ?? user;

    // Require auth to place order
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    if (!nombreFarmacia.trim()) { toast.error('Ingresa el nombre de tu farmacia'); return; }

    setEnviando(true);
    try {
      localStorage.setItem('fl_nombre_farmacia', nombreFarmacia.trim());
      const clienteId = await obtenerOCrearCliente(nombreFarmacia.trim(), currentUser.id);

      const pedido = await crearPedido({
        cliente_id: clienteId,
        tipo_precio: 'contado',
        notas: notas.trim() || undefined,
        lineas: lineas.map(l => ({
          producto_id: l.producto.id,
          cantidad: l.cantidad,
          precio_unitario: l.producto.precio_contado ?? 0,
        })),
      });

      clearCart();
      setConfirmado({ numero: pedido.numero, total: pedido.total });
      onPedidoCreado?.(pedido.numero);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al crear el pedido');
    } finally {
      setEnviando(false);
    }
  };

  /* ── AUTH MODAL ── */
  if (showAuthModal) {
    return (
      <div style={{ backgroundColor: FL.bg, fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="min-h-full flex flex-col">
        <div style={{ background: '#fff', boxShadow: FL.shadow }} className="px-4 pt-12 pb-4 flex items-center gap-3">
          <button onClick={() => setShowAuthModal(false)} style={{ background: FL.bg, borderRadius: '12px' }} className="p-2.5">
            <ArrowLeft size={18} color={FL.text} />
          </button>
          <p style={{ fontSize: '17px', fontWeight: 800 }}>Mi Pedido</p>
        </div>
        <AuthModal
          onSuccess={(u) => {
            setShowAuthModal(false);
            handleConfirmar(u);
          }}
          onClose={() => setShowAuthModal(false)}
        />
      </div>
    );
  }

  /* ── ESTADO: CONFIRMADO ── */
  if (confirmado) {
    return (
      <div style={{ backgroundColor: FL.bg, fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="min-h-full flex flex-col items-center justify-center px-6 gap-6">
        <div style={{ background: '#DCFCE7', borderRadius: '50%', padding: '24px' }}>
          <CheckCircle size={56} color="#16A34A" />
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '22px', fontWeight: 800, color: FL.text, marginBottom: '8px' }}>¡Pedido confirmado!</p>
          <p style={{ fontSize: '15px', color: FL.textMuted }}>Tu pedido ha sido registrado correctamente.</p>
        </div>
        <div style={{ background: '#fff', borderRadius: FL.radius, boxShadow: FL.shadow, padding: '20px 28px', textAlign: 'center', width: '100%' }}>
          <p style={{ fontSize: '12px', color: FL.textMuted, marginBottom: '4px' }}>Número de pedido</p>
          <p style={{ fontSize: '20px', fontWeight: 900, color: FL.primary, letterSpacing: '1px' }}>{confirmado.numero}</p>
          <div style={{ borderTop: `1px solid ${FL.border}`, marginTop: '12px', paddingTop: '12px' }}>
            <p style={{ fontSize: '13px', color: FL.textMuted }}>Total confirmado</p>
            <p style={{ fontSize: '26px', fontWeight: 900, color: FL.text }}>{fmt(confirmado.total)}</p>
          </div>
        </div>
        <p style={{ fontSize: '13px', color: FL.textMuted, textAlign: 'center', lineHeight: 1.6 }}>
          Tu vendedor asignado recibirá el pedido en tiempo real y se contactará contigo para coordinar la entrega.
        </p>
        <button
          onClick={onBack}
          style={{ background: FL.gradient, borderRadius: '14px', padding: '14px 32px', border: 'none', cursor: 'pointer', color: '#fff', fontSize: '14px', fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Volver al catálogo
        </button>
      </div>
    );
  }

  /* ── ESTADO: CARRITO VACÍO ── */
  if (lineas.length === 0) {
    return (
      <div style={{ backgroundColor: FL.bg, fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="min-h-full flex flex-col">
        <div style={{ background: '#fff', boxShadow: FL.shadow }} className="px-4 pt-12 pb-4 flex items-center gap-3">
          <button onClick={onBack} style={{ background: FL.bg, borderRadius: '12px' }} className="p-2.5">
            <ArrowLeft size={18} color={FL.text} />
          </button>
          <p style={{ fontSize: '17px', fontWeight: 800 }}>Mi Pedido</p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8">
          <div style={{ width: '72px', height: '72px', background: '#fff', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: FL.shadow }}>
            <ShoppingBag size={32} color={FL.textMuted} />
          </div>
          <p style={{ fontSize: '18px', fontWeight: 700, color: FL.text }}>Carrito vacío</p>
          <p style={{ fontSize: '13px', color: FL.textMuted, textAlign: 'center', lineHeight: 1.5 }}>
            Agrega productos desde el catálogo usando el botón "+"
          </p>
          <button onClick={onBack}
            style={{ background: FL.gradient, borderRadius: '14px', padding: '12px 28px', border: 'none', cursor: 'pointer', color: '#fff', fontSize: '14px', fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Ver catálogo
          </button>
        </div>
      </div>
    );
  }

  /* ── ESTADO: CARRITO CON ITEMS ── */
  return (
    <div style={{ backgroundColor: FL.bg, fontFamily: "'Plus Jakarta Sans', sans-serif", color: FL.text }} className="min-h-full flex flex-col">
      {/* Header */}
      <div style={{ background: '#fff', boxShadow: FL.shadow }} className="px-4 pt-12 pb-4 flex items-center gap-3">
        <button onClick={onBack} style={{ background: FL.bg, borderRadius: '12px' }} className="p-2.5">
          <ArrowLeft size={18} color={FL.text} />
        </button>
        <div className="flex-1">
          <p style={{ fontSize: '17px', fontWeight: 800 }}>Mi Pedido</p>
          <p style={{ fontSize: '11px', color: FL.textMuted }}>{lineas.length} producto{lineas.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4">
        {/* Farmacia */}
        <p style={{ fontSize: '12px', fontWeight: 700, color: FL.textMuted, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tu farmacia</p>
        <div style={{ background: '#fff', borderRadius: FL.radius, boxShadow: FL.shadow, marginBottom: '16px' }}>
          <input
            value={nombreFarmacia}
            onChange={e => setNombreFarmacia(e.target.value)}
            placeholder="Nombre de tu farmacia o botica..."
            style={{
              width: '100%', padding: '14px 16px', border: 'none', outline: 'none',
              fontSize: '14px', color: FL.text, borderRadius: FL.radius,
              fontFamily: "'Plus Jakarta Sans', sans-serif", background: 'transparent',
            }}
          />
        </div>

        {/* Líneas del carrito */}
        <p style={{ fontSize: '12px', fontWeight: 700, color: FL.textMuted, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Productos</p>
        <div className="flex flex-col gap-3 mb-4">
          {lineas.map(({ producto, cantidad }) => (
            <div key={producto.id} style={{ background: '#fff', borderRadius: FL.radius, boxShadow: FL.shadow, padding: '14px' }}>
              <div className="flex items-center gap-3 mb-3">
                <div style={{ width: '44px', height: '44px', background: FL.primary + '18', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                  <img
                    src={imgUrl(producto.id)} alt={producto.nombre}
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: '13px', fontWeight: 700, color: FL.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{producto.nombre}</p>
                  <p style={{ fontSize: '11px', color: FL.textMuted }}>{producto.laboratorio}</p>
                  <p style={{ fontSize: '12px', color: FL.primary, fontWeight: 700 }}>
                    S/. {(producto.precio_contado ?? 0).toFixed(2)} c/u
                  </p>
                </div>
                <button
                  onClick={() => removeProducto(producto.id)}
                  style={{ background: '#FEE2E2', borderRadius: '8px', padding: '6px', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
                  <Trash2 size={14} color="#DC2626" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateCantidad(producto.id, cantidad - 1)}
                    style={{ width: '32px', height: '32px', background: FL.bg, borderRadius: '10px', border: `1.5px solid ${FL.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Minus size={14} color={FL.text} />
                  </button>
                  <p style={{ fontSize: '18px', fontWeight: 800, color: FL.text, minWidth: '28px', textAlign: 'center' }}>{cantidad}</p>
                  <button
                    onClick={() => updateCantidad(producto.id, cantidad + 1)}
                    style={{ width: '32px', height: '32px', background: FL.primary, borderRadius: '10px', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Plus size={14} color="#fff" />
                  </button>
                </div>
                <p style={{ fontSize: '16px', fontWeight: 900, color: FL.primary }}>
                  {fmt((producto.precio_contado ?? 0) * cantidad)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Notas */}
        <p style={{ fontSize: '12px', fontWeight: 700, color: FL.textMuted, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Notas (opcional)</p>
        <textarea
          value={notas}
          onChange={e => setNotas(e.target.value)}
          placeholder="Instrucciones especiales, urgencia, etc."
          rows={3}
          style={{
            width: '100%', padding: '12px 14px', background: '#fff', border: `1.5px solid ${FL.border}`,
            borderRadius: FL.radius, outline: 'none', fontSize: '13px', color: FL.text,
            fontFamily: "'Plus Jakarta Sans', sans-serif", resize: 'none', boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Footer con totales y botón */}
      <div style={{ background: '#fff', borderTop: `1px solid ${FL.border}`, padding: '16px' }}>
        <div className="flex justify-between items-center mb-4">
          <p style={{ fontSize: '15px', fontWeight: 700, color: FL.textMuted }}>
            {lineas.reduce((s, l) => s + l.cantidad, 0)} unidades
          </p>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '12px', color: FL.textMuted }}>Total</p>
            <p style={{ fontSize: '26px', fontWeight: 900, color: FL.primary }}>{fmt(subtotal)}</p>
          </div>
        </div>
        {!user && (
          <p style={{ fontSize: '12px', color: FL.textMuted, textAlign: 'center', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
            <LogIn size={13} color={FL.textMuted} /> Necesitas una cuenta para confirmar
          </p>
        )}
        <button
          onClick={() => handleConfirmar()}
          disabled={enviando}
          style={{
            width: '100%', background: FL.gradient, borderRadius: '14px', padding: '14px',
            border: 'none', cursor: enviando ? 'not-allowed' : 'pointer', opacity: enviando ? 0.7 : 1,
            color: '#fff', fontSize: '15px', fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif",
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}>
          {enviando ? (
            <>
              <Loader2 size={18} color="#fff" style={{ animation: 'spin 1s linear infinite' }} />
              Enviando pedido...
            </>
          ) : user ? (
            '✓ Confirmar pedido'
          ) : (
            <><LogIn size={18} color="#fff" /> Ingresar y confirmar</>
          )}
        </button>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
