import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, BorderStyle, WidthType, ShadingType,
  PageNumber, PageBreak, HeadingLevel, LevelFormat, VerticalAlign,
  convertInchesToTwip
} from 'docx'
import { writeFileSync } from 'fs'

// ─── COLORES ──────────────────────────────────────────────────────────────────
const CLR = {
  celeste:      '4AABDB',
  celesteOsc:   '2B7FA8',
  celesteClaro: 'D6EFFA',
  celestePale:  'EAF6FC',
  verde:        '7ECBA1',
  verdeOsc:     '4A9B72',
  verdeClaro:   'DFF3E8',
  verdePale:    'EEF9F3',
  blanco:       'FFFFFF',
  grisClaro:    'F5F7FA',
  grisMedio:    'E4EBF0',
  grisOscuro:   '5B7A8A',
  grisTexto:    '3D5A6A',
  negro:        '1A2E3B',
  naranjaClaro: 'FEF3CD',
  naranja:      'E6920A',
  rojoClaro:    'FDE8E8',
  rojo:         'C0392B',
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const W = 9360   // content width A4 (1" margins each side)

const run = (text, o = {}) => new TextRun({
  text,
  font:    o.font    ?? 'Calibri',
  size:    o.size    ?? 22,
  bold:    o.bold    ?? false,
  italics: o.italics ?? false,
  color:   o.color   ?? CLR.negro,
  break:   o.break,
  underline: o.underline ? {} : undefined,
})

const para = (children, o = {}) => new Paragraph({
  children: Array.isArray(children) ? children : [children],
  alignment: o.align ?? AlignmentType.LEFT,
  spacing: {
    before:   o.before   ?? 80,
    after:    o.after    ?? 80,
    line:     o.line     ?? 280,
  },
  indent: o.indent ? { left: convertInchesToTwip(o.indent) } : undefined,
  heading:   o.heading,
  numbering: o.bullet ? { reference: 'bullets', level: 0 } : undefined,
  border: o.borderBottom ? {
    bottom: { style: BorderStyle.SINGLE, size: 8, color: o.borderBottom, space: 4 }
  } : undefined,
})

const gap = (size = 120) => new Paragraph({
  children: [new TextRun('')],
  spacing: { before: 0, after: size },
})

// ─── TIPOGRAFÍA ───────────────────────────────────────────────────────────────
const h1 = (text, color = CLR.celesteOsc) => para(
  [run(text, { bold: true, size: 44, color, font: 'Calibri' })],
  { before: 280, after: 160, borderBottom: color }
)

const h2 = (text, color = CLR.negro) => para(
  [run(text, { bold: true, size: 30, color, font: 'Calibri' })],
  { before: 240, after: 100 }
)

const h3 = (text, color = CLR.grisTexto) => para(
  [run(text, { bold: true, size: 24, color, font: 'Calibri' })],
  { before: 160, after: 60 }
)

const cuerpo = (text, o = {}) => para(
  [run(text, { size: 22, color: o.color ?? CLR.negro, italics: o.italics })],
  { before: o.before ?? 60, after: o.after ?? 60, align: o.align }
)

const bullet = (text, bold = false) => new Paragraph({
  numbering: { reference: 'bullets', level: 0 },
  children: [run(text, { size: 22, bold })],
  spacing: { before: 50, after: 50 },
})

// ─── TABLA HELPER ─────────────────────────────────────────────────────────────
const borde = (color = CLR.grisMedio) => ({ style: BorderStyle.SINGLE, size: 4, color })

function tabla(headers, rows, colWidths) {
  const total = colWidths.reduce((a, b) => a + b, 0)
  const borderDef = {
    top: borde(), bottom: borde(), left: borde(), right: borde(),
    insideH: borde(), insideV: borde(),
  }

  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => new TableCell({
      width: { size: colWidths[i], type: WidthType.DXA },
      shading: { fill: CLR.celesteOsc, type: ShadingType.CLEAR },
      margins: { top: 100, bottom: 100, left: 160, right: 160 },
      borders: borderDef,
      verticalAlign: VerticalAlign.CENTER,
      children: [para([run(h, { bold: true, size: 20, color: CLR.blanco })], { before: 0, after: 0 })],
    })),
  })

  const dataRows = rows.map((row, ri) => new TableRow({
    children: row.map((cell, ci) => new TableCell({
      width: { size: colWidths[ci], type: WidthType.DXA },
      shading: { fill: ri % 2 === 0 ? CLR.blanco : CLR.celestePale, type: ShadingType.CLEAR },
      margins: { top: 90, bottom: 90, left: 160, right: 160 },
      borders: borderDef,
      verticalAlign: VerticalAlign.CENTER,
      children: [para([run(cell ?? '', { size: 20, color: CLR.negro })], { before: 0, after: 0 })],
    })),
  }))

  return new Table({
    width: { size: total, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [headerRow, ...dataRows],
  })
}

// Celda genérica para tablas de 2 cols estilo "propiedad / valor"
function filaDos(izq, der, bgIzq = CLR.celesteClaro, bgDer = CLR.blanco, boldIzq = true) {
  const b = { style: BorderStyle.SINGLE, size: 4, color: CLR.grisMedio }
  const borders = { top: b, bottom: b, left: b, right: b, insideH: b, insideV: b }
  return new TableRow({
    children: [
      new TableCell({
        width: { size: 3200, type: WidthType.DXA },
        shading: { fill: bgIzq, type: ShadingType.CLEAR },
        margins: { top: 100, bottom: 100, left: 160, right: 160 },
        borders,
        children: [para([run(izq, { bold: boldIzq, size: 21, color: CLR.celesteOsc })], { before: 0, after: 0 })],
      }),
      new TableCell({
        width: { size: 6160, type: WidthType.DXA },
        shading: { fill: bgDer, type: ShadingType.CLEAR },
        margins: { top: 100, bottom: 100, left: 160, right: 160 },
        borders,
        children: [para([run(der, { size: 21, color: CLR.negro })], { before: 0, after: 0 })],
      }),
    ],
  })
}

// Bloque coloreado de cita / resaltado
function caja(titulo, lineas, bg = CLR.celestePale, colorTitulo = CLR.celesteOsc, borde_color = CLR.celeste) {
  const b = { style: BorderStyle.SINGLE, size: 4, color: borde_color }
  const borders = { top: b, bottom: b, left: { style: BorderStyle.THICK, size: 16, color: borde_color }, right: b, insideH: b, insideV: b }
  const celdas = [
    ...(titulo ? [para([run(titulo, { bold: true, size: 23, color: colorTitulo })], { before: 0, after: 80 })] : []),
    ...lineas.map(l => para([run(l, { size: 21, color: CLR.negro })], { before: 0, after: 50 })),
  ]
  return [
    new Table({
      width: { size: W, type: WidthType.DXA },
      columnWidths: [W],
      rows: [new TableRow({ children: [new TableCell({
        width: { size: W, type: WidthType.DXA },
        shading: { fill: bg, type: ShadingType.CLEAR },
        margins: { top: 160, bottom: 160, left: 240, right: 240 },
        borders,
        children: celdas,
      })] })],
    }),
    gap(120),
  ]
}

