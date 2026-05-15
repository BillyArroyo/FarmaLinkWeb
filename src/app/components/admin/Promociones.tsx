import { useState } from 'react';
import { MessageCircle, Plus, Send, Users, Check } from 'lucide-react';
import { FL } from '../../data/farmalink';

const PROMOS_ACTIVAS = [
  { id: 1, titulo: 'Amoxicilina 12+1 GRATIS', lab: 'Genfar', desc: 'Por cada 12 cajas compradas, lleva 1 adicional sin costo', zonas: ['Norte', 'Sur', 'Centro'], vence: '31/05/2026', clientes: 18, activa: true, color: '#4AABDB' },
  { id: 2, titulo: 'Vitamina C 10+2 GRATIS', lab: 'Bayer', desc: 'Por cada 10 frascos comprados, lleva 2 adicionales sin costo', zonas: ['Norte', 'Centro'], vence: '20/05/2026', clientes: 12, activa: true, color: '#7ECBA1' },
  { id: 3, titulo: '3x2 en Paracetamol 1g', lab: 'MK', desc: 'Lleva 3 cajas al precio de 2 en todos los tamaños', zonas: ['Sur'], vence: '15/05/2026', clientes: 8, activa: false, color: '#F87171' },
];

const ZONAS_CLIENTES = [
  { zona: 'Zona Norte', clientes: 12, tel: ['064-234567', '064-235789'] },
  { zona: 'Zona Sur', clientes: 9, tel: [] },
  { zona: 'Zona Centro', clientes: 15, tel: [] },
];

