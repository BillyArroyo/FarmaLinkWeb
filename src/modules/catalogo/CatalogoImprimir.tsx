import { useState, useEffect } from 'react';
import { Printer, Loader2 } from 'lucide-react';
import { FL } from '../../app/data/farmalink';
import { supabase } from '../../lib/supabase';

// ── Types ──────────────────────────────────────────────────────────────────
interface ProductoImprimir {
  id: string;
  nombre: string;
  concentracion: string | null;
  presentacion: string | null;
  laboratorio: string;
  precio_contado: number | null;
  imagenes_urls: string[] | null;
}

type Modo = 'horizontal' | 'vertical';

// ── Design tokens ──────────────────────────────────────────────────────────
const C = {
  blue:    '#2D3E9F',
  cyan:    '#2BC8E8',
  teal:    '#16C5A3',
  green:   '#1BC7A6',
  purple:  '#6E5BFF',
  bg:      '#F8FAFC',
  grad:    'linear-gradient(135deg, #2BC8E8 0%, #16C5A3 50%, #2D3E9F 100%)',
  badge:   'linear-gradient(180deg, #28D0C0 0%, #1EA5D8 100%)',
  navy:    '#1A2535',
} as const;

const FONT = "'Poppins', sans-serif";

const CFG = {
  vertical:   { perPage: 9, cols: 3, orient: 'portrait',  pageW: '210mm', pageH: '297mm' },
  horizontal: { perPage: 4, cols: 4, orient: 'landscape', pageW: '297mm', pageH: '210mm' },
} as const;

// ── Helpers ────────────────────────────────────────────────────────────────
function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function buildPages(productos: ProductoImprimir[], perPage: number) {
  const byLab: Record<string, ProductoImprimir[]> = {};
  for (const p of productos) {
    const lab = (p.laboratorio || 'SIN LABORATORIO').trim();
    if (!byLab[lab]) byLab[lab] = [];
    byLab[lab].push(p);
  }
  const pages: Array<{ lab: string; items: ProductoImprimir[]; pageNum: number }> = [];
  let n = 0;
  for (const lab of Object.keys(byLab).sort()) {
    for (const items of chunk(byLab[lab], perPage)) {
      pages.push({ lab, items, pageNum: ++n });
    }
  }
  return { pages, total: n };
}

// ── SVG Icons ──────────────────────────────────────────────────────────────
function BoxSvg({ size = 12 }: { size?: number }) {
  return (
    <svg viewBox="0 0 14 14" width={size} height={size} fill="none" style={{ flexShrink: 0 }}>
      <rect x="1" y="5" width="12" height="8" rx="1.5" stroke="#9CA3AF" strokeWidth="1.2" />
      <path d="M1 6.5h12M5 1.5h4l1 3H4L5 1.5z" stroke="#9CA3AF" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

function PhoneSvg() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
      <path d="M5.5 3.5h3.5l2 5-2.5 1.5a11 11 0 005 5l1.5-2.5 5 2v3.5c-9 1-16-6-14.5-14.5z"
        stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function WhatsAppSvg() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="white">
      <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.38 5.08L2 22l5.05-1.32A9.93 9.93 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm4.59 13.17c-.21.56-1.04 1.07-1.71 1.2-.45.09-1.03.17-3-.62-2.53-1-4.16-3.6-4.29-3.77-.12-.17-1.03-1.37-1.03-2.61 0-1.25.66-1.87.9-2.13.23-.26.5-.32.67-.32H8l.52 1.25-.81 2.02s.66 1.25 2.22 2.37c1 .72 2.02 1.07 2.02 1.07l1.65-.7 1.25.52-.01.12c-.06.21-.31.66-.56.91z" />
    </svg>
  );
}

// ── Product type detection ─────────────────────────────────────────────────
type ProductType = 'tableta' | 'capsula' | 'jarabe' | 'ampolla' | 'crema' | 'inhalador';

function detectTipo(nombre: string, presentacion: string | null): ProductType {
  const txt = (nombre + ' ' + (presentacion ?? '')).toLowerCase();
  if (/inhalad|aerosol|inhaler/.test(txt)) return 'inhalador';
  if (/ampollas?|inyect|vial|\bim\b|\biv\b|parenteral/.test(txt)) return 'ampolla';
  if (/crema|gel|ungüento|pomada|loción|bálsamo/.test(txt)) return 'crema';
  if (/jarabe|susp|suspensión|frasco|gotas|sol\./.test(txt)) return 'jarabe';
  if (/cápsulas?|\bcap\b/.test(txt)) return 'capsula';
  return 'tableta';
}

