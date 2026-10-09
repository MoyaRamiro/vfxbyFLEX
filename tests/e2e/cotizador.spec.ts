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
