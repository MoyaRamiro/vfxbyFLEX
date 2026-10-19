import {
  CART_EVENT,
  type CartState,
  type CartLine,
  loadCart,
  saveCart,
  toggleLine,
  setDuration,
  setMood,
  setSena,
  setEntornos,
  isSelected,
  lineKey,
} from './cart';
import { getGroup, type CategoryId } from '../data/catalog';
import { durationAdjustment, formatDuration, money, promoOriginal } from './pricing';
import { promoActive } from './promo';
import { buildMessage, buildWhatsAppUrl } from './whatsapp';
import { SITE } from '../config/site';

function emit(state: CartState) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<CartState>(CART_EVENT, { detail: state }));
}

function setSelected(btn: HTMLButtonElement, selected: boolean, single: boolean) {
  if (single) btn.setAttribute('aria-checked', selected ? 'true' : 'false');
  else btn.setAttribute('aria-pressed', selected ? 'true' : 'false');
  btn.classList.toggle('bg-ink', selected);
  btn.classList.toggle('text-paper', selected);
  btn.classList.toggle('border-ink', selected);
}

function applyOptionPrices(active: boolean) {
  document.querySelectorAll<HTMLElement>('.option-now').forEach((el) => {
    const base = Number(el.dataset.price || 0);
    const promo = el.dataset.promo === '1';
    const shown = promo && !active ? promoOriginal(base) : base;
    el.textContent = `USD ${money(shown)}`;
  });
  document.querySelectorAll<HTMLElement>('.option-old').forEach((el) => {
    const row = el.closest('.option-btn') as HTMLElement | null;
    const promoEl = row?.querySelector<HTMLElement>('.option-now');
    const promo = promoEl?.dataset.promo === '1';
    const base = Number(promoEl?.dataset.price || 0);
    el.textContent = `USD ${money(promoOriginal(base))}`;
    el.style.display = promo && active ? '' : 'none';
  });
}

export function renderConfigurator(state: CartState) {
  const active = promoActive();

  document.querySelectorAll<HTMLElement>('.group').forEach((g) => {
    const when = g.dataset.showWhen;
    if (!when) return;
    const catId = g.closest<HTMLElement>('.cat-panel')?.dataset.panel as CategoryId | undefined;
    if (!catId) return;
    const shown = state.lines.some((l) => l.categoryId === catId && l.optionId === when);
    g.hidden = !shown;
  });

  document.querySelectorAll<HTMLButtonElement>('.option-btn').forEach((btn) => {
    const catId = btn.dataset.category as CategoryId | undefined;
    const groupId = btn.dataset.group || '';
    const optionId = btn.dataset.option || '';
    const single = btn.dataset.single === '1';
    if (!catId) return;
    setSelected(btn, isSelected(state, { categoryId: catId, groupId, optionId }), single);
  });

  const dur = document.getElementById('duration-slider') as HTMLInputElement | null;
  const val = document.getElementById('duration-value') as HTMLOutputElement | null;
  const adj = document.getElementById('duration-adjust') as HTMLElement | null;
  if (dur) dur.value = String(state.durationSec);
  if (val) val.textContent = formatDuration(state.durationSec);
  if (adj) {
    const a = durationAdjustment(state.durationSec);
    adj.textContent = a === 0 ? 'USD +0' : a > 0 ? `USD +${money(a)}` : `USD ${money(a)}`;
  }

  document.querySelectorAll<HTMLButtonElement>('.mood-btn').forEach((b) => {
    const sel = b.dataset.mood === state.mood;
    b.setAttribute('aria-checked', sel ? 'true' : 'false');
    b.classList.toggle('bg-ink', sel);
    b.classList.toggle('text-paper', sel);
    b.classList.toggle('border-ink', sel);
  });

  const senaEl = document.getElementById('sena-toggle') as HTMLInputElement | null;
  if (senaEl) senaEl.checked = state.sena;

  document.querySelectorAll<HTMLElement>('.cat-panel').forEach((panel) => {
    const catId = panel.dataset.panel as CategoryId | undefined;
    const select = panel.querySelector<HTMLSelectElement>('.entornos-select');
    if (!catId || !select) return;
    const line = state.lines.find((l) => l.categoryId === catId);
    select.value = String(line?.entornos ?? Number(select.dataset.default || select.value));
  });

  applyOptionPrices(active);

  const wa = document.getElementById('wa-cta') as HTMLAnchorElement | null;
  if (wa) wa.href = buildWhatsAppUrl(SITE.whatsapp, buildMessage(state, active));
}

