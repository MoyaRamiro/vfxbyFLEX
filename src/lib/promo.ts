import { PROMO } from '../config/order';

function endOfToday(now: Date): number {
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return end.getTime();
}

export function promoActive(now: Date = new Date()): boolean {
  if (!PROMO.enabled) return false;
  if (PROMO.permanent) return true;
  return now.getTime() < PROMO.endsAt.getTime();
}

export function promoRemaining(now: Date = new Date()): number {
  const target = PROMO.permanent ? endOfToday(now) : PROMO.endsAt.getTime();
  return Math.max(0, target - now.getTime());
}

export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
}