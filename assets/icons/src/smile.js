/**
 * Smile: three teeth, each a crown on its two roots, and a thin veneer
 * floating in front of each. The pointer picks a tooth; its veneer seats first
 * and the others follow, staggered outwards from it. The picked veneer is the
 * bright one. At rest the veneers wait at uneven distances. The slider is the
 * stagger, in ms.
 *
 * The pattern: discrete items. Tweens, a stagger by distance, and a pick by
 * the teeth's own centres, which never move.
 */
const {
  Cam, circ, fit, hull, open, poly, proj, rrect, run, seg,
  tdone, tset, tval, tween, disposer, mk, pointer, register,
} = HL;

const R2 = Math.SQRT1_2, TALL = 27, ROOT = -24, FACE = 14.6, THIN = 1.6, FIRST = 1;
const SPOTS = [-34, 0, 34], AWAY = [22, 15, 26];
/** The molar of the set, a little smaller: [height, ring]. */
const CROWN = [[0, 17], [5, 20.4], [11, 22.5], [17, 23], [23, 22.4], [29, 21], [34, 19]].map(([z, w]) => {
  const h = w * 0.62;
  return { z: z * TALL / 34, ring: rrect(-h, -h, h, h, h * 0.62, 6) };
});
const top = rrect(-8.4, -8.4, 8.4, 8.4, 5, 6);
/** Two roots, side by side: each [ring under the neck, ring at its tip]. */
const ROOTS = [-1, 1].map((k) => [circ(6.3, 20).map((q) => [q.u + k * 5.6, q.v]), circ(3, 14).map((q) => [q.u + k * 8, q.v])]);
/** A veneer's outline on the crown's front face: the crown seen from the front, a little inside its edge. */
const SHELL = rrect(-13.2, 2, 13.2, TALL - 0.5, 9, 6);
/** The figure's own axes, as a world point: s runs across the screen, d comes towards the viewer, z is up. */
const at = (s, d, z) => [(s + d) * R2, (d - s) * R2, z];

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value, act = -1;

  const C = Cam(45, 0.5, 2.3);
  fit(C, [at(-52, FACE + 26, 3), at(52, FACE + 26, 3), at(-52, FACE, ROOT - 3), at(-52, -FACE, TALL + 3), at(52, -FACE, TALL + 3)], 200, 160);
  const P = proj(C), W = (s, d, z) => P(...at(s, d, z));

  const g = mk("g", {}, svg);
  for (const spot of SPOTS) {
    for (const [neck, tip] of ROOTS) mk("path", { class: "sil", d: poly(hull(neck.map((q) => W(spot + q[0], q[1], 1)).concat(tip.map((q) => W(spot + q[0], q[1], ROOT))))) }, g);
    mk("path", { class: "sil", d: poly(hull(CROWN.flatMap((c) => c.ring.map((q) => W(spot + q.u, q.v, c.z))))) }, g);
    mk("path", { class: "nf lo", d: open(run(top, (q) => q.nv >= -1e-6).map((q) => W(spot + q.u, q.v, TALL))) }, g);
    mk("path", { class: "nf lo", d: seg(W(spot - 4.5, 0, TALL), W(spot + 4.5, 0, TALL)) + seg(W(spot, -4.5, TALL), W(spot, 4.5, TALL)) }, g);
  }
  // the veneers are nearer than every tooth, so they are painted after them all
  const shells = AWAY.map((gap) => ({ back: mk("path", { class: "sil" }, g), face: mk("path", { class: "sil" }, g), gap: tween(gap), drawn: NaN }));

  /** Veneer i, a gap in front of its tooth: a thin plate, its back edge and its face. */
  function draw(i, gap) {
    const s = shells[i];
    if (gap === s.drawn) return;
    s.drawn = gap;
    const plate = (d) => SHELL.map((q) => W(SPOTS[i] + q.u, d, q.v));
    s.back.setAttribute("d", poly(hull(plate(FACE + 0.5 + gap).concat(plate(FACE + 0.5 + gap + THIN)))));
    s.face.setAttribute("d", poly(plate(FACE + 0.5 + gap + THIN)));
  }
  const B = register(stage, (_dt, now) => {
    let moving = false;
    shells.forEach((s, i) => { draw(i, tval(s.gap, now)); if (!tdone(s.gap, now)) moving = true; });
    return moving;
  });
  bag.add(B.unregister);

  // the pick: the tooth whose centre is nearest the pointer across the screen
  const mid = SPOTS.map((s) => W(s, 0, 13)[0]);
  const hit = (x) => mid.reduce((best, m, i) => (Math.abs(m - x) < Math.abs(mid[best] - x) ? i : best), 0);

  /** Seats every veneer, spreading out from tooth a; -1 lets them all go, spreading from the last one picked. */
  function setActive(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : act;
    act = a;
    shells.forEach((s, i) => {
      tset(s.gap, a < 0 ? AWAY[i] : 0, now, Math.abs(i - from) * stag);
      const lit = i === (a < 0 ? FIRST : a);
      s.back.classList.toggle("hi", lit); s.face.classList.toggle("hi", lit);
    });
    read.textContent = a < 0 ? "rest" : "tooth " + (a + 1);
    B.wake();
  }
  shells[FIRST].back.classList.add("hi"); shells[FIRST].face.classList.add("hi");

  bag.add(pointer(stage, { move: (p) => setActive(hit(p[0])), leave: () => setActive(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { stag = v; },
    destroy: bag.dispose,
  };
}

hairline({
  name: "smile",
  means: "Three teeth, a veneer floating before each: the one under the pointer seats first, and the rest follow.",
  rules: [1, 2, 4, 8],
  range: [0, 130, 280],
  tour: [[130, 150], [200, 150], [270, 150], null],
  mount,
});
