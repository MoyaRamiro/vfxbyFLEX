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
  await page.locator('.cat-tab[data-category="visual"]').click();
  await page.locator('.option-btn[data-option="visual-only-lyrics"]').click();
  await page.locator('.cart-trigger').first().click();
  await expect(page.locator('#cart-total')).toContainText('57');
});

test('promo item shows discounted price and original struck through', async ({ page }) => {
  await page.goto('/');
  await page.locator('.cat-tab[data-category="visual"]').click();
  await page.locator('.option-btn[data-option="visual-25d-imagen"]').click();
  await page.locator('.cart-trigger').first().click();
  // Discounted base price is charged
  await expect(page.locator('#cart-total')).toContainText('45');
  // Original is inflated (~USD 64) and savings shown
  await expect(page.locator('#cart-subtotal')).toContainText('64');
  await expect(page.locator('#cart-discount')).toContainText('19');
});

test('bundle package expands, is deselectable component by component, and prices change', async ({ page }) => {
  await page.goto('/');
  await page.locator('.cat-tab[data-category="vfx"]').click();

  const pkg = page.locator('.option-btn[data-option="vfx-full"]');
  const panel = page.locator('.bundle-panel[data-bundle-panel="vfx-full"]');
  const camaras = page.locator('.bundle-check[data-component="vfx-full-camaras"]');

  await expect(panel).toBeHidden();
  await pkg.click();
  await expect(panel).toBeVisible();
  await expect(camaras).toBeChecked();
  await expect(page.locator('.option-now[data-price="199"]')).toContainText('199');

  // Unchecking a component drops the package price to the suelto sum (199 - 15 = 184? no, suelto sum)
  await camaras.uncheck();
  const partial = 10 + 45 + 20 + 65 + 20 + 20 + 10; // 190 suelto (sin cámaras)
  await expect(page.locator('.option-now[data-price="199"]')).toContainText(String(partial));

  await page.locator('.cart-trigger').first().click();
  await expect(page.locator('#cart-total')).toContainText(String(partial));
});

test('duration is applied per product, not once per order', async ({ page }) => {
  await page.goto('/');
  await page.locator('.cat-tab[data-category="visual"]').click();
  await page.locator('.option-btn[data-option="visual-only-lyrics"]').click();
  await page.locator('.cat-tab[data-category="vfx"]').click();
  await page.locator('.option-btn[data-option="vfx-full"]').click();

  // 3:30 → +30 on each of the 2 services
  await page.locator('#duration-slider').evaluate((el) => {
    (el as HTMLInputElement).value = '210';
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });

  await page.locator('.cart-trigger').first().click();
  // vfx-full 199→229 + Only Lyrics 57→87 = 316
  await expect(page.locator('#cart-total')).toContainText('316');
});

