/**
 * Prosthetics: a jaw, a horseshoe of gum with its teeth, two of them missing
 * on one side; and above the gap a denture, two teeth on a small saddle.
 * Under the pointer the denture comes down into the gap; leaving lifts it out.
 * The denture is the one bright mark. The slider is how high it waits.
 *
 * The pattern: one discrete change on one tween. The hit is the stage itself,
 * so nothing that moves can drop the hover.
 */
const {
  Cam, circ, fit, hull, poly, proj, rad,
  tdone, tset, tval, tween, disposer, mk, pointer, register,
} = HL;

const R2 = Math.SQRT1_2, HALF = 34, BACK = -32, NOSE = 30, GUM = 9, DEEP = -10, SADDLE = 2.6;
/** The figure's own axes, as a world point: s runs across the screen, d comes towards the viewer, z is up. */
const at = (s, d, z) => [(s + d) * R2, (d - s) * R2, z];
/** The horseshoe's centre line, from the right back end round the front to the left back end. */
const LINE = [[HALF, BACK], [HALF, -16]];
for (let a = 0; a <= 180; a += 15) LINE.push([HALF * Math.cos(rad(a)), NOSE * Math.sin(rad(a))]);
LINE.push([-HALF, -16], [-HALF, BACK]);
/** The teeth of one side, back to front: [s, d, radius]; the other side mirrors them. The denture carries two of the right side. */
const SIDE = [[HALF, -25, 8.6], [HALF, -8, 8.4], [31.6, 8.5, 7.8], [24.6, 20.6, 7], [14.6, 27.4, 6.2], [5.2, 29.8, 5.4]];
const LOST = [2, 3];
const TEETH = SIDE.flatMap(([s, d, r], i) => [{ s, d, r, lost: LOST.includes(i) }, { s: -s, d, r, lost: false }]).sort((a, b) => a.d - b.d);
const BARREL = [[0, 0.8], [0.3, 1], [0.7, 1], [1, 0.8]];
const disc = (s, d, r) => circ(r, 20).map((q) => [s + q.u, d + q.v]);

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let lift = value, on = false, last = NaN;

  const C = Cam(45, 0.5, 2.4);
  fit(C, [at(-HALF - GUM, BACK, 12), at(HALF + GUM, BACK, 12), at(0, NOSE + GUM, DEEP), at(-HALF - GUM, 0, DEEP), at(HALF + GUM, 0, DEEP), at(30, 8, 50)], 200, 160);
  const P = proj(C), W = (s, d, z) => P(...at(s, d, z));

  /** A length of gum between two points, r wide, from z0 to z1: the hull of its two ends, top and bottom. */
  const length = (a, b, r, z0, z1) => {
    const ends = disc(a[0], a[1], r).concat(disc(b[0], b[1], r));
    return poly(hull(ends.map((p) => W(p[0], p[1], z0)).concat(ends.map((p) => W(p[0], p[1], z1)))));
  };
  const crown = (t, z) => poly(hull(BARREL.flatMap(([k, f]) => disc(t.s, t.d, t.r * f).map((q) => W(q[0], q[1], z + k * t.r * 1.5)))));
  /** The hollow of a biting surface: only the molars are wide enough to show it. */
  const cusp = (t, z) => (t.r < 7 ? "" : poly(disc(t.s, t.d, t.r * 0.45).map((q) => W(q[0], q[1], z + t.r * 1.5))));

  const g = mk("g", {}, svg);
  // every length of gum outlined, then every length filled a little inside its outline: the joins go, the outline stays
  const order = LINE.slice(0, -1).map((_, i) => i).sort((a, b) => LINE[a][1] + LINE[a + 1][1] - LINE[b][1] - LINE[b + 1][1]);
  for (const i of order) mk("path", { class: "sil", d: length(LINE[i], LINE[i + 1], GUM, DEEP, 0) }, g);
  for (const i of order) mk("path", { class: "fo", d: length(LINE[i], LINE[i + 1], GUM - 0.8, DEEP, 0) }, g);
  // the teeth from the back of the mouth forward; the denture takes its place among them, where its saddle goes first
  const lost = TEETH.filter((t) => t.lost), parts = [];
  let saddle = null;
  for (const t of TEETH) {
    if (!t.lost) {
      mk("path", { class: "sil", d: crown(t, 0) }, g);
      mk("path", { class: "nf lo", d: cusp(t, 0) }, g);
      continue;
    }
    mk("path", { class: "nf lo", d: poly(disc(t.s, t.d, t.r * 0.6).map((q) => W(q[0], q[1], 0))) }, g);
    if (!saddle) saddle = mk("path", { class: "sil hi" }, g);
    parts.push({ t, sil: mk("path", { class: "sil hi" }, g), cr: mk("path", { class: "nf lo" }, g) });
  }

  /** The denture with its saddle at height z above the gum. */
  function draw(z) {
    if (z === last) return;
    last = z;
    saddle.setAttribute("d", length([lost[0].s, lost[0].d], [lost[1].s, lost[1].d], 7.6, z, z + SADDLE));
    for (const p of parts) { p.sil.setAttribute("d", crown(p.t, z + SADDLE)); p.cr.setAttribute("d", cusp(p.t, z + SADDLE)); }
  }

  const tw = tween(lift);
  const B = register(stage, (_dt, now) => {
    draw(tval(tw, now));
    return !tdone(tw, now);
  });
  bag.add(B.unregister);

  function fitIn(want) {
    if (want === on) return;
    on = want;
    tset(tw, on ? 0 : lift, performance.now(), 0);
    read.textContent = on ? "fitted" : "rest";
    B.wake();
  }

  bag.add(pointer(stage, { move: () => fitIn(true), leave: () => fitIn(false) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { lift = v; if (!on) { tset(tw, lift, performance.now(), 0); B.wake(); } },
    destroy: bag.dispose,
  };
}

hairline({
  name: "prosthetics",
  means: "A jaw with two teeth missing, and a denture waiting above the gap: under the pointer it comes down into place.",
  rules: [1, 4, 5, 8],
  range: [16, 24, 30],
  tour: [[200, 140], [240, 190], null],
  mount,
});
