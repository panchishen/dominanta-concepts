/**
 * Braces: three molars, each a crown on its two roots, standing crooked: each
 * leans, sits too high or too low, and is pushed out of line. A bracket on
 * each and one wire through the brackets. The pointer picks a tooth; it comes
 * upright first and the others follow, staggered outwards from it, until the
 * wire runs straight. The wire is the one bright mark. The slider is the
 * stagger, in ms.
 *
 * The pattern: discrete items. Tweens, a stagger by distance, and a pick by
 * the teeth's straightened centres, which never move.
 */
const {
  Cam, circ, fillet, fit, hull, open, poly, proj, rad, rrect, run, seg,
  tdone, tset, tval, tween, disposer, mk, pointer, put, register, solid,
} = HL;

const R2 = Math.SQRT1_2, TALL = 27, ROOT = -24, PIVOT = 8, BAND = 13, FACE = 14.6;
const SPOTS = [-34, 0, 34], LEAN = [15, -13, 11], RISE = [4, -3, 5], PUSH = [4, -4, 3], ORDER = [1, 2, 0];
/** The molar of the set, a little smaller: [height, ring]. */
const CROWN = [[0, 17], [5, 20.4], [11, 22.5], [17, 23], [23, 22.4], [29, 21], [34, 19]].map(([z, w]) => {
  const h = w * 0.62;
  return { z: z * TALL / 34, ring: rrect(-h, -h, h, h, h * 0.62, 6) };
});
const top = rrect(-8.4, -8.4, 8.4, 8.4, 5, 6);
/** Two roots, side by side: each [ring under the neck, ring at its tip]. */
const ROOTS = [-1, 1].map((k) => [circ(6.3, 20).map((q) => [q.u + k * 5.6, q.v]), circ(3, 14).map((q) => [q.u + k * 8, q.v])]);
/** The figure's own axes, as a world point: s runs across the screen, d comes towards the viewer, z is up. */
const at = (s, d, z) => [(s + d) * R2, (d - s) * R2, z];

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value, act = -1;

  const C = Cam(45, 0.5, 2.2);
  fit(C, [at(-52, FACE, ROOT - 3), at(52, FACE, ROOT - 3), at(-52, -FACE, TALL + 6), at(52, -FACE, TALL + 6)], 200, 160);
  const P = proj(C), W = (s, d, z) => P(...at(s, d, z));

  const g = mk("g", {}, svg);
  // the tooth pushed furthest back is painted first
  const teeth = [];
  for (const i of ORDER) {
    teeth[i] = {
      roots: [mk("path", { class: "sil" }, g), mk("path", { class: "sil" }, g)], el: solid(g),
      groove: mk("path", { class: "nf lo" }, g), tag: mk("path", {}, g), k: tween(1), drawn: NaN, wire: [0, 0],
    };
  }
  const wire = mk("path", { class: "nf hi" }, g);

  /** Tooth i, k of the way from upright (0) to crooked (1): roots, crown, bracket, and where the wire crosses it. */
  function draw(i, k) {
    const t = teeth[i];
    if (k === t.drawn) return false;
    t.drawn = k;
    const sn = Math.sin(rad(LEAN[i] * k)), cs = Math.cos(rad(LEAN[i] * k));
    const T = (u, v, z) => W(SPOTS[i] + u * cs + (z - PIVOT) * sn, v + PUSH[i] * k, PIVOT + RISE[i] * k - u * sn + (z - PIVOT) * cs);
    ROOTS.forEach(([neck, tip], r) => t.roots[r].setAttribute("d", poly(hull(neck.map((q) => T(q[0], q[1], 1)).concat(tip.map((q) => T(q[0], q[1], ROOT)))))));
    put(t.el, {
      sil: poly(hull(CROWN.flatMap((c) => c.ring.map((q) => T(q.u, q.v, c.z))))),
      crease: open(run(top, (q) => q.nv >= -1e-6).map((q) => T(q.u, q.v, TALL))),
    });
    t.groove.setAttribute("d", seg(T(-4.5, 0, TALL), T(4.5, 0, TALL)) + seg(T(0, -4.5, TALL), T(0, 4.5, TALL)));
    t.tag.setAttribute("d", poly(fillet([T(-5, FACE, BAND + 4.5), T(5, FACE, BAND + 4.5), T(5, FACE, BAND - 4.5), T(-5, FACE, BAND - 4.5)], [2, 2, 2, 2])));
    t.wire = T(0, FACE + 0.6, BAND);
    return true;
  }
  function thread() {
    const a = teeth[0].wire, b = teeth[2].wire, reach = 14 * C.S;
    wire.setAttribute("d", open([[a[0] - reach, a[1]], ...teeth.map((t) => t.wire), [b[0] + reach, b[1]]]));
  }

  const B = register(stage, (_dt, now) => {
    let moving = false, changed = false;
    teeth.forEach((t, i) => { if (draw(i, tval(t.k, now))) changed = true; if (!tdone(t.k, now)) moving = true; });
    if (changed) thread();
    return moving;
  });
  bag.add(B.unregister);

  // the pick: the tooth whose straightened centre is nearest the pointer across the screen
  const mid = SPOTS.map((s) => W(s, 0, BAND)[0]);
  const hit = (x) => mid.reduce((best, m, i) => (Math.abs(m - x) < Math.abs(mid[best] - x) ? i : best), 0);

  /** Straightens every tooth, spreading out from tooth a; -1 lets them go back, spreading from the last one picked. */
  function setActive(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : act;
    act = a;
    teeth.forEach((t, i) => tset(t.k, a < 0 ? 1 : 0, now, Math.abs(i - from) * stag));
    read.textContent = a < 0 ? "rest" : "tooth " + (a + 1);
    B.wake();
  }

  bag.add(pointer(stage, { move: (p) => setActive(hit(p[0])), leave: () => setActive(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { stag = v; },
    destroy: bag.dispose,
  };
}

hairline({
  name: "braces",
  means: "Three crooked teeth on one wire: the tooth under the pointer comes upright first, and the rest follow.",
  rules: [1, 2, 5, 8],
  range: [0, 120, 260],
  tour: [[130, 150], [200, 150], [270, 150], null],
  mount,
});
