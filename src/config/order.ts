export const DURATION = {
  minSec: 60,
  maxSec: 210,
  stepSec: 10,
  baseSec: 120,
  blockSec: 30,
  blockPrice: 10,
  defaultSec: 120,
} as const;

export const PROMO = {
  enabled: true,
  // Si `permanent` es true, la promo queda activa SIEMPRE (cartel "solo por hoy" +
  // countdown hacia la medianoche del día, que se renueva solo). Para usar una
  // fecha fija de fin, poné `permanent: false` y una fecha real en `endsAt`.
  permanent: true,
  label: 'SOLO POR HOY',
  discount: 0.3,
  // Solo se usa cuando `permanent: false`.
  endsAt: new Date('2026-10-18T23:59:59-03:00'),
} as const;

export const SENA = {
  enabled: true,
  label: 'Seña',
  // La seña es un porcentaje del total del pedido (0.1 = 10%).
  rate: 0.1 as number | null,
} as const;

export interface MoodOption {
  id: string;
  label: string;
}

export const MOODS: MoodOption[] = [
  { id: 'meme', label: 'Meme/brainrot' },
  { id: 'trap', label: 'Trap/oscuro/pesado' },
  { id: 'alegre', label: 'Alegre/vibrante' },
  { id: 'conceptual', label: 'Conceptual/temática' },
];

export const AUDIO_NOTE = 'Master en WAV, en lo posible.';

export const WHATSAPP_MODES = {
  chat: {
    id: 'chat',
    label: 'Mandar pedido y charlarlo por WhatsApp',
    intro: 'Mandé el pedido para charlarlo y definir detalles.',
    introKey: 'modeChatIntro',
  },
  receipt: {
    id: 'receipt',
    label: 'Enviar comprobante junto con el pedido',
    intro: 'Mandé el pedido + comprobante para seguir con el proceso.',
    introKey: 'modeReceiptIntro',
  },
} as const;

export type WhatsAppMode = keyof typeof WHATSAPP_MODES;