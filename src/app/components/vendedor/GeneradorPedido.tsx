import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Minus, WifiOff, Trash2, Loader2, Search, ChevronDown, UserPlus } from 'lucide-react';
import { FL, fmt } from '../../data/farmalink';
import { useProductos, imgUrl, ProductoSupabase } from '../../../modules/catalogo/hooks/useProductos';
import { crearPedido } from '../../../modules/pedidos/services/pedidoService';
import { obtenerClientes, crearCliente, ClienteDB } from '../../../modules/clientes/services/clienteService';
import { toast } from 'sonner';

interface Props { onBack: () => void; onConfirmar: () => void; }

function ProductImg({ producto }: { producto: ProductoSupabase }) {
  const [err, setErr] = useState(false);
  if (producto.imagen_cargada && !err) {
    return <img src={imgUrl(producto.id)} alt={producto.nombre} onError={() => setErr(true)} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />;
  }
  return <span style={{ fontSize: '18px' }}>💊</span>;
}

export function GeneradorPedido({ onBack, onConfirmar }: Props) {
  const { productos, loading: loadingProductos } = useProductos();
  const [offline] = useState(false);
  const [cantidades, setCantidades] = useState<Record<string, number>>({});
  const [busqueda, setBusqueda] = useState('');

  // Estado cliente
  const [clientes, setClientes] = useState<ClienteDB[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<ClienteDB | null>(null);
  const [mostrarPicker, setMostrarPicker] = useState(false);
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [creandoCliente, setCreandoCliente] = useState(false);
  const [modoNuevoCliente, setModoNuevoCliente] = useState(false);

  // Estado pedido
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    obtenerClientes()
      .then(setClientes)
      .catch(() => toast.error('Error al cargar clientes'));
  }, []);

  const productosFiltrados = busqueda
    ? productos.filter(p =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.laboratorio.toLowerCase().includes(busqueda.toLowerCase())
      )
    : productos;

  const productosEnPedido = Object.entries(cantidades)
    .filter(([, cant]) => cant > 0)
    .map(([id, cant]) => {
      const prod = productos.find(p => p.id === id);
      if (!prod) return null;
      return { ...prod, cant, subtotal: (prod.precio_contado ?? 0) * cant };
    })
    .filter(Boolean) as (ProductoSupabase & { cant: number; subtotal: number })[];

  const total = productosEnPedido.reduce((a, p) => a + p.subtotal, 0);
  const ajustar = (id: string, delta: number) => setCantidades(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) + delta) }));
  const eliminar = (id: string) => setCantidades(prev => { const n = { ...prev }; delete n[id]; return n; });

  const clientesFiltrados = clientes.filter(c =>
    !busquedaCliente || c.nombre_farmacia.toLowerCase().includes(busquedaCliente.toLowerCase())
  );

  const handleCrearCliente = async () => {
    if (!nuevoNombre.trim()) { toast.error('Ingresa el nombre de la farmacia'); return; }
    setCreandoCliente(true);
    try {
      const nuevo = await crearCliente({ nombre_farmacia: nuevoNombre.trim() });
      setClientes(prev => [...prev, nuevo]);
      setClienteSeleccionado(nuevo);
      setMostrarPicker(false);
      setModoNuevoCliente(false);
      setNuevoNombre('');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al crear cliente');
    } finally {
      setCreandoCliente(false);
    }
  };

  const handleConfirmar = async (estado: 'confirmado' | 'borrador' = 'confirmado') => {
    if (!clienteSeleccionado) { toast.error('Selecciona un cliente'); return; }
    if (productosEnPedido.length === 0) { toast.error('Agrega al menos un producto'); return; }

    setEnviando(true);
    try {
      const pedido = await crearPedido({
        cliente_id: clienteSeleccionado.id,
        tipo_precio: 'contado',
        lineas: productosEnPedido.map(p => ({
          producto_id: p.id,
          cantidad: p.cant,
          precio_unitario: p.precio_contado ?? 0,
        })),
      });
      toast.success(`Pedido ${pedido.numero} creado correctamente`);
      onConfirmar();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al crear pedido');
    } finally {
      setEnviando(false);
    }
  };

  const sugeridos = productosFiltrados
    .filter(p => !cantidades[p.id] || cantidades[p.id] === 0)
    .slice(0, 8);

  return (
    <div style={{ backgroundColor: FL.bg, fontFamily: "'Plus Jakarta Sans', sans-serif", color: FL.text }} className="min-h-full flex flex-col">
      {/* Header */}
      <div style={{ background: '#fff', boxShadow: FL.shadow }} className="px-4 pt-12 pb-4 flex items-center gap-3">
        <button onClick={onBack} style={{ background: FL.bg, borderRadius: '12px' }} className="p-2.5">
          <ArrowLeft size={18} color={FL.text} />
        </button>
        <div className="flex-1">
          <p style={{ fontSize: '17px', fontWeight: 800 }}>Generar Pedido</p>
          <p style={{ fontSize: '11px', color: FL.textMuted }}>
            {productosEnPedido.length > 0 ? `${productosEnPedido.length} producto(s) · ${fmt(total)}` : 'Sin productos aún'}
          </p>
        </div>
      </div>

      {offline && (
        <div style={{ background: '#FFFBEB', borderBottom: '1px solid #FDE68A', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <WifiOff size={16} color={FL.warning} />
          <p style={{ fontSize: '12px', fontWeight: 600, color: '#92400E' }}>Modo sin conexión — El pedido se guardará localmente</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 pb-4 pt-4">
        {/* Selector de cliente */}
        <p style={{ fontSize: '12px', fontWeight: 700, color: FL.textMuted, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cliente</p>

        <button
          onClick={() => { setMostrarPicker(!mostrarPicker); setModoNuevoCliente(false); }}
          style={{
            width: '100%', background: '#fff', borderRadius: FL.radius, boxShadow: FL.shadow,
            padding: '14px 16px', marginBottom: mostrarPicker ? '0' : '16px', border: `2px solid ${clienteSeleccionado ? FL.primary + '40' : FL.border}`,
            display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', textAlign: 'left',
          }}>
          <div style={{ flex: 1 }}>
            {clienteSeleccionado ? (
              <>
                <p style={{ fontSize: '13px', fontWeight: 700, color: FL.text }}>{clienteSeleccionado.nombre_farmacia}</p>
                {clienteSeleccionado.distrito && <p style={{ fontSize: '11px', color: FL.textMuted }}>{clienteSeleccionado.distrito}</p>}
              </>
            ) : (
              <p style={{ fontSize: '13px', color: FL.textMuted }}>Seleccionar cliente...</p>
            )}
          </div>
          <ChevronDown size={16} color={FL.textMuted} style={{ transform: mostrarPicker ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
        </button>

        {mostrarPicker && (
          <div style={{ background: '#fff', borderRadius: `0 0 ${FL.radius} ${FL.radius}`, boxShadow: FL.shadow, marginBottom: '16px', borderTop: `1px solid ${FL.border}` }}>
            <div style={{ padding: '10px 12px', borderBottom: `1px solid ${FL.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: FL.bg, borderRadius: '10px', padding: '8px 12px' }}>
                <Search size={14} color={FL.textMuted} />
                <input
                  value={busquedaCliente}
                  onChange={e => setBusquedaCliente(e.target.value)}
                  placeholder="Buscar farmacia..."
                  style={{ background: 'none', border: 'none', outline: 'none', fontSize: '13px', color: FL.text, flex: 1, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                />
              </div>
            </div>

            <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
              {clientesFiltrados.length === 0 && !modoNuevoCliente && (
                <p style={{ fontSize: '13px', color: FL.textMuted, padding: '12px 16px', textAlign: 'center' }}>Sin resultados</p>
              )}
              {clientesFiltrados.map(c => (
                <button key={c.id} onClick={() => { setClienteSeleccionado(c); setMostrarPicker(false); }}
                  style={{ width: '100%', padding: '12px 16px', display: 'flex', gap: '10px', alignItems: 'center', cursor: 'pointer', background: 'transparent', border: 'none', borderBottom: `1px solid ${FL.border}`, textAlign: 'left' }}>
                  <div style={{ width: '32px', height: '32px', background: FL.primary + '18', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>🏪</div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: FL.text, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{c.nombre_farmacia}</p>
                    {c.distrito && <p style={{ fontSize: '11px', color: FL.textMuted, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{c.distrito}</p>}
                  </div>
                </button>
              ))}
            </div>

            {/* Crear nuevo cliente */}
            {modoNuevoCliente ? (
              <div style={{ padding: '12px', borderTop: `1px solid ${FL.border}` }}>
                <input
                  value={nuevoNombre}
                  onChange={e => setNuevoNombre(e.target.value)}
                  placeholder="Nombre de la farmacia"
                  style={{ width: '100%', padding: '10px 12px', background: FL.bg, border: `1.5px solid ${FL.border}`, borderRadius: '10px', outline: 'none', fontSize: '13px', color: FL.text, fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: '8px', boxSizing: 'border-box' }}
                />
                <div className="flex gap-2">
                  <button onClick={() => setModoNuevoCliente(false)}
                    style={{ flex: 1, padding: '9px', background: FL.bg, border: `1.5px solid ${FL.border}`, borderRadius: '10px', fontSize: '12px', fontWeight: 600, color: FL.textMuted, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Cancelar
                  </button>
                  <button onClick={handleCrearCliente} disabled={creandoCliente}
                    style={{ flex: 2, padding: '9px', background: FL.gradient, border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    {creandoCliente ? <Loader2 size={14} color="#fff" style={{ animation: 'spin 1s linear infinite' }} /> : <UserPlus size={14} color="#fff" />}
                    Crear cliente
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setModoNuevoCliente(true)}
                style={{ width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: 'transparent', border: 'none', color: FL.primary, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <UserPlus size={14} color={FL.primary} />
                <span style={{ fontSize: '13px', fontWeight: 600 }}>Nuevo cliente</span>
              </button>
            )}
          </div>
        )}

        {/* Productos en pedido */}
        {productosEnPedido.length > 0 && (
          <>
            <p style={{ fontSize: '12px', fontWeight: 700, color: FL.textMuted, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Productos en pedido</p>
            <div className="flex flex-col gap-2 mb-4">
              {productosEnPedido.map(prod => (
                <div key={prod.id} style={{ background: '#fff', borderRadius: FL.radius, boxShadow: FL.shadow, padding: '14px' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div style={{ width: '36px', height: '36px', background: FL.primary + '18', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                      <ProductImg producto={prod} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: '13px', fontWeight: 700, color: FL.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prod.nombre}</p>
                      <p style={{ fontSize: '11px', color: FL.textMuted }}>{prod.laboratorio} · {fmt(prod.precio_contado ?? 0)} c/u</p>
                    </div>
                    <button onClick={() => eliminar(prod.id)} style={{ background: '#FEE2E2', borderRadius: '8px', padding: '6px', border: 'none', cursor: 'pointer' }}>
                      <Trash2 size={14} color="#DC2626" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button onClick={() => ajustar(prod.id, -1)} style={{ width: '32px', height: '32px', background: FL.bg, borderRadius: '10px', border: `1.5px solid ${FL.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Minus size={14} color={FL.text} />
                      </button>
                      <p style={{ fontSize: '18px', fontWeight: 800, color: FL.text, minWidth: '32px', textAlign: 'center' }}>{prod.cant}</p>
                      <button onClick={() => ajustar(prod.id, 1)} style={{ width: '32px', height: '32px', background: FL.primary, borderRadius: '10px', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Plus size={14} color="#fff" />
                      </button>
                    </div>
                    <p style={{ fontSize: '15px', fontWeight: 800, color: FL.primary }}>{fmt(prod.subtotal)}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Buscar y agregar productos */}
        <p style={{ fontSize: '12px', fontWeight: 700, color: FL.textMuted, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Agregar productos</p>
        <div style={{ background: '#fff', borderRadius: '12px', boxShadow: FL.shadow, padding: '10px 12px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Search size={14} color={FL.textMuted} />
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o laboratorio..."
            style={{ background: 'none', border: 'none', outline: 'none', fontSize: '13px', color: FL.text, flex: 1, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          />
        </div>

        {loadingProductos ? (
          <div className="flex items-center gap-2 py-4">
            <Loader2 size={16} color={FL.primary} style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: '13px', color: FL.textMuted }}>Cargando catálogo...</span>
          </div>
        ) : (
          <div className="flex flex-col gap-2 mb-4">
            {sugeridos.map(prod => (
              <button key={prod.id} onClick={() => ajustar(prod.id, 1)}
                style={{ background: '#fff', borderRadius: '12px', boxShadow: FL.shadow, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px', border: `1px dashed ${FL.border}`, cursor: 'pointer' }}
                className="text-left">
                <div style={{ width: '32px', height: '32px', background: FL.primary + '18', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                  <ProductImg producto={prod} />
                </div>
                <div className="flex-1">
                  <p style={{ fontSize: '13px', fontWeight: 600, color: FL.text, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{prod.nombre}</p>
                  <p style={{ fontSize: '11px', color: FL.textMuted, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {prod.laboratorio} · {prod.precio_contado != null ? fmt(prod.precio_contado) : 'Consultar'}
                  </p>
                </div>
                <Plus size={18} color={FL.primary} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Totals + actions */}
      <div style={{ background: '#fff', borderTop: `1px solid ${FL.border}`, padding: '16px' }}>
        <div className="flex justify-between items-center mb-3">
          <p style={{ fontSize: '15px', fontWeight: 800, color: FL.text }}>TOTAL</p>
          <p style={{ fontSize: '22px', fontWeight: 900, color: FL.primary }}>{fmt(total)}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleConfirmar('borrador')}
            disabled={enviando}
            style={{ flex: 1, background: FL.bg, border: `1.5px solid ${FL.border}`, borderRadius: '14px', padding: '13px', color: FL.text, fontSize: '13px', fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", cursor: 'pointer', opacity: enviando ? 0.6 : 1 }}>
            Guardar borrador
          </button>
          <button
            onClick={() => handleConfirmar('confirmado')}
            disabled={enviando || productosEnPedido.length === 0 || !clienteSeleccionado}
            style={{
              flex: 2, background: productosEnPedido.length > 0 && clienteSeleccionado ? FL.gradient : '#E5E7EB',
              borderRadius: '14px', padding: '13px',
              color: productosEnPedido.length > 0 && clienteSeleccionado ? '#fff' : FL.textMuted,
              fontSize: '14px', fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif",
              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            }}>
            {enviando
              ? <><Loader2 size={16} color="#fff" style={{ animation: 'spin 1s linear infinite' }} /> Enviando...</>
              : '✓ Confirmar pedido'
            }
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