test('typed duration moves the slider and updates prices', async ({ page }) => {
  await page.goto('/');
  const input = page.locator('#duration-input');

  await input.fill('1:00');
  await input.press('Enter');
  await expect(page.locator('#duration-slider')).toHaveValue('60');
  await expect(page.locator('#duration-value')).toHaveText('1:00');
  await expect(input).toHaveValue('1:00');
  await expect(page.locator('.option-btn[data-option="montaje-color"] .option-now')).toHaveText('USD 5');

  await input.fill('3');
  await input.press('Enter');
  await expect(page.locator('#duration-slider')).toHaveValue('180');
  await expect(page.locator('#duration-value')).toHaveText('3:00');

  await page.locator('#duration-slider').evaluate((el) => {
    (el as HTMLInputElement).value = '150';
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await expect(input).toHaveValue('2:30');
});

test('preset card pre-arms the order and scrolls to the duration block without opening the drawer', async ({ page }) => {
  await page.goto('/');
  await page.locator('.preset-card[data-preset="visual-25d"]').click();

  // The drawer stays closed and the client lands on the duration selector.
  await expect(page.locator('#cart-drawer')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('#duration-block')).toBeInViewport();
  await expect(page.locator('#duration-slider')).toBeVisible();
  await expect(page.locator('#cart-total')).toContainText('45');
});

test('croma full preset selects 2.5D/3D with 4 fixed environments', async ({ page }) => {
  await page.goto('/');
  await page.locator('.preset-card[data-preset="croma-full-4"]').click();

  await expect(page.locator('.cat-tab[data-category="croma"]')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('.option-btn[data-option="croma-25d-3d"]')).toHaveAttribute('aria-checked', 'true');

  const select = page.locator('.cat-panel[data-panel="croma"] .entornos-select');
  await expect(select).toHaveValue('4');
  await expect(select).toBeDisabled();
  // 119 (2.5D y 3D) + 4 entornos × USD 10 = USD 159
  await expect(page.locator('#cart-total')).toContainText('159');
});

test('environments selector is enabled only for the first two croma options', async ({ page }) => {
  await page.goto('/');
  await page.locator('.cat-tab[data-category="croma"]').click();
  const select = page.locator('.cat-panel[data-panel="croma"] .entornos-select');

  // Nothing selected yet: the selector is locked.
  await expect(select).toBeDisabled();
  await expect(select).toHaveValue('0');

  await page.locator('.option-btn[data-option="croma-25d-3d"]').click();
  await expect(select).toBeEnabled();
  await expect(select).toHaveValue('1');

  await page.locator('.option-btn[data-option="croma-mezclado"]').click();
  await expect(select).toBeEnabled();

  await page.locator('.option-btn[data-option="croma-video-full"]').click();
  await expect(select).toBeDisabled();
  await expect(select).toHaveValue('0');

  await page.locator('.option-btn[data-option="croma-2d"]').click();
  await expect(select).toBeDisabled();

  await page.locator('.option-btn[data-option="croma-25d-3d"]').click();
  await expect(select).toBeEnabled();
  await expect(select).toHaveValue('1');
});

test('changing environments updates the cart total', async ({ page }) => {
  await page.goto('/');
  await page.locator('.cat-tab[data-category="croma"]').click();
  await page.locator('.option-btn[data-option="croma-25d-3d"]').click();

  const select = page.locator('.cat-panel[data-panel="croma"] .entornos-select');
  await select.selectOption('4');
  await expect(page.locator('#cart-total')).toContainText('159');
});

test('notes typed in the cart reach the WhatsApp order message', async ({ page }) => {
  await page.goto('/');
  await page.locator('.cat-tab[data-category="visual"]').click();
  await page.locator('.option-btn[data-option="visual-only-lyrics"]').click();
  await page.locator('.cart-trigger').first().click();
  await page.locator('#customer-notes').fill('Quiero estilo nocturno');

  await page.route('https://wa.me/**', (route) =>
    route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>wa</title>' })
  );
  const [request] = await Promise.all([
    page.waitForRequest((req) => req.url().startsWith('https://wa.me/')),
    page.locator('#cart-wa').click(),
  ]);
  expect(decodeURIComponent(request.url())).toContain('"Quiero estilo nocturno"');
});

test('notes typed in the cart reach the WhatsApp deposit message', async ({ page }) => {
  await page.goto('/');
  await page.locator('.cat-tab[data-category="visual"]').click();
  await page.locator('.option-btn[data-option="visual-only-lyrics"]').click();
  await page.locator('.cart-trigger').first().click();
  await page.locator('#customer-notes').fill('Quiero estilo nocturno');

  await page.route('https://wa.me/**', (route) =>
    route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>wa</title>' })
  );
  const [request] = await Promise.all([
    page.waitForRequest((req) => req.url().startsWith('https://wa.me/')),
    page.locator('#cart-sena').click(),
  ]);
  expect(decodeURIComponent(request.url())).toContain('"Quiero estilo nocturno"');
});

test('preview opens the matching hd video', async ({ page }) => {
  await page.goto('/');
  await page.locator('.cat-tab[data-category="vfx"]').click();
  // Open the VFX Full package preview ("Ver" next to the option).
  await page.locator('.option-btn[data-option="vfx-full"]').locator('xpath=following-sibling::button[contains(@class,"preview-btn")]').click();
  const video = page.locator('#preview-body video');
  await expect(video).toHaveAttribute('src', /videos\/hd\/vfx-full\.mp4/);
  await expect(page.locator('#preview-modal')).not.toHaveClass(/hidden/);
});

test('inline previews load only when they enter the viewport', async ({ page }) => {
  await page.goto('/');
  const firstPreview = page.locator('.preview-btn video').first();
  await expect(firstPreview).not.toHaveAttribute('src');

  const presetVideo = page.locator('.preset-card video').first();
  await presetVideo.scrollIntoViewIfNeeded();
  await expect(presetVideo).toHaveAttribute('src', /videos\/preview\/croma-25d-3d\.mp4/);

  await firstPreview.scrollIntoViewIfNeeded();
  await expect(firstPreview).toHaveAttribute('src', /videos\/preview\/.*\.mp4/);
});
