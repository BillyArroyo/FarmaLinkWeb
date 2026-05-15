import { Share2, Download, MessageCircle, CheckCircle } from 'lucide-react';
import { FL } from '../../data/farmalink';

interface Props { onBack: () => void; }

const ITEMS = [
  { nombre: 'Amoxicilina 500mg (Genfar)', cant: 12, precio: 28.50, sub: 342.00 },
  { nombre: 'Paracetamol 1g (MK)', cant: 50, precio: 4.50, sub: 225.00 },
  { nombre: 'Vitamina C 500mg (Bayer)', cant: 20, precio: 8.90, sub: 178.00 },
  { nombre: 'Omeprazol 20mg (Genfar)', cant: 30, precio: 18.90, sub: 567.00 },
  { nombre: 'Complejo B (MK)', cant: 200, precio: 15.20, sub: 3040.00 },
];

const HASH = 'FL2026-A3F9-B8C2-7D1E';
const QR_CELLS = Array.from({ length: 25 }, (_, i) => [0,1,3,5,6,7,8,10,12,14,15,17,19,20,21,22,23,24].includes(i));

export function ReciboDigital({ onBack }: Props) {
  const subtotal = ITEMS.reduce((a, i) => a + i.sub, 0);
  const descuento = 28.50;
  const total = subtotal - descuento;

  return (
    <div style={{ backgroundColor: FL.bg, fontFamily: "'Plus Jakarta Sans', sans-serif", color: FL.text }} className="min-h-full flex flex-col">
      {/* Header */}
      <div style={{ background: FL.gradient }} className="px-4 pt-12 pb-5 flex items-center justify-between">
        <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '12px' }} className="p-2.5">
          ←
        </button>
        <p style={{ color: '#fff', fontSize: '17px', fontWeight: 800 }}>Recibo Digital</p>
        <button style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '12px' }} className="p-2.5">
          <Share2 size={18} color="#fff" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Voucher */}
        <div style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: FL.shadowMd }}>
          {/* Band celeste */}
          <div style={{ background: FL.gradient, padding: '16px 20px' }}>
            <div className="flex items-center justify-between">
              <div>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>RECIBO ELECTRÓNICO</p>
                <p style={{ color: '#fff', fontSize: '20px', fontWeight: 800 }}>N° 001-00234</p>
              </div>
              <div className="text-right">
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>FECHA</p>
                <p style={{ color: '#fff', fontSize: '14px', fontWeight: 700 }}>14/05/2026</p>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>11:47 a.m.</p>
              </div>
            </div>
          </div>

          {/* Company info */}
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${FL.border}` }}>
            <div className="flex items-center gap-3 mb-3">
              <span style={{ fontSize: '28px' }}>💊</span>
              <div>
                <p style={{ fontSize: '16px', fontWeight: 800, color: FL.text }}>FarmaLink Distribuciones</p>
                <p style={{ fontSize: '11px', color: FL.textMuted }}>RUC: 20601234567 · Huancayo, Junín</p>
              </div>
            </div>
            <div style={{ background: FL.bg, borderRadius: '12px', padding: '12px' }}>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p style={{ fontSize: '10px', color: FL.textMuted }}>VENDIDO A</p>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: FL.text }}>Botica San Martín</p>
                  <p style={{ fontSize: '11px', color: FL.textMuted }}>RUC: 10203456789</p>
                </div>
                <div>
                  <p style={{ fontSize: '10px', color: FL.textMuted }}>VENDEDOR</p>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: FL.text }}>Carlos Quispe</p>
                  <p style={{ fontSize: '11px', color: FL.textMuted }}>Zona Norte</p>
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${FL.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', padding: '0 4px' }}>
              <p style={{ fontSize: '10px', fontWeight: 700, color: FL.textMuted }}>PRODUCTO</p>
              <p style={{ fontSize: '10px', fontWeight: 700, color: FL.textMuted }}>CANT.</p>
              <p style={{ fontSize: '10px', fontWeight: 700, color: FL.textMuted }}>P.U.</p>
              <p style={{ fontSize: '10px', fontWeight: 700, color: FL.textMuted }}>SUBTOTAL</p>
            </div>
            {ITEMS.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 4px', borderBottom: `1px solid ${FL.border}` }}>
                <p style={{ fontSize: '11px', color: FL.text, flex: 1, paddingRight: '8px' }}>{item.nombre}</p>
                <p style={{ fontSize: '11px', color: FL.text, width: '32px', textAlign: 'center' }}>{item.cant}</p>
                <p style={{ fontSize: '11px', color: FL.text, width: '48px', textAlign: 'right' }}>{item.precio.toFixed(2)}</p>
                <p style={{ fontSize: '11px', fontWeight: 700, color: FL.text, width: '52px', textAlign: 'right' }}>{item.sub.toFixed(2)}</p>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div style={{ padding: '14px 20px', borderBottom: `1px solid ${FL.border}` }}>
            <div className="flex justify-between mb-1">
              <p style={{ fontSize: '12px', color: FL.textMuted }}>Subtotal</p>
              <p style={{ fontSize: '12px', color: FL.text }}>S/. {subtotal.toFixed(2)}</p>
            </div>
            <div className="flex justify-between mb-1">
              <p style={{ fontSize: '12px', color: FL.secondary }}>Descuento promo (1 Amoxicilina gratis)</p>
              <p style={{ fontSize: '12px', color: FL.secondary, fontWeight: 700 }}>-S/. {descuento.toFixed(2)}</p>
            </div>
            <div style={{ height: '1px', background: FL.border, margin: '8px 0' }} />
            <div className="flex justify-between items-center">
              <p style={{ fontSize: '15px', fontWeight: 800, color: FL.text }}>TOTAL PAGADO</p>
              <p style={{ fontSize: '26px', fontWeight: 900, color: FL.primary }}>S/. {total.toFixed(2)}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
              <span style={{ background: '#EDE9FE', color: '#7C3AED', borderRadius: '8px', padding: '3px 10px', fontSize: '11px', fontWeight: 700 }}>💜 Yape</span>
            </div>
          </div>

          {/* QR */}
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <p style={{ fontSize: '12px', color: FL.textMuted, marginBottom: '12px' }}>Escanea para verificar la autenticidad</p>
            {/* QR simulation */}
            <div style={{ background: '#fff', padding: '12px', borderRadius: '12px', border: `2px solid ${FL.border}` }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 18px)', gap: '3px' }}>
                {QR_CELLS.map((filled, i) => (
                  <div key={i} style={{ width: '18px', height: '18px', background: filled ? FL.text : '#fff', borderRadius: '3px' }} />
                ))}
              </div>
            </div>
            <p style={{ fontSize: '11px', color: FL.textMuted, marginTop: '8px', textAlign: 'center' }}>fl.pe/v/{HASH}</p>

            {/* Verified seal */}
            <div style={{ marginTop: '16px', background: '#ECFDF5', border: `2px solid #BBF7D0`, borderRadius: '14px', padding: '12px 20px', width: '100%', textAlign: 'center' }}>
              <div className="flex items-center justify-center gap-2 mb-1">
                <CheckCircle size={20} color="#16A34A" />
                <p style={{ fontSize: '14px', fontWeight: 800, color: '#16A34A' }}>RECIBO VERIFICADO</p>
              </div>
              <p style={{ fontSize: '10px', color: '#5B7A8A', fontFamily: 'monospace' }}>Hash único: {HASH}</p>
              <p style={{ fontSize: '10px', color: FL.textMuted, marginTop: '2px' }}>Generado por FarmaLink Anti-Fraude · 14/05/2026</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-4 pb-6">
          <button style={{ flex: 1, background: FL.bg, border: `1.5px solid ${FL.border}`, borderRadius: '14px', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: "'Plus Jakarta Sans', sans-serif", cursor: 'pointer' }}>
            <Download size={18} color={FL.primary} />
            <span style={{ fontSize: '13px', fontWeight: 700, color: FL.primary }}>Descargar PDF</span>
          </button>
          <button style={{ flex: 1, background: '#16A34A', borderRadius: '14px', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: "'Plus Jakarta Sans', sans-serif", border: 'none', cursor: 'pointer' }}>
            <MessageCircle size={18} color="#fff" />
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
}
