import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2, Download } from 'lucide-react';
import { FL } from '../../app/data/farmalink';
import { supabase } from '../../lib/supabase';

interface RawRow {
  PRODUCTO?: unknown;
  LABORATORIO?: unknown;
  'PRECIO CONTADO'?: unknown;
  'PRECIO CREDITO'?: unknown;
  OFERTAS?: unknown;
  'FECHA VENCIMIENTO'?: unknown;
  [key: string]: unknown;
}

function parseName(raw: string): { nombre: string; concentracion: string; presentacion: string } {
  const str = raw.trim().toUpperCase();
  const concRx = /\b(\d+(?:[.,]\d+)?\s*(?:MG\/ML|MCG\/ML|MG\/5ML|MG|MCG|ML|G|UI|IU|%))\b/i;
  const presRx = /X?\s*(\d+)\s*(TABLETAS?|TABS?|C[AÁ]PSULAS?|CAPS?|AMPOLLAS?|AMPS?|SOBRES?|SUPOSITORIOS?|COMPRIMIDOS?|COMP|GRAGEAS?|SACHETS?)\b/i;

  let nombre = str;
  let concentracion = '';
  let presentacion = '';

  const concMatch = str.match(concRx);
  if (concMatch && concMatch.index !== undefined) {
    concentracion = concMatch[0].trim();
    nombre = str.substring(0, concMatch.index).trim();
  }

  const presMatch = str.match(presRx);
  if (presMatch) {
    const qty = presMatch[1];
    const unit = presMatch[2].toUpperCase();
    const unitMap: Record<string, string> = {
      TABLETA: 'tabletas', TABLETAS: 'tabletas', TAB: 'tabletas', TABS: 'tabletas',
      CÁPSULA: 'cápsulas', CÁPSULAS: 'cápsulas', CAPSULA: 'cápsulas', CAPSULAS: 'cápsulas',
      CAP: 'cápsulas', CAPS: 'cápsulas',
      AMPOLLA: 'ampollas', AMPOLLAS: 'ampollas', AMP: 'ampollas', AMPS: 'ampollas',
      SOBRE: 'sobres', SOBRES: 'sobres',
      SUPOSITORIO: 'supositorios', SUPOSITORIOS: 'supositorios',
      COMPRIMIDO: 'comprimidos', COMPRIMIDOS: 'comprimidos', COMP: 'comprimidos',
      GRAGEA: 'grageas', GRAGEAS: 'grageas',
      SACHET: 'sachets', SACHETS: 'sachets',
    };
    presentacion = `Caja x ${qty} ${unitMap[unit] || unit.toLowerCase()}`;
  } else if (/JARABE|SYRUP/i.test(str)) {
    const ml = str.match(/(\d+)\s*ML/i);
    presentacion = ml ? `Frasco ${ml[1]}ml jarabe` : 'Frasco jarabe';
  } else if (/SUSPENSION/i.test(str)) {
    presentacion = 'Frasco suspensión';
  } else if (/SOLUCION|SOL\b/i.test(str)) {
    presentacion = 'Frasco solución';
  } else if (/CREMA|CREAM/i.test(str)) {
    presentacion = 'Tubo crema';
  } else if (/\bGEL\b/i.test(str)) {
    presentacion = 'Tubo gel';
  } else if (/GOTAS|DROPS/i.test(str)) {
    presentacion = 'Frasco gotas';
  } else if (/INYECTABLE|INY\b/i.test(str)) {
    presentacion = 'Ampolla inyectable';
  } else if (/TAB|COMP/i.test(str)) {
    presentacion = 'Caja x tabletas';
  } else if (/CAP/i.test(str)) {
    presentacion = 'Caja x cápsulas';
  } else {
    presentacion = 'Unidad';
  }

  return { nombre: nombre || str, concentracion, presentacion };
}

function parsePrice(val: unknown): number | null {
  if (val === null || val === undefined || val === '') return null;
  const n = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.,]/g, '').replace(',', '.'));
  return isNaN(n) ? null : n;
}

function parseFecha(val: unknown): string | null {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'number') {
    const d = new Date(Math.round((val - 25569) * 86400 * 1000));
    return `${d.getMonth() + 1}/${d.getFullYear()}`;
  }
  return String(val).trim() || null;
}

function padId(n: number) {
  return `CF-${String(n).padStart(5, '0')}`;
}

type Status = 'idle' | 'loading' | 'success' | 'error';