function ProductPlaceholder({ nombre, presentacion, size }: { nombre: string; presentacion: string | null; size: number }) {
  const tipo = detectTipo(nombre, presentacion);
  const s = size;
  if (tipo === 'tableta') {
    return (
      <svg viewBox="0 0 64 28" width={s} height={Math.round(s * 0.44)} fill="none">
        <ellipse cx="32" cy="14" rx="30" ry="12" fill={C.cyan} fillOpacity={0.2} stroke={C.teal} strokeWidth="1.5"/>
        <path d="M2 14 A30 12 0 0 1 62 14" fill={C.teal} fillOpacity={0.2}/>
        <line x1="2" y1="14" x2="62" y2="14" stroke={C.teal} strokeWidth="1.2" strokeDasharray="5 3"/>
      </svg>
    );
  }
  if (tipo === 'capsula') {
    return (
      <svg viewBox="0 0 80 32" width={s} height={Math.round(s * 0.4)} fill="none">
        <rect x="1" y="1" width="78" height="30" rx="15" fill="none" stroke={C.teal} strokeWidth="1.5"/>
        <line x1="40" y1="1" x2="40" y2="31" stroke={C.teal} strokeWidth="1.2"/>
        <rect x="1" y="1" width="39" height="30" rx="15" fill={C.teal} fillOpacity={0.3}/>
        <rect x="40" y="1" width="39" height="30" rx="15" fill={C.cyan} fillOpacity={0.2}/>
      </svg>
    );
  }
  if (tipo === 'jarabe') {
    return (
      <svg viewBox="0 0 36 52" width={Math.round(s * 0.69)} height={s} fill="none">
        <rect x="13" y="1" width="10" height="7" rx="2" fill={C.teal} fillOpacity={0.5}/>
        <path d="M9 8 L27 8 L30 14 L30 46 Q30 51 25 51 L11 51 Q6 51 6 46 L6 14 Z" fill={C.cyan} fillOpacity={0.18} stroke={C.teal} strokeWidth="1.5"/>
        <rect x="7" y="30" width="22" height="16" rx="3" fill={C.teal} fillOpacity={0.2}/>
        <line x1="13" y1="20" x2="23" y2="20" stroke={C.teal} strokeWidth="1" strokeDasharray="3 2"/>
        <line x1="13" y1="24" x2="23" y2="24" stroke={C.teal} strokeWidth="1" strokeDasharray="3 2"/>
      </svg>
    );
  }
  if (tipo === 'ampolla') {
    return (
      <svg viewBox="0 0 64 20" width={s} height={Math.round(s * 0.31)} fill="none">
        <line x1="1" y1="10" x2="10" y2="10" stroke={C.teal} strokeWidth="1.5"/>
        <rect x="10" y="3" width="42" height="14" rx="4" fill={C.cyan} fillOpacity={0.2} stroke={C.teal} strokeWidth="1.5"/>
        <rect x="52" y="1" width="5" height="18" rx="2" fill={C.teal} fillOpacity={0.45}/>
        <rect x="12" y="5" width="20" height="10" rx="3" fill={C.teal} fillOpacity={0.22}/>
      </svg>
    );
  }
  if (tipo === 'crema') {
    return (
      <svg viewBox="0 0 72 24" width={s} height={Math.round(s * 0.33)} fill="none">
        <rect x="1" y="6" width="11" height="12" rx="3" fill={C.teal} fillOpacity={0.5}/>
        <path d="M12 3 L62 3 Q69 3 69 12 Q69 21 62 21 L12 21 Z" fill={C.cyan} fillOpacity={0.2} stroke={C.teal} strokeWidth="1.5"/>
        <path d="M62 3 L67 3 Q69 5 69 12 Q69 19 67 21 L62 21 Z" fill={C.teal} fillOpacity={0.35}/>
      </svg>
    );
  }
  // inhalador
  return (
    <svg viewBox="0 0 26 48" width={Math.round(s * 0.54)} height={s} fill="none">
      <rect x="7" y="1" width="12" height="28" rx="5" fill={C.cyan} fillOpacity={0.2} stroke={C.teal} strokeWidth="1.5"/>
      <rect x="9" y="0" width="8" height="4" rx="2" fill={C.teal} fillOpacity={0.5}/>
      <path d="M4 29 Q2 32 2 36 L2 43 Q2 47 7 47 L19 47 Q24 47 24 43 L24 36 Q24 32 22 29 L4 29 Z" fill={C.teal} fillOpacity={0.25} stroke={C.teal} strokeWidth="1.5"/>
      <rect x="10" y="32" width="6" height="10" rx="2" fill={C.teal} fillOpacity={0.4}/>
    </svg>
  );
}

