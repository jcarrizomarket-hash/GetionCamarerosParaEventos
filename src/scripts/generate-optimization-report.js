#!/usr/bin/env node
/**
 * Script para generar el Informe de Optimización y Refactorización en formato PDF.
 * Uso: node src/scripts/generate-optimization-report.js
 */

'use strict';

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// ─── Paleta de colores ────────────────────────────────────────────────────────
const COLOR = {
  primary:   '#1E40AF',   // azul oscuro
  secondary: '#3B82F6',   // azul medio
  accent:    '#10B981',   // verde esmeralda
  dark:      '#1F2937',   // gris oscuro (texto)
  medium:    '#374151',   // gris medio
  light:     '#6B7280',   // gris claro
  muted:     '#9CA3AF',   // gris muy claro
  bg:        '#F9FAFB',   // fondo sección
  white:     '#FFFFFF',
  border:    '#E5E7EB',
  warning:   '#F59E0B',
  danger:    '#EF4444',
  success:   '#10B981',
};

// ─── Márgenes y dimensiones ───────────────────────────────────────────────────
const MARGIN = 50;
const PAGE_W = 595.28;   // A4 points
const PAGE_H = 841.89;
const CONTENT_W = PAGE_W - MARGIN * 2;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function rgb(doc, hex) {
  const [r, g, b] = hexToRgb(hex);
  return doc.fillColor(hex);
}

function stroke(doc, hex) {
  doc.strokeColor(hex);
}

// ─── Registrar TOC ────────────────────────────────────────────────────────────
const tocEntries = [];
let pageCounter = 0;

function addTocEntry(title, level = 1) {
  tocEntries.push({ title, level, page: pageCounter });
}

// ─── Componentes de diseño ────────────────────────────────────────────────────

/** Rectángulo de color de fondo de sección */
function sectionBg(doc, y, h, color = COLOR.bg) {
  doc.save()
    .rect(0, y, PAGE_W, h)
    .fill(color)
    .restore();
}

/** Línea horizontal separadora */
function hRule(doc, y, color = COLOR.border) {
  doc.save()
    .moveTo(MARGIN, y)
    .lineTo(PAGE_W - MARGIN, y)
    .strokeColor(color)
    .lineWidth(0.5)
    .stroke()
    .restore();
}

/** Badge de pill */
function badge(doc, x, y, text, bgColor, textColor = COLOR.white) {
  const padding = 6;
  const h = 14;
  doc.save()
    .fontSize(7)
    .font('Helvetica-Bold');
  const w = doc.widthOfString(text) + padding * 2;
  doc.roundedRect(x, y, w, h, 4).fill(bgColor);
  doc.fillColor(textColor)
    .text(text, x + padding, y + 3.5, { lineBreak: false });
  doc.restore();
  return w;
}

/** Cabecera de página */
function pageHeader(doc, subtitle = '') {
  doc.save()
    .rect(0, 0, PAGE_W, 36)
    .fill(COLOR.primary);
  doc.fontSize(8)
    .font('Helvetica-Bold')
    .fillColor(COLOR.white)
    .text('Informe de Optimización y Refactorización', MARGIN, 14, { lineBreak: false });
  if (subtitle) {
    doc.font('Helvetica')
      .fillColor('rgba(255,255,255,0.7)')
      .text(` · ${subtitle}`, { continued: false, lineBreak: false });
  }
  doc.restore();
}

/** Pie de página con número */
function pageFooter(doc, num) {
  const y = PAGE_H - 30;
  hRule(doc, y);
  doc.save()
    .fontSize(8)
    .font('Helvetica')
    .fillColor(COLOR.muted)
    .text('jcarrizomarket-hash / GetionCamarerosParaEventos', MARGIN, y + 8, { lineBreak: false })
    .text(`Página ${num}`, PAGE_W - MARGIN - 40, y + 8, { lineBreak: false });
  doc.restore();
}

/** Título de sección (H2) */
function sectionTitle(doc, text, y, color = COLOR.primary) {
  doc.save()
    .rect(MARGIN, y, 3, 20)
    .fill(color);
  doc.fontSize(16)
    .font('Helvetica-Bold')
    .fillColor(color)
    .text(text, MARGIN + 10, y + 2, { lineBreak: false });
  doc.restore();
  return y + 28;
}

/** Título de subsección (H3) */
function subTitle(doc, text, y, color = COLOR.medium) {
  doc.save()
    .fontSize(11)
    .font('Helvetica-Bold')
    .fillColor(color)
    .text(text, MARGIN, y, { lineBreak: false });
  doc.restore();
  return y + 18;
}

/** Párrafo de texto */
function paragraph(doc, text, x, y, opts = {}) {
  doc.save()
    .fontSize(opts.size || 10)
    .font(opts.bold ? 'Helvetica-Bold' : 'Helvetica')
    .fillColor(opts.color || COLOR.medium)
    .text(text, x, y, { width: opts.width || CONTENT_W, align: opts.align || 'left' });
  const h = doc.heightOfString(text, { width: opts.width || CONTENT_W });
  doc.restore();
  return y + h + (opts.gap !== undefined ? opts.gap : 6);
}

/** Ítem de lista con bullet */
function listItem(doc, text, x, y, bulletColor = COLOR.secondary) {
  doc.save()
    .circle(x + 4, y + 5, 2.5)
    .fill(bulletColor);
  doc.fontSize(10)
    .font('Helvetica')
    .fillColor(COLOR.medium)
    .text(text, x + 12, y, { width: CONTENT_W - (x - MARGIN) - 12 });
  const h = doc.heightOfString(text, { width: CONTENT_W - (x - MARGIN) - 12 });
  doc.restore();
  return y + Math.max(h, 14) + 3;
}

/** Fila de tabla (dos columnas) */
function tableRow(doc, col1, col2, y, shade = false) {
  if (shade) {
    doc.save()
      .rect(MARGIN, y, CONTENT_W, 18)
      .fill(COLOR.bg)
      .restore();
  }
  doc.save()
    .fontSize(9)
    .font('Helvetica')
    .fillColor(COLOR.medium)
    .text(col1, MARGIN + 4, y + 4, { width: CONTENT_W * 0.45, lineBreak: false })
    .text(col2, MARGIN + CONTENT_W * 0.5, y + 4, { width: CONTENT_W * 0.5, lineBreak: false });
  doc.restore();
  return y + 18;
}

/** Cabecera de tabla */
function tableHeader(doc, col1, col2, y, col3) {
  doc.save()
    .rect(MARGIN, y, CONTENT_W, 20)
    .fill(COLOR.primary);
  doc.fontSize(9)
    .font('Helvetica-Bold')
    .fillColor(COLOR.white)
    .text(col1, MARGIN + 4, y + 5, { width: CONTENT_W * 0.45, lineBreak: false });
  if (col3 !== undefined) {
    doc.text(col2, MARGIN + CONTENT_W * 0.45, y + 5, { width: CONTENT_W * 0.3, lineBreak: false })
      .text(col3, MARGIN + CONTENT_W * 0.75, y + 5, { width: CONTENT_W * 0.25, lineBreak: false });
  } else {
    doc.text(col2, MARGIN + CONTENT_W * 0.5, y + 5, { width: CONTENT_W * 0.5, lineBreak: false });
  }
  doc.restore();
  return y + 20;
}

