import { useState } from 'react';
import { ArrowLeft, MessageCircle, Banknote, Smartphone, CreditCard, Building2 } from 'lucide-react';
import { FL, fmt } from '../../data/farmalink';

interface Props { onBack: () => void; onGenerar: () => void; }

const METODOS = [
  { id: 'efectivo', label: 'Efectivo', icon: Banknote, color: '#16A34A', bg: '#DCFCE7', emoji: '💵' },
  { id: 'yape', label: 'Yape', icon: Smartphone, color: '#7C3AED', bg: '#EDE9FE', emoji: '🟣' },
  { id: 'plin', label: 'Plin', icon: Smartphone, color: '#0EA5E9', bg: '#E0F2FE', emoji: '🔵' },
  { id: 'transferencia', label: 'Transferencia', icon: Building2, color: '#0369A1', bg: '#E0F2FE', emoji: '🏦' },
];

export function RegistrarCobro({ onBack, onGenerar }: Props) {
  const [metodo, setMetodo] = useState('yape');
  const [whatsapp, setWhatsapp] = useState(true);
  const [ref, setRef] = useState('');
  const monto = 4280.00;

  return (
    <div style={{ backgroundColor: FL.bg, fontFamily: "'Plus Jakarta Sans', sans-serif", color: FL.text }} className="min-h-full flex flex-col">
      {/* Header */}
      <div style={{ background: FL.gradient, borderRadius: '0 0 24px 24px' }} className="px-4 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '12px' }} className="p-2.5">
            <ArrowLeft size={18} color="#fff" />
          </button>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>Registrar cobro</p>
            <p style={{ color: '#fff', fontSize: '17px', fontWeight: 800 }}>Botica San Martín</p>
          </div>
        </div>
        {/* Monto grande */}
        <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '20px', padding: '20px 16px', textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', marginBottom: '4px' }}>Monto a cobrar · PED-001</p>
          <p style={{ color: '#fff', fontSize: '42px', fontWeight: 900, letterSpacing: '-1px' }}>S/. 4,280.00</p>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginTop: '4px' }}>5 productos · Pedido del 14/05/2026</p>
        </div>
      </div>

      <div className="px-4 mt-5 flex-1 overflow-y-auto pb-32">
        {/* Método de pago */}
        <p style={{ fontSize: '13px', fontWeight: 700, color: FL.textMuted, marginBottom: '10px' }}>MÉTODO DE PAGO</p>
        <div className="grid grid-cols-2 gap-3 mb-5">
          {METODOS.map(m => {
            const Icon = m.icon;
            const activo = metodo === m.id;
            return (
              <button key={m.id} onClick={() => setMetodo(m.id)}
                style={{
                  background: activo ? m.bg : '#fff',
                  border: `2px solid ${activo ? m.color : FL.border}`,
                  borderRadius: '16px', padding: '16px 14px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                  transition: 'all 0.2s', cursor: 'pointer',
                  boxShadow: activo ? `0 4px 16px ${m.color}30` : FL.shadow,
                }}>
                <div style={{ width: '48px', height: '48px', background: activo ? m.color : m.bg, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                  <span style={{ fontSize: '24px' }}>{m.emoji}</span>
                </div>
                <p style={{ fontSize: '14px', fontWeight: 700, color: activo ? m.color : FL.text }}>{m.label}</p>
                {activo && <div style={{ width: '6px', height: '6px', background: m.color, borderRadius: '50%' }} />}
              </button>
            );
          })}
        </div>

        {/* Número de referencia */}
        <p style={{ fontSize: '13px', fontWeight: 700, color: FL.textMuted, marginBottom: '8px' }}>REFERENCIA / OPERACIÓN (OPCIONAL)</p>
        <div style={{ background: '#fff', borderRadius: '12px', border: `1.5px solid ${FL.border}`, display: 'flex', alignItems: 'center', padding: '12px 14px', gap: '10px', marginBottom: '20px' }}>
          <CreditCard size={16} color={FL.textMuted} />
          <input value={ref} onChange={e => setRef(e.target.value)} placeholder="Ej: 00847291 (N° de operación Yape)"
            style={{ background: 'none', border: 'none', outline: 'none', flex: 1, fontSize: '14px', color: FL.text, fontFamily: "'Plus Jakarta Sans', sans-serif" }} />
        </div>

        {/* Desglose */}
        <div style={{ background: '#fff', borderRadius: FL.radius, boxShadow: FL.shadow, padding: '16px', marginBottom: '20px' }}>
          <p style={{ fontSize: '13px', fontWeight: 700, color: FL.text, marginBottom: '10px' }}>Resumen del pedido</p>
          {[
            { label: 'Amoxicilina 500mg × 12', val: 'S/. 342.00' },
            { label: 'Paracetamol 1g × 50', val: 'S/. 225.00' },
            { label: 'Vitamina C 500mg × 20', val: 'S/. 178.00' },
            { label: '+ 2 productos más...', val: 'S/. 3,535.00' },
          ].map(item => (
            <div key={item.label} className="flex justify-between py-1">
              <p style={{ fontSize: '12px', color: FL.textMuted }}>{item.label}</p>
              <p style={{ fontSize: '12px', color: FL.text }}>{item.val}</p>
            </div>
          ))}
          <div style={{ height: '1px', background: FL.border, margin: '8px 0' }} />
          <div className="flex justify-between">
            <p style={{ fontSize: '14px', fontWeight: 700, color: FL.text }}>Total a cobrar</p>
            <p style={{ fontSize: '18px', fontWeight: 900, color: FL.primary }}>S/. 4,280.00</p>
          </div>
        </div>

        {/* WhatsApp toggle */}
        <div style={{ background: '#fff', borderRadius: FL.radius, boxShadow: FL.shadow, padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '44px', height: '44px', background: '#DCFCE7', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageCircle size={22} color="#16A34A" />
          </div>
          <div className="flex-1">
            <p style={{ fontSize: '14px', fontWeight: 700, color: FL.text }}>Enviar comprobante por WhatsApp</p>
            <p style={{ fontSize: '12px', color: FL.textMuted }}>A: 064-234567 · Gonzalo Martínez</p>
          </div>
          <button onClick={() => setWhatsapp(!whatsapp)}
            style={{ width: '48px', height: '28px', borderRadius: '14px', background: whatsapp ? FL.secondary : '#D1D5DB', transition: 'all 0.3s', border: 'none', cursor: 'pointer', position: 'relative' }}>
            <div style={{ width: '22px', height: '22px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', transition: 'all 0.3s', left: whatsapp ? '23px' : '3px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
          </button>
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: '#fff', borderTop: `1px solid ${FL.border}`, padding: '16px' }}>
        <button onClick={onGenerar}
          style={{ width: '100%', background: FL.gradient, borderRadius: '16px', padding: '16px', color: '#fff', fontSize: '16px', fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif", border: 'none', cursor: 'pointer', boxShadow: FL.shadowMd }}>
          📄 Generar Recibo Digital
        </button>
        <p style={{ textAlign: 'center', fontSize: '11px', color: FL.textMuted, marginTop: '8px' }}>El recibo incluirá un hash único de verificación anti-fraude</p>
      </div>
    </div>
  );
}