export function Promociones() {
  const [zonasSelected, setZonasSelected] = useState<string[]>(['Zona Norte', 'Zona Centro']);
  const [mensajeEnviado, setMensajeEnviado] = useState(false);
  const [promoSelected, setPromoSelected] = useState(0);

  const clientesSeleccionados = ZONAS_CLIENTES.filter(z => zonasSelected.includes(z.zona)).reduce((a, z) => a + z.clientes, 0);

  const mensajeWhatsApp = `🎉 *FarmaLink - Oferta Especial*\n\n💊 *${PROMOS_ACTIVAS[promoSelected].titulo}*\n📦 ${PROMOS_ACTIVAS[promoSelected].lab}\n\n${PROMOS_ACTIVAS[promoSelected].desc}\n\n⏰ Válido hasta el ${PROMOS_ACTIVAS[promoSelected].vence}\n\n¿Te interesa? Contacta a tu vendedor asignado:\n📞 Carlos Quispe: 987-654-321\n\n_FarmaLink Distribuciones · Huancayo, Junín_ 🇵🇪`;

  const handleEnviar = () => { setMensajeEnviado(true); setTimeout(() => setMensajeEnviado(false), 3000); };

  return (
    <div style={{ padding: '28px' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p style={{ fontSize: '24px', fontWeight: 800, color: FL.text }}>Promociones & WhatsApp</p>
          <p style={{ fontSize: '14px', color: FL.textMuted }}>Gestiona promos y envíos masivos</p>
        </div>
        <button style={{ background: FL.gradient, borderRadius: '12px', padding: '10px 20px', color: '#fff', fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          <Plus size={18} color="#fff" />
          Nueva promoción
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Promos grid */}
        {PROMOS_ACTIVAS.map((promo, i) => (
          <div key={promo.id} onClick={() => setPromoSelected(i)}
            style={{ background: '#fff', borderRadius: '18px', boxShadow: i === promoSelected ? `0 8px 32px ${promo.color}35` : FL.shadow, border: i === promoSelected ? `2px solid ${promo.color}` : '2px solid transparent', cursor: 'pointer', overflow: 'hidden', transition: 'all 0.2s' }}>
            <div style={{ background: `linear-gradient(135deg, ${promo.color}20, ${promo.color}40)`, padding: '16px 18px' }}>
              <div className="flex items-center justify-between mb-2">
                <span style={{ background: promo.activa ? '#DCFCE7' : '#F3F4F6', color: promo.activa ? '#16A34A' : '#6B7280', borderRadius: '8px', padding: '3px 9px', fontSize: '11px', fontWeight: 700 }}>
                  {promo.activa ? '● Activa' : '○ Inactiva'}
                </span>
                <span style={{ background: '#fff', borderRadius: '8px', padding: '3px 9px', fontSize: '11px', fontWeight: 600, color: FL.textMuted }}>Vence {promo.vence}</span>
              </div>
              <p style={{ fontSize: '16px', fontWeight: 800, color: FL.text }}>{promo.titulo}</p>
              <p style={{ fontSize: '12px', color: promo.color, fontWeight: 600 }}>{promo.lab}</p>
            </div>
            <div style={{ padding: '14px 18px' }}>
              <p style={{ fontSize: '12px', color: FL.textMuted, marginBottom: '10px', lineHeight: 1.5 }}>{promo.desc}</p>
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {promo.zonas.map(z => (
                    <span key={z} style={{ background: FL.bg, color: FL.textMuted, borderRadius: '6px', padding: '2px 7px', fontSize: '10px', fontWeight: 600 }}>{z}</span>
                  ))}
                </div>
                <span style={{ fontSize: '12px', color: FL.primary, fontWeight: 700 }}>{promo.clientes} clientes</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Selector de zonas */}
        <div style={{ background: '#fff', borderRadius: '18px', padding: '20px', boxShadow: FL.shadow }}>
          <div className="flex items-center gap-2 mb-4">
            <Users size={20} color={FL.primary} />
            <p style={{ fontSize: '16px', fontWeight: 700, color: FL.text }}>Seleccionar clientes</p>
          </div>
          <div className="flex flex-col gap-3">
            {ZONAS_CLIENTES.map(z => {
              const sel = zonasSelected.includes(z.zona);
              return (
                <div key={z.zona} onClick={() => setZonasSelected(prev => sel ? prev.filter(x => x !== z.zona) : [...prev, z.zona])}
                  style={{ background: sel ? FL.primary + '10' : FL.bg, border: `2px solid ${sel ? FL.primary : FL.border}`, borderRadius: '14px', padding: '14px 16px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '8px', background: sel ? FL.gradient : 'transparent', border: `2px solid ${sel ? 'transparent' : '#D1D5DB'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {sel && <Check size={14} color="#fff" />}
                  </div>
                  <div className="flex-1">
                    <p style={{ fontSize: '14px', fontWeight: 700, color: sel ? FL.primary : FL.text }}>{z.zona}</p>
                    <p style={{ fontSize: '12px', color: FL.textMuted }}>{z.clientes} farmacias/boticas</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ background: FL.bg, borderRadius: '12px', padding: '12px 16px', marginTop: '16px', display: 'flex', alignItems: 'center', justify: 'space-between', gap: '8px' }}>
            <Users size={16} color={FL.primary} />
            <p style={{ fontSize: '13px', color: FL.text }}><span style={{ fontWeight: 800, color: FL.primary }}>{clientesSeleccionados}</span> clientes recibirán el mensaje</p>
          </div>
        </div>

        {/* Preview + envío */}
        <div style={{ background: '#fff', borderRadius: '18px', padding: '20px', boxShadow: FL.shadow }}>
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle size={20} color="#16A34A" />
            <p style={{ fontSize: '16px', fontWeight: 700, color: FL.text }}>Preview mensaje WhatsApp</p>
          </div>
          {/* WhatsApp bubble */}
          <div style={{ background: '#DCF8C6', borderRadius: '16px 16px 4px 16px', padding: '14px 16px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <p style={{ fontSize: '12px', color: '#1A2E3B', lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{mensajeWhatsApp}</p>
            <p style={{ fontSize: '10px', color: '#65B741', textAlign: 'right', marginTop: '6px' }}>11:47 ✓✓</p>
          </div>
          <button onClick={handleEnviar}
            style={{ width: '100%', background: mensajeEnviado ? '#16A34A' : '#25D366', borderRadius: '14px', padding: '14px', color: '#fff', fontSize: '15px', fontWeight: 800, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'all 0.3s' }}>
            {mensajeEnviado ? <><Check size={20} /> ¡Enviado a {clientesSeleccionados} clientes!</> : <><Send size={20} /> Enviar a {clientesSeleccionados} clientes por WhatsApp</>}
          </button>
          <p style={{ textAlign: 'center', fontSize: '11px', color: FL.textMuted, marginTop: '8px' }}>Los mensajes se enviarán vía WhatsApp Business API</p>
        </div>
      </div>
    </div>
  );
}
