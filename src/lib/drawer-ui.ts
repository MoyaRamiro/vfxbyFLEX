import {
  addItem,
  buildCromaItem,
  dispatchCartChange,
  loadCart,
  removeItem,
  saveCart,
  updateCustomer,
  CART_EVENT,
  type CartState,
} from './cart';
import { SITE } from '../config/site';
import { CROMA_ENTORNOS_OPTIONS } from '../data/services';
import { buildMessage, buildWhatsAppUrl } from './whatsapp';

let lastTrigger: HTMLElement | null = null;
let renderedKey = '';

function escapeHtml(value: unknown): string {
  return String(value).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string)
  );
}

function setBackgroundInert(on: boolean): void {
  ['main', 'footer'].forEach((sel) => {
    const el = document.querySelector(sel);
    if (!el) return;
    if (on) el.setAttribute('inert', '');
    else el.removeAttribute('inert');
  });
}

function els() {
  return {
    button: document.getElementById('cart-button')!,
    badge: document.getElementById('cart-badge')!,
    overlay: document.getElementById('cart-overlay')!,
    drawer: document.getElementById('cart-drawer')!,
    close: document.getElementById('cart-close')!,
    list: document.getElementById('cart-items')!,
    empty: document.getElementById('cart-empty')!,
    total: document.getElementById('cart-total')!,
    name: document.getElementById('cart-name') as HTMLInputElement,
    instagram: document.getElementById('cart-instagram') as HTMLInputElement,
    notes: document.getElementById('cart-notes') as HTMLTextAreaElement,
    submit: document.getElementById('cart-submit') as HTMLAnchorElement,
  };
}

function animateTotal(from: number, to: number): void {
  const el = els().total;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || from === to) {
    el.textContent = `USD ${to}`;
    return;
  }
  const start = performance.now();
  const dur = 400;
  function frame(now: number): void {
    const p = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = `USD ${Math.round(from + (to - from) * eased)}`;
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function renderItems(state: CartState): void {
  const e = els();
  const key = JSON.stringify(state.items);
  if (key === renderedKey) return;
  const prevTotal = Number(e.total.textContent?.replace(/\D/g, '') ?? 0);
  const prevCount = Number(e.badge.textContent) || 0;

  e.list.innerHTML = state.items
    .map((i) => {
      const meta = (i.meta ?? {}) as { entornos?: number; nivel?: 'pro' | 'full' };
      const entornos = meta.entornos ?? 2;
      const nivel = meta.nivel ?? 'pro';
      const editor =
        i.serviceId === 'croma' || i.key === 'croma'
          ? `
        <div class="drawer-croma flex flex-col gap-2 mt-2" data-key="croma">
          <label class="text-xs font-medium">Entornos
            <select name="croma-entornos" aria-label="Entornos del croma" class="drawer-croma-entornos border-2 border-ink px-2 py-1 bg-paper text-sm">
              ${CROMA_ENTORNOS_OPTIONS.map((n) => `<option value="${n}"${n === entornos ? ' selected' : ''}>${n}</option>`).join('')}
            </select>
          </label>
          <div class="flex gap-2 text-xs" role="radiogroup" aria-label="Nivel de VFX del croma">
            <button type="button" class="drawer-croma-nivel border-2 px-2 py-1 font-bold${nivel !== 'full' ? ' border-ink bg-ink text-paper' : ' border-ink/20'}" data-nivel="pro" role="radio" aria-checked="${nivel !== 'full'}">Pro</button>
            <button type="button" class="drawer-croma-nivel border-2 px-2 py-1 font-bold${nivel === 'full' ? ' border-ink bg-ink text-paper' : ' border-ink/20'}" data-nivel="full" role="radio" aria-checked="${nivel === 'full'}">Full (+25)</button>
          </div>
        </div>`
          : '';
      return `
      <li class="border-2 border-ink/20 px-4 py-3">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="font-bold">${escapeHtml(i.label)}</p>
            <p class="font-mono text-sm text-muted">USD ${i.price}</p>
          </div>
          <button type="button" class="cart-remove border-2 border-ink w-8 h-8 text-sm hover:bg-ink hover:text-paper transition-colors" data-key="${escapeHtml(i.key)}" aria-label="Quitar ${escapeHtml(i.label)}">✕</button>
        </div>
        ${editor}
      </li>`;
    })
    .join('');

  e.empty.hidden = state.items.length > 0;
  e.badge.textContent = String(state.items.length);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (state.items.length > prevCount && !reduce) {
    e.badge.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.35)' }, { transform: 'scale(1)' }],
      { duration: 300, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
    );
  }
  const sum = state.items.reduce((a, i) => a + i.price, 0);
  animateTotal(prevTotal, sum);

  e.list.querySelectorAll<HTMLButtonElement>('.cart-remove').forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = removeItem(loadCart(), btn.dataset.key!);
      saveCart(next);
      dispatchCartChange(next);
    });
  });

  e.list.querySelectorAll<HTMLElement>('.drawer-croma').forEach((row) => {
    const select = row.querySelector<HTMLSelectElement>('.drawer-croma-entornos');
    const nivelButtons = row.querySelectorAll<HTMLButtonElement>('.drawer-croma-nivel');
    if (!select) return;
    const commitCroma = (nivel: 'pro' | 'full'): void => {
      const next = addItem(loadCart(), buildCromaItem(Number(select.value), nivel));
      saveCart(next);
      dispatchCartChange(next);
    };
    select.addEventListener('change', () => {
      const active = Array.from(nivelButtons).find((b) => b.classList.contains('bg-ink'));
      commitCroma((active?.dataset.nivel as 'pro' | 'full') ?? 'pro');
    });
    nivelButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        commitCroma(btn.dataset.nivel as 'pro' | 'full');
      });
    });
  });

  renderedKey = key;
}

