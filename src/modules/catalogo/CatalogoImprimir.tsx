import { useState, useEffect } from 'react';
import { Printer, Loader2, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { supabase } from '../../lib/supabase';
import {
  TEAL, BLUE, PURPLE, NAVY, GRAD, FONT, labLogoPath,
} from '../../lib/catalogo-utils';
import { ProductoCatalogoCard } from '../../components/catalogo/ProductoCatalogoCard';

const CF_PRIMARY = '#4a63d9';
const CF_SUB     = '#1fa5a5';

const CF_PRICE_G = 'linear-gradient(135deg, #31c1b0 0%, #1fa5a5 45%, #4a63d9 100%)';

// ── Types ──────────────────────────────────────────────────────────────────
interface ProductoImprimir {
  id: string;
  nombre: string;
  concentracion: string | null;
  presentacion: string | null;
  laboratorio: string;
  precio_contado: number | null;
  imagenes_urls: string[] | null;
  fecha_vencimiento: string | null;
}

type Modo = 'horizontal' | 'vertical';
type CatalogoTipo = 'por-lab' | 'unificado' | 'hospital';

// ── Page config ────────────────────────────────────────────────────────────
const CFG = {
  vertical:   { perPage: 9, cols: 3, rows: 3, orient: 'portrait',  pageW: '210mm', pageH: '297mm' },
  horizontal: { perPage: 4, cols: 4, rows: 1, orient: 'landscape', pageW: '297mm', pageH: '210mm' },
} as const;

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

function buildPagesUnified(productos: ProductoImprimir[], perPage: number) {
  const pages: Array<{ items: ProductoImprimir[]; pageNum: number; startIdx: number }> = [];
  let n = 0;
  for (const items of chunk(productos, perPage)) {
    pages.push({ items, pageNum: ++n, startIdx: (n - 1) * perPage });
  }
  return { pages, total: n };
}

// WhatsApp icon
function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="white">
      <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.38 5.08L2 22l5.05-1.32A9.93 9.93 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm4.59 13.17c-.21.56-1.04 1.07-1.71 1.2-.45.09-1.03.17-3-.62-2.53-1-4.16-3.6-4.29-3.77-.12-.17-1.03-1.37-1.03-2.61 0-1.25.66-1.87.9-2.13.23-.26.5-.32.67-.32H8l.52 1.25-.81 2.02s.66 1.25 2.22 2.37c1 .72 2.02 1.07 2.02 1.07l1.65-.7 1.25.52-.01.12c-.06.21-.31.66-.56.91z" />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB 1 — POR LABORATORIO
// ═══════════════════════════════════════════════════════════════════════════

function LabHeroSection({ lab, isH }: { lab: string; isH: boolean }) {
  const [logoOk, setLogoOk] = useState(true);

  return (
    <div style={{
      background: `#ffffff padding-box, ${CF_PRICE_G} border-box`,
      borderRadius: isH ? '22px' : '14px',
      padding: isH ? '18px 32px' : '7px 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(13,148,136,0.10)',
      border: '2px solid transparent',
      minHeight: isH ? '110px' : '65px',
    }}>
      {logoOk ? (
        <img
          src={labLogoPath(lab)} alt={lab}
          onError={() => setLogoOk(false)}
          style={{ height: isH ? '90px' : '52px', maxWidth: '90%', objectFit: 'contain', display: 'block' }}
        />
      ) : (
        <p style={{ fontSize: isH ? '32px' : '24px', fontWeight: 800, color: NAVY, lineHeight: 1, fontFamily: FONT }}>
          {lab}
        </p>
      )}
    </div>
  );
}

function PageHeader({ pageNum }: { pageNum: number; isH?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, paddingBottom: '2px' }}>
      {/* Centro — Canaán Farma */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flex: 1 }}>
        <img src="/logocannanfarma.png" alt="Canaán Farma" style={{ height: '50px', width: '50px', objectFit: 'contain' }} />
        <div>
          <p style={{ fontSize: '22px', fontWeight: 800, lineHeight: 1, letterSpacing: '0.5px', fontFamily: FONT, background: CF_PRICE_G, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>CANAÁN FARMA</p>
          <p style={{ fontSize: '8px', fontWeight: 600, color: '#94A3B8', letterSpacing: '2px', marginTop: '3px', fontFamily: FONT }}>DISTRIBUIDOR IMPORTADOR</p>
        </div>
      </div>

      {/* Badge número — gradiente */}
      <div style={{
        width: '52px', height: '52px',
        background: CF_PRICE_G,
        borderRadius: '14px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 6px 18px rgba(49,193,176,0.45)',
        flexShrink: 0,
      }}>
        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '7px', fontWeight: 600, fontFamily: FONT, lineHeight: 1 }}>PÁG.</span>
        <span style={{ color: '#fff', fontSize: '20px', fontWeight: 800, fontFamily: FONT, lineHeight: 1.1 }}>
          {String(pageNum).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}

