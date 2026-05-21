export const FL = {
  primary: '#4AABDB',
  secondary: '#7ECBA1',
  bg: '#F0F8FF',
  text: '#1A2E3B',
  textMuted: '#5B7A8A',
  card: '#FFFFFF',
  border: 'rgba(74,171,219,0.18)',
  shadow: '0 4px 24px rgba(74,171,219,0.14)',
  shadowMd: '0 8px 32px rgba(74,171,219,0.18)',
  gradient: 'linear-gradient(135deg, #4AABDB 0%, #7ECBA1 100%)',
  gradientHero: 'linear-gradient(135deg, #4AABDB 0%, #7ECBA1 60%, #A8E6CF 100%)',
  warning: '#F59E0B',
  danger: '#EF4444',
  success: '#10B981',
  radius: '16px',
};

export const fmt = (n: number) => `S/. ${n.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
