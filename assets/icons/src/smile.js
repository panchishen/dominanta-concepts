/**
 * Smile: four upper front teeth hanging from a bar of gum, and a thin veneer
 * floating in front of each. The pointer picks a tooth; its veneer seats first
 * and the others follow, staggered outwards from it. The picked veneer is the
 * bright one. At rest the veneers hang off at uneven distances. The slider is
 * the stagger, in ms.
 *
 * The pattern: discrete items. Tweens, a stagger by distance, and a pick by
 * the teeth's own resting centres, which never move.
 */
const {
  Cam, fillet, fit, lerp, poly, proj, seg,
  tdone, tset, tval, tween, disposer, mk, pointer, register,
} = HL;

const ZT = 44, DEPTH = 5, WIDE = [19, 25, 25, 19], TALL = [35, 42, 42, 35], AWAY = [15, 10, 13, 17], GAP = 3, FIRST = 1;
const X0 = WIDE.map((_, i) => WIDE.slice(0, i).reduce((a, b) => a + b + GAP, 0)), END = X0[3] + WIDE[3];

const seen = (ex, ez) => ex * 0.5 - ez * 0.61 > 0;
/** An outline standing in the x-z plane, pushed from y0 to y1: far face, the sweep, the edges between, near face. */
function slab(P, raw, radii, y0, y1) {
  const pts = fillet(raw, radii), m = raw.length;
  const face = (y) => pts.map((p) => P(p[0], y, p[1]));
  const far = face(y0), near = face(y1);
  let sweep = "", sil = "", lo = "";
  for (let k = 1; k < 6; k++) sweep += poly(face(lerp(y0, y1, k / 6)));
  for (let j = 0; j < m; j++) {
    const a = raw[(j + m - 1) % m], p = raw[j], b = raw[(j + 1) % m];
    const n = seen(p[0] - a[0], p[1] - a[1]) + seen(b[0] - p[0], b[1] - p[1]), i = j * 5 + 2;
    if (n === 1) sil += seg(far[i], near[i]); else if (n === 2) lo += seg(far[i], near[i]);
  }
  return { far: poly(far), sweep, lo, sil, near: poly(near) };
}
const plate = (g) => ({
  far: mk("path", { class: "sil" }, g), sweep: mk("path", { class: "fo" }, g), lo: mk("path", { class: "nf lo" }, g),
  sil: mk("path", { class: "nf sil" }, g), near: mk("path", { class: "sil" }, g),
});
const lay = (el, s) => { for (const k in s) el[k].setAttribute("d", s[k]); };

/** Tooth i: narrower at the gum, rounder at the biting edge. */
const tooth = (i) => [[X0[i] + 2, ZT], [X0[i] + WIDE[i] - 2, ZT], [X0[i] + WIDE[i], ZT - TALL[i]], [X0[i], ZT - TALL[i]]];
/** Its veneer: the same outline, a little inside it. */
const shell = (i) => [[X0[i] + 3.5, ZT - 6], [X0[i] + WIDE[i] - 3.5, ZT - 6], [X0[i] + WIDE[i] - 1.5, ZT - TALL[i] + 1.5], [X0[i] + 1.5, ZT - TALL[i] + 1.5]];

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value, act = -1;

  const C = Cam(45, 0.5, 2.3);
  fit(C, [[-5, -8, ZT + 11], [END + 5, -8, ZT + 11], [-5, DEPTH + 20, 2], [END + 5, 8, 2], [END, DEPTH + 20, 2]], 200, 160);
  const P = proj(C);

  const g = mk("g", {}, svg);
  for (let i = 0; i < 4; i++) lay(plate(g), slab(P, tooth(i), [3, 3, 7, 7], -DEPTH, DEPTH));
  lay(plate(g), slab(P, [[-5, ZT + 11], [END + 5, ZT + 11], [END + 5, ZT - 3], [-5, ZT - 3]], [6, 6, 6, 6], -8, 8));
  const shells = WIDE.map((_, i) => ({ el: plate(g), gap: tween(AWAY[i]), drawn: NaN }));

  function draw(i, gap) {
    const s = shells[i];
    if (gap === s.drawn) return;
    s.drawn = gap;
    lay(s.el, slab(P, shell(i), [2.5, 2.5, 5.5, 5.5], DEPTH + 0.6 + gap, DEPTH + 2.2 + gap));
  }
  const B = register(stage, (_dt, now) => {
    let moving = false;
    shells.forEach((s, i) => { draw(i, tval(s.gap, now)); if (!tdone(s.gap, now)) moving = true; });
    return moving;
  });
  bag.add(B.unregister);

  // the pick: the tooth whose resting centre is nearest the pointer across the screen
  const mid = WIDE.map((w, i) => P(X0[i] + w / 2, DEPTH, ZT - TALL[i] / 2)[0]);
  const hit = (x) => mid.reduce((best, m, i) => (Math.abs(m - x) < Math.abs(mid[best] - x) ? i : best), 0);

  /** Seats every veneer, spreading out from tooth a; -1 lets them all go, spreading from the last one picked. */
  function setActive(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : act;
    act = a;
    shells.forEach((s, i) => {
      tset(s.gap, a < 0 ? AWAY[i] : 0, now, Math.abs(i - from) * stag);
      s.el.near.classList.toggle("hi", i === (a < 0 ? FIRST : a));
    });
    read.textContent = a < 0 ? "rest" : "tooth " + (a + 1);
    B.wake();
  }
  shells[FIRST].el.near.classList.add("hi");

  bag.add(pointer(stage, { move: (p) => setActive(hit(p[0])), leave: () => setActive(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { stag = v; },
    destroy: bag.dispose,
  };
}

hairline({
  name: "smile",
  means: "Four front teeth, a veneer floating before each: the one under the pointer seats first, the rest follow.",
  rules: [1, 2, 4, 8],
  range: [0, 110, 240],
  tour: [[150, 150], [215, 175], [265, 200], null],
  mount,
});