// Footer minimalista — WA + texto izq | teléfono + WA der
function PageFooter({ pageNum, total }: { pageNum: number; total: number }) {
  return (
    <div style={{
      borderTop: `1.5px solid ${CF_PRIMARY}30`,
      paddingTop: '10px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexShrink: 0,
      gap: '12px',
    }}>
      {/* Left — soporte */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '36px', height: '36px',
          background: CF_PRIMARY,
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 3px 10px ${CF_PRIMARY}40`,
          flexShrink: 0,
        }}>
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none">
            <path d="M3 18v-6a9 9 0 0118 0v6M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3v5zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3v5z" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <p style={{ color: CF_PRIMARY, fontSize: '11px', fontWeight: 800, lineHeight: 1.3, fontFamily: FONT }}>¿Necesitas más información?</p>
          <p style={{ color: '#94A3B8', fontSize: '8px', lineHeight: 1.3, fontFamily: FONT, marginTop: '1px' }}>Comunícate con nosotros</p>
        </div>
      </div>

      {/* Center — pagination subtle */}
      <p style={{ fontSize: '7.5px', color: '#CBD5E1', fontFamily: FONT, textAlign: 'center', letterSpacing: '0.5px' }}>
        {String(pageNum).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </p>

      {/* Right — phone + WA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ textAlign: 'right' }}>
          <p style={{ color: '#94A3B8', fontSize: '8px', fontFamily: FONT, fontWeight: 600 }}>Línea de atención</p>
          <p style={{ color: CF_PRIMARY, fontSize: '17px', fontWeight: 800, letterSpacing: '1px', fontFamily: FONT, lineHeight: 1.1 }}>999 999 999</p>
        </div>
        <div style={{
          width: '36px', height: '36px',
          background: '#25D366',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 3px 10px rgba(37,211,102,0.35)',
        }}>
          <WhatsAppIcon size={19} />
        </div>
      </div>
    </div>
  );
}

function CatalogoPage({ lab, items, pageNum, total, modo }: { lab: string; items: ProductoImprimir[]; pageNum: number; total: number; modo: Modo }) {
  const cfg = CFG[modo];
  const isH = modo === 'horizontal';
  return (
    <div className="catalogo-page" style={{
      width: cfg.pageW, height: cfg.pageH,
      padding: '10mm 11mm',
      boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column', gap: isH ? '10px' : '8px',
      fontFamily: FONT,
      margin: '0 auto',
      boxShadow: '0 8px 40px rgba(0,0,0,0.13)',
      overflow: 'hidden',
      position: 'relative',
      background: `
        radial-gradient(circle at 95% 5%, ${TEAL}10 0%, transparent 30%),
        radial-gradient(circle at 5% 95%, ${PURPLE}08 0%, transparent 28%),
        url('${isH ? '/fondohorizontalcatalogos1.png' : '/fondoverticalcatalogos.png'}') center / cover no-repeat,
        #ffffff
      `,
    }}>
      {/* Decorative blobs */}
      <div style={{
        position: 'absolute', top: '-40px', left: '-60px',
        width: '220px', height: '220px',
        background: `radial-gradient(circle, ${TEAL}18 0%, transparent 65%)`,
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'absolute', bottom: '-50px', right: '-60px',
        width: '240px', height: '240px',
        background: `radial-gradient(circle, ${PURPLE}12 0%, transparent 60%)`,
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'absolute', top: '50%', left: '-30px',
        width: '120px', height: '120px',
        background: `radial-gradient(circle, ${BLUE}10 0%, transparent 60%)`,
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Hexagon pattern top-right */}
      <svg style={{ position: 'absolute', top: '70px', right: '0px', opacity: 0.06, pointerEvents: 'none', zIndex: 0 }} width="180" height="180" viewBox="0 0 180 180">
        <defs>
          <pattern id="hex" x="0" y="0" width="30" height="34" patternUnits="userSpaceOnUse">
            <polygon points="15,2 28,10 28,26 15,34 2,26 2,10" fill="none" stroke={TEAL} strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="180" height="180" fill="url(#hex)" />
      </svg>

      {/* Content over blobs */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: isH ? '10px' : '5px', height: '100%' }}>
        <PageHeader pageNum={pageNum} isH={isH} />
        <LabHeroSection lab={lab} isH={isH} />
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cfg.cols}, 1fr)`,
          gridTemplateRows: `repeat(${cfg.rows}, 1fr)`,
          gap: isH ? '14px' : '6px',
          flex: 1, minHeight: 0,
        }}>
          {items.map((p, i) => (
            <ProductoCatalogoCard key={p.id} producto={p} numero={i + 1} modo={modo} />
          ))}
        </div>
        <PageFooter pageNum={pageNum} total={total} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB 2 — UNIFICADO
// ═══════════════════════════════════════════════════════════════════════════

// Header — matches Image 1
function UnifiedPageHeader({ pageNum, isH }: { pageNum: number; isH: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, paddingBottom: '4px' }}>
      {/* Centro — Canaán Farma */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flex: 1 }}>
        <img src="/logocannanfarma.png" alt="Canaán Farma" style={{ height: isH ? '120px' : '52px', width: isH ? '120px' : '52px', objectFit: 'contain' }} />
        <div>
          <p style={{ fontSize: isH ? '52px' : '22px', fontWeight: 800, lineHeight: 1, letterSpacing: '0.5px', fontFamily: FONT, background: CF_PRICE_G, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>CANAÁN FARMA</p>
          <p style={{ fontSize: isH ? '12px' : '8px', fontWeight: 600, color: '#9CA3AF', letterSpacing: '2px', marginTop: '3px', fontFamily: FONT }}>DISTRIBUIDOR IMPORTADOR</p>
        </div>
      </div>

      {/* Badge número — gradiente */}
      <div style={{
        width: isH ? '52px' : '44px', height: isH ? '52px' : '44px',
        background: CF_PRICE_G,
        borderRadius: '14px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 6px 18px rgba(49,193,176,0.45)',
        flexShrink: 0,
      }}>
        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '7px', fontWeight: 600, fontFamily: FONT, lineHeight: 1 }}>PÁG.</span>
        <span style={{ color: '#fff', fontSize: isH ? '20px' : '16px', fontWeight: 800, lineHeight: 1.1, fontFamily: FONT }}>{String(pageNum).padStart(2, '0')}</span>
      </div>
    </div>
  );
}

