import type { CategoryId } from '../data/catalog';
import { DURATION, type WhatsAppMode } from '../config/order';

export const CART_EVENT = 'vfxbyflex:cart';
const STORAGE_KEY = 'vfxbyflex-cart';

export interface CartAddon {
  id: string;
  label: string;
  price: number;
}

export interface CartLine {
  key: string;
  categoryId: CategoryId;
  groupId: string;
  optionId: string;
  label: string;
  base: number;
  promo: boolean;
  entornos?: number;
  entornoPriceEach?: number;
  addons?: CartAddon[];
}

export interface CustomerInfo {
  instagram: string;
  notes: string;
}

export interface CartState {
  lines: CartLine[];
  customer: CustomerInfo;
  durationSec: number;
  mood: string | null;
  sena: boolean;
  mode: WhatsAppMode;
}

export function emptyCart(): CartState {
  return {
    lines: [],
    customer: { instagram: '', notes: '' },
    durationSec: DURATION.baseSec,
    mood: null,
    sena: true,
    mode: 'chat',
  };
}

export function lineKey(categoryId: CategoryId, groupId: string, optionId: string, kind: 'single' | 'multi'): string {
  return kind === 'single' ? `${categoryId}:${groupId}` : `${categoryId}:${optionId}`;
}

export function toggleLine(state: CartState, line: CartLine, single: boolean): CartState {
  const inGroup = state.lines.filter((l) => l.categoryId === line.categoryId && l.groupId === line.groupId);
  const existing = inGroup.find((l) => l.optionId === line.optionId);
  if (single) {
    const rest = state.lines.filter((l) => !(l.categoryId === line.categoryId && l.groupId === line.groupId));
    return { ...state, lines: existing ? rest : [...rest, line] };
  }
  const rest = state.lines.filter((l) => l.key !== line.key);
  return { ...state, lines: existing ? rest : [...rest, line] };
}

export interface LineRef {
  categoryId: CategoryId;
  groupId: string;
  optionId: string;
}

export function isSelected(state: CartState, ref: LineRef): boolean {
  return state.lines.some(
    (l) => l.categoryId === ref.categoryId && l.groupId === ref.groupId && l.optionId === ref.optionId
  );
}

export function selectedOptionInGroup(state: CartState, categoryId: CategoryId, groupId: string): string | null {
  return state.lines.find((l) => l.categoryId === categoryId && l.groupId === groupId)?.optionId ?? null;
}

export function removeLine(state: CartState, key: string): CartState {
  return { ...state, lines: state.lines.filter((l) => l.key !== key) };
}

export function setEntornos(state: CartState, key: string, entornos: number, entornoPriceEach?: number): CartState {
  return {
    ...state,
    lines: state.lines.map((l) =>
      l.key === key ? { ...l, entornos, entornoPriceEach: entornoPriceEach ?? l.entornoPriceEach } : l
    ),
  };
}

export function addonSelected(state: CartState, key: string, addonId: string): boolean {
  return state.lines.some((l) => l.key === key && (l.addons ?? []).some((a) => a.id === addonId));
}

export function toggleAddon(state: CartState, key: string, addon: CartAddon): CartState {
  return {
    ...state,
    lines: state.lines.map((l) => {
      if (l.key !== key) return l;
      const addons = l.addons ?? [];
      const has = addons.some((a) => a.id === addon.id);
      return { ...l, addons: has ? addons.filter((a) => a.id !== addon.id) : [...addons, addon] };
    }),
  };
}

export function setDuration(state: CartState, durationSec: number): CartState {
  const clamped = Math.min(DURATION.maxSec, Math.max(DURATION.minSec, durationSec));
  return { ...state, durationSec: clamped };
}

export function setMood(state: CartState, mood: string | null): CartState {
  return { ...state, mood: state.mood === mood ? null : mood };
}

export function setSena(state: CartState, sena: boolean): CartState {
  return { ...state, sena };
}

export function setMode(state: CartState, mode: WhatsAppMode): CartState {
  return { ...state, mode };
}

export function updateCustomer(state: CartState, patch: Partial<CustomerInfo>): CartState {
  return { ...state, customer: { ...state.customer, ...patch } };
}

export function saveCart(state: CartState): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function isLine(value: unknown): value is CartLine {
  if (typeof value !== 'object' || value === null) return false;
  const l = value as Record<string, unknown>;
  return typeof l.key === 'string' && typeof l.categoryId === 'string' && typeof l.base === 'number';
}

export function loadCart(): CartState {
  const base = emptyCart();
  if (typeof localStorage === 'undefined') return base;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<CartState>;
    if (!Array.isArray(parsed.lines) || typeof parsed.customer !== 'object' || parsed.customer === null) {
      return base;
    }
    const duration = typeof parsed.durationSec === 'number' ? parsed.durationSec : base.durationSec;
    return {
      lines: parsed.lines.filter(isLine),
      customer: {
        instagram: typeof parsed.customer.instagram === 'string' ? parsed.customer.instagram : '',
        notes: typeof parsed.customer.notes === 'string' ? parsed.customer.notes : '',
      },
      durationSec: Math.min(DURATION.maxSec, Math.max(DURATION.minSec, duration)),
      mood: typeof parsed.mood === 'string' ? parsed.mood : null,
      sena: parsed.sena === true,
      mode: parsed.mode === 'receipt' ? 'receipt' : 'chat',
    };
  } catch {
    return base;
  }
}

export function dispatchCartChange(state: CartState): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<CartState>(CART_EVENT, { detail: state }));
}