function syncCustomer(state: CartState): void {
  const e = els();
  if (document.activeElement !== e.name) e.name.value = state.customer.name;
  if (document.activeElement !== e.instagram) e.instagram.value = state.customer.instagram;
  if (document.activeElement !== e.notes) e.notes.value = state.customer.notes;
}

function syncSubmit(state: CartState): void {
  els().submit.href = buildWhatsAppUrl(SITE.whatsapp, buildMessage(state));
  els().submit.classList.toggle('pointer-events-none', state.items.length === 0);
  els().submit.classList.toggle('opacity-40', state.items.length === 0);
  if (state.items.length === 0) els().submit.setAttribute('aria-disabled', 'true');
  else els().submit.removeAttribute('aria-disabled');
}

export function syncDrawer(state: CartState): void {
  renderItems(state);
  syncCustomer(state);
  syncSubmit(state);
}

function openDrawer(): void {
  const e = els();
  lastTrigger = document.activeElement as HTMLElement;
  e.drawer.classList.remove('translate-x-full');
  e.drawer.removeAttribute('inert');
  e.drawer.setAttribute('aria-hidden', 'false');
  e.overlay.classList.remove('opacity-0', 'pointer-events-none');
  setBackgroundInert(true);
  e.close.focus();
  document.body.style.overflow = 'hidden';
}

function closeDrawer(): void {
  const e = els();
  e.drawer.classList.add('translate-x-full');
  e.drawer.setAttribute('inert', '');
  e.drawer.setAttribute('aria-hidden', 'true');
  e.overlay.classList.add('opacity-0', 'pointer-events-none');
  setBackgroundInert(false);
  document.body.style.overflow = '';
  lastTrigger?.focus();
}

function trapFocus(ev: KeyboardEvent): void {
  if (ev.key !== 'Tab') return;
  const e = els();
  if (e.drawer.classList.contains('translate-x-full')) return;
  const focusables = e.drawer.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])'
  );
  if (focusables.length === 0) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (ev.shiftKey && document.activeElement === first) {
    ev.preventDefault();
    last.focus();
  } else if (!ev.shiftKey && document.activeElement === last) {
    ev.preventDefault();
    first.focus();
  }
}

export function initDrawer(): void {
  const e = els();
  syncDrawer(loadCart());

  e.button.addEventListener('click', openDrawer);
  e.close.addEventListener('click', closeDrawer);
  e.overlay.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') closeDrawer();
    trapFocus(ev);
  });

  const customerFields: Array<[HTMLInputElement | HTMLTextAreaElement, 'name' | 'instagram' | 'notes']> = [
    [e.name, 'name'],
    [e.instagram, 'instagram'],
    [e.notes, 'notes'],
  ];
  customerFields.forEach(([el, field]) => {
    el.addEventListener('input', () => {
      const next = updateCustomer(loadCart(), { [field]: el.value });
      saveCart(next);
      dispatchCartChange(next);
    });
  });

  window.addEventListener(CART_EVENT, ((ev: CustomEvent<CartState>) => {
    syncDrawer(ev.detail);
  }) as EventListener);
}