// Footer — matches Image 1 (3 benefit icons + phone + WhatsApp + lab dots)
function UnifiedPageFooter({ pageNum, total }: { pageNum: number; total: number }) {
  return (
    <div style={{
      background: `linear-gradient(135deg, #31c1b0 0%, ${CF_SUB} 40%, ${CF_PRIMARY} 100%)`,
      borderRadius: '14px',
      padding: '10px 18px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: '8px',
      flexShrink: 0,
    }}>
      {/* Benefit icons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: isH_global ? '14px' : '10px' }}>
        {[
          { icon: <svg viewBox="0 0 24 24" width="13" height="13" fill="none"><path d="M12 2L3 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-9-4z" stroke="white" strokeWidth="1.5" /><path d="M9 12l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>, label: 'CALIDAD', sub: 'Garantizada' },
          { icon: <svg viewBox="0 0 24 24" width="13" height="13" fill="none"><rect x="1" y="10" width="15" height="8" rx="1" stroke="white" strokeWidth="1.5" /><path d="M16 14h4l2-2v4h-6" stroke="white" strokeWidth="1.5" strokeLinejoin="round" /><circle cx="5" cy="18" r="1.5" stroke="white" strokeWidth="1.5" /><circle cx="17" cy="18" r="1.5" stroke="white" strokeWidth="1.5" /></svg>, label: 'ENTREGA RÁPIDA', sub: 'A todo el país' },
          { icon: <svg viewBox="0 0 24 24" width="13" height="13" fill="none"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="white" strokeWidth="1.5" strokeLinecap="round" /><circle cx="12" cy="7" r="4" stroke="white" strokeWidth="1.5" /></svg>, label: 'SOPORTE', sub: 'Profesional' },
        ].map(({ icon, label, sub }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '26px', height: '26px', background: 'rgba(255,255,255,0.18)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {icon}
            </div>
            <div>
              <p style={{ color: '#fff', fontSize: '7.5px', fontWeight: 800, fontFamily: FONT, lineHeight: 1 }}>{label}</p>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '6.5px', fontFamily: FONT, lineHeight: 1.3 }}>{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Center — page indicator */}
      <div style={{ textAlign: 'center', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginBottom: '3px' }}>
          {['#31c1b0', CF_SUB, CF_PRIMARY, '#7b97f0', '#a8bfff'].map(c => (
            <div key={c} style={{ width: '7px', height: '7px', borderRadius: '50%', background: c, opacity: 0.85 }} />
          ))}
        </div>
        <p style={{ fontSize: '6px', color: 'rgba(255,255,255,0.45)', fontFamily: FONT, lineHeight: 1.5 }}>
          Todos los laboratorios<br />
          Pág. {String(pageNum).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </p>
      </div>

      {/* Phone + WA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <p style={{ color: '#fff', fontSize: '15px', fontWeight: 700, fontFamily: FONT, letterSpacing: '0.5px' }}>999 999 999</p>
        <div style={{ width: '32px', height: '32px', background: '#25D366', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
          <WhatsAppIcon size={17} />
        </div>
      </div>
    </div>
  );
}

// Hack for isH inside footer component
let isH_global = false;

function UnifiedPage({ items, pageNum, total, startIdx, modo }: { items: ProductoImprimir[]; pageNum: number; total: number; startIdx: number; modo: Modo }) {
  const cfg = CFG[modo];
  const isH = modo === 'horizontal';
  isH_global = isH;
  return (
    <div className="catalogo-page" style={{
      width: cfg.pageW, height: cfg.pageH,
      padding: '8mm 10mm',
      boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column', gap: isH ? '8px' : '4px',
      fontFamily: FONT, margin: '0 auto',
      boxShadow: '0 8px 40px rgba(0,0,0,0.13)',
      overflow: 'hidden',
      background: `
        radial-gradient(circle at 95% 5%, ${TEAL}10 0%, transparent 30%),
        radial-gradient(circle at 5% 95%, ${PURPLE}08 0%, transparent 28%),
        url('${isH ? '/fondohorizontalcatalogos1.png' : '/fondoverticalcatalogos.png'}') center / cover no-repeat,
        #ffffff
      `,
    }}>
      <UnifiedPageHeader pageNum={pageNum} isH={isH} />
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cfg.cols}, 1fr)`,
        gridTemplateRows: `repeat(${cfg.rows}, 1fr)`,
        gap: isH ? '12px' : '6px',
        flex: 1, minHeight: 0,
      }}>
        {items.map((p, i) => (
          <ProductoCatalogoCard key={p.id} producto={p} numero={startIdx + i + 1} modo={modo} />
        ))}
      </div>
      <UnifiedPageFooter pageNum={pageNum} total={total} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB 3 — HOSPITAL (clinical design)
// ═══════════════════════════════════════════════════════════════════════════

function HospitalPageHeader({ pageNum, isH }: { pageNum: number; isH: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, paddingBottom: '2px' }}>
      {/* Centro — Canaán Farma */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flex: 1 }}>
        <img src="/logocannanfarma.png" alt="Canaán Farma" style={{ height: isH ? '120px' : '52px', width: isH ? '120px' : '52px', objectFit: 'contain' }} />
        <div>
          <p style={{ fontSize: isH ? '52px' : '22px', fontWeight: 800, lineHeight: 1, letterSpacing: '0.5px', fontFamily: FONT, background: CF_PRICE_G, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>CANAÁN FARMA</p>
          <p style={{ fontSize: isH ? '12px' : '8px', fontWeight: 600, color: '#94A3B8', letterSpacing: '2px', marginTop: '3px', fontFamily: FONT }}>DISTRIBUIDOR IMPORTADOR</p>
        </div>
      </div>

      {/* Badge número — gradiente */}
      <div style={{
        width: isH ? '52px' : '44px', height: isH ? '52px' : '44px',
        background: CF_PRICE_G,
        borderRadius: '14px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 6px 18px rgba(49,193,176,0.45)',
        flexShrink: 0,
      }}>
        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '7px', fontWeight: 600, fontFamily: FONT, lineHeight: 1 }}>PÁG.</span>
        <span style={{ color: '#fff', fontSize: isH ? '20px' : '16px', fontWeight: 800, lineHeight: 1.1, fontFamily: FONT }}>{String(pageNum).padStart(2, '0')}</span>
      </div>
    </div>
  );
}

