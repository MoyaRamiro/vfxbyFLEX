import { AUDIO_NOTE, MOODS, SENA, WHATSAPP_MODES } from '../config/order';
import { getBundle, getCategory, isBundleComplete } from '../data/catalog';
import type { CartLine, CartState } from './cart';
import { cartTotals, durationAdjustment, formatDuration, lineOriginal, lineTotal, money } from './pricing';

export function sanitizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

function bundleSummary(line: CartLine): string {
  const bundle = getBundle(line.categoryId, line.optionId);
  if (!bundle) return '';
  const selected = new Set(line.components ?? []);
  const chosen = bundle.filter((c) => selected.has(c.id));
  const labels = chosen.map((c) => c.label).join(', ');
  const complete = isBundleComplete(line.components, bundle);
  return complete ? ` (incluye: ${labels})` : ` (componentes: ${labels})`;
}

function formatLine(line: CartLine, state: CartState, promoActive: boolean): string {
  const categoryName = getCategory(line.categoryId)?.name ?? line.categoryId;
  const adj = durationAdjustment(state.durationSec);
  const price = lineTotal(line, promoActive, adj);
  const entornos = line.entornos ? ` (${line.entornos} entorno${line.entornos === 1 ? '' : 's'})` : '';
  const addons = line.addons && line.addons.length > 0 ? ` + ${line.addons.map((a) => a.label).join(', ')}` : '';
  let suffix = `— USD ${money(price)}`;
  if (line.promo && promoActive && !getBundle(line.categoryId, line.optionId)) {
    suffix += ` (30% OFF, antes USD ${money(lineOriginal(line, adj))})`;
  }
  return `• [${categoryName}] ${line.label}${entornos}${bundleSummary(line)}${addons} ${suffix}`;
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
  if (state.mode === 'receipt') {
    lines.push('📎 Adjuntá la captura o imagen del comprobante (HEIC, PNG o JPG) en este chat.');
  }
  lines.push('');
  lines.push(`💰 Subtotal: USD ${money(totals.subtotal)}`);
  if (totals.hasPromo) lines.push(`🟢 Ahorro 30% OFF: -USD ${money(totals.savings)}`);
  lines.push(`💵 TOTAL: USD ${money(totals.total)}`);

  return lines.join('\n');
}

// Short message for clients that only want to put down the fixed deposit.
export function buildSenaMessage(state: CartState, promoActive: boolean): string {
  const totals = cartTotals(state, promoActive);
  // La seña es fija (USD 20) salvo que el servicio sea más barato que la seña.
  const amount = SENA.amount === null ? 0 : Math.min(SENA.amount, totals.total);
  const lines: string[] = [];
  lines.push('🎬 Seña de reserva — vfxbyflex');
  if (state.customer.instagram.trim()) {
    lines.push(`📷 Instagram: @${state.customer.instagram.trim().replace(/^@/, '')}`);
  }
  lines.push('');
  lines.push(`💵 Seña fija: USD ${money(amount)}`);
  lines.push(`⏱️ Duración: ${formatDuration(state.durationSec)}`);
  lines.push(`💰 Total del pedido: USD ${money(totals.total)}`);
  lines.push('');
  lines.push('Quiero señar para reservar el cupo. El resto lo pago al finalizar.');
  return lines.join('\n');
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  return `https://wa.me/${sanitizePhone(phone)}?text=${encodeURIComponent(message)}`;
}
