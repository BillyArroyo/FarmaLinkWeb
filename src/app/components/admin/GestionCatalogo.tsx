import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, FlaskConical, Loader2 } from 'lucide-react';
import { FL } from '../../data/farmalink';
import { supabase } from '../../../lib/supabase';

interface ProductoDB {
  id: string;
  nombre: string;
  concentracion: string | null;
  presentacion: string | null;
  laboratorio: string;
  precio_contado: number | null;
  precio_credito: number | null;
  oferta: string | null;
  imagen_cargada: boolean;
  imagenes_urls: string[] | null;
  activo: boolean;
}

interface FormData {
  nombre: string;
  laboratorio: string;
  concentracion: string;
  presentacion: string;
  precio_contado: string;
  precio_credito: string;
  oferta: string;
}

const FORM_VACIO: FormData = {
  nombre: '', laboratorio: '', concentracion: '',
  presentacion: '', precio_contado: '', precio_credito: '', oferta: '',
};

function padId(n: number) {
  return `CF-${String(n).padStart(5, '0')}`;
}

const CAMPO_STYLE: React.CSSProperties = {
  width: '100%', background: FL.bg, borderRadius: '10px',
  border: `1.5px solid ${FL.border}`, padding: '11px 14px',
  fontSize: '14px', color: FL.text, outline: 'none',
  fontFamily: "'Plus Jakarta Sans', sans-serif", boxSizing: 'border-box',
};

const LABEL_STYLE: React.CSSProperties = {
  fontSize: '11px', fontWeight: 700, color: FL.textMuted,
  display: 'block', marginBottom: '6px',
};

const STORAGE_BASE_GC = 'https://xbjniegnmwqzrrmwfimz.supabase.co/storage/v1/object/public/imagenes-productos';

