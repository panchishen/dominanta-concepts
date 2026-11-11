/*
 * The embed runtime: mounts a figure into any element of a host page, without
 * an iframe. It is appended after the kernel and the figures by build-icons.mjs
 * and runs inside the bundle's closure, where HL and `figures` live.
 *
 * The stage keeps the kernel's 400 x 320 box, so the pointer maths is the
 * kernel's own; the wrapper only shows the square of it the figures are drawn in.
 */
var CROP = { x: 80, y: 40, size: 240, pad: 30 };
var STYLE = [
  ".service-icon{display:inline-block;position:relative;width:var(--service-icon-size,120px);aspect-ratio:1;overflow:hidden;vertical-align:top;line-height:0;-webkit-tap-highlight-color:transparent}",
  ".service-icon>[data-hairline]{position:absolute;left:-33.3333%;top:-16.6667%;width:166.6667%;aspect-ratio:5/4;" +
    "--hairline-plate:var(--service-icon-surface,#fff);--hairline-hi:var(--service-icon-accent,#00848A);--hairline-edge:currentColor;" +
    "--hairline-mid:color-mix(in srgb,currentColor 64%,var(--service-icon-surface,#fff));" +
    "--hairline-lo:color-mix(in srgb,currentColor 30%,var(--service-icon-surface,#fff));" +
    "--hairline-stroke:var(--service-icon-stroke,1.25)}",
  ".service-icon>[data-hairline] .hi{stroke-width:calc(var(--service-icon-stroke,1.25)*1.3)}",
  "@media (prefers-reduced-motion:reduce){.service-icon>[data-hairline]{pointer-events:none}}",
].join("");
var mounted = new WeakMap();
var styled = false;

function injectStyle() {
  if (styled) return;
  styled = true;
  var style = document.createElement("style");
  style.setAttribute("data-service-icons", "");
  style.textContent = STYLE;
  document.head.appendChild(style);
}

function prefersStill() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function resolveArea(el, trigger) {
  if (trigger && trigger.nodeType === 1) return trigger;
  var selector = trigger || el.getAttribute("data-service-icon-area");
  if (selector) return el.closest(selector);
  return el.closest("[data-service-icon-area]");
}

/* Lets a whole card drive the icon: the pointer's place in the card becomes a place in the figure. */
function bindArea(stage, area) {
  function send(type, x, y, source) {
    var box = stage.getBoundingClientRect();
    stage.dispatchEvent(new PointerEvent(type, {
      pointerType: source.pointerType || "mouse", pointerId: source.pointerId || 1, bubbles: type !== "pointerleave",
      clientX: box.left + (x / 400) * box.width, clientY: box.top + (y / 320) * box.height,
    }));
  }
  function onMove(event) {
    if (!event.isTrusted || stage.contains(event.target) || prefersStill()) return;
    var box = area.getBoundingClientRect(), span = CROP.size - CROP.pad * 2;
    var u = Math.min(1, Math.max(0, (event.clientX - box.left) / box.width));
    var v = Math.min(1, Math.max(0, (event.clientY - box.top) / box.height));
    send("pointermove", CROP.x + CROP.pad + u * span, CROP.y + CROP.pad + v * span, event);
  }
  function onLeave(event) {
    if (event.isTrusted) send("pointerleave", 0, 0, event);
  }
  area.addEventListener("pointermove", onMove);
  area.addEventListener("pointerdown", onMove);
  area.addEventListener("pointerleave", onLeave);
  return function () {
    area.removeEventListener("pointermove", onMove);
    area.removeEventListener("pointerdown", onMove);
    area.removeEventListener("pointerleave", onLeave);
  };
}

function unmount(el) {
  var entry = mounted.get(el);
  if (!entry) return;
  mounted.delete(el);
  entry.release();
  entry.handle.destroy();
  entry.stage.remove();
}

/**
 * mount(el, name, options): draws the icon `name` inside `el`.
 * options.trigger: an element, or a selector matched with el.closest(), whose whole
 * area drives the icon; by default the nearest ancestor with [data-service-icon-area].
 * options.label: text for screen readers; without it the icon is hidden from them.
 */
function mount(el, name, options) {
  var figure = figures[name];
  if (!figure) throw new Error("service-icons: there is no icon named " + name);
  options = options || {};
  HL.inject(document);
  injectStyle();
  unmount(el);

  el.classList.add("service-icon");
  var stage = document.createElement("span");
  stage.setAttribute("data-hairline", name);
  if (options.label) { stage.setAttribute("role", "img"); stage.setAttribute("aria-label", options.label); }
  else el.setAttribute("aria-hidden", "true");
  el.appendChild(stage);
  var svg = HL.mk("svg", { viewBox: "0 0 400 320", "aria-hidden": "true" }, stage);

  var area = resolveArea(el, options.trigger);
  /* Going from the icon to the rest of its card is not a leave. Added before the figure's own listeners, so it is heard first. */
  function guard(event) {
    if (area && event.isTrusted && event.relatedTarget && area.contains(event.relatedTarget)) event.stopImmediatePropagation();
  }
  stage.addEventListener("pointerleave", guard);

  var handle = figure.mount({ stage: stage, svg: svg, read: { textContent: "" } }, figure.range[1]);
  var release = area ? bindArea(stage, area) : function () {};
  mounted.set(el, { stage: stage, handle: handle, release: release });
  return { destroy: function () { unmount(el); } };
}

function mountAll(root) {
  var nodes = (root || document).querySelectorAll("[data-service-icon]");
  for (var i = 0; i < nodes.length; i++) {
    if (!mounted.has(nodes[i])) mount(nodes[i], nodes[i].getAttribute("data-service-icon"), { label: nodes[i].getAttribute("data-service-icon-label") });
  }
}

window.ServiceIcons = { mount: mount, mountAll: mountAll, unmount: unmount, names: Object.keys(figures) };
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { mountAll(); });
else mountAll();
