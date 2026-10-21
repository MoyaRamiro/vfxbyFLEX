import { describe, it, expect, beforeEach } from 'vitest';
import { emptyCart, toggleLine, lineKey, setDuration, setSena, setMode, setMood } from '../src/lib/cart';
import { cartTotals, durationAdjustment, lineTotal, lineUnit, lineOriginal, formatDuration, promoOriginal } from '../src/lib/pricing';
import { promoActive, promoRemaining, formatCountdown } from '../src/lib/promo';

describe('cart', () => {
  beforeEach(() => {});

  it('toggle single replaces in group', () => {
    let c = emptyCart();
    const lineA = { key: 'visual:v1', categoryId: 'visual' as any, groupId: 'v1g', optionId: 'a', label: 'A', base: 50, promo: false };
    const lineB = { key: 'visual:v1', categoryId: 'visual' as any, groupId: 'v1g', optionId: 'b', label: 'B', base: 60, promo: false };
    c = toggleLine(c, lineA, true);
    expect(c.lines.length).toBe(1);
    c = toggleLine(c, lineB, true);
    expect(c.lines.length).toBe(1);
    expect(c.lines[0].optionId).toBe('b');
  });

  it('toggle multi adds/removes', () => {
    let c = emptyCart();
    const lineA = { key: 'vfx:trans', categoryId: 'vfx' as any, groupId: 'c', optionId: 'trans', label: 'Trans', base: 45, promo: false };
    const lineB = { key: 'vfx:cam', categoryId: 'vfx' as any, groupId: 'c', optionId: 'cam', label: 'Cam', base: 45, promo: false };
    c = toggleLine(c, lineA, false);
    c = toggleLine(c, lineB, false);
    expect(c.lines.length).toBe(2);
    c = toggleLine(c, lineA, false);
    expect(c.lines.length).toBe(1);
  });

  it('duration adjustment ±10 per 30s from 2:00', () => {
    expect(durationAdjustment(120)).toBe(0);
    expect(durationAdjustment(150)).toBe(10);
    expect(durationAdjustment(180)).toBe(20);
    expect(durationAdjustment(90)).toBe(-10);
    expect(durationAdjustment(60)).toBe(-20);
  });

  it('promoUnit 30%', () => {
    expect(promoOriginal(45)).toBe(64);
    expect(promoOriginal(119)).toBe(170);
  });

  it('promo stays active forever (permanent) with an evergreen countdown', () => {
    expect(promoActive(new Date('2020-01-01T00:00:00'))).toBe(true);
    expect(promoActive(new Date('2030-01-01T00:00:00'))).toBe(true);
    const remaining = promoRemaining(new Date('2020-01-01T12:00:00'));
    expect(remaining).toBeGreaterThan(0);
    expect(remaining).toBeLessThanOrEqual(24 * 60 * 60 * 1000);
  });

  describe('bundles', () => {
    const fullComponents = [
      'vfx-full-idea', 'vfx-full-transiciones', 'vfx-full-camaras', 'vfx-full-titulo',
      'vfx-full-rotoscopia', 'vfx-full-ia', 'vfx-full-3d', 'vfx-full-composicion',
    ];
    const fullLine = (components: string[]) => ({
      key: 'vfx:vfx-paquete', categoryId: 'vfx' as const, groupId: 'vfx-paquete',
      optionId: 'vfx-full', label: 'VFX Full', base: 199, promo: true, components,
    });

    it('complete package charges the package price (199) with promo active', () => {
      const line = fullLine(fullComponents);
      expect(lineUnit(line, true)).toBe(199);
      expect(lineTotal(line, true)).toBe(199);
    });

    it('incomplete package charges the sum of selected components at suelto prices', () => {
      // Deselect camaras (15) and composicion (10) → 199 - 25 = 174 of components
      const partial = fullComponents.filter((c) => c !== 'vfx-full-camaras' && c !== 'vfx-full-composicion');
      const line = fullLine(partial);
      expect(lineUnit(line, true)).toBe(10 + 45 + 20 + 65 + 20 + 20);
      expect(lineTotal(line, true)).toBe(180);
    });

    it('complete package original price is the inflated one (no suelto mix)', () => {
      const line = fullLine(fullComponents);
      expect(lineOriginal(line)).toBe(Math.round(199 / 0.7));
    });

    it('duration applies per product line, not once per order', () => {
      let c = emptyCart();
      c = setDuration(c, 150); // +10
      c = toggleLine(c, fullLine(fullComponents) as any, true);
      c = toggleLine(c, {
        key: 'visual:visual-tipo', categoryId: 'visual', groupId: 'visual-tipo',
        optionId: 'visual-25d-imagen', label: 'Visual 2.5D', base: 45, promo: true,
      } as any, true);
      const t = cartTotals(c, true);
      // +10 on VFX Full (199→209) and +10 on Visual (45→55)
      expect(t.durationAdjustment).toBe(20);
      expect(t.total).toBe(209 + 55);
    });
  });
});