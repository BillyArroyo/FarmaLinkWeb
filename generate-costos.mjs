import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, BorderStyle, WidthType, ShadingType,
  PageNumber, PageBreak, LevelFormat, VerticalAlign, convertInchesToTwip
} from 'docx'
import { writeFileSync } from 'fs'

// ─── PALETA ───────────────────────────────────────────────────────────────────
const C = {
  celesteOsc:   '2B7FA8',
  celeste:      '4AABDB',
  celesteClaro: 'D6EFFA',
  celestePale:  'EAF6FC',
  verdeOsc:     '276749',
  verde:        '7ECBA1',
  verdeClaro:   'DFF3E8',
  verdePale:    'EEF9F3',
  blanco:       'FFFFFF',
  grisClaro:    'F5F7FA',
  grisMedio:    'E4EBF0',
  grisTexto:    '5B7A8A',
  negro:        '1A2E3B',
  naranjaPale:  'FEF3CD',
  naranja:      'E6920A',
  rojoPale:     'FDE8E8',
  rojo:         'C0392B',
  moradoPale:   'F3EEFF',
  morado:       '7B2FBE',
}

const W = 9360  // content width A4

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const r = (text, o = {}) => new TextRun({
  text, font: o.font ?? 'Calibri', size: o.size ?? 22,
  bold: o.bold ?? false, italics: o.italics ?? false,
  color: o.color ?? C.negro, break: o.break,
})

const p = (children, o = {}) => new Paragraph({
  children: Array.isArray(children) ? children : [children],
  alignment: o.align ?? AlignmentType.LEFT,
  spacing: { before: o.before ?? 70, after: o.after ?? 70, line: 280 },
  numbering: o.bullet ? { reference: 'bullets', level: 0 } : undefined,
  border: o.borderBot ? { bottom: { style: BorderStyle.SINGLE, size: 8, color: o.borderBot, space: 4 } } : undefined,
})

const gap = (n = 100) => new Paragraph({ children: [new TextRun('')], spacing: { before: 0, after: n } })

const h1 = (text) => p([r(text, { bold: true, size: 40, color: C.celesteOsc })],
  { before: 300, after: 140, borderBot: C.celeste })

const h2 = (text, color = C.negro) => p([r(text, { bold: true, size: 28, color })],
  { before: 220, after: 80 })

const h3 = (text, color = C.grisTexto) => p([r(text, { bold: true, size: 23, color })],
  { before: 140, after: 50 })

const txt = (text, o = {}) => p([r(text, { size: 21, color: o.color ?? C.negro, italics: o.italics ?? false })],
  { before: o.before ?? 50, after: o.after ?? 50, align: o.align })

const blt = (text, bold = false) => new Paragraph({
  numbering: { reference: 'bullets', level: 0 },
  children: [r(text, { size: 20, bold })],
  spacing: { before: 40, after: 40 },
})

// ─── BORDES ──────────────────────────────────────────────────────────────────
const brd = (c = C.grisMedio, sz = 4) => ({ style: BorderStyle.SINGLE, size: sz, color: c })
const bNone = { style: BorderStyle.NONE, size: 0, color: C.blanco }
const bAll = (c = C.grisMedio) => ({ top: brd(c), bottom: brd(c), left: brd(c), right: brd(c), insideH: brd(c), insideV: brd(c) })
const bNoneAll = { top: bNone, bottom: bNone, left: bNone, right: bNone, insideH: bNone, insideV: bNone }

// ─── CAJA COLOREADA ───────────────────────────────────────────────────────────
function caja(titulo, lineas, bg = C.celestePale, colorTit = C.celesteOsc, accent = C.celeste) {
  return [
    new Table({
      width: { size: W, type: WidthType.DXA }, columnWidths: [W],
      rows: [new TableRow({ children: [new TableCell({
        width: { size: W, type: WidthType.DXA },
        shading: { fill: bg, type: ShadingType.CLEAR },
        margins: { top: 160, bottom: 160, left: 220, right: 220 },
        borders: { top: brd(accent, 16), bottom: brd(accent), left: brd(accent), right: brd(accent), insideH: brd(accent), insideV: brd(accent) },
        children: [
          ...(titulo ? [p([r(titulo, { bold: true, size: 22, color: colorTit })], { before: 0, after: 80 })] : []),
          ...lineas.map(l => Array.isArray(l)
            ? new Paragraph({ numbering: { reference: 'bullets', level: 0 }, children: [r(l[0], { size: 20, bold: l[1] ?? false })], spacing: { before: 40, after: 40 } })
            : p([r(l, { size: 20 })], { before: 0, after: 44 })
          ),
        ],
      })] })],
    }),
    gap(120),
  ]
}

// ─── TABLA GENÉRICA ───────────────────────────────────────────────────────────
function tbl(headers, rows, colWidths, headerBg = C.celesteOsc) {
  const total = colWidths.reduce((a, b) => a + b, 0)
  const hRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => new TableCell({
      width: { size: colWidths[i], type: WidthType.DXA },
      shading: { fill: headerBg, type: ShadingType.CLEAR },
      margins: { top: 100, bottom: 100, left: 150, right: 150 },
      borders: bAll(headerBg),
      verticalAlign: VerticalAlign.CENTER,
      children: [p([r(h, { bold: true, size: 20, color: C.blanco })], { before: 0, after: 0 })],
    })),
  })
  const dRows = rows.map((row, ri) => new TableRow({
    children: row.map((cell, ci) => {
      const isTotal = typeof cell === 'string' && cell.startsWith('TOTAL')
      return new TableCell({
        width: { size: colWidths[ci], type: WidthType.DXA },
        shading: { fill: isTotal ? C.naranjaPale : (ri % 2 === 0 ? C.blanco : C.grisClaro), type: ShadingType.CLEAR },
        margins: { top: 90, bottom: 90, left: 150, right: 150 },
        borders: bAll(),
        verticalAlign: VerticalAlign.CENTER,
        children: [p([r(cell ?? '', { size: 20, bold: isTotal, color: isTotal ? C.naranja : C.negro })], { before: 0, after: 0 })],
      })
    }),
  }))
  return new Table({ width: { size: total, type: WidthType.DXA }, columnWidths: colWidths, rows: [hRow, ...dRows] })
}