function HospitalPageFooter({ pageNum, total }: { pageNum: number; total: number }) {
  return (
    <div style={{ background: `${TEAL}10`, border: `1px solid ${TEAL}35`, borderRadius: '11px', padding: '7px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '26px', height: '26px', background: GRAD, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none"><path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" /></svg>
        </div>
        <div>
          <p style={{ fontSize: '7.5px', fontWeight: 700, color: NAVY, fontFamily: FONT }}>USO EXCLUSIVO CLÍNICO HOSPITALARIO</p>
          <p style={{ fontSize: '6px', color: '#64748B', fontFamily: FONT }}>Precios B2B · Requiere habilitación sanitaria</p>
        </div>
      </div>
      <p style={{ fontSize: '6.5px', color: '#94A3B8', fontFamily: FONT, textAlign: 'center' }}>
        Pág. {String(pageNum).padStart(2, '0')} de {String(total).padStart(2, '0')} · Vigente 2026
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div>
          <p style={{ fontSize: '7px', color: '#64748B', fontFamily: FONT, textAlign: 'right' }}>Central de pedidos</p>
          <p style={{ fontSize: '13px', fontWeight: 800, color: NAVY, fontFamily: FONT, letterSpacing: '0.5px' }}>999 999 999</p>
        </div>
        <div style={{ width: '28px', height: '28px', background: '#25D366', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <WhatsAppIcon size={14} />
        </div>
      </div>
    </div>
  );
}

function HospitalPage({ items, pageNum, total, startIdx, modo }: { items: ProductoImprimir[]; pageNum: number; total: number; startIdx: number; modo: Modo }) {
  const cfg = CFG[modo];
  const isH = modo === 'horizontal';
  return (
    <div className="catalogo-page" style={{
      width: cfg.pageW, height: cfg.pageH,
      padding: '8mm 10mm',
      boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column', gap: isH ? '8px' : '4px',
      fontFamily: FONT, margin: '0 auto',
      boxShadow: '0 8px 40px rgba(0,0,0,0.13)',
      overflow: 'hidden',
      position: 'relative',
      background: `
        radial-gradient(circle at 95% 5%, ${TEAL}10 0%, transparent 30%),
        radial-gradient(circle at 5% 95%, ${PURPLE}08 0%, transparent 28%),
        url('${isH ? '/fondohorizontalcatalogos1.png' : '/fondoverticalcatalogos.png'}') center / cover no-repeat,
        #F0FDFA
      `,
    }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: `radial-gradient(circle at 100% 0%, ${BLUE}15 0%, transparent 70%)`, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100px', height: '100px', background: `radial-gradient(circle at 0% 100%, ${TEAL}12 0%, transparent 70%)`, pointerEvents: 'none' }} />
      <HospitalPageHeader pageNum={pageNum} isH={isH} />
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cfg.cols}, 1fr)`,
        gridTemplateRows: `repeat(${cfg.rows}, 1fr)`,
        gap: isH ? '12px' : '6px',
        flex: 1, minHeight: 0,
      }}>
        {items.map((p, i) => (
          <ProductoCatalogoCard key={p.id} producto={p} numero={startIdx + i + 1} modo={modo} variant="hospital" />
        ))}
      </div>
      <HospitalPageFooter pageNum={pageNum} total={total} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Main export
// ═══════════════════════════════════════════════════════════════════════════

const TABS: Array<{ id: CatalogoTipo; label: string; desc: string; icon: string }> = [
  { id: 'por-lab',    label: 'Por Laboratorio', desc: '9 vert / 4 horiz · Agrupado', icon: '🏭' },
  { id: 'unificado', label: 'Unificado',        desc: '9/pág · Todos los labs',     icon: '🗂️' },
  { id: 'hospital',  label: 'Hospital',          desc: '9/pág · Diseño clínico',     icon: '🏥' },
];

export function CatalogoImprimir() {
  const [tipo, setTipo] = useState<CatalogoTipo>('por-lab');
  const [modo, setModo] = useState<Modo>('vertical');
  const [productos, setProductos] = useState<ProductoImprimir[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<{ current: number; total: number } | null>(null);

  useEffect(() => {
    supabase
      .from('productos')
      .select('id, nombre, concentracion, presentacion, laboratorio, precio_contado, imagenes_urls, fecha_vencimiento')
      .eq('activo', true)
      .order('laboratorio')
      .order('nombre')
      .then(({ data, error }) => {
        if (error) console.error('CatalogoImprimir:', error.message);
        if (data) setProductos(data as ProductoImprimir[]);
        setLoading(false);
      });
  }, []);

  const currentOrient = CFG[modo].orient;

  useEffect(() => {
    const id = 'catalogo-print-css';
    document.getElementById(id)?.remove();
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      @media print {
        *, *::before, *::after { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        body, body * { visibility: hidden !important; }
        .catalogo-print-root, .catalogo-print-root * { visibility: visible !important; }
        .catalogo-print-root { position: absolute !important; top: 0 !important; left: 0 !important; width: 100% !important; }
        .no-print { display: none !important; }
        body, html { margin: 0 !important; padding: 0 !important; }
        @page { size: A4 ${currentOrient}; margin: 0; }
        .print-wrapper { display: block !important; padding: 0 !important; }
        .catalogo-page {
          display: flex !important; flex-direction: column !important;
          width: 100% !important; height: 100vh !important;
          padding: 8mm 10mm !important; margin: 0 !important;
          box-sizing: border-box !important;
          page-break-after: always; break-after: page;
          -webkit-print-color-adjust: exact; print-color-adjust: exact;
        }
        .catalogo-page:last-child { page-break-after: avoid; break-after: avoid; }
      }
    `;
    document.head.appendChild(style);
    return () => { document.getElementById(id)?.remove(); };
  }, [currentOrient]);

  const labPages = tipo === 'por-lab' ? buildPages(productos, CFG[modo].perPage) : { pages: [], total: 0 };
  const uniPages = tipo !== 'por-lab' ? buildPagesUnified(productos, CFG[modo].perPage) : { pages: [], total: 0 };
  const totalPages = tipo === 'por-lab' ? labPages.total : uniPages.total;
  const canPrint = !loading && totalPages > 0;

  const compressImgToDataURL = (src: string, scale = 0.5, quality = 0.55): Promise<string> =>
    new Promise(resolve => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = Math.round(img.naturalWidth * scale);
        c.height = Math.round(img.naturalHeight * scale);
        c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(src);
      img.src = src;
    });

  const handlePrint = async () => {
    const content = document.getElementById('catalogo-content');
    if (!content) return;

    const win = window.open('', '_blank');
    if (!win) {
      alert(
        'El navegador bloqueó la ventana emergente.\n' +
        'Haz clic en el ícono de popup bloqueado en la barra de direcciones, permite el acceso e intenta de nuevo.'
      );
      return;
    }

    // Pre-comprimir el fondo activo: PNG ~1.4 MB → JPEG ~90 KB (15x reducción).
    // Se inyecta UNA sola regla CSS con !important para que el browser lo embeba
    // una vez en el PDF en vez de repetirlo por cada página.
    const bgSrc = currentOrient === 'landscape'
      ? '/fondohorizontalcatalogos1.png'
      : '/fondoverticalcatalogos.png';
    const bgDataUrl = await compressImgToDataURL(bgSrc);
    const baseColor = tipo === 'hospital' ? '#F0FDFA' : '#ffffff';

    // CSS de optimización para la ventana de impresión:
    // - fondo comprimido (data URL) para no repetir el PNG original por página
    // - sin box-shadow ni filter: Chrome rasteriza sombras extendiendo el área
    //   del bitmap por página → PDF más pesado y más lento de generar
    const printOptimizeCss = `
      .catalogo-page {
        background:
          radial-gradient(circle at 95% 5%, ${TEAL}10 0%, transparent 30%),
          radial-gradient(circle at 5% 95%, ${PURPLE}08 0%, transparent 28%),
          url('${bgDataUrl}') center / cover no-repeat,
          ${baseColor} !important;
      }
      *, *::before, *::after {
        box-shadow: none !important;
        text-shadow: none !important;
        filter: none !important;
        -webkit-filter: none !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
      }
      .cat-card img {
        max-height: 150px !important;
        object-fit: contain !important;
      }
    `;

    // base href es crítico: sin esto las URLs relativas (/Fondo2.svg, /logocannanfarma.png, etc.)
    // no resuelven en la ventana about:blank y las imágenes no cargan
    const baseHref = `${window.location.origin}/`;

    win.document.open();
    win.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <base href="${baseHref}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    html, body { margin: 0; padding: 0; background: #f0f0f0; font-family: 'Poppins', 'Plus Jakarta Sans', sans-serif; }
    body { display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 20px 0; }
    #prep-msg {
      position: fixed; inset: 0; z-index: 9999;
      background: rgba(255,255,255,0.96);
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px;
      font-family: 'Poppins', sans-serif;
    }
    #prep-msg p { font-size: 16px; font-weight: 600; color: #1A2535; margin: 0; }
    #prep-msg small { font-size: 12px; color: #6B7280; }
    @keyframes spin { to { transform: rotate(360deg); } }
    #prep-spinner { width: 40px; height: 40px; border: 4px solid #e5e7eb; border-top-color: #0D9488; border-radius: 50%; animation: spin 0.8s linear infinite; }
    ${printOptimizeCss}
    @page { size: A4 ${currentOrient}; margin: 0; }
    @media print {
      #prep-msg { display: none !important; }
      html, body { background: white; padding: 0; gap: 0; display: block; }
      .catalogo-page {
        width: 100vw !important; height: 100vh !important;
        margin: 0 !important;
        page-break-after: always; break-after: page;
        -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
      }
      .catalogo-page:last-child { page-break-after: avoid; break-after: avoid; }
    }
  </style>
</head>
<body>
  <div id="prep-msg">
    <div id="prep-spinner"></div>
    <p>Preparando catálogo…</p>
    <small id="prep-sub">Cargando imágenes de productos</small>
  </div>
  ${content.innerHTML}
  <script>
    // background-clip:text no renderiza en PDF — reemplazar con SVG linearGradient.
    // Maneja dos casos: texto simple (CANAÁN FARMA) y precio con spans de distinto tamaño (S/ + número).
    (function () {
      var svgNS = 'http://www.w3.org/2000/svg';
      var counter = 0;

      function makeSVG(id, w, h) {
        var svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('xmlns', svgNS);
        svg.setAttribute('width', w);
        svg.setAttribute('height', h);
        svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
        svg.style.cssText = 'display:block;overflow:visible;flex-shrink:0';
        var defs = document.createElementNS(svgNS, 'defs');
        var grad = document.createElementNS(svgNS, 'linearGradient');
        grad.setAttribute('id', id);
        grad.setAttribute('x1', '0%'); grad.setAttribute('y1', '0%');
        grad.setAttribute('x2', '100%'); grad.setAttribute('y2', '0%');
        [['0%','#31c1b0'],['45%','#1fa5a5'],['100%','#4a63d9']].forEach(function(s) {
          var stop = document.createElementNS(svgNS, 'stop');
          stop.setAttribute('offset', s[0]);
          stop.setAttribute('stop-color', s[1]);
          grad.appendChild(stop);
        });
        defs.appendChild(grad);
        svg.appendChild(defs);
        return svg;
      }

      document.querySelectorAll('[style*="-webkit-text-fill-color"]').forEach(function (el) {
        var id = 'cfgrad' + (++counter);
        var spans = el.querySelectorAll('span');
        var svg, textEl;

        if (spans.length > 0) {
          // Precio: <p> con <span> hijos de distinto tamaño (S/ + número)
          var maxFs = 0;
          spans.forEach(function(s) {
            var fs = parseFloat(s.style.fontSize) || 0;
            if (fs > maxFs) maxFs = fs;
          });
          if (maxFs === 0) maxFs = 20;
          var totalChars = Array.from(spans).reduce(function(acc, s) {
            return acc + (s.textContent || '').length;
          }, 0);
          var w = Math.ceil(maxFs * totalChars * 0.7 + maxFs * 0.5);
          var h = Math.ceil(maxFs * 1.4);
          svg = makeSVG(id, w, h);
          textEl = document.createElementNS(svgNS, 'text');
          textEl.setAttribute('fill', 'url(#' + id + ')');
          textEl.setAttribute('font-family', "Poppins, 'Plus Jakarta Sans', sans-serif");
          textEl.setAttribute('x', '0');
          textEl.setAttribute('y', Math.ceil(maxFs * 1.1));
          spans.forEach(function(s) {
            var tspan = document.createElementNS(svgNS, 'tspan');
            tspan.setAttribute('font-size', parseFloat(s.style.fontSize) || maxFs);
            tspan.setAttribute('font-weight', s.style.fontWeight || '800');
            tspan.textContent = s.textContent;
            textEl.appendChild(tspan);
          });
        } else {
          // Texto simple: CANAÁN FARMA
          var fs = parseFloat(el.style.fontSize) || 22;
          var w = Math.ceil(fs * 11);
          var h = Math.ceil(fs * 1.3);
          svg = makeSVG(id, w, h);
          textEl = document.createElementNS(svgNS, 'text');
          textEl.setAttribute('fill', 'url(#' + id + ')');
          textEl.setAttribute('font-size', fs);
          textEl.setAttribute('font-weight', '800');
          textEl.setAttribute('font-family', "Poppins, 'Plus Jakarta Sans', sans-serif");
          textEl.setAttribute('dominant-baseline', 'hanging');
          textEl.setAttribute('letter-spacing', '0.5');
          textEl.setAttribute('x', '0');
          textEl.setAttribute('y', '2');
          textEl.textContent = el.textContent;
        }

        svg.appendChild(textEl);
        el.parentNode.replaceChild(svg, el);
      });
    })();
  </script>
</body>
</html>`);
    win.document.close();

    // Espera que todas las imágenes carguen antes de abrir el diálogo de impresión
    setTimeout(() => {
      const imgs = Array.from(win.document.querySelectorAll('img'));
      const pending = imgs.filter(img => !img.complete);
      const sub = win.document.getElementById('prep-sub');

      const doPrint = () => {
        const msg = win.document.getElementById('prep-msg');
        if (msg) msg.style.display = 'none';
        win.focus();
        win.print();
      };

      if (pending.length === 0) {
        doPrint();
        return;
      }

      if (sub) sub.textContent = `Cargando imágenes… 0 / ${pending.length}`;

      let resolved = 0;
      const onSettled = () => {
        resolved++;
        if (sub) sub.textContent = `Cargando imágenes… ${resolved} / ${pending.length}`;
        if (resolved >= pending.length) doPrint();
      };
      pending.forEach(img => {
        img.addEventListener('load', onSettled);
        img.addEventListener('error', onSettled);
      });
      // Fallback máximo: 5 segundos — el PDF carga antes aunque falten imágenes
      setTimeout(doPrint, 5000);
    }, 400);
  };

  const handleDownloadPDF = async () => {
    const pages = Array.from(document.querySelectorAll<HTMLElement>('.catalogo-page'));
    if (pages.length === 0) return;

    setDownloading(true);
    setDownloadProgress({ current: 0, total: pages.length });

    const isPortrait = currentOrient === 'portrait';
    const pdf = new jsPDF({
      orientation: isPortrait ? 'portrait' : 'landscape',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });
    const pageW_mm = isPortrait ? 210 : 297;
    const pageH_mm = isPortrait ? 297 : 210;

    // Apuntar a 150dpi: compensa cualquier zoom del navegador midiendo
    // el ancho real renderizado del elemento vs el ancho A4 esperado.
    const TARGET_DPI = 150;
    const targetPxW = Math.round(pageW_mm * TARGET_DPI / 25.4); // ~1240px para portrait

    for (let i = 0; i < pages.length; i++) {
      setDownloadProgress({ current: i + 1, total: pages.length });

      const el = pages[i];
      const renderedW = el.getBoundingClientRect().width || el.offsetWidth;
      // Escala dinámica: sin importar el zoom del browser, el canvas siempre sale a ~150dpi
      const captureScale = renderedW > 0 ? targetPxW / renderedW : 2;

      const canvas = await html2canvas(el, {
        scale: captureScale,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.90);
      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, 0, pageW_mm, pageH_mm);

      // Liberar canvas inmediatamente para no acumular RAM
      canvas.width = 0;
      canvas.height = 0;

      // Ceder el hilo al browser entre páginas para que pueda hacer GC
      await new Promise<void>(res => setTimeout(res, 30));
    }

    const tabLabel = TABS.find(t => t.id === tipo)?.label ?? tipo;
    pdf.save(`catalogo-canaan-farma-${tabLabel.toLowerCase().replace(/\s+/g, '-')}.pdf`);

    setDownloading(false);
    setDownloadProgress(null);
  };

  return (
    <div className="catalogo-print-root" style={{ fontFamily: FONT, minHeight: '100%', background: '#EEF4F6' }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Controls bar */}
      <div className="no-print" style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid #E8F0F4`,
        padding: '14px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap',
        boxShadow: '0 2px 20px rgba(13,148,136,0.06)',
      }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: NAVY, marginBottom: '2px', fontFamily: FONT }}>Catálogo Imprimible</h1>
          <p style={{ fontSize: '13px', color: '#6B7280', fontFamily: FONT }}>
            {loading ? 'Cargando productos…' : `${productos.length} productos · ${totalPages} páginas`}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Type tabs */}
          <div style={{ display: 'flex', background: '#F0F8FF', borderRadius: '14px', padding: '4px', border: `1px solid ${TEAL}30` }}>
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setTipo(tab.id)} style={{
                padding: '8px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                background: tipo === tab.id ? GRAD : 'transparent',
                color: tipo === tab.id ? '#fff' : '#6B7280',
                fontWeight: 700, fontSize: '13px', fontFamily: FONT,
                transition: 'all 0.15s', whiteSpace: 'nowrap',
                display: 'flex', alignItems: 'center', gap: '6px',
                boxShadow: tipo === tab.id ? `0 2px 10px ${TEAL}40` : 'none',
              }}>
                <span style={{ fontSize: '14px' }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Mode toggle */}
          <div style={{ display: 'flex', background: '#F0F8FF', borderRadius: '12px', padding: '4px', border: `1px solid ${TEAL}30` }}>
            {(['vertical', 'horizontal'] as Modo[]).map(m => (
              <button key={m} onClick={() => setModo(m)} style={{
                padding: '7px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                background: modo === m ? GRAD : 'transparent',
                color: modo === m ? '#fff' : '#6B7280',
                fontWeight: 600, fontSize: '12px', fontFamily: FONT,
                transition: 'all 0.15s', whiteSpace: 'nowrap',
                boxShadow: modo === m ? `0 2px 8px ${TEAL}40` : 'none',
              }}>
                {m === 'vertical' ? '9/pág Vertical' : '4/pág Horizontal'}
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
              background: canPrint ? GRAD : '#E5E7EB',
              color: canPrint ? '#fff' : '#9CA3AF',
              fontWeight: 700, fontSize: '14px', fontFamily: FONT,
              whiteSpace: 'nowrap',
              boxShadow: canPrint ? `0 4px 16px ${TEAL}45` : 'none',
              transition: 'all 0.2s',
            }}
          >
            <Printer size={16} />
            Generar Catálogo
          </button>

          {/* Download PDF button */}
          <button
            onClick={handleDownloadPDF}
            disabled={!canPrint || downloading}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 22px', borderRadius: '12px', border: 'none',
              cursor: (canPrint && !downloading) ? 'pointer' : 'not-allowed',
              background: (canPrint && !downloading) ? '#0D9488' : '#E5E7EB',
              color: (canPrint && !downloading) ? '#fff' : '#9CA3AF',
              fontWeight: 700, fontSize: '14px', fontFamily: FONT,
              whiteSpace: 'nowrap',
              boxShadow: (canPrint && !downloading) ? '0 4px 16px rgba(13,148,136,0.45)' : 'none',
              transition: 'all 0.2s',
              minWidth: '180px',
              justifyContent: 'center',
            }}
          >
            {downloading ? (
              <>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                {downloadProgress
                  ? `Pág. ${downloadProgress.current} / ${downloadProgress.total}`
                  : 'Preparando…'}
              </>
            ) : (
              <>
                <Download size={16} />
                Descargar PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* Pages */}
      <div id="catalogo-content" className="print-wrapper" style={{ padding: '32px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '400px', justifyContent: 'center', gap: '16px' }}>
            <Loader2 size={38} color={TEAL} style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ fontSize: '16px', fontWeight: 700, color: NAVY, fontFamily: FONT }}>Cargando catálogo…</p>
          </div>
        )}

        {!loading && totalPages === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ width: '72px', height: '72px', background: '#F0F8FF', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: `1px solid ${TEAL}33` }}>
              <Printer size={32} color={TEAL} />
            </div>
            <p style={{ fontSize: '18px', fontWeight: 700, color: NAVY, fontFamily: FONT }}>Sin productos para imprimir</p>
            <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '8px', lineHeight: 1.6, fontFamily: FONT }}>
              Importa productos desde Excel primero,<br />o verifica que hay registros activos en Supabase.
            </p>
          </div>
        )}

        {tipo === 'por-lab' && !loading && labPages.pages.map(page => (
          <CatalogoPage key={page.pageNum} lab={page.lab} items={page.items} pageNum={page.pageNum} total={labPages.total} modo={modo} />
        ))}

        {tipo === 'unificado' && !loading && uniPages.pages.map(page => (
          <UnifiedPage key={page.pageNum} items={page.items} pageNum={page.pageNum} total={uniPages.total} startIdx={page.startIdx} modo={modo} />
        ))}

        {tipo === 'hospital' && !loading && uniPages.pages.map(page => (
          <HospitalPage key={page.pageNum} items={page.items} pageNum={page.pageNum} total={uniPages.total} startIdx={page.startIdx} modo={modo} />
        ))}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
