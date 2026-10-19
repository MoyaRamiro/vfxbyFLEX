import { describe, it, expect, beforeEach } from 'vitest';
import { emptyCart, toggleLine, lineKey, setDuration, setSena, setMode, setMood } from '../src/lib/cart';
import { cartTotals, durationAdjustment, lineTotal, formatDuration, promoOriginal } from '../src/lib/pricing';
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
});