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

export const PRODUCTOS = [
  { id: 1, nombre: 'Amoxicilina 500mg', lab: 'Genfar', precio: 28.50, categoria: 'Antibióticos', stock: 250, promo: '12+1 GRATIS', promoX: 12, promoY: 1, color: '#4AABDB', presentaciones: ['Caja 100 tab', 'Caja 500 tab', 'Frasco 50 tab'], descripcion: 'Antibiótico de amplio espectro para infecciones bacterianas. Alta biodisponibilidad oral.' },
  { id: 2, nombre: 'Paracetamol 1g', lab: 'MK', precio: 4.50, categoria: 'Analgésicos', stock: 500, promo: null, color: '#7ECBA1', presentaciones: ['Caja 100 tab', 'Caja 500 tab'], descripcion: 'Analgésico y antipirético de amplio uso. Seguro para todas las edades.' },
  { id: 3, nombre: 'Omeprazol 20mg', lab: 'Genfar', precio: 18.90, categoria: 'Gastroenterología', stock: 180, promo: null, color: '#34D399', presentaciones: ['Caja 28 cap', 'Caja 56 cap'], descripcion: 'Inhibidor de la bomba de protones. Tratamiento de úlcera péptica y ERGE.' },
  { id: 4, nombre: 'Ibuprofeno 400mg', lab: 'Roemmers', precio: 12.30, categoria: 'Analgésicos', stock: 300, promo: null, color: '#60A5FA', presentaciones: ['Caja 100 tab', 'Caja 500 tab'], descripcion: 'Antiinflamatorio no esteroideo. Analgésico y antipirético.' },
  { id: 5, nombre: 'Metformina 850mg', lab: 'Farmindustria', precio: 22.80, categoria: 'Diabetes', stock: 150, promo: null, color: '#F59E0B', presentaciones: ['Caja 30 tab', 'Caja 60 tab', 'Caja 90 tab'], descripcion: 'Antidiabético oral de primera línea para diabetes mellitus tipo 2.' },
  { id: 6, nombre: 'Atorvastatina 20mg', lab: 'Pfizer', precio: 45.60, categoria: 'Cardiología', stock: 80, promo: null, color: '#F87171', presentaciones: ['Caja 28 tab', 'Caja 56 tab'], descripcion: 'Hipolipemiante. Reduce colesterol LDL y triglicéridos. Prevención cardiovascular.' },
  { id: 7, nombre: 'Vitamina C 500mg', lab: 'Bayer', precio: 8.90, categoria: 'Vitaminas', stock: 400, promo: '10+2 GRATIS', promoX: 10, promoY: 2, color: '#FBBF24', presentaciones: ['Frasco 60 tab', 'Frasco 120 tab'], descripcion: 'Antioxidante esencial. Refuerza el sistema inmunológico y absorción de hierro.' },
  { id: 8, nombre: 'Complejo B', lab: 'MK', precio: 15.20, categoria: 'Vitaminas', stock: 320, promo: null, color: '#A78BFA', presentaciones: ['Caja 30 tab', 'Caja 60 tab'], descripcion: 'Vitaminas del complejo B para el sistema nervioso y metabolismo energético.' },
  { id: 9, nombre: 'Loratadina 10mg', lab: 'Genfar', precio: 9.80, categoria: 'Pediátricos', stock: 220, promo: null, color: '#6EE7B7', presentaciones: ['Caja 30 tab', 'Jarabe 120ml'], descripcion: 'Antihistamínico de segunda generación. Tratamiento de alergias sin somnolencia.' },
  { id: 10, nombre: 'Ciprofloxacino 500mg', lab: 'Roemmers', precio: 35.40, categoria: 'Antibióticos', stock: 140, promo: null, color: '#4AABDB', presentaciones: ['Caja 14 tab', 'Caja 28 tab'], descripcion: 'Antibiótico fluoroquinolónico de amplio espectro.' },
  { id: 11, nombre: 'Losartán 50mg', lab: 'Farmindustria', precio: 32.10, categoria: 'Cardiología', stock: 190, promo: null, color: '#F87171', presentaciones: ['Caja 30 tab', 'Caja 60 tab'], descripcion: 'Antihipertensivo antagonista de angiotensina II.' },
  { id: 12, nombre: 'Betametasona 0.05%', lab: 'Farmindustria', precio: 18.40, categoria: 'Dermatología', stock: 95, promo: null, color: '#F9A8D4', presentaciones: ['Crema 30g', 'Crema 60g', 'Loción 60ml'], descripcion: 'Corticoide tópico para dermatitis, eczema y psoriasis.' },
  { id: 13, nombre: 'Clonazepam 2mg', lab: 'Roche', precio: 28.90, categoria: 'Neurología', stock: 60, promo: null, color: '#C4B5FD', presentaciones: ['Caja 30 tab', 'Caja 60 tab'], descripcion: 'Benzodiazepina antiepiléptica. Control de crisis convulsivas.' },
  { id: 14, nombre: 'Fluconazol 150mg', lab: 'Genfar', precio: 15.60, categoria: 'Dermatología', stock: 200, promo: null, color: '#F9A8D4', presentaciones: ['Cápsula 1 unid', 'Caja 4 cap'], descripcion: 'Antifúngico triazólico para candidiasis sistémica y superficial.' },
  { id: 15, nombre: 'Salbutamol 100mcg', lab: 'GlaxoSmithKline', precio: 42.80, categoria: 'Pediátricos', stock: 110, promo: null, color: '#86EFAC', presentaciones: ['Inhaler 200 dosis', 'Jarabe 120ml'], descripcion: 'Broncodilatador adrenérgico. Tratamiento del asma bronquial.' },
];