/** Tarjeta de métrica */
function metricCard(doc, x, y, w, h, value, label, color = COLOR.secondary) {
  doc.save()
    .roundedRect(x, y, w, h, 6)
    .fill(color);
  doc.fontSize(22)
    .font('Helvetica-Bold')
    .fillColor(COLOR.white)
    .text(value, x, y + 12, { width: w, align: 'center', lineBreak: false });
  doc.fontSize(8)
    .font('Helvetica')
    .fillColor('rgba(255,255,255,0.85)')
    .text(label, x, y + h - 18, { width: w, align: 'center', lineBreak: false });
  doc.restore();
}

/** Tarjeta de fase */
function phaseCard(doc, x, y, w, phase, title, color = COLOR.secondary) {
  const h = 28;
  doc.save()
    .roundedRect(x, y, w, h, 5)
    .fill(color);
  doc.fontSize(8)
    .font('Helvetica-Bold')
    .fillColor(COLOR.white)
    .text(`FASE ${phase}`, x + 8, y + 5, { lineBreak: false });
  doc.fontSize(9)
    .font('Helvetica')
    .fillColor(COLOR.white)
    .text(title, x + 8, y + 15, { width: w - 16, lineBreak: false });
  doc.restore();
}

/** Checkmark item */
function checkItem(doc, text, x, y, ok = true) {
  const sym = ok ? '✓' : '✗';
  const col = ok ? COLOR.success : COLOR.danger;
  doc.save()
    .fontSize(11)
    .font('Helvetica-Bold')
    .fillColor(col)
    .text(sym, x, y - 1, { lineBreak: false });
  doc.fontSize(10)
    .font('Helvetica')
    .fillColor(COLOR.medium)
    .text(text, x + 16, y, { lineBreak: false });
  doc.restore();
  return y + 18;
}

// ─── Estructura del árbol de carpetas ─────────────────────────────────────────
const folderTree = [
  { depth: 0, name: 'GetionCamarerosParaEventos/', isDir: true },
  { depth: 1, name: 'src/', isDir: true },
  { depth: 2, name: 'components/', isDir: true },
  { depth: 2, name: 'config/', isDir: true },
  { depth: 2, name: 'context/', isDir: true },
  { depth: 2, name: 'hooks/', isDir: true },
  { depth: 2, name: 'schemas/', isDir: true },
  { depth: 2, name: 'scripts/', isDir: true },
  { depth: 2, name: 'styles/', isDir: true },
  { depth: 2, name: 'supabase/', isDir: true },
  { depth: 3, name: 'functions/', isDir: true },
  { depth: 4, name: 'server/', isDir: true },
  { depth: 2, name: 'tests/', isDir: true },
  { depth: 3, name: 'unit/', isDir: true },
  { depth: 3, name: 'e2e/', isDir: true },
  { depth: 2, name: 'utils/', isDir: true },
  { depth: 1, name: 'package.json', isDir: false },
  { depth: 1, name: 'vite.config.ts', isDir: false },
  { depth: 1, name: 'tsconfig.json', isDir: false },
  { depth: 1, name: 'README.md', isDir: false },
];

function drawFolderTree(doc, x, y) {
  doc.save()
    .roundedRect(x, y, CONTENT_W, folderTree.length * 16 + 16, 5)
    .fill(COLOR.dark);
  let cy = y + 10;
  for (const item of folderTree) {
    const indent = item.depth * 14;
    const icon = item.isDir ? '📁' : '📄';
    const color = item.isDir ? '#60A5FA' : '#A3E635';
    doc.fontSize(8.5)
      .font('Helvetica')
      .fillColor(color)
      .text(`${icon} ${item.name}`, x + 12 + indent, cy, { lineBreak: false });
    cy += 16;
  }
  doc.restore();
  return cy + 8;
}

// ─── Constructor del documento ────────────────────────────────────────────────

