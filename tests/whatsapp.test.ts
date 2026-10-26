import { describe, it, expect } from 'vitest';
import { buildMessage, buildSenaMessage } from '../src/lib/whatsapp';
import { emptyCart, toggleLine, setDuration, setComponents } from '../src/lib/cart';
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

  it('keeps totals coherent: Subtotal - Ahorro = Total', () => {
    let c = emptyCart();
    c = setDuration(c, 210);
    c = toggleLine(c, {
      key: 'visual:visual-tipo', categoryId: 'visual', groupId: 'visual-tipo',
      optionId: 'visual-25d-imagen', label: 'Visual 2.5D', base: 45, promo: true,
    }, true);
    c = toggleLine(c, {
      key: 'vfx:vfx-paquete', categoryId: 'vfx', groupId: 'vfx-paquete',
      optionId: 'vfx-full', label: 'VFX Full', base: 199, promo: true,
    }, true);

    const t = cartTotals(c, true);
    // Duration (3:30, +30) is charged once per product: 2 services → +60
    expect(t.durationAdjustment).toBe(60);
    expect(t.subtotal - t.savings).toBe(t.total);

    const msg = buildMessage(c, true);
    const num = (re: RegExp) => Number(msg.match(re)?.[1]?.replace(',', '.'));
    const sub = num(/Subtotal: USD ([\d.,]+)/);
    const save = num(/Ahorro 30% OFF: -USD ([\d.,]+)/);
    const total = num(/TOTAL: USD ([\d.,]+)/);
    // The duration line was removed from the message (now baked into prices)
    expect(msg).not.toContain('Ajuste por duración');
    expect(sub - save).toBe(total);
  });

  it('builds a seña-only message with 10% of the total', () => {
    let c = emptyCart();
    c = toggleLine(c, {
      key: 'visual:visual-tipo', categoryId: 'visual', groupId: 'visual-tipo',
      optionId: 'visual-25d-imagen', label: 'Visual 2.5D', base: 45, promo: true,
    }, true);
    const msg = buildSenaMessage(c, true);
    expect(msg).toContain('Seña (10%): USD 4,50');
    expect(msg).toContain('Total del pedido');
    expect(msg).not.toContain('Enviar pedido');
  });

  it('lists every chosen service and extra with its price in the seña message', () => {
    let c = emptyCart();
    c = toggleLine(c, {
      key: 'visual:visual-tipo', categoryId: 'visual', groupId: 'visual-tipo',
      optionId: 'visual-only-lyrics', label: 'Only Lyrics', base: 57,
    }, true);
    c = toggleLine(c, {
      key: 'extras:extras-servicios', categoryId: 'extras', groupId: 'extras-servicios',
      optionId: 'extra-reel', label: 'Reel', base: 3,
    }, true);
    const msg = buildSenaMessage(c, true);
    expect(msg).toContain('SERVICIOS:');
    expect(msg).toContain('[Visual] Only Lyrics - USD 57');
    expect(msg).toContain('EXTRAS:');
    expect(msg).toContain('[Extras] Reel - USD 3');
    expect(msg).toContain('Total del pedido: USD 60');
    expect(msg).toContain('Seña (10%): USD 6');
  });

  it('uses only safe ASCII markers: no emojis, em dashes or bullets', () => {
    let c = emptyCart();
    c = setDuration(c, 210);
    c = { ...c, mode: 'receipt', sena: true, customer: { ...c.customer, instagram: '@ddd', notes: 'Prueba' } };
    c = toggleLine(c, {
      key: 'vfx:vfx-paquete', categoryId: 'vfx', groupId: 'vfx-paquete',
      optionId: 'vfx-full', label: 'VFX Full', base: 199, promo: true,
    }, true);

    for (const msg of [buildMessage(c, true), buildSenaMessage(c, true), buildMessage(c, true, 'en'), buildSenaMessage(c, true, 'en')]) {
      expect([...msg].some((ch) => ch.codePointAt(0)! > 0xffff)).toBe(false);
      expect(msg).not.toContain('—');
      expect(msg).not.toContain('•');
      expect(msg).not.toContain('\uFFFD');
    }
  });

  it('warns to send the receipt by WhatsApp in receipt mode', () => {
    let c = emptyCart();
    c = { ...c, mode: 'receipt' };
    c = toggleLine(c, {
      key: 'visual:visual-tipo', categoryId: 'visual', groupId: 'visual-tipo',
      optionId: 'visual-25d-imagen', label: 'Visual 2.5D', base: 45, promo: true,
    }, true);
    const msg = buildMessage(c, true);
    expect(msg).toContain('Adjuntá la captura');
  });
});