// ── Product Card ───────────────────────────────────────────────────────────
function ProductCard({ p, num, modo }: { p: ProductoImprimir; num: number; modo: Modo }) {
  const [imgError, setImgError] = useState(false);
  const imgUrl = `https://xbjniegnmwqzrrmwfimz.supabase.co/storage/v1/object/public/imagenes-productos/${p.id}_1.png`;
  const isH = modo === 'horizontal';
  const imgH = isH ? 120 : 85;

  return (
    <div style={{
      borderRadius: '28px',
      background: '#ffffff',
      boxShadow: '0 8px 30px rgba(0,0,0,0.05)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
      height: '100%',
      boxSizing: 'border-box',
      border: '1px solid rgba(43,200,232,0.12)',
    }}>
      {/* ── Number badge ── */}
      <div style={{
        position: 'absolute', top: '10px', left: '10px',
        minWidth: '28px', height: '28px',
        background: C.badge,
        borderRadius: '12px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 2, padding: '0 7px',
        boxShadow: '0 4px 10px rgba(30,165,216,0.35)',
      }}>
        <span style={{ color: '#fff', fontSize: '11px', fontWeight: 700, lineHeight: 1, fontFamily: FONT }}>
          {String(num).padStart(2, '0')}
        </span>
      </div>

      {/* ── Image area — FIXED HEIGHT ── */}
      <div style={{
        height: `${imgH}px`,
        flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '10px 8px',
        background: imgError ? `linear-gradient(135deg, rgba(43,200,232,0.08) 0%, rgba(22,197,163,0.12) 100%)` : 'transparent',
      }}>
        {!imgError ? (
          <img
            src={imgUrl}
            alt={p.nombre}
            onError={() => setImgError(true)}
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
          />
        ) : (
          <ProductPlaceholder nombre={p.nombre} presentacion={p.presentacion} size={isH ? 72 : 52} />
        )}
      </div>

      {/* ── Info — fills remaining height with price pinned to bottom ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: isH ? '0 16px 14px' : '0 11px 10px',
        minHeight: 0,
      }}>
        {/* Name — max 2 lines */}
        <p style={{
          fontSize: isH ? '13px' : '10px',
          fontWeight: 700,
          color: C.blue,
          lineHeight: 1.3,
          marginBottom: '3px',
          fontFamily: FONT,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          flexShrink: 0,
        }}>
          {p.nombre}
        </p>

        {/* Concentration — max 1 line */}
        <p style={{
          fontSize: isH ? '11px' : '9px',
          fontWeight: 600,
          color: C.teal,
          lineHeight: 1.2,
          flexShrink: 0,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          fontFamily: FONT,
          minHeight: isH ? '14px' : '11px',
          marginBottom: '4px',
        }}>
          {p.concentracion ?? ''}
        </p>

        <div style={{ borderTop: '1.5px dashed rgba(43,200,232,0.35)', flexShrink: 0 }} />

        {/* Presentation — max 1 line */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0, overflow: 'hidden', padding: '4px 0' }}>
          <BoxSvg size={isH ? 11 : 9} />
          <span style={{
            fontSize: isH ? '10px' : '8.5px',
            color: '#9CA3AF',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontFamily: FONT,
          }}>
            {p.presentacion ?? '—'}
          </span>
        </div>

        <div style={{ borderTop: '1.5px dashed rgba(43,200,232,0.35)', flexShrink: 0 }} />

        {/* Price — always pinned to bottom */}
        <div style={{ marginTop: 'auto', paddingTop: '5px', flexShrink: 0 }}>
          {p.precio_contado != null ? (
            <p style={{
              fontSize: isH ? '24px' : '18px',
              fontWeight: 700,
              color: C.green,
              lineHeight: 1,
              fontFamily: FONT,
            }}>
              S/ {p.precio_contado.toFixed(2)}
            </p>
          ) : (
            <p style={{ fontSize: '9px', color: '#D1D5DB', fontFamily: FONT }}>Sin precio</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page Header ────────────────────────────────────────────────────────────
function PageHeader({ pageNum }: { pageNum: number }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0,
      paddingBottom: '8px',
    }}>
      {/* Left: Logo + Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ background: 'white', borderRadius: '8px', padding: '4px 8px', flexShrink: 0 }}>
          <img src="/logocannanfarma.png" alt="Canaán Farma" style={{ height: '40px', width: 'auto', objectFit: 'contain', display: 'block' }} />
        </div>
        <div>
          <p style={{ fontSize: '14px', fontWeight: 700, color: C.blue, lineHeight: 1.1, letterSpacing: '0.3px', fontFamily: FONT }}>
            CANAÁN FARMA
          </p>
          <p style={{ fontSize: '7px', fontWeight: 600, color: '#9CA3AF', letterSpacing: '1.5px', marginTop: '2px', fontFamily: FONT }}>
            DISTRIBUIDOR IMPORTADOR
          </p>
        </div>
      </div>

      {/* Center: Title */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginBottom: '3px' }}>
          <div style={{ width: '24px', height: '2px', background: C.grad, borderRadius: '1px' }} />
          <p style={{ fontSize: '12px', fontWeight: 700, color: C.blue, letterSpacing: '0.5px', fontFamily: FONT }}>
            CATÁLOGO DE BENEFICIOS
          </p>
          <div style={{ width: '24px', height: '2px', background: C.grad, borderRadius: '1px' }} />
        </div>
        <p style={{ fontSize: '9px', fontWeight: 600, color: C.teal, letterSpacing: '0.5px', fontFamily: FONT }}>
          EDICIÓN 2026
        </p>
      </div>

      {/* Right: Page badge */}
      <div style={{
        width: '46px', height: '46px',
        background: C.grad,
        borderRadius: '14px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 4px 14px rgba(43,200,232,0.30)',
      }}>
        <span style={{ color: '#fff', fontSize: '18px', fontWeight: 700, lineHeight: 1, fontFamily: FONT }}>
          {String(pageNum).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}

// ── Lab Section ────────────────────────────────────────────────────────────
function LabSection({ lab }: { lab: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, padding: '4px 0 6px' }}>
      {/* Gradient accent line left */}
      <div style={{ width: '4px', height: '44px', background: C.grad, borderRadius: '4px', flexShrink: 0 }} />

      {/* Lab name */}
      <div>
        <p style={{ fontSize: '22px', fontWeight: 700, color: C.blue, lineHeight: 1, letterSpacing: '0.2px', fontFamily: FONT }}>
          {lab}
        </p>
        <p style={{ fontSize: '9px', color: C.teal, fontWeight: 600, letterSpacing: '1.2px', marginTop: '2px', fontFamily: FONT }}>
          LABORATORIOS
        </p>
      </div>

      {/* Fading gradient line */}
      <div style={{ flex: 1, height: '2px', background: `linear-gradient(to right, rgba(43,200,232,0.4), transparent)` }} />
    </div>
  );
}

