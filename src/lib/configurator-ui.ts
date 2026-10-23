import {
  CART_EVENT,
  type CartState,
  type CartLine,
  loadCart,
  saveCart,
  toggleLine,
  setDuration,
  setMood,
  setEntornos,
  setComponents,
  isSelected,
  lineKey,
} from './cart';
import {
  getGroup,
  getBundle,
  groupOfOption,
  isExtra,
  getCategory,
  type CategoryId,
  type CatalogOption,
} from '../data/catalog';
import { durationAdjustment, durationForUnit, formatDuration, lineUnit, money, promoOriginal } from './pricing';
import { promoActive } from './promo';
import { buildMessage, buildWhatsAppUrl } from './whatsapp';
import { SITE } from '../config/site';
import { DURATION } from '../config/order';

// Convierte lo que escribe el cliente ("3", "3:30", "3,5") a segundos.
export function parseDurationInput(raw: string): number | null {
  const value = raw.trim().toLowerCase().replace(/\s+/g, '');
  if (!value) return null;
  const clock = value.match(/^(\d{1,3}):([0-5]?\d)$/);
  if (clock) return Number(clock[1]) * 60 + Number(clock[2]);
  const decimal = value.match(/^(\d{1,3})[.,](\d{1,2})$/);
  if (decimal) {
    const minutes = Number(decimal[1]) + Number(decimal[2]) / Math.pow(10, decimal[2].length);
    return Math.round(minutes * 60);
  }
  const minutes = value.match(/^(\d{1,3})$/);
  if (minutes) return Number(minutes[1]) * 60;
  return null;
}

// Ajusta al rango y al paso del slider para que barra, texto y precios coincidan.
export function snapDuration(seconds: number): number {
  const stepped = Math.round(seconds / DURATION.stepSec) * DURATION.stepSec;
  return Math.min(DURATION.maxSec, Math.max(DURATION.minSec, stepped));
}

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

// Live price of an option row: package logic + per-product duration.
function optionPrice(
  state: CartState,
  catId: CategoryId,
  optionId: string,
  base: number,
  promo: boolean,
  durationAdj: number
): number {
  const active = promoActive();
  const line = state.lines.find((l) => l.categoryId === catId && l.optionId === optionId);
  const bundle = getBundle(catId, optionId);
  let unit: number;
  if (line && bundle) {
    unit = lineUnit(line, active);
  } else {
    unit = promo && !active ? promoOriginal(base) : base;
  }
  return Math.max(0, unit + durationForUnit(unit, durationAdj, isExtra(catId)));
}

function applyOptionPrices(state: CartState, active: boolean) {
  const durationAdj = durationAdjustment(state.durationSec);

  document.querySelectorAll<HTMLElement>('.option-now').forEach((el) => {
    const btn = el.closest<HTMLElement>('.option-btn');
    const catId = btn?.dataset.category as CategoryId | undefined;
    const optionId = btn?.dataset.option || '';
    if (!catId) return;
    const base = Number(el.dataset.price || 0);
    const promo = el.dataset.promo === '1';
    const shown = optionPrice(state, catId, optionId, base, promo, durationAdj);
    el.textContent = `USD ${money(shown)}`;
  });

  document.querySelectorAll<HTMLElement>('.option-old').forEach((el) => {
    const row = el.closest('.option-btn') as HTMLElement | null;
    const promoEl = row?.querySelector<HTMLElement>('.option-now');
    const promo = promoEl?.dataset.promo === '1';
    const catId = row?.dataset.category as CategoryId | undefined;
    const base = Number(promoEl?.dataset.price || 0);
    const oldUnit = promoOriginal(base);
    const dur = durationForUnit(oldUnit, durationAdj, !!catId && isExtra(catId));
    el.textContent = `USD ${money(oldUnit + dur)}`;
    el.style.display = promo && active ? '' : 'none';
  });
}