// Miniatura de imagen por ID — usa imagenes_urls[0] si existe, sino construye URL
function ImageThumb({ id, hasFoto, imagenes_urls, size = 40 }: { id: string; hasFoto: boolean; imagenes_urls?: string[] | null; size?: number }) {
  const [err, setErr] = useState(false);
  const url = imagenes_urls?.[0] ?? `${STORAGE_BASE_GC}/CanaanFarma/${id}.png`;

  return (
    <div style={{
      width: size, height: size, borderRadius: '10px', overflow: 'hidden',
      border: `1.5px solid ${hasFoto && !err ? FL.primary + '40' : FL.border}`,
      background: FL.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      {hasFoto && !err ? (
        <img
          src={url} alt={id}
          onError={() => setErr(true)}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      ) : (
        <svg viewBox="0 0 80 40" width={Math.round(size * 0.65)} height={Math.round(size * 0.33)} fill="none" opacity={0.25}>
          <rect x="1" y="1" width="78" height="38" rx="19" stroke="#9CA3AF" strokeWidth="2" />
          <line x1="40" y1="1" x2="40" y2="39" stroke="#9CA3AF" strokeWidth="1.5" />
          <rect x="1" y="1" width="39" height="38" rx="19" fill="#9CA3AF" />
          <rect x="40" y="1" width="39" height="38" rx="19" fill="#D1D5DB" />
        </svg>
      )}
    </div>
  );
}

// Campos del formulario reutilizables
const CAMPOS_TEXTO = [
  { label: 'NOMBRE DEL PRODUCTO *', key: 'nombre' as keyof FormData, placeholder: 'Ej: AMOXICILINA' },
  { label: 'LABORATORIO *', key: 'laboratorio' as keyof FormData, placeholder: 'Ej: GENFAR' },
  { label: 'CONCENTRACIÓN', key: 'concentracion' as keyof FormData, placeholder: 'Ej: 500MG' },
  { label: 'PRESENTACIÓN', key: 'presentacion' as keyof FormData, placeholder: 'Ej: Caja x 20 tabletas' },
  { label: 'OFERTA', key: 'oferta' as keyof FormData, placeholder: 'Ej: 3x2' },
];

export function GestionCatalogo() {
  const [productos, setProductos] = useState<ProductoDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [buscar, setBuscar] = useState('');

  // Drawer agregar
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [addForm, setAddForm] = useState<FormData>(FORM_VACIO);
  const [addSaving, setAddSaving] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);

  // Modal editar
  const [editProduct, setEditProduct] = useState<ProductoDB | null>(null);
  const [editForm, setEditForm] = useState<FormData>(FORM_VACIO);
  const [editSaving, setEditSaving] = useState(false);

  const filtrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(buscar.toLowerCase()) ||
    p.laboratorio.toLowerCase().includes(buscar.toLowerCase())
  );

  useEffect(() => {
    supabase
      .from('productos')
      .select('id, nombre, concentracion, presentacion, laboratorio, precio_contado, precio_credito, oferta, imagen_cargada, imagenes_urls, activo')
      .eq('activo', true)
      .order('id')
      .then(({ data, error }) => {
        if (error) console.error('Error cargando productos:', error.message);
        if (data) setProductos(data as ProductoDB[]);
        setLoading(false);
      });

    const channel = supabase
      .channel('gestion-catalogo-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'productos' }, payload => {
        if (payload.eventType === 'UPDATE') {
          const upd = payload.new as ProductoDB;
          if (!upd.activo) {
            setProductos(prev => prev.filter(p => p.id !== upd.id));
          } else {
            setProductos(prev => prev.map(p => p.id === upd.id ? { ...p, ...upd } : p));
          }
        } else if (payload.eventType === 'INSERT') {
          const ins = payload.new as ProductoDB;
          if (ins.activo) {
            setProductos(prev => [...prev, ins].sort((a, b) => a.id.localeCompare(b.id)));
          }
        } else if (payload.eventType === 'DELETE') {
          setProductos(prev => prev.filter(p => p.id !== (payload.old as { id: string }).id));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  function openEdit(p: ProductoDB) {
    setEditProduct(p);
    setEditForm({
      nombre: p.nombre || '',
      laboratorio: p.laboratorio || '',
      concentracion: p.concentracion || '',
      presentacion: p.presentacion || '',
      precio_contado: p.precio_contado != null ? String(p.precio_contado) : '',
      precio_credito: p.precio_credito != null ? String(p.precio_credito) : '',
      oferta: p.oferta || '',
    });
  }

  async function guardarEdicion() {
    if (!editProduct || !editForm.nombre.trim() || !editForm.laboratorio.trim()) return;
    setEditSaving(true);
    try {
      const updates = {
        nombre: editForm.nombre.trim().toUpperCase(),
        concentracion: editForm.concentracion.trim() || null,
        presentacion: editForm.presentacion.trim() || null,
        laboratorio: editForm.laboratorio.trim().toUpperCase(),
        precio_contado: editForm.precio_contado ? parseFloat(editForm.precio_contado) : null,
        precio_credito: editForm.precio_credito ? parseFloat(editForm.precio_credito) : null,
        oferta: editForm.oferta.trim() || null,
      };
      const { error } = await supabase.from('productos').update(updates).eq('id', editProduct.id);
      if (error) throw error;
      setProductos(prev => prev.map(p => p.id === editProduct.id ? { ...p, ...updates } : p));
      setEditProduct(null);
    } catch (e) {
      console.error('Error editando:', e);
    } finally {
      setEditSaving(false);
    }
  }

  async function guardarProducto() {
    if (!addForm.nombre.trim() || !addForm.laboratorio.trim()) return;
    setAddSaving(true);
    try {
      const { data: existing } = await supabase
        .from('productos').select('id').order('id', { ascending: false }).limit(1);

      let nextNum = 1;
      if (existing && existing.length > 0) {
        nextNum = parseInt((existing[0].id as string).replace('CF-', '')) + 1;
      }
      const id = padId(nextNum);

      const { error } = await supabase.from('productos').insert({
        id,
        nombre: addForm.nombre.trim().toUpperCase(),
        concentracion: addForm.concentracion.trim() || null,
        presentacion: addForm.presentacion.trim() || null,
        laboratorio: addForm.laboratorio.trim().toUpperCase(),
        precio_contado: addForm.precio_contado ? parseFloat(addForm.precio_contado) : null,
        precio_credito: addForm.precio_credito ? parseFloat(addForm.precio_credito) : null,
        oferta: addForm.oferta.trim() || null,
        nombre_completo: addForm.nombre.trim().toUpperCase(),
        imagen_nombre: `${id}.png`,
        imagen_cargada: false,
        activo: true,
      });

      if (error) throw error;
      setAddForm(FORM_VACIO);
      setDrawerOpen(false);
      setAddSuccess(true);
      setTimeout(() => setAddSuccess(false), 4000);
    } catch (e) {
      console.error('Error guardando:', e);
    } finally {
      setAddSaving(false);
    }
  }

  async function eliminar(id: string, nombre: string) {
    if (!confirm(`¿Deshabilitar "${nombre}" (${id})?`)) return;
    const { error } = await supabase.from('productos').update({ activo: false }).eq('id', id);
    if (error) console.error('Error eliminando:', error.message);
  }

  return (
    <div style={{ padding: '28px', position: 'relative', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Toast éxito agregar */}
      {addSuccess && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 200,
          background: FL.success, color: '#fff', borderRadius: '14px',
          padding: '14px 20px', fontWeight: 700, fontSize: '14px',
          boxShadow: '0 8px 30px rgba(39,174,96,0.35)',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          ✓ Producto guardado correctamente
        </div>
      )}

      {/* Modal editar */}
      {editProduct && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(26,46,59,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}
          onClick={e => { if (e.target === e.currentTarget) setEditProduct(null); }}
        >
          <div style={{ background: '#fff', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '520px', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '22px' }}>
              <div>
                <span style={{ display: 'inline-block', background: FL.primary + '15', color: FL.primary, borderRadius: '8px', padding: '3px 10px', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                  {editProduct.id}
                </span>
                <p style={{ fontSize: '18px', fontWeight: 800, color: FL.text }}>Editar Producto</p>
              </div>
              <button onClick={() => setEditProduct(null)} style={{ background: FL.bg, borderRadius: '10px', padding: '8px', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
                <X size={18} color={FL.textMuted} />
              </button>
            </div>

            {/* Imagen actual */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', background: FL.bg, borderRadius: '14px', marginBottom: '22px', border: `1px solid ${FL.border}` }}>
              <ImageThumb id={editProduct.id} hasFoto={editProduct.imagen_cargada} imagenes_urls={editProduct.imagenes_urls} size={52} />
              <div>
                <p style={{ fontSize: '11px', fontWeight: 700, color: FL.textMuted, marginBottom: '4px' }}>IMAGEN DEL PRODUCTO</p>
                {editProduct.imagen_cargada
                  ? <span style={{ color: FL.success, fontWeight: 700, fontSize: '13px' }}>✓ Tiene imagen</span>
                  : <span style={{ color: FL.danger, fontWeight: 700, fontSize: '13px' }}>✗ Sin imagen — ir a "Subir Imágenes"</span>
                }
              </div>
            </div>

            {/* Campos */}
            <div style={{ display: 'grid', gap: '14px' }}>
              {CAMPOS_TEXTO.map(f => (
                <div key={f.key}>
                  <label style={LABEL_STYLE}>{f.label}</label>
                  <input
                    value={editForm[f.key]}
                    onChange={e => setEditForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    style={CAMPO_STYLE}
                  />
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={LABEL_STYLE}>PRECIO CONTADO S/</label>
                  <input type="number" step="0.01" min="0" value={editForm.precio_contado}
                    onChange={e => setEditForm(prev => ({ ...prev, precio_contado: e.target.value }))}
                    placeholder="0.00" style={CAMPO_STYLE} />
                </div>
                <div>
                  <label style={LABEL_STYLE}>PRECIO CRÉDITO S/</label>
                  <input type="number" step="0.01" min="0" value={editForm.precio_credito}
                    onChange={e => setEditForm(prev => ({ ...prev, precio_credito: e.target.value }))}
                    placeholder="0.00" style={CAMPO_STYLE} />
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
              <button
                onClick={guardarEdicion}
                disabled={editSaving || !editForm.nombre.trim() || !editForm.laboratorio.trim()}
                style={{
                  flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  padding: '12px', borderRadius: '12px', border: 'none',
                  cursor: editSaving ? 'not-allowed' : 'pointer',
                  background: editSaving ? '#E5E7EB' : FL.gradient,
                  color: editSaving ? FL.textMuted : '#fff',
                  fontWeight: 700, fontSize: '14px', fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {editSaving && <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />}
                {editSaving ? 'Guardando…' : '✓ Guardar cambios'}
              </button>
              <button
                onClick={() => setEditProduct(null)}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: `1.5px solid ${FL.border}`, background: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: FL.textMuted, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <p style={{ fontSize: '24px', fontWeight: 800, color: FL.text }}>Gestión de Catálogo</p>
          <p style={{ fontSize: '14px', color: FL.textMuted }}>
            {loading ? 'Cargando desde Supabase…' : `${productos.length} productos activos · Supabase en tiempo real`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '12px', border: `1.5px solid ${FL.border}`, display: 'flex', alignItems: 'center', padding: '10px 14px', gap: '10px', minWidth: '260px', boxShadow: FL.shadow }}>
            <Search size={16} color={FL.primary} />
            <input value={buscar} onChange={e => setBuscar(e.target.value)} placeholder="Buscar producto o laboratorio…"
              style={{ background: 'none', border: 'none', outline: 'none', fontSize: '14px', color: FL.text, flex: 1, fontFamily: "'Plus Jakarta Sans', sans-serif" }} />
          </div>
          <button onClick={() => { setAddForm(FORM_VACIO); setDrawerOpen(true); }}
            style={{ background: FL.gradient, borderRadius: '12px', padding: '10px 20px', color: '#fff', fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Plus Jakarta Sans', sans-serif", whiteSpace: 'nowrap' }}>
            <Plus size={18} /> Agregar producto
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div style={{ background: '#fff', borderRadius: '18px', boxShadow: FL.shadow, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <Loader2 size={24} color={FL.primary} style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ color: FL.textMuted }}>Cargando productos desde Supabase…</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
              <thead>
                <tr style={{ background: FL.bg }}>
                  {['ID', 'Producto', 'Laboratorio', 'Precio C.', 'Precio Cr.', 'Oferta', 'Imagen', 'Acciones'].map(h => (
                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: '10px', fontWeight: 700, color: FL.textMuted, letterSpacing: '0.6px', whiteSpace: 'nowrap' }}>
                      {h.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtrados.map((prod, i) => (
                  <tr key={prod.id} style={{ borderBottom: `1px solid ${FL.border}`, background: i % 2 === 0 ? '#fff' : FL.bg + '60' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: FL.primary, fontFamily: 'monospace', background: FL.primary + '10', padding: '3px 8px', borderRadius: '6px' }}>{prod.id}</span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '34px', height: '34px', background: FL.primary + '18', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <FlaskConical size={17} color={FL.primary} />
                        </div>
                        <div>
                          <p style={{ fontSize: '13px', fontWeight: 700, color: FL.text }}>{prod.nombre}</p>
                          {prod.concentracion && (
                            <p style={{ fontSize: '11px', color: FL.primary, lineHeight: 1.2 }}>{prod.concentracion}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '13px', color: FL.text, whiteSpace: 'nowrap' }}>{prod.laboratorio}</td>
                    <td style={{ padding: '12px 14px', fontSize: '14px', fontWeight: 800, color: FL.primary, whiteSpace: 'nowrap' }}>
                      {prod.precio_contado != null ? `S/ ${prod.precio_contado.toFixed(2)}` : <span style={{ color: FL.textMuted }}>—</span>}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '13px', color: FL.textMuted, whiteSpace: 'nowrap' }}>
                      {prod.precio_credito != null ? `S/ ${prod.precio_credito.toFixed(2)}` : '—'}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      {prod.oferta
                        ? <span style={{ background: FL.secondary + '20', color: FL.secondary, borderRadius: '8px', padding: '3px 10px', fontSize: '11px', fontWeight: 700 }}>🎁 {prod.oferta}</span>
                        : <span style={{ color: FL.textMuted, fontSize: '13px' }}>—</span>}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <ImageThumb id={prod.id} hasFoto={prod.imagen_cargada} imagenes_urls={prod.imagenes_urls} size={40} />
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => openEdit(prod)} title="Editar producto" style={{ background: FL.primary + '12', borderRadius: '8px', padding: '7px', border: 'none', cursor: 'pointer' }}>
                          <Edit2 size={14} color={FL.primary} />
                        </button>
                        <button onClick={() => eliminar(prod.id, prod.nombre)} title="Deshabilitar producto" style={{ background: '#FEE2E2', borderRadius: '8px', padding: '7px', border: 'none', cursor: 'pointer' }}>
                          <Trash2 size={14} color="#DC2626" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtrados.length === 0 && (
              <div style={{ padding: '48px', textAlign: 'center' }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: FL.textMuted }}>
                  {buscar ? `Sin resultados para "${buscar}"` : 'No hay productos activos'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Drawer — Agregar producto */}
      {drawerOpen && (
        <>
          <div onClick={() => setDrawerOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }} />
          <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: '420px', background: '#fff', boxShadow: '-8px 0 40px rgba(0,0,0,0.15)', zIndex: 50, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${FL.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div>
                <p style={{ fontSize: '18px', fontWeight: 800, color: FL.text }}>Agregar producto</p>
                <p style={{ fontSize: '12px', color: FL.textMuted }}>ID generado automáticamente · se guarda en Supabase</p>
              </div>
              <button onClick={() => setDrawerOpen(false)} style={{ background: FL.bg, borderRadius: '10px', padding: '8px', border: 'none', cursor: 'pointer' }}>
                <X size={18} color={FL.textMuted} />
              </button>
            </div>

            <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>
              {CAMPOS_TEXTO.map(f => (
                <div key={f.key} style={{ marginBottom: '14px' }}>
                  <label style={LABEL_STYLE}>{f.label}</label>
                  <input
                    value={addForm[f.key]}
                    onChange={e => setAddForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    style={CAMPO_STYLE}
                  />
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={LABEL_STYLE}>PRECIO CONTADO S/</label>
                  <input type="number" step="0.01" min="0" value={addForm.precio_contado}
                    onChange={e => setAddForm(prev => ({ ...prev, precio_contado: e.target.value }))}
                    placeholder="0.00" style={CAMPO_STYLE} />
                </div>
                <div>
                  <label style={LABEL_STYLE}>PRECIO CRÉDITO S/</label>
                  <input type="number" step="0.01" min="0" value={addForm.precio_credito}
                    onChange={e => setAddForm(prev => ({ ...prev, precio_credito: e.target.value }))}
                    placeholder="0.00" style={CAMPO_STYLE} />
                </div>
              </div>
            </div>

            <div style={{ padding: '20px 24px', borderTop: `1px solid ${FL.border}`, display: 'flex', gap: '12px', flexShrink: 0 }}>
              <button onClick={() => setDrawerOpen(false)}
                style={{ flex: 1, background: FL.bg, border: `1.5px solid ${FL.border}`, borderRadius: '12px', padding: '13px', fontSize: '14px', fontWeight: 700, color: FL.text, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Cancelar
              </button>
              <button onClick={guardarProducto}
                disabled={addSaving || !addForm.nombre.trim() || !addForm.laboratorio.trim()}
                style={{
                  flex: 2, borderRadius: '12px', padding: '13px', fontSize: '14px', fontWeight: 700, border: 'none',
                  cursor: addSaving || !addForm.nombre.trim() || !addForm.laboratorio.trim() ? 'not-allowed' : 'pointer',
                  background: addSaving || !addForm.nombre.trim() || !addForm.laboratorio.trim() ? '#E5E7EB' : FL.gradient,
                  color: addSaving || !addForm.nombre.trim() || !addForm.laboratorio.trim() ? FL.textMuted : '#fff',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}>
                {addSaving && <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />}
                {addSaving ? 'Guardando…' : '✓ Guardar producto'}
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