// Tarjeta visual de módulo
function tarjetaModulo(icono, titulo, descripcion, puntos, colorFondo = CLR.celestePale, colorBorde = CLR.celeste) {
  const b = { style: BorderStyle.SINGLE, size: 4, color: colorBorde }
  const borderTop = { style: BorderStyle.THICK, size: 14, color: colorBorde }
  const borders = { top: borderTop, bottom: b, left: b, right: b, insideH: b, insideV: b }

  const children = [
    para([run(`${icono}  ${titulo}`, { bold: true, size: 26, color: colorBorde === CLR.celeste ? CLR.celesteOsc : CLR.verdeOsc })], { before: 0, after: 100 }),
    para([run(descripcion, { size: 21, color: CLR.negro })], { before: 0, after: 100 }),
    ...puntos.map(p => new Paragraph({
      numbering: { reference: 'bullets', level: 0 },
      children: [run(p, { size: 20 })],
      spacing: { before: 40, after: 40 },
    })),
  ]

  return [
    new Table({
      width: { size: W, type: WidthType.DXA },
      columnWidths: [W],
      rows: [new TableRow({ children: [new TableCell({
        width: { size: W, type: WidthType.DXA },
        shading: { fill: colorFondo, type: ShadingType.CLEAR },
        margins: { top: 180, bottom: 180, left: 240, right: 240 },
        borders,
        children,
      })] })],
    }),
    gap(160),
  ]
}

// Comparativa: Hoy vs Con FarmaLink
function filaComparativa(situacion, hoy, farmalink, ri) {
  const b = { style: BorderStyle.SINGLE, size: 4, color: CLR.grisMedio }
  const borders = { top: b, bottom: b, left: b, right: b, insideH: b, insideV: b }
  return new TableRow({
    children: [
      new TableCell({
        width: { size: 2400, type: WidthType.DXA },
        shading: { fill: ri % 2 === 0 ? CLR.grisClaro : CLR.blanco, type: ShadingType.CLEAR },
        margins: { top: 100, bottom: 100, left: 140, right: 140 },
        borders,
        children: [para([run(situacion, { bold: true, size: 20, color: CLR.grisTexto })], { before: 0, after: 0 })],
      }),
      new TableCell({
        width: { size: 3280, type: WidthType.DXA },
        shading: { fill: CLR.rojoClaro, type: ShadingType.CLEAR },
        margins: { top: 100, bottom: 100, left: 140, right: 140 },
        borders,
        children: [para([run(hoy, { size: 20, color: CLR.rojo })], { before: 0, after: 0 })],
      }),
      new TableCell({
        width: { size: 3680, type: WidthType.DXA },
        shading: { fill: CLR.verdeClaro, type: ShadingType.CLEAR },
        margins: { top: 100, bottom: 100, left: 140, right: 140 },
        borders,
        children: [para([run(farmalink, { size: 20, color: CLR.verdeOsc })], { before: 0, after: 0 })],
      }),
    ],
  })
}

function tablaComparativa(filas) {
  const b = { style: BorderStyle.SINGLE, size: 4, color: CLR.grisMedio }
  const borders = { top: b, bottom: b, left: b, right: b, insideH: b, insideV: b }
  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      new TableCell({
        width: { size: 2400, type: WidthType.DXA },
        shading: { fill: CLR.celesteOsc, type: ShadingType.CLEAR },
        margins: { top: 110, bottom: 110, left: 140, right: 140 },
        borders,
        children: [para([run('Situación', { bold: true, size: 20, color: CLR.blanco })], { before: 0, after: 0 })],
      }),
      new TableCell({
        width: { size: 3280, type: WidthType.DXA },
        shading: { fill: CLR.rojo, type: ShadingType.CLEAR },
        margins: { top: 110, bottom: 110, left: 140, right: 140 },
        borders,
        children: [para([run('Sin FarmaLink — Hoy', { bold: true, size: 20, color: CLR.blanco })], { before: 0, after: 0 })],
      }),
      new TableCell({
        width: { size: 3680, type: WidthType.DXA },
        shading: { fill: CLR.verdeOsc, type: ShadingType.CLEAR },
        margins: { top: 110, bottom: 110, left: 140, right: 140 },
        borders,
        children: [para([run('Con FarmaLink', { bold: true, size: 20, color: CLR.blanco })], { before: 0, after: 0 })],
      }),
    ],
  })
  return new Table({
    width: { size: W, type: WidthType.DXA },
    columnWidths: [2400, 3280, 3680],
    rows: [headerRow, ...filas.map((f, i) => filaComparativa(f[0], f[1], f[2], i))],
  })
}

