import { test, expect } from '@playwright/test';

test('configurator smoke', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
});

test('promo banner stays visible with a live countdown', async ({ page }) => {
  await page.goto('/');
  const banner = page.locator('#promo-banner');
  await expect(banner).toBeVisible();
  await expect(page.locator('#promo-countdown')).toHaveText(/^\d{2}:\d{2}:\d{2}$/);
});

test('selecting a service updates the cart total', async ({ page }) => {
  await page.goto('/');
  await page.locator('.option-btn[data-option="visual-only-lyrics"]').click();
  await page.locator('.cart-trigger').first().click();
  await expect(page.locator('#cart-total')).toContainText('57');
});

test('promo item shows discounted price and original struck through', async ({ page }) => {
  await page.goto('/');
  await page.locator('.option-btn[data-option="visual-25d-imagen"]').click();
  await page.locator('.cart-trigger').first().click();
  // Discounted base price is charged
  await expect(page.locator('#cart-total')).toContainText('45');
  // Original is inflated (~USD 64) and savings shown
  await expect(page.locator('#cart-subtotal')).toContainText('64');
  await expect(page.locator('#cart-discount')).toContainText('19');
});

test('removing items clears selection and does not re-add siblings', async ({ page }) => {
  await page.goto('/');
  await page.locator('.cat-tab[data-category="vfx"]').click();

  const pkg = page.locator('.option-btn[data-option="vfx-full"]');
  const cam = page.locator('.option-btn[data-option="vfx-full-camaras"]');
  const tit = page.locator('.option-btn[data-option="vfx-full-titulo"]');

  await pkg.click(); // reveals the complementos group
  await cam.click();
  await tit.click();
  await expect(cam).toHaveAttribute('aria-pressed', 'true');
  await expect(tit).toHaveAttribute('aria-pressed', 'true');

  await page.locator('.cart-trigger').first().click();
  await page.locator('.remove-line[data-key="vfx:vfx-full-camaras"]').click();
  await page.locator('.remove-line[data-key="vfx:vfx-full-titulo"]').click();
  await page.locator('#cart-close').click();

  // Regression: selection must clear after removal (used to stay black/stale)
  await expect(cam).toHaveAttribute('aria-pressed', 'false');
  await expect(tit).toHaveAttribute('aria-pressed', 'false');
  await expect(pkg).toHaveAttribute('aria-checked', 'true');

  // Re-selecting one must not drag its sibling back into the cart
  await cam.click();
  await expect(cam).toHaveAttribute('aria-pressed', 'true');
  await expect(tit).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('[data-cart-count]').first()).toHaveText('2');

  await page.locator('.cart-trigger').first().click();
  const rows = page.locator('.remove-line');
  await expect(rows).toHaveCount(2); // package + camaras only
  await expect(page.locator('#cart-total')).toContainText('214');
});