export function initConfigurator() {
  let state = loadCart();
  renderConfigurator(state);
  saveCart(state);
  emit(state);

  window.addEventListener(CART_EVENT, (e) => {
    state = (e as CustomEvent<CartState>).detail;
    renderConfigurator(state);
  });

  document.querySelectorAll<HTMLButtonElement>('.cat-tab').forEach((t) => {
    t.addEventListener('click', () => {
      document.querySelectorAll<HTMLButtonElement>('.cat-tab').forEach((x) => x.setAttribute('aria-selected', 'false'));
      document.querySelectorAll<HTMLElement>('.cat-panel').forEach((p) => (p.hidden = true));
      t.setAttribute('aria-selected', 'true');
      const cat = t.dataset.category;
      if (cat) {
        const panel = document.getElementById(`panel-${cat}`);
        if (panel) panel.hidden = false;
      }
    });
  });

  document.querySelectorAll<HTMLButtonElement>('.option-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const catId = btn.dataset.category as CategoryId | undefined;
      const groupId = btn.dataset.group || '';
      const optionId = btn.dataset.option || '';
      if (!catId) return;
      const group = getGroup(catId, groupId);
      if (!group) return;
      const single = group.kind === 'single';
      const line: CartLine = {
        key: lineKey(catId, groupId, optionId, group.kind),
        categoryId: catId,
        groupId,
        optionId,
        label: btn.dataset.label || '',
        base: Number(btn.dataset.price || 0),
        promo: btn.dataset.promo === '1',
      };
      state = toggleLine(state, line, single);

      const panel = btn.closest<HTMLElement>('.cat-panel');
      const select = panel?.querySelector<HTMLSelectElement>('.entornos-select');
      if (select && isSelected(state, { categoryId: catId, groupId, optionId })) {
        const count = Number(select.value);
        state = setEntornos(state, line.key, count, count > 0 ? 10 : 0);
      }
      persist();
    });
  });

  document.querySelectorAll<HTMLSelectElement>('.entornos-select').forEach((sel) => {
    sel.addEventListener('change', () => {
      const catId = sel.closest<HTMLElement>('.cat-panel')?.dataset.panel as CategoryId | undefined;
      if (!catId) return;
      const line = state.lines.find((l) => l.categoryId === catId);
      if (!line) return;
      const count = Number(sel.value);
      state = setEntornos(state, line.key, count, count > 0 ? 10 : 0);
      persist();
    });
  });

  const dur = document.getElementById('duration-slider') as HTMLInputElement | null;
  dur?.addEventListener('input', () => {
    state = setDuration(state, Number(dur.value));
    persist();
  });

  document.querySelectorAll<HTMLButtonElement>('.mood-btn').forEach((b) => {
    b.addEventListener('click', () => {
      state = setMood(state, b.dataset.mood || null);
      persist();
    });
  });

  const senaEl = document.getElementById('sena-toggle') as HTMLInputElement | null;
  senaEl?.addEventListener('change', () => {
    state = setSena(state, senaEl.checked);
    persist();
  });

  const modal = document.getElementById('preview-modal');
  const title = document.getElementById('preview-title');
  const body = document.getElementById('preview-body');
  document.querySelectorAll<HTMLButtonElement>('.preview-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!modal || !title || !body) return;
      const src = btn.dataset.preview || '';
      title.textContent = btn.dataset.title || '';
      body.innerHTML = src
        ? `<img src="${src}" alt="" class="w-full h-full object-cover" />`
        : '<span class="text-muted text-sm">Sin previsualización disponible.</span>';
      modal.classList.remove('hidden');
    });
  });
  const closePreview = () => modal?.classList.add('hidden');
  document.getElementById('preview-close')?.addEventListener('click', closePreview);
  document.getElementById('preview-backdrop')?.addEventListener('click', closePreview);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePreview();
  });

  function persist() {
    saveCart(state);
    renderConfigurator(state);
    emit(state);
  }
}