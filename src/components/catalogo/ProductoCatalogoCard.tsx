import { useState } from 'react';
import { TEAL, BLUE, FONT, NAVY, STORAGE_BASE, labColor, labSlug, detectCat } from '../../lib/catalogo-utils';
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
  };
  numero: number;
  modo: 'vertical' | 'horizontal';
  variant?: 'default' | 'hospital';
}

export function ProductoCatalogoCard({
  producto: p,
  numero,
  modo,
}: ProductoCatalogoCardProps) {
  const [imgErr, setImgErr] = useState(false);
  const [logoOk, setLogoOk] = useState(true);

  const isH = modo === 'horizontal';
  const imgUrl = p.imagenes_urls?.[0] ?? `${STORAGE_BASE}/CanaanFarma/${p.id}.png`;
  const cat = detectCat(p.nombre, p.presentacion);
  const lc = labColor(p.laboratorio);
  const logoPath = `/logos/${labSlug(p.laboratorio)}.png`;

  return (
    <div style={{
      borderRadius: isH ? '20px' : '14px',
      background: '#ffffff',
      boxShadow: '0 4px 18px rgba(13,148,136,0.08), 0 1px 3px rgba(0,0,0,0.04)',
      border: '1px solid #F1F5F9',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
      height: '100%',
      boxSizing: 'border-box',
      fontFamily: FONT,
    }}>
      {/* Number badge — gradient teal→blue */}
      <div style={{
        position: 'absolute',
        top: isH ? '12px' : '8px',
        left: isH ? '12px' : '8px',
        background: `linear-gradient(135deg, ${TEAL} 0%, ${BLUE} 100%)`,
        color: '#ffffff',
        borderRadius: isH ? '10px' : '7px',
        fontWeight: 800,
        fontSize: isH ? '14px' : '10px',
        width: isH ? '32px' : '24px',
        height: isH ? '32px' : '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
        fontFamily: FONT,
        lineHeight: 1,
        boxShadow: '0 3px 10px rgba(13,148,136,0.5)',
      }}>
        {String(numero).padStart(2, '0')}
      </div>

      {/* Lab logo pill — top right */}
      <div style={{
        position: 'absolute',
        top: isH ? '12px' : '8px',
        right: isH ? '12px' : '8px',
        zIndex: 2,
        background: '#ffffff',
        borderRadius: '20px',
        padding: isH ? '3px 9px' : '2px 7px',
        boxShadow: '0 1px 6px rgba(0,0,0,0.10)',
        border: `1px solid ${lc}`,
        maxWidth: isH ? '90px' : '70px',
        height: isH ? '26px' : '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {logoOk ? (
          <img
            src={logoPath}
            alt={p.laboratorio}
            onError={() => setLogoOk(false)}
            style={{
              height: isH ? '16px' : '12px',
              maxWidth: isH ? '78px' : '60px',
              objectFit: 'contain',
            }}
          />
        ) : (
          <span style={{
            fontSize: isH ? '7px' : '5.5px',
            fontWeight: 800,
            color: lc,
            fontFamily: FONT,
            lineHeight: 1,
          }}>
            {p.laboratorio.slice(0, 10).toUpperCase()}
          </span>
        )}
      </div>

      {/* Image zone — clean white */}
      <div style={{
        flex: isH ? 46 : 42,
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        padding: isH ? '34px 22px 12px' : '22px 14px 8px',
        minHeight: 0,
      }}>
        {!imgErr ? (
          <img
            src={imgUrl}
            alt={p.nombre}
            onError={() => setImgErr(true)}
            style={{
              maxHeight: isH ? '210px' : '120px',
              maxWidth: '92%',
              objectFit: 'contain',
              display: 'block',
              filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.10))',
            }}
          />
        ) : (
          <div style={{ opacity: 0.25, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CatIcon cat={cat} size={isH ? 52 : 34} color={TEAL} />
          </div>
        )}
      </div>

      {/* Info zone */}
      <div style={{
        flex: isH ? 54 : 58,
        padding: isH ? '4px 18px 16px' : '4px 12px 11px',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}>
        {/* Product name — 1 line clamp */}
        <p style={{
          color: NAVY,
          fontWeight: 800,
          fontSize: isH ? '17px' : '11.5px',
          lineHeight: 1.2,
          fontFamily: FONT,
          display: '-webkit-box',
          WebkitLineClamp: 1,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          marginBottom: isH ? '4px' : '2px',
        }}>
          {p.nombre}
        </p>

        {/* Concentration — gray, not lab color */}
        {p.concentracion !== null && (
          <p style={{
            color: '#94A3B8',
            fontWeight: 600,
            fontSize: isH ? '13px' : '9px',
            fontFamily: FONT,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            marginBottom: isH ? '12px' : '6px',
          }}>
            {p.concentracion}
          </p>
        )}

        {/* Presentation + inline icon — no wrapper box */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: isH ? '10px' : '6px',
          marginBottom: isH ? '12px' : '7px',
        }}>
          <CatIcon cat={cat} size={isH ? 18 : 12} color={TEAL} />
          <span style={{
            color: '#64748B',
            fontSize: isH ? '12px' : '8px',
            fontFamily: FONT,
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {p.presentacion ?? '—'}
          </span>
        </div>

        {/* Dashed separator */}
        <div style={{
          borderTop: '1.5px dashed #CBD5E1',
          marginTop: 'auto',
          marginBottom: isH ? '10px' : '6px',
        }} />

        {/* Price — centered, teal solid, no badge */}
        <div style={{ textAlign: 'center' }}>
          {p.precio_contado != null ? (
            <p style={{ color: TEAL, fontWeight: 800, fontFamily: FONT, lineHeight: 1, margin: 0 }}>
              <span style={{ fontSize: isH ? '17px' : '11px', fontWeight: 700, marginRight: '3px' }}>S/</span>
              <span style={{ fontSize: isH ? '28px' : '19px', fontWeight: 800 }}>
                {p.precio_contado.toFixed(2)}
              </span>
            </p>
          ) : (
            <span style={{ color: '#9CA3AF', fontSize: isH ? '12px' : '8.5px', fontFamily: FONT }}>
              Consultar precio
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