export const CLIENTES = [
  { id: 1, nombre: 'Botica San Martín', propietario: 'Gonzalo Martínez', dir: 'Jr. Real 420, Huancayo', tel: '064-234567', deuda: 4280.00, estado: 'Al día', zona: 'Norte', lat: -12.065, lng: -75.204, vendedor: 'Carlos Quispe' },
  { id: 2, nombre: 'Farmacia Los Andes', propietario: 'Carmen Flores', dir: 'Av. Ferrocarril 891, Huancayo', tel: '064-234890', deuda: 8150.00, estado: 'Por vencer', zona: 'Sur', lat: -12.072, lng: -75.211, vendedor: 'María Huanca' },
  { id: 3, nombre: 'Botica El Progreso', propietario: 'Ricardo Torres', dir: 'Jr. Puno 156, Huancayo', tel: '064-235123', deuda: 0, estado: 'Al día', zona: 'Centro', lat: -12.068, lng: -75.208, vendedor: 'José Bellido' },
  { id: 4, nombre: 'Farmacia Central', propietario: 'Elena Quispe', dir: 'Jr. Lima 78, Huancayo', tel: '064-235456', deuda: 1890.00, estado: 'Vencido', zona: 'Centro', lat: -12.066, lng: -75.206, vendedor: 'Carlos Quispe' },
  { id: 5, nombre: 'Botica Mariátegui', propietario: 'Pedro Salas', dir: 'Av. Huancavelica 234, Huancayo', tel: '064-235789', deuda: 2340.00, estado: 'Por vencer', zona: 'Norte', lat: -12.063, lng: -75.202, vendedor: 'María Huanca' },
];

export const VENDEDORES = [
  { id: 1, nombre: 'Carlos Quispe', zona: 'Zona Norte', pedidos: 8, cobrado: 4280.00, clientes: 12, meta: 6000, avatar: 'CQ' },
  { id: 2, nombre: 'María Huanca', zona: 'Zona Sur', pedidos: 6, cobrado: 3150.00, clientes: 9, meta: 5000, avatar: 'MH' },
  { id: 3, nombre: 'José Bellido', zona: 'Zona Centro', pedidos: 10, cobrado: 5890.00, clientes: 15, meta: 7000, avatar: 'JB' },
];

export const PEDIDOS = [
  { id: 'PED-001', cliente: 'Botica San Martín', vendedor: 'Carlos Quispe', fecha: '14/05/2026', hora: '08:32', monto: 4280.00, estado: 'Cobrado', metodo: 'Yape', items: 5 },
  { id: 'PED-002', cliente: 'Farmacia Los Andes', vendedor: 'María Huanca', fecha: '14/05/2026', hora: '09:15', monto: 1850.00, estado: 'Pendiente', metodo: '-', items: 3 },
  { id: 'PED-003', cliente: 'Botica El Progreso', vendedor: 'José Bellido', fecha: '14/05/2026', hora: '10:05', monto: 3290.00, estado: 'Cobrado', metodo: 'Transferencia', items: 7 },
  { id: 'PED-004', cliente: 'Farmacia Central', vendedor: 'Carlos Quispe', fecha: '14/05/2026', hora: '10:48', monto: 980.00, estado: 'Observado', metodo: '-', items: 2 },
  { id: 'PED-005', cliente: 'Botica Mariátegui', vendedor: 'María Huanca', fecha: '14/05/2026', hora: '11:30', monto: 2140.00, estado: 'Confirmado', metodo: '-', items: 4 },
  { id: 'PED-006', cliente: 'Botica San Martín', vendedor: 'José Bellido', fecha: '13/05/2026', hora: '14:20', monto: 5670.00, estado: 'Cobrado', metodo: 'Plin', items: 8 },
  { id: 'PED-007', cliente: 'Farmacia Los Andes', vendedor: 'Carlos Quispe', fecha: '13/05/2026', hora: '15:10', monto: 3420.00, estado: 'Cobrado', metodo: 'Efectivo', items: 6 },
];

export const VENTAS_SEMANA = [
  { dia: 'Lun', monto: 12400 },
  { dia: 'Mar', monto: 18600 },
  { dia: 'Mié', monto: 15200 },
  { dia: 'Jue', monto: 21800 },
  { dia: 'Vie', monto: 19300 },
  { dia: 'Sáb', monto: 14100 },
  { dia: 'Hoy', monto: 13310 },
];

export const DIST_LABORATORIO = [
  { name: 'Genfar', value: 35, color: '#4AABDB' },
  { name: 'MK', value: 22, color: '#7ECBA1' },
  { name: 'Roemmers', value: 18, color: '#F87171' },
  { name: 'Pfizer', value: 12, color: '#A78BFA' },
  { name: 'Otros', value: 13, color: '#FBBF24' },
];

export const fmt = (n: number) => `S/. ${n.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
