import { useState, useEffect, useRef } from 'react';
import { CheckCircle2, XCircle, Upload, Loader2, RefreshCw, ImageOff, Pencil, X, Save, Search, RefreshCcw } from 'lucide-react';
import { FL } from '../../app/data/farmalink';
import { supabase } from '../../lib/supabase';

interface Producto {
  id: string;
  nombre: string;
  concentracion: string | null;
  presentacion: string | null;
  laboratorio: string;
  precio_contado: number | null;
  precio_credito: number | null;
  oferta: string | null;
  fecha_vencimiento: string | null;
  imagen_nombre: string;
  imagen_cargada: boolean;
  imagenes_urls: string[];
}

interface EditForm {
  nombre: string;
  concentracion: string;
  presentacion: string;
  laboratorio: string;
  precio_contado: string;
  precio_credito: string;
  oferta: string;
  fecha_vencimiento: string;
}

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: '8px',
  border: `1.5px solid ${FL.border}`,
  fontSize: '13px',
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  color: FL.text,
  outline: 'none',
  boxSizing: 'border-box',
};

const LABEL_STYLE: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 700,
  color: FL.textMuted,
  marginBottom: '4px',
  display: 'block',
};

function ImageSlot({ url, index }: { url?: string; index: number }) {
  return (
    <div style={{
      width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden',
      border: url ? `1.5px solid ${FL.primary}40` : `1.5px dashed #B2DFDB`,
      background: url ? 'transparent' : '#F0F8FF',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, position: 'relative',
    }}>
      {url ? (
        <img src={url} alt={`img-${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <span style={{ fontSize: '9px', color: '#B2DFDB', fontWeight: 700 }}>{index + 1}</span>
      )}
    </div>
  );
}

export function SubirImagenes() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [uploadStates, setUploadStates] = useState<Record<string, 'idle' | 'uploading' | 'done' | 'error'>>({});
  const [uploadSuccess, setUploadSuccess] = useState<Record<string, boolean>>({});
  const [editProduct, setEditProduct] = useState<Producto | null>(null);
  const [formData, setFormData] = useState<EditForm>({} as EditForm);
  const [saving, setSaving] = useState(false);

  const [productoActivo, setProductoActivo] = useState<Producto | null>(null);
  const [syncing, setSyncing] = useState(false);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const EMPRESA = 'CanaanFarma';
  const STORAGE_BASE = 'https://xbjniegnmwqzrrmwfimz.supabase.co/storage/v1/object/public/imagenes-productos';

  const cargadas = productos.filter(p => (p.imagenes_urls?.length || 0) > 0 || p.imagen_cargada).length;
  const pct = productos.length ? Math.round((cargadas / productos.length) * 100) : 0;

  async function fetchProductos(autoSync = false) {
    setLoading(true);
    const { data, error } = await supabase
      .from('productos')
      .select('id, nombre, concentracion, presentacion, laboratorio, precio_contado, precio_credito, oferta, fecha_vencimiento, imagen_nombre, imagen_cargada, imagenes_urls')
      .order('id');
    if (!error && data) {
      const mapped = data.map(p => ({ ...p, imagenes_urls: p.imagenes_urls ?? [] })) as Produto[];
      setProductos(mapped);
      if (autoSync && mapped.some(p => (p.imagenes_urls?.length ?? 0) === 0)) {
        syncFromStorage();
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchProductos(true);

    const channel = supabase
      .channel('subir-imagenes-rt')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'productos' }, payload => {
        const upd = payload.new as Record<string, unknown>;
        setProductos(prev => prev.map(p =>
          p.id === upd.id
            ? { ...p, imagenes_urls: (upd.imagenes_urls as string[]) ?? [], imagen_cargada: Boolean(upd.imagen_cargada) }
            : p
        ));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  function handleSubirClick(p: Producto) {
    if ((p.imagenes_urls ?? []).length >= 3) return;
    setProductoActivo(p);
    uploadInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';

    if (!file || !productoActivo) return;

    const p = productoActivo;
    setProductoActivo(null);

    const urls = p.imagenes_urls ?? [];
    if (urls.length >= 3) return;

    const slot = urls.length + 1;
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const fileName = `${EMPRESA}/${p.id}_${slot}.${ext}`;
    const id = p.id;

    console.log('[SubirImagenes] Archivo seleccionado:', file.name, '| Producto:', id);

    setUploadStates(prev => ({ ...prev, [id]: 'uploading' }));
    try {
      console.log('[SubirImagenes] Subiendo a Storage...', { fileName, contentType: file.type, size: file.size });
      const { data: storageData, error: storageErr } = await supabase.storage
        .from('imagenes-productos')
        .upload(fileName, file, { upsert: true, contentType: file.type });
      console.log('[SubirImagenes] Respuesta Storage:', storageData, storageErr);
      if (storageErr) throw storageErr;

      const { data: urlData } = supabase.storage
        .from('imagenes-productos')
        .getPublicUrl(fileName);
      console.log('[SubirImagenes] URL pública:', urlData.publicUrl);

      const newUrls = [...urls, urlData.publicUrl];

      console.log('[SubirImagenes] Actualizando tabla productos...', { id, imagenes_urls: newUrls });
      const { data: dbData, error: dbErr } = await supabase
        .from('productos')
        .update({ imagenes_urls: newUrls, imagen_cargada: true })
        .eq('id', id)
        .select();
      console.log('[SubirImagenes] Respuesta update:', dbData, dbErr);
      if (dbErr) throw dbErr;

      setProductos(prev => prev.map(q =>
        q.id === id ? { ...q, imagenes_urls: newUrls, imagen_cargada: true } : q
      ));
      setUploadStates(prev => ({ ...prev, [id]: 'done' }));
      setUploadSuccess(prev => ({ ...prev, [id]: true }));
      setTimeout(() => setUploadSuccess(prev => ({ ...prev, [id]: false })), 3000);
    } catch (err) {
      console.error('[SubirImagenes] Error subiendo imagen:', err);
      setUploadStates(prev => ({ ...prev, [id]: 'error' }));
    }
  }

  function openEdit(p: Produto) {
    setEditProduct(p);
    setFormData({
      nombre: p.nombre || '',
      concentracion: p.concentracion || '',
      presentacion: p.presentacion || '',
      laboratorio: p.laboratorio || '',
      precio_contado: p.precio_contado != null ? String(p.precio_contado) : '',
      precio_credito: p.precio_credito != null ? String(p.precio_credito) : '',
      oferta: p.oferta || '',
      fecha_vencimiento: p.fecha_vencimiento || '',
    });
  }

  async function saveEdit() {
    if (!editProduct) return;
    setSaving(true);
    try {
      const updates = {
        nombre: formData.nombre.trim() || editProduct.nombre,
        concentracion: formData.concentracion.trim() || null,
        presentacion: formData.presentacion.trim() || null,
        laboratorio: formData.laboratorio.trim() || editProduct.laboratorio,
        precio_contado: formData.precio_contado !== '' ? parseFloat(formData.precio_contado) : null,
        precio_credito: formData.precio_credito !== '' ? parseFloat(formData.precio_credito) : null,
        oferta: formData.oferta.trim() || null,
        fecha_vencimiento: formData.fecha_vencimiento.trim() || null,
      };

      const { error } = await supabase
        .from('productos')
        .update(updates)
        .eq('id', editProduct.id);
      if (error) throw error;

      setProductos(prev => prev.map(p =>
        p.id === editProduct.id ? { ...p, ...updates } : p
      ));
      setEditProduct(null);
    } catch (e) {
      console.error('Error guardando:', e);
    } finally {
      setSaving(false);
    }
  }

  async function syncFromStorage() {
    setSyncing(true);
    try {
      // Lista SOLO los archivos que existen realmente en Storage
      const { data: files, error: listErr } = await supabase.storage
        .from('imagenes-productos')
        .list(EMPRESA, { limit: 1000 });

      if (listErr) {
        alert(`Error al leer Storage: ${listErr.message}`);
        return;
      }

      const archivos = (files ?? []).filter(f => /^CF-\d+\./i.test(f.name));
      if (archivos.length === 0) {
        alert(`No se encontraron archivos en CanaanFarma/. Verifica el bucket.`);
        return;
      }

      // Solo actualiza productos que TIENEN archivo en Storage
      for (const archivo of archivos) {
        const id = archivo.name.replace(/\.[^.]+$/, ''); // CF-00001.png → CF-00001
        const { data: urlData } = supabase.storage
          .from('imagenes-productos')
          .getPublicUrl(`${EMPRESA}/${archivo.name}`);
        await supabase
          .from('productos')
          .update({ imagenes_urls: [urlData.publicUrl], imagen_cargada: true })
          .eq('id', id);
      }

      await fetchProductos();
    } catch (err) {
      alert(`Error inesperado en sync: ${String(err)}`);
      console.error('[SubirImagenes] Sync error:', err);
    } finally {
      setSyncing(false);
    }
  }

  // ── Edit modal ──────────────────────────────────────────────────────────
  const EditModal = editProduct && (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(26,46,59,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}
      onClick={e => { if (e.target === e.currentTarget) setEditProduct(null); }}
    >
      <div style={{ background: '#fff', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        {/* Modal header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <span style={{ display: 'inline-block', background: FL.primary + '15', color: FL.primary, borderRadius: '8px', padding: '3px 10px', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
              {editProduct.id}
            </span>
            <p style={{ fontSize: '16px', fontWeight: 800, color: FL.text }}>Editar Producto</p>
          </div>
          <button onClick={() => setEditProduct(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}>
            <X size={20} color={FL.textMuted} />
          </button>
        </div>

        {/* Form */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={LABEL_STYLE}>NOMBRE</label>
            <input style={INPUT_STYLE} value={formData.nombre} onChange={e => setFormData(p => ({ ...p, nombre: e.target.value }))} />
          </div>
          <div>
            <label style={LABEL_STYLE}>CONCENTRACIÓN</label>
            <input style={INPUT_STYLE} value={formData.concentracion} onChange={e => setFormData(p => ({ ...p, concentracion: e.target.value }))} placeholder="ej: 500MG" />
          </div>
          <div>
            <label style={LABEL_STYLE}>PRESENTACIÓN</label>
            <input style={INPUT_STYLE} value={formData.presentacion} onChange={e => setFormData(p => ({ ...p, presentacion: e.target.value }))} placeholder="ej: Caja x 20 tabletas" />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={LABEL_STYLE}>LABORATORIO</label>
            <input style={INPUT_STYLE} value={formData.laboratorio} onChange={e => setFormData(p => ({ ...p, laboratorio: e.target.value }))} />
          </div>
          <div>
            <label style={LABEL_STYLE}>PRECIO CONTADO (S/)</label>
            <input style={INPUT_STYLE} type="number" step="0.01" min="0" value={formData.precio_contado} onChange={e => setFormData(p => ({ ...p, precio_contado: e.target.value }))} placeholder="0.00" />
          </div>
          <div>
            <label style={LABEL_STYLE}>PRECIO CRÉDITO (S/)</label>
            <input style={INPUT_STYLE} type="number" step="0.01" min="0" value={formData.precio_credito} onChange={e => setFormData(p => ({ ...p, precio_credito: e.target.value }))} placeholder="0.00" />
          </div>
          <div>
            <label style={LABEL_STYLE}>OFERTA</label>
            <input style={INPUT_STYLE} value={formData.oferta} onChange={e => setFormData(p => ({ ...p, oferta: e.target.value }))} placeholder="ej: 3x2" />
          </div>
          <div>
            <label style={LABEL_STYLE}>FECHA VENCIMIENTO</label>
            <input style={INPUT_STYLE} value={formData.fecha_vencimiento} onChange={e => setFormData(p => ({ ...p, fecha_vencimiento: e.target.value }))} placeholder="ej: 12/2026" />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
          <button
            onClick={saveEdit}
            disabled={saving}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '11px', borderRadius: '12px', border: 'none',
              background: saving ? '#E5E7EB' : FL.gradient,
              color: saving ? FL.textMuted : '#fff',
              fontWeight: 700, fontSize: '14px', cursor: saving ? 'not-allowed' : 'pointer',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            {saving ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={15} />}
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
          <button
            onClick={() => setEditProduct(null)}
            style={{ padding: '11px 20px', borderRadius: '12px', border: `1.5px solid ${FL.border}`, background: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: FL.textMuted, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );

  // ── Main render ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', gap: '12px' }}>
        <Loader2 size={24} color={FL.primary} style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ color: FL.textMuted, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Cargando productos…</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: '28px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {EditModal}

      {/* Hidden upload input */}
      <input ref={uploadInputRef} type="file" accept="image/png,image/jpeg,image/webp" style={{ display: 'none' }} onChange={handleFileChange} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: FL.text, marginBottom: '4px' }}>Subir Imágenes de Productos</h1>
          <p style={{ fontSize: '14px', color: FL.textMuted }}>
            Imágenes en Storage → CanaanFarma/CF-XXXXX.png · Se sincronizan automáticamente
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={syncFromStorage}
            disabled={syncing}
            title="Sincroniza archivos subidos manualmente al bucket con la base de datos"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', border: `1.5px solid ${FL.primary}40`, background: FL.primary + '10', cursor: syncing ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 600, color: FL.primary, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {syncing ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCcw size={14} />}
            {syncing ? 'Sincronizando…' : 'Sync Storage'}
          </button>
          <button
            onClick={fetchProductos}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', border: `1.5px solid ${FL.border}`, background: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: FL.textMuted, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <RefreshCw size={14} /> Actualizar
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <Search size={15} color={FL.textMuted} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre o ID (ej: CF-00001)"
          style={{
            width: '100%', padding: '10px 14px 10px 38px',
            borderRadius: '12px', border: `1.5px solid ${FL.border}`,
            fontSize: '14px', fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: FL.text, outline: 'none', boxSizing: 'border-box', background: '#fff',
          }}
        />
      </div>

      {/* Progress bar */}
      {productos.length > 0 && (
        <div style={{ background: '#fff', borderRadius: '14px', padding: '16px 20px', marginBottom: '24px', border: `1px solid ${FL.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <p style={{ fontSize: '14px', fontWeight: 700, color: FL.text }}>Progreso de imágenes</p>
            <p style={{ fontSize: '16px', fontWeight: 800, color: FL.primary }}>{cargadas} / {productos.length} productos con imagen</p>
          </div>
          <div style={{ height: '10px', background: FL.border, borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: FL.gradient, borderRadius: '6px', transition: 'width 0.4s' }} />
          </div>
          <p style={{ fontSize: '12px', color: FL.textMuted, marginTop: '6px' }}>{pct}% completado</p>
        </div>
      )}

      {/* Product list */}
      {productos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <ImageOff size={48} color={FL.textMuted} style={{ margin: '0 auto 16px', display: 'block' }} />
          <p style={{ fontSize: '16px', fontWeight: 700, color: FL.text }}>No hay productos</p>
          <p style={{ fontSize: '13px', color: FL.textMuted, marginTop: '4px' }}>Importa productos desde Excel primero</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {(() => {
            const q = search.trim().toLowerCase();
            const filtered = q
              ? productos.filter(p => p.nombre.toLowerCase().includes(q) || p.id.toLowerCase().includes(q))
              : productos;

            if (filtered.length === 0) {
              return (
                <div style={{ textAlign: 'center', padding: '40px 24px' }}>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: FL.text }}>Sin resultados para "{search}"</p>
                  <p style={{ fontSize: '12px', color: FL.textMuted, marginTop: '4px' }}>Prueba con otro nombre o ID</p>
                </div>
              );
            }

            return filtered.map(p => {
              const urls = p.imagenes_urls ?? [];
              const hasFoto = urls.length > 0 || p.imagen_cargada;
              const state = uploadStates[p.id] || 'idle';
              const canAddMore = urls.length < 3;
              const thumbUrl = urls[0] ?? `${STORAGE_BASE}/${EMPRESA}/${p.id}.png`;

              return (
                <div
                  key={p.id}
                  style={{
                    background: '#fff',
                    borderRadius: '14px',
                    padding: '12px 16px',
                    border: `1.5px solid ${hasFoto ? FL.success + '40' : FL.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'border-color 0.2s',
                  }}
                >
                  {/* Status icon */}
                  {hasFoto
                    ? <CheckCircle2 size={20} color={FL.success} style={{ flexShrink: 0 }} />
                    : <XCircle size={20} color={FL.danger} style={{ flexShrink: 0 }} />
                  }

                  {/* Thumbnail — siempre intenta cargar, onError oculta si 404 */}
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '10px', flexShrink: 0,
                    border: `1.5px solid ${hasFoto ? FL.primary + '40' : FL.border}`,
                    background: FL.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden',
                  }}>
                    <img
                      src={thumbUrl}
                      alt={p.nombre}
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: FL.primary }}>{p.id}</span>
                      <span style={{ fontSize: '11px', color: FL.textMuted }}>·</span>
                      <span style={{ fontSize: '11px', color: FL.textMuted }}>{p.laboratorio}</span>
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: FL.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nombre}</p>
                    {p.concentracion && <p style={{ fontSize: '11px', color: FL.textMuted }}>{p.concentracion}{p.presentacion ? ` · ${p.presentacion}` : ''}</p>}
                  </div>

                  {/* Success toast inline */}
                  {uploadSuccess[p.id] && (
                    <span style={{
                      fontSize: '11px', color: FL.success, fontWeight: 700,
                      background: FL.success + '15', borderRadius: '8px',
                      padding: '4px 10px', flexShrink: 0, whiteSpace: 'nowrap',
                    }}>
                      Imagen subida correctamente
                    </span>
                  )}

                  {/* Buttons */}
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <button
                      onClick={() => handleSubirClick(p)}
                      disabled={!canAddMore || state === 'uploading'}
                      title={canAddMore ? 'Subir imagen' : 'Máximo 3 imágenes'}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '5px',
                        padding: '7px 12px', borderRadius: '8px', border: 'none',
                        cursor: (!canAddMore || state === 'uploading') ? 'not-allowed' : 'pointer',
                        background: !canAddMore ? '#F3F4F6' : hasFoto ? FL.success + '18' : FL.primary + '15',
                        color: !canAddMore ? FL.textMuted : hasFoto ? FL.success : FL.primary,
                        fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '12px', fontWeight: 600,
                        opacity: !canAddMore ? 0.5 : 1,
                      }}
                    >
                      {state === 'uploading'
                        ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                        : <Upload size={13} />
                      }
                      {state === 'uploading' ? 'Subiendo…' : canAddMore ? 'Subir imagen' : 'Completo'}
                    </button>

                    <button
                      onClick={() => openEdit(p)}
                      title="Editar producto"
                      style={{
                        display: 'flex', alignItems: 'center', gap: '5px',
                        padding: '7px 11px', borderRadius: '8px', border: `1.5px solid ${FL.border}`,
                        background: '#fff', cursor: 'pointer',
                        color: FL.textMuted, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '12px', fontWeight: 600,
                      }}
                    >
                      <Pencil size={13} />
                      Editar
                    </button>
                  </div>

                  {state === 'error' && (
                    <p style={{ fontSize: '10px', color: FL.danger, flexShrink: 0 }}>Error al subir</p>
                  )}
                </div>
              );
            });
          })()}
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
