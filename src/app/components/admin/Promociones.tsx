import { MessageCircle, Plus } from 'lucide-react';
import { FL } from '../../data/farmalink';

export function Promociones() {
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

      {/* Empty promos */}
      <div style={{ background: '#fff', borderRadius: '18px', boxShadow: FL.shadow, padding: '56px 40px', textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ width: '64px', height: '64px', background: FL.bg, borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <MessageCircle size={30} color={FL.textMuted} />
        </div>
        <p style={{ fontSize: '18px', fontWeight: 700, color: FL.text, marginBottom: '8px' }}>Sin promociones registradas</p>
        <p style={{ fontSize: '14px', color: FL.textMuted, maxWidth: '380px', margin: '0 auto 20px' }}>
          La tabla de promociones aún no ha sido creada en Supabase. Crea la primera promoción para comenzar.
        </p>
        <button style={{
          background: FL.gradient, borderRadius: '12px', padding: '12px 24px',
          color: '#fff', fontSize: '14px', fontWeight: 700, border: 'none',
          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}>
          <Plus size={18} /> Crear primera promoción
        </button>
      </div>

      {/* WhatsApp preview — static demo */}
      <div style={{ background: '#fff', borderRadius: '18px', padding: '20px', boxShadow: FL.shadow, maxWidth: '480px' }}>
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle size={20} color="#16A34A" />
          <p style={{ fontSize: '16px', fontWeight: 700, color: FL.text }}>Preview mensaje WhatsApp</p>
        </div>
        <div style={{ background: '#DCF8C6', borderRadius: '16px 16px 4px 16px', padding: '14px 16px', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <p style={{ fontSize: '12px', color: '#1A2E3B', lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
            {`🎉 *FarmaLink - Oferta Especial*\n\n💊 *[Nombre de la promoción]*\n📦 [Laboratorio]\n\n[Descripción de la oferta]\n\n⏰ Válido hasta el [fecha]\n\n_FarmaLink Distribuciones · Huancayo, Junín_ 🇵🇪`}
          </p>
          <p style={{ fontSize: '10px', color: '#65B741', textAlign: 'right', marginTop: '6px' }}>11:47 ✓✓</p>
        </div>
        <p style={{ textAlign: 'center', fontSize: '11px', color: FL.textMuted }}>Los mensajes se enviarán vía WhatsApp Business API una vez que se configuren las promociones.</p>
      </div>
    </div>
  );
}
