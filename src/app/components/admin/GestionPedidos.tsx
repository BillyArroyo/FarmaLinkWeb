import { useState } from 'react';
import { Loader2, RefreshCw, ChevronDown } from 'lucide-react';
import { FL, fmt } from '../../data/farmalink';
import { usePedidos } from '../../../modules/pedidos/hooks/usePedidos';
import { actualizarEstado } from '../../../modules/pedidos/services/pedidoService';
import type { EstadoPedido } from '../../../modules/pedidos/types';
import { toast } from 'sonner';

const TABS: { label: string; valor?: EstadoPedido }[] = [
  { label: 'Todos' },
  { label: 'Confirmados', valor: 'confirmado' },
  { label: 'En proceso', valor: 'en_proceso' },
  { label: 'Entregados', valor: 'entregado' },
  { label: 'Cancelados', valor: 'cancelado' },
];

const ESTADO_CONFIG: Record<string, { bg: string; color: string; label: string }> = {
  borrador:    { bg: '#F3F4F6', color: '#6B7280', label: 'Borrador' },
  confirmado:  { bg: '#DBEAFE', color: '#1D4ED8', label: 'Confirmado' },
  en_proceso:  { bg: '#FEF9C3', color: '#CA8A04', label: 'En proceso' },
  entregado:   { bg: '#DCFCE7', color: '#16A34A', label: 'Entregado' },
  cancelado:   { bg: '#FEE2E2', color: '#DC2626', label: 'Cancelado' },
};

const SIGUIENTE_ESTADO: Partial<Record<EstadoPedido, EstadoPedido>> = {
  confirmado: 'en_proceso',
  en_proceso: 'entregado',
};

