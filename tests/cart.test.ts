import { beforeEach, describe, expect, it } from 'vitest';
import {
  addItem,
  CART_EVENT,
  buildCromaItem,
  dispatchCartChange,
  emptyCart,
  itemKeyFor,
  loadCart,
  removeItem,
  saveCart,
  total,
  updateCustomer,
  type CartItem,
  type CartState,
} from '../src/lib/cart';

const visualizer: CartItem = {
  key: itemKeyFor('visualizer'),
  serviceId: 'visualizer',
  label: 'Visualizer Full',
  price: 30,
};
const reel1: CartItem = {
  key: itemKeyFor('reel-1'),
  serviceId: 'extras',
  label: '1 Reel',
  price: 10,
};
const reel2: CartItem = {
  key: itemKeyFor('reel-2'),
  serviceId: 'extras',
  label: '2 Reels',
  price: 17,
};
const portada: CartItem = {
  key: itemKeyFor('portada'),
  serviceId: 'extras',
  label: '1 Portada',
  price: 8,
};
const croma2pro: CartItem = {
  key: itemKeyFor('croma'),
  serviceId: 'croma',
  label: 'Croma (2 entornos, VFX Pro)',
  price: 35,
  meta: { entornos: 2, nivel: 'pro' },
};

function fakeLocalStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  };
}

describe('cart', () => {
  beforeEach(() => {
    (globalThis as { localStorage?: unknown }).localStorage = fakeLocalStorage();
  });

  it('single-select services replace the previous choice', () => {
    let state = emptyCart();
    state = addItem(state, visualizer);
    state = addItem(state, { ...visualizer, label: 'Lettering / Lyrics', price: 15 });
    expect(state.items).toHaveLength(1);
    expect(state.items[0].label).toBe('Lettering / Lyrics');
  });

  it('croma replaces itself and keeps meta', () => {
    let state = addItem(emptyCart(), croma2pro);
    state = addItem(state, {
      key: itemKeyFor('croma'),
      serviceId: 'croma',
      label: 'Croma (3 entornos, VFX Full)',
      price: 75,
      meta: { entornos: 3, nivel: 'full' },
    });
    expect(state.items).toHaveLength(1);
    expect(state.items[0].price).toBe(75);
  });

  it('reel-1 and reel-2 are mutually exclusive; portada coexists', () => {
    let state = addItem(emptyCart(), reel1);
    state = addItem(state, reel2);
    expect(state.items.map((i) => i.key)).toEqual([reel2.key]);
    state = addItem(state, portada);
    expect(state.items).toHaveLength(2);
  });

  it('packages accumulate additively', () => {
    let state = addItem(emptyCart(), {
      key: itemKeyFor('vfx-basico'),
      serviceId: 'vfx-basico',
      label: 'VFX B\u00e1sico',
      price: 20,
    });
    state = addItem(state, {
      key: itemKeyFor('montaje'),
      serviceId: 'montaje',
      label: 'Montaje',
      price: 15,
    });
    expect(state.items).toHaveLength(2);
    expect(total(state)).toBe(35);
  });

  it('removeItem deletes by key', () => {
    let state = addItem(addItem(emptyCart(), reel1), portada);
    state = removeItem(state, reel1.key);
    expect(state.items.map((i) => i.key)).toEqual([portada.key]);
  });

  it('updateCustomer patches customer fields only', () => {
    let state = updateCustomer(emptyCart(), { name: 'Juan', notes: 'todo oscuro' });
    expect(state.customer).toEqual({ name: 'Juan', instagram: '', notes: 'todo oscuro' });
  });

  it('save/load roundtrips through localStorage', () => {
    let state = addItem(emptyCart(), visualizer);
    state = updateCustomer(state, { name: 'Ana' });
    saveCart(state);
    expect(loadCart()).toEqual(state);
  });

  it('loadCart returns empty cart on corrupt data', () => {
    (globalThis as { localStorage: ReturnType<typeof fakeLocalStorage> }).localStorage.setItem(
      'vfxbyflex-cart',
      '{broken'
    );
    expect(loadCart()).toEqual(emptyCart());
  });

  it('dispatchCartChange emits cart:change with the state', () => {
    const seen: CartState[] = [];
    (globalThis as { window?: unknown }).window = new EventTarget();
    window.addEventListener(CART_EVENT, ((e: CustomEvent<CartState>) => {
      seen.push(e.detail);
    }) as EventListener);
    const state = addItem(emptyCart(), visualizer);
    dispatchCartChange(state);
    expect(seen).toEqual([state]);
  });
});







describe('buildCromaItem', () => {
  it('builds the default croma item', () => {
    const item = buildCromaItem(2, 'pro');
    expect(item.label).toBe('Croma (2 entornos, VFX Pro)');
    expect(item.price).toBe(35);
    expect(item.meta).toEqual({ entornos: 2, nivel: 'pro' });
  });
  it('prices VFX Full with extra environments', () => {
    const item = buildCromaItem(3, 'full');
    expect(item.label).toBe('Croma (3 entornos, VFX Full)');
    expect(item.price).toBe(75);
  });
});
