import { useState } from 'react';
import { detectCat, labLogoBase, LOGO_EXTS } from '../../lib/catalogo-utils';
import { CatIcon } from './CatIcon';

interface ProductoCatalogoCardProps {
  producto: {
    id: string;
    nombre: string;
    concentracion: string | null;
    presentacion: string | null;
    laboratorio: string;
    precio_contado: number | null;
    imagenes_urls: string[] | null;
    fecha_vencimiento?: string | null;
  };
  numero: number;
  modo: 'vertical' | 'horizontal';
  variant?: 'default' | 'hospital';
}

// Comprime la imagen a max 300px preservando transparencia (PNG→WebP, no JPEG)
function compressToDataUrl(imgEl: HTMLImageElement): string | null {
  try {
    const TARGET = 300;
    const scale = Math.min(1, TARGET / Math.max(imgEl.naturalWidth || 1, imgEl.naturalHeight || 1));
    const canvas = document.createElement('canvas');
    canvas.width  = Math.round((imgEl.naturalWidth  || TARGET) * scale);
    canvas.height = Math.round((imgEl.naturalHeight || TARGET) * scale);
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height); // fondo transparente
    ctx.drawImage(imgEl, 0, 0, canvas.width, canvas.height);
    // WebP soporta transparencia + mejor compresión que PNG
    const webp = canvas.toDataURL('image/webp', 0.85);
    if (webp.startsWith('data:image/webp')) return webp;
    return canvas.toDataURL('image/png'); // fallback para Safari antiguo
  } catch {
    return null; // canvas tainted (CORS) — mantener URL original
  }
}

const CF_PRIMARY = '#4a63d9';
const CF_SUB     = '#1fa5a5';
const CF_FONT    = "'Poppins', 'Plus Jakarta Sans', sans-serif";
const CF_PRICE_G = 'linear-gradient(135deg, #31c1b0 0%, #1fa5a5 45%, #4a63d9 100%)';

// /Categorias/GenfarLogo.png — capitaliza cada palabra, sin espacios