export function ImportarExcel() {
  const [status, setStatus] = useState<Status>('idle');
  const [fileName, setFileName] = useState('');
  const [count, setCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [exportando, setExportando] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setStatus('loading');
    setFileName(file.name);
    setErrorMsg('');

    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<RawRow>(ws, { defval: '' });

      if (rows.length === 0) throw new Error('El archivo no contiene datos.');

      // Fetch all existing for persistent ID lookup
      const { data: existing, error: fetchError } = await supabase
        .from('productos')
        .select('id, nombre_completo, laboratorio');
      if (fetchError) throw new Error(fetchError.message);

      // Build lookup: "PRODUCTO_UPPER|LAB_UPPER" → id
      const idMap = new Map<string, string>();
      const usedNums = new Set<number>();

      for (const p of existing || []) {
        const key = `${String(p.nombre_completo || '').toUpperCase()}|${String(p.laboratorio || '').toUpperCase()}`;
        idMap.set(key, p.id as string);
        const n = parseInt((p.id as string).replace('CF-', ''));
        if (!isNaN(n)) usedNums.add(n);
      }

      // Returns next unused number and marks it as used
      function claimNextId(): string {
        let n = 1;
        while (usedNums.has(n)) n++;
        usedNums.add(n);
        return padId(n);
      }

      const productos = rows
        .filter(r => r.PRODUCTO && String(r.PRODUCTO).trim())
        .map(r => {
          const rawNombre = String(r.PRODUCTO).trim();
          const rawLab = String(r.LABORATORIO || '').trim().toUpperCase() || 'SIN LABORATORIO';
          const { nombre, concentracion, presentacion } = parseName(rawNombre);

          const lookupKey = `${rawNombre.toUpperCase()}|${rawLab}`;
          const existingId = idMap.get(lookupKey);
          const id = existingId || claimNextId();

          return {
            id,
            nombre,
            nombre_completo: rawNombre,
            concentracion: concentracion || null,
            presentacion: presentacion || null,
            laboratorio: rawLab,
            precio_contado: parsePrice(r['PRECIO CONTADO']),
            precio_credito: parsePrice(r['PRECIO CREDITO']),
            oferta: String(r.OFERTAS || '').trim() || null,
            fecha_vencimiento: parseFecha(r['FECHA VENCIMIENTO']),
            imagen_nombre: `${id}.png`,
            activo: true,
          };
        });

      if (productos.length === 0) throw new Error('No se encontraron productos válidos en el archivo.');

      for (let i = 0; i < productos.length; i += 100) {
        const { error } = await supabase
          .from('productos')
          .upsert(productos.slice(i, i + 100), { onConflict: 'id' });
        if (error) throw new Error(error.message);
      }

      setCount(productos.length);
      setStatus('success');
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Error desconocido');
      setStatus('error');
    }
  }

  async function exportarExcel() {
    setExportando(true);
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('id, nombre_completo, nombre, laboratorio, precio_contado, precio_credito, oferta, fecha_vencimiento, imagenes_urls, imagen_cargada')
        .order('id');
      if (error) throw error;
      if (!data || data.length === 0) return;

      const filas = data.map(p => ({
        'ID': p.id,
        'PRODUCTO': p.nombre_completo || p.nombre,
        'LABORATORIO': p.laboratorio,
        'PRECIO CONTADO': p.precio_contado ?? '',
        'PRECIO CREDITO': p.precio_credito ?? '',
        'OFERTAS': p.oferta ?? '',
        'FECHA VENCIMIENTO': p.fecha_vencimiento ?? '',
        'IMAGEN_1': (p.imagenes_urls?.length ?? 0) >= 1 ? `${p.id}_1.png` : '',
        'IMAGEN_2': (p.imagenes_urls?.length ?? 0) >= 2 ? `${p.id}_2.png` : '',
        'IMAGEN_3': (p.imagenes_urls?.length ?? 0) >= 3 ? `${p.id}_3.png` : '',
        'TIENE_IMAGEN': p.imagen_cargada ? 'SI' : 'NO',
      }));

      const ws = XLSX.utils.json_to_sheet(filas);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Productos');
      XLSX.writeFile(wb, `productos_farmalink_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (e) {
      console.error('Error exportando:', e);
    } finally {
      setExportando(false);
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    e.target.value = '';
  }

  const COLS_HINT = ['PRODUCTO', 'LABORATORIO', 'PRECIO CONTADO', 'PRECIO CREDITO', 'OFERTAS', 'FECHA VENCIMIENTO'];
  const EXAMPLE = ['AMOXICILINA 500MG X 20 TAB', 'GENFAR', '12.50', '14.00', '3x2', '12/2026'];

  return (
    <div style={{ padding: '32px', maxWidth: '720px', margin: '0 auto', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: FL.text, marginBottom: '4px' }}>
            Importar Productos desde Excel
          </h1>
          <p style={{ fontSize: '14px', color: FL.textMuted }}>
            IDs persistentes: mismo PRODUCTO + LABORATORIO conserva su CF-00001
          </p>
        </div>
        <button
          onClick={exportarExcel}
          disabled={exportando}
          style={{
            display: 'flex', alignItems: 'center', gap: '7px', flexShrink: 0,
            padding: '9px 16px', borderRadius: '10px',
            border: `1.5px solid ${FL.border}`,
            background: '#fff', cursor: exportando ? 'not-allowed' : 'pointer',
            fontSize: '13px', fontWeight: 600, color: FL.text,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          {exportando
            ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
            : <Download size={14} color={FL.primary} />
          }
          Exportar Excel
        </button>
      </div>

      {/* Drop zone */}
      <div
        onClick={() => { if (status !== 'loading') inputRef.current?.click(); }}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f && status !== 'loading') handleFile(f); }}
        style={{
          border: `2px dashed ${status === 'success' ? FL.success : status === 'error' ? FL.danger : FL.primary}`,
          borderRadius: '16px',
          padding: '48px 24px',
          textAlign: 'center',
          cursor: status === 'loading' ? 'default' : 'pointer',
          background: status === 'success' ? '#F0FFF4' : status === 'error' ? '#FFF5F5' : FL.bg,
          transition: 'all 0.2s',
          marginBottom: '24px',
        }}
      >
        <input ref={inputRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={onFileChange} />

        {status === 'loading' && (
          <>
            <Loader2 size={48} color={FL.primary} style={{ margin: '0 auto 16px', display: 'block', animation: 'spin 1s linear infinite' }} />
            <p style={{ fontSize: '16px', fontWeight: 700, color: FL.text }}>Procesando {fileName}…</p>
            <p style={{ fontSize: '13px', color: FL.textMuted, marginTop: '6px' }}>Verificando IDs existentes y subiendo a Supabase</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 size={48} color={FL.success} style={{ margin: '0 auto 16px', display: 'block' }} />
            <p style={{ fontSize: '20px', fontWeight: 800, color: FL.success }}>{count} productos procesados</p>
            <p style={{ fontSize: '13px', color: FL.textMuted, marginTop: '4px' }}>{fileName}</p>
            <button
              onClick={e => { e.stopPropagation(); exportarExcel(); }}
              disabled={exportando}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '20px',
                padding: '10px 24px', borderRadius: '12px', border: 'none',
                background: FL.gradient, cursor: 'pointer',
                fontSize: '14px', fontWeight: 700, color: '#fff',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              <Download size={16} />
              {exportando ? 'Exportando…' : 'Exportar Excel con IDs'}
            </button>
            <p style={{ fontSize: '12px', color: FL.textMuted, marginTop: '16px' }}>Click fuera del botón para importar otro archivo</p>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle size={48} color={FL.danger} style={{ margin: '0 auto 16px', display: 'block' }} />
            <p style={{ fontSize: '16px', fontWeight: 700, color: FL.danger }}>Error al importar</p>
            <p style={{ fontSize: '13px', color: FL.textMuted, marginTop: '6px' }}>{errorMsg}</p>
            <p style={{ fontSize: '12px', color: FL.textMuted, marginTop: '20px' }}>Click para intentar de nuevo</p>
          </>
        )}

        {status === 'idle' && (
          <>
            <div style={{ width: '72px', height: '72px', background: FL.primary + '15', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <FileSpreadsheet size={36} color={FL.primary} />
            </div>
            <p style={{ fontSize: '16px', fontWeight: 700, color: FL.text }}>Arrastra tu Excel aquí</p>
            <p style={{ fontSize: '13px', color: FL.textMuted, marginTop: '6px' }}>o haz click para seleccionar</p>
            <div style={{ marginTop: '20px', display: 'inline-flex', alignItems: 'center', gap: '8px', background: FL.gradient, borderRadius: '12px', padding: '10px 24px' }}>
              <Upload size={16} color="#fff" />
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>Subir Excel (.xlsx)</span>
            </div>
          </>
        )}
      </div>

      {/* Export columns info */}
      {status === 'success' && (
        <div style={{ background: FL.primary + '08', borderRadius: '12px', padding: '14px 18px', border: `1px solid ${FL.primary}20`, marginBottom: '20px' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: FL.primary, marginBottom: '6px' }}>El Excel exportado incluye:</p>
          <p style={{ fontSize: '12px', color: FL.textMuted, lineHeight: 1.6 }}>
            ID · PRODUCTO · LABORATORIO · PRECIO CONTADO · PRECIO CREDITO · OFERTAS · FECHA VENCIMIENTO · <strong>IMAGEN_1</strong> · <strong>IMAGEN_2</strong> · <strong>IMAGEN_3</strong> · <strong>TIENE_IMAGEN</strong>
          </p>
        </div>
      )}

      {/* Format hint */}
      <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: `1px solid ${FL.border}` }}>
        <p style={{ fontSize: '12px', fontWeight: 700, color: FL.text, marginBottom: '12px' }}>Formato del Excel (primera fila = encabezados):</p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
            <thead>
              <tr>
                {COLS_HINT.map(col => (
                  <th key={col} style={{ padding: '6px 10px', textAlign: 'left', color: FL.primary, fontWeight: 700, whiteSpace: 'nowrap', background: FL.primary + '12', borderRight: `1px solid ${FL.border}` }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {EXAMPLE.map((v, i) => (
                  <td key={i} style={{ padding: '6px 10px', color: FL.textMuted, borderRight: `1px solid ${FL.border}`, borderTop: `1px solid ${FL.border}` }}>
                    {v}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: '11px', color: FL.textMuted, marginTop: '12px' }}>
          Si PRODUCTO + LABORATORIO ya existen en Supabase, conservan su ID. Los productos nuevos reciben el siguiente ID disponible.
        </p>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
