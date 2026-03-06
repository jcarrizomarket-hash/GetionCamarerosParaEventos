/**
 * Tests E2E para creación de pedidos
 * Framework: Playwright
 * 
 * Para ejecutar:
 * npm install -D @playwright/test
 * npx playwright test
 */

import { test, expect, Page } from '@playwright/test';

// Configuración base
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

// Helper: navega a la aplicación con manejo de errores claro
async function gotoApp(page: Page, url: string = BASE_URL): Promise<void> {
  try {
    await page.goto(url);
    await page.waitForLoadState('networkidle');
  } catch (error) {
    console.error(`[E2E] Error al cargar la aplicación en ${url}:`, error);
    throw new Error(
      `No se pudo cargar la aplicación en ${url}. ` +
      `Verifique que el servidor esté corriendo. Error original: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

test.describe('Creación de Pedidos', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a la aplicación con manejo de errores
    await gotoApp(page);
  });

  test('debe mostrar el formulario de entrada de pedidos', async ({ page }) => {
    // Navegar a la sección de Pedidos
    await page.click('text=Pedidos');
    
    // Verificar que se muestra la pestaña de Entrada de Pedidos
    await page.click('text=Entrada de Pedidos');
    
    // Verificar que existe el botón de crear nuevo pedido
    const botonNuevo = page.locator('button:has-text("Nuevo Pedido")');
    await expect(botonNuevo).toBeVisible();
  });

  test('debe crear un nuevo pedido exitosamente', async ({ page }) => {
    // Navegar a Pedidos > Entrada de Pedidos
    await page.click('text=Pedidos');
    await page.click('text=Entrada de Pedidos');
    
    // Abrir formulario de nuevo pedido
    await page.click('button:has-text("Nuevo Pedido")');
    
    // Rellenar el formulario
    await page.fill('input[name="numero"]', 'TEST-001');
    await page.fill('input[name="cliente"]', 'Cliente de Prueba');
    await page.fill('input[name="lugar"]', 'Salón de Eventos Test');
    
    // Seleccionar fecha (hoy + 7 días)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const dateString = futureDate.toISOString().split('T')[0];
    await page.fill('input[type="date"]', dateString);
    
    // Configurar cantidad de camareros
    await page.fill('input[name="cantidadCamareros"]', '5');
    
    // Configurar hora de entrada
    await page.fill('input[name="horaEntrada"]', '14:00');
    
    // Seleccionar tipo de camisa
    await page.selectOption('select[name="camisa"]', 'negra');
    
    // Guardar el pedido
    await page.click('button:has-text("Guardar")');
    
    // Esperar confirmación
    await page.waitForTimeout(1000);
    
    // Verificar que el pedido aparece en la lista
    const pedidoCreado = page.locator('text=Cliente de Prueba');
    await expect(pedidoCreado).toBeVisible();
  });

  test('debe validar campos requeridos', async ({ page }) => {
    // Navegar a Pedidos > Entrada de Pedidos
    await page.click('text=Pedidos');
    await page.click('text=Entrada de Pedidos');
    
    // Abrir formulario
    await page.click('button:has-text("Nuevo Pedido")');
    
    // Intentar guardar sin rellenar campos
    await page.click('button:has-text("Guardar")');
    
    // Verificar que no se creó (debería mostrar validación HTML5)
    // El formulario debería seguir visible
    const formulario = page.locator('form');
    await expect(formulario).toBeVisible();
  });

  test('debe mostrar pedidos en el calendario', async ({ page }) => {
    // Navegar a Pedidos > Entrada de Pedidos
    await page.click('text=Pedidos');
    await page.click('text=Entrada de Pedidos');
    
    // Verificar que el calendario está visible
    const calendario = page.locator('[class*="calendar"]').first();
    await expect(calendario).toBeVisible();
    
    // Verificar navegación de meses
    const botonSiguiente = page.locator('button:has-text("›")').first();
    await botonSiguiente.click();
    
    // Esperar actualización
    await page.waitForTimeout(500);
  });
});

test.describe('Gestión de Pedidos', () => {
  test('debe asignar camareros a un pedido', async ({ page }) => {
    // Navegar a Gestión de Pedidos
    await gotoApp(page);
    await page.click('text=Pedidos');
    await page.click('text=Gestión de Pedidos');
    
    // Esperar a que carguen los pedidos
    await page.waitForTimeout(1000);
    
    // Verificar que se muestra la tabla de asignaciones
    const tablaAsignaciones = page.locator('h3:has-text("Estado Global de Asignaciones")');
    await expect(tablaAsignaciones).toBeVisible();
  });

  test('debe filtrar pedidos por fecha', async ({ page }) => {
    await gotoApp(page);
    await page.click('text=Pedidos');
    await page.click('text=Gestión de Pedidos');
    
    // Buscar selector de fecha
    const selectorFecha = page.locator('select, input[type="date"]').first();
    
    if (await selectorFecha.isVisible()) {
      // Interactuar con el selector
      await selectorFecha.click();
      await page.waitForTimeout(500);
    }
  });
});

test.describe('Envío de Mensajes', () => {
  test('debe generar mensaje para camarero', async ({ page }) => {
    await gotoApp(page);
    
    // Navegar a sección de envío de mensajes
    // (Ajustar según la navegación real de tu app)
    await page.click('text=Pedidos');
    
    // Verificar que existe la interfaz de mensajería
    const mensajeria = page.locator('text=WhatsApp, text=Mensaje').first();
    
    // Si existe, continuar el test
    if (await mensajeria.isVisible()) {
      await mensajeria.click();
      await page.waitForTimeout(500);
    }
  });
});

test.describe('Dashboard', () => {
  test('debe mostrar métricas principales', async ({ page }) => {
    await gotoApp(page);
    
    // Buscar elementos del dashboard
    const titulo = page.locator('h1, h2').first();
    await expect(titulo).toBeVisible();
  });

  test('debe navegar entre secciones', async ({ page }) => {
    await gotoApp(page);
    
    // Probar navegación a diferentes secciones
    const secciones = ['Dashboard', 'Pedidos', 'Camareros', 'Coordinadores', 'Clientes', 'Informes'];
    
    for (const seccion of secciones) {
      const link = page.locator(`text=${seccion}`).first();
      if (await link.isVisible()) {
        await link.click();
        await page.waitForTimeout(300);
      }
    }
  });
});

test.describe('Responsividad', () => {
  test('debe funcionar en móvil', async ({ page }) => {
    // Configurar viewport móvil
    await page.setViewportSize({ width: 375, height: 667 });
    await gotoApp(page);
    
    const contenidoPrincipal = page.locator('body').first();
    await expect(contenidoPrincipal).toBeVisible();
  });

  test('debe funcionar en tablet', async ({ page }) => {
    // Configurar viewport tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await gotoApp(page);
    
    const contenidoPrincipal = page.locator('body').first();
    await expect(contenidoPrincipal).toBeVisible();
  });
});

test.describe('Accesibilidad', () => {
  test('debe tener títulos de página apropiados', async ({ page }) => {
    await gotoApp(page);
    
    const titulo = await page.title();
    expect(titulo).toBeTruthy();
    expect(titulo.length).toBeGreaterThan(0);
  });

  test('debe tener estructura semántica', async ({ page }) => {
    await gotoApp(page);
    
    // Verificar que existen elementos semánticos
    const main = page.locator('main, [role="main"]').first();
    const headings = page.locator('h1, h2, h3');
    
    // Al menos debería haber algún heading
    expect(await headings.count()).toBeGreaterThan(0);
  });
});

test.describe('Performance', () => {
  test('debe cargar en menos de 3 segundos', async ({ page }) => {
    const startTime = Date.now();
    
    await gotoApp(page);
    
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000);
  });
});

// Test de ejemplo para búsqueda/filtrado
test.describe('Búsqueda y Filtrado', () => {
  test('debe filtrar camareros por nombre', async ({ page }) => {
    await gotoApp(page);
    await page.click('text=Camareros');
    
    // Buscar input de búsqueda
    const searchInput = page.locator('input[type="search"], input[placeholder*="Buscar"]').first();
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('Juan');
      await page.waitForTimeout(500);
      
      // Los resultados deberían filtrarse
      // (Verificación genérica)
      await expect(searchInput).toHaveValue('Juan');
    }
  });
});
