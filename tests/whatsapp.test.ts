import { describe, it, expect } from 'vitest';
import { buildMessage } from '../src/lib/whatsapp';
import { emptyCart, toggleLine, setDuration } from '../src/lib/cart';
import { cartTotals } from '../src/lib/pricing';

describe('whatsapp', () => {
  it('includes 30% savings when promo active', () => {
    let c = emptyCart();
    const line = { key: 'visual:v1', categoryId: 'visual' as any, groupId: 'v1g', optionId: 'a', label: 'Visual 2.5D', base: 45, promo: true };
    c = toggleLine(c, line, true);
    const msg = buildMessage(c, true);
    expect(msg).toContain('30% OFF');
    expect(msg).toContain('TOTAL');
  });

  it('shows chat mode intro by default', () => {
    const msg = buildMessage(emptyCart(), false);
    expect(msg).toContain('vfxbyflex');
  });

  it('keeps totals coherent: Subtotal + Duración - Ahorro = Total', () => {
    let c = emptyCart();
    c = setDuration(c, 210);
    c = toggleLine(c, {
      key: 'visual:visual-tipo', categoryId: 'visual', groupId: 'visual-tipo',
      optionId: 'visual-25d-imagen', label: 'Visual 2.5D', base: 45, promo: true,
    }, true);
    c = toggleLine(c, {
      key: 'vfx:vfx-full-camaras', categoryId: 'vfx', groupId: 'vfx-complementos-full',
      optionId: 'vfx-full-camaras', label: 'Cámaras lentas', base: 15, promo: false,
    }, false);

    const t = cartTotals(c, true);
    // Duration (3:30) charged once: +30
    expect(t.durationAdjustment).toBe(30);
    expect(t.subtotal + t.durationAdjustment - t.savings).toBe(t.total);

    const msg = buildMessage(c, true);
    const num = (re: RegExp) => Number(msg.match(re)?.[1]?.replace(',', '.'));
    const sub = num(/Subtotal: USD ([\d.,]+)/);
    const save = num(/Ahorro 30% OFF: -USD ([\d.,]+)/);
    const total = num(/TOTAL: USD ([\d.,]+)/);
    const adjLine = msg.match(/Ajuste por duración \([^)]+\): ([+-])USD ([\d.,]+)/);
    const adj = adjLine ? (adjLine[1] === '-' ? -1 : 1) * Number(adjLine[2].replace(',', '.')) : 0;
    expect(sub + adj - save).toBe(total);
  });
});