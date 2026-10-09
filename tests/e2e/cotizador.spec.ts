import { expect, test } from '@playwright/test';

test('agregar un servicio y enviar por WhatsApp', async ({ page }) => {
  await page.goto('/');
  await page.locator('.service-option[data-option="visualizer-full"]').click();
  await page.locator('#cart-button').click();
  await expect(page.locator('#cart-total')).toHaveText('USD 30');
  await page.locator('#cart-name').fill('Juan');
  const href = await page.locator('#cart-submit').getAttribute('href');
  expect(href).toContain('https://wa.me/5493794270276?text=');
  const decoded = decodeURIComponent(href!.split('text=')[1]);
  expect(decoded).toContain('Visualizer Full');
  expect(decoded).toContain('TOTAL: USD 30');
  expect(decoded).toContain('Nombre: Juan');
  expect(decoded).toContain('enviá el MP3');
});

test('2 Reels excluye 1 Reel', async ({ page }) => {
  await page.goto('/');
  await page.locator('.service-option[data-option="reel-1"]').click();
  await page.locator('.service-option[data-option="reel-2"]').click();
  await page.locator('#cart-button').click();
  const items = page.locator('#cart-items li');
  await expect(items).toHaveCount(1);
  await expect(items.first()).toContainText('2 Reels');
});

test('precio del paquete visible antes y después de agregar', async ({ page }) => {
  await page.goto('/');
  const pkg = page.locator('.package-toggle[data-service="vfx-pro"]');
  await expect(pkg).toContainText('USD 45');
  await pkg.click();
  await expect(pkg).toContainText('Agregado ✓');
  await expect(pkg).toContainText('USD 45');
});

test('editar croma inline desde el drawer actualiza el total', async ({ page }) => {
  await page.goto('/');
  await page.locator('.croma-add').click();
  await page.locator('#cart-button').click();
  await expect(page.locator('#cart-total')).toHaveText('USD 35');
  await page.locator('.drawer-croma-entornos').selectOption('4');
  await expect(page.locator('#cart-total')).toHaveText('USD 65');
});

test('la página aplica los estilos de Tailwind (no queda sin CSS)', async ({ page }) => {
  await page.goto('/');
  const fontSize = await page.locator('h1').evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  expect(fontSize).toBeGreaterThan(40);
  const fontFamily = await page.locator('body').evaluate((el) => getComputedStyle(el).fontFamily);
  expect(fontFamily).toContain('Space Grotesk');
});
