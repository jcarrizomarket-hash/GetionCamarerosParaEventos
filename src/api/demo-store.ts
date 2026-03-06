/**
 * demo-store.ts — Store en memoria para modo demo (VITE_DEMO_MODE=true)
 *
 * Simula el backend completo con datos realistas de una empresa de catering española.
 * Todos los cambios (crear, editar, eliminar) persisten durante la sesión pero
 * se resetean al recargar la página.
 */

import type { Camarero, Pedido, Coordinador, Cliente } from '../types';

// ─── Datos iniciales ──────────────────────────────────────────────────────────

const HOY = new Date();
const fecha = (offsetDias: number): string => {
  const d = new Date(HOY);
  d.setDate(d.getDate() + offsetDias);
  return d.toISOString().split('T')[0];
};

const CLIENTES_INICIALES: Cliente[] = [
  { id: 'cliente:1', nombre: 'Finca La Rioja Eventos', email: 'eventos@fincalarioja.es', telefono: '+34 941 200 100', notas: 'Cliente premium. Pago a 30 días.' },
  { id: 'cliente:2', nombre: 'Grupo Restauración Mediterráneo', email: 'catering@grmediterraneo.com', telefono: '+34 93 450 2200', notas: 'Requiere uniforme blanco siempre.' },
  { id: 'cliente:3', nombre: 'Palacio de Congresos Valencia', email: 'operaciones@pcongresos.es', telefono: '+34 96 370 0000' },
  { id: 'cliente:4', nombre: 'Bodegas Torres Catering', email: 'eventos@bodegas-torres.com', telefono: '+34 93 817 7400' },
  { id: 'cliente:5', nombre: 'Hotel Ritz Madrid', email: 'banquetes@ritz-madrid.com', telefono: '+34 91 701 6767', notas: 'Protocolo estricto. Briefing obligatorio.' },
];

const COORDINADORES_INICIALES: Coordinador[] = [
  { id: 'coordinador:1', nombre: 'María González', telefono: '+34 612 345 678', email: 'maria.gonzalez@empresa.es', activo: true },
  { id: 'coordinador:2', nombre: 'Carlos Martínez', telefono: '+34 623 456 789', email: 'carlos.martinez@empresa.es', activo: true },
  { id: 'coordinador:3', nombre: 'Ana Rodríguez', telefono: '+34 634 567 890', email: 'ana.rodriguez@empresa.es', activo: true },
];

const CAMAREROS_INICIALES: Camarero[] = [
  { id: 'camarero:1',  numero: 1,  nombre: 'Javier López',     telefono: '+34 611 111 001', email: 'javier.lopez@gmail.com',     activo: true },
  { id: 'camarero:2',  numero: 2,  nombre: 'Laura Sánchez',    telefono: '+34 611 111 002', email: 'laura.sanchez@gmail.com',    activo: true },
  { id: 'camarero:3',  numero: 3,  nombre: 'Miguel Torres',    telefono: '+34 611 111 003', email: 'miguel.torres@gmail.com',    activo: true },
  { id: 'camarero:4',  numero: 4,  nombre: 'Carmen Díaz',      telefono: '+34 611 111 004', email: 'carmen.diaz@gmail.com',      activo: true },
  { id: 'camarero:5',  numero: 5,  nombre: 'Pablo Fernández',  telefono: '+34 611 111 005', email: 'pablo.fernandez@gmail.com',  activo: true },
  { id: 'camarero:6',  numero: 6,  nombre: 'Isabel Moreno',    telefono: '+34 611 111 006', email: 'isabel.moreno@gmail.com',    activo: true },
  { id: 'camarero:7',  numero: 7,  nombre: 'Andrés Jiménez',   telefono: '+34 611 111 007', email: 'andres.jimenez@gmail.com',   activo: true },
  { id: 'camarero:8',  numero: 8,  nombre: 'Sofía Ruiz',       telefono: '+34 611 111 008', email: 'sofia.ruiz@gmail.com',       activo: true },
  { id: 'camarero:9',  numero: 9,  nombre: 'David García',     telefono: '+34 611 111 009', email: 'david.garcia@gmail.com',     activo: false, notas: 'Baja temporal hasta marzo' },
  { id: 'camarero:10', numero: 10, nombre: 'Elena Martínez',   telefono: '+34 611 111 010', email: 'elena.martinez@gmail.com',   activo: true },
  { id: 'camarero:11', numero: 11, nombre: 'Roberto Alonso',   telefono: '+34 611 111 011', email: 'roberto.alonso@gmail.com',   activo: true },
  { id: 'camarero:12', numero: 12, nombre: 'Natalia Vega',     telefono: '+34 611 111 012', email: 'natalia.vega@gmail.com',     activo: true },
];