function renderBundles(state: CartState) {
  document.querySelectorAll<HTMLElement>('.bundle-panel').forEach((panel) => {
    const optionId = panel.dataset.bundlePanel || '';
    const catId = panel.closest<HTMLElement>('.cat-panel')?.dataset.panel as CategoryId | undefined;
    if (!catId) return;
    const line = state.lines.find((l) => l.categoryId === catId && l.optionId === optionId);
    panel.hidden = !line;
    panel.querySelectorAll<HTMLInputElement>('.bundle-check').forEach((chk) => {
      chk.checked = !!line?.components?.includes(chk.dataset.component || '');
    });
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
  const durInput = document.getElementById('duration-input') as HTMLInputElement | null;
  if (dur) dur.value = String(state.durationSec);
  if (val) val.textContent = formatDuration(state.durationSec);
  if (durInput && document.activeElement !== durInput) {
    durInput.value = formatDuration(state.durationSec);
  }

  document.querySelectorAll<HTMLButtonElement>('.mood-btn').forEach((b) => {
    const sel = b.dataset.mood === state.mood;
    b.setAttribute('aria-checked', sel ? 'true' : 'false');
    b.classList.toggle('bg-ink', sel);
    b.classList.toggle('text-paper', sel);
    b.classList.toggle('border-ink', sel);
  });

  document.querySelectorAll<HTMLElement>('.cat-panel').forEach((panel) => {
    const catId = panel.dataset.panel as CategoryId | undefined;
    const select = panel.querySelector<HTMLSelectElement>('.entornos-select');
    if (!catId || !select) return;
    const line = state.lines.find((l) => l.categoryId === catId);
    select.value = String(line?.entornos ?? Number(select.dataset.default || select.value));
  });

  renderBundles(state);
  applyOptionPrices(state, active);

  const wa = document.getElementById('wa-cta') as HTMLAnchorElement | null;
  if (wa) wa.href = buildWhatsAppUrl(SITE.whatsapp, buildMessage(state, active));
}

function lineFromOption(
  catId: CategoryId,
  groupId: string,
  option: CatalogOption,
  kind: 'single' | 'multi'
): CartLine {
  const bundle = getBundle(catId, option.id);
  return {
    key: lineKey(catId, groupId, option.id, kind),
    categoryId: catId,
    groupId,
    optionId: option.id,
    label: option.label,
    base: option.price,
    promo: option.promo === true,
    components: bundle ? bundle.map((c) => c.id) : undefined,
  };
}

// Recomendados cards: armá un pedido pre-armado de un golpe.
function applyPreset(state: CartState, preset: string): CartState {
  let next = state;
  if (preset === 'croma-full-4') {
    const cat = getCategory('croma');
    const opt = cat?.groups[0]?.options.find((o) => o.id === 'croma-video-full');
    const groupId = cat?.groups[0]?.id ?? 'croma-modalidad';
    if (opt) {
      next = toggleLine(next, lineFromOption('croma', groupId, opt, 'single'), true);
      const line = next.lines.find((l) => l.categoryId === 'croma');
      if (line) next = setEntornos(next, line.key, 4, cat?.entornos?.priceEach ?? 10);
    }
  } else if (preset === 'vfx-full-all') {
    const cat = getCategory('vfx');
    const opt = cat?.groups[0]?.options.find((o) => o.id === 'vfx-full');
    const groupId = cat?.groups[0]?.id ?? 'vfx-paquete';
    if (opt) next = toggleLine(next, lineFromOption('vfx', groupId, opt, 'single'), true);
  } else if (preset === 'visual-25d') {
    const cat = getCategory('visual');
    const opt = cat?.groups[0]?.options.find((o) => o.id === 'visual-25d-imagen');
    const groupId = cat?.groups[0]?.id ?? 'visual-tipo';
    if (opt) next = toggleLine(next, lineFromOption('visual', groupId, opt, 'single'), true);
  }
  return next;
}

// Carga y reproduce las previsualizaciones solo al acercarse a pantalla.
// Los videos arrancan con preload="none" y su poster, para no descargar
// decenas de archivos ni decodificar video fuera de vista.
function initPreviewVideos() {
  const videos = Array.from(
    document.querySelectorAll<HTMLVideoElement>('.preview-btn video, .preset-card video')
  );
  if (!videos.length) return;
  for (const v of videos) {
    v.muted = true;
    v.loop = true;
  }
  const load = (video: HTMLVideoElement) => {
    const src = video.dataset.src;
    if (src && !video.getAttribute('src')) video.src = src;
    void video.play().catch(() => {});
  };
  if (!('IntersectionObserver' in window)) {
    videos.forEach(load);
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const video = entry.target as HTMLVideoElement;
        if (entry.isIntersecting) load(video);
        else video.pause();
      }
    },
    { threshold: 0.15, rootMargin: '200px 0px' }
  );
  videos.forEach((v) => io.observe(v));
}

