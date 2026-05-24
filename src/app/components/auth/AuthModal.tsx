import { useState } from 'react';
import { X, Mail, Lock, User, Building2, Loader2, Eye, EyeOff } from 'lucide-react';
import { FL } from '../../data/farmalink';
import { signInWithEmail, signUpClient } from '../../../modules/auth/services/authService';
import { useAuthStore } from '../../../store/authStore';
import type { UserProfile } from '../../../modules/auth/types';
import { toast } from 'sonner';

interface Props {
  onSuccess: (user: UserProfile) => void;
  onClose: () => void;
}

export function AuthModal({ onSuccess, onClose }: Props) {
  const { setUser } = useAuthStore();
  const [tab, setTab] = useState<'login' | 'registro'>('login');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [regNombre, setRegNombre] = useState('');
  const [regFarmacia, setRegFarmacia] = useState(
    () => localStorage.getItem('fl_nombre_farmacia') ?? ''
  );
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword) return;
    setLoading(true);
    try {
      const user = await signInWithEmail(loginEmail.trim(), loginPassword);
      setUser(user);
      toast.success(`Bienvenido, ${user.nombre}`);
      onSuccess(user);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNombre.trim() || !regFarmacia.trim() || !regEmail.trim() || !regPassword) return;
    if (regPassword.length < 6) { toast.error('La contraseña debe tener al menos 6 caracteres'); return; }
    setLoading(true);
    try {
      const user = await signUpClient({
        email: regEmail.trim(),
        password: regPassword,
        nombre: regNombre.trim(),
        nombre_farmacia: regFarmacia.trim(),
      });
      setUser(user);
      toast.success('¡Cuenta creada! Ya puedes confirmar tu pedido.');
      onSuccess(user);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px 12px 42px', border: `1.5px solid ${FL.border}`,
    borderRadius: '12px', outline: 'none', fontSize: '14px', color: FL.text,
    fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#fff', boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = { fontSize: '12px', fontWeight: 700, color: FL.textMuted, marginBottom: '6px', display: 'block' };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: '390px',
          padding: '24px 20px 32px', maxHeight: '92vh', overflowY: 'auto',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}>
        {/* Handle */}
        <div style={{ width: '40px', height: '4px', background: FL.border, borderRadius: '2px', margin: '0 auto 20px' }} />

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p style={{ fontSize: '20px', fontWeight: 800, color: FL.text }}>
              {tab === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            </p>
            <p style={{ fontSize: '13px', color: FL.textMuted, marginTop: '2px' }}>
              {tab === 'login' ? 'Para confirmar tu pedido' : 'Gratis — solo unos datos'}
            </p>
          </div>
          <button onClick={onClose} style={{ background: FL.bg, borderRadius: '10px', padding: '8px', border: 'none', cursor: 'pointer' }}>
            <X size={18} color={FL.textMuted} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: FL.bg, borderRadius: '12px', padding: '4px', marginBottom: '20px' }}>
          {(['login', 'registro'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{
                flex: 1, padding: '9px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                background: tab === t ? '#fff' : 'transparent',
                boxShadow: tab === t ? FL.shadow : 'none',
                fontSize: '13px', fontWeight: 700,
                color: tab === t ? FL.primary : FL.textMuted,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                transition: 'all 0.15s',
              }}>
              {t === 'login' ? 'Ya tengo cuenta' : 'Soy nuevo'}
            </button>
          ))}
        </div>

        {/* Login Form */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label style={labelStyle}>Correo electrónico</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color={FL.textMuted} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input type="email" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                  placeholder="tu@correo.com" style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Contraseña</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color={FL.textMuted} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input type={showPassword ? 'text' : 'password'} required value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••" style={{ ...inputStyle, paddingRight: '44px' }} />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  {showPassword ? <EyeOff size={16} color={FL.textMuted} /> : <Eye size={16} color={FL.textMuted} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              style={{
                width: '100%', background: FL.gradient, borderRadius: '14px', padding: '14px', border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                color: '#fff', fontSize: '15px', fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif",
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '4px',
              }}>
              {loading ? <><Loader2 size={18} color="#fff" style={{ animation: 'spin 1s linear infinite' }} /> Iniciando...</> : 'Ingresar'}
            </button>
          </form>
        )}

        {/* Register Form */}
        {tab === 'registro' && (
          <form onSubmit={handleRegistro} className="flex flex-col gap-4">
            <div>
              <label style={labelStyle}>Tu nombre</label>
              <div style={{ position: 'relative' }}>
                <User size={16} color={FL.textMuted} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input required value={regNombre} onChange={e => setRegNombre(e.target.value)}
                  placeholder="Juan Pérez" style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Nombre de tu farmacia</label>
              <div style={{ position: 'relative' }}>
                <Building2 size={16} color={FL.textMuted} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input required value={regFarmacia} onChange={e => setRegFarmacia(e.target.value)}
                  placeholder="Botica San Martín" style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Correo electrónico</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color={FL.textMuted} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input type="email" required value={regEmail} onChange={e => setRegEmail(e.target.value)}
                  placeholder="tu@correo.com" style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Contraseña</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color={FL.textMuted} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input type={showPassword ? 'text' : 'password'} required value={regPassword} onChange={e => setRegPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres" style={{ ...inputStyle, paddingRight: '44px' }} />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  {showPassword ? <EyeOff size={16} color={FL.textMuted} /> : <Eye size={16} color={FL.textMuted} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              style={{
                width: '100%', background: FL.gradient, borderRadius: '14px', padding: '14px', border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                color: '#fff', fontSize: '15px', fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif",
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '4px',
              }}>
              {loading ? <><Loader2 size={18} color="#fff" style={{ animation: 'spin 1s linear infinite' }} /> Creando cuenta...</> : 'Crear cuenta y confirmar'}
            </button>
          </form>
        )}

        <p style={{ fontSize: '11px', color: FL.textMuted, textAlign: 'center', marginTop: '16px', lineHeight: 1.5 }}>
          Al continuar aceptas que tus datos serán usados solo para gestionar tus pedidos B2B.
        </p>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
