import type { MedCat } from '../../lib/catalogo-utils';

interface CatIconProps {
  cat: MedCat;
  size?: number;
  color?: string;
}

export function CatIcon({ cat, size = 14, color = '#9CA3AF' }: CatIconProps) {
  const s = { width: size, height: size, flexShrink: 0 as const };
  switch (cat) {
    case 'respiratory':
      return (
        <svg viewBox="0 0 24 24" {...s} fill="none">
          <path d="M12 4v6M8 10c-3 0-5 2-5 5s2 4 4 4 2-2 2-4V10M16 10c3 0 5 2 5 5s-2 4-4 4-2-2-2-4V10" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'pain':
      return (
        <svg viewBox="0 0 24 24" {...s} fill="none">
          <path d="M4 12h4l3-8 4 16 3-8h6" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'cardiac':
      return (
        <svg viewBox="0 0 24 24" {...s} fill="none">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" stroke={color} strokeWidth="1.6" />
        </svg>
      );
    case 'gastro':
      return (
        <svg viewBox="0 0 24 24" {...s} fill="none">
          <ellipse cx="12" cy="12" rx="5" ry="8" stroke={color} strokeWidth="1.5" />
          <path d="M12 4v16" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'neuro':
      return (
        <svg viewBox="0 0 24 24" {...s} fill="none">
          <path d="M12 3a4 4 0 014 4c0 1-.3 2-.8 2.7A3.5 3.5 0 0118 13c0 1.9-1.6 3.5-3.5 3.5H12m0-13a4 4 0 00-4 4c0 1 .3 2 .8 2.7A3.5 3.5 0 006 13c0 1.9 1.6 3.5 3.5 3.5H12m0 0v4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'antibiotic':
      return (
        <svg viewBox="0 0 24 24" {...s} fill="none">
          <circle cx="12" cy="12" r="4" stroke={color} strokeWidth="1.5" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5.64 5.64l2.12 2.12M16.24 16.24l2.12 2.12M5.64 18.36l2.12-2.12M16.24 7.76l2.12-2.12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'optic':
      return (
        <svg viewBox="0 0 24 24" {...s} fill="none">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={color} strokeWidth="1.5" />
          <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.5" />
        </svg>
      );
    case 'derma':
      return (
        <svg viewBox="0 0 24 24" {...s} fill="none">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M14 2v6h6M9 13h6M9 17h4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" {...s} fill="none">
          <path d="M9 3h6l1 4H8L9 3z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
          <rect x="4" y="7" width="16" height="14" rx="2" stroke={color} strokeWidth="1.5" />
          <path d="M12 11v6M9 14h6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
  }
}
