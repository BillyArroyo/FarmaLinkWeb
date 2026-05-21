import { Shield } from 'lucide-react';
import { FL } from '../../data/farmalink';

export function Cobranzas() {
  return (
    <div style={{ padding: '28px' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p style={{ fontSize: '24px', fontWeight: 800, color: FL.text }}>Cobranzas Anti-Fraude</p>
          <p style={{ fontSize: '14px', color: FL.textMuted }}>Verificación de autenticidad mediante hash único</p>
        </div>
        <div style={{ background: '#ECFDF5', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={18} color="#16A34A" />
          <div>
            <p style={{ fontSize: '12px', fontWeight: 700, color: '#16A34A' }}>Cobros verificados</p>
            <p style={{ fontSize: '16px', fontWeight: 900, color: '#16A34A' }}>S/. 0.00</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total cobranzas', value: '0', icon: '📋', color: FL.primary, bg: '#EBF7FD' },
          { label: 'Verificadas', value: '0', icon: '✅', color: '#16A34A', bg: '#DCFCE7' },
          { label: 'Alertas', value: '0', icon: '⚠', color: '#CA8A04', bg: '#FEF9C3' },
          { label: 'Monto verificado', value: 'S/. 0.00', icon: '💰', color: FL.secondary, bg: '#EDFAF3' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: '16px', padding: '16px 18px', boxShadow: FL.shadow, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', background: s.bg, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>{s.icon}</div>
            <div>
              <p style={{ fontSize: '22px', fontWeight: 900, color: s.color }}>{s.value}</p>
              <p style={{ fontSize: '11px', color: FL.textMuted }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      <div style={{ background: '#fff', borderRadius: '18px', boxShadow: FL.shadow, padding: '72px 40px', textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', background: '#ECFDF5', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Shield size={30} color="#16A34A" />
        </div>
        <p style={{ fontSize: '18px', fontWeight: 700, color: FL.text, marginBottom: '8px' }}>Sin cobranzas registradas</p>
        <p style={{ fontSize: '14px', color: FL.textMuted, maxWidth: '380px', margin: '0 auto' }}>
          La tabla de cobranzas aún no ha sido creada en Supabase. Los recibos con hash anti-fraude aparecerán aquí cuando se implemente el módulo.
        </p>
      </div>
    </div>
  );
}
