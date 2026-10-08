import type { CartItem, CustomerInfo } from './cart';

export function sanitizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function buildMessage({
  items,
  customer,
}: {
  items: CartItem[];
  customer: CustomerInfo;
}): string {
  const services = items.filter((i) => i.serviceId !== 'extras');
  const extras = items.filter((i) => i.serviceId === 'extras');
  const sum = items.reduce((acc, i) => acc + i.price, 0);

  const lines: string[] = [];
  lines.push('🎬 Pedido de VFX — vfxbyflex');
  lines.push(`👤 Nombre: ${customer.name.trim() || '—'}`);
  if (customer.instagram.trim()) {
    lines.push(`📷 Instagram: @${customer.instagram.trim().replace(/^@/, '')}`);
  }

  if (services.length > 0) {
    lines.push('');
    lines.push('SERVICIOS:');
    for (const i of services) lines.push(`• ${i.label} — USD ${i.price}`);
  }

  if (extras.length > 0) {
    lines.push('');
    lines.push('EXTRAS:');
    for (const i of extras) lines.push(`• ${i.label} — USD ${i.price}`);
  }

  if (customer.notes.trim()) {
    lines.push('');
    lines.push('📝 NOTAS:');
    lines.push(`"${customer.notes.trim()}"`);
  }

  lines.push('');
  lines.push('🎵 Canción: enviá el MP3 por este chat.');
  lines.push('');
  lines.push(`💰 TOTAL: USD ${sum}`);

  return lines.join('\n');
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  return `https://wa.me/${sanitizePhone(phone)}?text=${encodeURIComponent(message)}`;
}
