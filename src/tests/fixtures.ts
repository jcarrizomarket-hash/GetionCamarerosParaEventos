/**
 * Fixtures centralizados para tests
 * Datos de prueba reutilizables
 */

import type { Pedido, Camarero, Coordinador, Cliente } from '../src/types';

export const mockPedidos: Record<string, Pedido> = {
  pedidoSimple: {
    id: 'pedido-001',
    numero: 'P-2024-001',
    cliente: 'Empresa Test S.L.',
    lugar: 'Salón de Eventos Madrid',
    ubicacion: 'Calle Test, 1, Madrid',
    diaEvento: '2024-06-15',
    cantidadCamareros: 5,
    horaEntrada: '14:00',
    horaSalida: '22:00',
    totalHoras: '8h',
    catering: 'no',
    camisa: 'negra',
    asignaciones: [],
    createdAt: '2024-01-01T00:00:00Z',
  },
  pedidoCompleto: {
    id: 'pedido-002',
    numero: 'P-2024-002',
    cliente: 'Hotel Barceló',
    lugar: 'Gran Salón',
    diaEvento: '2024-07-20',
    cantidadCamareros: 3,
    cantidadCamareros2: 2,
    horaEntrada: '19:00',
    horaSalida: '02:00',
    horaEntrada2: '23:00',
    horaSalida2: '04:00',
    catering: 'si',
    tiempoViaje: '30',
    camisa: 'blanca',
    asignaciones: [
      { camareroId: 'cam-1', camareroNumero: 1, camareroNombre: 'Juan', estado: 'confirmado', turno: 1 },
      { camareroId: 'cam-2', camareroNumero: 2, camareroNombre: 'María', estado: 'confirmado', turno: 1 },
      { camareroId: 'cam-3', camareroNumero: 3, camareroNombre: 'Pedro', estado: 'confirmado', turno: 1 },
      { camareroId: 'cam-4', camareroNumero: 4, camareroNombre: 'Ana', estado: 'confirmado', turno: 2 },
      { camareroId: 'cam-5', camareroNumero: 5, camareroNombre: 'Luis', estado: 'confirmado', turno: 2 },
    ],
    createdAt: '2024-02-01T00:00:00Z',
  },
  pedidoPendiente: {
    id: 'pedido-003',
    numero: 'P-2024-003',
    cliente: 'Bodega Los Olivos',
    lugar: 'Terraza',
    diaEvento: '2024-08-10',
    cantidadCamareros: 4,
    horaEntrada: '12:00',
    horaSalida: '18:00',
    catering: 'no',
    camisa: 'blanca',
    asignaciones: [
      { camareroId: 'cam-1', camareroNumero: 1, camareroNombre: 'Juan', estado: 'pendiente', turno: 1 },
      { camareroId: 'cam-2', camareroNumero: 2, camareroNombre: 'María', estado: 'confirmado', turno: 1 },
    ],
    createdAt: '2024-03-01T00:00:00Z',
  },
};

export const mockCamareros: Record<string, Camarero> = {
  camarero1: {
    id: 'cam-001',
    numero: 1,
    nombre: 'Juan García',
    telefono: '612345678',
    email: 'juan@test.com',
    activo: true,
  },
  camarero2: {
    id: 'cam-002',
    numero: 2,
    nombre: 'María López',
    telefono: '623456789',
    email: 'maria@test.com',
    activo: true,
  },
  camareroInactivo: {
    id: 'cam-003',
    numero: 3,
    nombre: 'Pedro Martínez',
    telefono: '634567890',
    activo: false,
  },
};

export const mockCoordinadores: Record<string, Coordinador> = {
  coordinador1: {
    id: 'coord-001',
    nombre: 'Carlos Sánchez',
    telefono: '645678901',
    email: 'carlos@test.com',
    activo: true,
  },
  coordinador2: {
    id: 'coord-002',
    nombre: 'Laura Fernández',
    telefono: '656789012',
    email: 'laura@test.com',
    activo: true,
  },
};

export const mockClientes: Record<string, Cliente> = {
  cliente1: {
    id: 'cli-001',
    nombre: 'Empresa Eventos S.L.',
    email: 'contacto@empresa.com',
    telefono: '912345678',
  },
  cliente2: {
    id: 'cli-002',
    nombre: 'Hotel Gran Vía',
    email: 'eventos@hotelgranvia.com',
    telefono: '913456789',
  },
};

export const mockTokens = {
  validJwt: [
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
    btoa(JSON.stringify({ sub: 'user-123', email: 'test@test.com', role: 'admin', exp: Math.floor(Date.now() / 1000) + 3600 })).replace(/=/g, ''),
    'signature',
  ].join('.'),
  expiredJwt: [
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
    btoa(JSON.stringify({ sub: 'user-123', email: 'test@test.com', role: 'admin', exp: Math.floor(Date.now() / 1000) - 3600 })).replace(/=/g, ''),
    'signature',
  ].join('.'),
  malformedJwt: 'not.a.valid.jwt.token.at.all',
  noRoleJwt: [
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
    btoa(JSON.stringify({ sub: 'user-456', email: 'norole@test.com', exp: Math.floor(Date.now() / 1000) + 3600 })).replace(/=/g, ''),
    'signature',
  ].join('.'),
};

export const mockApiResponses = {
  pedidosSuccess: {
    success: true,
    data: [mockPedidos.pedidoSimple, mockPedidos.pedidoCompleto],
  },
  pedidoSuccess: {
    success: true,
    data: mockPedidos.pedidoSimple,
  },
  createSuccess: {
    success: true,
    data: { ...mockPedidos.pedidoSimple, id: 'pedido-new' },
    message: 'Pedido creado correctamente',
  },
  deleteSuccess: {
    success: true,
    message: 'Pedido eliminado correctamente',
  },
  notFound: {
    success: false,
    error: 'Recurso no encontrado',
  },
  unauthorized: {
    success: false,
    error: 'No autorizado',
  },
  serverError: {
    success: false,
    error: 'Error interno del servidor',
  },
};
