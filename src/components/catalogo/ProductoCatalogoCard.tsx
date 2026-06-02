import { useState } from 'react';
import { STORAGE_BASE, detectCat, labLogoPath } from '../../lib/catalogo-utils';
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
  const [logoOk, setLogoOk] = useState(true);

  const isH    = modo === 'horizontal';
  const imgUrl = p.imagenes_urls?.[0] ?? `${STORAGE_BASE}/CanaanFarma/${p.id}.png`;
  const cat    = detectCat(p.nombre, p.presentacion);
  const logo   = labLogoPath(p.laboratorio);

  const radius = '18px';

  // Horizontal 4×1: cards son altas y angostas (portrait dentro de landscape)
  // Vertical 3×3:   cards son más pequeñas
  const numSz  = isH ? '28px' : '20px';
  const nameSz = isH ? '13px' : '10.5px';
  const subSz  = isH ? '10px' : '8px';
  const priceSz= isH ? '26px' : '20px';
  const currSz = isH ? '12px' : '10px';
  const iconSz = isH ? 13    : 10;

  return (
    <div className="cat-card" style={{
      borderRadius: radius,
      backgroundImage: `url('/Fondo2.svg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'top center',
      backgroundColor: '#eaf4fb',
      boxShadow: '0 6px 22px rgba(74,99,217,0.13), 0 1px 4px rgba(0,0,0,0.06)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
      height: '100%',
      boxSizing: 'border-box',
      fontFamily: CF_FONT,
    }}>

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

      {/* ── Zona imagen: la imagen flota en absoluto, no empuja el panel ── */}
      <div style={{
        flex: isH ? '0 0 54%' : '0 0 42%',
        position: 'relative',
        minHeight: 0,
        overflow: 'visible',
      }}>
        {!imgErr ? (
          <img
            src={imgUrl}
            alt={p.nombre}
            onError={() => setImgErr(true)}
            style={{
              position: 'absolute',
              bottom: isH ? '-28px' : '-10px',
              left: '50%',
              transform: 'translateX(-50%)',
              maxHeight: isH ? '290px' : '112px',
              maxWidth: '92%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 14px 22px rgba(74,99,217,0.22)) drop-shadow(0 4px 8px rgba(0,0,0,0.13))',
              zIndex: 3,
            }}
          />
        ) : (
          <div style={{ position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)', opacity: 0.3 }}>
            <CatIcon cat={cat} size={isH ? 56 : 38} color={CF_SUB} />
          </div>
        )}
      </div>

      {/* ── Panel info blanco ── */}
      <div style={{
        flex: 1,
        background: 'rgba(255,255,255,0.97)',
        borderRadius: '18px 18px 18px 18px',
        padding: isH ? '32px 16px 14px' : '13px 10px 9px',
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
            fontSize: isH ? '8px' : '5.5px',
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
          fontSize: isH ? nameSz : '9.5px',
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
              fontSize: isH ? '9px' : '7px',
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
            maxWidth: isH ? '85px' : '62px',
            overflow: 'hidden',
          }}>
            {logoOk ? (
              <img
                src={logo}
                alt={p.laboratorio}
                onError={() => setLogoOk(false)}
                style={{
                  height: isH ? '38px' : '26px',
                  maxWidth: isH ? '83px' : '60px',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            ) : (
              <span style={{
                fontSize: isH ? '9px' : '7px',
                fontWeight: 800,
                color: CF_PRIMARY,
                fontFamily: CF_FONT,
                textAlign: 'center',
                letterSpacing: '0.5px',
                background: `${CF_PRIMARY}12`,
                borderRadius: '6px',
                padding: isH ? '5px 10px' : '3px 6px',
                border: `1px solid ${CF_PRIMARY}25`,
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: isH ? '120px' : '58px',
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
