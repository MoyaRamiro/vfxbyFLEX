import { DURATION, PROMO } from '../config/order';
import { getBundle, isBundleComplete, isExtra } from '../data/catalog';
import type { CartLine, CartState } from './cart';

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function money(n: number): string {
  const rounded = round2(n);
  const hasCents = Math.abs(rounded % 1) > 1e-9;
  return hasCents ? rounded.toFixed(2).replace('.', ',') : String(rounded);
}

export function durationAdjustment(seconds: number): number {
  const diff = seconds - DURATION.baseSec;
  const blocks = Math.floor(Math.abs(diff) / DURATION.blockSec);
  return Math.sign(diff) * blocks * DURATION.blockPrice;
}

// The catalog "base" price is the DISCOUNTED price. The original shown is
// inflated so that base = (1 - discount) * original, giving a visible 30% off.
export function promoOriginal(base: number): number {
  return Math.round(base / (1 - PROMO.discount));
}

export function lineAddonsTotal(line: CartLine): number {
  return (line.addons ?? []).reduce((sum, a) => sum + a.price, 0);
}

export function lineEntornosTotal(line: CartLine): number {
  return (line.entornos ?? 0) * (line.entornoPriceEach ?? 0);
}

// Duration is charged on every service product (never on extras).
export function lineDurationTotal(line: CartLine, durationAdj: number): number {
  return isExtra(line.categoryId) ? 0 : durationAdj;
}

// Sum of the selected components of a package at their individual prices.
function bundlePartsSum(line: CartLine, bundle: NonNullable<ReturnType<typeof getBundle>>): number {
  const selected = new Set(line.components ?? []);
  return round2(bundle.filter((c) => selected.has(c.id)).reduce((sum, c) => sum + c.price, 0));
}

// Unit price of a line before addons/entornos/duration.
// A complete package charges its package price (with promo when active).
// An incomplete package loses the package discount and charges the sum of the
// selected components at their individual, non-promo prices.
export function lineUnit(line: CartLine, promoActive: boolean): number {
  const bundle = getBundle(line.categoryId, line.optionId);
  if (bundle && !isBundleComplete(line.components, bundle)) {
    return bundlePartsSum(line, bundle);
  }
  return line.promo && !promoActive ? promoOriginal(line.base) : line.base;
}

export function lineTotal(line: CartLine, promoActive: boolean, durationAdj = 0): number {
  return Math.max(
    0,
    round2(
      lineUnit(line, promoActive) +
        lineAddonsTotal(line) +
        lineEntornosTotal(line) +
        lineDurationTotal(line, durationAdj)
    )
  );
}

// The "antes" / list price. Duration is applied here too so the promo delta
// (the visible saving) stays constant regardless of the chosen length.
export function lineOriginal(line: CartLine, durationAdj = 0): number {
  const bundle = getBundle(line.categoryId, line.optionId);
  const base =
    bundle && !isBundleComplete(line.components, bundle)
      ? bundlePartsSum(line, bundle)
      : line.promo
        ? promoOriginal(line.base)
        : line.base;
  return round2(
    base + lineAddonsTotal(line) + lineEntornosTotal(line) + lineDurationTotal(line, durationAdj)
  );
}

export interface CartTotals {
  subtotal: number;
  total: number;
  savings: number;
  discount: number;
  count: number;
  hasPromo: boolean;
  durationAdjustment: number;
}

export function cartTotals(state: CartState, promoActive: boolean): CartTotals {
  const durationAdj = durationAdjustment(state.durationSec);
  let original = 0;
  let total = 0;
  let savings = 0;
  let hasPromo = false;
  for (const line of state.lines) {
    const before = lineOriginal(line, durationAdj);
    const now = lineTotal(line, promoActive, durationAdj);
    original += before;
    total += now;
    if (before > now) {
      savings += before - now;
      hasPromo = true;
    }
  }
  return {
    subtotal: round2(original),
    total: round2(Math.max(0, total)),
    savings: round2(savings),
    discount: round2(savings),
    count: state.lines.length,
    hasPromo,
    durationAdjustment: round2(
      state.lines.reduce((sum, l) => sum + lineDurationTotal(l, durationAdj), 0)
    ),
  };
}

export function formatDuration(seconds: number): string {
  const safe = Math.max(0, Math.round(seconds));
  const mm = Math.floor(safe / 60);
  const ss = safe % 60;
  return `${mm}:${String(ss).padStart(2, '0')}`;
}