// ─── PORTADA ──────────────────────────────────────────────────────────────────
function portada() {
  const bNav = { style: BorderStyle.NONE, size: 0, color: CLR.blanco }
  const bords = { top: bNav, bottom: bNav, left: bNav, right: bNav, insideH: bNav, insideV: bNav }

  return [
    // Banda superior
    new Table({
      width: { size: W, type: WidthType.DXA },
      columnWidths: [W],
      rows: [new TableRow({ children: [new TableCell({
        width: { size: W, type: WidthType.DXA },
        shading: { fill: CLR.celesteOsc, type: ShadingType.CLEAR },
        margins: { top: 600, bottom: 600, left: 480, right: 480 },
        borders: bords,
        children: [
          para([run('FarmaLink', { bold: true, size: 80, color: CLR.blanco, font: 'Calibri' })],
               { align: AlignmentType.CENTER, before: 0, after: 120 }),
          para([run('Transformación Digital para Distribuidoras Farmacéuticas', { size: 30, color: 'BDE6F5', font: 'Calibri' })],
               { align: AlignmentType.CENTER, before: 0, after: 0 }),
        ],
      })] })],
    }),

    // Línea verde
    new Table({
      width: { size: W, type: WidthType.DXA },
      columnWidths: [W],
      rows: [new TableRow({ children: [new TableCell({
        width: { size: W, type: WidthType.DXA },
        shading: { fill: CLR.verde, type: ShadingType.CLEAR },
        margins: { top: 60, bottom: 60, left: 0, right: 0 },
        borders: bords,
        children: [para([run('')], { before: 0, after: 0 })],
      })] })],
    }),

    gap(600),

    // Subtítulo central
    para([run('Propuesta de Solución para', { size: 26, color: CLR.grisTexto, font: 'Calibri' })],
         { align: AlignmentType.CENTER }),
    para([run('Distribuidora Farmacéutica del Perú', { bold: true, size: 36, color: CLR.negro, font: 'Calibri' })],
         { align: AlignmentType.CENTER, before: 40, after: 40 }),

    gap(400),

    // Tres pilares en la portada
    new Table({
      width: { size: W, type: WidthType.DXA },
      columnWidths: [2900, 2900, 3560],
      rows: [new TableRow({ children: [
        new TableCell({
          width: { size: 2900, type: WidthType.DXA },
          shading: { fill: CLR.celestePale, type: ShadingType.CLEAR },
          margins: { top: 200, bottom: 200, left: 200, right: 200 },
          borders: { top: { style: BorderStyle.THICK, size: 12, color: CLR.celeste }, bottom: bNav, left: bNav, right: bNav, insideH: bNav, insideV: bNav },
          children: [
            para([run('Catálogo Digital', { bold: true, size: 22, color: CLR.celesteOsc })],
                 { align: AlignmentType.CENTER, before: 0, after: 60 }),
            para([run('Todos sus productos, siempre actualizados, con fotos y precios', { size: 20, color: CLR.grisTexto })],
                 { align: AlignmentType.CENTER, before: 0, after: 0 }),
          ],
        }),
        new TableCell({
          width: { size: 2900, type: WidthType.DXA },
          shading: { fill: CLR.verdePale, type: ShadingType.CLEAR },
          margins: { top: 200, bottom: 200, left: 200, right: 200 },
          borders: { top: { style: BorderStyle.THICK, size: 12, color: CLR.verde }, bottom: bNav, left: bNav, right: bNav, insideH: bNav, insideV: bNav },
          children: [
            para([run('Pedidos sin Papel', { bold: true, size: 22, color: CLR.verdeOsc })],
                 { align: AlignmentType.CENTER, before: 0, after: 60 }),
            para([run('Del celular del vendedor al sistema en segundos, con o sin internet', { size: 20, color: CLR.grisTexto })],
                 { align: AlignmentType.CENTER, before: 0, after: 0 }),
          ],
        }),
        new TableCell({
          width: { size: 3560, type: WidthType.DXA },
          shading: { fill: 'FFF8EC', type: ShadingType.CLEAR },
          margins: { top: 200, bottom: 200, left: 200, right: 200 },
          borders: { top: { style: BorderStyle.THICK, size: 12, color: CLR.naranja }, bottom: bNav, left: bNav, right: bNav, insideH: bNav, insideV: bNav },
          children: [
            para([run('Anti-Fraude', { bold: true, size: 22, color: CLR.naranja })],
                 { align: AlignmentType.CENTER, before: 0, after: 60 }),
            para([run('Cada cobro genera un comprobante único e inviolable', { size: 20, color: CLR.grisTexto })],
                 { align: AlignmentType.CENTER, before: 0, after: 0 }),
          ],
        }),
      ]})] }),

    gap(500),

    // Pie de portada
    new Table({
      width: { size: W, type: WidthType.DXA },
      columnWidths: [W],
      rows: [new TableRow({ children: [new TableCell({
        width: { size: W, type: WidthType.DXA },
        shading: { fill: CLR.negro, type: ShadingType.CLEAR },
        margins: { top: 180, bottom: 180, left: 400, right: 400 },
        borders: bords,
        children: [
          para([run('Presentado por CP-Techs  ·  Lima, Perú  ·  Mayo 2026', { size: 20, color: 'A0BAC8', font: 'Calibri' })],
               { align: AlignmentType.CENTER, before: 0, after: 0 }),
        ],
      })] })],
    }),

    new Paragraph({ children: [new PageBreak()] }),
  ]
}