// ── Footer ─────────────────────────────────────────────────────────────────
function PageFooter() {
  return (
    <div style={{
      background: C.navy,
      borderRadius: '16px',
      padding: '10px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '34px', height: '34px',
          background: 'rgba(255,255,255,0.10)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <PhoneSvg />
        </div>
        <div>
          <p style={{ color: '#fff', fontSize: '10px', fontWeight: 600, lineHeight: 1.3, fontFamily: FONT }}>
            ¿Necesitas más información?
          </p>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '8px', lineHeight: 1.3, fontFamily: FONT }}>
            Comunícate con nosotros
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '34px', height: '34px',
          background: '#25D366',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <WhatsAppSvg />
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '8px', lineHeight: 1.3, fontFamily: FONT }}>
            Línea de atención
          </p>
          <p style={{ color: '#fff', fontSize: '15px', fontWeight: 700, lineHeight: 1.3, letterSpacing: '0.5px', fontFamily: FONT }}>
            999 999 999
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Catalog Page ───────────────────────────────────────────────────────────
function CatalogoPage({ lab, items, pageNum, total, modo }: {
  lab: string; items: ProductoImprimir[]; pageNum: number; total: number; modo: Modo;
}) {
  const cfg = CFG[modo];
  const isH = modo === 'horizontal';
  const bgImg = modo === 'vertical' ? '/fondoverticalcatalogos.png' : '/fondohorizontalcatalogos.png';

  return (
    <div
      className="catalogo-page"
      style={{
        width: cfg.pageW,
        height: cfg.pageH,
        backgroundImage: `url('${bgImg}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '12mm',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: isH ? '10px' : '8px',
        fontFamily: FONT,
        margin: '0 auto',
        boxShadow: '0 8px 40px rgba(0,0,0,0.13)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <PageHeader pageNum={pageNum} />
      <LabSection lab={lab} />

      {/* ── Product grid ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cfg.cols}, 1fr)`,
        gridTemplateRows: isH ? '1fr' : 'repeat(3, 1fr)',
        gap: isH ? '10px' : '7px',
        flex: 1,
        minHeight: 0,
        alignItems: 'stretch',
      }}>
        {items.map((p, i) => (
          <ProductCard key={p.id} p={p} num={i + 1} modo={modo} />
        ))}
        {items.length < cfg.perPage &&
          Array.from({ length: cfg.perPage - items.length }).map((_, i) => (
            <div key={`filler-${i}`} style={{ visibility: 'hidden' }} />
          ))
        }
      </div>

      {/* ── Footer ── */}
      {!isH ? (
        <PageFooter />
      ) : (
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderTop: `1px solid rgba(43,200,232,0.15)`, paddingTop: '4px', flexShrink: 0,
        }}>
          <p style={{ fontSize: '7px', color: '#9CA3AF', letterSpacing: '0.3px', fontFamily: FONT }}>
            Precios sujetos a cambio sin previo aviso · Vigente hasta agotar stock
          </p>
          <p style={{ fontSize: '7px', color: '#9CA3AF', fontFamily: FONT }}>Pág. {pageNum} / {total}</p>
        </div>
      )}
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────
export function CatalogoImprimir() {
  const [modo, setModo] = useState<Modo>('vertical');
  const [productos, setProductos] = useState<ProductoImprimir[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('productos')
      .select('id, nombre, concentracion, presentacion, laboratorio, precio_contado, imagenes_urls')
      .eq('activo', true)
      .order('laboratorio')
      .order('nombre')
      .then(({ data, error }) => {
        if (error) console.error('Error cargando catálogo:', error.message);
        if (data) setProductos(data as ProductoImprimir[]);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const id = 'catalogo-page-css';
    document.getElementById(id)?.remove();
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      @media print {
        /* ── Ocultar todo salvo el catálogo (técnica visibility) ── */
        body, body * { visibility: hidden !important; }
        .catalogo-print-root,
        .catalogo-print-root * { visibility: visible !important; }

        .catalogo-print-root {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          background: white !important;
        }

        /* Ocultar barra de controles dentro del root */
        .no-print { display: none !important; visibility: hidden !important; }

        body, html { margin: 0 !important; padding: 0 !important; }

        @page { size: A4 ${CFG[modo].orient}; margin: 0; }

        .print-wrapper {
          display: block !important;
          padding: 0 !important;
          background: transparent !important;
        }

        .catalogo-page {
          display: flex !important;
          flex-direction: column !important;
          box-shadow: none !important;
          width: 100% !important;
          height: 100vh !important;
          padding: 10mm !important;
          margin: 0 !important;
          box-sizing: border-box !important;
          page-break-after: always;
          break-after: page;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .catalogo-page:last-child {
          page-break-after: avoid;
          break-after: avoid;
        }
      }
    `;
    document.head.appendChild(style);
    return () => { document.getElementById(id)?.remove(); };
  }, [modo]);

  const { pages, total } = buildPages(productos, CFG[modo].perPage);
  const canPrint = !loading && total > 0;

  const handlePrint = () => {
    const content = document.getElementById('catalogo-content');
    if (!content) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Poppins', sans-serif; background: white; }
    @page { size: A4 ${modo === 'vertical' ? 'portrait' : 'landscape'}; margin: 0; }
    .catalogo-page {
      width: 100vw; height: 100vh;
      page-break-after: always; break-after: page;
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
      overflow: hidden; position: relative;
    }
    .catalogo-page:last-child { page-break-after: avoid; break-after: avoid; }
  </style>
</head>
<body>${content.innerHTML}</body>
</html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 1500);
  };

  return (
    <div className="catalogo-print-root" style={{ fontFamily: FONT, minHeight: '100%', background: '#EEF4F6' }}>

      {/* ── Google Fonts preload ── */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet" />

      {/* ── Controls bar ── */}
      <div
        className="no-print"
        style={{
          position: 'sticky', top: 0, zIndex: 100,
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${FL.border}`,
          padding: '14px 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '16px', flexWrap: 'wrap',
        }}
      >
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: C.blue, marginBottom: '2px', fontFamily: FONT }}>
            Catálogo Imprimible
          </h1>
          <p style={{ fontSize: '13px', color: FL.textMuted, fontFamily: FONT }}>
            {loading
              ? 'Leyendo productos de Supabase…'
              : `${productos.length} productos · ${total} páginas · ordenados por laboratorio`
            }
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Mode selector */}
          <div style={{
            display: 'flex', background: C.bg,
            borderRadius: '12px', padding: '4px',
            border: `1px solid rgba(43,200,232,0.2)`,
          }}>
            {(['vertical', 'horizontal'] as Modo[]).map(m => (
              <button
                key={m}
                onClick={() => setModo(m)}
                style={{
                  padding: '8px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  background: modo === m ? C.grad : 'transparent',
                  color: modo === m ? '#fff' : FL.textMuted,
                  fontWeight: 600, fontSize: '13px',
                  fontFamily: FONT,
                  transition: 'all 0.15s', whiteSpace: 'nowrap',
                }}
              >
                {m === 'vertical' ? '9 / pág — Vertical' : '4 / pág — Horizontal'}
              </button>
            ))}
          </div>

          {/* Print button */}
          <button
            onClick={handlePrint}
            disabled={!canPrint}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 22px', borderRadius: '12px', border: 'none',
              cursor: canPrint ? 'pointer' : 'not-allowed',
              background: canPrint ? C.grad : '#E5E7EB',
              color: canPrint ? '#fff' : FL.textMuted,
              fontWeight: 700, fontSize: '14px',
              fontFamily: FONT,
              whiteSpace: 'nowrap',
              boxShadow: canPrint ? '0 4px 14px rgba(43,200,232,0.35)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            <Printer size={16} />
            Generar Catálogo
          </button>
        </div>
      </div>

      {/* ── Pages preview ── */}
      <div
        id="catalogo-content"
        className="print-wrapper"
        style={{
          padding: '32px 28px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '32px',
        }}
      >
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '400px', justifyContent: 'center', gap: '14px' }}>
            <Loader2 size={36} color={C.cyan} style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ fontSize: '16px', fontWeight: 700, color: C.blue, fontFamily: FONT }}>Cargando catálogo…</p>
            <p style={{ fontSize: '13px', color: FL.textMuted, fontFamily: FONT }}>Leyendo productos de Supabase</p>
          </div>
        )}

        {!loading && pages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{
              width: '72px', height: '72px',
              background: C.bg, borderRadius: '20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
              border: `1px solid rgba(43,200,232,0.2)`,
            }}>
              <Printer size={32} color={C.teal} />
            </div>
            <p style={{ fontSize: '18px', fontWeight: 700, color: C.blue, fontFamily: FONT }}>Sin productos para imprimir</p>
            <p style={{ fontSize: '14px', color: FL.textMuted, marginTop: '8px', lineHeight: 1.6, fontFamily: FONT }}>
              Importa productos desde Excel primero,<br />o verifica que hay registros activos en Supabase.
            </p>
          </div>
        )}

        {!loading && pages.map(page => (
          <CatalogoPage
            key={page.pageNum}
            lab={page.lab}
            items={page.items}
            pageNum={page.pageNum}
            total={total}
            modo={modo}
          />
        ))}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
