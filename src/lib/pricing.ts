import { DURATION, PROMO } from '../config/order';
import { isExtra } from '../data/catalog';
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

// The "antes" / list price (inflated original for promo items). Excludes the
// order-level duration adjustment, which is charged once (see cartTotals).
export function lineOriginal(line: CartLine): number {
  const base = line.promo ? promoOriginal(line.base) : line.base;
  return round2(base + lineAddonsTotal(line) + lineEntornosTotal(line));
}

// Charged price of a single line, excluding the order-level duration adjustment.
export function lineTotal(line: CartLine, promoActive: boolean): number {
  // While the promo is live, promo items charge the discounted base; once it
  // expires they fall back to the inflated original.
  const unit = line.promo && !promoActive ? promoOriginal(line.base) : line.base;
  return Math.max(0, round2(unit + lineAddonsTotal(line) + lineEntornosTotal(line)));
}

// Duration is charged once for the whole order (only when it has editing services).
export function orderDurationAdjustment(state: CartState): number {
  const hasService = state.lines.some((l) => !isExtra(l.categoryId));
  return hasService ? durationAdjustment(state.durationSec) : 0;
}

export interface CartTotals {
  subtotal: number;
  durationAdjustment: number;
  discount: number;
  total: number;
  savings: number;
  count: number;
  hasPromo: boolean;
}

export function cartTotals(state: CartState, promoActive: boolean): CartTotals {
  let original = 0;
  let total = 0;
  let discount = 0;
  let hasPromo = false;
  for (const line of state.lines) {
    original += lineOriginal(line);
    total += lineTotal(line, promoActive);
    if (line.promo && promoActive && line.base > 0) {
      discount += promoOriginal(line.base) - line.base;
      hasPromo = true;
    }
  }
  const adjustment = orderDurationAdjustment(state);
  return {
    subtotal: round2(original),
    durationAdjustment: round2(adjustment),
    discount: round2(discount),
    total: round2(Math.max(0, total + adjustment)),
    savings: round2(discount),
    count: state.lines.length,
    hasPromo,
  };
}

export function formatDuration(seconds: number): string {
  const safe = Math.max(0, Math.round(seconds));
  const mm = Math.floor(safe / 60);
  const ss = safe % 60;
  return `${mm}:${String(ss).padStart(2, '0')}`;
}