// ═══════════════════════════════════════════════════════════════════════════════
//  CONSTRUIR DOCUMENTO
// ═══════════════════════════════════════════════════════════════════════════════
function buildDoc() {

  const bNav = { style: BorderStyle.NONE, size: 0, color: CLR.blanco }

  const contenido = [

    // ───────────────────────────────────────────────────
    //  PORTADA
    // ───────────────────────────────────────────────────
    ...portada(),

    // ───────────────────────────────────────────────────
    //  SECCIÓN 1 — ENTENDEMOS SU NEGOCIO
    // ───────────────────────────────────────────────────
    h1('Entendemos su negocio'),

    cuerpo('Sabemos que una distribuidora farmacéutica opera todos los días en condiciones exigentes: vendedores en la calle, farmacias que necesitan atención ágil, cobranzas que deben cerrarse con precisión y una gerencia que necesita visibilidad para tomar decisiones.',
      { after: 80 }),
    cuerpo('FarmaLink nació para resolver exactamente eso. No es una herramienta genérica — fue diseñada desde cero pensando en cómo trabaja una distribuidora peruana, con los desafíos reales del mercado local.'),

    gap(100),

    ...caja('¿Qué es FarmaLink?', [
      'FarmaLink es un sistema digital integral que conecta a sus vendedores de campo, sus clientes farmacias y su equipo de oficina en una sola plataforma. Digitaliza todo el proceso de ventas: desde mostrar el catálogo hasta registrar el cobro — sin papeles, sin pérdidas de información y con total trazabilidad de cada operación.',
    ], CLR.celestePale, CLR.celesteOsc, CLR.celeste),

    new Paragraph({ children: [new PageBreak()] }),

    // ───────────────────────────────────────────────────
    //  SECCIÓN 2 — DIAGNÓSTICO: LO QUE FRENA SU CRECIMIENTO
    // ───────────────────────────────────────────────────
    h1('Diagnóstico: lo que frena el crecimiento hoy'),
    cuerpo('Antes de proponer cualquier solución, analizamos en detalle los puntos críticos que afectan la operación diaria de las distribuidoras farmacéuticas. Estos son los problemas más comunes y más costosos:'),
    gap(80),

    // Debilidades — tabla visual
    new Table({
      width: { size: W, type: WidthType.DXA },
      columnWidths: [560, 8800],
      rows: [
        // Fila de título
        new TableRow({ children: [
          new TableCell({
            columnSpan: 2,
            width: { size: W, type: WidthType.DXA },
            shading: { fill: CLR.rojo, type: ShadingType.CLEAR },
            margins: { top: 120, bottom: 120, left: 200, right: 200 },
            borders: { top: bNav, bottom: bNav, left: bNav, right: bNav, insideH: bNav, insideV: bNav },
            children: [para([run('Debilidades actuales — Los 7 puntos críticos', { bold: true, size: 24, color: CLR.blanco })], { before: 0, after: 0 })],
          }),
        ]}),
        // Filas de problemas
        ...[
          ['01', 'Fraude en cobranzas',
           'Los cobros en efectivo o por Yape se realizan sin comprobante oficial. No hay forma de rastrear quién cobró qué ni verificar el monto. Esto genera pérdidas que muchas veces pasan desapercibidas durante meses.'],
          ['02', 'Catálogo desactualizado',
           'Las listas de productos impresas o en Excel se desactualizan constantemente. Los vendedores visitan farmacias con información incorrecta sobre precios, stock y promociones vigentes.'],
          ['03', 'Doble trabajo manual',
           'El vendedor anota el pedido en papel durante la visita y luego debe transcribirlo al sistema de oficina. Horas perdidas, errores de digitación y duplicación de esfuerzo todos los días.'],
          ['04', 'Sin visibilidad en tiempo real',
           'La gerencia no sabe cuánto se vendió hoy, qué farmacias tienen deuda vencida ni dónde están sus vendedores en este momento. Las decisiones se toman con información del día anterior o de hace varios días.'],
          ['05', 'Sin confirmación al cliente',
           'La farmacia no recibe ninguna notificación cuando su pedido fue registrado, aprobado o está en camino. Tiene que llamar para saber qué está pasando, generando una experiencia deficiente y perdiendo tiempo del equipo.'],
          ['06', 'Dificultad para detectar irregularidades',
           'Sin trazabilidad digital, es casi imposible identificar patrones sospechosos: vendedores que cobran repetidamente sin registrar, montos que no coinciden con los pedidos, o visitas no realizadas.'],
          ['07', 'Sin datos para crecer',
           'Al no tener registros digitales estructurados, la empresa no puede analizar qué productos se venden más, qué zonas generan más ingresos, ni qué vendedores están cumpliendo su meta.'],
        ].map(([num, titulo, desc], i) =>
          new TableRow({ children: [
            new TableCell({
              width: { size: 560, type: WidthType.DXA },
              shading: { fill: i % 2 === 0 ? CLR.rojoClaro : 'FFF0F0', type: ShadingType.CLEAR },
              margins: { top: 140, bottom: 140, left: 120, right: 120 },
              borders: { top: bNav, bottom: { style: BorderStyle.SINGLE, size: 2, color: CLR.grisMedio }, left: bNav, right: bNav, insideH: bNav, insideV: bNav },
              verticalAlign: VerticalAlign.CENTER,
              children: [para([run(num, { bold: true, size: 18, color: CLR.rojo })], { align: AlignmentType.CENTER, before: 0, after: 0 })],
            }),
            new TableCell({
              width: { size: 8800, type: WidthType.DXA },
              shading: { fill: i % 2 === 0 ? CLR.blanco : CLR.grisClaro, type: ShadingType.CLEAR },
              margins: { top: 120, bottom: 120, left: 180, right: 180 },
              borders: { top: bNav, bottom: { style: BorderStyle.SINGLE, size: 2, color: CLR.grisMedio }, left: bNav, right: bNav, insideH: bNav, insideV: bNav },
              children: [
                para([run(titulo, { bold: true, size: 21, color: CLR.rojo })], { before: 0, after: 40 }),
                para([run(desc, { size: 20, color: CLR.negro })], { before: 0, after: 0 }),
              ],
            }),
          ]})
        ),
      ],
    }),

    gap(160),

    ...caja('El costo real de no digitalizarse', [
      'Para una distribuidora mediana con 5 vendedores en Lima, los problemas descritos pueden representar entre S/. 6,000 y S/. 13,000 de pérdida mensual entre fraude, tiempo perdido en digitación manual y errores en pedidos.',
      'Estos son costos silenciosos que muchas empresas asumen como "parte del negocio" — pero que son completamente evitables con las herramientas correctas.',
    ], CLR.naranjaClaro, CLR.naranja, CLR.naranja),

    new Paragraph({ children: [new PageBreak()] }),

    // ───────────────────────────────────────────────────
    //  SECCIÓN 3 — FORTALEZAS QUE FARMALINK TRAE
    // ───────────────────────────────────────────────────
    h1('Las fortalezas que FarmaLink le da a su empresa'),
    cuerpo('Cada debilidad identificada tiene una respuesta concreta en FarmaLink. Estas son las capacidades que su empresa adquiere al implementar el sistema:'),
    gap(80),

    new Table({
      width: { size: W, type: WidthType.DXA },
      columnWidths: [560, 8800],
      rows: [
        new TableRow({ children: [
          new TableCell({
            columnSpan: 2,
            width: { size: W, type: WidthType.DXA },
            shading: { fill: CLR.verdeOsc, type: ShadingType.CLEAR },
            margins: { top: 120, bottom: 120, left: 200, right: 200 },
            borders: { top: bNav, bottom: bNav, left: bNav, right: bNav, insideH: bNav, insideV: bNav },
            children: [para([run('Fortalezas — Lo que FarmaLink activa en su empresa', { bold: true, size: 24, color: CLR.blanco })], { before: 0, after: 0 })],
          }),
        ]}),
        ...[
          ['F1', 'Control total de cobranzas',
           'Cada cobro genera un comprobante digital único que no puede modificarse. El sistema verifica automáticamente la autenticidad de cada recibo y alerta si detecta cualquier irregularidad.'],
          ['F2', 'Catálogo siempre vigente',
           'Un catálogo digital con fotos, precios actualizados y promociones activas — accesible desde el celular del vendedor en cualquier momento, incluso sin internet.'],
          ['F3', 'Pedidos en tiempo real, sin papeles',
           'Desde el celular del vendedor al sistema de oficina en segundos. Sin transcripción, sin pérdidas de papel, sin errores de digitación. El pedido queda registrado al instante.'],
          ['F4', 'Visibilidad total para la gerencia',
           'Un panel de control que muestra en tiempo real: ventas del día, cobros realizados, ubicación de los vendedores y alertas de posible fraude — todo desde una computadora o celular.'],
          ['F5', 'Clientes mejor atendidos',
           'La farmacia recibe su recibo por WhatsApp automáticamente al instante. Sabe el estado de su pedido sin tener que llamar. Eso genera fidelidad y preferencia hacia su distribuidora.'],
          ['F6', 'Trazabilidad completa de cada operación',
           'Cada pedido, cobro y visita queda registrado con fecha, hora y ubicación GPS. Si algo no cuadra, la gerencia puede investigar y encontrar la respuesta en segundos.'],
          ['F7', 'Datos para tomar decisiones estratégicas',
           'Reportes automáticos de productos más vendidos, zonas con mayor demanda, vendedores con mejor rendimiento y farmacias con mayor potencial. Información para crecer con inteligencia.'],
        ].map(([num, titulo, desc], i) =>
          new TableRow({ children: [
            new TableCell({
              width: { size: 560, type: WidthType.DXA },
              shading: { fill: i % 2 === 0 ? CLR.verdeClaro : CLR.verdePale, type: ShadingType.CLEAR },
              margins: { top: 140, bottom: 140, left: 120, right: 120 },
              borders: { top: bNav, bottom: { style: BorderStyle.SINGLE, size: 2, color: CLR.grisMedio }, left: bNav, right: bNav, insideH: bNav, insideV: bNav },
              verticalAlign: VerticalAlign.CENTER,
              children: [para([run(num, { bold: true, size: 18, color: CLR.verdeOsc })], { align: AlignmentType.CENTER, before: 0, after: 0 })],
            }),
            new TableCell({
              width: { size: 8800, type: WidthType.DXA },
              shading: { fill: i % 2 === 0 ? CLR.blanco : CLR.grisClaro, type: ShadingType.CLEAR },
              margins: { top: 120, bottom: 120, left: 180, right: 180 },
              borders: { top: bNav, bottom: { style: BorderStyle.SINGLE, size: 2, color: CLR.grisMedio }, left: bNav, right: bNav, insideH: bNav, insideV: bNav },
              children: [
                para([run(titulo, { bold: true, size: 21, color: CLR.verdeOsc })], { before: 0, after: 40 }),
                para([run(desc, { size: 20, color: CLR.negro })], { before: 0, after: 0 }),
              ],
            }),
          ]})
        ),
      ],
    }),

    gap(80),
    new Paragraph({ children: [new PageBreak()] }),

    // ───────────────────────────────────────────────────
    //  SECCIÓN 4 — LAS SOLUCIONES: LOS 5 MÓDULOS
    // ───────────────────────────────────────────────────
    h1('Las soluciones de FarmaLink'),
    cuerpo('FarmaLink se compone de cinco módulos integrados que trabajan juntos para cubrir todo el ciclo de operaciones de su distribuidora. Cada módulo fue diseñado pensando en los usuarios reales: vendedores en la calle, farmacias que compran y administradores que necesitan control.'),
    gap(120),

    ...tarjetaModulo(
      '01',
      'Catálogo Digital con Fotos',
      'Su fuerza de ventas lleva siempre el catálogo completo en el bolsillo. Las farmacias pueden ver los productos con foto, precio y promociones vigentes — sin listas impresas desactualizadas.',
      [
        'Catálogo de hasta 500 productos con fotos y precios actualizados en tiempo real.',
        'Filtros por categoría, laboratorio y rango de precio para encontrar cualquier producto en segundos.',
        'Las promociones aparecen automáticamente con su descuento calculado.',
        'Funciona sin internet — el vendedor puede mostrarlo incluso en zonas con mala señal.',
        'El catálogo completo se puede exportar como PDF para enviar por correo o WhatsApp.',
      ],
      CLR.celestePale, CLR.celeste
    ),

    ...tarjetaModulo(
      '02',
      'Generador de Pedidos sin Papel',
      'El vendedor crea el pedido desde su celular durante la visita. Sin anotar en papel, sin llamar a la oficina, sin transcribir después. El pedido queda registrado al instante.',
      [
        'Selección de productos con cantidades y el sistema calcula totales y descuentos automáticamente.',
        'El pedido se envía al sistema central en tiempo real mientras el vendedor está con el cliente.',
        'Si no hay internet, el pedido se guarda en el celular y se envía solo cuando regresa la señal.',
        'Historial completo de pedidos por cliente para revisar en cualquier momento.',
        'Elimina el doble trabajo de anotación manual y posterior digitación en oficina.',
      ],
      CLR.verdePale, CLR.verde
    ),

    new Paragraph({ children: [new PageBreak()] }),

    ...tarjetaModulo(
      '03',
      'Recibos Digitales Anti-Fraude',
      'Este es el módulo que más valor protege. Cada cobro genera un comprobante digital único e inviolable. Si alguien intenta alterar la información del recibo, el sistema lo detecta automáticamente y alerta al administrador.',
      [
        'Comprobante digital con código de verificación único e irrepetible para cada cobro.',
        'El recibo se envía automáticamente a la farmacia por WhatsApp al momento de confirmar el pago.',
        'El sistema registra la ubicación exacta donde se realizó el cobro.',
        'El administrador puede verificar la autenticidad de cualquier recibo con un clic.',
        'Compatible con Yape, Plin, efectivo y transferencia bancaria.',
        'Alertas automáticas cuando el sistema detecta comportamientos irregulares.',
      ],
      CLR.naranjaClaro, CLR.naranja
    ),

    ...tarjetaModulo(
      '04',
      'Panel de Control para el Administrador',
      'El gerente tiene visibilidad total de la operación desde su computadora. Sin esperar reportes del día siguiente — todo en tiempo real, organizado y fácil de leer.',
      [
        'Indicadores clave del día: ventas totales, cobros confirmados, pedidos en curso y alertas activas.',
        'Gráficas de rendimiento por semana, mes y vendedor para identificar tendencias.',
        'Mapa en tiempo real con la ubicación registrada de los últimos cobros de cada vendedor.',
        'Gestión completa del catálogo: agregar, modificar y desactivar productos desde la oficina.',
        'Reportes exportables para el área contable y para análisis estratégico de la gerencia.',
        'Alertas de fraude destacadas que requieren revisión del administrador.',
      ],
      CLR.celestePale, CLR.celeste
    ),

    ...tarjetaModulo(
      '05',
      'Notificaciones Automáticas por WhatsApp',
      'FarmaLink se integra con WhatsApp para mantener comunicados a sus clientes y a su equipo — sin costos adicionales de llamadas ni mensajes manuales.',
      [
        'La farmacia recibe su recibo de pago automáticamente por WhatsApp al instante.',
        'El gerente puede enviar ofertas y promociones a cientos de farmacias a la vez, filtrando por zona.',
        'Recordatorios automáticos de deudas próximas a vencer para reducir morosidad.',
        'Notificaciones internas al equipo sobre pedidos urgentes y alertas del sistema.',
      ],
      CLR.verdePale, CLR.verde
    ),

    new Paragraph({ children: [new PageBreak()] }),

    // ───────────────────────────────────────────────────
    //  SECCIÓN 5 — LO QUE CAMBIA: ANTES Y DESPUÉS
    // ───────────────────────────────────────────────────
    h1('Lo que cambia al implementar FarmaLink'),
    cuerpo('Esta tabla muestra en concreto cómo se transforma el día a día de su empresa con FarmaLink. Cada fila es una situación real que ocurre hoy y que cambia desde el primer día de uso:'),
    gap(100),

    tablaComparativa([
      ['Mostrar productos al cliente',
       'Lista impresa o archivo desactualizado sin fotos',
       'Catálogo digital con fotos y precios en vivo desde el celular'],
      ['Tomar un pedido',
       'Anotar en papel, volver a oficina y transcribir',
       'Pedido creado en 2 minutos desde el celular, registrado al instante'],
      ['Registrar un cobro',
       'Cobro manual sin comprobante verificable',
       'Recibo digital único, enviado a la farmacia por WhatsApp en segundos'],
      ['Detectar cobros irregulares',
       'Solo si se investiga manualmente, días después',
       'Alerta automática en tiempo real al administrador'],
      ['Ver las ventas del día',
       'Al cierre de caja, con horas de atraso',
       'Panel en tiempo real, visible desde cualquier celular o computadora'],
      ['Enviar una oferta a los clientes',
       'Llamadas individuales o mensajes manuales a cada farmacia',
       'Envío masivo a toda la red por WhatsApp en menos de 1 minuto'],
      ['Trabajar en zona sin internet',
       'Imposible — el vendedor pierde la visita o no registra el pedido',
       'El pedido se guarda localmente y se sincroniza solo al reconectar'],
      ['Saber dónde realizó cobros cada vendedor',
       'Confiar en el reporte verbal del vendedor',
       'Mapa con la ubicación registrada de cada cobro del día'],
      ['Preparar un reporte para gerencia',
       'Consolidar datos manualmente en Excel — horas de trabajo',
       'Reporte generado automáticamente con un clic, exportable'],
    ]),

    gap(120),

    new Paragraph({ children: [new PageBreak()] }),

    // ───────────────────────────────────────────────────
    //  SECCIÓN 6 — ¿QUIÉNES USAN FARMALINK?
    // ───────────────────────────────────────────────────
    h1('¿Quiénes usan FarmaLink y qué hace cada uno?'),
    cuerpo('FarmaLink fue diseñado para los tres actores principales de su operación. Cada uno accede al sistema desde el dispositivo que usa en su día a día — sin instalaciones complicadas.'),
    gap(100),

    new Table({
      width: { size: W, type: WidthType.DXA },
      columnWidths: [3060, 3060, 3240],
      rows: [
        new TableRow({ children: [
          new TableCell({
            width: { size: 3060, type: WidthType.DXA },
            shading: { fill: CLR.celesteOsc, type: ShadingType.CLEAR },
            margins: { top: 160, bottom: 160, left: 200, right: 200 },
            borders: { top: { style: BorderStyle.THICK, size: 14, color: CLR.celeste }, bottom: bNav, left: bNav, right: bNav, insideH: bNav, insideV: bNav },
            children: [
              para([run('La Farmacia (Cliente)', { bold: true, size: 23, color: CLR.blanco })], { align: AlignmentType.CENTER, before: 0, after: 60 }),
              para([run('Accede desde su celular', { size: 19, color: 'BDE6F5' })], { align: AlignmentType.CENTER, before: 0, after: 0 }),
            ],
          }),
          new TableCell({
            width: { size: 3060, type: WidthType.DXA },
            shading: { fill: CLR.verdeOsc, type: ShadingType.CLEAR },
            margins: { top: 160, bottom: 160, left: 200, right: 200 },
            borders: { top: { style: BorderStyle.THICK, size: 14, color: CLR.verde }, bottom: bNav, left: bNav, right: bNav, insideH: bNav, insideV: bNav },
            children: [
              para([run('El Vendedor (Campo)', { bold: true, size: 23, color: CLR.blanco })], { align: AlignmentType.CENTER, before: 0, after: 60 }),
              para([run('Celular y tableta', { size: 19, color: 'B5E8CC' })], { align: AlignmentType.CENTER, before: 0, after: 0 }),
            ],
          }),
          new TableCell({
            width: { size: 3240, type: WidthType.DXA },
            shading: { fill: CLR.grisTexto, type: ShadingType.CLEAR },
            margins: { top: 160, bottom: 160, left: 200, right: 200 },
            borders: { top: { style: BorderStyle.THICK, size: 14, color: CLR.negro }, bottom: bNav, left: bNav, right: bNav, insideH: bNav, insideV: bNav },
            children: [
              para([run('El Administrador (Oficina)', { bold: true, size: 23, color: CLR.blanco })], { align: AlignmentType.CENTER, before: 0, after: 60 }),
              para([run('Computadora de escritorio', { size: 19, color: 'A0BAC8' })], { align: AlignmentType.CENTER, before: 0, after: 0 }),
            ],
          }),
        ]}),
        new TableRow({ children: [
          new TableCell({
            width: { size: 3060, type: WidthType.DXA },
            shading: { fill: CLR.celestePale, type: ShadingType.CLEAR },
            margins: { top: 160, bottom: 160, left: 200, right: 200 },
            borders: { top: bNav, bottom: bNav, left: bNav, right: bNav, insideH: bNav, insideV: bNav },
            children: [
              ...[
                'Ver el catálogo completo con fotos y precios',
                'Solicitar contacto con su vendedor asignado',
                'Ver el historial de sus pedidos anteriores',
                'Recibir sus recibos de pago por WhatsApp',
                'Consultar el estado de una entrega pendiente',
              ].map(t => new Paragraph({ numbering: { reference: 'bullets', level: 0 }, children: [run(t, { size: 19 })], spacing: { before: 40, after: 40 } })),
            ],
          }),
          new TableCell({
            width: { size: 3060, type: WidthType.DXA },
            shading: { fill: CLR.verdePale, type: ShadingType.CLEAR },
            margins: { top: 160, bottom: 160, left: 200, right: 200 },
            borders: { top: bNav, bottom: bNav, left: bNav, right: bNav, insideH: bNav, insideV: bNav },
            children: [
              ...[
                'Mostrar el catálogo con fotos al cliente',
                'Crear pedidos desde el celular en segundos',
                'Trabajar sin internet y sincronizar al volver',
                'Registrar cobros y generar recibos digitales',
                'Ver el resumen de su día: ventas y metas',
              ].map(t => new Paragraph({ numbering: { reference: 'bullets', level: 0 }, children: [run(t, { size: 19 })], spacing: { before: 40, after: 40 } })),
            ],
          }),
          new TableCell({
            width: { size: 3240, type: WidthType.DXA },
            shading: { fill: CLR.grisClaro, type: ShadingType.CLEAR },
            margins: { top: 160, bottom: 160, left: 200, right: 200 },
            borders: { top: bNav, bottom: bNav, left: bNav, right: bNav, insideH: bNav, insideV: bNav },
            children: [
              ...[
                'Ver ventas y cobros del día en tiempo real',
                'Gestionar el catálogo completo de productos',
                'Verificar autenticidad de cobros registrados',
                'Recibir alertas de fraude automáticas',
                'Enviar ofertas masivas por WhatsApp',
                'Exportar reportes para contabilidad',
              ].map(t => new Paragraph({ numbering: { reference: 'bullets', level: 0 }, children: [run(t, { size: 19 })], spacing: { before: 40, after: 40 } })),
            ],
          }),
        ]}),
      ],
    }),

    gap(80),
    new Paragraph({ children: [new PageBreak()] }),

    // ───────────────────────────────────────────────────
    //  SECCIÓN 7 — VISIÓN DE FUTURO Y EXPANSIÓN
    // ───────────────────────────────────────────────────
    h1('Visión de futuro: el crecimiento que viene'),
    cuerpo('FarmaLink fue construido para escalar con su empresa. El sistema que se implementa hoy es la base de una plataforma que puede crecer en capacidad, en usuarios y en mercados. Estas son las expansiones disponibles para las siguientes etapas:'),
    gap(100),

    h2('A corto plazo — Los primeros pasos después del lanzamiento'),
    gap(40),

    new Table({
      width: { size: W, type: WidthType.DXA },
      columnWidths: [2800, 6560],
      rows: [
        new TableRow({ children: [
          new TableCell({ width: { size: 2800, type: WidthType.DXA }, shading: { fill: CLR.celesteOsc, type: ShadingType.CLEAR }, margins: { top: 110, bottom: 110, left: 160, right: 160 },
            borders: { top: bNav, bottom: bNav, left: bNav, right: bNav, insideH: bNav, insideV: bNav },
            children: [para([run('Expansión', { bold: true, size: 20, color: CLR.blanco })], { before: 0, after: 0 })] }),
          new TableCell({ width: { size: 6560, type: WidthType.DXA }, shading: { fill: CLR.celesteOsc, type: ShadingType.CLEAR }, margins: { top: 110, bottom: 110, left: 160, right: 160 },
            borders: { top: bNav, bottom: bNav, left: bNav, right: bNav, insideH: bNav, insideV: bNav },
            children: [para([run('Qué significa para su empresa', { bold: true, size: 20, color: CLR.blanco })], { before: 0, after: 0 })] }),
        ]}),
        ...[
          ['Portal propio para las farmacias',
           'Sus clientes tendrán un acceso personal para ver su historial, hacer pedidos directamente y descargar sus comprobantes — sin necesidad de llamar al vendedor.'],
          ['Aplicación descargable en Android',
           'Sus vendedores podrán instalar FarmaLink desde Google Play en su celular personal, sin depender de una URL o navegador.'],
          ['Facturación electrónica integrada',
           'Generación automática de boletas y facturas electrónicas válidas ante SUNAT, directamente desde cada pedido confirmado.'],
          ['Importación masiva de productos',
           'Subir o actualizar cientos de productos desde un archivo Excel en minutos, sin cargar uno por uno desde el panel.'],
        ].map(([titulo, desc], i) => new TableRow({ children: [
          new TableCell({ width: { size: 2800, type: WidthType.DXA }, shading: { fill: i % 2 === 0 ? CLR.celestePale : CLR.blanco, type: ShadingType.CLEAR }, margins: { top: 110, bottom: 110, left: 160, right: 160 },
            borders: { top: bNav, bottom: { style: BorderStyle.SINGLE, size: 2, color: CLR.grisMedio }, left: bNav, right: bNav, insideH: bNav, insideV: bNav },
            children: [para([run(titulo, { bold: true, size: 20, color: CLR.celesteOsc })], { before: 0, after: 0 })] }),
          new TableCell({ width: { size: 6560, type: WidthType.DXA }, shading: { fill: i % 2 === 0 ? CLR.blanco : CLR.grisClaro, type: ShadingType.CLEAR }, margins: { top: 110, bottom: 110, left: 160, right: 160 },
            borders: { top: bNav, bottom: { style: BorderStyle.SINGLE, size: 2, color: CLR.grisMedio }, left: bNav, right: bNav, insideH: bNav, insideV: bNav },
            children: [para([run(desc, { size: 20 })], { before: 0, after: 0 })] }),
        ]})),
      ],
    }),

    gap(160),
    h2('A mediano plazo — Ampliando el alcance'),
    gap(40),

    new Table({
      width: { size: W, type: WidthType.DXA },
      columnWidths: [2800, 6560],
      rows: [
        new TableRow({ children: [
          new TableCell({ width: { size: 2800, type: WidthType.DXA }, shading: { fill: CLR.verdeOsc, type: ShadingType.CLEAR }, margins: { top: 110, bottom: 110, left: 160, right: 160 },
            borders: { top: bNav, bottom: bNav, left: bNav, right: bNav, insideH: bNav, insideV: bNav },
            children: [para([run('Expansión', { bold: true, size: 20, color: CLR.blanco })], { before: 0, after: 0 })] }),
          new TableCell({ width: { size: 6560, type: WidthType.DXA }, shading: { fill: CLR.verdeOsc, type: ShadingType.CLEAR }, margins: { top: 110, bottom: 110, left: 160, right: 160 },
            borders: { top: bNav, bottom: bNav, left: bNav, right: bNav, insideH: bNav, insideV: bNav },
            children: [para([run('Qué significa para su empresa', { bold: true, size: 20, color: CLR.blanco })], { before: 0, after: 0 })] }),
        ]}),
        ...[
          ['Pedidos automáticos por WhatsApp',
           'Una farmacia podrá enviar un mensaje de WhatsApp a su número y el sistema interpretará el pedido automáticamente — sin intervención del vendedor para pedidos de reposición rutinaria.'],
          ['Aplicación para iOS (iPhone)',
           'Publicar FarmaLink en la App Store de Apple para que sus vendedores con iPhone también tengan la aplicación instalada de forma nativa.'],
          ['Módulo de devoluciones y cambios',
           'Gestión digital del proceso de devolución de mercadería: registro del motivo, descuento automático en la siguiente factura y trazabilidad completa del movimiento.'],
          ['Análisis de ventas avanzado',
           'Un panel ejecutivo con indicadores de largo plazo: tendencias de crecimiento por zona, proyecciones de demanda por producto y comparativas entre períodos.'],
        ].map(([titulo, desc], i) => new TableRow({ children: [
          new TableCell({ width: { size: 2800, type: WidthType.DXA }, shading: { fill: i % 2 === 0 ? CLR.verdePale : CLR.blanco, type: ShadingType.CLEAR }, margins: { top: 110, bottom: 110, left: 160, right: 160 },
            borders: { top: bNav, bottom: { style: BorderStyle.SINGLE, size: 2, color: CLR.grisMedio }, left: bNav, right: bNav, insideH: bNav, insideV: bNav },
            children: [para([run(titulo, { bold: true, size: 20, color: CLR.verdeOsc })], { before: 0, after: 0 })] }),
          new TableCell({ width: { size: 6560, type: WidthType.DXA }, shading: { fill: i % 2 === 0 ? CLR.blanco : CLR.grisClaro, type: ShadingType.CLEAR }, margins: { top: 110, bottom: 110, left: 160, right: 160 },
            borders: { top: bNav, bottom: { style: BorderStyle.SINGLE, size: 2, color: CLR.grisMedio }, left: bNav, right: bNav, insideH: bNav, insideV: bNav },
            children: [para([run(desc, { size: 20 })], { before: 0, after: 0 })] }),
        ]})),
      ],
    }),

    gap(160),
    h2('A largo plazo — La expansión del territorio'),
    gap(40),

    ...caja(
      'Más allá de Lima: FarmaLink como plataforma de crecimiento nacional',
      [
        'Una vez consolidado el sistema en Lima, FarmaLink puede adaptarse para operar en otras ciudades del Perú — Arequipa, Trujillo, Cusco — con rutas, zonas y vendedores independientes bajo una misma plataforma.',
        'El sistema también puede escalar para integrar a múltiples distribuidoras asociadas, convirtiéndose en una red de distribución farmacéutica conectada digitalmente a nivel nacional.',
        'A largo plazo, los datos acumulados del sistema permiten incorporar inteligencia de mercado: saber qué productos tendrán alta demanda antes de que lleguen al punto de quiebre de stock, o identificar farmacias con potencial de crecimiento que aún no están siendo atendidas correctamente.',
      ],
      CLR.grisClaro, CLR.negro, CLR.celesteOsc
    ),

    new Paragraph({ children: [new PageBreak()] }),

    // ───────────────────────────────────────────────────
    //  SECCIÓN 8 — POR QUÉ AHORA
    // ───────────────────────────────────────────────────
    h1('¿Por qué actuar ahora?'),
    gap(60),

    new Table({
      width: { size: W, type: WidthType.DXA },
      columnWidths: [W],
      rows: [new TableRow({ children: [new TableCell({
        width: { size: W, type: WidthType.DXA },
        shading: { fill: CLR.celesteOsc, type: ShadingType.CLEAR },
        margins: { top: 240, bottom: 240, left: 360, right: 360 },
        borders: { top: bNav, bottom: bNav, left: bNav, right: bNav, insideH: bNav, insideV: bNav },
        children: [
          para([run('"Cada semana sin digitalizar es una semana de datos perdidos, cobros no verificables y oportunidades de venta que no se capitalizan."', { bold: true, size: 26, color: CLR.blanco, italics: true, font: 'Calibri' })],
               { align: AlignmentType.CENTER, before: 0, after: 0 }),
        ],
      })] })],
    }),

    gap(160),

    new Table({
      width: { size: W, type: WidthType.DXA },
      columnWidths: [4600, 4760],
      rows: [new TableRow({ children: [
        new TableCell({
          width: { size: 4600, type: WidthType.DXA },
          shading: { fill: CLR.celestePale, type: ShadingType.CLEAR },
          margins: { top: 220, bottom: 220, left: 280, right: 280 },
          borders: { top: { style: BorderStyle.THICK, size: 12, color: CLR.celeste }, bottom: bNav, left: bNav, right: bNav, insideH: bNav, insideV: bNav },
          children: [
            para([run('Lo que gana al implementar hoy', { bold: true, size: 22, color: CLR.celesteOsc })], { before: 0, after: 100 }),
            ...[
              'Protección inmediata contra fraudes en cobranzas.',
              'Visibilidad total de la operación desde el primer día.',
              'Vendedores más productivos con mejores herramientas.',
              'Clientes farmacias con mejor experiencia de compra.',
              'Datos históricos que empiezan a acumularse desde el día 1.',
              'Ventaja competitiva frente a otras distribuidoras del sector.',
            ].map(t => new Paragraph({ numbering: { reference: 'bullets', level: 0 }, children: [run(t, { size: 20 })], spacing: { before: 40, after: 40 } })),
          ],
        }),
        new TableCell({
          width: { size: 4760, type: WidthType.DXA },
          shading: { fill: CLR.rojoClaro, type: ShadingType.CLEAR },
          margins: { top: 220, bottom: 220, left: 280, right: 280 },
          borders: { top: { style: BorderStyle.THICK, size: 12, color: CLR.rojo }, bottom: bNav, left: bNav, right: bNav, insideH: bNav, insideV: bNav },
          children: [
            para([run('Lo que se sigue perdiendo sin actuar', { bold: true, size: 22, color: CLR.rojo })], { before: 0, after: 100 }),
            ...[
              'Cobros irregulares que siguen sin detección.',
              'Horas de trabajo duplicado todos los días.',
              'Decisiones tomadas sin información actualizada.',
              'Farmacias que se van con la competencia por falta de atención.',
              'Sin historial de datos para negociar con laboratorios.',
              'Mayor dificultad para escalar cuando el negocio crezca.',
            ].map(t => new Paragraph({ numbering: { reference: 'bullets', level: 0 }, children: [run(t, { size: 20 })], spacing: { before: 40, after: 40 } })),
          ],
        }),
      ]})] }),

    gap(160),

    // ───────────────────────────────────────────────────
    //  CIERRE
    // ───────────────────────────────────────────────────
    new Table({
      width: { size: W, type: WidthType.DXA },
      columnWidths: [W],
      rows: [new TableRow({ children: [new TableCell({
        width: { size: W, type: WidthType.DXA },
        shading: { fill: CLR.negro, type: ShadingType.CLEAR },
        margins: { top: 300, bottom: 300, left: 400, right: 400 },
        borders: { top: bNav, bottom: bNav, left: bNav, right: bNav, insideH: bNav, insideV: bNav },
        children: [
          para([run('FarmaLink no es solo una herramienta — es la infraestructura digital que su distribuidora necesita para operar con control, crecer con confianza y competir con ventaja en el mercado farmacéutico peruano.', { size: 24, color: CLR.blanco, font: 'Calibri' })],
               { align: AlignmentType.CENTER, before: 0, after: 160 }),
          para([run('Estamos listos para acompañarlos en este camino.', { bold: true, size: 26, color: CLR.verde, font: 'Calibri' })],
               { align: AlignmentType.CENTER, before: 0, after: 120 }),
          para([run('CP-Techs  ·  Lima, Perú  ·  Mayo 2026', { size: 20, color: '5B8A9A', font: 'Calibri' })],
               { align: AlignmentType.CENTER, before: 0, after: 0 }),
        ],
      })] })],
    }),

    gap(40),
  ]

  return new Document({
    numbering: {
      config: [{
        reference: 'bullets',
        levels: [{
          level: 0,
          format: LevelFormat.BULLET,
          text: '•',
          alignment: AlignmentType.LEFT,
          style: {
            paragraph: { indent: { left: 480, hanging: 280 } },
            run: { font: 'Arial', size: 20, color: CLR.celeste },
          },
        }],
      }],
    },
    styles: {
      default: {
        document: { run: { font: 'Calibri', size: 22, color: CLR.negro } },
      },
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
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: 'FarmaLink  ·  Propuesta de Solución Digital  ·  CP-Techs', font: 'Calibri', size: 18, color: CLR.grisOscuro, italics: true }),
              ],
              alignment: AlignmentType.RIGHT,
              spacing: { before: 0, after: 0 },
              border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: CLR.grisMedio, space: 4 } },
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: 'Confidencial  ·  Página ', font: 'Calibri', size: 18, color: CLR.grisOscuro }),
                new TextRun({ children: [PageNumber.CURRENT], font: 'Calibri', size: 18, color: CLR.grisOscuro }),
                new TextRun({ text: ' de ', font: 'Calibri', size: 18, color: CLR.grisOscuro }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES], font: 'Calibri', size: 18, color: CLR.grisOscuro }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { before: 0, after: 0 },
              border: { top: { style: BorderStyle.SINGLE, size: 6, color: CLR.grisMedio, space: 4 } },
            }),
          ],
        }),
      },
      children: contenido,
    }],
  })
}

// ─── EJECUTAR ─────────────────────────────────────────────────────────────────
const doc = buildDoc()
Packer.toBuffer(doc).then(buf => {
  writeFileSync('A:/PropuestaFarmacia/FarmaLink_Presentacion_Ejecutiva.docx', buf)
  console.log('Documento generado: FarmaLink_Presentacion_Ejecutiva.docx')
}).catch(err => { console.error(err); process.exit(1) })
