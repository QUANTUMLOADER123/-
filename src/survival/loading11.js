/** UI-only loading gallery and cooperative cancellation; no 3D imports or startup work. */
export function checkLoading11(signal) {
  if (signal?.aborted)
    throw new DOMException("Вход на остров отменён", "AbortError");
}
export function paintLoading11(signal) {
  checkLoading11(signal);
  return new Promise((resolve, reject) => {
    let a, b;
    const abort = () => {
      cancelAnimationFrame(a);
      cancelAnimationFrame(b);
      signal?.removeEventListener("abort", abort);
      reject(new DOMException("Вход на остров отменён", "AbortError"));
    };
    signal?.addEventListener("abort", abort, { once: true });
    a = requestAnimationFrame(() => {
      b = requestAnimationFrame(() => {
        signal?.removeEventListener("abort", abort);
        if (signal?.aborted) abort();
        else resolve();
      });
    });
  });
}
export const LOADING_ART11 = [
  ["night-patrol", "НОЧНОЙ ДОЗОР"],
  ["winter-convoy", "ЗИМНИЙ ПЕРЕВАЛ"],
  ["desert-crossroads", "РАЗВИЛКА НА РАССВЕТЕ"],
  ["industrial-rain", "ДОЖДЬ НА ТЭЦ"],
  ["offshore-storm", "ШТОРМ У ПЛАТФОРМЫ"],
  ["forest-shelter", "ЛЕСНОЕ УБЕЖИЩЕ"],
  ["lighthouse-dawn", "МАЯК НА РАССВЕТЕ"],
  ["bunker-embers", "ОГНИ У БУНКЕРА"],
];

const $ = (id) => document.getElementById(id);
const DWELL15 = 12000,
  FADE15 = 2600;