function BadgeEstado({ estado }: { estado: string }) {
  const conf = ESTADO_CONFIG[estado] ?? ESTADO_CONFIG.borrador;
  return (
    <span style={{ background: conf.bg, color: conf.color, borderRadius: '8px', padding: '4px 10px', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap' }}>
      {conf.label}
    </span>
  );
}

export function GestionPedidos() {
  const [tabActivo, setTabActivo] = useState(0);
  const [expandido, setExpandido] = useState<string | null>(null);
  const [cambiando, setCambiando] = useState<string | null>(null);

  const { pedidos, loading, recargar } = usePedidos(TABS[tabActivo].valor);

  const totalGeneral = pedidos.reduce((s: number, p: any) => s + (p.total ?? 0), 0);
  const porEstado = (e: string) => pedidos.filter((p: any) => p.estado === e).length;

  const handleAvanzar = async (id: string, estado: EstadoPedido) => {
    const siguiente = SIGUIENTE_ESTADO[estado];
    if (!siguiente) return;
    setCambiando(id);
    try {
      await actualizarEstado(id, siguiente);
      toast.success(`Pedido marcado como "${ESTADO_CONFIG[siguiente].label}"`);
      recargar();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al actualizar estado');
    } finally {
      setCambiando(null);
    }
  };

  const handleCancelar = async (id: string) => {
    setCambiando(id);
    try {
      await actualizarEstado(id, 'cancelado');
      toast.success('Pedido cancelado');
      recargar();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al cancelar');
    } finally {
      setCambiando(null);
    }
  };

  return (
    <div style={{ padding: '28px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Título + KPIs */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p style={{ fontSize: '24px', fontWeight: 800, color: FL.text }}>Gestión de Pedidos</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16A34A', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: '12px', color: '#16A34A', fontWeight: 600 }}>Actualización en tiempo real</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <button onClick={recargar} style={{ background: '#fff', border: `1.5px solid ${FL.border}`, borderRadius: '10px', padding: '9px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: FL.textMuted, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <RefreshCw size={14} color={FL.textMuted} />
            Refrescar
          </button>
          <div style={{ background: '#fff', borderRadius: '14px', padding: '14px 20px', boxShadow: FL.shadow, display: 'flex', gap: '24px' }}>
            {[
              { label: 'Total', count: pedidos.length, color: FL.primary },
              { label: 'Confirmados', count: porEstado('confirmado'), color: '#1D4ED8' },
              { label: 'En proceso', count: porEstado('en_proceso'), color: '#CA8A04' },
              { label: 'Entregados', count: porEstado('entregado'), color: '#16A34A' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '22px', fontWeight: 900, color: s.color }}>{loading ? '—' : s.count}</p>
                <p style={{ fontSize: '11px', color: FL.textMuted }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {TABS.map((tab, i) => (
          <button key={tab.label} onClick={() => setTabActivo(i)}
            style={{
              borderRadius: '10px', padding: '8px 18px', fontSize: '13px', fontWeight: 600,
              background: tabActivo === i ? FL.gradient : '#fff',
              color: tabActivo === i ? '#fff' : FL.textMuted,
              border: tabActivo === i ? 'none' : `1.5px solid ${FL.border}`,
              cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      {loading ? (
        <div style={{ background: '#fff', borderRadius: '18px', boxShadow: FL.shadow, padding: '80px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <Loader2 size={36} color={FL.primary} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: '14px', color: FL.textMuted }}>Cargando pedidos...</p>
        </div>
      ) : pedidos.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: '18px', boxShadow: FL.shadow, padding: '72px 40px', textAlign: 'center' }}>
          <p style={{ fontSize: '40px', marginBottom: '16px' }}>📋</p>
          <p style={{ fontSize: '18px', fontWeight: 700, color: FL.text, marginBottom: '8px' }}>Sin pedidos</p>
          <p style={{ fontSize: '14px', color: FL.textMuted }}>
            {tabActivo === 0 ? 'Aún no hay pedidos registrados.' : `No hay pedidos en estado "${TABS[tabActivo].label}".`}
          </p>
        </div>
      ) : (
        <>
          {/* Tabla */}
          <div style={{ background: '#fff', borderRadius: '18px', boxShadow: FL.shadow, overflow: 'hidden' }}>
            {/* Header tabla */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr 1fr 1fr 1fr 1.5fr', padding: '12px 20px', borderBottom: `2px solid ${FL.border}`, background: FL.bg }}>
              {['Número', 'Cliente', 'Productos', 'Total', 'Estado', 'Acciones'].map(h => (
                <p key={h} style={{ fontSize: '11px', fontWeight: 700, color: FL.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</p>
              ))}
            </div>

            {pedidos.map((pedido: any, idx: number) => {
              const lineas: any[] = pedido.lineas ?? [];
              const isOpen = expandido === pedido.id;
              const isCambiando = cambiando === pedido.id;
              const siguiente = SIGUIENTE_ESTADO[pedido.estado as EstadoPedido];

              return (
                <div key={pedido.id} style={{ borderBottom: idx < pedidos.length - 1 ? `1px solid ${FL.border}` : 'none' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr 1fr 1fr 1fr 1.5fr', padding: '16px 20px', alignItems: 'center' }}>
                    {/* Número */}
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 800, color: FL.text }}>{pedido.numero ?? '—'}</p>
                      <p style={{ fontSize: '11px', color: FL.textMuted }}>
                        {new Date(pedido.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    {/* Cliente */}
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: FL.text }}>
                        {pedido.cliente?.nombre_farmacia ?? 'Sin cliente'}
                      </p>
                      {pedido.cliente?.distrito && (
                        <p style={{ fontSize: '11px', color: FL.textMuted }}>{pedido.cliente.distrito}</p>
                      )}
                    </div>

                    {/* Productos */}
                    <button
                      onClick={() => setExpandido(isOpen ? null : pedido.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
                      <p style={{ fontSize: '13px', color: FL.primary, fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {lineas.length} ítem{lineas.length !== 1 ? 's' : ''}
                      </p>
                      {isOpen ? <ChevronDown size={14} color={FL.primary} style={{ transform: 'rotate(180deg)' }} /> : <ChevronDown size={14} color={FL.primary} />}
                    </button>

                    {/* Total */}
                    <p style={{ fontSize: '15px', fontWeight: 800, color: FL.primary }}>{fmt(pedido.total ?? 0)}</p>

                    {/* Estado */}
                    <BadgeEstado estado={pedido.estado} />

                    {/* Acciones */}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {siguiente && (
                        <button
                          onClick={() => handleAvanzar(pedido.id, pedido.estado)}
                          disabled={isCambiando}
                          style={{ padding: '6px 12px', background: FL.gradient, border: 'none', borderRadius: '8px', fontSize: '11px', fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", opacity: isCambiando ? 0.6 : 1 }}>
                          {isCambiando ? '...' : `→ ${ESTADO_CONFIG[siguiente].label}`}
                        </button>
                      )}
                      {!['entregado', 'cancelado'].includes(pedido.estado) && (
                        <button
                          onClick={() => handleCancelar(pedido.id)}
                          disabled={isCambiando}
                          style={{ padding: '6px 10px', background: '#FEE2E2', border: 'none', borderRadius: '8px', fontSize: '11px', fontWeight: 600, color: '#DC2626', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", opacity: isCambiando ? 0.6 : 1 }}>
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Detalle de líneas */}
                  {isOpen && lineas.length > 0 && (
                    <div style={{ background: FL.bg, borderTop: `1px solid ${FL.border}`, padding: '12px 20px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '4px', marginBottom: '8px' }}>
                        {['Producto', 'Laboratorio', 'Cant.', 'Subtotal'].map(h => (
                          <p key={h} style={{ fontSize: '10px', fontWeight: 700, color: FL.textMuted, textTransform: 'uppercase' }}>{h}</p>
                        ))}
                      </div>
                      {lineas.map((l: any) => (
                        <div key={l.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '4px', padding: '6px 0', borderTop: `1px solid ${FL.border}` }}>
                          <p style={{ fontSize: '13px', color: FL.text, fontWeight: 600 }}>{l.producto?.nombre ?? l.producto_id}</p>
                          <p style={{ fontSize: '12px', color: FL.textMuted }}>{l.producto?.laboratorio ?? '—'}</p>
                          <p style={{ fontSize: '13px', color: FL.text }}>{l.cantidad} und.</p>
                          <p style={{ fontSize: '13px', fontWeight: 700, color: FL.primary }}>{fmt(l.subtotal)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer total */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', gap: '12px', alignItems: 'center' }}>
            <p style={{ fontSize: '14px', color: FL.textMuted }}>Total {pedidos.length} pedidos:</p>
            <p style={{ fontSize: '22px', fontWeight: 900, color: FL.primary }}>{fmt(totalGeneral)}</p>
          </div>
        </>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}