// ─── PORTADA ─────────────────────────────────────────────────────────────────
function portada() {
  return [
    new Table({
      width: { size: W, type: WidthType.DXA }, columnWidths: [W],
      rows: [new TableRow({ children: [new TableCell({
        width: { size: W, type: WidthType.DXA },
        shading: { fill: C.negro, type: ShadingType.CLEAR },
        margins: { top: 560, bottom: 200, left: 440, right: 440 },
        borders: bNoneAll,
        children: [
          p([r('FarmaLink', { bold: true, size: 88, color: C.celeste, font: 'Calibri' })], { align: AlignmentType.CENTER, before: 0, after: 100 }),
          p([r('DOCUMENTO DE COSTOS Y FACTORES DE COTIZACIÓN', { bold: true, size: 26, color: 'A0BAC8' })], { align: AlignmentType.CENTER, before: 0, after: 100 }),
          p([r('Infraestructura · Escala · Mano de Obra · Licencias · Seguridad · Ganancia', { size: 21, color: '5B8A9A' })], { align: AlignmentType.CENTER, before: 0, after: 0 }),
        ],
      })] })],
    }),
    new Table({
      width: { size: W, type: WidthType.DXA }, columnWidths: [W / 2, W / 2],
      rows: [new TableRow({ children: [
        new TableCell({
          width: { size: W / 2, type: WidthType.DXA }, shading: { fill: C.celesteOsc, type: ShadingType.CLEAR },
          margins: { top: 180, bottom: 180, left: 300, right: 300 }, borders: bNoneAll,
          children: [p([r('Uso Interno — Confidencial', { bold: true, size: 22, color: C.blanco })], { align: AlignmentType.CENTER, before: 0, after: 0 })],
        }),
        new TableCell({
          width: { size: W / 2, type: WidthType.DXA }, shading: { fill: C.verde, type: ShadingType.CLEAR },
          margins: { top: 180, bottom: 180, left: 300, right: 300 }, borders: bNoneAll,
          children: [p([r('CP-Techs  ·  Lima, Perú  ·  Mayo 2026', { size: 22, color: C.negro })], { align: AlignmentType.CENTER, before: 0, after: 0 })],
        }),
      ]})] }),
    gap(300),
    // Aviso
    new Table({
      width: { size: W, type: WidthType.DXA }, columnWidths: [W],
      rows: [new TableRow({ children: [new TableCell({
        width: { size: W, type: WidthType.DXA }, shading: { fill: C.naranjaPale, type: ShadingType.CLEAR },
        margins: { top: 160, bottom: 160, left: 280, right: 280 },
        borders: { top: brd(C.naranja, 12), bottom: brd(C.naranja), left: brd(C.naranja), right: brd(C.naranja), insideH: brd(C.naranja), insideV: brd(C.naranja) },
        children: [
          p([r('AVISO DE CONFIDENCIALIDAD', { bold: true, size: 21, color: C.naranja })], { before: 0, after: 60 }),
          p([r('Este documento contiene información comercial y estratégica de uso exclusivo del equipo de CP-Techs. No debe ser compartido, reproducido ni enviado a terceros sin autorización expresa de la dirección. Todos los precios son en soles peruanos (S/.) salvo indicación contraria.', { size: 19, color: C.negro })], { before: 0, after: 0 }),
        ],
      })] })],
    }),
    gap(200),
    p([r('Elaborado para la cotización del sistema FarmaLink B2B', { size: 21, color: C.grisTexto, italics: true })], { align: AlignmentType.CENTER }),
    p([r('Distribuidora Farmacéutica Peruana — Cliente en proceso de cierre', { bold: true, size: 22, color: C.negro })], { align: AlignmentType.CENTER, before: 0, after: 0 }),
    new Paragraph({ children: [new PageBreak()] }),
  ]
}

