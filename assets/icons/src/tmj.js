/**
 * TMJ: a lower jaw. A horseshoe of gum with ten teeth along it, and at its two
 * back ends a post rising to a ball: the two joints, which stay where they are.
 * The jaw hangs from them and swings open as the pointer goes down, on a
 * spring. The two balls are the one bright mark. The slider is how far the jaw
 * can open, in degrees.
 *
 * The pattern: a continuous scrub. The pointer's height is read against the
 * jaw's closed pose, so the moving jaw cannot pull the answer away.
 */
const {
  Cam, circ, clamp, fit, hull, poly, proj, rad,
  spring, stepS, disposer, mk, place, pointer, register,
} = HL;

const R2 = Math.SQRT1_2, HALF = 34, BACK = -26, NOSE = 30, GUM = 9, DEEP = -10, JD = -32, JZ = 36, BALL = 6.5, REST = 3, TRAVEL = 80;
/** The figure's own axes, as a world point: s runs across the screen, d comes towards the viewer, z is up. */
const at = (s, d, z) => [(s + d) * R2, (d - s) * R2, z];
/** The horseshoe's centre line, from the right back end round the front to the left back end. */
const LINE = [[HALF, BACK], [HALF, -13]];
for (let a = 0; a <= 180; a += 15) LINE.push([HALF * Math.cos(rad(a)), NOSE * Math.sin(rad(a))]);
LINE.push([-HALF, -13], [-HALF, BACK]);
/** The teeth of one side, back to front: [s, d, radius]; the other side mirrors them. */
const SIDE = [[HALF, -17, 8.6], [33.2, 4, 8.2], [26.4, 19, 7.2], [15, 27, 6.2], [5.4, 29.8, 5.4]];
const TEETH = SIDE.flatMap(([s, d, r]) => [[s, d, r], [-s, d, r]]).sort((a, b) => a[1] - b[1]);
const BARREL = [[0, 0.8], [0.3, 1], [0.7, 1], [1, 0.8]];
const disc = (s, d, r) => circ(r, 20).map((q) => [s + q.u, d + q.v]);

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let max = value, drawn = NaN, over = null;

  const C = Cam(45, 0.5, 2.1);
  /** The jaw's own points, swung open by deg about the line through the two joints. */
  const swing = (deg, W) => {
    const sn = Math.sin(rad(deg)), cs = Math.cos(rad(deg));
    return (s, d, z) => W(s, JD + (d - JD) * cs + (z - JZ) * sn, JZ - (d - JD) * sn + (z - JZ) * cs);
  };
  const wide = swing(32, at);
  fit(C, [at(-HALF - BALL, JD, JZ + BALL), at(HALF + BALL, JD, JZ + BALL), wide(0, NOSE + GUM, DEEP), wide(-HALF - GUM, 0, DEEP), wide(HALF + GUM, 0, DEEP)], 200, 160);
  const P = proj(C), W = (s, d, z) => P(...at(s, d, z));

  const g = mk("g", {}, svg);
  // back to front: the two posts and their balls, the gum, then the teeth from the back of the mouth forward
  const posts = [HALF, -HALF].map((s) => ({ s, el: mk("path", { class: "sil" }, g) }));
  for (const p of posts) place(mk("ellipse", { rx: BALL * C.S, ry: BALL * C.S, class: "hi" }, g), W(p.s, JD, JZ));
  const order = LINE.slice(0, -1).map((_, i) => i).sort((a, b) => LINE[a][1] + LINE[a + 1][1] - LINE[b][1] - LINE[b + 1][1]);
  const edge = order.map(() => mk("path", { class: "sil" }, g)), fill = order.map(() => mk("path", { class: "fo" }, g));
  const teeth = TEETH.map(() => ({ sil: mk("path", { class: "sil" }, g), cr: mk("path", { class: "nf lo" }, g) }));

  /** A length of gum between two points of the centre line, r wide: the hull of its two ends, top and bottom. */
  const length = (T, i, r) => {
    const ends = disc(LINE[i][0], LINE[i][1], r).concat(disc(LINE[i + 1][0], LINE[i + 1][1], r));
    return poly(hull(ends.map((p) => T(p[0], p[1], DEEP)).concat(ends.map((p) => T(p[0], p[1], 0)))));
  };

  const as = spring(REST);
  function draw() {
    if (as.x === drawn) return;
    drawn = as.x;
    const T = swing(drawn, W);
    for (const p of posts) {
      const foot = disc(p.s, BACK, 8).map((q) => T(q[0], q[1], -2)), head = disc(p.s, JD, 5.5).map((q) => T(q[0], q[1], JZ - 3));
      p.el.setAttribute("d", poly(hull(foot.concat(head))));
    }
    // every length outlined, then every length filled a little inside its outline: the joins between them go, the outline stays
    order.forEach((i, k) => { edge[k].setAttribute("d", length(T, i, GUM)); fill[k].setAttribute("d", length(T, i, GUM - 0.8)); });
    TEETH.forEach(([s, d, r], k) => {
      const tall = r * 1.5;
      teeth[k].sil.setAttribute("d", poly(hull(BARREL.flatMap(([z, f]) => disc(s, d, r * f).map((q) => T(q[0], q[1], z * tall))))));
      // only the molars are wide enough to show the hollow of their biting surface
      teeth[k].cr.setAttribute("d", r < 7 ? "" : poly(disc(s, d, r * 0.45).map((q) => T(q[0], q[1], tall))));
    });
  }
  const B = register(stage, (dt) => {
    const moving = stepS(as, dt);
    draw();
    return moving;
  });
  bag.add(B.unregister);

  const bite = W(0, NOSE, 8)[1];
  function retarget() {
    as.t = over === null ? REST : clamp((over - bite + 30) / TRAVEL, 0, 1) * max;
    read.textContent = over === null ? "rest" : `open ${Math.round(as.t)}°`;
    B.wake();
  }

  bag.add(pointer(stage, {
    move: (p) => { over = p[1]; retarget(); },
    leave: () => { over = null; retarget(); },
  }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { max = v; if (over !== null) retarget(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "tmj",
  means: "A lower jaw hangs from its two joints and swings open as the pointer goes down; the joints are the bright mark.",
  rules: [1, 3, 4, 8],
  range: [14, 26, 32],
  tour: [[200, 150], [200, 250], [200, 195], null],
  mount,
});
