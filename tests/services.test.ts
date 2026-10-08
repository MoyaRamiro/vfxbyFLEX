import { describe, expect, it } from 'vitest';
import { cromaPrice, PACKAGE_PRICES, SERVICES } from '../src/data/services';

describe('cromaPrice', () => {
  it('charges base price for 2 environments with VFX Pro', () => {
    expect(cromaPrice(2, 'pro')).toBe(35);
  });
  it('adds 15 per extra environment', () => {
    expect(cromaPrice(3, 'pro')).toBe(50);
    expect(cromaPrice(4, 'pro')).toBe(65);
  });
  it('adds 25 for VFX Full', () => {
    expect(cromaPrice(2, 'full')).toBe(60);
    expect(cromaPrice(4, 'full')).toBe(90);
  });
});

describe('SERVICES catalog', () => {
  it('has the six services with required ids', () => {
    const ids = SERVICES.map((s) => s.id);
    expect(ids).toEqual(['visualizer', 'croma', 'vfx-basico', 'vfx-pro', 'montaje', 'extras']);
  });
  it('every select service has priced options', () => {
    for (const s of SERVICES.filter((x) => x.kind === 'select' && x.id !== 'croma')) {
      expect(s.options.length).toBeGreaterThan(0);
      for (const o of s.options) expect(o.price).toBeGreaterThan(0);
    }
  });
  it('extras contains reel-1, reel-2 and portada', () => {
    const extras = SERVICES.find((s) => s.id === 'extras')!;
    const ids = extras.options.map((o) => o.id);
    expect(ids).toContain('reel-1');
    expect(ids).toContain('reel-2');
    expect(ids).toContain('portada');
  });
  it('PACKAGE_PRICES matches the three package services', () => {
    expect(PACKAGE_PRICES).toEqual({ 'vfx-basico': 20, 'vfx-pro': 45, montaje: 15 });
  });
});