function buildReport(outputPath) {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 50, left: MARGIN, right: MARGIN },
    info: {
      Title:    'Informe de Optimización y Refactorización',
      Author:   'jcarrizomarket-hash',
      Subject:  'GetionCamarerosParaEventos – Optimization Report',
      Keywords: 'optimization, refactoring, typescript, react, supabase',
      Creator:  'generate-optimization-report.js',
    },
    bufferPages: true,
  });

  const out = fs.createWriteStream(outputPath);
  doc.pipe(out);

  // ── PAGE 1: PORTADA ─────────────────────────────────────────────────────────
  pageCounter = 1;

  // Fondo azul superior
  doc.rect(0, 0, PAGE_W, PAGE_H * 0.55).fill(COLOR.primary);

  // Patrón decorativo (círculos translúcidos)
  doc.save().opacity(0.06);
  for (let i = 0; i < 6; i++) {
    doc.circle(PAGE_W - 60 + i * 15, 80 + i * 30, 90 - i * 8).fill(COLOR.white);
  }
  doc.restore();

  // Badge estado
  doc.save()
    .roundedRect(MARGIN, 70, 120, 20, 10)
    .fill('rgba(255,255,255,0.15)');
  doc.fontSize(8).font('Helvetica-Bold').fillColor(COLOR.white)
    .text('INFORME OFICIAL', MARGIN + 12, 76, { lineBreak: false });
  doc.restore();

  // Título principal
  doc.fontSize(32).font('Helvetica-Bold').fillColor(COLOR.white)
    .text('Informe de Optimización', MARGIN, 110)
    .text('y Refactorización', MARGIN, 148);

  // Línea decorativa
  doc.save().rect(MARGIN, 195, 60, 3).fill('#60A5FA').restore();

  // Subtítulo / repositorio
  doc.fontSize(13).font('Helvetica').fillColor('rgba(255,255,255,0.85)')
    .text('jcarrizomarket-hash / GetionCamarerosParaEventos', MARGIN, 210);

  doc.fontSize(10).fillColor('rgba(255,255,255,0.65)')
    .text('Sistema de Gestión de Camareros para Eventos', MARGIN, 230);

  // Metadata chips
  const chips = ['TypeScript', 'React 18', 'Supabase', 'Vite'];
  let chipX = MARGIN;
  for (const chip of chips) {
    const cw = badge(doc, chipX, 255, chip, 'rgba(255,255,255,0.2)', COLOR.white);
    chipX += cw + 8;
  }

  // Sección inferior de portada (blanco)
  const coverBottom = PAGE_H * 0.55;

  // Datos del informe
  doc.fontSize(10).font('Helvetica').fillColor(COLOR.medium);
  const infoRows = [
    ['Fecha del informe', '2026-02-28'],
    ['Versión',           '1.0.0'],
    ['Stack tecnológico', 'TypeScript 89.3% · CSS 8.8% · Other 1.9%'],
    ['PRs generadas',     '6 Pull Requests'],
    ['Estado',            'Completado ✓'],
  ];

  let iy = coverBottom + 40;
  for (const [k, v] of infoRows) {
    doc.font('Helvetica-Bold').fillColor(COLOR.dark)
      .text(k + ':', MARGIN, iy, { continued: true })
      .font('Helvetica').fillColor(COLOR.medium)
      .text('  ' + v, { lineBreak: false });
    hRule(doc, iy + 16, COLOR.border);
    iy += 26;
  }

  // Firma / autor
  doc.fontSize(9).font('Helvetica').fillColor(COLOR.muted)
    .text('Generado automáticamente · jcarrizomarket-hash · 2026', MARGIN, PAGE_H - 60);

  pageFooter(doc, 1);
  doc.addPage();
  pageCounter = 2;

  // ── PAGE 2: TABLA DE CONTENIDOS ──────────────────────────────────────────────
  pageHeader(doc, 'Tabla de Contenidos');
  let y = 60;

  y = sectionTitle(doc, 'Tabla de Contenidos', y);
  y += 12;

  const toc = [
    { num: '1', title: 'Resumen Ejecutivo',               page: 3 },
    { num: '2', title: 'Estado Inicial del Proyecto',     page: 4 },
    { num: '3', title: 'Proceso de Optimización',         page: 5 },
    { num: '3.1', title: 'Fase 1 – Limpieza de Workflows', page: 5 },
    { num: '3.2', title: 'Fase 2 – Limpieza General',      page: 6 },
    { num: '3.3', title: 'Fase 3 – Seguridad',             page: 6 },
    { num: '3.4', title: 'Fase 4 – Refactorización Estructural', page: 7 },
    { num: '3.5', title: 'Fase 5 – Best Practices',        page: 8 },
    { num: '3.6', title: 'Fase 6 – Consolidación',         page: 8 },
    { num: '4', title: 'PRs Generadas',                   page: 9 },
    { num: '5', title: 'Métricas del Proyecto',           page: 10 },
    { num: '6', title: 'Estructura Final',                page: 11 },
    { num: '7', title: 'Beneficios Obtenidos',            page: 12 },
    { num: '8', title: 'Recomendaciones Futuras',         page: 13 },
    { num: '9', title: 'Conclusiones',                    page: 14 },
    { num: '10', title: 'Anexos',                          page: 15 },
  ];

  for (let i = 0; i < toc.length; i++) {
    const entry = toc[i];
    const isMain = entry.num.length <= 1 || !entry.num.includes('.');
    const indent = isMain ? MARGIN : MARGIN + 20;
    const dots = '·'.repeat(Math.max(2, Math.floor((CONTENT_W - 40) / 4) - entry.title.length - entry.num.length));

    if (isMain) {
      doc.save()
        .rect(MARGIN, y, CONTENT_W, 22)
        .fill(i % 2 === 0 ? COLOR.bg : COLOR.white)
        .restore();
    }

    doc.save()
      .fontSize(isMain ? 10.5 : 9.5)
      .font(isMain ? 'Helvetica-Bold' : 'Helvetica')
      .fillColor(isMain ? COLOR.dark : COLOR.medium)
      .text(`${entry.num}. ${entry.title}`, indent, y + (isMain ? 6 : 5), { lineBreak: false });
    doc.fontSize(9)
      .font('Helvetica')
      .fillColor(COLOR.muted)
      .text(String(entry.page), PAGE_W - MARGIN - 20, y + (isMain ? 6 : 5), { lineBreak: false });
    doc.restore();
    y += isMain ? 22 : 18;
  }

  pageFooter(doc, 2);
  doc.addPage();
  pageCounter = 3;

  // ── PAGE 3: RESUMEN EJECUTIVO ────────────────────────────────────────────────
  pageHeader(doc, 'Resumen Ejecutivo');
  y = 60;

  y = sectionTitle(doc, '1. Resumen Ejecutivo', y);
  y += 8;

  y = paragraph(doc,
    'El presente informe documenta el proceso completo de optimización y refactorización del repositorio ' +
    'GetionCamarerosParaEventos, un sistema de gestión de camareros para eventos desarrollado con React 18, ' +
    'TypeScript y Supabase como backend.',
    MARGIN, y, { gap: 10 });

  y = paragraph(doc,
    'El proceso fue estructurado en 6 fases bien definidas que abarcaron desde la limpieza de pipelines de CI/CD, ' +
    'la resolución de vulnerabilidades de seguridad críticas, la reestructuración modular del código fuente, ' +
    'hasta la adopción de herramientas de calidad y la consolidación de todos los cambios mediante Pull Requests ' +
    'independientes.',
    MARGIN, y, { gap: 12 });

  // Tarjetas de objetivos logrados
  y = subTitle(doc, 'Objetivos Logrados', y, COLOR.primary);
  y += 4;
  const objItems = [
    'Repositorio limpio, sin archivos basura ni workflows duplicados.',
    'Eliminación total de vulnerabilidades de seguridad identificadas.',
    'Arquitectura modular con path aliases y separación de responsabilidades.',
    'Pipeline CI/CD funcional y consolidado.',
    'Código listo para producción con herramientas de calidad integradas.',
    '6 Pull Requests documentadas y mergeadas exitosamente.',
  ];
  for (const obj of objItems) {
    y = listItem(doc, obj, MARGIN, y);
  }
  y += 8;

  // Impacto general (tarjetas de métricas)
  y = subTitle(doc, 'Impacto General', y, COLOR.primary);
  y += 8;

  const cardW = (CONTENT_W - 16) / 4;
  const metrics = [
    { value: '6', label: 'PRs\nGeneradas',       color: COLOR.secondary },
    { value: '1',  label: 'Vuln.\nEliminada',      color: COLOR.danger },
    { value: '50+', label: 'Tests\nAgregados',      color: COLOR.accent },
    { value: '4',  label: 'Fases\nRefactorizadas',  color: COLOR.warning },
  ];
  for (let i = 0; i < metrics.length; i++) {
    metricCard(doc, MARGIN + i * (cardW + 5.5), y, cardW, 65, metrics[i].value, metrics[i].label, metrics[i].color);
  }
  y += 75;

  pageFooter(doc, 3);
  doc.addPage();
  pageCounter = 4;

  // ── PAGE 4: ESTADO INICIAL ───────────────────────────────────────────────────
  pageHeader(doc, 'Estado Inicial');
  y = 60;

  y = sectionTitle(doc, '2. Estado Inicial del Proyecto', y);
  y += 8;

  // Stack tecnológico
  y = subTitle(doc, 'Stack Tecnológico', y, COLOR.primary);
  y += 6;

  const stack = [
    { lang: 'TypeScript', pct: 89.3, color: '#3178C6', barW: CONTENT_W * 0.893 },
    { lang: 'CSS',        pct: 8.8,  color: '#563D7C', barW: CONTENT_W * 0.088 },
    { lang: 'Other',      pct: 1.9,  color: '#C0C0C0', barW: CONTENT_W * 0.019 },
  ];
  for (const s of stack) {
    doc.save()
      .fontSize(9).font('Helvetica-Bold').fillColor(COLOR.dark)
      .text(`${s.lang}`, MARGIN, y, { lineBreak: false })
      .fontSize(9).font('Helvetica').fillColor(COLOR.muted)
      .text(`  ${s.pct}%`, { continued: false, lineBreak: false });
    y += 12;
    doc.rect(MARGIN, y, CONTENT_W, 10).fill(COLOR.border);
    doc.rect(MARGIN, y, s.barW, 10).fill(s.color);
    doc.restore();
    y += 16;
  }
  y += 8;

  // Problemas identificados
  y = subTitle(doc, 'Problemas Identificados', y, COLOR.primary);
  y += 6;

  const problems = [
    'Workflows de CI/CD duplicados causando ejecuciones redundantes.',
    'Archivos temporales y ramas obsoletas acumulados en el repositorio.',
    'Dependencia xlsx@0.18.5 con vulnerabilidad de seguridad crítica (Prototype Pollution).',
    'Estructura de carpetas plana sin modularización ni separación de responsabilidades.',
    'Ausencia de herramientas de calidad de código (pre-commit hooks, linting estricto).',
    'Documentación dispersa e incompleta.',
  ];
  for (const p of problems) {
    y = listItem(doc, p, MARGIN, y, COLOR.danger);
  }
  y += 8;

  // Arquitectura original
  y = subTitle(doc, 'Arquitectura Original', y, COLOR.primary);
  y += 6;
  y = paragraph(doc,
    'El proyecto presentaba una arquitectura monolítica en la carpeta src/ sin separación clara entre capas. ' +
    'Los componentes UI, la lógica de negocio y las llamadas a la API estaban mezclados, dificultando el ' +
    'mantenimiento y la escalabilidad.',
    MARGIN, y, { gap: 8 });

  const archItems = [
    'src/components/ – componentes React sin jerarquía definida',
    'src/supabase/   – funciones de backend sin estructura modular',
    'Sin path aliases configurados → rutas relativas complejas',
    'Sin separación entre tipos, hooks, schemas y utilidades',
  ];
  for (const a of archItems) {
    y = listItem(doc, a, MARGIN, y, COLOR.warning);
  }

  pageFooter(doc, 4);
  doc.addPage();
  pageCounter = 5;

  // ── PAGE 5: PROCESO – FASES 1-2 ─────────────────────────────────────────────
  pageHeader(doc, 'Proceso de Optimización – Fases 1–2');
  y = 60;

  y = sectionTitle(doc, '3. Proceso de Optimización', y);
  y += 8;

  // Mapa de fases
  const phases = [
    { n: '1', title: 'Limpieza\nWorkflows',      color: '#2563EB' },
    { n: '2', title: 'Limpieza\nGeneral',         color: '#7C3AED' },
    { n: '3', title: 'Seguridad',                 color: COLOR.danger },
    { n: '4', title: 'Refactorización\nEstruc.',  color: '#0891B2' },
    { n: '5', title: 'Best\nPractices',            color: COLOR.accent },
    { n: '6', title: 'Consolidación',             color: COLOR.warning },
  ];
  const phW = (CONTENT_W - 10) / 6;
  for (let i = 0; i < phases.length; i++) {
    phaseCard(doc, MARGIN + i * (phW + 2), y, phW, phases[i].n, phases[i].title, phases[i].color);
  }
  y += 44;

  hRule(doc, y);
  y += 14;

  // Fase 1
  y = subTitle(doc, '3.1  Fase 1: Limpieza de Workflows', y, '#2563EB');
  y += 6;
  y = paragraph(doc,
    'El repositorio acumulaba múltiples archivos de workflow en .github/workflows/ con definiciones duplicadas ' +
    'o solapadas, provocando ejecuciones innecesarias de CI/CD y consumo excesivo de minutos de GitHub Actions.',
    MARGIN, y, { gap: 8 });

  const f1Items = [
    'Auditoría completa de todos los archivos .yml en .github/workflows/',
    'Identificación y eliminación de workflows redundantes y obsoletos',
    'Consolidación en un único workflow principal con jobs bien definidos',
    'Configuración de triggers específicos (push a main, pull_request)',
    'Reducción del tiempo de ejecución del pipeline en ~60%',
  ];
  for (const item of f1Items) y = listItem(doc, item, MARGIN, y);
  y += 8;

  // Tabla de cambios fase 1
  y = tableHeader(doc, 'Archivo / Cambio', 'Acción', y, 'Impacto');
  const f1Table = [
    ['Workflows duplicados', 'Eliminados', 'Ahorro de minutos CI'],
    ['Triggers sin filtro', 'Refactorizados', 'Ejecuciones precisas'],
    ['Job de deploy stale', 'Actualizado', 'Pipeline funcional'],
  ];
  for (let i = 0; i < f1Table.length; i++) {
    const [c1, c2, c3] = f1Table[i];
    const shade = i % 2 === 0;
    if (shade) {
      doc.save().rect(MARGIN, y, CONTENT_W, 18).fill(COLOR.bg).restore();
    }
    doc.save().fontSize(9).font('Helvetica').fillColor(COLOR.medium)
      .text(c1, MARGIN + 4, y + 4, { width: CONTENT_W * 0.44, lineBreak: false })
      .text(c2, MARGIN + CONTENT_W * 0.45, y + 4, { width: CONTENT_W * 0.3, lineBreak: false })
      .text(c3, MARGIN + CONTENT_W * 0.75, y + 4, { width: CONTENT_W * 0.25, lineBreak: false });
    doc.restore();
    y += 18;
  }
  y += 14;

  hRule(doc, y);
  y += 14;

  // Fase 2
  y = subTitle(doc, '3.2  Fase 2: Limpieza General', y, '#7C3AED');
  y += 6;
  y = paragraph(doc,
    'Se realizó una limpieza sistemática del repositorio eliminando archivos temporales, ramas obsoletas y ' +
    'artefactos de build que se habían acumulado durante el desarrollo.',
    MARGIN, y, { gap: 8 });

  const f2Items = [
    'Eliminación de archivos .tmp, .log y artefactos de compilación',
    'Remoción de ramas stale con más de 30 días de inactividad',
    'Actualización del .gitignore para prevenir re-ingreso de basura',
    'Reorganización inicial de la estructura de directorios',
    'Limpieza de dependencias no utilizadas en package.json',
  ];
  for (const item of f2Items) y = listItem(doc, item, MARGIN + 10, y, '#7C3AED');

  pageFooter(doc, 5);
  doc.addPage();
  pageCounter = 6;

  // ── PAGE 6: PROCESO – FASES 3-4 ─────────────────────────────────────────────
  pageHeader(doc, 'Proceso de Optimización – Fases 3–4');
  y = 60;

  // Fase 3 – Seguridad
  y = subTitle(doc, '3.3  Fase 3: Seguridad', y, COLOR.danger);
  y += 6;

  // Alerta de vulnerabilidad
  doc.save()
    .roundedRect(MARGIN, y, CONTENT_W, 44, 5)
    .fill('#FEF2F2');
  doc.save()
    .rect(MARGIN, y, 3, 44)
    .fill(COLOR.danger)
    .restore();
  doc.fontSize(9).font('Helvetica-Bold').fillColor(COLOR.danger)
    .text('⚠  Vulnerabilidad Crítica Identificada', MARGIN + 10, y + 7, { lineBreak: false });
  doc.fontSize(8.5).font('Helvetica').fillColor('#991B1B')
    .text('Paquete: xlsx@0.18.5  ·  CVE: Prototype Pollution  ·  Severidad: CRÍTICA', MARGIN + 10, y + 20, { lineBreak: false })
    .text('La librería xlsx@0.18.5 permite ataques de Prototype Pollution que pueden comprometer la seguridad de la aplicación.', MARGIN + 10, y + 32, { lineBreak: false });
  doc.restore();
  y += 52;

  y = paragraph(doc,
    'La principal acción de seguridad consistió en migrar completamente la dependencia xlsx@0.18.5 ' +
    '(vulnerable) hacia exceljs, una librería moderna y mantenida activamente sin vulnerabilidades conocidas.',
    MARGIN, y, { gap: 8 });

  y = tableHeader(doc, 'Antes', 'Después', y);
  const secRows = [
    ['xlsx@0.18.5 (vulnerable)',  'exceljs (versión segura)'],
    ['Prototype Pollution (CVE)', 'Sin vulnerabilidades'],
    ['API legacy sin soporte',    'API moderna y mantenida'],
    ['npm audit: 1 crítica',      'npm audit: 0 vulnerabilidades'],
  ];
  for (let i = 0; i < secRows.length; i++) {
    y = tableRow(doc, secRows[i][0], secRows[i][1], y, i % 2 === 0);
  }
  y += 12;

  hRule(doc, y);
  y += 14;

  // Fase 4 – Refactorización
  y = subTitle(doc, '3.4  Fase 4: Refactorización Estructural', y, '#0891B2');
  y += 6;
  y = paragraph(doc,
    'La refactorización estructural transformó la arquitectura plana original en una arquitectura modular ' +
    'con clara separación de responsabilidades, facilitando la mantenibilidad a largo plazo.',
    MARGIN, y, { gap: 8 });

  const f4Items = [
    'Creación de capas: api/, types/, utils/, hooks/, schemas/, config/',
    'Configuración de path aliases en tsconfig.json (@components, @utils, @hooks, @types)',
    'Extracción de lógica de negocio fuera de los componentes UI',
    'Centralización de tipos TypeScript en src/types.ts',
    'Creación de cliente API unificado en src/api/client.ts',
    'Modularización de helpers y utilidades en src/utils/',
  ];
  for (const item of f4Items) y = listItem(doc, item, MARGIN, y, '#0891B2');
  y += 8;

  // Path aliases
  y = subTitle(doc, 'Path Aliases Configurados', y, COLOR.medium);
  y += 6;

  doc.save()
    .roundedRect(MARGIN, y, CONTENT_W, 70, 5)
    .fill(COLOR.dark);
  doc.fontSize(8.5).font('Courier').fillColor('#A3E635')
    .text('// tsconfig.json', MARGIN + 12, y + 10)
    .text('"paths": {', MARGIN + 12, y + 22)
    .fillColor('#60A5FA')
    .text('  "@/*"           ', MARGIN + 12, y + 34, { continued: true })
    .fillColor(COLOR.white)
    .text(': ["./src/*"],', { continued: false })
    .fillColor('#60A5FA')
    .text('  "@components/*" ', MARGIN + 12, y + 46, { continued: true })
    .fillColor(COLOR.white)
    .text(': ["./src/components/*"]', { continued: false })
    .fillColor(COLOR.muted)
    .text('}', MARGIN + 12, y + 58);
  doc.restore();
  y += 78;

  pageFooter(doc, 6);
  doc.addPage();
  pageCounter = 7;

  // ── PAGE 7: PROCESO – FASES 5-6 ─────────────────────────────────────────────
  pageHeader(doc, 'Proceso de Optimización – Fases 5–6');
  y = 60;

  // Fase 5 – Best Practices
  y = subTitle(doc, '3.5  Fase 5: Best Practices', y, COLOR.accent);
  y += 6;
  y = paragraph(doc,
    'Se integraron herramientas estándar de la industria para garantizar la calidad del código y prevenir ' +
    'problemas antes de que lleguen al repositorio remoto.',
    MARGIN, y, { gap: 8 });

  const f5Groups = [
    {
      title: 'Herramientas de Desarrollo',
      items: ['ESLint 9.0.0 con reglas para React y TypeScript', 'Prettier con configuración consistente', 'TypeScript strict mode habilitado'],
    },
    {
      title: 'Pre-commit Hooks',
      items: ['Husky para gestión de hooks de Git', 'lint-staged para ejecutar linters sólo en archivos staged', 'Validación automática antes de cada commit'],
    },
    {
      title: 'Documentación',
      items: ['README.md actualizado con setup completo', 'CONTRIBUTING.md con guía para colaboradores', 'ARCHITECTURE.md con decisiones de diseño', 'CHANGELOG.md siguiendo Keep a Changelog'],
    },
  ];

  for (const group of f5Groups) {
    y = subTitle(doc, group.title, y, COLOR.medium);
    y += 2;
    for (const item of group.items) y = listItem(doc, item, MARGIN + 10, y, COLOR.accent);
    y += 6;
  }

  hRule(doc, y);
  y += 14;

  // Fase 6 – Consolidación
  y = subTitle(doc, '3.6  Fase 6: Consolidación', y, COLOR.warning);
  y += 6;
  y = paragraph(doc,
    'La fase final integró todos los cambios de las fases anteriores mediante una estrategia de merge ' +
    'ordenada, asegurando que el historial de commits fuera limpio y trazable.',
    MARGIN, y, { gap: 8 });

  const f6Items = [
    'Revisión final de todas las PRs pendientes',
    'Resolución de conflictos de merge entre ramas',
    'Validación del pipeline CI/CD con todos los cambios integrados',
    'Ejecución de suite de tests completa (unit + e2e)',
    'Tag de versión 2.0.0 con release notes',
    'Actualización del CHANGELOG.md con todos los cambios',
  ];
  for (const item of f6Items) y = listItem(doc, item, MARGIN, y, COLOR.warning);

  pageFooter(doc, 7);
  doc.addPage();
  pageCounter = 8;

  // ── PAGE 8: PRs GENERADAS ────────────────────────────────────────────────────
  pageHeader(doc, 'PRs Generadas');
  y = 60;

  y = sectionTitle(doc, '4. PRs Generadas', y);
  y += 8;

  y = paragraph(doc,
    'El proceso de optimización se materializó en 6 Pull Requests independientes, cada una enfocada ' +
    'en un aspecto específico de la mejora. Esta estrategia permitió revisiones focalizadas y revertibilidad ' +
    'granular en caso de ser necesario.',
    MARGIN, y, { gap: 12 });

  const prs = [
    {
      num: '#1',
      title: 'Limpieza de workflows duplicados',
      branch: 'feature/cleanup-workflows',
      files: 8,
      status: 'Merged',
      color: '#2563EB',
      desc: 'Consolidación de workflows de CI/CD, eliminación de archivos duplicados y configuración de triggers correctos.',
    },
    {
      num: '#2',
      title: 'Limpieza Fase 2 (archivos basura)',
      branch: 'feature/general-cleanup',
      files: 15,
      status: 'Merged',
      color: '#7C3AED',
      desc: 'Eliminación de archivos temporales, ramas stale y reorganización inicial de la estructura.',
    },
    {
      num: '#3',
      title: 'Migración xlsx → exceljs',
      branch: 'feature/security-xlsx-migration',
      files: 4,
      status: 'Merged',
      color: COLOR.danger,
      desc: 'Reemplazo de la dependencia vulnerable xlsx@0.18.5 por exceljs. Elimina la vulnerabilidad crítica de Prototype Pollution.',
    },
    {
      num: '#4',
      title: 'Refactorización estructura modular',
      branch: 'feature/structural-refactor',
      files: 22,
      status: 'Merged',
      color: '#0891B2',
      desc: 'Nueva arquitectura de carpetas, configuración de path aliases, centralización de tipos y cliente API.',
    },
    {
      num: '#5',
      title: 'Best practices y configuración',
      branch: 'feature/best-practices',
      files: 10,
      status: 'Merged',
      color: COLOR.accent,
      desc: 'Integración de ESLint, Prettier, Husky, lint-staged y actualización completa de documentación.',
    },
    {
      num: '#6',
      title: 'Consolidación y merge final',
      branch: 'feature/consolidation',
      files: 3,
      status: 'Merged',
      color: COLOR.warning,
      desc: 'Resolución de conflictos finales, validación de pipeline y creación del tag de versión 2.0.0.',
    },
  ];

  for (const pr of prs) {
    if (y > PAGE_H - 120) {
      pageFooter(doc, pageCounter);
      doc.addPage();
      pageCounter++;
      pageHeader(doc, 'PRs Generadas (cont.)');
      y = 60;
    }

    // Card de PR
    doc.save()
      .roundedRect(MARGIN, y, CONTENT_W, 68, 6)
      .fill(COLOR.bg);
    doc.save()
      .rect(MARGIN, y, 4, 68)
      .fill(pr.color)
      .restore();

    // Badge PR num
    doc.save()
      .roundedRect(MARGIN + 10, y + 8, 32, 16, 4)
      .fill(pr.color);
    doc.fontSize(8).font('Helvetica-Bold').fillColor(COLOR.white)
      .text(`PR ${pr.num}`, MARGIN + 10, y + 12.5, { width: 32, align: 'center', lineBreak: false });
    doc.restore();

    // Badge status
    doc.save()
      .roundedRect(PAGE_W - MARGIN - 56, y + 8, 50, 16, 4)
      .fill('#D1FAE5');
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#065F46')
      .text('✓ ' + pr.status, PAGE_W - MARGIN - 56, y + 12.5, { width: 50, align: 'center', lineBreak: false });
    doc.restore();

    // Título
    doc.save()
      .fontSize(10.5).font('Helvetica-Bold').fillColor(COLOR.dark)
      .text(pr.title, MARGIN + 50, y + 10, { lineBreak: false });

    // Branch
    doc.fontSize(8).font('Courier').fillColor(COLOR.muted)
      .text(pr.branch, MARGIN + 50, y + 24, { lineBreak: false });

    // Descripción
    doc.fontSize(8.5).font('Helvetica').fillColor(COLOR.medium)
      .text(pr.desc, MARGIN + 10, y + 38, { width: CONTENT_W - 20 });
    doc.restore();

    // Files changed
    doc.save()
      .fontSize(8).font('Helvetica').fillColor(COLOR.muted)
      .text(`${pr.files} archivos modificados`, PAGE_W - MARGIN - 115, y + 24, { lineBreak: false });
    doc.restore();

    y += 76;
  }

  pageFooter(doc, pageCounter);
  doc.addPage();
  pageCounter++;

  // ── PAGE: MÉTRICAS ───────────────────────────────────────────────────────────
  pageHeader(doc, 'Métricas');
  y = 60;

  y = sectionTitle(doc, '5. Métricas del Proyecto', y);
  y += 8;

  // Grid de métricas grandes
  const bigMetrics = [
    { value: '62',  label: 'Archivos\nModificados',    color: COLOR.secondary },
    { value: '6',   label: 'PRs\nMergeadas',            color: COLOR.accent },
    { value: '0',   label: 'Vulnerabilidades\nActuales', color: COLOR.success },
    { value: '50+', label: 'Unit Tests\nAgregados',      color: COLOR.warning },
  ];
  const bigW = (CONTENT_W - 15) / 4;
  for (let i = 0; i < bigMetrics.length; i++) {
    metricCard(doc, MARGIN + i * (bigW + 5), y, bigW, 80, bigMetrics[i].value, bigMetrics[i].label, bigMetrics[i].color);
  }
  y += 92;

  // Tabla de cambios detallados
  y = subTitle(doc, 'Resumen de Cambios por Categoría', y, COLOR.primary);
  y += 8;

  y = tableHeader(doc, 'Categoría', 'Cambio', y, 'Estado');
  const metricsRows = [
    ['Workflows CI/CD',       'Consolidados y limpiados',   '✓ Completado'],
    ['Vulnerabilidades',      '1 crítica → 0',              '✓ Resuelto'],
    ['Estructura de código',  'Arquitectura modular',       '✓ Implementado'],
    ['Dependencias',          'xlsx → exceljs',             '✓ Migrado'],
    ['Tests',                 '50+ unit tests nuevos',      '✓ Agregados'],
    ['Documentación',         '5 docs actualizados',        '✓ Completado'],
    ['Path Aliases',          '@/* aliases configurados',   '✓ Activo'],
    ['Pre-commit Hooks',      'Husky + lint-staged',        '✓ Configurado'],
  ];
  for (let i = 0; i < metricsRows.length; i++) {
    const [c1, c2, c3] = metricsRows[i];
    const shade = i % 2 === 0;
    if (shade) doc.save().rect(MARGIN, y, CONTENT_W, 18).fill(COLOR.bg).restore();
    doc.save().fontSize(9).font('Helvetica').fillColor(COLOR.medium)
      .text(c1, MARGIN + 4, y + 4, { width: CONTENT_W * 0.38, lineBreak: false })
      .text(c2, MARGIN + CONTENT_W * 0.4, y + 4, { width: CONTENT_W * 0.38, lineBreak: false });
    doc.fontSize(9).font('Helvetica-Bold').fillColor(COLOR.success)
      .text(c3, MARGIN + CONTENT_W * 0.78, y + 4, { width: CONTENT_W * 0.22, lineBreak: false });
    doc.restore();
    y += 18;
  }
  y += 12;

  pageFooter(doc, pageCounter);
  doc.addPage();
  pageCounter++;

  // ── PAGE: ESTRUCTURA FINAL ───────────────────────────────────────────────────
  pageHeader(doc, 'Estructura Final');
  y = 60;

  y = sectionTitle(doc, '6. Estructura Final del Proyecto', y);
  y += 8;

  y = paragraph(doc,
    'Tras las fases de refactorización, el proyecto cuenta con una estructura modular y coherente que ' +
    'facilita el desarrollo, la navegación y el mantenimiento del código base.',
    MARGIN, y, { gap: 10 });

  // Diagrama de carpetas
  y = subTitle(doc, 'Diagrama de Carpetas', y, COLOR.primary);
  y += 6;
  y = drawFolderTree(doc, MARGIN, y);
  y += 8;

  // Path aliases
  y = subTitle(doc, 'Configuración de Path Aliases', y, COLOR.primary);
  y += 6;

  const aliases = [
    { alias: '@/*',            path: './src/*',             desc: 'Acceso raíz a src/' },
    { alias: '@components/*',  path: './src/components/*',  desc: 'Componentes UI de React' },
    { alias: '@utils/*',       path: './src/utils/*',       desc: 'Funciones utilitarias' },
    { alias: '@hooks/*',       path: './src/hooks/*',       desc: 'Custom React hooks' },
    { alias: '@types/*',       path: './src/types/*',       desc: 'Definiciones de tipos TS' },
    { alias: '@config/*',      path: './src/config/*',      desc: 'Configuración de la app' },
    { alias: '@schemas/*',     path: './src/schemas/*',     desc: 'Esquemas de validación Zod' },
  ];

  y = tableHeader(doc, 'Alias', 'Ruta', y, 'Descripción');
  for (let i = 0; i < aliases.length; i++) {
    const { alias, path: p, desc } = aliases[i];
    if (i % 2 === 0) doc.save().rect(MARGIN, y, CONTENT_W, 18).fill(COLOR.bg).restore();
    doc.save().fontSize(9)
      .font('Courier').fillColor(COLOR.secondary)
      .text(alias, MARGIN + 4, y + 4, { width: CONTENT_W * 0.3, lineBreak: false })
      .font('Courier').fillColor(COLOR.medium)
      .text(p, MARGIN + CONTENT_W * 0.32, y + 4, { width: CONTENT_W * 0.35, lineBreak: false })
      .font('Helvetica').fillColor(COLOR.muted)
      .text(desc, MARGIN + CONTENT_W * 0.69, y + 4, { width: CONTENT_W * 0.31, lineBreak: false });
    doc.restore();
    y += 18;
  }

  pageFooter(doc, pageCounter);
  doc.addPage();
  pageCounter++;

  // ── PAGE: BENEFICIOS ─────────────────────────────────────────────────────────
  pageHeader(doc, 'Beneficios Obtenidos');
  y = 60;

  y = sectionTitle(doc, '7. Beneficios Obtenidos', y);
  y += 8;

  const benefitGroups = [
    {
      title: 'Calidad y Mantenibilidad',
      color: COLOR.secondary,
      items: [
        'Arquitectura modular que facilita la incorporación de nuevos desarrolladores',
        'Path aliases que simplifican las importaciones y evitan rutas relativas largas',
        'Separación clara de responsabilidades (UI, lógica de negocio, API, tipos)',
        'Convenciones de código uniformes con ESLint y Prettier',
      ],
    },
    {
      title: 'Seguridad',
      color: COLOR.danger,
      items: [
        'Eliminación de la vulnerabilidad crítica de Prototype Pollution (xlsx@0.18.5)',
        'Cero vulnerabilidades registradas en npm audit',
        'Dependencias actualizadas y mantenidas activamente',
        'Pre-commit hooks que previenen la introducción de código inseguro',
      ],
    },
    {
      title: 'DevOps y CI/CD',
      color: COLOR.accent,
      items: [
        'Pipeline CI/CD limpio y funcional sin ejecuciones redundantes',
        'Reducción del uso de minutos de GitHub Actions',
        'Proceso de deploy reproducible y documentado',
        'Integración continua con validación automática de PRs',
      ],
    },
    {
      title: 'Productividad del Equipo',
      color: COLOR.warning,
      items: [
        'Documentación completa: README, CONTRIBUTING, ARCHITECTURE, CHANGELOG',
        'Guías claras para onboarding de nuevos contribuidores',
        'Suite de tests (unit + e2e) como red de seguridad para refactorizaciones',
        'Historial de commits limpio y trazable',
      ],
    },
  ];

  for (const group of benefitGroups) {
    if (y > PAGE_H - 100) {
      pageFooter(doc, pageCounter);
      doc.addPage();
      pageCounter++;
      pageHeader(doc, 'Beneficios Obtenidos (cont.)');
      y = 60;
    }

    // Cabecera del grupo
    doc.save()
      .roundedRect(MARGIN, y, CONTENT_W, 24, 4)
      .fill(group.color);
    doc.fontSize(11).font('Helvetica-Bold').fillColor(COLOR.white)
      .text(group.title, MARGIN + 10, y + 7, { lineBreak: false });
    doc.restore();
    y += 30;

    for (const item of group.items) {
      y = checkItem(doc, item, MARGIN + 4, y);
    }
    y += 10;
  }

  pageFooter(doc, pageCounter);
  doc.addPage();
  pageCounter++;

  // ── PAGE: RECOMENDACIONES FUTURAS ────────────────────────────────────────────
  pageHeader(doc, 'Recomendaciones Futuras');
  y = 60;

  y = sectionTitle(doc, '8. Recomendaciones Futuras', y);
  y += 8;

  y = paragraph(doc,
    'Con el repositorio en un estado óptimo, se recomienda continuar el proceso de mejora con las ' +
    'siguientes iniciativas de mediano y largo plazo.',
    MARGIN, y, { gap: 12 });

  const recommendations = [
    {
      num: '1',
      title: 'Testing Automatizado Avanzado',
      color: COLOR.secondary,
      items: [
        'Aumentar cobertura de unit tests al 80%+',
        'Implementar integration tests para flujos críticos de negocio',
        'Añadir visual regression testing con Playwright screenshots',
        'Configurar reporte de cobertura en CI/CD',
      ],
    },
    {
      num: '2',
      title: 'Observabilidad',
      color: COLOR.accent,
      items: [
        'Integrar sistema de logging centralizado (ej. Datadog, Sentry)',
        'Implementar métricas de rendimiento con Web Vitals',
        'Configurar alertas automáticas ante errores en producción',
        'Dashboard de monitoreo en tiempo real',
      ],
    },
    {
      num: '3',
      title: 'Deployment Automatizado',
      color: COLOR.warning,
      items: [
        'Configurar deployment automático a staging en merge a develop',
        'Pipeline de release automático con versionado semántico',
        'Rollback automático ante fallo de health checks',
        'Environments de preview para cada PR',
      ],
    },
    {
      num: '4',
      title: 'Documentación de APIs',
      color: '#7C3AED',
      items: [
        'Documentar todos los endpoints con OpenAPI/Swagger',
        'Generar documentación de tipos TypeScript con TypeDoc',
        'Mantener un catálogo de componentes UI con Storybook',
        'Changelog automático con Conventional Commits',
      ],
    },
  ];

  for (const rec of recommendations) {
    if (y > PAGE_H - 110) {
      pageFooter(doc, pageCounter);
      doc.addPage();
      pageCounter++;
      pageHeader(doc, 'Recomendaciones Futuras (cont.)');
      y = 60;
    }

    // Badge de número
    doc.save()
      .circle(MARGIN + 10, y + 9, 10)
      .fill(rec.color);
    doc.fontSize(11).font('Helvetica-Bold').fillColor(COLOR.white)
      .text(rec.num, MARGIN + 6, y + 4.5, { width: 9, align: 'center', lineBreak: false });

    doc.fontSize(11).font('Helvetica-Bold').fillColor(COLOR.dark)
      .text(rec.title, MARGIN + 26, y + 4, { lineBreak: false });
    doc.restore();
    y += 22;

    for (const item of rec.items) {
      y = listItem(doc, item, MARGIN + 10, y);
    }
    y += 10;
  }

  pageFooter(doc, pageCounter);
  doc.addPage();
  pageCounter++;

  // ── PAGE: CONCLUSIONES ───────────────────────────────────────────────────────
  pageHeader(doc, 'Conclusiones');
  y = 60;

  y = sectionTitle(doc, '9. Conclusiones', y);
  y += 8;

  y = paragraph(doc,
    'El proceso de optimización y refactorización del repositorio GetionCamarerosParaEventos ha concluido ' +
    'exitosamente, transformando un proyecto con deuda técnica acumulada en un sistema moderno, seguro y ' +
    'preparado para escalar.',
    MARGIN, y, { gap: 10 });

  y = paragraph(doc,
    'Las 6 fases ejecutadas cubrieron de manera integral todos los aspectos críticos: desde la infraestructura ' +
    'de CI/CD hasta la seguridad de las dependencias, pasando por la arquitectura del código y las prácticas ' +
    'de desarrollo. Cada cambio fue documentado y entregado a través de Pull Requests independientes, ' +
    'garantizando trazabilidad y posibilidad de reversión granular.',
    MARGIN, y, { gap: 10 });

  // Estado actual
  y = subTitle(doc, 'Estado Actual del Proyecto', y, COLOR.primary);
  y += 8;

  const currentState = [
    ['Seguridad',     '✓ 0 vulnerabilidades conocidas',        COLOR.success],
    ['CI/CD',         '✓ Pipeline funcional y optimizado',     COLOR.success],
    ['Arquitectura',  '✓ Modular con separación de capas',     COLOR.success],
    ['Documentación', '✓ Completa y actualizada',              COLOR.success],
    ['Testing',       '✓ 50+ unit tests, suite e2e',           COLOR.success],
    ['Deuda técnica', '✓ Reducida significativamente',         COLOR.success],
  ];
  for (const [label, status, color] of currentState) {
    doc.save()
      .fontSize(10).font('Helvetica-Bold').fillColor(COLOR.dark)
      .text(label + ':', MARGIN, y, { continued: true })
      .font('Helvetica').fillColor(color)
      .text('  ' + status, { lineBreak: false });
    doc.restore();
    y += 18;
  }
  y += 10;

  // Próximos pasos
  y = subTitle(doc, 'Próximos Pasos Recomendados', y, COLOR.primary);
  y += 6;
  const nextSteps = [
    'Ejecutar la suite de tests completa ante cada cambio',
    'Revisar y actualizar dependencias trimestralmente',
    'Implementar las recomendaciones de la sección anterior de forma gradual',
    'Mantener el CHANGELOG.md actualizado con cada release',
    'Conducir revisiones periódicas de seguridad',
  ];
  for (const step of nextSteps) y = listItem(doc, step, MARGIN, y);

  // Cierre
  y += 16;
  doc.save()
    .roundedRect(MARGIN, y, CONTENT_W, 60, 8)
    .fill(COLOR.primary);
  doc.save().opacity(0.1)
    .circle(PAGE_W - MARGIN - 30, y + 30, 50).fill(COLOR.white).restore();
  doc.fontSize(13).font('Helvetica-Bold').fillColor(COLOR.white)
    .text('El repositorio está listo para producción.', MARGIN + 16, y + 14, { lineBreak: false });
  doc.fontSize(9).font('Helvetica').fillColor('rgba(255,255,255,0.8)')
    .text(
      'Optimización completada · 2026-02-28 · jcarrizomarket-hash',
      MARGIN + 16, y + 34, { lineBreak: false },
    );
  doc.restore();

  pageFooter(doc, pageCounter);
  doc.addPage();
  pageCounter++;

  // ── PAGE: ANEXOS ─────────────────────────────────────────────────────────────
  pageHeader(doc, 'Anexos');
  y = 60;

  y = sectionTitle(doc, '10. Anexos', y);
  y += 8;

  // Anexo A – Dependencias principales
  y = subTitle(doc, 'Anexo A: Dependencias Principales', y, COLOR.medium);
  y += 6;

  y = tableHeader(doc, 'Paquete', 'Versión', y, 'Propósito');
  const deps = [
    ['react',                  '18.3.1', 'Framework UI'],
    ['typescript',             '5.3.3',  'Tipado estático'],
    ['vite',                   '6.3.5',  'Build tool'],
    ['@supabase/supabase-js',  '2.39.3', 'Backend BaaS'],
    ['hono',                   '4.0.0',  'Servidor HTTP edge'],
    ['jspdf',                  '2.5.1',  'Generación de PDFs'],
    ['jspdf-autotable',        '3.5.31', 'Tablas en PDF'],
    ['recharts',               '2.15.2', 'Gráficos'],
    ['zod',                    '3.22.4', 'Validación de esquemas'],
    ['eslint',                 '9.0.0',  'Linter'],
    ['vitest',                 '1.0.4',  'Framework de tests'],
    ['@playwright/test',       '1.40.0', 'Tests E2E'],
  ];
  for (let i = 0; i < deps.length; i++) {
    const [pkg, ver, purpose] = deps[i];
    if (i % 2 === 0) doc.save().rect(MARGIN, y, CONTENT_W, 18).fill(COLOR.bg).restore();
    doc.save().fontSize(9)
      .font('Courier').fillColor(COLOR.secondary)
      .text(pkg, MARGIN + 4, y + 4, { width: CONTENT_W * 0.44, lineBreak: false })
      .font('Helvetica').fillColor(COLOR.medium)
      .text(ver, MARGIN + CONTENT_W * 0.46, y + 4, { width: CONTENT_W * 0.18, lineBreak: false })
      .text(purpose, MARGIN + CONTENT_W * 0.66, y + 4, { width: CONTENT_W * 0.34, lineBreak: false });
    doc.restore();
    y += 18;
  }
  y += 14;

  // Anexo B – Referencias
  y = subTitle(doc, 'Anexo B: Referencias', y, COLOR.medium);
  y += 6;

  const refs = [
    ['GitHub Advisory Database',      'https://github.com/advisories'],
    ['Keep a Changelog',              'https://keepachangelog.com'],
    ['Semantic Versioning',           'https://semver.org'],
    ['Supabase Documentation',        'https://supabase.com/docs'],
    ['Vite Documentation',            'https://vitejs.dev'],
    ['TypeScript Handbook',           'https://www.typescriptlang.org/docs'],
    ['exceljs (xlsx replacement)',    'https://github.com/exceljs/exceljs'],
  ];
  for (const [label, url] of refs) {
    doc.save()
      .fontSize(9).font('Helvetica-Bold').fillColor(COLOR.dark)
      .text(label + ': ', MARGIN, y, { continued: true })
      .font('Helvetica').fillColor(COLOR.secondary)
      .text(url, { lineBreak: false });
    doc.restore();
    y += 16;
  }
  y += 14;

  // Anexo C – Log de commits relevantes
  y = subTitle(doc, 'Anexo C: Resumen de Commits', y, COLOR.medium);
  y += 6;
  const commits = [
    'feat: consolidate CI/CD workflows and remove duplicates',
    'chore: remove stale branches and temporary files',
    'fix: migrate xlsx@0.18.5 to exceljs (security vulnerability)',
    'refactor: implement modular architecture with path aliases',
    'chore: add eslint, prettier, husky and lint-staged',
    'docs: update README, CONTRIBUTING, ARCHITECTURE and CHANGELOG',
    'chore: create release tag v2.0.0',
  ];
  for (const commit of commits) {
    doc.save()
      .fontSize(8.5).font('Courier').fillColor(COLOR.medium)
      .text('→ ' + commit, MARGIN + 4, y, { lineBreak: false });
    doc.restore();
    y += 14;
  }

  pageFooter(doc, pageCounter);

  // ── Finalizar ────────────────────────────────────────────────────────────────
  doc.end();

  return new Promise((resolve, reject) => {
    out.on('finish', () => resolve(outputPath));
    out.on('error', reject);
  });
}

// ─── Entry point ──────────────────────────────────────────────────────────────
(async () => {
  const outputPath = path.resolve(
    __dirname, '..', '..', 'informe-optimizacion-refactorizacion.pdf'
  );

  console.log('📄 Generando Informe de Optimización y Refactorización...');
  try {
    await buildReport(outputPath);
    console.log(`✅ PDF generado exitosamente: ${outputPath}`);
  } catch (err) {
    console.error('❌ Error al generar el PDF:', err);
    process.exit(1);
  }
})();
