import { test, expect } from '@playwright/test';

test.describe('marquee', () => {
  // The bug only showed up when the viewport was wider than one copy of the strip.
  test.use({ viewport: { width: 2560, height: 900 } });

  for (const path of ['/', '/en/']) {
    test(`loops seamlessly on wide screens (${path})`, async ({ page }) => {
      await page.goto(path);
      const data = await page.locator('.animate-marquee').evaluate((el) => {
        const spans = [...el.children] as HTMLElement[];
        const rect = el.getBoundingClientRect();
        const half = spans.length / 2;
        const secondHalfStart = spans[half].getBoundingClientRect().left - rect.left;
        return {
          spans: spans.length,
          total: rect.width,
          half,
          secondHalfStart,
          viewport: window.innerWidth,
          firstWord: spans[0].textContent?.trim(),
          middleWord: spans[half].textContent?.trim(),
        };
      });

      // Even number of copies so translateX(-50%) lands on an identical frame.
      expect(data.spans % 2).toBe(0);
      expect(data.middleWord).toBe(data.firstWord);
      // Both halves must be exactly the same width (no jump at the loop point).
      expect(Math.abs(data.total / 2 - data.secondHalfStart)).toBeLessThan(1);
      // The strip must still cover the viewport at the end of the animation.
      expect(data.total / 2).toBeGreaterThanOrEqual(data.viewport);
    });
  }
});
