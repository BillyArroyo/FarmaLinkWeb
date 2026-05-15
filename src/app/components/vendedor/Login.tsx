import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { FL } from '../../data/farmalink';

interface Props { onLogin: (role: string) => void; }

export function Login({ onLogin }: Props) {
  const [role, setRole] = useState<'vendedor' | 'administrador'>('vendedor');
  const [email, setEmail] = useState('carlos.quispe@farmalink.pe');
  const [pass, setPass] = useState('••••••••');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(role); }, 1200);
  };

  return (
    <div style={{ background: FL.gradient, fontFamily: "'Plus Jakarta Sans', sans-serif", minHeight: '100%' }} className="flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Decorative circles */}
      <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
      <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
      <div style={{ position: 'absolute', top: '40%', left: '-40px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

      {/* Logo */}
      <div className="text-center mb-8">
        <div style={{ width: '72px', height: '72px', background: 'rgba(255,255,255,0.2)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', backdropFilter: 'blur(10px)', border: '1.5px solid rgba(255,255,255,0.3)' }}>
          <span style={{ fontSize: '32px' }}>💊</span>
        </div>
        <p style={{ color: '#fff', fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px' }}>FarmaLink</p>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', marginTop: '4px' }}>Distribución farmacéutica · Huancayo</p>
      </div>

      {/* Floating card */}
      <div style={{ background: '#fff', borderRadius: '24px', padding: '28px 24px', width: '100%', maxWidth: '360px', boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}>
        <p style={{ fontSize: '22px', fontWeight: 800, color: FL.text, marginBottom: '6px' }}>Bienvenido 👋</p>
        <p style={{ fontSize: '13px', color: FL.textMuted, marginBottom: '20px' }}>Ingresa a tu cuenta para continuar</p>

        {/* Role selector */}
        <div style={{ background: FL.bg, borderRadius: '14px', padding: '4px', display: 'flex', gap: '4px', marginBottom: '20px' }}>
          {(['vendedor', 'administrador'] as const).map(r => (
            <button key={r} onClick={() => setRole(r)}
              style={{
                flex: 1, borderRadius: '10px', padding: '9px', fontSize: '13px', fontWeight: 700,
                background: role === r ? FL.gradient : 'transparent',
                color: role === r ? '#fff' : FL.textMuted,
                transition: 'all 0.2s',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                border: 'none',
                textTransform: 'capitalize',
              }}>
              {r === 'vendedor' ? '🚗 Vendedor' : '🏢 Administrador'}
            </button>
          ))}
        </div>

        {/* Email */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', fontWeight: 700, color: FL.textMuted, display: 'block', marginBottom: '6px' }}>CORREO ELECTRÓNICO</label>
          <div style={{ background: FL.bg, borderRadius: '12px', border: `1.5px solid ${FL.border}`, display: 'flex', alignItems: 'center', padding: '12px 14px', gap: '10px' }}>
            <Mail size={16} color={FL.primary} />
            <input value={email} onChange={e => setEmail(e.target.value)}
              style={{ background: 'none', border: 'none', outline: 'none', flex: 1, fontSize: '14px', color: FL.text, fontFamily: "'Plus Jakarta Sans', sans-serif" }} />
          </div>
        </div>

        {/* Password */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '12px', fontWeight: 700, color: FL.textMuted, display: 'block', marginBottom: '6px' }}>CONTRASEÑA</label>
          <div style={{ background: FL.bg, borderRadius: '12px', border: `1.5px solid ${FL.border}`, display: 'flex', alignItems: 'center', padding: '12px 14px', gap: '10px' }}>
            <Lock size={16} color={FL.primary} />
            <input type={showPass ? 'text' : 'password'} value={pass} onChange={e => setPass(e.target.value)}
              style={{ background: 'none', border: 'none', outline: 'none', flex: 1, fontSize: '14px', color: FL.text, fontFamily: "'Plus Jakarta Sans', sans-serif" }} />
            <button onClick={() => setShowPass(!showPass)}>
              {showPass ? <EyeOff size={16} color={FL.textMuted} /> : <Eye size={16} color={FL.textMuted} />}
            </button>
          </div>
        </div>

        <button onClick={handleLogin} disabled={loading}
          style={{ width: '100%', background: loading ? '#D1D5DB' : FL.gradient, borderRadius: '14px', padding: '14px', color: '#fff', fontSize: '15px', fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'all 0.3s', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? '⏳ Verificando...' : `Ingresar como ${role === 'vendedor' ? 'Vendedor' : 'Admin'}`}
        </button>

        <button style={{ width: '100%', marginTop: '12px', background: 'none', border: 'none', color: FL.primary, fontSize: '13px', fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif", cursor: 'pointer' }}>
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginTop: '24px', textAlign: 'center' }}>
        FarmaLink © 2026 · Huancayo, Perú 🇵🇪
      </p>
    </div>
  );
}
