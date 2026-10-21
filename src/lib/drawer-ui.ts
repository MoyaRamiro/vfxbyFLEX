import {
  CART_EVENT,
  type CartState,
  emptyCart,
  loadCart,
  saveCart,
  removeLine,
  setMode,
  updateCustomer,
} from './cart';
import { cartTotals, durationAdjustment, formatDuration, lineTotal, money, senaAmount } from './pricing';
import { promoActive } from './promo';
import { buildMessage, buildSenaMessage, buildWhatsAppUrl } from './whatsapp';
import { SITE } from '../config/site';
import { getBundle, getCategory } from '../data/catalog';
import { SENA, type WhatsAppMode } from '../config/order';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&#34;')
    .replace(/'/g, '&#39;');
}

export function initDrawer() {
  const store: { state: CartState } = { state: loadCart() };
  const $ = (id: string) => document.getElementById(id);

  const drawer = $('cart-drawer');
  const backdrop = $('cart-backdrop');
  const fab = document.querySelector<HTMLElement>('.cart-fab');
  let lastCount = -1;

  const bumpFab = () => {
    if (!fab) return;
    fab.classList.remove('cart-bump');
    void fab.offsetWidth;
    fab.classList.add('cart-bump');
  };
  fab?.addEventListener('animationend', () => fab.classList.remove('cart-bump'));

  const open = () => {
    drawer?.classList.remove('translate-x-full', 'pointer-events-none');
    drawer?.setAttribute('aria-hidden', 'false');
    backdrop?.classList.remove('opacity-0', 'pointer-events-none');
    fab?.classList.add('opacity-0', 'pointer-events-none');
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    drawer?.classList.add('translate-x-full', 'pointer-events-none');
    drawer?.setAttribute('aria-hidden', 'true');
    backdrop?.classList.add('opacity-0', 'pointer-events-none');
    fab?.classList.remove('opacity-0', 'pointer-events-none');
    document.body.style.overflow = '';
  };
  const persist = () => {
    saveCart(store.state);
    render();
    window.dispatchEvent(new CustomEvent<CartState>(CART_EVENT, { detail: store.state }));
  };

  const render = () => {
    const state = store.state;
    const active = promoActive();
    const totals = cartTotals(state, active);

    const panel = $('cart-items');
    if (panel) {
      if (state.lines.length === 0) {
        panel.innerHTML = '<p class="text-sm text-muted">Tu carrito está vacío. Elegí servicios en el configurador.</p>';
      } else {
        panel.innerHTML = state.lines
          .map((line) => {
            const cat = getCategory(line.categoryId);
            const price = lineTotal(line, active, durationAdjustment(state.durationSec));
            const promoTag = line.promo && active ? ' <span class="text-green-700 font-mono">-30%</span>' : '';
            const entornos = line.entornos ? ` · ${line.entornos} entorno${line.entornos === 1 ? '' : 's'}` : '';
            const bundle = getBundle(line.categoryId, line.optionId);
            let detail = '';
            if (bundle) {
              const total = bundle.length;
              const chosen = line.components?.length ?? 0;
              detail =
                chosen < total
                  ? ` · ${chosen}/${total} componentes`
                  : ' · todos los componentes';
            } else if (line.addons && line.addons.length) {
              detail = ` + ${line.addons.map((a) => escapeHtml(a.label)).join(', ')}`;
            }
            return `<div class="flex items-center justify-between gap-3 border-2 border-ink/20 p-3">
              <div class="min-w-0">
                <p class="font-bold truncate">${escapeHtml(line.label)}</p>
                <p class="text-xs text-muted">${escapeHtml(cat?.name ?? line.categoryId)}${entornos}${detail}${promoTag}</p>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <span class="font-mono">USD ${money(price)}</span>
                <button type="button" class="remove-line border-2 border-ink/30 w-8 h-8 font-bold hover:bg-ink hover:text-paper transition-colors" data-key="${escapeHtml(line.key)}" aria-label="Quitar">✕</button>
              </div>
            </div>`;
          })
          .join('');
      }
      panel.querySelectorAll<HTMLButtonElement>('.remove-line').forEach((b) => {
        b.addEventListener('click', () => {
          store.state = removeLine(store.state, b.dataset.key || '');
          persist();
        });
      });
    }

    const setText = (id: string, text: string) => {
      const el = $(id);
      if (el) el.textContent = text;
    };
    setText('cart-subtotal', `USD ${money(totals.subtotal)}`);
    setText('cart-discount', totals.hasPromo ? `-USD ${money(totals.savings)}` : '—');
    setText('cart-total', `USD ${money(totals.total)}`);

    const receiptHint = $('receipt-hint');
    if (receiptHint) receiptHint.classList.toggle('hidden', state.mode !== 'receipt');

    const senaBtn = $('cart-sena') as HTMLButtonElement | null;
    if (senaBtn) {
      const disabled = state.lines.length === 0 || !SENA.enabled;
      senaBtn.disabled = disabled;
      senaBtn.classList.toggle('opacity-40', disabled);
      senaBtn.classList.toggle('pointer-events-none', disabled);
      // La seña es el 10% del total del pedido.
      if (SENA.rate !== null) {
        senaBtn.textContent = disabled
          ? `Señar · ${Math.round(SENA.rate * 100)}%`
          : `Señar · USD ${money(senaAmount(totals.total))}`;
      }
    }

    document.querySelectorAll<HTMLElement>('[data-cart-count]').forEach((el) => {
      el.textContent = String(totals.count);
    });
    document.querySelectorAll<HTMLElement>('[data-cart-total]').forEach((el) => {
      el.textContent = `USD ${money(totals.total)}`;
    });
    if (lastCount !== -1 && totals.count !== lastCount && totals.count > 0) bumpFab();
    lastCount = totals.count;

    const ig = $('customer-ig') as HTMLInputElement | null;
    if (ig && ig.value !== state.customer.instagram) ig.value = state.customer.instagram;
    const notes = $('customer-notes') as HTMLTextAreaElement | null;
    if (notes && notes.value !== state.customer.notes) notes.value = state.customer.notes;
    document.querySelectorAll<HTMLInputElement>('.mode-radio').forEach((r) => {
      r.checked = r.value === state.mode;
    });
  };

  document.querySelectorAll<HTMLElement>('.cart-trigger').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      open();
    });
  });
  $('cart-close')?.addEventListener('click', close);
  $('cart-backdrop')?.addEventListener('click', close);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
  $('cart-clear')?.addEventListener('click', () => {
    store.state = emptyCart();
    persist();
  });
  $('cart-wa')?.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = buildWhatsAppUrl(SITE.whatsapp, buildMessage(store.state, promoActive()));
  });
  $('cart-sena')?.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = buildWhatsAppUrl(SITE.whatsapp, buildSenaMessage(store.state, promoActive()));
  });
  const ig = $('customer-ig') as HTMLInputElement | null;
  ig?.addEventListener('input', () => {
    store.state = updateCustomer(store.state, { instagram: ig.value });
    persist();
  });
  const notes = $('customer-notes') as HTMLTextAreaElement | null;
  notes?.addEventListener('input', () => {
    store.state = updateCustomer(store.state, { notes: notes.value });
    persist();
  });
  document.querySelectorAll<HTMLInputElement>('.mode-radio').forEach((r) => {
    r.addEventListener('change', () => {
      if (!r.checked) return;
      store.state = setMode(store.state, r.value as WhatsAppMode);
      persist();
    });
  });

  window.addEventListener(CART_EVENT, (e) => {
    store.state = (e as CustomEvent<CartState>).detail;
    render();
  });

  // Los presets de "Recomendados" piden abrir el carrito tras agregar.
  window.addEventListener('vfxbyflex:open-cart', () => open());

  render();
}