const PEDIDOS_INICIALES: Pedido[] = [
  {
    id: 'pedido:1',
    numero: 'EV-001',
    cliente: 'Hotel Ritz Madrid',
    lugar: 'Hotel Ritz Madrid - Salón Real',
    ubicacion: 'https://maps.google.com/?q=Hotel+Ritz+Madrid',
    diaEvento: fecha(2),
    cantidadCamareros: 6,
    horaEntrada: '18:00',
    horaSalida: '02:00',
    totalHoras: '8h',
    cantidadCamareros2: 0,
    catering: 'si',
    camisa: 'blanca',
    notas: 'Gala anual de empresa. Protocolo estricto.',
    coordinadorId: 'coordinador:1',
    coordinadorNombre: 'María González',
    asignaciones: [
      { camareroId: 'camarero:1', camareroNumero: 1, camareroNombre: 'Javier López',    estado: 'confirmado' },
      { camareroId: 'camarero:2', camareroNumero: 2, camareroNombre: 'Laura Sánchez',   estado: 'confirmado' },
      { camareroId: 'camarero:3', camareroNumero: 3, camareroNombre: 'Miguel Torres',   estado: 'enviado' },
      { camareroId: 'camarero:4', camareroNumero: 4, camareroNombre: 'Carmen Díaz',     estado: 'enviado' },
      { camareroId: 'camarero:5', camareroNumero: 5, camareroNombre: 'Pablo Fernández', estado: 'pendiente' },
      { camareroId: 'camarero:6', camareroNumero: 6, camareroNombre: 'Isabel Moreno',   estado: 'pendiente' },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pedido:2',
    numero: 'EV-002',
    cliente: 'Finca La Rioja Eventos',
    lugar: 'Finca La Rioja - Jardín Principal',
    ubicacion: 'https://maps.google.com/?q=Finca+La+Rioja+Logroño',
    diaEvento: fecha(5),
    cantidadCamareros: 4,
    horaEntrada: '12:00',
    horaSalida: '18:00',
    totalHoras: '6h',
    cantidadCamareros2: 2,
    horaEntrada2: '19:00',
    horaSalida2: '23:00',
    totalHoras2: '4h',
    catering: 'no',
    camisa: 'negra',
    notas: 'Boda civil. Primer turno almuerzo, segundo turno cóctel.',
    coordinadorId: 'coordinador:2',
    coordinadorNombre: 'Carlos Martínez',
    asignaciones: [
      { camareroId: 'camarero:7',  camareroNumero: 7,  camareroNombre: 'Andrés Jiménez', estado: 'confirmado', turno: 1 },
      { camareroId: 'camarero:8',  camareroNumero: 8,  camareroNombre: 'Sofía Ruiz',      estado: 'confirmado', turno: 1 },
      { camareroId: 'camarero:10', camareroNumero: 10, camareroNombre: 'Elena Martínez',  estado: 'enviado',    turno: 1 },
      { camareroId: 'camarero:11', camareroNumero: 11, camareroNombre: 'Roberto Alonso',  estado: 'enviado',    turno: 1 },
      { camareroId: 'camarero:1',  camareroNumero: 1,  camareroNombre: 'Javier López',    estado: 'pendiente',  turno: 2 },
      { camareroId: 'camarero:12', camareroNumero: 12, camareroNombre: 'Natalia Vega',    estado: 'pendiente',  turno: 2 },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pedido:3',
    numero: 'EV-003',
    cliente: 'Palacio de Congresos Valencia',
    lugar: 'Palacio de Congresos - Sala Mediterráneo',
    diaEvento: fecha(10),
    cantidadCamareros: 8,
    horaEntrada: '09:00',
    horaSalida: '14:00',
    totalHoras: '5h',
    cantidadCamareros2: 0,
    catering: 'si',
    camisa: 'blanca',
    notas: 'Congreso médico. Coffee breaks + almuerzo de gala.',
    coordinadorId: 'coordinador:3',
    coordinadorNombre: 'Ana Rodríguez',
    asignaciones: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pedido:4',
    numero: 'EV-004',
    cliente: 'Bodegas Torres Catering',
    lugar: 'Bodegas Torres - Sala de Barricas',
    diaEvento: fecha(-3),
    cantidadCamareros: 3,
    horaEntrada: '20:00',
    horaSalida: '01:00',
    totalHoras: '5h',
    cantidadCamareros2: 0,
    catering: 'no',
    camisa: 'negra',
    notas: 'Cata privada para inversores.',
    coordinadorId: 'coordinador:1',
    coordinadorNombre: 'María González',
    asignaciones: [
      { camareroId: 'camarero:2', camareroNumero: 2, camareroNombre: 'Laura Sánchez',   estado: 'confirmado' },
      { camareroId: 'camarero:4', camareroNumero: 4, camareroNombre: 'Carmen Díaz',     estado: 'confirmado' },
      { camareroId: 'camarero:6', camareroNumero: 6, camareroNombre: 'Isabel Moreno',   estado: 'confirmado' },
    ],
    createdAt: new Date().toISOString(),
  },
];

// ─── Store mutable (se actualiza con CRUD durante la sesión) ──────────────────

let _clientes: Cliente[]      = structuredClone(CLIENTES_INICIALES);
let _coordinadores: Coordinador[] = structuredClone(COORDINADORES_INICIALES);
let _camareros: Camarero[]    = structuredClone(CAMAREROS_INICIALES);
let _pedidos: Pedido[]        = structuredClone(PEDIDOS_INICIALES);

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const delay = (ms = 150) => new Promise(r => setTimeout(r, ms));

// ─── API mock ─────────────────────────────────────────────────────────────────

export const demoStore = {
  // CLIENTES
  async getClientes()                               { await delay(); return [..._clientes]; },
  async createCliente(data: Omit<Cliente, 'id'>)   { await delay(); const c = { id: `cliente:${uid()}`, ...data }; _clientes.push(c); return c; },
  async updateCliente(id: string, data: Partial<Cliente>) { await delay(); _clientes = _clientes.map(c => c.id === id ? { ...c, ...data } : c); return _clientes.find(c => c.id === id)!; },
  async deleteCliente(id: string)                  { await delay(); _clientes = _clientes.filter(c => c.id !== id); },

  // COORDINADORES
  async getCoordinadores()                                      { await delay(); return [..._coordinadores]; },
  async createCoordinador(data: Omit<Coordinador, 'id'>)       { await delay(); const c = { id: `coordinador:${uid()}`, ...data }; _coordinadores.push(c); return c; },
  async updateCoordinador(id: string, data: Partial<Coordinador>) { await delay(); _coordinadores = _coordinadores.map(c => c.id === id ? { ...c, ...data } : c); return _coordinadores.find(c => c.id === id)!; },
  async deleteCoordinador(id: string)                          { await delay(); _coordinadores = _coordinadores.filter(c => c.id !== id); },

  // CAMAREROS
  async getCamareros()                                    { await delay(); return [..._camareros]; },
  async createCamarero(data: Omit<Camarero, 'id' | 'numero'>) { await delay(); const numero = Math.max(0, ..._camareros.map(c => c.numero)) + 1; const c = { id: `camarero:${uid()}`, numero, ...data }; _camareros.push(c); return c; },
  async updateCamarero(id: string, data: Partial<Camarero>)   { await delay(); _camareros = _camareros.map(c => c.id === id ? { ...c, ...data } : c); return _camareros.find(c => c.id === id)!; },
  async deleteCamarero(id: string)                        { await delay(); _camareros = _camareros.filter(c => c.id !== id); },

  // PEDIDOS
  async getPedidos()                                  { await delay(); return [..._pedidos]; },
  async getPedido(id: string)                         { await delay(); return _pedidos.find(p => p.id === id) ?? null; },
  async createPedido(data: Omit<Pedido, 'id'>)        { await delay(); const p = { id: `pedido:${uid()}`, ...data, createdAt: new Date().toISOString() }; _pedidos.push(p); return p; },
  async updatePedido(id: string, data: Partial<Pedido>) { await delay(); _pedidos = _pedidos.map(p => p.id === id ? { ...p, ...data } : p); return _pedidos.find(p => p.id === id)!; },
  async deletePedido(id: string)                      { await delay(); _pedidos = _pedidos.filter(p => p.id !== id); },

  // Indica si estamos en demo
  isDemo: true,
};