export function ProductoCatalogoCard({
  producto: p,
  numero,
  modo,
}: ProductoCatalogoCardProps) {
  const [imgErr, setImgErr] = useState(false);
  const [imgTriedWebp, setImgTriedWebp] = useState(false);
  const [compressedSrc, setCompressedSrc] = useState<string | null>(null);

  const isH = modo === 'horizontal';
  const cat = detectCat(p.nombre, p.presentacion);

  const rawImgUrl = p.imagenes_urls?.[0] ?? null;
  // Si la URL original falla, intenta con .webp (cubre cambios de extensión en storage)
  const imgUrl = rawImgUrl
    ? (imgTriedWebp
        ? rawImgUrl.replace(/\.[^./?#]+($|\?)/, '.webp$1')
        : rawImgUrl)
    : null;
  const hasImg = Boolean(imgUrl);

  const handleImgError = () => {
    if (!imgTriedWebp && rawImgUrl && !/\.webp(\?|$)/i.test(rawImgUrl)) {
      setImgTriedWebp(true); // reintenta con .webp
    } else {
      setImgErr(true);       // ya no hay más opciones → muestra ícono
    }
  };

  const handleImgLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (compressedSrc) return; // evitar bucle al cambiar src
    const data = compressToDataUrl(e.currentTarget);
    if (data) setCompressedSrc(data);
  };

  // Cascada de extensiones: png → webp → jpg → jpeg → svg → texto
  const [logoExtIdx, setLogoExtIdx] = useState(0);
  const logoBase = labLogoBase(p.laboratorio);
  const logoSrc  = logoExtIdx < LOGO_EXTS.length ? `${logoBase}.${LOGO_EXTS[logoExtIdx]}` : '';
  const logoOk   = logoExtIdx < LOGO_EXTS.length;

  const radius = '18px';

  // Horizontal 4×1: cards son altas y angostas (portrait dentro de landscape)
  // Vertical 3×3:   cards son más pequeñas
  const numSz   = isH ? '28px' : '20px';
  const nameSz  = isH ? '13px' : '12px';
  const subSz   = isH ? '10px' : '9px';
  const priceSz = isH ? '26px' : '19px';
  const currSz  = isH ? '12px' : '9px';
  const iconSz  = isH ? 13 : 10;

  return (
    <div className="cat-card" style={{
      borderRadius: radius,
      background: '#ffffff',
      boxShadow: '0 6px 22px rgba(74,99,217,0.13), 0 1px 4px rgba(0,0,0,0.06)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
      height: '100%',
      boxSizing: 'border-box',
      fontFamily: CF_FONT,
    }}>

      {/* ── Fondo SVG: olas suaves con bordes difuminados ── */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}
      >
        <defs>
          {/* Gradiente teal: claro → saturado → profundo (da profundidad interna) */}
          <linearGradient id={`tg-${p.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#6ED8E8" />
            <stop offset="45%"  stopColor="#3BBACF" />
            <stop offset="100%" stopColor="#2E9AB8" stopOpacity="0.88" />
          </linearGradient>
          {/* Gradiente lavanda: profundo → medio → claro */}
          <linearGradient id={`lg-${p.id}`} x1="100%" y1="100%" x2="15%" y2="15%">
            <stop offset="0%"   stopColor="#9082C8" />
            <stop offset="50%"  stopColor="#B0A6DC" />
            <stop offset="100%" stopColor="#CAC4F0" stopOpacity="0.8" />
          </linearGradient>
          {/* Blur para bordes suaves — las esquinas quedan sólidas gracias al overflow:hidden de la card */}
          <filter id={`sf-${p.id}`} x="-12%" y="-12%" width="124%" height="124%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.8" />
          </filter>
        </defs>
        <rect width="100" height="100" fill="white" />
        {/* Ola teal extendida fuera del viewBox → esquina superior-izquierda sólida */}
        <path
          d="M -10,-10 L 78,0 C 71,10 59,23 48,36 C 36,50 29,64 13,74 C 2,81 -10,79 -10,67 Z"
          fill={`url(#tg-${p.id})`}
          filter={`url(#sf-${p.id})`}
        />
        {/* Ola lavanda extendida → esquina inferior-derecha sólida */}
        <path
          d="M 110,110 L 22,100 C 29,90 41,77 52,64 C 64,50 71,36 87,26 C 98,19 110,21 110,33 Z"
          fill={`url(#lg-${p.id})`}
          filter={`url(#sf-${p.id})`}
        />
      </svg>

      {/* ── Número: sin fondo, texto libre sobre el SVG ── */}
      <div style={{
        position: 'absolute',
        top: isH ? '10px' : '7px',
        left: isH ? '12px' : '8px',
        color: '#ffffff',
        fontWeight: 900,
        fontSize: numSz,
        zIndex: 3,
        fontFamily: CF_FONT,
        lineHeight: 1,
        textShadow: '0 2px 8px rgba(0,0,0,0.35), 0 1px 3px rgba(0,0,0,0.25)',
      }}>
        {String(numero).padStart(2, '0')}
      </div>

      {/* ── Zona imagen: overflow visible para que la img desborde sobre el panel blanco ── */}
      <div style={{
        flex: isH ? '0 0 54%' : '0 0 48%',
        position: 'relative',
        minHeight: 0,
        overflow: 'visible',
      }}>
        {hasImg && !imgErr ? (
          <img
            src={compressedSrc ?? imgUrl!}
            alt={p.nombre}
            crossOrigin="anonymous"
            loading="lazy"
            onLoad={handleImgLoad}
            onError={handleImgError}
            style={{
              position: 'absolute',
              bottom: isH ? '-28px' : '-22px',
              left: '50%',
              transform: 'translateX(-50%)',
              maxHeight: isH ? '290px' : '120px',
              maxWidth: '90%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 14px 22px rgba(74,99,217,0.30)) drop-shadow(0 4px 8px rgba(0,0,0,0.18))',
              zIndex: 4,
            }}
          />
        ) : (
          <div style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', zIndex: 4 }}>
            <CatIcon cat={cat} size={isH ? 56 : 44} color="rgba(74,99,217,0.35)" />
          </div>
        )}
      </div>

      {/* ── Panel info blanco ── */}
      <div style={{
        flex: 1,
        background: 'rgba(255,255,255,0.97)',
        borderRadius: '18px 18px 18px 18px',
        padding: isH ? '32px 16px 14px' : '16px 9px 8px',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        margin: isH ? '0 5px 5px' : '0 4px 4px',
        boxShadow: '0 -4px 16px rgba(74,99,217,0.07)',
        position: 'relative',
        zIndex: 1,
      }}>

        {/* Código CF — pequeño, encima del nombre */}
        <div style={{
          alignSelf: 'flex-start',
          background: CF_SUB,
          borderRadius: '20px',
          padding: isH ? '2px 9px' : '1px 5px',
          marginBottom: isH ? '4px' : '2px',
        }}>
          <span style={{
            color: '#ffffff',
            fontSize: isH ? '8px' : '6px',
            fontWeight: 700,
            fontFamily: CF_FONT,
            letterSpacing: '0.3px',
          }}>
            {p.id.slice(0, 10).toUpperCase()}
          </span>
        </div>

        {/* Nombre del producto */}
        <p style={{
          color: CF_PRIMARY,
          fontWeight: 700,
          fontSize: nameSz,
          lineHeight: 1.2,
          fontFamily: CF_FONT,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          marginBottom: isH ? '4px' : '2px',
          wordBreak: 'break-word',
          flexShrink: 0,
        }}>
          {p.nombre}
        </p>

        {/* Presentación */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: isH ? '5px' : '4px',
          marginBottom: isH ? '6px' : '4px',
        }}>
          <CatIcon cat={cat} size={iconSz} color={CF_SUB} />
          <span style={{
            color: CF_SUB,
            fontSize: subSz,
            fontFamily: CF_FONT,
            fontWeight: 500,
            lineHeight: 1.2,
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {p.presentacion ?? '—'}
          </span>
        </div>

        {/* Fecha de vencimiento */}
        {p.fecha_vencimiento && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: isH ? '5px' : '3px',
            marginTop: isH ? '3px' : '2px',
          }}>
            <svg viewBox="0 0 24 24" width={iconSz} height={iconSz} fill="none">
              <rect x="3" y="4" width="18" height="18" rx="3" stroke="#C95959" strokeWidth="1.8" />
              <path d="M3 9h18" stroke="#C95959" strokeWidth="1.5" />
              <path d="M8 2v4M16 2v4" stroke="#C95959" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M8 13h3m-3 3.5h5" stroke="#C95959" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <span style={{
              color: '#C95959',
              fontSize: isH ? '9px' : '8.5px',
              fontFamily: CF_FONT,
              fontWeight: 600,
              lineHeight: 1.2,
            }}>
              Venc. {p.fecha_vencimiento}
            </span>
          </div>
        )}

        {/* Separador — marginTop auto lo empuja al fondo, justo encima del precio */}
        <div style={{
          borderTop: `1.5px dashed ${CF_SUB}45`,
          marginTop: 'auto',
          marginBottom: isH ? '5px' : '3px',
        }} />

        {/* Label "Precio:" — línea propia, sobre el número */}
        <p style={{
          color: '#94A3B8',
          fontSize: isH ? '8.5px' : '7px',
          fontFamily: CF_FONT,
          fontWeight: 600,
          lineHeight: 1,
          margin: '0 0 2px 0',
        }}>
          Precio:
        </p>

        {/* Fila: número del precio | logo — mismo nivel */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
          {p.precio_contado != null ? (
            <p style={{
              fontWeight: 800,
              fontFamily: CF_FONT,
              lineHeight: 1,
              margin: 0,
              background: CF_PRICE_G,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              flexShrink: 0,
            }}>
              <span style={{ fontSize: currSz, fontWeight: 700 }}>S/</span>
              <span style={{ fontSize: priceSz, fontWeight: 800 }}>
                {p.precio_contado.toFixed(2)}
              </span>
            </p>
          ) : (
            <span style={{ color: '#9CA3AF', fontSize: isH ? '10px' : '8px', fontFamily: CF_FONT, flexShrink: 0 }}>
              Consultar
            </span>
          )}

          {/* Logo laboratorio — mismo nivel que el número */}
          <div style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            maxWidth: isH ? '90px' : '95px',
          }}>
            {logoOk ? (
              <img
                src={logoSrc}
                alt={p.laboratorio}
                onError={() => setLogoExtIdx(i => i + 1)}
                style={{
                  height: isH ? '38px' : '28px',
                  maxWidth: isH ? '88px' : '70px',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            ) : (
              <span style={{
                fontSize: isH ? '9px' : '8px',
                fontWeight: 800,
                color: CF_PRIMARY,
                fontFamily: CF_FONT,
                textAlign: 'center',
                letterSpacing: '0.5px',
                background: `${CF_PRIMARY}12`,
                borderRadius: '6px',
                padding: isH ? '5px 10px' : '4px 8px',
                border: `1px solid ${CF_PRIMARY}25`,
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: isH ? '120px' : '90px',
              }}>
                {p.laboratorio.toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
