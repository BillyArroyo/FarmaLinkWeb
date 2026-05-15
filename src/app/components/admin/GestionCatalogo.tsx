import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, X, Upload, ToggleLeft, ToggleRight, FlaskConical } from 'lucide-react';
import { FL, PRODUCTOS } from '../../data/farmalink';

export function GestionCatalogo() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [promoActiva, setPromoActiva] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const [buscar, setBuscar] = useState('');

  const filtrados = PRODUCTOS.filter(p =>
    p.nombre.toLowerCase().includes(buscar.toLowerCase()) ||
    p.lab.toLowerCase().includes(buscar.toLowerCase())
  );

  return (
    <div style={{ padding: '28px', position: 'relative' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p style={{ fontSize: '24px', fontWeight: 800, color: FL.text }}>Gestión de Catálogo</p>
          <p style={{ fontSize: '14px', color: FL.textMuted }}>{PRODUCTOS.length} productos registrados</p>
        </div>
        <div className="flex gap-3">
          <div style={{ background: '#fff', borderRadius: '12px', border: `1.5px solid ${FL.border}`, display: 'flex', alignItems: 'center', padding: '10px 14px', gap: '10px', minWidth: '280px', boxShadow: FL.shadow }}>
            <Search size={16} color={FL.primary} />
            <input value={buscar} onChange={e => setBuscar(e.target.value)} placeholder="Buscar producto o laboratorio..."
              style={{ background: 'none', border: 'none', outline: 'none', fontSize: '14px', color: FL.text, flex: 1, fontFamily: "'Plus Jakarta Sans', sans-serif" }} />
          </div>
          <button onClick={() => setDrawerOpen(true)}
            style={{ background: FL.gradient, borderRadius: '12px', padding: '10px 20px', color: '#fff', fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <Plus size={18} color="#fff" />
            Agregar producto
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: '18px', boxShadow: FL.shadow, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: FL.bg }}>
              {['Producto', 'Laboratorio', 'Categoría', 'Precio', 'Stock', 'Promoción', 'Acciones'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: FL.textMuted, letterSpacing: '0.5px' }}>{h.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.map((prod, i) => (
              <tr key={prod.id} style={{ borderBottom: `1px solid ${FL.border}`, background: i % 2 === 0 ? '#fff' : FL.bg + '60' }}>
                <td style={{ padding: '13px 16px' }}>
                  <div className="flex items-center gap-3">
                    <div style={{ width: '40px', height: '40px', background: prod.color + '22', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FlaskConical size={20} color={prod.color} />
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: FL.text }}>{prod.nombre}</p>
                  </div>
                </td>
                <td style={{ padding: '13px 16px', fontSize: '13px', color: FL.text }}>{prod.lab}</td>
                <td style={{ padding: '13px 16px' }}>
                  <span style={{ background: prod.color + '18', color: prod.color, borderRadius: '8px', padding: '4px 10px', fontSize: '11px', fontWeight: 700 }}>{prod.categoria}</span>
                </td>
                <td style={{ padding: '13px 16px', fontSize: '15px', fontWeight: 800, color: FL.primary }}>S/. {prod.precio.toFixed(2)}</td>
                <td style={{ padding: '13px 16px' }}>
                  <span style={{ background: prod.stock < 100 ? '#FEF9C3' : '#DCFCE7', color: prod.stock < 100 ? '#CA8A04' : '#16A34A', borderRadius: '8px', padding: '4px 10px', fontSize: '12px', fontWeight: 700 }}>
                    {prod.stock} unid.
                  </span>
                </td>
                <td style={{ padding: '13px 16px' }}>
                  {prod.promo
                    ? <span style={{ background: FL.secondary + '18', color: FL.secondary, borderRadius: '8px', padding: '4px 10px', fontSize: '11px', fontWeight: 700 }}>🎁 {prod.promo}</span>
                    : <span style={{ color: FL.textMuted, fontSize: '13px' }}>—</span>}
                </td>
                <td style={{ padding: '13px 16px' }}>
                  <div className="flex gap-2">
                    <button style={{ background: FL.primary + '12', borderRadius: '8px', padding: '7px', border: 'none', cursor: 'pointer' }}>
                      <Edit2 size={14} color={FL.primary} />
                    </button>
                    <button style={{ background: '#FEE2E2', borderRadius: '8px', padding: '7px', border: 'none', cursor: 'pointer' }}>
                      <Trash2 size={14} color="#DC2626" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Drawer */}
      {drawerOpen && (
        <>
          <div onClick={() => setDrawerOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }} />
          <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: '420px', background: '#fff', boxShadow: '-8px 0 40px rgba(0,0,0,0.15)', zIndex: 50, overflow: 'y-auto', display: 'flex', flexDirection: 'column' }}>
            {/* Drawer header */}
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${FL.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '18px', fontWeight: 800, color: FL.text }}>Agregar producto</p>
                <p style={{ fontSize: '12px', color: FL.textMuted }}>Completa la información del nuevo producto</p>
              </div>
              <button onClick={() => setDrawerOpen(false)} style={{ background: FL.bg, borderRadius: '10px', padding: '8px', border: 'none', cursor: 'pointer' }}>
                <X size={18} color={FL.textMuted} />
              </button>
            </div>

            <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>
              {/* Drag & drop */}
              <div onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={() => setDragOver(false)}
                style={{ border: `2px dashed ${dragOver ? FL.primary : FL.border}`, borderRadius: '14px', padding: '28px', textAlign: 'center', marginBottom: '20px', background: dragOver ? FL.primary + '05' : FL.bg, transition: 'all 0.2s', cursor: 'pointer' }}>
                <Upload size={28} color={dragOver ? FL.primary : FL.textMuted} style={{ margin: '0 auto 10px' }} />
                <p style={{ fontSize: '13px', fontWeight: 700, color: dragOver ? FL.primary : FL.text }}>Arrastra la foto del producto aquí</p>
                <p style={{ fontSize: '12px', color: FL.textMuted, marginTop: '4px' }}>o haz clic para seleccionar · PNG, JPG, WEBP</p>
              </div>

              {/* Form */}
              {[
                { label: 'NOMBRE DEL PRODUCTO', placeholder: 'Ej: Amoxicilina 500mg' },
                { label: 'LABORATORIO', placeholder: 'Ej: Genfar' },
                { label: 'CATEGORÍA', placeholder: 'Ej: Antibióticos' },
                { label: 'CÓDIGO / SKU', placeholder: 'Ej: ANT-001' },
              ].map(field => (
                <div key={field.label} style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: FL.textMuted, display: 'block', marginBottom: '6px' }}>{field.label}</label>
                  <input placeholder={field.placeholder}
                    style={{ width: '100%', background: FL.bg, borderRadius: '10px', border: `1.5px solid ${FL.border}`, padding: '11px 14px', fontSize: '14px', color: FL.text, outline: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif", boxSizing: 'border-box' }} />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[{ label: 'PRECIO S/.', placeholder: '0.00' }, { label: 'STOCK INICIAL', placeholder: '0' }].map(f => (
                  <div key={f.label}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: FL.textMuted, display: 'block', marginBottom: '6px' }}>{f.label}</label>
                    <input placeholder={f.placeholder} type="number"
                      style={{ width: '100%', background: FL.bg, borderRadius: '10px', border: `1.5px solid ${FL.border}`, padding: '11px 14px', fontSize: '14px', color: FL.text, outline: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif", boxSizing: 'border-box' }} />
                  </div>
                ))}
              </div>

              {/* Promo toggle */}
              <div style={{ background: FL.bg, borderRadius: '14px', padding: '14px 16px', border: `1.5px solid ${FL.border}` }}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: FL.text }}>Promoción activa</p>
                    <p style={{ fontSize: '12px', color: FL.textMuted }}>Compra X lleva Y gratis</p>
                  </div>
                  <button onClick={() => setPromoActiva(!promoActiva)}>
                    {promoActiva ? <ToggleRight size={32} color={FL.secondary} /> : <ToggleLeft size={32} color="#D1D5DB" />}
                  </button>
                </div>
                {promoActiva && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: FL.textMuted, display: 'block', marginBottom: '6px' }}>COMPRA (X)</label>
                      <input defaultValue="12" type="number"
                        style={{ width: '100%', background: '#fff', borderRadius: '10px', border: `1.5px solid ${FL.secondary}`, padding: '10px 14px', fontSize: '14px', color: FL.text, outline: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif", boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: FL.textMuted, display: 'block', marginBottom: '6px' }}>LLEVA GRATIS (Y)</label>
                      <input defaultValue="1" type="number"
                        style={{ width: '100%', background: '#fff', borderRadius: '10px', border: `1.5px solid ${FL.secondary}`, padding: '10px 14px', fontSize: '14px', color: FL.text, outline: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif", boxSizing: 'border-box' }} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div style={{ padding: '20px 24px', borderTop: `1px solid ${FL.border}`, display: 'flex', gap: '12px' }}>
              <button onClick={() => setDrawerOpen(false)} style={{ flex: 1, background: FL.bg, border: `1.5px solid ${FL.border}`, borderRadius: '12px', padding: '13px', fontSize: '14px', fontWeight: 700, color: FL.text, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Cancelar
              </button>
              <button style={{ flex: 2, background: FL.gradient, borderRadius: '12px', padding: '13px', fontSize: '14px', fontWeight: 700, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                ✓ Guardar producto
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
