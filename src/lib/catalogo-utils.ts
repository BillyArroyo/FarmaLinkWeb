export const TEAL   = '#0D9488';
export const BLUE   = '#0891B2';
export const PURPLE = '#7C3AED';
export const NAVY   = '#0F2137';
export const GRAD   = `linear-gradient(135deg, ${TEAL} 0%, ${BLUE} 50%, ${PURPLE} 100%)`;
export const FONT   = "'Plus Jakarta Sans', 'Poppins', sans-serif";
export const STORAGE_BASE = 'https://xbjniegnmwqzrrmwfimz.supabase.co/storage/v1/object/public/imagenes-productos';

export const LAB_COLORS = [
  '#7C3AED',
  '#0D9488',
  '#0891B2',
  '#0E7490',
  '#6D28D9',
  '#0369A1',
  '#14B8A6',
  '#0284C7',
  '#8B5CF6',
  '#115E59',
];

export function labColor(lab: string): string {
  let hash = 0;
  for (const c of lab) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
  return LAB_COLORS[Math.abs(hash) % LAB_COLORS.length];
}

export function labSlug(lab: string): string {
  return lab
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export type MedCat =
  | 'respiratory'
  | 'pain'
  | 'cardiac'
  | 'gastro'
  | 'neuro'
  | 'antibiotic'
  | 'optic'
  | 'derma'
  | 'general';

export function detectCat(nombre: string, presentacion: string | null): MedCat {
  const t = (nombre + ' ' + (presentacion ?? '')).toLowerCase();
  if (/pulm|bronq|asma|tos |gripe|resfri|sinusit|alerg|antihistam|loratad|cetirizin/.test(t)) return 'respiratory';
  if (/dolor|analg|ibuprofeno|naprox|diclofenac|acetaminofen|paracetamol|articular|reuma/.test(t)) return 'pain';
  if (/cardiac|corazon|presion|atenolol|amlodipino|losartan|enalapril|hipertens/.test(t)) return 'cardiac';
  if (/gastro|omeprazol|ranitidina|estomago|acidez|gastrit|antiácid|laxant|diarrea|colitis/.test(t)) return 'gastro';
  if (/neuro|epilep|convuls|ansied|depres|antidepresi|antipsicot|alzheimer|parkinson/.test(t)) return 'neuro';
  if (/antibiotic|amoxicil|azitromicin|ciproflox|levofloxacin|cefalexin|penicil/.test(t)) return 'antibiotic';
  if (/oftalmolog|ojo|ocular|colirio|glaucoma/.test(t)) return 'optic';
  if (/derma|eczema|acne|psoriasis|hongos|antifungal|clotrimaz/.test(t)) return 'derma';
  return 'general';
}
