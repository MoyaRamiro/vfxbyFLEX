import {
  addItem,
  buildCromaItem,
  dispatchCartChange,
  itemKeyFor,
  loadCart,
  removeItem,
  saveCart,
  type CartState,
} from './cart';

function current(): CartState {
  return loadCart();
}

function commit(state: CartState): void {
  saveCart(state);
  dispatchCartChange(state);
}

function syncUI(state: CartState): void {
  document.querySelectorAll<HTMLElement>('.service-option[data-service]').forEach((btn) => {
    const service = btn.dataset.service!;
    const option = btn.dataset.option!;
    const inCart =
      service === 'extras'
        ? state.items.some((i) => i.key === option)
        : state.items.some((i) => i.key === itemKeyFor(service) && i.label === btn.dataset.label);
    btn.classList.toggle('border-ink', inCart);
    btn.classList.toggle('border-ink/20', !inCart);
    if (btn.hasAttribute('aria-pressed')) btn.setAttribute('aria-pressed', String(inCart));
    if (btn.getAttribute('role') === 'radio') btn.setAttribute('aria-checked', String(inCart));
  });

  document.querySelectorAll<HTMLElement>('.package-toggle').forEach((btn) => {
    const key = itemKeyFor(btn.dataset.service!);
    const active = state.items.some((i) => i.key === key);
    btn.setAttribute('aria-pressed', String(active));
    btn.textContent = active ? 'Agregado ✓' : 'Agregar';
    btn.classList.toggle('bg-ink', active);
    btn.classList.toggle('text-paper', active);
  });

  updateCromaPriceLabel();
}

function updateCromaPriceLabel(): void {
  const wrap = document.querySelector<HTMLElement>('[data-croma]');
  if (!wrap) return;
  const entornos = Number(wrap.querySelector<HTMLSelectElement>('.croma-entornos')!.value);
  const nivel = wrap.querySelector<HTMLButtonElement>('.croma-nivel[aria-checked="true"]')!.dataset.nivel as 'pro' | 'full';
  const item = buildCromaItem(entornos, nivel);
  const priceEl = wrap.querySelector<HTMLElement>('.croma-price')!;
  priceEl.textContent = `USD ${item.price}`;
}

function flyChip(from: HTMLElement): void {
  const target = document.getElementById('cart-button');
  if (!target) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  const chip = document.createElement('div');
  chip.className = 'fixed z-[70] bg-lime text-ink font-bold px-3 py-1 text-sm pointer-events-none';
  chip.textContent = from.textContent?.split('—')[0]?.trim() ?? '+';
  const r = from.getBoundingClientRect();
  chip.style.left = `${r.left}px`;
  chip.style.top = `${r.top}px`;
  document.body.appendChild(chip);
  chip.animate(
    [
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      {
        transform: `translate(${target.getBoundingClientRect().left - r.left}px, ${target.getBoundingClientRect().top - r.top}px) scale(0.4)`,
        opacity: 0.2,
      },
    ],
    { duration: 500, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }
  ).onfinish = () => chip.remove();
}

export function initConfigurator(): void {
  syncUI(current());

  document.querySelectorAll<HTMLElement>('.service-option[data-service]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const service = btn.dataset.service!;
      const label = btn.dataset.label!;
      const price = Number(btn.dataset.price);
      const option = btn.dataset.option!;
      const key = service === 'extras' ? option : itemKeyFor(service);
      const state = current();
      const existing = state.items.find((i) => i.key === key);
      const next =
        existing && existing.label === label
          ? removeItem(state, key)
          : addItem(state, { key, serviceId: service, label, price });
      commit(next);
    });
  });

  document.querySelectorAll<HTMLElement>('.package-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = itemKeyFor(btn.dataset.service!);
      const state = current();
      const exists = state.items.some((i) => i.key === key);
      const next = exists
        ? removeItem(state, key)
        : addItem(state, {
            key,
            serviceId: btn.dataset.service!,
            label: btn.dataset.label!,
            price: Number(btn.dataset.price),
          });
      commit(next);
    });
  });

  const cromaWrap = document.querySelector<HTMLElement>('[data-croma]');
  if (cromaWrap) {
    cromaWrap.querySelector<HTMLSelectElement>('.croma-entornos')!.addEventListener('change', updateCromaPriceLabel);
    cromaWrap.querySelectorAll<HTMLElement>('.croma-nivel').forEach((btn) => {
      btn.addEventListener('click', () => {
        cromaWrap.querySelectorAll('.croma-nivel').forEach((b) => {
          b.setAttribute('aria-checked', 'false');
          b.classList.add('border-ink/20');
          b.classList.remove('border-ink');
        });
        btn.setAttribute('aria-checked', 'true');
        btn.classList.remove('border-ink/20');
        btn.classList.add('border-ink');
        updateCromaPriceLabel();
      });
    });
    cromaWrap.querySelector<HTMLButtonElement>('.croma-add')!.addEventListener('click', (e) => {
      const entornos = Number(cromaWrap.querySelector<HTMLSelectElement>('.croma-entornos')!.value);
      const nivel = cromaWrap.querySelector<HTMLButtonElement>('.croma-nivel[aria-checked="true"]')!.dataset.nivel as 'pro' | 'full';
      commit(addItem(current(), buildCromaItem(entornos, nivel)));
      flyChip(e.currentTarget as HTMLElement);
    });
  }

  window.addEventListener('cart:change', ((e: CustomEvent<CartState>) => {
    syncUI(e.detail);
  }) as EventListener);
}
