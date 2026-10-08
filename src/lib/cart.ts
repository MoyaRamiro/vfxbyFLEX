import { cromaPrice } from '../data/services';

export const CART_EVENT = 'cart:change';
const STORAGE_KEY = 'vfxbyflex-cart';
const EXCLUSIVE_PAIRS = [
  ['reel-1', 'reel-2'],
];

export interface CartItem {
  key: string;
  serviceId: string;
  label: string;
  price: number;
  meta?: Record<string, string | number>;
}

export interface CustomerInfo {
  name: string;
  instagram: string;
  notes: string;
}

export interface CartState {
  items: CartItem[];
  customer: CustomerInfo;
}

export function itemKeyFor(id: string): string {
  return id;
}

export function emptyCart(): CartState {
  return { items: [], customer: { name: '', instagram: '', notes: '' } };
}

function isExclusive(a: string, b: string): boolean {
  return EXCLUSIVE_PAIRS.some((pair) => pair.includes(a) && pair.includes(b));
}

export function addItem(state: CartState, item: CartItem): CartState {
  const items = state.items
    .filter((i) => i.key !== item.key)
    .filter((i) => !(i.serviceId === item.serviceId && item.serviceId !== 'extras'))
    .filter((i) => !(i.serviceId === 'extras' && isExclusive(i.key, item.key)));
  return { ...state, items: [...items, item] };
}

export function removeItem(state: CartState, key: string): CartState {
  return { ...state, items: state.items.filter((i) => i.key !== key) };
}

export function updateCustomer(state: CartState, patch: Partial<CustomerInfo>): CartState {
  return { ...state, customer: { ...state.customer, ...patch } };
}

export function total(state: CartState): number {
  return state.items.reduce((sum, i) => sum + i.price, 0);
}

export function saveCart(state: CartState): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function loadCart(): CartState {
  if (typeof localStorage === 'undefined') return emptyCart();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyCart();
    const parsed = JSON.parse(raw) as CartState;
    if (!Array.isArray(parsed.items) || typeof parsed.customer !== 'object' || parsed.customer === null) {
      return emptyCart();
    }
    return parsed;
  } catch {
    return emptyCart();
  }
}

export function dispatchCartChange(state: CartState): void {
  window.dispatchEvent(new CustomEvent<CartState>(CART_EVENT, { detail: state }));
}

export function buildCromaItem(entornos: number, nivel: 'pro' | 'full'): CartItem {
  return {
    key: itemKeyFor('croma'),
    serviceId: 'croma',
    label: Croma ( entornos, VFX ),
    price: cromaPrice(entornos, nivel),
    meta: { entornos, nivel },
  };
}
