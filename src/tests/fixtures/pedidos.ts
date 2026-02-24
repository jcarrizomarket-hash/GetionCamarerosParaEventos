/**
 * Fixtures de Pedidos para tests
 * Datos de prueba reutilizables que representan pedidos en distintos estados
 */

import type { Pedido, Asignacion } from '../../src/types';

const asignacionConfirmada = (
  camareroId: string,
  nombre: string,
  numero: number
): Asignacion => ({
  camareroId,
  camareroNumero: numero,
  camareroNombre: nombre,
  estado: 'confirmado',
  turno: 1,
  horaEntrada: '14:00',
  horaSalida: '22:00',
});

const asignacionPendiente = (
  camareroId: string,
  nombre: string,
  numero: number
): Asignacion => ({
  camareroId,
  camareroNumero: numero,
  camareroNombre: nombre,
  estado: 'pendiente',
  turno: 1,
  horaEntrada: '14:00',
  horaSalida: '22:00',
});

export const pedidoCompleto: Pedido = {
  id: 'pedido-001',
  numero: 'TEST-001',
  cliente: 'Empresa Prueba S.L.',
  lugar: 'Salón Gran Vía',
  ubicacion: 'Calle Gran Vía 1, Madrid',
  diaEvento: '2026-06-15',
  cantidadCamareros: 3,
  horaEntrada: '14:00',
  horaSalida: '22:00',
  totalHoras: '8h',
  catering: 'no',
  camisa: 'negra',
  asignaciones: [
    asignacionConfirmada('cam-1', 'Juan García', 1),
    asignacionConfirmada('cam-2', 'María López', 2),
    asignacionConfirmada('cam-3', 'Pedro Martínez', 3),
  ],
  createdAt: '2026-05-01T10:00:00Z',
};

export const pedidoParcial: Pedido = {
  id: 'pedido-002',
  numero: 'TEST-002',
  cliente: 'Hotel Eventos',
  lugar: 'Salón Principal',
  diaEvento: '2026-07-20',
  cantidadCamareros: 5,
  horaEntrada: '19:00',
  horaSalida: '02:00',
  catering: 'si',
  camisa: 'blanca',
  asignaciones: [
    asignacionConfirmada('cam-1', 'Juan García', 1),
    asignacionConfirmada('cam-2', 'María López', 2),
    asignacionPendiente('cam-4', 'Ana Ruiz', 4),
    asignacionPendiente('cam-5', 'Luis Sanz', 5),
  ],
  createdAt: '2026-06-01T10:00:00Z',
};

export const pedidoDosTurnos: Pedido = {
  id: 'pedido-003',
  numero: 'TEST-003',
  cliente: 'Boda García-López',
  lugar: 'Finca El Olivar',
  diaEvento: '2026-08-10',
  cantidadCamareros: 4,
  horaEntrada: '13:00',
  horaSalida: '18:00',
  totalHoras: '5h',
  cantidadCamareros2: 2,
  horaEntrada2: '18:00',
  horaSalida2: '23:00',
  totalHoras2: '5h',
  catering: 'si',
  camisa: 'blanca',
  asignaciones: [
    asignacionConfirmada('cam-1', 'Juan García', 1),
    asignacionConfirmada('cam-2', 'María López', 2),
    asignacionPendiente('cam-3', 'Pedro Martínez', 3),
    asignacionPendiente('cam-4', 'Ana Ruiz', 4),
    asignacionPendiente('cam-5', 'Luis Sanz', 5),
    asignacionPendiente('cam-6', 'Carmen Díaz', 6),
  ],
};

export const pedidoVacio: Pedido = {
  id: 'pedido-004',
  numero: 'TEST-004',
  cliente: 'Corporativo ABC',
  lugar: 'Auditorio Norte',
  diaEvento: '2026-09-05',
  cantidadCamareros: 4,
  horaEntrada: '10:00',
  catering: 'no',
  camisa: 'negra',
  asignaciones: [],
};
