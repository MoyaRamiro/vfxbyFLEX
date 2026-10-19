import { AUDIO_NOTE, MOODS, WHATSAPP_MODES } from '../config/order';
import { getCategory } from '../data/catalog';
import type { CartLine, CartState } from './cart';
import { cartTotals, formatDuration, lineOriginal, lineTotal, money } from './pricing';

export function sanitizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

function formatLine(line: CartLine, state: CartState, promoActive: boolean): string {
  const categoryName = getCategory(line.categoryId)?.name ?? line.categoryId;
  const price = lineTotal(line, promoActive);
  const entornos = line.entornos ? ` (${line.entornos} entorno${line.entornos === 1 ? '' : 's'})` : '';
  const addons = line.addons && line.addons.length > 0 ? ` + ${line.addons.map((a) => a.label).join(', ')}` : '';
  let suffix = `— USD ${money(price)}`;
  if (line.promo && promoActive) {
    suffix += ` (30% OFF, antes USD ${money(lineOriginal(line))})`;
  }
  return `• [${categoryName}] ${line.label}${entornos}${addons} ${suffix}`;
}

export function buildMessage(state: CartState, promoActive: boolean): string {
  const services = state.lines.filter((l) => l.categoryId !== 'extras');
  const extras = state.lines.filter((l) => l.categoryId === 'extras');
  const totals = cartTotals(state, promoActive);
  const mood = MOODS.find((m) => m.id === state.mood);

  const lines: string[] = [];
  lines.push('🎬 Pedido de VFX — vfxbyflex');
  if (state.customer.instagram.trim()) {
    lines.push(`📷 Instagram: @${state.customer.instagram.trim().replace(/^@/, '')}`);
  }
  lines.push('');
  lines.push(`⏱️ Duración: ${formatDuration(state.durationSec)}`);
  if (mood) lines.push(`🎚️ Mood: ${mood.label}`);

  if (services.length > 0) {
    lines.push('');
    lines.push('SERVICIOS:');
    for (const l of services) lines.push(formatLine(l, state, promoActive));
  }
  if (extras.length > 0) {
    lines.push('');
    lines.push('EXTRAS:');
    for (const l of extras) lines.push(formatLine(l, state, promoActive));
  }

  if (state.sena) {
    lines.push('');
    lines.push('💾 Seña: quiero reservar cupo.');
  }

  if (state.customer.notes.trim()) {
    lines.push('');
    lines.push('📝 NOTAS:');
    lines.push(`"${state.customer.notes.trim()}"`);
  }

  lines.push('');
  lines.push(`🎵 Canción: enviá el MP3 por este chat. ${AUDIO_NOTE}`);
  lines.push(`💬 ${WHATSAPP_MODES[state.mode].intro}`);
  lines.push('');
  lines.push(`💰 Subtotal: USD ${money(totals.subtotal)}`);
  if (totals.durationAdjustment !== 0) {
    const adj = totals.durationAdjustment;
    const sign = adj > 0 ? '+' : '-';
    lines.push(`⏱️ Ajuste por duración (${formatDuration(state.durationSec)}): ${sign}USD ${money(Math.abs(adj))}`);
  }
  if (totals.hasPromo) lines.push(`🟢 Ahorro 30% OFF: -USD ${money(totals.savings)}`);
  lines.push(`💵 TOTAL: USD ${money(totals.total)}`);

  return lines.join('\n');
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  return `https://wa.me/${sanitizePhone(phone)}?text=${encodeURIComponent(message)}`;
}