// ═══════════════════════════════════════════════════════════════════════════════
//  CONSTRUIR DOCUMENTO
// ═══════════════════════════════════════════════════════════════════════════════
function buildDoc() {
  const contenido = [
    ...portada(),

    // ─── INTRODUCCIÓN ───────────────────────────────────────────────────────
    h1('Introducción: los factores que determinan el precio'),
    txt('Antes de presentar cualquier número, es fundamental entender qué compone el costo real de un sistema como FarmaLink. Tu jefe tiene razón: no existe una fórmula exacta, pero sí existen los factores precisos que construyen ese número. Este documento los detalla todos.'),
    gap(60),
    ...caja('Los 7 factores que determinan cuánto cobrar', [
      ['Infraestructura: servidores, base de datos, almacenamiento y APIs de terceros.', true],
      ['Escala: cuántos usuarios, peticiones y datos maneja el sistema en el tiempo.', true],
      ['Mano de obra: horas de desarrollo y salarios del equipo que lo construye.', true],
      ['Licencias de software: herramientas que el equipo usa para trabajar.', true],
      ['Seguridad y confidencialidad: proteger el sistema y los datos de la empresa.', true],
      ['Complejidad técnica: multiplicador que ajusta el precio según la dificultad real.', true],
      ['Margen de ganancia esperado: lo que queda después de cubrir todos los costos.', true],
    ], C.celestePale, C.celesteOsc, C.celeste),

    new Paragraph({ children: [new PageBreak()] }),

    // ─── 1. INFRAESTRUCTURA — SUPABASE ──────────────────────────────────────
    h1('1. Infraestructura — Supabase como base del sistema'),
    txt('Elegimos Supabase sobre Firebase porque su modelo de precios es predecible: cobra por capacidad contratada, no por cada request individual como Firebase. Esto es crítico cuando el sistema empieza a escalar y los costos deben proyectarse con certeza.'),
    gap(80),

    h2('1.1 Comparativa: ¿Por qué Supabase y no Firebase?'),
    gap(40),
    tbl(
      ['Factor', 'Firebase (Google)', 'Supabase (Recomendado)'],
      [
        ['Modelo de cobro', 'Por request, por lectura, por escritura', 'Por capacidad (GB, usuarios, ancho de banda)'],
        ['Predictibilidad del costo', 'Difícil de estimar — escala sin control', 'Predecible — plan fijo + excedentes claros'],
        ['Base de datos', 'NoSQL (Firestore) — menos flexible', 'PostgreSQL — relacional, más potente'],
        ['Autenticación por roles', 'Básica — requiere configuración extra', 'Integrada con JWT y RLS nativo'],
        ['Storage de imágenes', 'S/. 0.72/GB/mes + S/. 0.36/10K descargas', 'S/. 0.08/GB/mes sin cobro por descarga'],
        ['Funciones de seguridad', 'Separadas y cobradas aparte', 'Row Level Security incluida sin costo extra'],
        ['Exportación de datos', 'Compleja y costosa', 'SQL estándar — libre y sencilla'],
        ['Costo mensual base (Pro)', '~S/. 95 + variables impredecibles', 'S/. 95 fijo + excedentes muy controlados'],
      ],
      [2800, 3200, 3360], C.celesteOsc
    ),
    gap(120),

    h2('1.2 Planes de Supabase — Detalle real de costos'),
    gap(40),
    tbl(
      ['Recurso', 'Plan Gratuito', 'Plan Pro (S/. 95/mes)', 'Costo del excedente'],
      [
        ['Base de datos', '500 MB', '8 GB', 'S/. 0.76/GB adicional'],
        ['Storage (fotos productos, recibos)', '1 GB', '100 GB', 'S/. 0.08/GB adicional'],
        ['Ancho de banda (descargas)', '5 GB/mes', '200 GB/mes', 'S/. 0.34/GB adicional'],
        ['Usuarios activos (MAU)', '50,000', '100,000', 'S/. 0.003/usuario extra'],
        ['Funciones Edge (serverless)', '500K ejecuciones/mes', '2M ejecuciones/mes', 'S/. 0.38/millón extra'],
        ['Réplicas en tiempo real', 'Básico', 'Avanzado', 'Incluido en Pro'],
        ['Proyectos simultáneos', '2 proyectos', 'Ilimitados', 'S/. 95 por proyecto adicional'],
        ['Backups automáticos', 'No incluido', 'Diarios (7 días)', 'Backups a demanda: S/. 38/mes'],
      ],
      [2400, 2000, 2400, 2560]
    ),
    gap(120),

    h2('1.3 ¿Cuánto va a consumir FarmaLink en Supabase?'),
    txt('Con ~500 productos, fotos de productos, recibos digitales y operaciones de 5-20 vendedores, esta es la proyección real de uso:'),
    gap(60),
    tbl(
      ['Concepto', 'Estimado mensual', 'Observación'],
      [
        ['Storage — fotos de productos (500 × 300KB)', '~150 MB', 'Crece solo cuando se agregan productos nuevos'],
        ['Storage — recibos PDF (50/día × 30 días × 200KB)', '~300 MB', 'Acumula con el tiempo — revisar a los 6 meses'],
        ['Bandwidth — vendedores descargando catálogo', '~15 GB/mes', '20 vendedores × 5 visitas/día × 50KB de datos'],
        ['Base de datos — registros activos', '~50 MB iniciales', 'Crece ~10 MB/mes con pedidos y cobros'],
        ['Usuarios activos (MAU)', '~30 usuarios', 'Vendedores + admins — bien dentro del plan Free'],
        ['Funciones Edge (hash, webhooks WhatsApp)', '~50,000 ejecuciones', 'Bien dentro del plan Free'],
        ['TOTAL ESTIMADO AÑO 1', 'Plan Gratuito cubre todo', 'Migrar a Pro cuando bandwidth supere 5 GB/mes'],
      ],
      [3200, 2200, 3960]
    ),
    gap(80),
    ...caja('Conclusión Supabase', [
      'Durante el año 1, el Plan Gratuito de Supabase es suficiente para FarmaLink con una distribuidora de hasta 50 vendedores. El upgrade al Plan Pro (S/. 95/mes) se recomienda a partir del mes 6-8 cuando el sistema tenga historial real de uso y antes de que el bandwidth supere el límite.',
      'Esto significa que el costo de infraestructura de base de datos en el año 1 puede ser S/. 0 en Supabase, con solo los costos de Vercel y dominio como gastos fijos mínimos.',
    ], C.verdeClaro, C.verdeOsc, C.verde),

    new Paragraph({ children: [new PageBreak()] }),

    // ─── 2. TODOS LOS SERVICIOS ──────────────────────────────────────────────
    h1('2. Todos los servicios a pagar para operar FarmaLink'),
    txt('Este es el desglose completo de cada servicio externo necesario para que FarmaLink funcione en producción. Incluye costo mensual real en dólares y en soles (tipo de cambio S/. 3.80):'),
    gap(80),

    h2('2.1 Servicios de infraestructura principal'),
    gap(40),
    tbl(
      ['Servicio', 'Función en FarmaLink', 'Plan', 'USD/mes', 'S/./mes'],
      [
        ['Supabase (base de datos + auth + storage)', 'Base de datos, autenticación, archivos, tiempo real', 'Free → Pro desde mes 6-8', '$0 → $25', 'S/. 0 → S/. 95'],
        ['Vercel (hosting frontend)', 'Servidor donde vive la aplicación web', 'Pro', '$20', 'S/. 76'],
        ['Dominio .com.pe o .pe', 'Dirección web de la empresa (ej: farmalink.pe)', 'Anual', '$4/mes equiv.', 'S/. 15'],
        ['Certificado SSL', 'Seguridad HTTPS — cifrado de datos', 'Incluido en Vercel', '$0', 'S/. 0'],
        ['TOTAL INFRAESTRUCTURA CORE', '', '', '$24-$49/mes', 'S/. 91-186/mes'],
      ],
      [2800, 3000, 1400, 1000, 1160]
    ),
    gap(120),

    h2('2.2 APIs de terceros — Comunicaciones y pagos'),
    gap(40),
    tbl(
      ['Servicio', 'Función', 'Modelo de cobro', 'Estimado mensual'],
      [
        ['Meta WhatsApp Business API', 'Envío de recibos digitales y campañas de ofertas', 'Por conversación iniciada', 'S/. 40-180/mes'],
        ['Niubiz (POS Virtual)', 'Pagos con tarjeta de crédito/débito en campo', '3.49% + IGV por transacción', 'Variable — ~S/. 70 si se procesa S/. 2,000/mes'],
        ['Yape / Plin', 'Cobros por aplicativo móvil', 'Sin costo API — deep links gratuitos', 'S/. 0'],
        ['Open Food Facts API', 'Búsqueda automática de fotos de medicamentos', 'Gratuita (open source)', 'S/. 0'],
        ['Unsplash API', 'Fotos genéricas de productos sin imagen propia', 'Gratuita (50 req/hora)', 'S/. 0'],
        ['TOTAL APIS ESTIMADO', '', '', 'S/. 40-250/mes'],
      ],
      [2600, 3000, 1900, 1860]
    ),
    gap(80),
    ...caja('Nota sobre WhatsApp Business API', [
      'Meta cobra por "conversación", no por mensaje individual. Una conversación dura 24 horas desde el primer mensaje. Los primeros 1,000 conversaciones al mes son GRATIS.',
      'Conversación tipo "Utilidad" (recibos, confirmaciones): aprox. S/. 0.045 c/u.',
      'Conversación tipo "Marketing" (ofertas, campañas): aprox. S/. 0.057 c/u.',
      'Ejemplo: 500 recibos/mes + 2 campañas de 200 farmacias = ~700 conversaciones = S/. 31.50 — dentro del rango gratuito inicial.',
    ], C.naranjaPale, C.naranja, C.naranja),

    new Paragraph({ children: [new PageBreak()] }),

    // ─── 3. ESCALA Y PROYECCIÓN ──────────────────────────────────────────────
    h1('3. Escala — Cómo crece el costo según los usuarios'),
    txt('El punto más importante que señaló tu jefe: los costos no son fijos. Escalan según la cantidad de usuarios, pedidos, imágenes y mensajes que procesa el sistema. Esta tabla proyecta 3 escenarios reales:'),
    gap(80),

    tbl(
      ['Factor', 'Escenario Pequeño\n1 dist. · 5-10 vendedores', 'Escenario Mediano\n1 dist. · 20-50 vendedores', 'Escenario Grande\n3-5 dist. · 100+ vendedores'],
      [
        ['Usuarios activos (MAU)', '~15 usuarios', '~60 usuarios', '~300 usuarios'],
        ['Pedidos por mes', '~200 pedidos', '~1,000 pedidos', '~5,000 pedidos'],
        ['Cobros registrados/mes', '~150 cobros', '~800 cobros', '~4,000 cobros'],
        ['Mensajes WhatsApp/mes', '~150 mensajes', '~800 mensajes', '~4,000 mensajes'],
        ['Storage acumulado (12 meses)', '~500 MB', '~3 GB', '~15 GB'],
        ['Bandwidth mensual', '~3 GB', '~20 GB', '~100 GB'],
        ['Supabase recomendado', 'Plan Free', 'Plan Pro ($25/mes)', 'Plan Pro x2-3 proyectos'],
        ['Vercel', 'Pro ($20/mes)', 'Pro ($20/mes)', 'Enterprise (negociar)'],
        ['WhatsApp API', '~S/. 0 (dentro del free)', '~S/. 35/mes', '~S/. 180/mes'],
        ['Niubiz comisiones', '~S/. 35/mes', '~S/. 140/mes', '~S/. 700/mes'],
        ['COSTO INFRA TOTAL/MES', 'S/. 76-120', 'S/. 300-420', 'S/. 1,200-2,000'],
      ],
      [2300, 2400, 2400, 2260]
    ),
    gap(120),

    ...caja('Lo que esto significa al cotizar', [
      'Si el cliente empieza pequeño (5-10 vendedores), el costo de infraestructura del primer año puede ser tan bajo como S/. 76/mes. Pero si escalan rápido, los costos crecen. Por eso en la propuesta se recomienda revisar la facturación cada 6 meses.',
      'Para la cotización inicial, usar el Escenario Mediano como referencia base y dejar claro que los costos de operación se ajustan según el crecimiento real.',
    ], C.celestePale, C.celesteOsc, C.celeste),

    new Paragraph({ children: [new PageBreak()] }),

    // ─── 4. MANO DE OBRA ────────────────────────────────────────────────────
    h1('4. Mano de obra — El equipo que construye y mantiene'),
    txt('El costo más grande en cualquier proyecto de software no es la infraestructura — son las personas. Esto incluye el equipo de desarrollo inicial y los 2 trabajadores adicionales del equipo CP-Techs:'),
    gap(80),

    h2('4.1 El equipo de CP-Techs para este proyecto'),
    gap(40),
    tbl(
      ['Rol', 'Función en FarmaLink', 'Horas estimadas', 'Tarifa/hora (S/.)', 'Total (S/.)'],
      [
        ['Desarrollador Principal (tú)', 'Arquitectura, módulos core, coordinación técnica', '180h', 'S/. 65', 'S/. 11,700'],
        ['Trabajador adicional 1\n(Desarrollador Junior/Mid)', 'Módulos de catálogo, UI y testing', '120h', 'S/. 40', 'S/. 4,800'],
        ['Trabajador adicional 2\n(Desarrollador / QA)', 'Integración de APIs, pruebas y documentación', '100h', 'S/. 40', 'S/. 4,000'],
        ['TOTAL MANO DE OBRA DESARROLLO', '', '400 horas', '', 'S/. 20,500'],
      ],
      [2500, 2800, 1400, 1400, 1260]
    ),
    gap(80),
    ...caja('¿Por qué 2 trabajadores adicionales?', [
      'Con 2 personas adicionales en el equipo se divide el trabajo por módulos, reduciendo el tiempo total de entrega de 16 semanas a 8 semanas.',
      'También permite que haya revisión cruzada del código (code review), lo que mejora la calidad y reduce errores en producción.',
      'Para las licencias, ambos trabajadores necesitan acceso a las mismas herramientas — esto se detalla en la sección 5.',
    ], C.verdeClaro, C.verdeOsc, C.verde),
    gap(80),

    h2('4.2 Costo de mantenimiento post-entrega (mensual)'),
    txt('Una vez entregado el sistema, se necesita soporte técnico. Esto también debe incluirse en la cotización como cargo mensual:'),
    gap(40),
    tbl(
      ['Concepto', 'Horas/mes', 'Tarifa/hora', 'Costo mensual (S/.)'],
      [
        ['Soporte técnico y resolución de bugs', '8h', 'S/. 55', 'S/. 440'],
        ['Actualizaciones de seguridad', '4h', 'S/. 55', 'S/. 220'],
        ['Nuevas funcionalidades menores', '0-10h (según solicitud)', 'S/. 60', 'Variable'],
        ['Monitoreo de infraestructura', 'Incluido en plan Vercel Pro', '-', 'S/. 0'],
        ['SOPORTE MENSUAL BASE', '12h/mes', '', 'S/. 660/mes'],
      ],
      [3500, 1600, 1600, 2660]
    ),

    new Paragraph({ children: [new PageBreak()] }),

    // ─── 5. LICENCIAS ────────────────────────────────────────────────────────
    h1('5. Licencias de software — Lo que el equipo necesita'),
    txt('Para que los 3 miembros del equipo (tú + 2 adicionales) trabajen correctamente y la empresa esté protegida legalmente, estas son las licencias necesarias:'),
    gap(80),

    h2('5.1 Licencias de desarrollo (3 usuarios)'),
    gap(40),
    tbl(
      ['Herramienta', 'Uso', 'Plan', 'USD/mes', 'S/./mes (3 usuarios)'],
      [
        ['GitHub Team', 'Control de versiones, colaboración, CI/CD', 'Team — $4/usuario/mes', '$12/mes', 'S/. 46/mes'],
        ['Figma Professional', 'Diseño UI/UX, revisar el diseño Figma Make', 'Professional — $15/editor/mes', '$15/mes (1 editor)', 'S/. 57/mes'],
        ['Supabase', 'Base de datos, auth, storage, funciones', 'Free → Pro desde mes 6', '$0 → $25', 'S/. 0 → 95/mes'],
        ['Vercel', 'Hosting y deploy automático', 'Pro — $20/mes', '$20/mes', 'S/. 76/mes'],
        ['VS Code + extensiones', 'Editor de código — todos los devs', 'Gratuito', '$0', 'S/. 0'],
        ['Postman (API testing)', 'Probar integraciones WhatsApp, Niubiz, GPS', 'Free tier', '$0', 'S/. 0'],
        ['TOTAL LICENCIAS DESARROLLO', '', '', '$47-$72/mes', 'S/. 179-274/mes'],
      ],
      [2200, 2400, 1800, 1300, 1660]
    ),
    gap(120),

    h2('5.2 Licencias de gestión y comunicación interna'),
    gap(40),
    tbl(
      ['Herramienta', 'Uso', 'Plan', 'USD/mes', 'S/./mes'],
      [
        ['Notion (documentación y gestión)', 'Documentar el proyecto, notas de reunión con cliente', 'Plus — $10/mes (equipo)', '$10', 'S/. 38'],
        ['Slack o Discord', 'Comunicación interna del equipo', 'Free (suficiente para 3 personas)', '$0', 'S/. 0'],
        ['Zoom / Google Meet', 'Reuniones con el cliente', 'Incluido en Google Workspace Free', '$0', 'S/. 0'],
        ['Google Workspace', 'Email empresarial @cptechs.pe, Drive, Docs', 'Business Starter — $6/usuario', '$18/mes', 'S/. 68'],
        ['TOTAL GESTIÓN', '', '', '$28/mes', 'S/. 106/mes'],
      ],
      [2400, 2600, 1800, 1100, 1460]
    ),
    gap(80),
    ...caja('Total licencias por mes (equipo de 3 personas)', [
      'Licencias de desarrollo: S/. 179 - S/. 274/mes',
      'Licencias de gestión: S/. 106/mes',
      'TOTAL LICENCIAS: S/. 285 - S/. 380/mes',
      '',
      'Este costo puede trasladarse parcialmente al cliente como "costo de operación mensual" o absorberse en el margen si se cobra una tarifa de mantenimiento mensual adecuada.',
    ], C.celestePale, C.celesteOsc, C.celeste),

    new Paragraph({ children: [new PageBreak()] }),

    // ─── 6. SEGURIDAD Y CONFIDENCIALIDAD ────────────────────────────────────
    h1('6. Seguridad y confidencialidad — Lo que protege al negocio'),
    txt('Tu jefe mencionó explícitamente la seguridad y confidencialidad como factores de costo. Aquí están todos los aspectos de seguridad que se deben implementar y proteger:'),
    gap(80),

    h2('6.1 Seguridad técnica del sistema'),
    gap(40),
    tbl(
      ['Capa de seguridad', 'Qué protege', 'Herramienta', 'Costo'],
      [
        ['SSL / HTTPS en toda la app', 'Datos en tránsito cifrados', 'Incluido en Vercel', 'S/. 0'],
        ['Row Level Security (RLS) en Supabase', 'Que un vendedor no vea datos de otro', 'Supabase nativo', 'S/. 0'],
        ['JWT con roles (admin/vendedor/cliente)', 'Control de acceso por tipo de usuario', 'Supabase Auth', 'S/. 0'],
        ['Hash SHA-256 en recibos', 'Anti-fraude: recibos inviolables', 'Web Crypto API (nativa)', 'S/. 0'],
        ['Webhook HMAC-SHA256 WhatsApp', 'Verificar que los webhooks son de Meta', 'Implementación propia', 'S/. 0'],
        ['Variables de entorno cifradas', 'Tokens y credenciales de APIs nunca en el código', 'Vercel Encrypted Env Vars', 'S/. 0'],
        ['Rate limiting en APIs', 'Proteger contra abuso o ataques de fuerza bruta', 'Vercel Edge Config', 'Incluido en Pro'],
        ['Auditoría de seguridad inicial', 'Revisión externa del sistema antes de producción', 'Consultor externo o herramienta SAST', 'S/. 500-1,500 único'],
      ],
      [2800, 2600, 2000, 1960]
    ),
    gap(120),

    h2('6.2 Confidencialidad y protección legal del negocio'),
    gap(40),
    tbl(
      ['Documento / Acción', 'Para qué sirve', 'Costo estimado'],
      [
        ['Contrato de desarrollo con NDA (Non-Disclosure Agreement)', 'Protege el código fuente, los datos del cliente y la propiedad intelectual del sistema', 'S/. 300-800 (abogado)'],
        ['Contrato de servicios con el cliente (SLA)', 'Define tiempos de respuesta, responsabilidades y penalidades', 'S/. 200-500 (plantilla + adaptación)'],
        ['Política de privacidad y tratamiento de datos', 'Cumplimiento Ley 29733 (Ley de Datos Personales Perú)', 'S/. 300-600 (redacción legal)'],
        ['Términos y condiciones del sistema', 'Limitar responsabilidad de CP-Techs por mal uso', 'S/. 200-400'],
        ['Registro de obra intelectual (INDECOPI)', 'Proteger el código fuente como propiedad intelectual', 'S/. 250-600 (trámite INDECOPI)'],
        ['TOTAL PROTECCIÓN LEGAL (único, al inicio)', '', 'S/. 1,250 - 2,900'],
      ],
      [3800, 3200, 2360]
    ),
    gap(80),
    ...caja('Importante sobre la Ley 29733 (Ley de Datos Personales - Perú)', [
      'FarmaLink almacena datos personales de farmacias, vendedores y clientes. La Ley 29733 obliga a: registrar la base de datos en INDECOPI, contar con política de privacidad publicada, y obtener consentimiento explícito del titular.',
      'Incumplir puede generar multas de hasta 100 UIT (~S/. 495,000). Este costo legal es pequeño comparado con el riesgo — se debe incluir en la propuesta como gasto obligatorio.',
    ], C.rojoPale, C.rojo, C.rojo),

    new Paragraph({ children: [new PageBreak()] }),

    // ─── 7. COMPLEJIDAD ──────────────────────────────────────────────────────
    h1('7. Complejidad técnica — El multiplicador del precio'),
    txt('La complejidad es el factor que más subestiman los proyectos de software. No es solo cuántas horas se trabaja — es cuántas cosas pueden salir mal, cuántas integraciones se manejan y cuánta responsabilidad tiene el sistema.'),
    gap(80),

    h2('7.1 Factores de complejidad en FarmaLink'),
    gap(40),
    tbl(
      ['Factor', 'Descripción', 'Nivel', 'Multiplicador'],
      [
        ['Modo offline + sincronización', 'IndexedDB + Service Worker + cola de sincronización. Si falla, se pierden pedidos.', 'ALTO', '+15%'],
        ['Anti-fraude SHA-256', 'Hash criptográfico en tiempo real, verificable desde admin. Cero tolerancia a errores.', 'ALTO', '+10%'],
        ['3 roles de usuario distintos', 'Mobile cliente, mobile+tablet vendedor, desktop admin. 3 UX completamente distintos.', 'MEDIO-ALTO', '+10%'],
        ['Integración WhatsApp Business API', 'Proceso de aprobación de plantillas, manejo de webhooks, rate limiting.', 'MEDIO', '+8%'],
        ['GPS por transacción', 'Geolocalización en tiempo real con manejo de permisos y precisión variable.', 'MEDIO', '+5%'],
        ['Integración de pagos (Niubiz)', 'Contrato comercial, certificación, manejo de transacciones reales de dinero.', 'ALTO', '+12%'],
        ['Realtime con Supabase', 'Actualizaciones en vivo en el dashboard sin recargar página.', 'MEDIO', '+5%'],
        ['Seguridad de datos sensibles', 'Datos financieros, ubicaciones GPS, información de farmacias — alta responsabilidad.', 'ALTO', '+10%'],
        ['COMPLEJIDAD TOTAL ACUMULADA', '', '', '+75% sobre base'],
      ],
      [2200, 3800, 1200, 2160]
    ),
    gap(80),
    ...caja('Cómo se aplica el multiplicador', [
      'Si las horas base estimadas son 400h y la tarifa promedio es S/. 52/hora:',
      'Costo base = 400h × S/. 52 = S/. 20,800',
      'Ajuste por complejidad (+75%) = S/. 20,800 × 1.75 = S/. 36,400',
      'Este es el costo real antes de márgenes. La complejidad no es negociable porque representa el riesgo técnico que asume el equipo.',
    ], C.moradoPale, C.morado, C.morado),

    new Paragraph({ children: [new PageBreak()] }),

    // ─── 8. FÓRMULA DE COTIZACIÓN ────────────────────────────────────────────
    h1('8. Fórmula exacta de cotización'),
    txt('Integrando todos los factores anteriores, esta es la fórmula que se aplica para calcular el precio al cliente:'),
    gap(80),

    new Table({
      width: { size: W, type: WidthType.DXA }, columnWidths: [W],
      rows: [new TableRow({ children: [new TableCell({
        width: { size: W, type: WidthType.DXA },
        shading: { fill: C.negro, type: ShadingType.CLEAR },
        margins: { top: 260, bottom: 260, left: 380, right: 380 },
        borders: bNoneAll,
        children: [
          p([r('PRECIO FINAL AL CLIENTE =', { bold: true, size: 28, color: C.celeste })], { align: AlignmentType.CENTER, before: 0, after: 120 }),
          p([r('(Horas × Tarifa Hora × Factor Complejidad)', { size: 22, color: C.blanco })], { align: AlignmentType.CENTER, before: 0, after: 60 }),
          p([r('+  Costos operativos proyectados (12 meses)', { size: 22, color: C.verde })], { align: AlignmentType.CENTER, before: 0, after: 60 }),
          p([r('+  Licencias del equipo (8 meses de desarrollo)', { size: 22, color: C.verde })], { align: AlignmentType.CENTER, before: 0, after: 60 }),
          p([r('+  Costos legales y protección IP', { size: 22, color: C.verde })], { align: AlignmentType.CENTER, before: 0, after: 120 }),
          p([r('×  Margen de Ganancia (30% - 45%)', { bold: true, size: 24, color: C.naranja })], { align: AlignmentType.CENTER, before: 0, after: 0 }),
        ],
      })] })],
    }),
    gap(140),

    h2('8.1 Aplicación de la fórmula — Caso FarmaLink'),
    gap(40),
    tbl(
      ['Componente', 'Cálculo', 'Monto (S/.)'],
      [
        ['Mano de obra base (400h × S/. 52 promedio)', '400 × S/. 52', 'S/. 20,800'],
        ['Ajuste por complejidad técnica (+75%)', 'S/. 20,800 × 0.75', 'S/. 15,600'],
        ['Subtotal mano de obra ajustada', '', 'S/. 36,400'],
        ['Costos infra año 1 (Vercel + dominio + WhatsApp)', 'S/. 110/mes × 12', 'S/. 1,320'],
        ['Costos infra año 1 (Supabase Pro desde mes 6)', 'S/. 95/mes × 6', 'S/. 570'],
        ['Licencias del equipo durante desarrollo (8 meses)', 'S/. 330/mes × 8', 'S/. 2,640'],
        ['Costos legales y protección IP', 'NDA + contratos + INDECOPI', 'S/. 2,200'],
        ['Contingencias y bugs post-entrega (2 meses soporte)', 'S/. 660/mes × 2', 'S/. 1,320'],
        ['SUBTOTAL COSTO REAL', '', 'S/. 44,450'],
        ['Margen de ganancia (35%)', 'S/. 44,450 × 0.35', 'S/. 15,557'],
        ['PRECIO DE VENTA RECOMENDADO', '', 'S/. 59,000 - 62,000'],
      ],
      [4400, 2800, 2160]
    ),
    gap(80),
    ...caja('¿Cómo presentarlo al cliente?', [
      'El cliente no necesita ver este desglose interno. Lo que se le presenta son los paquetes de la propuesta (Básico / Estándar / Completo) con precios que ya incluyen todo el costo + margen.',
      'El documento FarmaLink_Propuesta_Cliente.docx ya tiene estos paquetes (S/. 4,500 / S/. 9,800 / S/. 17,500). Esos precios son para módulos parciales — una implementación completa se cotiza aparte.',
      'Para el proyecto completo (los 5 módulos), el rango real de mercado en Lima para este nivel de complejidad es S/. 18,000 - S/. 35,000 según el cliente y la negociación.',
    ], C.naranjaPale, C.naranja, C.naranja),

    new Paragraph({ children: [new PageBreak()] }),

    // ─── 9. PROYECCIÓN DE GANANCIA ───────────────────────────────────────────
    h1('9. Proyección de ganancia real'),
    txt('Más allá de la venta del proyecto, FarmaLink tiene un modelo de ingresos recurrentes si se estructura bien. Esta es la proyección de lo que puede generar para CP-Techs:'),
    gap(80),

    h2('9.1 Ingresos posibles del proyecto FarmaLink'),
    gap(40),
    tbl(
      ['Fuente de ingreso', 'Frecuencia', 'Monto estimado (S/.)'],
      [
        ['Venta del desarrollo completo (5 módulos)', 'Único', 'S/. 18,000 - 35,000'],
        ['Mantenimiento mensual (soporte + actualizaciones)', 'Mensual', 'S/. 800 - 1,200/mes'],
        ['Nuevas funcionalidades (portal cliente, app móvil, facturación)', 'Puntual', 'S/. 3,500 - 8,000 c/u'],
        ['Hosting y dominio (comisión por gestión)', 'Mensual', 'S/. 150 - 300/mes'],
        ['Capacitación adicional del equipo del cliente', 'Puntual', 'S/. 500 - 1,500 c/u'],
        ['Expansión del sistema a otras distribuidoras', 'Por nuevo cliente', 'S/. 8,000 - 20,000 c/u'],
      ],
      [3800, 1800, 3760]
    ),
    gap(80),

    h2('9.2 Proyección de ingresos — Año 1 y Año 2'),
    gap(40),
    tbl(
      ['Período', 'Ingresos estimados', 'Costos estimados', 'Ganancia neta (S/.)'],
      [
        ['Mes 1-8 (desarrollo)', 'S/. 25,000 (pago parcial)', 'S/. 18,000 (equipo + licencias)', 'S/. 7,000'],
        ['Mes 9-12 (entrega + post-soporte)', 'S/. 10,000 (pago final)', 'S/. 5,300 (soporte + infra)', 'S/. 4,700'],
        ['Año 1 — TOTAL', 'S/. 35,000', 'S/. 23,300', 'S/. 11,700'],
        ['Año 2 (mantenimiento + mejoras)', 'S/. 18,400 (recurrente + extras)', 'S/. 9,200', 'S/. 9,200'],
        ['2 AÑOS ACUMULADO', 'S/. 53,400', 'S/. 32,500', 'S/. 20,900'],
      ],
      [2800, 2400, 2200, 1960]
    ),
    gap(80),
    ...caja('Si se replica a 3 clientes similares en Lima:', [
      'El modelo de FarmaLink puede adaptarse a otras distribuidoras del sector con costos de desarrollo reducidos (el trabajo base ya está hecho). El segundo y tercer cliente cuestan ~40% menos de desarrollar — lo que aumenta significativamente el margen.',
      '3 clientes × S/. 35,000 promedio = S/. 105,000 en ventas con un equipo de 3 personas en 2 años. Un negocio completamente viable.',
    ], C.verdeClaro, C.verdeOsc, C.verde),

    new Paragraph({ children: [new PageBreak()] }),

    // ─── 10. RESUMEN ─────────────────────────────────────────────────────────
    h1('10. Resumen ejecutivo — Tabla final de costos'),
    gap(60),

    h2('Lo que se paga UNA VEZ (inversión inicial)'),
    gap(40),
    tbl(
      ['Concepto', 'Monto (S/.)'],
      [
        ['Mano de obra de desarrollo (tú + 2 trabajadores adicionales)', 'S/. 20,500'],
        ['Ajuste por complejidad técnica del sistema', 'S/. 15,600'],
        ['Costos legales: NDA, contratos, INDECOPI, Política de Datos', 'S/. 2,200'],
        ['Licencias de herramientas durante 8 meses de desarrollo', 'S/. 2,640'],
        ['Buffer de contingencias (bugs, retrabajos, imprevistos)', 'S/. 3,510'],
        ['TOTAL INVERSIÓN INICIAL MÍNIMA (costo real)', 'S/. 44,450'],
        ['PRECIO DE VENTA RECOMENDADO AL CLIENTE (+35% margen)', 'S/. 59,000 - 62,000'],
      ],
      [6800, 2560]
    ),
    gap(120),

    h2('Lo que se paga CADA MES (operación en producción)'),
    gap(40),
    tbl(
      ['Concepto', 'Costo mensual (S/.)'],
      [
        ['Vercel Pro (hosting)', 'S/. 76'],
        ['Supabase Free (año 1) / Pro desde mes 6 (S/. 95)', 'S/. 0 → S/. 95'],
        ['Dominio web (.com.pe o .pe)', 'S/. 15'],
        ['WhatsApp Business API (según volumen)', 'S/. 40 - 180'],
        ['Licencias del equipo (GitHub + Figma + Google Workspace)', 'S/. 179 - 274'],
        ['Soporte técnico mensual (12h/mes)', 'S/. 660'],
        ['TOTAL OPERACIÓN MENSUAL ESTIMADO', 'S/. 970 - 1,300/mes'],
        ['De los cuales, el cliente paga directamente (infra + APIs)', 'S/. 131 - 370/mes'],
        ['De los cuales, CP-Techs cobra como tarifa de mantenimiento', 'S/. 800 - 1,200/mes'],
      ],
      [6800, 2560]
    ),
    gap(120),

    // Bloque de cierre
    new Table({
      width: { size: W, type: WidthType.DXA }, columnWidths: [W],
      rows: [new TableRow({ children: [new TableCell({
        width: { size: W, type: WidthType.DXA },
        shading: { fill: C.negro, type: ShadingType.CLEAR },
        margins: { top: 280, bottom: 280, left: 400, right: 400 },
        borders: bNoneAll,
        children: [
          p([r('Resumen ejecutivo del negocio', { bold: true, size: 26, color: C.celeste })], { align: AlignmentType.CENTER, before: 0, after: 140 }),
          p([r('Inversión total del cliente: S/. 59,000 - 62,000 (pago único de desarrollo)', { size: 22, color: C.blanco })], { align: AlignmentType.CENTER, before: 0, after: 60 }),
          p([r('Operación mensual que paga el cliente: S/. 1,100 - 1,500/mes (infra + mantenimiento)', { size: 22, color: C.blanco })], { align: AlignmentType.CENTER, before: 0, after: 60 }),
          p([r('Ganancia neta de CP-Techs en 2 años: S/. 20,000 - 25,000', { bold: true, size: 24, color: C.verde })], { align: AlignmentType.CENTER, before: 0, after: 60 }),
          p([r('Potencial replicando a 3 clientes: S/. 55,000 - 75,000 en 2-3 años', { bold: true, size: 24, color: C.naranja })], { align: AlignmentType.CENTER, before: 0, after: 0 }),
        ],
      })] })],
    }),
    gap(60),
  ]

  return new Document({
    numbering: {
      config: [{
        reference: 'bullets',
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
          style: {
            paragraph: { indent: { left: 440, hanging: 260 } },
            run: { font: 'Arial', size: 20, color: C.celeste },
          },
        }],
      }],
    },
    styles: {
      default: { document: { run: { font: 'Calibri', size: 22, color: C.negro } } },
    },
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            children: [
              new TextRun({ text: 'FarmaLink  ·  Documento de Costos y Cotización  ·  USO INTERNO', font: 'Calibri', size: 18, color: C.grisTexto, italics: true }),
            ],
            alignment: AlignmentType.RIGHT,
            spacing: { before: 0, after: 0 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.grisMedio, space: 4 } },
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            children: [
              new TextRun({ text: 'CP-Techs  ·  Confidencial  ·  Página ', font: 'Calibri', size: 18, color: C.grisTexto }),
              new TextRun({ children: [PageNumber.CURRENT], font: 'Calibri', size: 18, color: C.grisTexto }),
              new TextRun({ text: ' de ', font: 'Calibri', size: 18, color: C.grisTexto }),
              new TextRun({ children: [PageNumber.TOTAL_PAGES], font: 'Calibri', size: 18, color: C.grisTexto }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 0 },
            border: { top: { style: BorderStyle.SINGLE, size: 6, color: C.grisMedio, space: 4 } },
          })],
        }),
      },
      children: contenido,
    }],
  })
}

Packer.toBuffer(buildDoc()).then(buf => {
  writeFileSync('A:/PropuestaFarmacia/FarmaLink_Costos_Cotizacion_Interno.docx', buf)
  console.log('Generado: FarmaLink_Costos_Cotizacion_Interno.docx')
}).catch(e => { console.error(e); process.exit(1) })