export function initConfigurator() {
  let state = loadCart();
  renderConfigurator(state);
  saveCart(state);
  emit(state);
  initPreviewVideos();

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
      const bundle = getBundle(catId, optionId);
      const line: CartLine = {
        key: lineKey(catId, groupId, optionId, group.kind),
        categoryId: catId,
        groupId,
        optionId,
        label: btn.dataset.label || '',
        base: Number(btn.dataset.price || 0),
        promo: btn.dataset.promo === '1',
        // Selecting a package pre-selects every component it includes.
        components: bundle ? bundle.map((c) => c.id) : undefined,
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

  // Deselect individual components of a package without leaving the package.
  document.querySelectorAll<HTMLInputElement>('.bundle-check').forEach((chk) => {
    chk.addEventListener('change', () => {
      const panel = chk.closest<HTMLElement>('.bundle-panel');
      const optionId = panel?.dataset.bundlePanel || '';
      const catId = panel?.closest<HTMLElement>('.cat-panel')?.dataset.panel as CategoryId | undefined;
      if (!catId) return;
      const bundle = getBundle(catId, optionId);
      if (!bundle) return;
      const groupId = groupOfOption(catId, optionId)?.id ?? '';
      const key = lineKey(catId, groupId, optionId, 'single');
      const line = state.lines.find((l) => l.key === key);
      if (!line) return;
      const selected = new Set(line.components ?? []);
      if (chk.checked) selected.add(chk.dataset.component || '');
      else selected.delete(chk.dataset.component || '');
      const next = bundle.filter((c) => selected.has(c.id)).map((c) => c.id);
      // Unchecking every component removes the package from the order.
      if (next.length === 0) {
        state = toggleLine(state, line, true);
      } else {
        state = setComponents(state, key, next);
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

  const durInput = document.getElementById('duration-input') as HTMLInputElement | null;
  if (durInput) {
    const commit = () => {
      const parsed = parseDurationInput(durInput.value);
      if (parsed === null) {
        durInput.value = formatDuration(state.durationSec);
        return;
      }
      state = setDuration(state, snapDuration(parsed));
      persist();
      durInput.value = formatDuration(state.durationSec);
    };
    durInput.addEventListener('change', commit);
    durInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        durInput.blur();
      } else if (e.key === 'Escape') {
        durInput.value = formatDuration(state.durationSec);
        durInput.blur();
      }
    });
    durInput.addEventListener('blur', () => {
      const parsed = parseDurationInput(durInput.value);
      if (parsed !== null && snapDuration(parsed) !== state.durationSec) commit();
      else durInput.value = formatDuration(state.durationSec);
    });
  }

  document.querySelectorAll<HTMLButtonElement>('.mood-btn').forEach((b) => {
    b.addEventListener('click', () => {
      state = setMood(state, b.dataset.mood || null);
      persist();
    });
  });

  const modal = document.getElementById('preview-modal');
  const title = document.getElementById('preview-title');
  const body = document.getElementById('preview-body');
  document.querySelectorAll<HTMLButtonElement>('.preview-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!modal || !title || !body) return;
      const raw = btn.dataset.preview || '';
      const src = raw ? encodeURI(raw) : '';
      const poster = btn.dataset.poster ? encodeURI(btn.dataset.poster) : '';
      const isVideo = btn.dataset.previewType === 'video' || /\.(webm|mp4)$/i.test(raw);
      title.textContent = btn.dataset.title || '';
      if (!src) {
        body.innerHTML = '<span class="text-muted text-sm">Sin previsualización disponible.</span>';
      } else if (isVideo) {
        body.innerHTML = `<video src="${src}"${poster ? ` poster="${poster}"` : ''} class="w-full h-full object-contain bg-ink" autoplay muted loop playsinline preload="auto" controls></video>`;
        void body.querySelector('video')?.play().catch(() => {});
      } else {
        body.innerHTML = `<img src="${src}" alt="" class="w-full h-full object-cover" />`;
      }
      modal.classList.remove('hidden');
    });
  });
  const closePreview = () => {
    modal?.classList.add('hidden');
    if (body) body.innerHTML = '';
  };
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

  // Recomendados: un clic arma el pedido y abre el carrito.
  document.querySelectorAll<HTMLButtonElement>('.preset-card').forEach((btn) => {
    btn.addEventListener('click', () => {
      const preset = btn.dataset.preset || '';
      if (!preset) return;
      state = applyPreset(state, preset);
      persist();
      window.dispatchEvent(new CustomEvent('vfxbyflex:open-cart'));
    });
  });
}