const reduced15 = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Two composited surfaces: the outgoing image remains fully opaque until the incoming one covers it. */
class ArtGallery15 {
  constructor({ root, a, b, title, button, active }) {
    this.root = $(root);
    this.layers = [$(a), $(b)];
    this.title = title ? $(title) : null;
    this.button = button ? $(button) : null;
    this.active = active;
    this.epoch = 0;
    this.running = false;
    this.busy = false;
    this.timer = null;
    this.controller = null;
    this.cache = new Map();
    this.finish = null;
  }
  alive(token = this.epoch) {
    return this.running && token === this.epoch && this.active();
  }
  image(index) {
    const file = LOADING_ART11[this.order[index]][0],
      url = `assets/ui11/${file}.jpg`;
    if (!this.cache.has(url)) {
      const image = new Image();
      image.decoding = "async";
      image.src = url;
      const entry = { image, decoded: null };
      const decoded = image
        .decode()
        .then(() => url)
        .catch((error) => {
          if (this.cache.get(url) === entry) this.cache.delete(url);
          throw error;
        });
      entry.decoded = decoded;
      this.cache.set(url, entry);
    }
    return this.cache.get(url).decoded;
  }
  preload() {
    const next = (this.index + 1) % this.order.length;
    const keep = new Set(
      [this.index, next].map(
        (i) => `assets/ui11/${LOADING_ART11[this.order[i]][0]}.jpg`,
      ),
    );
    for (const url of this.cache.keys())
      if (!keep.has(url)) this.cache.delete(url);
    this.image(next).catch(() => {});
  }
  visibility() {
    this.root.classList.toggle(
      "gallery-running15",
      this.running && !document.hidden,
    );
    clearTimeout(this.timer);
    if (!document.hidden && !this.busy) this.schedule();
  }
  label() {
    if (this.title)
      this.title.textContent =
        LOADING_ART11[this.order[this.index]][1] +
        " · " +
        (this.index + 1) +
        " / " +
        this.order.length;
  }
  schedule() {
    clearTimeout(this.timer);
    if (!this.alive() || document.hidden) return;
    this.timer = setTimeout(() => {
      if (document.hidden) {
        this.schedule();
        return;
      }
      void this.next();
    }, DWELL15);
  }
  start() {
    if (this.running) return;
    this.stop();
    this.running = true;
    this.controller = new AbortController();
    this.index = 0;
    this.side = 0;
    this.order = [0, ...LOADING_ART11.slice(1).map((_, i) => i + 1)];
    // Always begin with the corrected night image; shuffle only the other seven local illustrations.
    for (let i = this.order.length - 1; i > 1; i--) {
      const j = 1 + Math.floor(Math.random() * i);
      [this.order[i], this.order[j]] = [this.order[j], this.order[i]];
    }
    for (const layer of this.layers)
      layer.classList.remove("current15", "incoming15");
    this.layers[0].style.backgroundImage =
      'url("assets/ui11/night-patrol.jpg")';
    this.layers[0].classList.add("current15");
    this.root.classList.toggle("gallery-running15", !document.hidden);
    this.label();
    if (this.button) this.button.disabled = false;
    const token = this.epoch;
    // Warm only the current and next illustration, never the entire gallery or any 3D world.
    this.image(0).catch(() => {});
    this.preload();
    if (this.alive(token)) this.schedule();
  }
  stop() {
    this.epoch++;
    this.running = false;
    clearTimeout(this.timer);
    this.controller?.abort();
    this.finish?.();
    this.finish = null;
    this.busy = false;
    this.cache.clear();
    this.root.classList.remove("gallery-running15");
    for (const layer of this.layers) layer.classList.remove("incoming15");
    if (this.button) this.button.disabled = false;
  }
  async next() {
    if (this.busy || !this.alive()) return;
    if (document.hidden) {
      this.schedule();
      return;
    }
    this.busy = true;
    if (this.button) this.button.disabled = true;
    clearTimeout(this.timer);
    const token = this.epoch,
      next = (this.index + 1) % this.order.length,
      old = this.layers[this.side],
      fresh = this.layers[1 - this.side];
    try {
      const url = await this.image(next);
      if (!this.alive(token)) return;
      fresh.classList.remove("current15");
      fresh.style.backgroundImage = `url("${url}")`;
      fresh.classList.add("incoming15");
      // Commit an invisible decoded surface before enabling its opacity transition.
      await paintLoading11(this.controller.signal);
      if (!this.alive(token)) return;
      fresh.classList.add("current15");
      if (!reduced15())
        await new Promise((resolve) => {
          let timer;
          const finish = () => {
            clearTimeout(timer);
            fresh.removeEventListener("transitionend", ended);
            if (this.finish === finish) this.finish = null;
            resolve();
          };
          const ended = (event) => {
            if (event.target === fresh && event.propertyName === "opacity")
              finish();
          };
          this.finish = finish;
          fresh.addEventListener("transitionend", ended);
          timer = setTimeout(finish, FADE15 + 350);
        });
      if (!this.alive(token)) return;
      // Do not fade the outgoing surface: remove it only after the replacement is opaque.
      old.classList.remove("current15");
      old.style.backgroundImage = "";
      fresh.classList.remove("incoming15");
      this.side = 1 - this.side;
      this.index = next;
      this.label();
      this.preload();
    } catch {
      /* A failed decode or cancelled session keeps its existing local background. */
    } finally {
      if (token === this.epoch) {
        this.busy = false;
        if (this.button) this.button.disabled = false;
        this.schedule();
      }
    }
  }
}
let loadingGallery15, menuGallery15;
function loading15() {
  return (loadingGallery15 ??= new ArtGallery15({
    root: "loading-gallery15",
    a: "loading-art-a11",
    b: "loading-art-b11",
    title: "loading-art-title11",
    button: "loading-next-art11",
    active: () => !$("loading").hidden,
  }));
}
function menu15() {
  return (menuGallery15 ??= new ArtGallery15({
    root: "menu-gallery15",
    a: "menu-art-a15",
    b: "menu-art-b15",
    active: () => !$("front").hidden && !$("front-news10").hidden,
  }));
}
export function startGallery11() {
  stopMenuGallery15();
  loading15().start();
}
export function stopGallery11() {
  loadingGallery15?.stop();
}
export function nextGallery11() {
  return loading15().next();
}
export function startMenuGallery15() {
  if (!$("front").hidden && !$("front-news10").hidden) menu15().start();
}
export function stopMenuGallery15() {
  menuGallery15?.stop();
}

// Pause UI-only drift/timers in a background tab; do not interfere with gameplay's focus handling.
document.addEventListener("visibilitychange", () => {
  loadingGallery15?.visibility();
  menuGallery15?.visibility();
});
