/**
 * Fixtures de Camareros para tests
 * Datos de prueba reutilizables que representan camareros en distintos estados
 */

import type { Camarero } from '../../src/types';

export const camareroActivo: Camarero = {
  id: 'cam-001',
  numero: 1,
  nombre: 'Juan García Pérez',
  telefono: '612345678',
  email: 'juan.garcia@ejemplo.com',
  activo: true,
  notas: 'Camarero con experiencia en eventos formales',
  createdAt: '2025-01-15T10:00:00Z',
};

export const camareraActiva: Camarero = {
  id: 'cam-002',
  numero: 2,
  nombre: 'María López Sanz',
  telefono: '623456789',
  email: 'maria.lopez@ejemplo.com',
  activo: true,
  createdAt: '2025-02-01T10:00:00Z',
};

export const camareroInactivo: Camarero = {
  id: 'cam-003',
  numero: 3,
  nombre: 'Pedro Martínez Gil',
  telefono: '634567890',
  activo: false,
  notas: 'Baja temporal',
  createdAt: '2025-03-01T10:00:00Z',
};

export const camareroSinContacto: Camarero = {
  id: 'cam-004',
  numero: 4,
  nombre: 'Ana Ruiz Torres',
  activo: true,
  createdAt: '2025-04-01T10:00:00Z',
};

export const listaCamareros: Camarero[] = [
  camareroActivo,
  camareraActiva,
  camareroInactivo,
  camareroSinContacto,
];
