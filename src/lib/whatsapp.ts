import { AUDIO_NOTE, WHATSAPP_MODES } from '../config/order';
import { getBundle, getCategory, isBundleComplete, CATEGORIES } from '../data/catalog';
import type { CartLine, CartState } from './cart';
import { cartTotals, durationAdjustment, formatDuration, lineOriginal, lineTotal, money, senaAmount } from './pricing';
import { localizeCatalog, localizeMoods } from '../i18n/labels';
import { defaultLang, ui, type Lang } from '../i18n/utils';

export function sanitizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

function fill(template: string, values: Record<string, string>): string {
  return Object.entries(values).reduce((acc, [key, value]) => acc.replaceAll(`{${key}}`, value), template);
}

function bundleSummary(line: CartLine, lang: Lang): string {
  const bundle = getBundle(line.categoryId, line.optionId);
  if (!bundle) return '';
  const local = localizeCatalog(lang, CATEGORIES)
    .flatMap((c) => c.groups)
    .flatMap((g) => g.options)
    .find((o) => o.id === line.optionId);
  const labelsById = new Map((local?.bundle ?? bundle).map((c) => [c.id, c.label]));
  const selected = new Set(line.components ?? []);
  const chosen = bundle.filter((c) => selected.has(c.id));
  const labels = chosen.map((c) => labelsById.get(c.id) ?? c.label).join(', ');
  const t = ui[lang];
  const complete = isBundleComplete(line.components, bundle);
  return complete ? fill(t.waIncluded, { list: labels }) : fill(t.waComponents, { list: labels });
}

function formatLine(line: CartLine, state: CartState, promoActive: boolean, lang: Lang): string {
  const localCats = localizeCatalog(lang, CATEGORIES);
  const categoryName = localCats.find((c) => c.id === line.categoryId)?.name ?? getCategory(line.categoryId)?.name ?? line.categoryId;
  const localLabel =
    localCats
      .flatMap((c) => c.groups)
      .flatMap((g) => g.options)
      .find((o) => o.id === line.optionId)?.label ?? line.label;
  const adj = durationAdjustment(state.durationSec);
  const price = lineTotal(line, promoActive, adj);
  const t = ui[lang];
  const entornos = line.entornos
    ? fill(line.entornos === 1 ? t.waEnvOne : t.waEnvMany, { count: String(line.entornos) })
    : '';
  const addons = line.addons && line.addons.length > 0 ? ` + ${line.addons.map((a) => a.label).join(', ')}` : '';
  let suffix = `— USD ${money(price)}`;
  if (line.promo && promoActive && !getBundle(line.categoryId, line.optionId)) {
    suffix += fill(t.waBefore, { amount: money(lineOriginal(line, adj, promoActive)) });
  }
  return `• [${categoryName}] ${localLabel}${entornos}${bundleSummary(line, lang)}${addons} ${suffix}`;
}

export function buildMessage(state: CartState, promoActive: boolean, lang: Lang = defaultLang): string {
  const t = ui[lang];
  const localMoods = localizeMoods(lang);
  const services = state.lines.filter((l) => l.categoryId !== 'extras');
  const extras = state.lines.filter((l) => l.categoryId === 'extras');
  const totals = cartTotals(state, promoActive);
  const mood = localMoods.find((m) => m.id === state.mood);

  const lines: string[] = [];
  lines.push(t.waTitle);
  if (state.customer.instagram.trim()) {
    lines.push(fill(t.waInstagram, { handle: state.customer.instagram.trim().replace(/^@/, '') }));
  }
  lines.push('');
  lines.push(fill(t.waDuration, { value: formatDuration(state.durationSec) }));
  if (mood) lines.push(fill(t.waMood, { value: mood.label }));

  if (services.length > 0) {
    lines.push('');
    lines.push(t.waServices);
    for (const l of services) lines.push(formatLine(l, state, promoActive, lang));
  }
  if (extras.length > 0) {
    lines.push('');
    lines.push(t.waExtras);
    for (const l of extras) lines.push(formatLine(l, state, promoActive, lang));
  }

  if (state.sena) {
    lines.push('');
    lines.push(t.waSena);
  }

  if (state.customer.notes.trim()) {
    lines.push('');
    lines.push(t.waNotes);
    lines.push(`"${state.customer.notes.trim()}"`);
  }

  lines.push('');
  lines.push(fill(t.waSong, { note: lang === 'en' ? 'WAV master preferred.' : AUDIO_NOTE }));
  lines.push(`💬 ${t[WHATSAPP_MODES[state.mode].introKey]}`);
  if (state.mode === 'receipt') {
    lines.push(t.waReceipt);
  }
  lines.push('');
  lines.push(fill(t.waSubtotal, { amount: money(totals.subtotal) }));
  if (totals.hasPromo) lines.push(fill(t.waSavings, { amount: money(totals.savings) }));
  lines.push(fill(t.waTotal, { amount: money(totals.total) }));

  return lines.join('\n');
}

// Short message for clients that only want to pay the deposit (10% of the total).
export function buildSenaMessage(state: CartState, promoActive: boolean, lang: Lang = defaultLang): string {
  const t = ui[lang];
  const totals = cartTotals(state, promoActive);
  const amount = senaAmount(totals.total);
  const lines: string[] = [];
  lines.push(t.waDepositTitle);
  if (state.customer.instagram.trim()) {
    lines.push(fill(t.waInstagram, { handle: state.customer.instagram.trim().replace(/^@/, '') }));
  }
  lines.push('');
  lines.push(fill(t.waDepositAmount, { amount: money(amount) }));
  lines.push(fill(t.waDuration, { value: formatDuration(state.durationSec) }));
  lines.push(fill(t.waOrderTotal, { amount: money(totals.total) }));
  lines.push('');
  lines.push(t.waReserve);
  return lines.join('\n');
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  return `https://wa.me/${sanitizePhone(phone)}?text=${encodeURIComponent(message)}`;
}
