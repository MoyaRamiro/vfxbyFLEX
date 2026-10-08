import { describe, expect, it } from 'vitest';
import { buildMessage, buildWhatsAppUrl, sanitizePhone } from '../src/lib/whatsapp';
import type { CartItem, CustomerInfo } from '../src/lib/cart';

const customer: CustomerInfo = { name: 'Juan', instagram: 'juanbeats', notes: 'todo en rojo' };

const items: CartItem[] = [
  { key: 'visualizer', serviceId: 'visualizer', label: 'Visualizer Full', price: 30 },
  { key: 'croma', serviceId: 'croma', label: 'Croma (3 entornos, VFX Full)', price: 75 },
  { key: 'montaje', serviceId: 'montaje', label: 'Montaje', price: 15 },
  { key: 'reel-2', serviceId: 'extras', label: '2 Reels', price: 17 },
];

describe('buildMessage', () => {
  it('formats services, extras, notes and total', () => {
    const msg = buildMessage({ items, customer });
    expect(msg).toContain('🎬 Pedido de VFX — vfxbyflex');
    expect(msg).toContain('👤 Nombre: Juan');
    expect(msg).toContain('📷 Instagram: @juanbeats');
    expect(msg).toContain('SERVICIOS:');
    expect(msg).toContain('• Visualizer Full — USD 30');
    expect(msg).toContain('• Croma (3 entornos, VFX Full) — USD 75');
    expect(msg).toContain('• Montaje — USD 15');
    expect(msg).toContain('EXTRAS:');
    expect(msg).toContain('• 2 Reels — USD 17');
    expect(msg).toContain('📝 NOTAS:');
    expect(msg).toContain('"todo en rojo"');
    expect(msg).toContain('🎵 Canción: enviá el MP3 por este chat.');
    expect(msg).toContain('💰 TOTAL: USD 137');
  });

  it('omits extras and notes sections when empty', () => {
    const msg = buildMessage({
      items: [items[0]],
      customer: { name: 'Ana', instagram: '', notes: '' },
    });
    expect(msg).not.toContain('EXTRAS:');
    expect(msg).not.toContain('📝 NOTAS:');
    expect(msg).not.toContain('📷 Instagram:');
    expect(msg).toContain('👤 Nombre: Ana');
  });

  it('uses — when name is empty', () => {
    const msg = buildMessage({ items: [items[0]], customer: { name: '', instagram: '', notes: '' } });
    expect(msg).toContain('👤 Nombre: —');
  });
});

describe('buildWhatsAppUrl', () => {
  it('builds wa.me link with encoded message', () => {
    const url = buildWhatsAppUrl('5493794270276', 'hola\nmundo');
    expect(url).toBe('https://wa.me/5493794270276?text=hola%0Amundo');
  });
});

describe('sanitizePhone', () => {
  it('strips spaces, dashes and plus', () => {
    expect(sanitizePhone('+54 9 3794 27-0276')).toBe('5493794270276');
  });
});
